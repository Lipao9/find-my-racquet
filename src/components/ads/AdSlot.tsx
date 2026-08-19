"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import {
  AD_MIN_HEIGHT,
  adSlotId,
  adsenseClientId,
  isAdFreePath,
  type AdFormat,
  type AdPlacement,
} from "@/lib/ads";
import { pushAd } from "@/lib/adsbygoogle";
import { useAdConsent } from "@/lib/consent";
import { cn } from "@/lib/utils";

interface AdSlotProps {
  placement: AdPlacement;
  format?: AdFormat;
  className?: string;
}

/**
 * One AdSense unit.
 *
 * Renders nothing at all — not even reserved space — when AdSense is
 * unconfigured or the placement has no slot id, so an unmonetised build has no
 * empty gaps in its layout.
 */
export function AdSlot({
  placement,
  format = "rectangle",
  className,
}: AdSlotProps) {
  const t = useTranslations("ads");
  const clientId = adsenseClientId();
  const slot = adSlotId(placement);
  const pathname = usePathname();
  const { consent, ready } = useAdConsent();
  const insRef = useRef<HTMLModElement>(null);
  // AdSense throws "already have ads in them" if the same <ins> is pushed twice,
  // which React StrictMode's double-invoked effects would otherwise cause.
  const pushed = useRef(false);

  const adFree = isAdFreePath(pathname);
  const active = Boolean(clientId && slot) && !adFree;

  useEffect(() => {
    if (!active || !ready || pushed.current || !insRef.current) return;
    pushed.current = true;
    pushAd(consent);
  }, [active, ready, consent]);

  useEffect(() => {
    if (adFree && process.env.NODE_ENV !== "production") {
      // Loud in dev, silent in prod: the policy in lib/ads.ts held, but the page
      // shouldn't have asked in the first place.
      console.warn(
        `[ads] AdSlot "${placement}" was rendered on the ad-free route ${pathname} and suppressed.`,
      );
    }
  }, [adFree, placement, pathname]);

  if (!active) return null;

  return (
    <aside
      className={cn("mx-auto w-full max-w-3xl", className)}
      // Reserved before the creative arrives, so filling the slot never pushes
      // content down. See AD_MIN_HEIGHT.
      style={{ minHeight: AD_MIN_HEIGHT[format] }}
    >
      {/* AdSense policy allows exactly "Advertisement" or "Sponsored Links"
          (and faithful translations) as a label. */}
      <p className="mb-1.5 text-center text-[0.625rem] uppercase tracking-[0.18em] text-muted-foreground/70">
        {t("label")}
      </p>
      <ins
        ref={insRef}
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
        // Keeps local traffic out of the real auction; serving live ads to your
        // own dev server is an invalid-traffic policy risk.
        data-ad-test={process.env.NODE_ENV !== "production" ? "on" : undefined}
      />
    </aside>
  );
}
