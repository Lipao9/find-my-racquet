export function SiteFooter() {
  return (
    <footer className="relative border-t border-border/60 px-6 py-5 text-center text-xs text-muted-foreground">
      <span className="mx-auto mb-4 block h-1 w-16 rounded-full bg-primary/30" />
      Find My Racquet · {new Date().getFullYear()}
    </footer>
  );
}
