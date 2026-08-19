"use client";

import Script from "next/script";
import { usePathname } from "@/i18n/navigation";
import { adsenseClientId, isAdFreePath } from "@/lib/ads";
import { applyAdConsent } from "@/lib/adsbygoogle";
import { useAdConsent } from "@/lib/consent";

/**
 * Loads the AdSense library once per document.
 *
 * Rendered from the locale layout, but it opts *itself* out on ad-free routes
 * rather than the layout deciding — the layout has no pathname. The upside is
 * real: the quiz ships zero third-party JavaScript, so the flow that has to feel
 * fast is not competing with an ad library for the main thread.
 *
 * `afterInteractive` and not `beforeInteractive`: ads must never block hydration
 * of the quiz CTA, and AdSense fills slots asynchronously anyway.
 */
export function AdsenseLoader() {
  const clientId = adsenseClientId();
  const pathname = usePathname();
  const { consent, ready } = useAdConsent();

  if (!clientId) return null;
  if (isAdFreePath(pathname)) return null;
  // Waiting for the stored choice keeps us from booting the library in
  // personalised mode and only then learning the visitor declined.
  if (!ready) return null;

  return (
    <Script
      id="adsbygoogle-loader"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      strategy="afterInteractive"
      crossOrigin="anonymous"
      // Set on the queue object before the library drains it. `AdSlot` repeats
      // this immediately before each push, since React does not order effects
      // across components.
      onReady={() => applyAdConsent(consent)}
    />
  );
}
