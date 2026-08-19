import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { alternatesFor } from "@/lib/urls";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CourtLines } from "@/components/CourtLines";

// Title and description come from the locale layout; this only pins the
// canonical and hreflang set for the locale root.
export async function generateMetadata({
  params,
}: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: alternatesFor("/", locale as Locale) };
}

export default function LandingPage({ params }: PageProps<"/[locale]">) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("landing");

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden bg-gradient-to-b from-accent/40 via-background to-secondary/50">
      <CourtLines className="pointer-events-none absolute -right-40 top-24 h-[26rem] w-auto -rotate-6 text-primary/10 sm:-right-24" />
      <SiteHeader />
      <section className="relative flex flex-1 flex-col items-center justify-center gap-8 px-6 py-20 text-center">
        <span className="animate-in fade-in slide-in-from-bottom-2 rounded-full border border-primary/25 bg-accent/60 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-accent-foreground duration-500">
          {t("kicker")}
        </span>
        <h1 className="animate-in fade-in slide-in-from-bottom-3 max-w-3xl font-heading text-5xl font-semibold leading-[1.05] tracking-tight duration-700 sm:text-7xl">
          {t.rich("title", {
            em: (chunks) => (
              <em className="font-light italic text-primary">{chunks}</em>
            ),
          })}
        </h1>
        <p className="animate-in fade-in slide-in-from-bottom-3 max-w-xl text-lg leading-relaxed text-muted-foreground duration-700">
          {t("subtitle")}
        </p>
        <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col items-center gap-3 duration-700 sm:flex-row">
          <Button
            size="lg"
            className="h-12 px-7 text-base shadow-lg shadow-primary/20"
            nativeButton={false}
            render={<Link href="/quiz/quick" />}
          >
            {t("cta")}
            <ArrowRight />
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="h-12 px-5 text-base text-muted-foreground"
            nativeButton={false}
            render={<Link href="/quiz/detailed" />}
          >
            {t("ctaDetailed")}
          </Button>
        </div>
        <dl className="animate-in fade-in mt-10 grid grid-cols-3 gap-8 duration-1000 sm:gap-14">
          {(
            [
              ["272", "racquets"],
              ["8", "brands"],
              ["3", "picks"],
            ] as const
          ).map(([value, key]) => (
            <div key={key} className="flex flex-col gap-1">
              <dt className="order-2 text-xs uppercase tracking-wider text-muted-foreground">
                {t(`stats.${key}`)}
              </dt>
              <dd className="order-1 font-heading text-3xl font-semibold text-primary">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>
      <SiteFooter />
    </main>
  );
}
