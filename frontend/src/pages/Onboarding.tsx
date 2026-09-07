import { useState } from "react";
import type { ExplanationStyle, SkillLevel, View } from "../lib/types";
import { store } from "../lib/store";
import { Card, PrimaryButton } from "../components/ui";

const LEVELS: SkillLevel[] = ["beginner", "intermediate", "advanced"];
const STYLES: ExplanationStyle[] = ["simple", "step-by-step", "example-based", "visual", "technical"];

export default function Onboarding({ go }: { go: (v: View) => void }) {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("Learn Python fundamentals");
  const [experience, setExperience] = useState("");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("beginner");
  const [explanationStyle, setExplanationStyle] = useState<ExplanationStyle>("example-based");
  const [struggle, setStruggle] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) {
      setError("Please tell us what you are trying to accomplish.");
      return;
    }
    store.set({
      profile: {
        name: name.trim() || "Learner",
        goal: goal.trim(),
        experience: experience.trim(),
        skillLevel,
        explanationStyle,
        struggle: struggle.trim(),
        streak: 1,
        lastActiveDate: new Date().toISOString(),
      },
      demoMode: false,
    });
    store.pushHistory({ type: "plan", title: `Goal set: ${goal.trim()}`, detail: `${skillLevel} · ${explanationStyle}`, mode: "live" });
    go("dashboard");
  };

  return (
    <div className="mx-auto max-w-2xl pb-10">
      <h1 className="text-3xl font-bold tracking-tight">Let&apos;s personalize your workspace.</h1>
      <p className="mt-2 text-ink-600">Answer five quick questions. AccessAI adapts every explanation and plan to these choices.</p>
      <Card className="mt-6" label="Onboarding">
        <form onSubmit={submit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="ob-name" className="text-sm font-semibold">What should we call you?</label>
            <input id="ob-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Amara" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" autoComplete="name" />
          </div>
          <div>
            <label htmlFor="ob-goal" className="text-sm font-semibold">What are you trying to accomplish? *</label>
            <input id="ob-goal" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. Learn Python fundamentals" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" required />
          </div>
          <div>
            <label htmlFor="ob-exp" className="text-sm font-semibold">What is your experience level background?</label>
            <input id="ob-exp" value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="e.g. Some school coding, new to Python" className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" />
          </div>
          <fieldset>
            <legend className="text-sm font-semibold">Choose your level</legend>
            <div className="mt-2 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Skill level">
              {LEVELS.map((l) => (
                <label key={l} className={`cursor-pointer rounded-xl border px-3 py-2.5 text-center text-sm font-semibold capitalize ${skillLevel === l ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-300"}`}>
                  <input type="radio" name="level" value={l} checked={skillLevel === l} onChange={() => setSkillLevel(l)} className="sr-only" />
                  {l}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-sm font-semibold">Preferred explanation style</legend>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Explanation style">
              {STYLES.map((s) => (
                <label key={s} className={`cursor-pointer rounded-xl border px-3 py-2.5 text-center text-sm font-semibold capitalize ${explanationStyle === s ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-300"}`}>
                  <input type="radio" name="style" value={s} checked={explanationStyle === s} onChange={() => setExplanationStyle(s)} className="sr-only" />
                  {s}
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="ob-struggle" className="text-sm font-semibold">What are you struggling with?</label>
            <textarea id="ob-struggle" value={struggle} onChange={(e) => setStruggle(e.target.value)} placeholder="e.g. Functions and parameters feel abstract" rows={3} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" />
          </div>
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}
          <PrimaryButton type="submit" className="w-full">Generate my workspace</PrimaryButton>
        </form>
      </Card>
    </div>
  );
}
