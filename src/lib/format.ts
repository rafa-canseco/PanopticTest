export function formatPoints(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return Math.abs(n) >= 1000
    ? n.toLocaleString("en-US", { maximumFractionDigits: 0 })
    : n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function formatMultiplier(n: number): string {
  return `${n.toFixed(2)}×`;
}

export function formatSignedPoints(n: number): string {
  if (n > 0) return `+${formatPoints(n)}`;
  if (n < 0) return `−${formatPoints(Math.abs(n))}`;
  return "0";
}

export function formatDateRange(start: string, end: string): string {
  return `${start} → ${end}`;
}
