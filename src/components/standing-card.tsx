import type { UserPointsSummary } from "@/lib/types";

interface StandingCardProps {
  summary: UserPointsSummary;
  ranked: UserPointsSummary[];
}

export function StandingCard({ summary, ranked }: StandingCardProps) {
  const rank = ranked.findIndex((r) => r.user.id === summary.user.id) + 1;
  const total = ranked.length;

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
    </section>
  );
}
