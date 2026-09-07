export type SkillLevel = "beginner" | "intermediate" | "advanced";
export type ExplanationStyle = "simple" | "step-by-step" | "example-based" | "visual" | "technical";

export interface UserProfile {
  name: string;
  goal: string;
  experience: string;
  skillLevel: SkillLevel;
  explanationStyle: ExplanationStyle;
  struggle: string;
  streak: number;
  lastActiveDate: string | null;
}

export interface Task {
  id: string;
  title: string;
  done: boolean;
  estimateMin: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  tasks: Task[];
}

export interface StudyPlan {
  id: string;
  goal: string;
  createdAt: string;
  milestones: Milestone[];
}

export interface UnderstandResult {
  simpleExplanation: string;
  keyIdeas: string[];
  terms: { term: string; definition: string }[];
  example: string;
  actionSteps: string[];
  quiz: { question: string; answer: string }[];
  mode: "live" | "demo";
  model?: string;
}

export interface HistoryItem {
  id: string;
  type: "understand" | "plan" | "quiz" | "task";
  title: string;
  detail: string;
  date: string;
  mode: "live" | "demo";
}

export interface A11ySettings {
  largeText: boolean;
  highReadability: boolean;
  reducedComplexity: boolean;
  focusMode: boolean;
  reducedMotion: boolean;
  simplifiedLanguage: boolean;
}

export type View =
  | "landing"
  | "onboarding"
  | "dashboard"
  | "understand"
  | "plan"
  | "progress"
  | "history"
  | "settings";
