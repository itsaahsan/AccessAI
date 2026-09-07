"""AccessAI backend — FastAPI + pluggable LLM with honest fallback mode.

Architecture: Frontend -> Backend API -> AI Service -> LLM provider.
No secrets in frontend. All LLM calls happen here, server-side.

Run:  uvicorn main:app --reload --port 8000   (from backend/)
Env:  copy .env.example to .env and set OPENAI_API_KEY (or OPENAI-compatible key).
"""

import os
import time
import uuid
from datetime import datetime
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
ALLOWED_ORIGINS = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",") if o.strip()]

app = FastAPI(title="AccessAI API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Schemas (validation) ----------

class UnderstandRequest(BaseModel):
    content: str = Field(min_length=1, max_length=8000)
    level: Literal["beginner", "intermediate", "advanced"] = "beginner"
    style: Literal["simple", "step-by-step", "example-based", "visual", "technical"] = "simple"
    variant: str = Field(default="default", max_length=40)


class PlanRequest(BaseModel):
    goal: str = Field(min_length=1, max_length=500)
    level: Literal["beginner", "intermediate", "advanced"] = "beginner"
    style: Literal["simple", "step-by-step", "example-based", "visual", "technical"] = "simple"


# ---------- AI service layer ----------

def _client():
    if not OPENAI_API_KEY:
        return None
    try:
        from openai import OpenAI
        return OpenAI(api_key=OPENAI_API_KEY, base_url=OPENAI_BASE_URL)
    except Exception:
        return None


def llm_complete(system: str, user: str, max_tokens: int = 1200) -> str | None:
    client = _client()
    if client is None:
        return None
    try:
        resp = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            temperature=0.7,
            max_tokens=max_tokens,
        )
        return (resp.choices[0].message.content or "").strip() or None
    except Exception as exc:
        print(f"[AccessAI] LLM error: {exc}")
        return None


def fallback_understand(content: str, level: str, style: str) -> dict:
    snippet = " ".join(content.split())[:400]
    return {
        "simpleExplanation": (
            f"Demo explanation ({level}, {style}): the core idea is restated in plain words. "
            f"Your text begins: “{snippet}…” Start by isolating one sentence, rewriting it as “This means…”, "
            "then repeat for the next two sentences."
        ),
        "keyIdeas": [
            "Identify the single main claim before details.",
            "Separate terms (vocabulary) from claims (ideas).",
            "Connect each new idea to something you already know.",
            f"Reviewed at {level} level with a {style} style.",
        ],
        "terms": [
            {"term": "Core claim", "definition": "The one sentence the text most wants you to believe or do."},
            {"term": "Supporting detail", "definition": "Evidence or steps that back up the core claim."},
        ],
        "example": "Like sorting mail: first read the address (main claim), then open only the letters addressed to you (relevant details).",
        "actionSteps": [
            "Highlight the 3 most important sentences.",
            "Rewrite each starting with “This means…”.",
            "Define any word you cannot explain simply.",
            "Teach the idea aloud for 60 seconds.",
        ],
        "quiz": [
            {"question": "What is the main idea in one sentence?", "answer": "Any accurate one-sentence restatement."},
            {"question": "Define one key term in your own words.", "answer": "A plain definition a peer would understand."},
            {"question": "Give one example or application.", "answer": "Any concrete, relevant example."},
        ],
        "mode": "demo",
        "model": "backend-fallback",
    }


def fallback_plan(goal: str, level: str) -> dict:
    now = datetime.utcnow().isoformat()
    pid = f"plan-{uuid.uuid4().hex[:8]}"
    def milestone(n: int, title: str, desc: str, tasks: list[str]) -> dict:
        return {
            "id": f"{pid}-m{n}",
            "title": title,
            "description": desc,
            "tasks": [{"id": f"{pid}-m{n}-t{i}", "title": t, "done": False, "estimateMin": 25} for i, t in enumerate(tasks)],
        }
    return {
        "id": pid,
        "goal": goal,
        "createdAt": now,
        "milestones": [
            milestone(1, "Foundations", f"Core vocabulary and big picture ({level}).",
                      [f"Map key terms in {goal}", "Summarize the big picture in 5 sentences", "Take notes on one beginner overview"]),
            milestone(2, "Guided practice", "Short daily reps with feedback.",
                      ["Do 3 focused practice tasks", "Take a 3-question self-quiz", "Fix one mistake in writing"]),
            milestone(3, "Apply & review", "Build something small and review.",
                      ["Complete one small applied task", "Review weak spots for 20 minutes", "Explain it in 5 lines to a friend"]),
        ],
    }


# ---------- Routes ----------

@app.get("/")
def root():
    return {"message": "AccessAI API is running", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "healthy", "llm_configured": bool(OPENAI_API_KEY), "model": OPENAI_MODEL, "time": time.time()}


@app.post("/api/understand")
def understand(req: UnderstandRequest):
    system = (
        "You are AccessAI, an adaptive accessibility assistant. Explain clearly for the given "
        "skill level and explanation style. Return JSON with keys: simpleExplanation (string), "
        "keyIdeas (4 strings), terms (array of {term, definition}, 3-4 items), example (string), "
        "actionSteps (4 strings), quiz (3 items of {question, answer}). No markdown fences."
    )
    variant_hint = {
        "simpler": "Make it even simpler with shorter sentences.",
        "detailed": "Add more depth and context.",
        "example": "Lead with a concrete example.",
        "steps": "Organize as numbered steps.",
        "analogy": "Use one extended analogy.",
        "default": "",
    }.get(req.variant, "")
    user = f"Level: {req.level}. Style: {req.style}. {variant_hint}\nContent:\n{req.content}"
    text = llm_complete(system, user)
    if text is None:
        return {"result": fallback_understand(req.content, req.level, req.style), "mode": "demo"}
    import json as _json
    try:
        cleaned = text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        parsed = _json.loads(cleaned)
        parsed["mode"] = "live"
        parsed["model"] = OPENAI_MODEL
        return {"result": parsed, "mode": "live"}
    except Exception:
        # Model returned non-JSON; wrap honestly as live text
        fb = fallback_understand(req.content, req.level, req.style)
        fb["simpleExplanation"] = text[:2000]
        fb["mode"] = "live"
        fb["model"] = OPENAI_MODEL
        return {"result": fb, "mode": "live"}


@app.post("/api/plan")
def make_plan(req: PlanRequest):
    system = (
        "You are AccessAI, a study planner. Return JSON: {goal, milestones: "
        "[{title, description, tasks: [{title, estimateMin}]}]} with 3 milestones, 3 tasks each. No markdown fences."
    )
    text = llm_complete(system, f"Goal: {req.goal}. Level: {req.level}. Style: {req.style}.")
    if text is None:
        return {"plan": fallback_plan(req.goal, req.level), "mode": "demo"}
    import json as _json
    try:
        cleaned = text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        parsed = _json.loads(cleaned)
        pid = f"plan-{uuid.uuid4().hex[:8]}"
        milestones = []
        for mi, m in enumerate(parsed.get("milestones", [])[:4]):
            tasks = []
            for ti, t in enumerate(m.get("tasks", [])[:5]):
                title = t.get("title") if isinstance(t, dict) else str(t)
                est = t.get("estimateMin", 25) if isinstance(t, dict) else 25
                tasks.append({"id": f"{pid}-m{mi}-t{ti}", "title": title, "done": False, "estimateMin": int(est) if str(est).isdigit() else 25})
            milestones.append({"id": f"{pid}-m{mi}", "title": m.get("title", f"Milestone {mi+1}"),
                                "description": m.get("description", ""), "tasks": tasks})
        return {"plan": {"id": pid, "goal": req.goal, "createdAt": datetime.utcnow().isoformat(), "milestones": milestones}, "mode": "live"}
    except Exception:
        raise HTTPException(status_code=502, detail="AI returned an unreadable plan. Please retry.")
