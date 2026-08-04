import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { decodeAnswers } from "@/lib/answers";
import { ResultsView } from "@/components/results/ResultsView";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Link } from "@/i18n/navigation";

export default async function ResultsPage({
  params,
  searchParams,
}: PageProps<"/[locale]/results">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const answers = decodeAnswers(await searchParams);
  if (!answers) {
    redirect({ href: "/quiz", locale });
  }

  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="font-semibold tracking-tight">
          Find My Racquet
        </Link>
        <LocaleSwitcher />
      </header>
      <ResultsView answers={answers!} />
    </main>
  );
}
