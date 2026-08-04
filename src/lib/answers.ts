import { z } from "zod";
import { QUESTIONS, type QuestionId } from "./questions";

function schemaFor(id: QuestionId) {
  const q = QUESTIONS.find((q) => q.id === id)!;
  if (q.kind === "text") {
    const s = z.string().trim().max(120);
    return q.optional ? s.optional() : s;
  }
  const s = z.enum(q.options as [string, ...string[]]);
  return q.optional ? s.optional() : s;
}

export const answersSchema = z.object(
  Object.fromEntries(QUESTIONS.map((q) => [q.id, schemaFor(q.id)])),
) as unknown as z.ZodType<Answers>;

export type Answers = {
  [K in QuestionId]?: string;
} & {
  skill: string;
  frequency: string;
  style: string;
  powerControl: string;
  armInjury: string;
  budget: string;
  weightPref: string;
  headSizePref: string;
  stringPattern: string;
  courtType: string;
};

export function encodeAnswers(answers: Answers): string {
  const params = new URLSearchParams();
  for (const q of QUESTIONS) {
    const value = answers[q.id];
    if (value !== undefined && value !== "") {
      params.set(q.id, value);
    }
  }
  return params.toString();
}

export function decodeAnswers(
  searchParams: Record<string, string | string[] | undefined>,
): Answers | null {
  const raw: Record<string, string> = {};
  for (const q of QUESTIONS) {
    const value = searchParams[q.id];
    if (typeof value === "string" && value !== "") {
      raw[q.id] = value;
    }
  }
  const parsed = answersSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}
