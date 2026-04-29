const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const POINTS_FORMAT: Intl.NumberFormatOptions = {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
};

export function formatPoints(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", POINTS_FORMAT);
}

export function formatMultiplier(n: number): string {
  if (!Number.isFinite(n)) return "—×";
  return `${n.toFixed(2)}×`;
}

export function formatSignedPoints(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n > 0) return `+${formatPoints(n)}`;
  if (n < 0) return `−${formatPoints(Math.abs(n))}`;
  return "0";
}

export function formatDateRange(start: string, end: string): string {
  if (!ISO_DATE.test(start) || !ISO_DATE.test(end)) return "—";
  return `${start} → ${end}`;
}

export function formatUsd(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 10_000) return `$${(n / 1_000).toFixed(0)}k`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function formatHours(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return Number.isInteger(n) ? `${n}h` : `${n.toFixed(1)}h`;
}

export function formatPercent(ratio: number): string {
  if (!Number.isFinite(ratio)) return "—";
  return `${Math.round(ratio * 100)}%`;
}
