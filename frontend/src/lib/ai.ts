import type { ExplanationStyle, SkillLevel, StudyPlan, UnderstandResult } from "./types";
import { DEMO_UNDERSTAND } from "./demoData";

const API = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

async function post<T>(path: string, body: unknown, timeoutMs = 25000): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${API}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(t);
  }
}

function sentences(text: string, n: number): string[] {
  const parts = text.replace(/\s+/g, " ").split(/(?<=[.!?])\s+/).filter(Boolean);
  if (parts.length === 0) return ["No content provided."];
  while (parts.length < n) parts.push(parts[parts.length % Math.max(parts.length, 1)]);
  return parts.slice(0, n);
}

function extractTerms(text: string): { term: string; definition: string }[] {
  const words = Array.from(new Set((text.match(/[A-Za-z][A-Za-z-]{4,}/g) ?? []).slice(0, 40)));
  const scored = words
    .filter((w) => !["about", "after", "before", "between", "could", "should", "would", "their", "there", "which", "while", "these", "those", "using", "often", "every"].includes(w.toLowerCase()))
    .slice(0, 4);
  const fallback = ["concept", "process", "structure", "function"];
  const picks = (scored.length ? scored : fallback).slice(0, 4);
  return picks.map((term) => ({
    term: term[0].toUpperCase() + term.slice(1),
    definition: `Key word from your text. In this context it refers to the idea of “${term.toLowerCase()}” — try re-reading the sentence where it appears and replace it with this plain meaning.`,
  }));
}

/** Honest client-side fallback. Never claims to be a live model. */
export function localUnderstand(
  content: string,
  level: SkillLevel,
  style: ExplanationStyle,
  variant: string = "default",
): UnderstandResult {
  const clean = content.trim().slice(0, 2000) || "No content provided.";
  const [s1, s2, s3] = sentences(clean, 3);
  const levelNote =
    level === "beginner"
      ? "using everyday words and no assumed background"
      : level === "intermediate"
        ? "building on basic ideas you likely know"
        : "using precise terms while staying clear";
  const styleNote: Record<ExplanationStyle, string> = {
    simple: "Short sentences, one idea at a time.",
    "step-by-step": "Ordered steps you can follow in sequence.",
    "example-based": "A concrete analogy first, then the general idea.",
    visual: "Described as a simple diagram you could sketch.",
    technical: "Precise wording with the essential terms kept.",
  };
  const variantNote: Record<string, string> = {
    simpler: "Here is an even simpler pass with shorter sentences.",
    detailed: "Here is a more detailed pass with extra context.",
    example: "Here is another concrete example-first pass.",
    steps: "Here is the same idea reorganized as numbered steps.",
    analogy: "Here is the same idea explained through one extended analogy.",
    default: "",
  };
  return {
    simpleExplanation: `${variantNote[variant] ?? ""} In plain terms ${levelNote}: ${s1} ${styleNote[style]} The core move is to restate the idea in your own words, then connect it to something you already understand.`.trim(),
    keyIdeas: [
      `Main point: ${s1.slice(0, 140)}`,
      `Supporting detail: ${s2.slice(0, 140)}`,
      `Implication or use: ${s3.slice(0, 140)}`,
      `Adapted for ${level} level with a ${style} style.`,
    ],
    terms: extractTerms(clean),
    example:
      style === "example-based" || variant === "example" || variant === "analogy"
        ? "Think of it like labeled boxes on a shelf: each box (idea) has a clear label (term) and you only open one box at a time. Your text works the same way — isolate one labeled idea, understand it, then move to the next box."
        : "Take one sentence from your text, underline its subject and verb, then rewrite it starting with “This means…”. Repeat for the next two sentences and you have a working summary.",
    actionSteps: [
      "Highlight the 3 most important sentences in the text.",
      "Rewrite each one starting with “This means…” in your own words.",
      "List any word you cannot explain simply, then define it below.",
      "Teach the idea aloud in 60 seconds, then note where you hesitated.",
    ],
    quiz: [
      { question: "What is the single main idea in one sentence?", answer: "Any accurate one-sentence restatement of the first key sentence." },
      { question: "Define one key term from the text in your own words.", answer: "A plain-language definition that a peer would understand." },
      { question: "Give one example or application of the idea.", answer: "Any concrete, relevant example counts." },
    ],
    mode: "demo",
    model: "local-fallback",
  };
}

export function localPlan(goal: string, level: SkillLevel): StudyPlan {
  const g = goal.trim() || "My learning goal";
  const mk = (n: number, title: string, description: string, tasks: string[]): StudyPlan["milestones"][number] => ({
    id: `m${n}-${Date.now()}`,
    title,
    description,
    tasks: tasks.map((t, i) => ({ id: `t${n}-${i}-${Date.now()}`, title: t, done: false, estimateMin: 25 })),
  });
  return {
    id: `plan-${Date.now()}`,
    goal: g,
    createdAt: new Date().toISOString(),
    milestones: [
      mk(1, "Foundations", `Core vocabulary and big picture (${level}).`, [
        `Map the 10 most important terms in ${g}`,
        `Summarize the big picture in 5 sentences`,
        `Find one beginner-friendly overview and take notes`,
      ]),
      mk(2, "Guided practice", "Short daily reps with feedback.", [
        "Do 3 focused practice tasks",
        "Take a 3-question self-quiz",
        "Fix one mistake and write what changed",
      ]),
      mk(3, "Apply & review", "Build something small and review.", [
        "Complete one small applied task",
        "Review weak spots for 20 minutes",
        "Write a 5-line explanation for a friend",
      ]),
    ],
  };
}

export async function explainContent(
  content: string,
  level: SkillLevel,
  style: ExplanationStyle,
  variant = "default",
): Promise<UnderstandResult> {
  if (!API) return localUnderstand(content, level, style, variant);
  try {
    const data = await post<{ result: UnderstandResult; mode: "live" } | UnderstandResult>("/api/understand", {
      content,
      level,
      style,
      variant,
    });
    const result = "result" in data ? data.result : data;
    return { ...result, mode: "live" };
  } catch {
    // Backend unavailable or no key → honest fallback (or themed demo for the classic closure example)
    if (/closure/i.test(content) && content.length < 600) return { ...DEMO_UNDERSTAND };
    return localUnderstand(content, level, style, variant);
  }
}

export async function generatePlan(goal: string, level: SkillLevel, style: ExplanationStyle): Promise<{ plan: StudyPlan; mode: "live" | "demo" }> {
  if (!API) return { plan: localPlan(goal, level), mode: "demo" };
  try {
    const data = await post<{ plan: StudyPlan; mode: "live" }>("/api/plan", { goal, level, style });
    return { plan: data.plan, mode: "live" };
  } catch {
    return { plan: localPlan(goal, level), mode: "demo" };
  }
}
