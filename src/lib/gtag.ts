/**
 * Google Analytics 4.
 *
 * Same posture as `ads.ts`: env-driven, and with nothing configured no script
 * loads and nothing is measured. The site works unmeasured.
 *
 * `NEXT_PUBLIC_` because gtag runs in the browser, which means it is INLINED AT
 * BUILD TIME — changing the id in the Vercel dashboard does nothing until the
 * next build (`vercel redeploy`), the same trap the AdSense ids have.
 *
 * Note this is *web* analytics, and deliberately separate from `analytics.ts`,
 * which writes quiz runs and outbound clicks to our own Postgres. The two answer
 * different questions and neither replaces the other: GA knows where a visitor
 * came from and which pages they read, our tables know what the model
 * recommended and whether the pick was any good. Only ours survives an ad
 * blocker, and only GA can be joined to Search Console queries.
 */
export function gaMeasurementId(): string | undefined {
  return process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || undefined;
}

export function webAnalyticsEnabled(): boolean {
  return Boolean(gaMeasurementId());
}
