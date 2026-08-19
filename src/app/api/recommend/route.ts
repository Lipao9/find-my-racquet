import { NextResponse } from "next/server";
import { z } from "zod";
import { buyUrl, outboundRel } from "@/lib/affiliate";
import { answersSchemaFor, quizModeSchema, type Answers } from "@/lib/answers";
import { loadCatalog } from "@/lib/catalog";
import { InsufficientCandidatesError, prefilter } from "@/lib/prefilter";
import { recommend, RecommendationError } from "@/lib/recommend";

export const maxDuration = 30;

const baseSchema = z.object({
  mode: quizModeSchema.default("quick"),
  locale: z.enum(["pt-BR", "en"]),
});

export async function POST(req: Request) {
  let body: z.infer<typeof baseSchema> & { answers: Answers };
  try {
    const json = await req.json();
    const base = baseSchema.parse(json);
    const answers = answersSchemaFor(base.mode).parse(json.answers);
    body = { ...base, answers };
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
    // The outbound link is built here rather than in the card so the affiliate
    // configuration stays server-only and never reaches the client bundle.
    const rel = outboundRel();
    return NextResponse.json({
      recommendations: picks.map((p) => {
        const racket = byId.get(p.racketId)!;
        return {
          racket,
          justification: p.justification,
          buyUrl: buyUrl(racket),
          rel,
        };
      }),
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
