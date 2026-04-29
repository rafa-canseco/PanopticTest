import {
  formatHours,
  formatMultiplier,
  formatPercent,
  formatPoints,
  formatShortDate,
  formatStrategy,
  formatUsd,
} from "@/lib/format";
import type { EnrichedActivity } from "@/lib/types";

interface ActivityLogProps {
  userName: string;
  activities: EnrichedActivity[];
}

const MULT_EPS = 1e-6;

function multiplierClass(m: number): string {
  if (!Number.isFinite(m)) return "text-amber-400";
  if (m > 1 + MULT_EPS) return "text-success";
  if (m < 1 - MULT_EPS) return "text-rose-400";
  return "text-muted";
}

export function ActivityLog({ userName, activities }: ActivityLogProps) {
  const sorted = [...activities].sort((a, b) =>
    a.points.activity.date.localeCompare(b.points.activity.date),
  );

  return (
    <details className="group border border-line bg-surface">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-6 py-4 transition-colors hover:bg-elevated/40 [&::-webkit-details-marker]:hidden">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
            Detail · Full activity log
          </div>
          <div className="mt-1 text-sm font-bold text-ink">
            {userName}
            <span className="text-muted"> · all {activities.length} simulated rows</span>
          </div>
        </div>
        <span
          aria-hidden
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted transition-transform group-open:rotate-180"
        >
          ▾
        </span>
      </summary>
      <div className="border-t border-line">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">
              All simulated activity rows for {userName}, in chronological order. Includes
              capital, hours, useful ratio, all three multipliers, and the resulting final
              points.
            </caption>
            <thead className="bg-elevated/30 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
              <tr className="border-b border-line">
                <th scope="col" className="px-4 py-3 text-left font-medium">Date</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Strategy</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Cat</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Capital</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Hours</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Useful</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Q ×</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">C ×</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Ch ×</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Final</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {sorted.map(({ points, qualityMultiplier, campaignMultiplier, churnMultiplier }) => {
                const a = points.activity;
                return (
                  <tr key={a.id} className="transition-colors hover:bg-elevated/40">
                    <td className="px-4 py-3 font-mono text-xs text-foreground">
                      {formatShortDate(a.date)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-baseline gap-1.5">
                        <span className="text-xs font-medium text-foreground">
                          {formatStrategy(a.strategy)}
                        </span>
                        {a.isShortLived ? (
                          <span className="border border-rose-400/30 bg-rose-400/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-rose-200">
                            short-lived
                          </span>
                        ) : null}
                        {a.isVaultManagedRebalance ? (
                          <span className="border border-brand/40 bg-brand-soft px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-brand-light">
                            rebalance
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          "border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] " +
                          (a.category === "vault"
                            ? "border-brand/40 bg-brand-soft text-brand-light"
                            : "border-amber-400/30 bg-amber-400/10 text-amber-200")
                        }
                      >
                        {a.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-foreground">
                      {formatUsd(a.usdCapital)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-foreground">
                      {formatHours(a.activeHours)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-foreground">
                      {formatPercent(a.usefulRatio)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-mono tabular-nums ${multiplierClass(qualityMultiplier)}`}
                    >
                      {formatMultiplier(qualityMultiplier)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-mono tabular-nums ${multiplierClass(campaignMultiplier)}`}
                    >
                      {formatMultiplier(campaignMultiplier)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-mono tabular-nums ${multiplierClass(churnMultiplier)}`}
                    >
                      {formatMultiplier(churnMultiplier)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums text-ink">
                      {formatPoints(points.breakdown.finalPoints)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </details>
  );
}
