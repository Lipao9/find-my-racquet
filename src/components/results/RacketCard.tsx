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
  isBestMatch: boolean;
}

export function RacketCard({
  racket,
  justification,
  isBestMatch,
}: RacketCardProps) {
  const t = useTranslations("results");

  const specs = [
    `${racket.headSizeIn2} in²`,
    `${racket.weightGrams}g`,
    racket.stiffnessRA !== null ? `RA ${racket.stiffnessRA}` : null,
    racket.stringPattern,
    racket.swingweight !== null ? `SW ${racket.swingweight}` : null,
    racket.balance,
  ].filter(Boolean) as string[];

  return (
    <Card className={isBestMatch ? "border-primary" : undefined}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-xl">
            {racket.brand} {racket.model}
          </CardTitle>
          {isBestMatch && <Badge>{t("bestMatch")}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row">
        <div className="relative mx-auto h-40 w-32 shrink-0 sm:mx-0">
          <Image
            src={racket.imageUrl}
            alt={`${racket.brand} ${racket.model}`}
            fill
            sizes="128px"
            className="object-contain"
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
          <p className="text-sm leading-relaxed">{justification}</p>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <span className="text-lg font-semibold">US$ {racket.priceUSD}</span>
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
