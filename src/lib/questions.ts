export type QuestionId =
  | "skill"
  | "frequency"
  | "style"
  | "powerControl"
  | "armInjury"
  | "budget"
  | "weightPref"
  | "headSizePref"
  | "gripSize"
  | "stringPattern"
  | "currentRacquet"
  | "courtType";

export interface QuestionOption {
  value: string;
}

export interface Question {
  id: QuestionId;
  kind: "choice" | "text";
  options: string[]; // stable machine values; empty for kind=text
  optional?: boolean;
}

// Labels live in messages/{locale}.json under quiz.questions.<id>.
// Option label key: quiz.questions.<id>.options.<value> ("-" replaced by "_").
export const QUESTIONS: Question[] = [
  {
    id: "skill",
    kind: "choice",
    options: ["beginner", "intermediate", "advanced", "competitive"],
  },
  {
    id: "frequency",
    kind: "choice",
    options: ["occasional", "weekly", "several-times", "daily"],
  },
  {
    id: "style",
    kind: "choice",
    options: ["baseline", "serve-volley", "all-court", "counterpuncher"],
  },
  {
    id: "powerControl",
    kind: "choice",
    options: ["power", "balanced", "control"],
  },
  {
    id: "armInjury",
    kind: "choice",
    options: ["none", "past", "current"],
  },
  {
    id: "budget",
    kind: "choice",
    options: ["under-150", "150-250", "over-250"],
  },
  {
    id: "weightPref",
    kind: "choice",
    options: ["light", "medium", "heavy", "no-preference"],
  },
  {
    id: "headSizePref",
    kind: "choice",
    options: ["midsize", "midplus", "oversize", "no-preference"],
  },
  {
    id: "gripSize",
    kind: "choice",
    options: ["1", "2", "3", "4", "5", "unknown"],
    optional: true,
  },
  {
    id: "stringPattern",
    kind: "choice",
    options: ["open", "dense", "no-preference"],
  },
  {
    id: "currentRacquet",
    kind: "text",
    options: [],
    optional: true,
  },
  {
    id: "courtType",
    kind: "choice",
    options: ["hard", "clay", "grass", "mixed"],
  },
];

export function optionLabelKey(questionId: QuestionId, value: string): string {
  return `questions.${questionId}.options.${value.replaceAll("-", "_")}`;
}
