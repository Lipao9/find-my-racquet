import { z } from "zod";
import {
  questionsFor,
  QUIZ_MODES,
  type Question,
  type QuestionId,
  type QuizMode,
} from "./questions";

export type Answers = Partial<Record<QuestionId, string>>;

function schemaFor(q: Question) {
  let s: z.ZodType<string>;
  if (q.kind === "choice") {
    s = z.enum(q.options as [string, ...string[]]);
  } else {
    const max = q.kind === "longtext" ? 500 : 120;
    s = z.string().trim().max(max);
  }
  return q.optional ? s.optional() : s.and(z.string().min(1));
}

export function answersSchemaFor(mode: QuizMode): z.ZodType<Answers> {
  return z.object(
    Object.fromEntries(questionsFor(mode).map((q) => [q.id, schemaFor(q)])),
  ) as unknown as z.ZodType<Answers>;
}

export const quizModeSchema = z.enum(QUIZ_MODES as [QuizMode, ...QuizMode[]]);

export function encodeAnswers(answers: Answers, mode: QuizMode): string {
  const params = new URLSearchParams();
  params.set("mode", mode);
  for (const q of questionsFor(mode)) {
    const value = answers[q.id];
    if (value !== undefined && value.trim() !== "") {
      params.set(q.id, value.trim());
    }
  }
  return params.toString();
}

export function decodeAnswers(
  searchParams: Record<string, string | string[] | undefined>,
): { answers: Answers; mode: QuizMode } | null {
  const modeParsed = quizModeSchema.safeParse(searchParams.mode ?? "quick");
  if (!modeParsed.success) return null;
  const mode = modeParsed.data;

  const raw: Record<string, string> = {};
  for (const q of questionsFor(mode)) {
    const value = searchParams[q.id];
    if (typeof value === "string" && value !== "") {
      raw[q.id] = value;
    }
  }
  const parsed = answersSchemaFor(mode).safeParse(raw);
  return parsed.success ? { answers: parsed.data, mode } : null;
}
