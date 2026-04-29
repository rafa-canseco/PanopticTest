interface ArcMarkProps {
  size?: number;
  className?: string;
  // The two outer arcs can be muted to a softer purple while the inner ring
  // stays brand strength — useful as a decorative element rather than a logo.
  variant?: "primary" | "soft";
}

export function ArcMark({ size = 56, className = "", variant = "primary" }: ArcMarkProps) {
  const inner = "#4e14d0";
  const outer = variant === "soft" ? "rgba(78, 20, 208, 0.45)" : "#4e14d0";
  const stroke = size * 0.115;
  return (
    <svg
      role="img"
      aria-label="Panoptic arc mark"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
    >
      <circle cx="32" cy="32" r="14" fill="none" stroke={inner} strokeWidth={stroke} />
      <path
        d="M14 14 A 24 24 0 0 0 14 50"
        fill="none"
        stroke={outer}
        strokeWidth={stroke}
        strokeLinecap="butt"
      />
      <path
        d="M50 14 A 24 24 0 0 1 50 50"
        fill="none"
        stroke={outer}
        strokeWidth={stroke}
        strokeLinecap="butt"
      />
    </svg>
  );
}
