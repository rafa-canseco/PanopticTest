interface ArcMarkProps {
  size?: number;
  className?: string;
  /**
   * - primary: full brand purple, used as the hero mark
   * - soft: brand purple inner ring with translucent outer arcs (decoration)
   * - ink: solid white — used on top of the brand-purple background
   */
  variant?: "primary" | "soft" | "ink";
  /**
   * Skip the role/aria-label so AT doesn't announce the mark. Use for hidden
   * responsive variants (e.g. only one of three sizes is visible at a time)
   * and for purely decorative usages where the surrounding heading already
   * conveys the brand.
   */
  decorative?: boolean;
}

export function ArcMark({
  size = 56,
  className = "",
  variant = "primary",
  decorative = false,
}: ArcMarkProps) {
  const inner = variant === "ink" ? "#ffffff" : "#4e14d0";
  const outer =
    variant === "ink"
      ? "#ffffff"
      : variant === "soft"
        ? "rgba(78, 20, 208, 0.45)"
        : "#4e14d0";
  const stroke = size * 0.115;
  return (
    <svg
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "Panoptic arc mark"}
      aria-hidden={decorative ? true : undefined}
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
