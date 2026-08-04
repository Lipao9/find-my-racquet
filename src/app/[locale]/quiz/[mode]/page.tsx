import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { QuizWizard } from "@/components/quiz/QuizWizard";
import { SiteHeader } from "@/components/SiteHeader";
import { QUIZ_MODES, type QuizMode } from "@/lib/questions";

export default async function QuizWizardPage({
  params,
}: PageProps<"/[locale]/quiz/[mode]">) {
  const { locale, mode } = await params;
  setRequestLocale(locale);

  if (!QUIZ_MODES.includes(mode as QuizMode)) {
    notFound();
  }

  return (
    <main className="flex flex-1 flex-col">
      <SiteHeader />
      <QuizWizard mode={mode as QuizMode} />
    </main>
  );
}
