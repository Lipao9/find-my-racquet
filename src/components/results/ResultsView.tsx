"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AdSlot } from "@/components/ads/AdSlot";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import type { Answers } from "@/lib/answers";
import type { Racket } from "@/lib/catalog";
import type { QuizMode } from "@/lib/questions";
import { RacketCard } from "./RacketCard";
import { ShareButton } from "./ShareButton";

interface Recommendation {
  racket: Racket;
  justification: string;
  /** Built server-side in /api/recommend so affiliate config stays off the client. */
  buyUrl: string;
  rel: string;
}

type State =
  | { status: "loading" }
  | { status: "error"; kind: "no_candidates" | "failed" }
  | { status: "success"; recommendations: Recommendation[] };

export function ResultsView({
  answers,
  mode,
}: {
  answers: Answers;
  mode: QuizMode;
}) {
  const t = useTranslations("results");
  const locale = useLocale();
  const [state, setState] = useState<State>({ status: "loading" });

  const fetchRecommendations = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, locale, mode }),
      });
      if (res.status === 422) {
        setState({ status: "error", kind: "no_candidates" });
        return;
      }
      if (!res.ok) {
        setState({ status: "error", kind: "failed" });
        return;
      }
      const data = await res.json();
      setState({ status: "success", recommendations: data.recommendations });
    } catch {
      setState({ status: "error", kind: "failed" });
    }
  }, [answers, locale, mode]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
      {state.status === "loading" && (
        <>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="font-heading text-3xl font-semibold">
              {t("analyzing")}
            </h1>
            <p className="text-muted-foreground">{t("analyzingHint")}</p>
          </div>
          <div className="flex flex-col gap-6">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        </>
      )}

      {state.status === "error" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <h1 className="font-heading text-3xl font-semibold">
            {state.kind === "no_candidates"
              ? t("noCandidatesTitle")
              : t("errorTitle")}
          </h1>
          <p className="max-w-md text-muted-foreground">
            {state.kind === "no_candidates"
              ? t("noCandidatesHint")
              : t("errorHint")}
          </p>
          {state.kind === "failed" ? (
            <Button onClick={fetchRecommendations}>{t("retry")}</Button>
          ) : (
            <Button nativeButton={false} render={<Link href="/quiz" />}>
              {t("retake")}
            </Button>
          )}
        </div>
      )}

      {state.status === "success" && (
        <>
          <div className="animate-in fade-in slide-in-from-bottom-3 flex flex-col items-center gap-2 text-center duration-500">
            <h1 className="font-heading text-4xl font-semibold tracking-tight">
              {t("title")}
            </h1>
            <p className="text-muted-foreground">{t("subtitle")}</p>
          </div>
          <div className="flex flex-col gap-6">
            {state.recommendations.map((rec, i) => (
              <div
                key={rec.racket.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                style={{ animationDelay: `${i * 120}ms`, animationFillMode: "backwards" }}
              >
                <RacketCard
                  racket={rec.racket}
                  justification={rec.justification}
                  buyUrl={rec.buyUrl}
                  rel={rec.rel}
                  rank={i + 1}
                />
              </div>
            ))}
          </div>
          {/* Only in the success branch: an ad beside loading skeletons or an
              error message is the worst possible moment to ask for attention.
              Placed after all three cards, so every affiliate button has already
              had its chance at the click. */}
          <AdSlot placement="results_below_picks" format="banner" />
          <div className="flex flex-wrap items-center justify-center gap-3">
            <ShareButton />
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/quiz" />}
            >
              {t("retake")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
