import { formatPoints } from "@/lib/format";
import type { UserPointsSummary } from "@/lib/types";

interface StandingCardProps {
  summary: UserPointsSummary;
  ranked: UserPointsSummary[];
}

export function StandingCard({ summary, ranked }: StandingCardProps) {
  const rank = ranked.findIndex((r) => r.user.id === summary.user.id) + 1;
  const total = ranked.length;
  const { breakdown } = summary;
  const hasActivity = breakdown.preChurnPoints > 0;
  const countedRate = hasActivity ? breakdown.finalPoints / breakdown.preChurnPoints : 0;
  const countedPct = Math.round(countedRate * 100);

  return (
    <section
      data-tour="my-standing"
      className="border border-line bg-surface p-6 sm:p-8"
      aria-label={`${summary.user.name} standing`}
    >
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
        My standing
      </div>
      <div className="mt-3 flex items-baseline gap-3">
        <span className="text-5xl font-bold leading-none tracking-[-0.04em] tabular-nums text-ink sm:text-6xl">
          #{rank}
        </span>
        <span className="font-mono text-sm uppercase tracking-[0.18em] text-muted">
          of {total}
        </span>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-4">
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            Activity volume
          </dt>
          <dd className="mt-1 flex items-baseline gap-1 font-mono tabular-nums">
            <span className="text-base font-bold text-foreground">
              {formatPoints(breakdown.basePoints)}
            </span>
            <span className="text-[10px] text-muted">USD-days</span>
          </dd>
          <p className="mt-1 font-mono text-[11px] text-muted">capital × hours / 24</p>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            Counted rate
          </dt>
          <dd
            className={
              "mt-1 font-mono text-base font-bold tabular-nums " +
              (!hasActivity
                ? "text-muted"
                : countedPct === 100
                  ? "text-success"
                  : "text-rose-300")
            }
          >
            {hasActivity ? `${countedPct}%` : "—"}
          </dd>
          <p className="mt-1 text-[11px] text-muted">
            {!hasActivity
              ? "no activity to evaluate"
              : countedPct === 100
                ? "all rows passed churn check"
                : "rest discounted as short-lived churn"}
          </p>
        </div>
      </dl>
    </section>
  );
}
