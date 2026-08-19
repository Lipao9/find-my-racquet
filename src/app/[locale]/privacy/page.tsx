import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import type { Locale } from "@/i18n/routing";
import { contactEmail } from "@/lib/site";
import { alternatesFor } from "@/lib/urls";

/**
 * Privacy policy.
 *
 * Not a nice-to-have: AdSense rejects applications from sites without a reachable
 * privacy policy that discloses third-party ad cookies, and LGPD art. 9 requires
 * telling people what is collected and how to exercise their rights. It is
 * deliberately a real page in the locale tree — linked from the footer, in the
 * sitemap, and indexable — because a policy crawlers cannot reach does not count.
 *
 * No ad slot here, and `/privacy` is in AD_FREE_PREFIXES so the loader never runs
 * either. Thin, policy-only pages are exactly what AdSense's "no ads on pages
 * without publisher content" rule is about — and merely omitting the slot is not
 * enough, since Auto Ads injects into any page that loads the library.
 */
const SECTIONS = [
  "controller",
  "data",
  "cookies",
  "ai",
  "affiliate",
  "retention",
  "rights",
] as const;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  const { canonical, languages } = alternatesFor("/privacy", locale as Locale);

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical, languages },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: canonical,
    },
  };
}

export default async function PrivacyPage({
  params,
}: PageProps<"/[locale]/privacy">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("privacy");
  const email = contactEmail();

  return (
    <main className="relative flex flex-1 flex-col">
      <SiteHeader />

      <article className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-6 py-14">
        <header className="flex flex-col gap-3">
          <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("updated", { date: t("updatedDate") })}
          </p>
          <p className="text-lg leading-relaxed text-muted-foreground">
            {t("intro")}
          </p>
        </header>

        {SECTIONS.map((section) => (
          <section key={section} className="flex flex-col gap-3">
            <h2 className="font-heading text-2xl font-semibold">
              {t(`sections.${section}.title`)}
            </h2>
            <p className="whitespace-pre-line leading-relaxed text-foreground/85">
              {t(`sections.${section}.body`)}
            </p>
          </section>
        ))}

        <section className="flex flex-col gap-3">
          <h2 className="font-heading text-2xl font-semibold">
            {t("sections.contact.title")}
          </h2>
          <p className="leading-relaxed text-foreground/85">
            {t("sections.contact.body")}{" "}
            <a
              href={`mailto:${email}`}
              className="font-medium text-primary underline decoration-primary/40 underline-offset-2"
            >
              {email}
            </a>
          </p>
        </section>
      </article>

      <SiteFooter />
    </main>
  );
}
