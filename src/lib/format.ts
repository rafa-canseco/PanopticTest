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
