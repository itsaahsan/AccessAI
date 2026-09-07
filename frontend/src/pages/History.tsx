import { useAppState } from "../lib/store";
import { Badge, Card, EmptyState } from "../components/ui";

export default function History() {
  const { history } = useAppState();
  if (history.length === 0) {
    return <EmptyState title="No history yet" body="Your Understand runs, plans, quizzes, and completed tasks will appear here with timestamps and live/demo labels." />;
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">History</h1>
      <Card label="Interaction history">
        <ul className="divide-y divide-slate-100">
          {history.map((h) => (
            <li key={h.id} className="flex flex-wrap items-start justify-between gap-2 py-3">
              <div>
                <p className="text-sm font-semibold capitalize">{h.type} — {h.title}</p>
                <p className="text-xs text-ink-500">{h.detail} · {new Date(h.date).toLocaleString()}</p>
              </div>
              <Badge tone={h.mode === "demo" ? "demo" : "live"}>{h.mode === "demo" ? "Demo" : "Live"}</Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
