import {
  formatHours,
  formatPercent,
  formatPoints,
  formatShortDate,
  formatStrategy,
  formatUsd,
} from "@/lib/format";
import type { EnrichedActivity } from "@/lib/types";

interface TopActivitiesProps {
  activities: EnrichedActivity[];
  limit?: number;
}

export function TopActivities({ activities, limit = 5 }: TopActivitiesProps) {
  const top = [...activities]
    .sort((a, b) => b.points.breakdown.finalPoints - a.points.breakdown.finalPoints)
    .slice(0, limit);

  return (
    <section
      data-tour="top-activities"
      className="border border-line bg-surface"
      aria-labelledby="top-activities-heading"
    >
      <header className="border-b border-line px-6 py-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
          Where points came from
        </div>
        <h2
          id="top-activities-heading"
          className="mt-1 text-lg font-bold tracking-tight text-ink"
        >
          Top contributing activities
        </h2>
      </header>
      {top.length === 0 ? (
        <p className="px-6 py-8 text-sm text-muted">No activity rows for this user.</p>
      ) : (
        <ol className="divide-y divide-line">
          {top.map((entry, i) => {
            const a = entry.points.activity;
            const final = entry.points.breakdown.finalPoints;
            return (
              <li key={a.id} className="px-6 py-4">
                <div className="flex items-baseline justify-between gap-4">
                  <div className="flex items-baseline gap-3 min-w-0">
                    <span
                      className="font-mono text-sm font-bold tabular-nums text-line"
                      aria-hidden
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-base font-bold text-ink truncate">
                      {formatStrategy(a.strategy)}
                    </h3>
                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted shrink-0">
                      {formatShortDate(a.date)}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xl font-bold tabular-nums tracking-[-0.02em] text-ink sm:text-2xl">
                      {formatPoints(final)}
                    </span>
                    <span className="ml-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                      pts
                    </span>
                  </div>
                </div>
                <p className="mt-1.5 ml-9 font-mono text-xs tabular-nums text-muted">
                  {formatUsd(a.usdCapital)} · {formatHours(a.activeHours)} ·{" "}
                  {formatPercent(a.usefulRatio)} useful
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
