import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";

export default function LandingPage({ params }: PageProps<"/[locale]">) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("landing");

  return (
    <main className="flex flex-1 flex-col bg-gradient-to-b from-accent/50 via-background to-secondary/40">
      <SiteHeader />
      <section className="flex flex-1 flex-col items-center justify-center gap-6 px-6 pb-24 text-center">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          {t("title")}
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          {t("subtitle")}
        </p>
        <Button
          size="lg"
          className="mt-2"
          nativeButton={false}
          render={<Link href="/quiz" />}
        >
          {t("cta")}
        </Button>
        <p className="text-sm text-muted-foreground">{t("duration")}</p>
      </section>
    </main>
  );
}
