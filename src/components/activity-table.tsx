import { formatMultiplier, formatPoints } from "@/lib/format";
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

function multiplierClass(m: number): string {
  if (m > 1) return "text-emerald-700 dark:text-emerald-400";
  if (m < 1) return "text-rose-700 dark:text-rose-400";
  return "text-zinc-500 dark:text-zinc-500";
}

export function ActivityTable({ userName, activities }: ActivityTableProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
          {userName} — activity ({activities.length} rows)
        </h2>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          Per-row multipliers and final points after the full Quality × Campaign × Churn chain.
        </p>
      </div>
      {activities.length === 0 ? (
        <p className="px-4 py-6 text-sm text-zinc-500 dark:text-zinc-400">No activity rows.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-3 py-2 text-left font-medium">Date</th>
                <th className="px-3 py-2 text-left font-medium">Strategy</th>
                <th className="px-3 py-2 text-left font-medium">Category</th>
                <th className="px-3 py-2 text-right font-medium">USD-days</th>
                <th className="px-3 py-2 text-right font-medium">Quality ×</th>
                <th className="px-3 py-2 text-right font-medium">Campaign ×</th>
                <th className="px-3 py-2 text-right font-medium">Churn ×</th>
                <th className="px-3 py-2 text-right font-medium">Final</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {activities.map(({ points, qualityMultiplier, campaignMultiplier, churnMultiplier }) => {
                const a = points.activity;
                return (
                  <tr key={a.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="px-3 py-2 font-mono text-xs text-zinc-700 dark:text-zinc-300">
                      {a.date}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-zinc-700 dark:text-zinc-300">
                      {a.strategy}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={
                          "rounded px-1.5 py-0.5 text-[11px] font-medium " +
                          (a.category === "vault"
                            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300")
                        }
                      >
                        {a.category}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-zinc-900 dark:text-zinc-100">
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
                    <td className="px-3 py-2 text-right font-semibold tabular-nums text-zinc-950 dark:text-zinc-50">
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
