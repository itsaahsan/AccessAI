import { ArrowRight, CheckCircle2, PlayCircle } from "lucide-react";
import type { View } from "../lib/types";
import { store } from "../lib/store";
import { DEMO_PLAN } from "../lib/demoData";
import { planProgress } from "../lib/store";
import { Badge, Card, PrimaryButton, ProgressBar, SecondaryButton } from "../components/ui";

export default function Landing({ go }: { go: (v: View) => void }) {
  const pct = planProgress(DEMO_PLAN);
  return (
    <div className="space-y-12 pb-10">
      {/* Hero */}
      <section className="grid items-center gap-8 pt-6 lg:grid-cols-2" aria-labelledby="hero-title">
        <div>
          <Badge>Adaptive AI accessibility layer for learning</Badge>
          <h1 id="hero-title" className="mt-4 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">
            Turn complexity into opportunity.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-ink-600">
            AccessAI transforms difficult information into personalized explanations, achievable plans, and meaningful progress.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <PrimaryButton onClick={() => go("onboarding")}>
              Start Learning <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </PrimaryButton>
            <SecondaryButton onClick={() => go("dashboard")}>
              <PlayCircle className="h-4 w-4" aria-hidden="true" /> See How It Works
            </SecondaryButton>
          </div>
          <div className="mt-4">
            <button
              onClick={() => {
                store.loadDemo();
                go("dashboard");
              }}
              className="text-sm font-semibold text-brand-700 underline underline-offset-4 hover:text-brand-600"
            >
              Try Demo — no signup, realistic sample data
            </button>
          </div>
          <dl className="mt-6 grid max-w-md grid-cols-3 gap-4 text-center">
            {[
              ["6", "AI capabilities"],
              ["3 min", "judge demo flow"],
              ["WCAG-minded", "accessible UI"],
            ].map(([k, v]) => (
              <div key={v} className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                <dt className="text-lg font-bold">{k}</dt>
                <dd className="text-xs text-ink-500">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        {/* Product preview */}
        <Card label="Product preview (illustrative example)" className="dim-in-focus">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Good to see you.</p>
            <Badge tone="demo">Illustrative example</Badge>
          </div>
          <p className="mt-1 text-sm text-ink-600">Here&apos;s what you can accomplish today.</p>
          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Current goal</p>
            <p className="font-semibold">Learn Python fundamentals</p>
            <div className="mt-3"><ProgressBar value={pct} label="Progress" /></div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-white p-3"><p className="text-xs text-ink-500">Recommended action</p><p className="font-semibold">Practice function parameters</p></div>
              <div className="rounded-lg bg-white p-3"><p className="text-xs text-ink-500">Streak</p><p className="font-semibold">4 days</p></div>
            </div>
          </div>
          <div className="mt-3 rounded-xl border border-brand-100 bg-brand-50 p-3 text-sm">
            <span className="font-semibold">AI Insight: </span>
            You&apos;ve mastered the fundamentals. Your next recommended step is Functions.
          </div>
        </Card>
      </section>

      {/* Problem / solution */}
      <section className="grid gap-4 md:grid-cols-2" aria-label="Problem and solution">
        <Card label="The problem">
          <h2 className="text-xl font-bold">Information exists. Understanding doesn&apos;t always follow.</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink-600">
            {["Complicated explanations and long articles", "Difficult terminology with no plain definitions", "Overwhelming study material, unclear next step", "Generic chatbot answers that ignore level, style, and goal"].map((t) => (
              <li key={t} className="flex gap-2"><span aria-hidden="true">•</span>{t}</li>
            ))}
          </ul>
        </Card>
        <Card label="How AccessAI works">
          <h2 className="text-xl font-bold">From confusion → understanding → action → progress.</h2>
          <ol className="mt-3 space-y-2 text-sm text-ink-600">
            {["1. Tell AccessAI your goal, level, and preferred style.", "2. Paste difficult content into Understand.", "3. Get explanations, terms, examples, steps, and a quiz.", "4. Turn goals into milestones; complete tasks and watch insights adapt."].map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
        </Card>
      </section>

      {/* Capabilities */}
      <section aria-labelledby="capabilities">
        <h2 id="capabilities" className="text-2xl font-bold tracking-tight">Core AI capabilities</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Understand anything", "Simple explanations, key ideas, terms, examples, action steps, and quick checks — adapted to level and style."],
            ["Goal → plan", "Goals become milestones, tasks, estimates, and daily actions with visual progress."],
            ["Adaptive recommendations", "The engine explains WHY it recommends each step, using your history."],
            ["Accessibility-first", "Larger text, readability, focus mode, keyboard support, reduced motion."],
            ["Knowledge memory", "Goals, preferences, and progress persist — “Welcome back. You were working on functions.”"],
            ["Honest fallback", "If the AI API is unavailable: loading states, retry, and clearly labeled demo mode."],
          ].map(([t, d]) => (
            <Card key={t} label={t}>
              <h3 className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />{t}</h3>
              <p className="mt-2 text-sm text-ink-600">{d}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Impact */}
      <section aria-labelledby="impact">
        <Card label="Impact">
          <h2 id="impact" className="text-2xl font-bold tracking-tight">Built for real learners</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-600">
            AccessAI is designed for students facing dense material, self-learners entering technical fields,
            and anyone who needs a different explanation style. It empowers — it does not replace teachers.
            All sample metrics in this demo are labeled as illustrative examples.
          </p>
        </Card>
      </section>

      <section className="rounded-2xl bg-ink-900 p-8 text-center text-white" aria-label="Final call to action">
        <h2 className="text-2xl font-bold">AccessAI doesn&apos;t just answer questions. It helps people understand, act, and progress.</h2>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <PrimaryButton onClick={() => go("onboarding")}>Start Learning <ArrowRight className="h-4 w-4" aria-hidden="true" /></PrimaryButton>
          <button onClick={() => { store.loadDemo(); go("dashboard"); }} className="rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold hover:bg-white/10">Try Demo</button>
        </div>
      </section>
    </div>
  );
}
