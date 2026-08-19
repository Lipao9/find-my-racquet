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
