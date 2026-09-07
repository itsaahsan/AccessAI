import type { HistoryItem, StudyPlan, UnderstandResult, UserProfile } from "./types";

export const DEMO_PROFILE: UserProfile = {
  name: "Demo Learner",
  goal: "Learn Python fundamentals",
  experience: "Some school coding, new to Python",
  skillLevel: "beginner",
  explanationStyle: "example-based",
  struggle: "Functions and parameters feel abstract",
  streak: 4,
  lastActiveDate: new Date().toISOString(),
};

export const DEMO_PLAN: StudyPlan = {
  id: "demo-plan-python",
  goal: "Learn Python fundamentals",
  createdAt: new Date().toISOString(),
  milestones: [
    {
      id: "m1",
      title: "Python fundamentals",
      description: "Syntax, running code, and core data types.",
      tasks: [
        { id: "t1", title: "Variables", done: true, estimateMin: 20 },
        { id: "t2", title: "Data types", done: true, estimateMin: 25 },
        { id: "t3", title: "Conditions", done: true, estimateMin: 30 },
        { id: "t4", title: "Loops", done: false, estimateMin: 35 },
        { id: "t5", title: "Functions", done: false, estimateMin: 40 },
      ],
    },
    {
      id: "m2",
      title: "Practice & mini-projects",
      description: "Turn syntax into working programs.",
      tasks: [
        { id: "t6", title: "Function parameters drill", done: false, estimateMin: 25 },
        { id: "t7", title: "Build a grade calculator", done: false, estimateMin: 45 },
        { id: "t8", title: "Debug a broken script", done: false, estimateMin: 30 },
      ],
    },
  ],
};

export const DEMO_UNDERSTAND: UnderstandResult = {
  simpleExplanation:
    "A function is a named, reusable block of code. You give it inputs (parameters), it does work, and it can give back an output (return value). Instead of repeating instructions, you write them once and call the function whenever you need them.",
  keyIdeas: [
    "Functions package instructions under one name so code can be reused.",
    "Parameters are the inputs a function accepts; arguments are the actual values passed in.",
    "Return values send a result back to the caller.",
    "Calling a function runs its body from top to bottom.",
  ],
  terms: [
    { term: "Function", definition: "A reusable block of code that performs one job." },
    { term: "Parameter", definition: "A named input listed in the function definition." },
    { term: "Argument", definition: "The real value you pass when calling the function." },
    { term: "Return", definition: "The output a function sends back." },
  ],
  example:
    "Like a recipe card: 'make_pancakes(flour, eggs)' lists ingredients (parameters). When you cook, you supply real flour and eggs (arguments) and get pancakes back (return value).",
  actionSteps: [
    "Write one function with a single parameter and call it twice.",
    "Add a second parameter and predict the output before running it.",
    "Practice returning a value instead of only printing it.",
    "Explain parameters vs arguments aloud in one sentence.",
  ],
  quiz: [
    { question: "What is the difference between a parameter and an argument?", answer: "A parameter is the named input in the definition; an argument is the value passed at call time." },
    { question: "What does a return value do?", answer: "It sends a result back to the code that called the function." },
    { question: "Why define a function instead of repeating code?", answer: "Reuse, readability, and fewer mistakes when logic changes." },
  ],
  mode: "demo",
  model: "demo-fallback",
};

export const DEMO_HISTORY: HistoryItem[] = [
  { id: "h1", type: "understand", title: "Simplified: Python functions", detail: "Example-based explanation at beginner level", date: new Date().toISOString(), mode: "demo" },
  { id: "h2", type: "quiz", title: "Quiz: function parameters", detail: "3 questions generated", date: new Date().toISOString(), mode: "demo" },
  { id: "h3", type: "plan", title: "Study plan created", detail: "Learn Python fundamentals · 2 milestones", date: new Date().toISOString(), mode: "demo" },
  { id: "h4", type: "task", title: "Completed: Conditions", detail: "Milestone: Python fundamentals", date: new Date().toISOString(), mode: "demo" },
];

export const SAMPLE_DIFFICULT_TEXT = `A closure is a function object that retains access to variables from its enclosing lexical scope even after the outer function has finished executing. This enables stateful function factories and is commonly used for decorators, callbacks, and partial application.`;
