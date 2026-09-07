import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { planProgress, useAppState } from "../lib/store";
import AiInsight from "../components/AiInsight";
import { Badge, Card, EmptyState } from "../components/ui";

const COLORS = ["#2f6bff", "#9db9ff", "#1d45ad", "#c7d7ff"];

export default function ProgressPage() {
  const { plans, activePlanId, quizScores, profile } = useAppState();
  const plan = plans.find((p) => p.id === activePlanId) ?? plans[0];

  if (!plan) {
    return <EmptyState title="No progress yet" body="Create a study plan or load the demo to see charts, streaks, difficult topics, and recommendations." />;
  }

  const pct = planProgress(plan);
  const tasks = plan.milestones.flatMap((m) => m.tasks.map((t) => ({ ...t, milestone: m.title })));
  const done = tasks.filter((t) => t.done);
  const todo = tasks.filter((t) => !t.done);
  const weakest = todo.slice(0, 3).map((t) => t.title);
  const strongest = done.slice(-3).map((t) => t.title);

  const pie = [
    { name: "Completed", value: done.length },
    { name: "Remaining", value: todo.length },
  ];
  const quizData = quizScores.length
    ? quizScores.map((q, i) => ({ name: q.date, pct: Math.round((q.score / Math.max(q.total, 1)) * 100), key: i }))
    : [{ name: "No quizzes", pct: 0, key: 0 }];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Progress & AI Insights</h1>
          <p className="mt-1 text-ink-600">Goals completed, concepts understood, streaks, difficult topics, and what to do next.</p>
        </div>
        <Badge tone="info">{profile?.skillLevel ?? "beginner"} · {profile?.explanationStyle ?? "simple"}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Goals active", String(plans.length)],
          ["Concepts completed", String(done.length)],
          ["Current streak", `${profile?.streak ?? 0} days`],
          ["Completion", `${pct}%`],
        ].map(([k, v]) => (
          <Card key={k} label={k}>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{k}</p>
            <p className="mt-1 text-2xl font-bold">{v}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card label="Completion chart">
          <h2 className="font-semibold">Completion</h2>
          <div className="h-56" role="img" aria-label={`Completion pie chart: ${done.length} completed, ${todo.length} remaining`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {pie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card label="Weekly quiz performance">
          <h2 className="font-semibold">Quiz performance</h2>
          <div className="h-56" role="img" aria-label="Bar chart of quiz scores">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quizData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis domain={[0, 100]} fontSize={12} />
                <Tooltip formatter={(v) => [`${v}%`, "Score"]} />
                <Bar dataKey="pct" fill="#2f6bff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card label="Strongest area">
          <h2 className="font-semibold text-emerald-700">Your strongest area</h2>
          <ul className="mt-2 list-disc pl-5 text-sm text-ink-600">
            {strongest.length ? strongest.map((s) => <li key={s}>{s}</li>) : <li>Complete a task to reveal strengths.</li>}
          </ul>
        </Card>
        <Card label="Needs more practice">
          <h2 className="font-semibold text-amber-700">Needs more practice</h2>
          <ul className="mt-2 list-disc pl-5 text-sm text-ink-600">
            {weakest.length ? weakest.map((s) => <li key={s}>{s}</li>) : <li>Nothing outstanding — nice work.</li>}
          </ul>
        </Card>
        <Card label="Recommended next step">
          <h2 className="font-semibold text-brand-700">Recommended next step</h2>
          <p className="mt-2 text-sm text-ink-600">
            {todo.length ? `Practice “${todo[0].title}” (${todo[0].milestone}).` : "Set a new goal to keep momentum."} You completed {done.length} task{done.length === 1 ? "" : "s"} so far, so the next step introduces the following concept gradually.
          </p>
        </Card>
      </div>

      <AiInsight />
    </div>
  );
}
