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

interface MultiplierTagProps {
  label: string;
  value: number;
}

function MultiplierTag({ label, value }: MultiplierTagProps) {
  return (
    <span className="inline-flex items-baseline gap-1 font-mono text-[11px] tabular-nums">
      <span className="text-muted">{label}</span>
      <span className={multiplierClass(value)}>{formatMultiplier(value)}</span>
    </span>
  );
}

export function ActivityLog({ userName, activities }: ActivityLogProps) {
  const sorted = [...activities].sort((a, b) =>
    a.points.activity.date.localeCompare(b.points.activity.date),
  );

  return (
    <section
      data-tour="top-activities"
      className="border border-line bg-surface"
      aria-labelledby="activity-log-heading"
    >
      <header className="border-b border-line px-6 py-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
          Where points came from
        </div>
        <h2
          id="activity-log-heading"
          className="mt-1 text-lg font-bold tracking-tight text-ink"
        >
          {userName}
          <span className="text-muted"> · {activities.length} rows</span>
        </h2>
      </header>

      {sorted.length === 0 ? (
        <p className="px-6 py-8 text-sm text-muted">No activity rows for this user.</p>
      ) : (
        <ol className="divide-y divide-line">
          {sorted.map(({ points, qualityMultiplier, campaignMultiplier, churnMultiplier }) => {
            const a = points.activity;
            const final = points.breakdown.finalPoints;
            return (
              <li key={a.id} className="px-6 py-4">
                {/* Top row: date + strategy + cat | final */}
                <div className="flex items-baseline justify-between gap-4">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 min-w-0">
                    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted shrink-0">
                      {formatShortDate(a.date)}
                    </span>
                    <span className="text-line shrink-0">·</span>
                    <h3 className="text-base font-bold text-ink truncate">
                      {formatStrategy(a.strategy)}
                    </h3>
                    <span
                      className={
                        "shrink-0 border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] " +
                        (a.category === "vault"
                          ? "border-brand/40 bg-brand-soft text-brand-light"
                          : "border-amber-400/30 bg-amber-400/10 text-amber-200")
                      }
                    >
                      {a.category}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xl font-bold tabular-nums tracking-[-0.02em] text-ink">
                      {formatPoints(final)}
                    </span>
                    <span className="ml-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                      pts
                    </span>
                  </div>
                </div>

                {/* Inputs */}
                <p className="mt-1.5 font-mono text-xs tabular-nums text-muted">
                  {formatUsd(a.usdCapital)} · {formatHours(a.activeHours)} ·{" "}
                  {formatPercent(a.usefulRatio)} useful
                </p>

                {/* Multipliers + engine flags */}
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <MultiplierTag label="Q" value={qualityMultiplier} />
                  <span className="text-line">·</span>
                  <MultiplierTag label="C" value={campaignMultiplier} />
                  <span className="text-line">·</span>
                  <MultiplierTag label="Ch" value={churnMultiplier} />
                  {a.isShortLived ? (
                    <span className="ml-auto border border-rose-400/30 bg-rose-400/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-rose-200">
                      short-lived
                    </span>
                  ) : null}
                  {a.isVaultManagedRebalance ? (
                    <span className="border border-brand/40 bg-brand-soft px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-brand-light">
                      rebalance
                    </span>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
