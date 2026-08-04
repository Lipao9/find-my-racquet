/**
 * Stylized tennis court lines used as a decorative background motif.
 * Inherits color from `currentColor`; control intensity via className.
 */
export function CourtLines({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 780 360"
      fill="none"
      aria-hidden
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <g stroke="currentColor" strokeWidth="2">
        {/* outer doubles court */}
        <rect x="30" y="20" width="720" height="320" />
        {/* singles sidelines */}
        <line x1="30" y1="60" x2="750" y2="60" />
        <line x1="30" y1="300" x2="750" y2="300" />
        {/* service boxes */}
        <line x1="210" y1="60" x2="210" y2="300" />
        <line x1="570" y1="60" x2="570" y2="300" />
        <line x1="210" y1="180" x2="570" y2="180" />
        {/* net */}
        <line x1="390" y1="8" x2="390" y2="352" strokeWidth="3" />
        {/* center marks */}
        <line x1="30" y1="180" x2="42" y2="180" />
        <line x1="738" y1="180" x2="750" y2="180" />
      </g>
    </svg>
  );
}
