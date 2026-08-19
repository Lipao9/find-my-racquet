import { cn } from "@/lib/utils";

/**
 * The RaqMatch mark: a racquet head seen face-on, hoop plus string bed.
 *
 * Why the head alone and not a whole racquet — three earlier passes are worth
 * recording so they are not retried. A round hoop with a short 45° handle reads
 * as a magnifying glass, not a racquet. A full racquet at real proportions (head
 * ~40% of length) collapses into an illegible sliver by 16px, and its tall
 * silhouette unbalances the wordmark lockup. The head fills a square frame, so
 * it survives every size the mark is actually used at.
 *
 * The strings carry 0.8 opacity rather than the 0.5 that reads better at display
 * size: below ~32px, lighter strings wash out entirely and the mark degrades to a
 * plain oval — which could be anything.
 *
 * String segments are explicit line endpoints computed on the ellipse instead of
 * a `clipPath`, so the component can render more than once per page without
 * duplicate element ids. Endpoints come from the ellipse equation for
 * cx=16 cy=16 rx=8.6 ry=11: they land on the hoop's centreline, letting each
 * string tuck under the hoop stroke the way real stringing does.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={cn("size-6", className)}
    >
      <g stroke="currentColor" strokeWidth="1.6" opacity="0.8">
        {/* mains */}
        <path d="M10 8.12V23.88" />
        <path d="M13.5 5.48V26.52" />
        <path d="M18.5 5.48V26.52" />
        <path d="M22 8.12V23.88" />
        {/* crosses */}
        <path d="M8.79 10H23.21" />
        <path d="M7.4 16H24.6" />
        <path d="M8.79 22H23.21" />
      </g>
      <ellipse
        cx="16"
        cy="16"
        rx="8.6"
        ry="11"
        stroke="currentColor"
        strokeWidth="3"
      />
    </svg>
  );
}

/**
 * Mark plus wordmark. "Match" carries the accent colour — the same split the
 * previous header used on "Racquet", so the identity changes while the reading
 * pattern visitors already learned does not.
 */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex items-center gap-2 font-heading text-lg font-semibold tracking-tight",
        className,
      )}
    >
      <BrandMark className="size-[1.3em] text-primary" />
      <span>
        Raq<span className="text-primary">Match</span>
      </span>
    </span>
  );
}
