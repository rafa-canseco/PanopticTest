import type { ReactNode } from "react";

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

interface TipProps {
  children: ReactNode;
  label: string;
}

/**
 * Inline value with a hoverable tooltip explaining what it is.
 * Dotted underline acts as the affordance; the native title attribute
 * provides a fallback for keyboard / screen-reader users on platforms
 * where the visual tooltip can't render.
 */
function Tip({ children, label }: TipProps) {
  return (
    <span className="group relative inline-block" title={label}>
      <span
        tabIndex={0}
        className="cursor-help border-b border-dotted border-muted/50 pb-px focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-light"
      >
        {children}
      </span>
      <span
        role="tooltip"
        className="pointer-events-none invisible absolute bottom-full left-1/2 z-30 mb-2 w-max max-w-[260px] -translate-x-1/2 border border-brand/40 bg-surface px-3 py-2 text-left text-xs font-normal normal-case leading-snug tracking-normal text-foreground opacity-0 shadow-[0_12px_32px_rgba(0,0,0,0.55)] transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}

interface MultiplierTagProps {
  label: string;
  value: number;
  tip: string;
}

function MultiplierTag({ label, value, tip }: MultiplierTagProps) {
  return (
    <Tip label={tip}>
      <span className="inline-flex items-baseline gap-1 font-mono text-[11px] tabular-nums">
        <span className="text-muted">{label}</span>
        <span className={multiplierClass(value)}>{formatMultiplier(value)}</span>
      </span>
    </Tip>
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
        <p className="mt-2 text-xs text-muted">
          Hover any underlined value below to see what it means.
        </p>
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
                    <Tip label="Final points earned by this row after Quality, Campaign, and Churn multipliers were applied to the row's USD-days.">
                      <span className="text-xl font-bold tabular-nums tracking-[-0.02em] text-ink">
                        {formatPoints(final)}
                      </span>
                    </Tip>
                    <span className="ml-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                      pts
                    </span>
                  </div>
                </div>

                {/* Inputs — each underlined value has a tooltip */}
                <p className="mt-1.5 font-mono text-xs tabular-nums text-muted">
                  <Tip label="USD capital committed for this row — the principal in the vault deposit or the notional size of the direct position.">
                    <span className="text-foreground">{formatUsd(a.usdCapital)}</span>
                  </Tip>
                  {" · "}
                  <Tip label="Hours the capital was active during the day. 24h = active the whole day; lower means the capital was idle most of the time.">
                    <span className="text-foreground">{formatHours(a.activeHours)}</span>
                  </Tip>
                  {" · "}
                  <Tip label="Useful ratio — the fraction of active time that was productive (in-range, fee-generating, balancing market demand). Drives the Quality multiplier.">
                    <span className="text-foreground">
                      {formatPercent(a.usefulRatio)} useful
                    </span>
                  </Tip>
                </p>

                {/* Multipliers + engine flags */}
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <MultiplierTag
                    label="Q"
                    value={qualityMultiplier}
                    tip="Quality multiplier — set by the useful ratio. Bands: under 0.40 → 0.50×, 0.40 to 0.70 → 1.00×, 0.70 to 0.90 → 1.25×, 0.90 or more → 1.50×."
                  />
                  <span className="text-line">·</span>
                  <MultiplierTag
                    label="C"
                    value={campaignMultiplier}
                    tip="Campaign multiplier — 1.00× by default, 1.20× or 1.30× when this row qualifies. To qualify the row needs an in-window date AND an eligible strategy AND at least 12h active."
                  />
                  <span className="text-line">·</span>
                  <MultiplierTag
                    label="Ch"
                    value={churnMultiplier}
                    tip="Churn multiplier — 0.25× when the row is short-lived (farming protection: only 25% counts), 1.00× otherwise. Vault-managed rebalances are exempt."
                  />
                  {a.isShortLived ? (
                    <Tip label="Engine flag — this row is treated as short-lived activity, which triggers the 0.25× churn multiplier unless it's also a vault-managed rebalance.">
                      <span className="ml-auto border border-rose-400/30 bg-rose-400/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-rose-200">
                        short-lived
                      </span>
                    </Tip>
                  ) : null}
                  {a.isVaultManagedRebalance ? (
                    <Tip label="Engine flag — this row is a vault-managed rebalance (legitimate strategy maintenance, e.g. gamma scalping). Exempt from the churn discount even when short-lived.">
                      <span className="border border-brand/40 bg-brand-soft px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-brand-light">
                        rebalance
                      </span>
                    </Tip>
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
