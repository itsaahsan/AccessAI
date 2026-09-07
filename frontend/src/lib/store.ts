import { useSyncExternalStore } from "react";
import type { A11ySettings, HistoryItem, StudyPlan, UnderstandResult, UserProfile } from "./types";
import { DEMO_HISTORY, DEMO_PLAN, DEMO_PROFILE } from "./demoData";

const LS_KEY = "accessai-state-v1";

interface PersistedState {
  profile: UserProfile | null;
  plans: StudyPlan[];
  activePlanId: string | null;
  lastUnderstand: UnderstandResult | null;
  history: HistoryItem[];
  a11y: A11ySettings;
  demoMode: boolean;
  quizScores: { date: string; score: number; total: number }[];
}

const DEFAULT_A11Y: A11ySettings = {
  largeText: false,
  highReadability: false,
  reducedComplexity: false,
  focusMode: false,
  reducedMotion: false,
  simplifiedLanguage: false,
};

const DEFAULT_STATE: PersistedState = {
  profile: null,
  plans: [],
  activePlanId: null,
  lastUnderstand: null,
  history: [],
  a11y: DEFAULT_A11Y,
  demoMode: false,
  quizScores: [],
};

function load(): PersistedState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return { ...DEFAULT_STATE, ...parsed, a11y: { ...DEFAULT_A11Y, ...(parsed.a11y ?? {}) } };
  } catch {
    return DEFAULT_STATE;
  }
}

let state: PersistedState = load();
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable */
  }
}

function set(partial: Partial<PersistedState>) {
  state = { ...state, ...partial };
  persist();
  applyA11y(state.a11y);
  listeners.forEach((l) => l());
}

export function applyA11y(a: A11ySettings) {
  const b = document.body;
  b.dataset.a11yLargeText = String(a.largeText);
  b.dataset.a11yHighReadability = String(a.highReadability);
  b.dataset.a11yReducedComplexity = String(a.reducedComplexity);
  b.dataset.a11yFocusMode = String(a.focusMode);
  b.dataset.a11yReducedMotion = String(a.reducedMotion);
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getState() {
  return state;
}

export function useAppState() {
  return useSyncExternalStore(subscribe, getState, getState);
}

export const store = {
  get: getState,
  set,
  reset() {
    localStorage.removeItem(LS_KEY);
    state = { ...DEFAULT_STATE };
    persist();
    applyA11y(state.a11y);
    listeners.forEach((l) => l());
  },
  loadDemo() {
    const today = new Date().toISOString().slice(0, 10);
    const lastActive = state.profile?.lastActiveDate?.slice(0, 10);
    let streak = DEMO_PROFILE.streak;
    if (state.profile && lastActive === today) streak = state.profile.streak;
    set({
      profile: { ...DEMO_PROFILE, streak },
      plans: [structuredClone(DEMO_PLAN)],
      activePlanId: DEMO_PLAN.id,
      history: [...DEMO_HISTORY],
      demoMode: true,
      quizScores: [
        { date: "Mon", score: 2, total: 3 },
        { date: "Tue", score: 3, total: 3 },
        { date: "Wed", score: 2, total: 4 },
        { date: "Thu", score: 4, total: 4 },
        { date: "Today", score: 3, total: 3 },
      ],
    });
  },
  toggleTask(planId: string, milestoneId: string, taskId: string) {
    const plans = state.plans.map((p) => {
      if (p.id !== planId) return p;
      return {
        ...p,
        milestones: p.milestones.map((m) => {
          if (m.id !== milestoneId) return m;
          return {
            ...m,
            tasks: m.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
          };
        }),
      };
    });
    const toggled = plans
      .find((p) => p.id === planId)
      ?.milestones.find((m) => m.id === milestoneId)
      ?.tasks.find((t) => t.id === taskId);
    const history = toggled
      ? [
          {
            id: `h-${Date.now()}`,
            type: "task" as const,
            title: `${toggled.done ? "Completed" : "Reopened"}: ${toggled.title}`,
            detail: `Plan: ${plans.find((p) => p.id === planId)?.goal ?? ""}`,
            date: new Date().toISOString(),
            mode: (state.demoMode ? "demo" : "live") as "demo" | "live",
          },
          ...state.history,
        ].slice(0, 50)
      : state.history;
    set({ plans, history });
  },
  pushHistory(item: Omit<HistoryItem, "id" | "date">) {
    set({
      history: [{ ...item, id: `h-${Date.now()}`, date: new Date().toISOString() }, ...state.history].slice(0, 50),
    });
  },
  recordQuiz(score: number, total: number) {
    set({ quizScores: [...state.quizScores, { date: "Now", score, total }].slice(-12) });
  },
};

export function planProgress(plan: StudyPlan | undefined): number {
  if (!plan) return 0;
  const tasks = plan.milestones.flatMap((m) => m.tasks);
  if (tasks.length === 0) return 0;
  return Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100);
}

export function nextRecommendedTask(plan: StudyPlan | undefined): string {
  if (!plan) return "Create your first study plan.";
  for (const m of plan.milestones) {
    const next = m.tasks.find((t) => !t.done);
    if (next) return `${next.title} (${m.title})`;
  }
  return "All tasks complete — review or set a new goal.";
}

export function adaptiveInsight(): { title: string; body: string; why: string } {
  const { profile, plans, activePlanId, quizScores, lastUnderstand } = state;
  const plan = plans.find((p) => p.id === activePlanId);
  const pct = planProgress(plan);
  const recent = quizScores.slice(-3);
  const avg = recent.length ? recent.reduce((a, b) => a + b.score / b.total, 0) / recent.length : null;

  if (!profile) {
    return {
      title: "Tell AccessAI how you learn",
      body: "Complete onboarding so explanations match your level and style.",
      why: "No learning profile stored yet, so recommendations are generic.",
    };
  }
  if (plan && pct >= 80) {
    return {
      title: `You've mastered the fundamentals — next: ${nextRecommendedTask(plan)}`,
      body: `You are at ${pct}%. Finish the last tasks, then raise difficulty one step.`,
      why: `You completed most tasks in “${plan.goal}”, so the engine suggests the next unfinished task instead of repeating mastered material.`,
    };
  }
  if (avg !== null && avg < 0.6) {
    const style = profile.explanationStyle === "example-based" ? "step-by-step" : "example-based";
    return {
      title: "Scores dipped — try a different explanation style",
      body: `Try a ${style} explanation for “${lastUnderstand ? "your last topic" : profile.goal}” before retrying the quiz.`,
      why: `Your last ${recent.length} quizzes averaged ${Math.round(avg * 100)}%, so the engine recommends switching style rather than repeating the same format.`,
    };
  }
  if (plan) {
    return {
      title: `Your next recommended step is ${nextRecommendedTask(plan)}`,
      body: `Continue “${plan.goal}” at ${profile.skillLevel} level with ${profile.explanationStyle} explanations.`,
      why: `Based on ${plan.milestones.flatMap((m) => m.tasks).filter((t) => t.done).length} completed tasks and your ${profile.explanationStyle} preference, the engine picks the earliest unfinished task.`,
    };
  }
  return {
    title: "Create a goal to unlock recommendations",
    body: "Turn a goal into milestones and the engine will guide each step.",
    why: "No active plan found, so there is nothing to sequence yet.",
  };
}
