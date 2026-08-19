import { after, NextResponse } from "next/server";
import { buyUrl, isAffiliateEnabled } from "@/lib/affiliate";
import { recordOutboundClick } from "@/lib/analytics";
import { getRacketBySlug } from "@/lib/catalog";

const KNOWN_SOURCES = new Set(["results", "racquet_page"]);

/**
 * Click-through redirect for outbound store links.
 *
 * Not an open redirect: the destination is derived from the catalog entry the
 * slug resolves to, never from a query parameter, so there is no user-supplied
 * URL to forge.
 */
export async function GET(
  req: Request,
  { params }: RouteContext<"/api/go/[racketId]">,
) {
  const { racketId } = await params;
  const racket = getRacketBySlug(racketId);
  if (!racket) {
    return NextResponse.json({ error: "unknown_racket" }, { status: 404 });
  }

  const requestUrl = new URL(req.url);
  const requestedSource = requestUrl.searchParams.get("src") ?? "";
  const source = KNOWN_SOURCES.has(requestedSource) ? requestedSource : "unknown";
  const locale = requestUrl.searchParams.get("locale");

  const destination = buyUrl(racket);

  // after() so the visitor is redirected immediately and the insert happens on
  // the way out — a slow database must never sit between a click and the store.
  after(async () => {
    await recordOutboundClick({
      racketId: racket.id,
      merchant: new URL(destination).hostname.replace(/^www\./, ""),
      source,
      locale,
      affiliate: isAffiliateEnabled(),
    });
  });

  // 302, not 301: the destination changes whenever the affiliate program does,
  // and a permanent redirect would be cached by browsers well past that.
  return NextResponse.redirect(destination, 302);
}
