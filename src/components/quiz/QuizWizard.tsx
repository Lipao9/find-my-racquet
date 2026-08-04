"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { encodeAnswers, type Answers } from "@/lib/answers";
import { QUESTIONS } from "@/lib/questions";

export function QuizWizard() {
  const t = useTranslations("quiz");
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Answers>>({});

  const question = QUESTIONS[step];
  const value = answers[question.id];
  const isLast = step === QUESTIONS.length - 1;
  const canAdvance = question.optional || (value !== undefined && value !== "");

  function next() {
    if (isLast) {
      router.push(`/results?${encodeAnswers(answers as Answers)}`);
    } else {
      setStep(step + 1);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{t("progress", { current: step + 1, total: QUESTIONS.length })}</span>
        </div>
        <Progress value={((step + 1) / QUESTIONS.length) * 100} />
      </div>

      <QuestionCard
        question={question}
        value={value}
        onChange={(v) => setAnswers((a) => ({ ...a, [question.id]: v }))}
      />

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
