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
    <section className="border border-line bg-surface" aria-labelledby="activity-heading">
      <header className="border-b border-line px-6 py-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
          Section · Activity log
        </div>
        <h2 id="activity-heading" className="mt-1 text-lg font-bold tracking-tight text-ink">
          {userName}
          <span className="text-muted"> / {activities.length} rows</span>
        </h2>
        <p className="mt-2 text-sm text-muted">
          Capital × Hours/24 = USD-days, then through Quality × Campaign × Churn = Final.
        </p>
      </header>
      {activities.length === 0 ? (
        <p className="px-6 py-8 text-sm text-muted">
          No activity rows for this user in the season window.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">
              Per-activity breakdown for {userName}, sorted by date ascending.
            </caption>
            <thead className="bg-elevated/30 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
              <tr className="border-b border-line">
                <th scope="col" className="px-4 py-3 text-left font-medium">Date</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Strategy</th>
                <th scope="col" className="px-4 py-3 text-left font-medium">Cat</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Capital</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Hours</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Useful</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">USD-days</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Q ×</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">C ×</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Ch ×</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Final</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {activities.map(({ points, qualityMultiplier, campaignMultiplier, churnMultiplier }) => {
                const a = points.activity;
                return (
                  <tr key={a.id} className="transition-colors hover:bg-elevated/40">
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{a.date}</td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{a.strategy}</td>
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
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-muted">
                      {formatPoints(points.breakdown.basePoints)}
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
      )}
    </section>
  );
}
