import type { AdConsent } from "./consent";

/**
 * The `window.adsbygoogle` queue.
 *
 * The AdSense loader replaces this array with a live object once it boots, but
 * until then it is a plain array that collects `push({})` calls. Configuration
 * flags are read off the same object, which is why they can be set before the
 * script has downloaded.
 */
type AdsByGoogleQueue = unknown[] & {
  /** 1 = serve contextual ads only; read when the queue is drained. */
  requestNonPersonalizedAds?: 0 | 1;
};

declare global {
  interface Window {
    adsbygoogle?: AdsByGoogleQueue;
  }
}

function queue(): AdsByGoogleQueue {
  return (window.adsbygoogle ??= [] as unknown as AdsByGoogleQueue);
}

/**
 * Apply the visitor's choice to the queue.
 *
 * Only an explicit `granted` unlocks personalised ads. Both "declined" and "has
 * not chosen yet" fall back to non-personalised, which serves contextual ads
 * without building a profile — so declining costs the visitor nothing and costs
 * us only the personalisation premium, instead of the whole impression.
 *
 * Idempotent and order-independent on purpose: the loader component and every
 * slot call it, because React gives no ordering guarantee between their effects
 * and the flag has to be set before the queue is drained.
 */
export function applyAdConsent(consent: AdConsent | null): void {
  queue().requestNonPersonalizedAds = consent === "granted" ? 0 : 1;
}

/** Ask AdSense to fill the most recently rendered `<ins class="adsbygoogle">`. */
export function pushAd(consent: AdConsent | null): void {
  applyAdConsent(consent);
  queue().push({});
}
