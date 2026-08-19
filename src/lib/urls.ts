import { getPathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { absoluteUrl } from "./site";

/**
 * Canonical + hreflang alternates for one route, in the shape `Metadata.alternates`
 * expects. `x-default` names the version to serve when none of the hreflangs match
 * the visitor's language.
 */
export function alternatesFor(href: string, locale: Locale) {
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((l) => [l, absoluteUrl(getPathname({ href, locale: l }))]),
  );
  languages["x-default"] = absoluteUrl(
    getPathname({ href, locale: routing.defaultLocale }),
  );

  return {
    canonical: absoluteUrl(getPathname({ href, locale })),
    languages,
  };
}
