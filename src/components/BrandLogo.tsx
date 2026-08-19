import { cn } from "@/lib/utils";

/**
 * The RaqMatch mark: a racquet head in solid silhouette, with the sweet spot as
 * a filled dot at its centre.
 *
 * This replaces an outlined hoop carrying a seven-line string bed. That mark
 * failed for a reason worth recording: below ~32px the strings merged into a
 * grey wash and what survived was a plain oval, so the favicon read as nothing
 * at all. A solid shape with one high-contrast counter survives the same sizes,
 * which is the whole job of a mark at 16px.
 *
 * The silhouette tapers to a point at the bottom, so it carries some visual
 * rhyme with a map pin. That was seen and chosen anyway — do not "fix" it into
 * an open Y-shaped throat without asking first.
 *
 * Geometry comes from a 1024×1024 source, kept at its original coordinates
 * rather than rescaled to a 32-unit grid: the outline is cubic bézier, and
 * refitting every control point by hand would introduce drift for no gain. The
 * viewBox is instead cropped tight to the drawing's bounding box (measured via
 * getBBox, not estimated), so CSS sizing controls the mark's optical height
 * directly with no dead margin to compensate for.
 *
 * Two paths, no fill-rule: the hoop's counter is wound opposite its outer
 * contour, so the default nonzero rule opens it correctly.
 */
/**
 * Exported so the OpenGraph route can draw the same mark from the same numbers.
 * That route used to carry its own transcribed copy of the geometry under a
 * comment admitting it was "kept in sync by hand"; importing removes one of the
 * two places this drawing could drift. The third copy, src/app/icon.svg, cannot
 * import anything — Next resolves the favicon convention from a static file —
 * so that one stays manual and says so.
 */
export const MARK_VIEWBOX = "247 180 532 701";

export const MARK_PATHS = [
  "M501.08 180.766C511.866 179.906 528.52 180.627 539.178 181.667C609.105 188.903 673.32 223.533 717.783 277.986C748.96 315.962 770.625 365.511 776.379 414.444C779.152 438.028 778.447 469.345 778.409 493.484C778.366 520.927 779.254 553.197 776.638 579.975C771.547 632.089 746.578 685.792 711.848 724.781C701.493 736.405 688.128 748.935 676.978 760.166L628.695 808.916C613.695 823.757 598.84 838.743 584.133 853.873C577.059 861.038 563.967 874.72 556.466 880.856C547.646 881.279 534.227 880.696 524.981 880.725C507.335 881.35 487.128 880.787 469.21 880.711C467.846 879.7 466.531 878.625 465.269 877.49C457.337 870.335 447.845 860.136 440.228 852.392C422.863 834.597 405.398 816.9 387.833 799.303L337.678 749.373C328.599 740.308 318.865 731.63 310.603 721.956C272.947 678.181 250.927 623.121 248.011 565.453C246.968 540.902 247.83 514.047 247.689 489.318C248.055 467.941 246.756 445.702 248.417 424.411C254.297 349.035 292.614 279.825 352.86 234.444C395.582 201.755 447.334 183.013 501.08 180.766ZM513.221 735.451C535.13 734.839 555.079 731.61 575.436 724.07C641.153 699.729 690.31 637.858 695.902 567.559C697.351 549.342 697.028 530.793 696.987 512.486C696.634 489.188 697.531 464.676 696.912 441.511C695.643 391.535 674.456 344.137 638.063 309.862C604.073 277.828 559.081 260.067 512.376 260.247C462.363 260.452 414.553 280.854 379.801 316.82C370.059 326.805 364.802 334.856 357.361 345.98C327.082 391.243 328.185 436.651 329.083 488.523C329.46 510.265 328.842 532.595 329.19 554.451C329.772 602.796 349.59 648.918 384.262 682.616C418.299 715.453 465.736 735.789 513.221 735.451ZM512.694 876.651C518.369 871.555 524.25 865.249 529.672 859.757L554.394 834.817L585.113 803.517C544.394 814.465 515.353 817.744 472.971 811.339C466.89 810.398 460.861 809.143 454.909 807.579C452.577 806.957 442.53 803.932 440.832 803.852C447.525 811.138 454.921 818.698 461.987 825.671C478.617 842.079 495.153 861.41 512.694 876.651Z",
  "M508.016 436.324C541.196 433.636 570.272 458.353 572.961 491.533C575.651 524.712 550.934 553.789 517.755 556.48C484.575 559.17 455.495 534.452 452.806 501.272C450.117 468.091 474.835 439.013 508.016 436.324Z",
];

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox={MARK_VIEWBOX}
      fill="currentColor"
      aria-hidden
      className={cn("size-6", className)}
    >
      {MARK_PATHS.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

/**
 * Mark plus wordmark. "Match" carries the accent colour — the same split the
 * previous header used on "Racquet", so the identity changes while the reading
 * pattern visitors already learned does not.
 *
 * The mark is sized at 1em rather than the 1.3em the outlined version used.
 * Both render to roughly the same optical height: the old viewBox padded the
 * hoop with dead space on every side, and this one does not. A solid shape also
 * carries more weight than an outline at equal height, so matching the old
 * measurement exactly would have made the mark shout over the wordmark.
 */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex items-center gap-2 font-heading text-lg font-semibold tracking-tight",
        className,
      )}
    >
      <BrandMark className="size-[1em] text-primary" />
      <span>
        Raq<span className="text-primary">Match</span>
      </span>
    </span>
  );
}
