"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { encodeAnswers, type Answers } from "@/lib/answers";
import { questionsFor, type QuizMode } from "@/lib/questions";

export function QuizWizard({ mode }: { mode: QuizMode }) {
  const t = useTranslations("quiz");
  const router = useRouter();
  const questions = useMemo(() => questionsFor(mode), [mode]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  const question = questions[step];
  const value = answers[question.id];
  const isLast = step === questions.length - 1;
  const canAdvance =
    question.optional || (value !== undefined && value.trim() !== "");

  function next() {
    if (isLast) {
      router.push(`/results?${encodeAnswers(answers, mode)}`);
    } else {
      setStep(step + 1);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            {t("progress", { current: step + 1, total: questions.length })}
          </span>
          <span>{t(`modes.${mode}.title`)}</span>
        </div>
        <Progress value={((step + 1) / questions.length) * 100} />
      </div>

      <div
        key={question.id}
        className="animate-in fade-in slide-in-from-right-4 duration-300"
      >
        <QuestionCard
          question={question}
          value={value}
          onChange={(v) => setAnswers((a) => ({ ...a, [question.id]: v }))}
        />
      </div>

      <div className="mt-auto flex justify-between gap-4 pt-4">
        <Button
          variant="ghost"
          disabled={step === 0}
          onClick={() => setStep(step - 1)}
        >
          {t("back")}
        </Button>
        <Button disabled={!canAdvance} onClick={next}>
          {isLast ? t("finish") : t("next")}
        </Button>
      </div>
    </div>
  );
}
