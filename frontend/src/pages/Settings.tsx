import { useState } from "react";
import type { ExplanationStyle, SkillLevel } from "../lib/types";
import { applyA11y, store, useAppState } from "../lib/store";
import { Card, PrimaryButton, SecondaryButton } from "../components/ui";

export default function Settings() {
  const { profile, a11y } = useAppState();
  const [level, setLevel] = useState<SkillLevel>(profile?.skillLevel ?? "beginner");
  const [style, setStyle] = useState<ExplanationStyle>(profile?.explanationStyle ?? "simple");
  const [saved, setSaved] = useState("");

  if (!profile) {
    return (
      <Card label="Settings">
        <h1 className="text-xl font-bold">Settings</h1>
        <p className="mt-2 text-sm text-ink-600">Complete onboarding or load the demo to personalize preferences.</p>
        <div className="mt-4"><SecondaryButton onClick={() => store.loadDemo()}>Load demo profile</SecondaryButton></div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
      <Card label="Learning preferences">
        <h2 className="font-semibold">Learning preferences</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="set-level" className="text-sm font-semibold">Skill level</label>
            <select id="set-level" value={level} onChange={(e) => setLevel(e.target.value as SkillLevel)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label htmlFor="set-style" className="text-sm font-semibold">Explanation style</label>
            <select id="set-style" value={style} onChange={(e) => setStyle(e.target.value as ExplanationStyle)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm">
              <option value="simple">Simple</option>
              <option value="step-by-step">Step-by-step</option>
              <option value="example-based">Example-based</option>
              <option value="visual">Visual</option>
              <option value="technical">Technical</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={() => {
            store.set({ profile: { ...profile, skillLevel: level, explanationStyle: style } });
            setSaved("Preferences saved. Future explanations and plans will use them.");
          }}>Save preferences</PrimaryButton>
          {saved && <p role="status" className="mt-2 text-sm font-medium text-emerald-700">{saved}</p>}
        </div>
      </Card>
      <Card label="Accessibility">
        <h2 className="font-semibold">Accessibility</h2>
        <p className="mt-1 text-sm text-ink-600">Same controls as the header panel. Changes apply instantly and persist.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {(Object.keys(a11y) as (keyof typeof a11y)[]).map((k) => (
            <label key={k} className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm font-medium">
              <input
                type="checkbox"
                checked={a11y[k]}
                onChange={() => {
                  const next = { ...a11y, [k]: !a11y[k] };
                  store.set({ a11y: next });
                  applyA11y(next);
                }}
                className="h-4 w-4 accent-blue-600"
              />
              {k.replace(/([A-Z])/g, " $1")}
            </label>
          ))}
        </div>
      </Card>
      <Card label="Danger zone">
        <h2 className="font-semibold">Data</h2>
        <p className="mt-1 text-sm text-ink-600">Stored only in this browser (localStorage). No secrets are stored client-side.</p>
        <div className="mt-3"><SecondaryButton onClick={() => store.reset()}>Reset all local data</SecondaryButton></div>
      </Card>
    </div>
  );
}
