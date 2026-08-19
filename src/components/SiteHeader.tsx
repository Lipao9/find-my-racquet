import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export async function SiteHeader() {
  const t = await getTranslations("nav");

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border/60 bg-background/75 px-6 py-4 backdrop-blur-md">
      <Link
        href="/"
        className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight"
      >
        <span className="inline-block size-2.5 rounded-full bg-primary" aria-hidden />
        Find My <span className="text-primary">Racquet</span>
      </Link>
      <div className="flex items-center gap-4">
        {/* Site-wide entry point into the catalog: gives every page a crawlable
            path to the racquet pages, not just the quiz flow. */}
        <Link
          href="/racquets"
          className="text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          {t("racquets")}
        </Link>
        <LocaleSwitcher />
      </div>
    </header>
  );
}
