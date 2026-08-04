import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { decodeAnswers } from "@/lib/answers";
import { ResultsView } from "@/components/results/ResultsView";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default async function ResultsPage({
  params,
  searchParams,
}: PageProps<"/[locale]/results">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const decoded = decodeAnswers(await searchParams);
  if (!decoded) {
    redirect({ href: "/quiz", locale });
  }

  return (
    <main className="flex flex-1 flex-col">
      <SiteHeader />
      <ResultsView answers={decoded!.answers} mode={decoded!.mode} />
      <SiteFooter />
    </main>
  );
}
