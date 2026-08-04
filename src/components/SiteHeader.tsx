import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between border-b border-border/60 px-6 py-4">
      <Link href="/" className="font-semibold tracking-tight">
        Find My <span className="text-primary">Racquet</span>
      </Link>
      <LocaleSwitcher />
    </header>
  );
}
