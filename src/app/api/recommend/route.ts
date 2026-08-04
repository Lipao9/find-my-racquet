import { NextResponse } from "next/server";
import { z } from "zod";
import { answersSchema } from "@/lib/answers";
import { loadCatalog } from "@/lib/catalog";
import { InsufficientCandidatesError, prefilter } from "@/lib/prefilter";
import { recommend, RecommendationError } from "@/lib/recommend";

export const maxDuration = 30;

const requestSchema = z.object({
  answers: answersSchema,
  locale: z.enum(["pt-BR", "en"]),
});

export async function POST(req: Request) {
  let body: z.infer<typeof requestSchema>;
  try {
    body = requestSchema.parse(await req.json());
  } catch (error) {
    const details = error instanceof z.ZodError ? error.issues : undefined;
    return NextResponse.json(
      { error: "invalid_request", details },
      { status: 400 },
    );
  }

  let candidates;
  try {
    candidates = prefilter(body.answers, loadCatalog());
  } catch (error) {
    if (error instanceof InsufficientCandidatesError) {
      return NextResponse.json({ error: "no_candidates" }, { status: 422 });
    }
    throw error;
  }

  try {
    const picks = await recommend(candidates, body.answers, body.locale);
    const byId = new Map(candidates.map((r) => [r.id, r]));
    return NextResponse.json({
      recommendations: picks.map((p) => ({
        racket: byId.get(p.racketId)!,
        justification: p.justification,
      })),
    });
  } catch (error) {
    console.error("recommendation failed:", error);
    if (error instanceof RecommendationError || error instanceof Error) {
      return NextResponse.json(
        { error: "recommendation_failed" },
        { status: 502 },
      );
    }
    throw error;
  }
}
