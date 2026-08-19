import { getTranslations } from "next-intl/server";
import { isAffiliateEnabled } from "@/lib/affiliate";

export async function SiteFooter() {
  const t = await getTranslations("footer");

  return (
    <footer className="relative border-t border-border/60 px-6 py-5 text-center text-xs text-muted-foreground">
      <span className="mx-auto mb-4 block h-1 w-16 rounded-full bg-primary/30" />
      {/* Only shown when links are actually monetised — an affiliate notice on
          unmonetised links would be a false disclosure. */}
      {isAffiliateEnabled() && (
        <p className="mx-auto mb-3 max-w-xl leading-relaxed">
          {t("disclosure")}
        </p>
      )}
      Find My Racquet · {new Date().getFullYear()}
    </footer>
  );
}
