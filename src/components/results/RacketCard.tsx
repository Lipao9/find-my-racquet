"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Racket } from "@/lib/catalog";

interface RacketCardProps {
  racket: Racket;
  justification: string;
  rank: number;
}

export function RacketCard({ racket, justification, rank }: RacketCardProps) {
  const t = useTranslations("results");
  const isBestMatch = rank === 1;

  const specs = [
    `${racket.headSizeIn2} in²`,
    `${racket.weightGrams}g`,
    racket.stiffnessRA !== null ? `RA ${racket.stiffnessRA}` : null,
    racket.stringPattern,
    racket.swingweight !== null ? `SW ${racket.swingweight}` : null,
    racket.balance,
  ].filter(Boolean) as string[];

  return (
    <Card
      className={`relative overflow-hidden transition-shadow hover:shadow-lg hover:shadow-primary/5 ${
        isBestMatch ? "border-primary/60 shadow-md shadow-primary/10" : ""
      }`}
    >
      {isBestMatch && (
        <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/70 to-primary/30" />
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={`flex size-8 shrink-0 items-center justify-center rounded-full font-heading text-sm font-semibold ${
                isBestMatch
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {rank}
            </span>
            <CardTitle className="font-heading text-2xl">
              {racket.brand} {racket.model}
            </CardTitle>
          </div>
          {isBestMatch && <Badge>{t("bestMatch")}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row">
        <div className="relative mx-auto h-44 w-36 shrink-0 rounded-xl bg-accent/40 p-2 sm:mx-0">
          <Image
            src={racket.imageUrl}
            alt={`${racket.brand} ${racket.model}`}
            fill
            sizes="144px"
            className="object-contain p-2"
            unoptimized
          />
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-1.5">
            {specs.map((s) => (
              <Badge key={s} variant="secondary">
                {s}
              </Badge>
            ))}
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">
            {justification}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t border-border/60 pt-4">
        <span className="font-heading text-lg font-semibold">
          US$ {racket.priceUSD}
        </span>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={
            <a
              href={racket.productUrl}
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          {t("viewProduct")}
        </Button>
      </CardFooter>
    </Card>
  );
}
