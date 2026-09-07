import { Lightbulb } from "lucide-react";
import { adaptiveInsight } from "../lib/store";
import { Card } from "./ui";

export default function AiInsight() {
  const insight = adaptiveInsight();
  return (
    <Card label="AI insight">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <Lightbulb className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">AI Insight</p>
          <h3 className="mt-1 font-semibold leading-snug">{insight.title}</h3>
          <p className="mt-1 text-sm text-ink-600">{insight.body}</p>
          <p className="mt-2 rounded-lg bg-slate-50 p-2.5 text-xs leading-relaxed text-ink-600">
            <span className="font-semibold">Why this recommendation: </span>
            {insight.why}
          </p>
        </div>
      </div>
    </Card>
  );
}
