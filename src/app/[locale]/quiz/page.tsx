import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Link } from "@/i18n/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/SiteHeader";

const MODES = ["quick", "detailed"] as const;

export default function QuizModePage({ params }: PageProps<"/[locale]/quiz">) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("quiz.modes");

  return (
    <main className="flex flex-1 flex-col">
      <SiteHeader />
      <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-6 pb-24">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {MODES.map((mode) => (
            <Link key={mode} href={`/quiz/${mode}`} className="group">
              <Card className="h-full transition-colors group-hover:border-primary">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle>{t(`${mode}.title`)}</CardTitle>
                    <Badge variant="secondary">{t(`${mode}.duration`)}</Badge>
                  </div>
                  <CardDescription>{t(`${mode}.description`)}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {t(`${mode}.detail`)}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
