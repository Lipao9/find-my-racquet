import type { MetadataRoute } from "next";
import { absoluteUrl, siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /results is crawlable on purpose so social crawlers can still read its
        // OG tags; it is kept out of the index with page-level noindex instead.
        disallow: ["/api/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteUrl(),
  };
}
