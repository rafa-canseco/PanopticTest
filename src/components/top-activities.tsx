import { formatHours, formatPoints, formatUsd } from "@/lib/format";
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
              <li
                key={a.id}
                className="flex items-baseline gap-4 px-6 py-4 sm:gap-6"
              >
                <span
                  className="font-mono text-base font-bold tabular-nums text-line"
                  aria-hidden
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-sm font-medium text-ink">{a.strategy}</span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                      {a.date}
                    </span>
                  </div>
                  <div className="mt-1 font-mono text-[11px] tabular-nums text-muted">
                    {formatUsd(a.usdCapital)} · {formatHours(a.activeHours)} ·{" "}
                    {Math.round(a.usefulRatio * 100)}% useful
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold tabular-nums tracking-[-0.02em] text-ink sm:text-2xl">
                    {formatPoints(final)}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                    points
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
