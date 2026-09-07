import { useState } from "react";
import { Circle, CircleCheckBig, Plus } from "lucide-react";
import { generatePlan } from "../lib/ai";
import { planProgress, store, useAppState } from "../lib/store";
import AiInsight from "../components/AiInsight";
import { Badge, Card, EmptyState, PrimaryButton, ProgressBar } from "../components/ui";

export default function StudyPlanPage() {
  const { profile, plans, activePlanId } = useAppState();
  const plan = plans.find((p) => p.id === activePlanId) ?? plans[0];
  const [goal, setGoal] = useState(profile?.goal ?? "I want to learn Python");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"live" | "demo" | null>(null);

  const create = async () => {
    if (!goal.trim()) {
      setError("Enter a goal first, e.g. “I want to learn Python”.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { plan: p, mode: m } = await generatePlan(goal.trim(), profile?.skillLevel ?? "beginner", profile?.explanationStyle ?? "simple");
      store.set({ plans: [p, ...store.get().plans].slice(0, 10), activePlanId: p.id });
      store.pushHistory({ type: "plan", title: `Study plan created: ${p.goal}`, detail: `${p.milestones.length} milestones`, mode: m });
      setMode(m);
    } catch {
      setError("Could not generate a plan. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">AI Study Planner</h1>
        <p className="mt-1 text-ink-600">Turn a goal into milestones, tasks, estimates, and daily actions — then track completion.</p>
      </div>

      <Card label="Create a plan" className="focus-zone">
        <label htmlFor="goal-input" className="text-sm font-semibold">Your goal</label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input id="goal-input" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="I want to learn Python" className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm" />
          <PrimaryButton onClick={create} disabled={loading}><Plus className="h-4 w-4" aria-hidden="true" /> {loading ? "Planning…" : "Generate plan"}</PrimaryButton>
        </div>
        {error && <p role="alert" className="mt-2 text-sm font-medium text-red-700">{error} <button onClick={create} className="underline">Retry</button></p>}
        {mode && <p className="mt-2"><Badge tone={mode === "live" ? "live" : "demo"}>{mode === "live" ? "Live AI plan" : "Demo plan — connect AI API for live planning"}</Badge></p>}
      </Card>

      {!plan ? (
        <EmptyState title="No plan yet" body="Generate a plan above, or load the demo to see a realistic Python roadmap at 42%." action={<PrimaryButton onClick={() => store.loadDemo()}>Load demo plan</PrimaryButton>} />
      ) : (
        <>
          <Card label="Active plan progress">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold">{plan.goal}</h2>
              <Badge tone="info">{planProgress(plan)}% complete</Badge>
            </div>
            <div className="mt-3"><ProgressBar value={planProgress(plan)} label="Overall progress" /></div>
          </Card>
          {plan.milestones.map((m, mi) => {
            const done = m.tasks.filter((t) => t.done).length;
            return (
              <Card key={m.id} label={`Milestone ${mi + 1}: ${m.title}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Milestone {mi + 1}</p>
                    <h3 className="font-semibold">{m.title}</h3>
                    <p className="text-sm text-ink-600">{m.description}</p>
                  </div>
                  <Badge tone={done === m.tasks.length && m.tasks.length > 0 ? "live" : "muted"}>{done}/{m.tasks.length}</Badge>
                </div>
                <ul className="mt-3 space-y-2">
                  {m.tasks.map((t) => (
                    <li key={t.id}>
                      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-brand-500">
                        <input type="checkbox" checked={t.done} onChange={() => store.toggleTask(plan.id, m.id, t.id)} className="h-5 w-5 accent-blue-600" aria-label={`${t.title} (${t.estimateMin} minutes)`} />
                        {t.done ? <CircleCheckBig className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" /> : <Circle className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />}
                        <span className={`text-sm font-medium ${t.done ? "text-ink-500 line-through" : ""}`}>{t.title}</span>
                        <span className="ml-auto text-xs text-ink-500">~{t.estimateMin} min</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
          <AiInsight />
        </>
      )}
    </div>
  );
}
