"use client";

import { useTranslations } from "next-intl";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { optionLabelKey, type Question } from "@/lib/questions";

interface QuestionCardProps {
  question: Question;
  value: string | undefined;
  onChange: (value: string) => void;
}

export function QuestionCard({ question, value, onChange }: QuestionCardProps) {
  const t = useTranslations("quiz");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          {t(`questions.${question.id}.title`)}
          {question.optional && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {t("optional")}
            </span>
          )}
        </h2>
        {t.has(`questions.${question.id}.description`) && (
          <p className="text-muted-foreground">
            {t(`questions.${question.id}.description`)}
          </p>
        )}
      </div>

      {question.kind === "text" ? (
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t(`questions.${question.id}.placeholder`)}
          maxLength={120}
          className="h-11 rounded-md border border-input bg-transparent px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      ) : (
        <RadioGroup
          key={question.id}
          value={value ?? null}
          onValueChange={(v) => onChange(String(v))}
          className="gap-3"
        >
          {question.options.map((option) => (
            <label
              key={option}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent ${
                value === option ? "border-primary bg-accent" : "border-input"
              }`}
            >
              <RadioGroupItem value={option} />
              <span className="text-base">
                {t(optionLabelKey(question.id, option))}
              </span>
            </label>
          ))}
        </RadioGroup>
      )}
    </div>
  );
}
