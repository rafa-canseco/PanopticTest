import {
  formatHours,
  formatMultiplier,
  formatPercent,
  formatPoints,
  formatUsd,
} from "@/lib/format";
import type { ActivityPoints } from "@/lib/types";

export interface EnrichedActivity {
  points: ActivityPoints;
  qualityMultiplier: number;
  campaignMultiplier: number;
  churnMultiplier: number;
}

interface ActivityTableProps {
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

export function ActivityTable({ userName, activities }: ActivityTableProps) {
  return (
    <div className="rounded-lg border border-line bg-surface">
      <div className="border-b border-line px-4 py-3">
        <h2 className="text-sm font-bold text-ink">
          {userName} — activity ({activities.length} rows)
        </h2>
        <p className="mt-0.5 text-xs text-muted">
          Capital × Hours/24 = USD-days, then through Quality × Campaign × Churn = Final.
        </p>
      </div>
      {activities.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted">
          No activity rows for this user in the season window.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">
              Per-activity breakdown for {userName}, sorted by date ascending.
            </caption>
            <thead className="text-xs uppercase tracking-wide text-muted">
              <tr className="border-b border-line">
                <th scope="col" className="px-3 py-2 text-left font-medium">Date</th>
                <th scope="col" className="px-3 py-2 text-left font-medium">Strategy</th>
                <th scope="col" className="px-3 py-2 text-left font-medium">Cat</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Capital</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Hours</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Useful</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">USD-days</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Quality ×</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Campaign ×</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Churn ×</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Final</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {activities.map(({ points, qualityMultiplier, campaignMultiplier, churnMultiplier }) => {
                const a = points.activity;
                return (
                  <tr key={a.id} className="hover:bg-elevated/60">
                    <td className="px-3 py-2 font-mono text-xs text-foreground">{a.date}</td>
                    <td className="px-3 py-2 font-mono text-xs text-foreground">{a.strategy}</td>
                    <td className="px-3 py-2">
                      <span
                        className={
                          "rounded px-1.5 py-0.5 text-[11px] font-medium " +
                          (a.category === "vault"
                            ? "bg-brand-soft text-brand-light"
                            : "bg-amber-900/40 text-amber-200")
                        }
                      >
                        {a.category}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">
                      {formatUsd(a.usdCapital)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">
                      {formatHours(a.activeHours)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-foreground">
                      {formatPercent(a.usefulRatio)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-muted">
                      {formatPoints(points.breakdown.basePoints)}
                    </td>
                    <td
                      className={`px-3 py-2 text-right tabular-nums ${multiplierClass(qualityMultiplier)}`}
                    >
                      {formatMultiplier(qualityMultiplier)}
                    </td>
                    <td
                      className={`px-3 py-2 text-right tabular-nums ${multiplierClass(campaignMultiplier)}`}
                    >
                      {formatMultiplier(campaignMultiplier)}
                    </td>
                    <td
                      className={`px-3 py-2 text-right tabular-nums ${multiplierClass(churnMultiplier)}`}
                    >
                      {formatMultiplier(churnMultiplier)}
                    </td>
                    <td className="px-3 py-2 text-right font-bold tabular-nums text-ink">
                      {formatPoints(points.breakdown.finalPoints)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
