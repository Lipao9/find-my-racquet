import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export async function SiteHeader() {
  const t = await getTranslations("nav");

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border/60 bg-background/75 px-6 py-4 backdrop-blur-md">
      <Link href="/" aria-label="RaqMatch">
        <BrandLogo />
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
