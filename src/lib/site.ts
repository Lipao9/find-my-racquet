/**
 * Canonical origin for absolute URLs (metadataBase, sitemap, JSON-LD).
 *
 * Precedence: an explicit NEXT_PUBLIC_SITE_URL (set this once a custom domain
 * exists) beats Vercel's per-project production host, which beats localhost so
 * `next build` never emits `undefined` into a canonical tag.
 */
const LOCALHOST = "http://localhost:3000";

export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return `https://${production}`;

  return LOCALHOST;
}

export function absoluteUrl(path: string): string {
  return new URL(path, siteUrl()).toString();
}

/**
 * Address people use to exercise their LGPD rights. Env-driven so the policy page
 * never hardcodes a personal mailbox, with a default on the domain we own — set
 * up forwarding for it before the policy goes live, since an unreachable contact
 * fails both LGPD art. 18 and AdSense review.
 */
export function contactEmail(): string {
  return process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "contato@raqmatch.com";
}
