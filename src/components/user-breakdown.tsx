import { formatPoints, formatSignedPoints } from "@/lib/format";
import type { UserPointsSummary } from "@/lib/types";

interface UserBreakdownProps {
  summary: UserPointsSummary;
}

interface Row {
  label: string;
  value: string;
  numeric: number;
  isTotal?: boolean;
  // forces the "negative" red color regardless of sign — used for the
  // churn-discount line, which is naturally a positive magnitude but
  // semantically a deduction.
  forceNegative?: boolean;
}

function valueClassName(row: Row): string {
  if (row.isTotal) return "text-base font-semibold text-zinc-950 dark:text-zinc-50";
  const negative = row.forceNegative || row.numeric < 0;
  if (negative) return "text-sm text-rose-600 dark:text-rose-400";
  if (row.numeric > 0) return "text-sm text-emerald-600 dark:text-emerald-400";
  return "text-sm text-zinc-900 dark:text-zinc-100";
}

export function UserBreakdown({ summary }: UserBreakdownProps) {
  const { breakdown } = summary;
  const rows: Row[] = [
    { label: "Base points", value: formatPoints(breakdown.basePoints), numeric: breakdown.basePoints },
    {
      label: "Quality uplift",
      value: formatSignedPoints(breakdown.qualityUplift),
      numeric: breakdown.qualityUplift,
    },
    {
      label: "Campaign uplift",
      value: formatSignedPoints(breakdown.campaignUplift),
      numeric: breakdown.campaignUplift,
    },
    {
      label: "Pre-churn",
      value: formatPoints(breakdown.preChurnPoints),
      numeric: breakdown.preChurnPoints,
    },
    {
      label: "Churn discount",
      // Render based on magnitude, not sign: the engine produces a non-negative
      // discount today, but the UI semantics are always "this is a deduction
      // from preChurnPoints" regardless of whether a future engine change
      // signs it differently.
      value:
        breakdown.churnDiscount !== 0
          ? `−${formatPoints(Math.abs(breakdown.churnDiscount))}`
          : "0",
      numeric: -Math.abs(breakdown.churnDiscount),
      forceNegative: breakdown.churnDiscount !== 0,
    },
    {
      label: "Final points",
      value: formatPoints(breakdown.finalPoints),
      numeric: breakdown.finalPoints,
      isTotal: true,
    },
  ];

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
          {summary.user.name} — breakdown
        </h2>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          Vault {formatPoints(summary.vaultPoints)} · Trader {formatPoints(summary.traderPoints)}
        </p>
      </div>
      <dl className="divide-y divide-zinc-100 px-4 dark:divide-zinc-800">
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline justify-between py-2.5">
            <dt
              className={
                r.isTotal
                  ? "text-sm font-semibold text-zinc-950 dark:text-zinc-50"
                  : "text-sm text-zinc-600 dark:text-zinc-400"
              }
            >
              {r.label}
            </dt>
            <dd className={`tabular-nums ${valueClassName(r)}`}>{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
