import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { QuizWizard } from "@/components/quiz/QuizWizard";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Link } from "@/i18n/navigation";

export default function QuizPage({ params }: PageProps<"/[locale]/quiz">) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="font-semibold tracking-tight">
          Find My Racquet
        </Link>
        <LocaleSwitcher />
      </header>
      <QuizWizard />
    </main>
  );
}
