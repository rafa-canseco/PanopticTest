import { formatPoints } from "@/lib/format";
import type { UserPointsSummary } from "@/lib/types";

interface StandingCardProps {
  summary: UserPointsSummary;
  ranked: UserPointsSummary[];
}

export function StandingCard({ summary, ranked }: StandingCardProps) {
  const rank = ranked.findIndex((r) => r.user.id === summary.user.id) + 1;
  const total = ranked.length;
  const above = rank > 1 ? ranked[rank - 2] : null;
  const below = rank < total ? ranked[rank] : null;

  return (
    <section
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
      <div className="mt-5 space-y-2 text-sm">
        {above ? (
          <div className="flex items-baseline justify-between gap-3 border-t border-line pt-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              {formatPoints(above.totalPoints - summary.totalPoints)} behind
            </span>
            <span className="font-medium text-foreground">{above.user.name}</span>
          </div>
        ) : null}
        {below ? (
          <div className="flex items-baseline justify-between gap-3 border-t border-line pt-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-success">
              {formatPoints(summary.totalPoints - below.totalPoints)} ahead of
            </span>
            <span className="font-medium text-foreground">{below.user.name}</span>
          </div>
        ) : null}
        {!above && !below ? (
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
            sole user in this season
          </div>
        ) : null}
      </div>
    </section>
  );
}
