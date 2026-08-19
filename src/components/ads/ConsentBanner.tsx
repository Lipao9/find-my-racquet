"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { adsEnabled, isAdFreePath } from "@/lib/ads";
import { useAdConsent } from "@/lib/consent";

/**
 * Ad personalisation choice.
 *
 * Non-blocking by design. Declining does not remove ads — it drops them to
 * contextual — so there is no reason to hold the page hostage until the visitor
 * answers, and no dark-pattern incentive to make "decline" hard to find. Both
 * buttons are equally reachable and the copy says what each one does.
 *
 * Hidden on ad-free routes: interrupting the quiz to ask about ads that will
 * never render there would be pure friction.
 */
export function ConsentBanner() {
  const t = useTranslations("consent");
  const pathname = usePathname();
  const { consent, ready, decide } = useAdConsent();

  if (!adsEnabled()) return null;
  if (isAdFreePath(pathname)) return null;
  if (!ready || consent !== null) return null;

  return (
    <div
      role="region"
      aria-label={t("label")}
      className="fixed inset-x-0 bottom-0 z-40 animate-in slide-in-from-bottom-4 duration-500"
    >
      <div className="mx-auto mb-4 flex w-[min(46rem,calc(100%-2rem))] flex-col gap-3 rounded-2xl border border-border/70 bg-card/95 p-4 shadow-xl shadow-foreground/5 backdrop-blur-md sm:flex-row sm:items-center sm:gap-5 sm:p-5">
        <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
          {t("body")}{" "}
          <Link
            href="/privacy"
            className="font-medium text-foreground underline decoration-primary/40 underline-offset-2 transition-colors hover:text-primary"
          >
            {t("policyLink")}
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => decide("denied")}
          >
            {t("deny")}
          </Button>
          <Button size="sm" onClick={() => decide("granted")}>
            {t("accept")}
          </Button>
        </div>
      </div>
    </div>
  );
}
