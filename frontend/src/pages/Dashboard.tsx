import { Flame, ListChecks, Target } from "lucide-react";
import type { View } from "../lib/types";
import { nextRecommendedTask, planProgress, store, useAppState } from "../lib/store";
import AiInsight from "../components/AiInsight";
import { Badge, Card, EmptyState, PrimaryButton, ProgressBar, SecondaryButton } from "../components/ui";

export default function Dashboard({ go }: { go: (v: View) => void }) {
  const { profile, plans, activePlanId, history } = useAppState();
  const plan = plans.find((p) => p.id === activePlanId) ?? plans[0];
  const pct = planProgress(plan);
  const done = plan?.milestones.flatMap((m) => m.tasks).filter((t) => t.done).length ?? 0;
  const total = plan?.milestones.flatMap((m) => m.tasks).length ?? 0;

  if (!profile) {
    return (
      <EmptyState
        title="Welcome to AccessAI"
        body="Tell us your goal and level to generate a personalized workspace, or try the demo with realistic sample data."
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <PrimaryButton onClick={() => go("onboarding")}>Get started</PrimaryButton>
            <SecondaryButton onClick={() => { store.loadDemo(); }}>Try Demo</SecondaryButton>
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card label="Today overview" className="focus-zone">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Good to see you{profile.name !== "Learner" ? `, ${profile.name}` : ""}.</h1>
            <p className="mt-1 text-ink-600">Here&apos;s what you can accomplish today.</p>
          </div>
          {history.length > 0 && history[0].mode === "demo" ? <Badge tone="demo">Demo data</Badge> : null}
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500"><Target className="h-3.5 w-3.5" aria-hidden="true" /> Current goal</p>
            <p className="mt-1 font-semibold leading-snug">{plan?.goal ?? profile.goal}</p>
            <div className="mt-3"><ProgressBar value={pct} /></div>
            <p className="mt-1 text-xs text-ink-500" aria-live="polite">{pct}% · {done}/{total} tasks</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Today&apos;s recommended action</p>
            <p className="mt-1 font-semibold leading-snug">{nextRecommendedTask(plan)}</p>
            <button onClick={() => go("understand")} className="mt-2 text-sm font-semibold text-brand-700 underline underline-offset-4">Make it clear →</button>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500"><Flame className="h-3.5 w-3.5" aria-hidden="true" /> Learning streak</p>
            <p className="mt-1 text-2xl font-bold">{profile.streak} {profile.streak === 1 ? "day" : "days"}</p>
            <p className="text-xs text-ink-500">Level: {profile.skillLevel} · Style: {profile.explanationStyle}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500"><ListChecks className="h-3.5 w-3.5" aria-hidden="true" /> Completed tasks</p>
            <p className="mt-1 text-2xl font-bold">{done}</p>
            <button onClick={() => go("plan")} className="mt-1 text-sm font-semibold text-brand-700 underline underline-offset-4">Open study plan →</button>
          </div>
        </div>
      </Card>

      <AiInsight />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card label="Continue learning">
          <h2 className="font-semibold">Continue learning</h2>
          <p className="mt-1 text-sm text-ink-600">Welcome back. You were working on {plan?.goal ?? profile.goal}.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <PrimaryButton onClick={() => go("understand")}>Understand something new</PrimaryButton>
            <SecondaryButton onClick={() => go("plan")}>Open study plan</SecondaryButton>
          </div>
        </Card>
        <Card label="Recent activity" className="dim-in-focus">
          <h2 className="font-semibold">Recent activity</h2>
          {history.length === 0 ? (
            <p className="mt-2 text-sm text-ink-600">No activity yet. Paste content into Understand to begin.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {history.slice(0, 4).map((h) => (
                <li key={h.id} className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 p-2.5 text-sm">
                  <span><span className="font-semibold">{h.title}</span><span className="block text-xs text-ink-500">{h.detail}</span></span>
                  <Badge tone={h.mode === "demo" ? "demo" : "live"}>{h.mode === "demo" ? "Demo" : "Live"}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
