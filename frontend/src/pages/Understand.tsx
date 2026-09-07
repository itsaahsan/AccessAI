import { useState } from "react";
import { BookOpenText, ListChecks, RotateCcw, Sparkles, Tags } from "lucide-react";
import { explainContent } from "../lib/ai";
import { store, useAppState } from "../lib/store";
import { SAMPLE_DIFFICULT_TEXT } from "../lib/demoData";
import type { UnderstandResult } from "../lib/types";
import { Badge, Card, EmptyState, PrimaryButton, SecondaryButton, Skeleton } from "../components/ui";

const VARIANTS = [
  { id: "simpler", label: "Simpler" },
  { id: "detailed", label: "More detailed" },
  { id: "example", label: "Example" },
  { id: "steps", label: "Step-by-step" },
  { id: "analogy", label: "Analogy" },
];

export default function Understand() {
  const { profile, lastUnderstand } = useAppState();
  const [input, setInput] = useState(lastUnderstand ? "" : SAMPLE_DIFFICULT_TEXT);
  const [result, setResult] = useState<UnderstandResult | null>(lastUnderstand);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);

  const run = async (variant = "default") => {
    if (!input.trim()) {
      setError("Paste some text, notes, or a question first.");
      return;
    }
    setLoading(true);
    setError("");
    setChecked(false);
    try {
      const r = await explainContent(input, profile?.skillLevel ?? "beginner", profile?.explanationStyle ?? "simple", variant);
      setResult(r);
      store.set({ lastUnderstand: r });
      store.pushHistory({
        type: "understand",
        title: `Simplified: ${input.slice(0, 48)}${input.length > 48 ? "…" : ""}`,
        detail: `${profile?.skillLevel ?? "beginner"} · ${profile?.explanationStyle ?? "simple"}${variant !== "default" ? ` · ${variant}` : ""}`,
        mode: r.mode,
      });
    } catch {
      setError("Something went wrong generating the explanation. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Understand</h1>
        <p className="mt-1 text-ink-600">Paste difficult content. AccessAI returns a clear explanation, key ideas, terms, an example, steps, and a quiz.</p>
      </div>

      <Card label="Input content" className="focus-zone">
        <label htmlFor="understand-input" className="text-sm font-semibold">Text, notes, questions, or instructions</label>
        <textarea
          id="understand-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={6}
          placeholder="Paste a complicated explanation here…"
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm leading-relaxed"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <PrimaryButton onClick={() => run()} disabled={loading}>
            <Sparkles className="h-4 w-4" aria-hidden="true" /> {loading ? "Making it clear…" : "Make It Clear"}
          </PrimaryButton>
          <SecondaryButton onClick={() => setInput(SAMPLE_DIFFICULT_TEXT)} disabled={loading}>Load sample text</SecondaryButton>
          {error && (
            <span className="flex items-center gap-2 text-sm">
              <span role="alert" className="font-medium text-red-700">{error}</span>
              <button onClick={() => run()} className="font-semibold text-brand-700 underline">Retry</button>
            </span>
          )}
        </div>
        {loading && (
          <div className="mt-4 space-y-2" role="status" aria-label="Loading explanation">
            <Skeleton className="h-5 w-2/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /><Skeleton className="h-24 w-full" />
          </div>
        )}
      </Card>

      {result && !loading && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={result.mode === "live" ? "live" : "demo"}>
              {result.mode === "live" ? `Live AI${result.model ? ` · ${result.model}` : ""}` : "Demo response — connect AI API for live answers"}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-ink-500"><RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Explain again:</span>
            {VARIANTS.map((v) => (
              <button key={v.id} onClick={() => run(v.id)} className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold hover:border-brand-500 hover:text-brand-700">
                {v.label}
              </button>
            ))}
          </div>

          <Card label="Simple explanation">
            <h2 className="flex items-center gap-2 font-semibold"><BookOpenText className="h-4 w-4 text-brand-600" aria-hidden="true" /> Simple explanation</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">{result.simpleExplanation}</p>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card label="Key ideas">
              <h2 className="flex items-center gap-2 font-semibold"><ListChecks className="h-4 w-4 text-brand-600" aria-hidden="true" /> Key ideas</h2>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink-600">
                {result.keyIdeas.map((k, i) => <li key={i}>{k}</li>)}
              </ul>
            </Card>
            <Card label="Important terms">
              <h2 className="flex items-center gap-2 font-semibold"><Tags className="h-4 w-4 text-brand-600" aria-hidden="true" /> Important terms</h2>
              <dl className="mt-2 space-y-2 text-sm">
                {result.terms.map((t) => (
                  <div key={t.term} className="rounded-lg bg-slate-50 p-2.5">
                    <dt className="font-semibold">{t.term}</dt>
                    <dd className="text-ink-600">{t.definition}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </div>

          <Card label="Example and action steps">
            <h2 className="font-semibold">Practical example</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">{result.example}</p>
            <h3 className="mt-4 font-semibold">Action steps</h3>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-ink-600">
              {result.actionSteps.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </Card>

          <Card label="Quick check quiz" className="focus-zone">
            <h2 className="font-semibold">Quick check — test your understanding</h2>
            <div className="mt-3 space-y-3">
              {result.quiz.map((q, i) => (
                <div key={i} className="rounded-xl border border-slate-200 p-3">
                  <label htmlFor={`quiz-${i}`} className="text-sm font-semibold">Q{i + 1}. {q.question}</label>
                  <input
                    id={`quiz-${i}`}
                    value={answers[i] ?? ""}
                    onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
                    placeholder="Type your answer…"
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                  {checked && <p className="mt-1.5 text-xs leading-relaxed text-ink-600"><span className="font-semibold">Reference answer: </span>{q.answer}</p>}
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              <PrimaryButton onClick={() => {
                setChecked(true);
                const answered = result.quiz.filter((_, i) => (answers[i] ?? "").trim().length > 0).length;
                store.recordQuiz(answered, result.quiz.length);
                store.pushHistory({ type: "quiz", title: `Quiz attempted (${answered}/${result.quiz.length} answered)`, detail: "Self-checked against reference answers", mode: result.mode });
              }}>Check answers</PrimaryButton>
            </div>
          </Card>
        </div>
      )}

      {!result && !loading && (
        <EmptyState title="No explanation yet" body="Paste content above and choose “Make It Clear”. Works offline with clearly labeled demo responses; connect VITE_API_URL + backend AI key for live answers." />
      )}
    </div>
  );
}
