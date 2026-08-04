import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { ArrowRight, NotebookPen, Zap } from "lucide-react";
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
import { SiteFooter } from "@/components/SiteFooter";
import { CourtLines } from "@/components/CourtLines";

const MODES = [
  { mode: "quick", Icon: Zap },
  { mode: "detailed", Icon: NotebookPen },
] as const;

export default function QuizModePage({ params }: PageProps<"/[locale]/quiz">) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("quiz.modes");

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      <CourtLines className="pointer-events-none absolute -left-48 bottom-0 h-80 w-auto rotate-3 text-primary/8" />
      <SiteHeader />
      <section className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-8 px-6 py-16">
        <div className="animate-in fade-in slide-in-from-bottom-3 text-center duration-500">
          <h1 className="font-heading text-4xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 grid gap-5 duration-700 sm:grid-cols-2">
          {MODES.map(({ mode, Icon }) => (
            <Link key={mode} href={`/quiz/${mode}`} className="group">
              <Card className="h-full transition-all duration-200 group-hover:-translate-y-1 group-hover:border-primary/60 group-hover:shadow-lg group-hover:shadow-primary/10">
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <Icon className="size-5" />
                    </span>
                    <Badge variant="secondary">{t(`${mode}.duration`)}</Badge>
                  </div>
                  <CardTitle className="font-heading text-xl">
                    {t(`${mode}.title`)}
                  </CardTitle>
                  <CardDescription>{t(`${mode}.description`)}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between gap-4 text-sm text-muted-foreground">
                  {t(`${mode}.detail`)}
                  <span className="inline-flex items-center gap-1 font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    {t("choose")}
                    <ArrowRight className="size-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
