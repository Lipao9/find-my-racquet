import type { Racket } from "./catalog";

/**
 * Outbound product links, optionally monetised.
 *
 * Affiliate networks deep-link in one of two shapes, so both are supported:
 *   1. a tracking param appended to the merchant URL (Amazon `tag`, AvantLink `ctc`)
 *   2. a wrapper URL that carries the merchant URL as an encoded parameter
 *      (Impact, AvantLink click.php, Skimlinks)
 *
 * Keeping this env-driven means `data/rackets.json` stays free of tracking data
 * — the program can change without re-scraping the catalog — and the ids are
 * read server-side only, so nothing about the program leaks into the bundle
 * beyond the outbound href itself.
 *
 * With nothing configured every helper degrades to the plain merchant URL, so
 * the site works unmonetised and no fake tracking params are ever emitted.
 */
/**
 * Read on every call, not once at module scope. A module-scope constant is
 * captured the first time the module loads — which for a statically generated
 * page is build time — so a value set only at runtime would be silently
 * ignored. Statically rendered output (the `rel` attribute, whether the footer
 * disclosure shows) is still fixed at build by definition; the monetised URL
 * itself is resolved per request in /api/go, so it always reflects current env.
 */
function config() {
  return {
    param: process.env.AFFILIATE_PARAM?.trim(),
    value: process.env.AFFILIATE_ID?.trim(),
    template: process.env.AFFILIATE_URL_TEMPLATE?.trim(),
  };
}

/**
 * `sponsored` is what Google asks for on paid links; without it monetised
 * outbound links are a manual-action risk. `nofollow` covers crawlers that
 * predate `sponsored`.
 */
export const AFFILIATE_REL = "sponsored nofollow noopener noreferrer";
export const PLAIN_REL = "noopener noreferrer";

export function isAffiliateEnabled(): boolean {
  const { param, value, template } = config();
  return Boolean(template || (param && value));
}

/** The rel attribute matching how the link is actually built. */
export function outboundRel(): string {
  return isAffiliateEnabled() ? AFFILIATE_REL : PLAIN_REL;
}

export type ClickSource = "results" | "racquet_page";

/**
 * Internal href that records the click before bouncing to the store. Every
 * outbound link goes through this so "which racquets do people actually click"
 * is answerable; /api/ is disallowed in robots.txt, so crawlers never follow it.
 */
export function trackedUrl(racketId: string, source: ClickSource): string {
  return `/api/go/${encodeURIComponent(racketId)}?src=${source}`;
}

export function buyUrl(racket: Pick<Racket, "productUrl">): string {
  const { param, value, template } = config();
  if (template) {
    return template.replace("{url}", encodeURIComponent(racket.productUrl));
  }
  if (param && value) {
    const url = new URL(racket.productUrl);
    url.searchParams.set(param, value);
    return url.toString();
  }
  return racket.productUrl;
}
