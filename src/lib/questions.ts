export type QuizMode = "quick" | "detailed";

export type QuestionId =
  | "skill"
  | "frequency"
  | "style"
  | "powerControl"
  | "armInjury"
  | "weightPref"
  | "headSizePref"
  | "gripSize"
  | "stringPattern"
  | "currentRacquet"
  | "courtType"
  | "swingSpeed"
  | "spinStyle"
  | "racquetFeel"
  | "strengths"
  | "improveGoals"
  | "physicalProfile"
  | "anythingElse";

export interface Question {
  id: QuestionId;
  kind: "choice" | "text" | "longtext";
  options: string[]; // stable machine values; empty for text/longtext
  optional?: boolean;
  modes: QuizMode[];
}

// Labels live in messages/{locale}.json under quiz.questions.<id>.
// Option label key: quiz.questions.<id>.options.<value> ("-" replaced by "_").
export const QUESTIONS: Question[] = [
  {
    id: "skill",
    kind: "choice",
    options: ["beginner", "intermediate", "advanced", "competitive"],
    modes: ["quick", "detailed"],
  },
  {
    id: "frequency",
    kind: "choice",
    options: ["occasional", "weekly", "several-times", "daily"],
    modes: ["quick", "detailed"],
  },
  {
    id: "style",
    kind: "choice",
    options: ["baseline", "serve-volley", "all-court", "counterpuncher"],
    modes: ["quick", "detailed"],
  },
  {
    id: "swingSpeed",
    kind: "choice",
    options: ["compact", "moderate", "fast", "very-fast"],
    modes: ["detailed"],
  },
  {
    id: "spinStyle",
    kind: "choice",
    options: ["heavy-topspin", "moderate-spin", "flat", "slice"],
    modes: ["detailed"],
  },
  {
    id: "powerControl",
    kind: "choice",
    options: ["power", "balanced", "control"],
    modes: ["quick", "detailed"],
  },
  {
    id: "armInjury",
    kind: "choice",
    options: ["none", "past", "current"],
    modes: ["quick", "detailed"],
  },
  {
    id: "weightPref",
    kind: "choice",
    options: ["light", "medium", "heavy", "no-preference"],
    modes: ["quick", "detailed"],
  },
  {
    id: "headSizePref",
    kind: "choice",
    options: ["midsize", "midplus", "oversize", "no-preference"],
    modes: ["quick", "detailed"],
  },
  {
    id: "gripSize",
    kind: "choice",
    options: ["1", "2", "3", "4", "5", "unknown"],
    optional: true,
    modes: ["quick", "detailed"],
  },
  {
    id: "stringPattern",
    kind: "choice",
    options: ["open", "dense", "no-preference"],
    modes: ["quick", "detailed"],
  },
  {
    id: "courtType",
    kind: "choice",
    options: ["hard", "clay", "grass", "mixed"],
    modes: ["quick", "detailed"],
  },
  {
    id: "currentRacquet",
    kind: "text",
    options: [],
    optional: true,
    modes: ["quick", "detailed"],
  },
  {
    id: "racquetFeel",
    kind: "longtext",
    options: [],
    optional: true,
    modes: ["detailed"],
  },
  {
    id: "strengths",
    kind: "longtext",
    options: [],
    modes: ["detailed"],
  },
  {
    id: "improveGoals",
    kind: "longtext",
    options: [],
    modes: ["detailed"],
  },
  {
    id: "physicalProfile",
    kind: "longtext",
    options: [],
    optional: true,
    modes: ["detailed"],
  },
  {
    id: "anythingElse",
    kind: "longtext",
    options: [],
    optional: true,
    modes: ["detailed"],
  },
];

export const QUIZ_MODES: QuizMode[] = ["quick", "detailed"];

export function questionsFor(mode: QuizMode): Question[] {
  return QUESTIONS.filter((q) => q.modes.includes(mode));
}

export function optionLabelKey(questionId: QuestionId, value: string): string {
  return `questions.${questionId}.options.${value.replaceAll("-", "_")}`;
}
