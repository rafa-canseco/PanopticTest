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
  const sign = n < 0 ? "−" : "";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 10_000) return `${sign}$${(abs / 1_000).toFixed(0)}k`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}k`;
  return `${sign}$${abs.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function formatHours(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return Number.isInteger(n) ? `${n}h` : `${n.toFixed(1)}h`;
}

export function formatPercent(ratio: number): string {
  if (!Number.isFinite(ratio)) return "—";
  // Floor instead of round so a value like 0.899 doesn't display as "90%"
  // and falsely promote it to the next visible Quality band.
  return `${Math.floor(ratio * 100)}%`;
}

const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatShortDate(iso: string): string {
  if (!ISO_DATE.test(iso)) return "—";
  const [, monthStr, dayStr] = iso.split("-");
  const monthIdx = Number(monthStr) - 1;
  const day = Number(dayStr);
  if (monthIdx < 0 || monthIdx > 11) return "—";
  if (day < 1 || day > 31) return "—";
  return `${SHORT_MONTHS[monthIdx]} ${day}`;
}

const STRATEGY_LABELS: Record<string, string> = {
  "lending-vault": "Lending Vault",
  "covered-call-vault": "Covered Call Vault",
  "gamma-scalping-vault": "Gamma Scalping Vault",
  "long-vol": "Long Volatility",
  "short-vol": "Short Volatility",
  directional: "Directional",
};

export function formatStrategy(strategy: string): string {
  return STRATEGY_LABELS[strategy] ?? strategy;
}
