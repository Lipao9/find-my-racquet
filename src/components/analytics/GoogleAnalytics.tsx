import Script from "next/script";
import { gaMeasurementId } from "@/lib/gtag";

/**
 * Loads gtag.js once per document.
 *
 * Three decisions worth spelling out, because each one differs from how
 * `AdsenseLoader` behaves:
 *
 * 1. **It runs on every route, including `/quiz` and `/privacy`.** Those are in
 *    `AD_FREE_PREFIXES` because an ad there costs more than it earns — but the
 *    quiz is precisely the funnel we need to measure, and it is the one place our
 *    own tables cannot help: `recordQuizRun` only fires once a recommendation is
 *    generated, so a visitor who abandons at question three is invisible to us.
 *    gtag is also a far cheaper guest than the AdSense library: no injected DOM,
 *    no layout, no reflow — it just beacons.
 *
 * 2. **It is not gated on ad consent.** The banner asks about *ad
 *    personalisation*; audience measurement is a separate purpose, and LGPD
 *    art. 7º IX (legitimate interest) is the basis for it, so there is no prior
 *    consent to wait for. Deliberately no `gtag('consent', …)` call either:
 *    consent state is shared across Google tags on the page, so declaring
 *    ad_storage here would quietly start overriding AdSense's own
 *    `requestNonPersonalizedAds` flag, which is the thing that is actually
 *    tested. Ads stay governed by `adsbygoogle.ts` alone.
 *
 * 3. **No manual page_view on navigation.** GA4's enhanced measurement listens
 *    to History API changes, which is exactly what the App Router does on a
 *    client-side navigation. Firing our own `page_view` from a pathname effect —
 *    the usual Next.js recipe — double-counts every route change unless that
 *    setting is also switched off in the GA dashboard, i.e. it makes correctness
 *    depend on a checkbox nobody will remember. Letting Google detect it keeps
 *    the invariant in one place.
 *
 * `afterInteractive` for both: measurement must never sit in front of hydration.
 */
export function GoogleAnalytics() {
  const measurementId = gaMeasurementId();
  if (!measurementId) return null;

  return (
    <>
      <Script
        id="gtag-loader"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${measurementId}');`}
      </Script>
    </>
  );
}
