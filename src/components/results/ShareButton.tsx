"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ShareButton() {
  const t = useTranslations("results");

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ url });
        return;
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }
    await navigator.clipboard.writeText(url);
    toast(t("linkCopied"));
  }

  return <Button onClick={share}>{t("share")}</Button>;
}
