"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

const LABELS: Record<string, string> = {
  "pt-BR": "PT",
  en: "EN",
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex gap-1">
      {routing.locales.map((l) => (
        <Button
          key={l}
          variant={l === locale ? "secondary" : "ghost"}
          size="sm"
          onClick={() => router.replace(pathname, { locale: l })}
        >
          {LABELS[l]}
        </Button>
      ))}
    </div>
  );
}
