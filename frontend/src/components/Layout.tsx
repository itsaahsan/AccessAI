import { useState } from "react";
import { Accessibility, BookOpenCheck, ChartColumn, Clock3, GraduationCap, Home, LogOut, Menu, Settings2, Sparkles, X } from "lucide-react";
import type { View } from "../lib/types";
import { store, useAppState } from "../lib/store";
import { cn } from "../lib/cn";

const NAV: { id: View; label: string; icon: typeof Home }[] = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "understand", label: "Understand", icon: Sparkles },
  { id: "plan", label: "Study Plan", icon: GraduationCap },
  { id: "progress", label: "Progress", icon: ChartColumn },
  { id: "history", label: "History", icon: Clock3 },
  { id: "settings", label: "Settings", icon: Settings2 },
];

export default function Layout({
  view,
  go,
  children,
}: {
  view: View;
  go: (v: View) => void;
  children: React.ReactNode;
}) {
  const { profile, demoMode } = useAppState();
  const [open, setOpen] = useState(false);
  const [a11yOpen, setA11yOpen] = useState(false);

  const links = (
    <nav aria-label="Primary" className="flex flex-col gap-1">
      {NAV.map((n) => {
        const Icon = n.icon;
        const active = view === n.id;
        return (
          <button
            key={n.id}
            onClick={() => {
              go(n.id);
              setOpen(false);
            }}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active ? "bg-brand-50 text-brand-700" : "text-ink-600 hover:bg-slate-100",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {n.label}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 hover:bg-slate-100 md:hidden" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <button onClick={() => go(profile ? "dashboard" : "landing")} className="flex items-center gap-2" aria-label="AccessAI home">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
                <BookOpenCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-lg font-bold tracking-tight">AccessAI</span>
            </button>
            {demoMode && <span className="hidden rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 sm:inline">Demo data</span>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setA11yOpen(!a11yOpen)} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold hover:border-brand-500" aria-expanded={a11yOpen} aria-controls="a11y-panel">
              <Accessibility className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Accessibility</span>
            </button>
            {profile ? (
              <>
                <span className="hidden text-sm text-ink-500 md:inline" aria-label="Signed in user">{profile.name}</span>
                <button
                  onClick={() => {
                    store.reset();
                    go("landing");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-ink-500 hover:bg-slate-100"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
                </button>
              </>
            ) : (
              <button onClick={() => go("onboarding")} className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                Start Learning
              </button>
            )}
          </div>
        </div>
        {a11yOpen && <A11yPanel onClose={() => setA11yOpen(false)} />}
        {open && <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">{links}</div>}
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[240px_1fr]">
        <aside className="hidden md:block">
          <div className="sticky top-24">{links}</div>
        </aside>
        <main id="main" className="min-w-0 focus-zone rounded-2xl" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}

function A11yPanel({ onClose }: { onClose: () => void }) {
  const { a11y } = useAppState();
  const toggle = (k: keyof typeof a11y) => store.set({ a11y: { ...a11y, [k]: !a11y[k] } });
  const items: { key: keyof typeof a11y; title: string; desc: string }[] = [
    { key: "largeText", title: "Larger text", desc: "Increase base size and line spacing." },
    { key: "highReadability", title: "High readability", desc: "Narrower measure and extra letter spacing." },
    { key: "reducedComplexity", title: "Reduced visual complexity", desc: "Remove shadows and decorative backgrounds." },
    { key: "focusMode", title: "Focus mode", desc: "Dim secondary content, emphasize the main task." },
    { key: "reducedMotion", title: "Reduced motion", desc: "Disable shimmer and transitions." },
    { key: "simplifiedLanguage", title: "Simplified language", desc: "Prefer plain wording in local explanations." },
  ];
  return (
    <div id="a11y-panel" role="region" aria-label="Accessibility settings" className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-3 px-4 py-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((i) => (
          <label key={i.key} className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
            <input type="checkbox" checked={a11y[i.key]} onChange={() => toggle(i.key)} className="mt-1 h-4 w-4 accent-blue-600" />
            <span>
              <span className="block text-sm font-semibold">{i.title}</span>
              <span className="block text-xs text-ink-500">{i.desc}</span>
            </span>
          </label>
        ))}
        <div className="flex items-end justify-end">
          <button onClick={onClose} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold">Done</button>
        </div>
      </div>
    </div>
  );
}
