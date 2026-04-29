import { formatPoints } from "@/lib/format";
import type { UserPointsSummary } from "@/lib/types";

interface MyPointsCardProps {
  summary: UserPointsSummary;
}

export function MyPointsCard({ summary }: MyPointsCardProps) {
  return (
    <section
      className="relative overflow-hidden border border-line bg-surface p-6 sm:p-8"
      aria-label={`${summary.user.name} points`}
    >
      {/* Brand-purple rail */}
      <div
        aria-hidden
        className="absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-brand-light via-brand to-brand-light"
      />
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
        My points
      </div>
      <div className="mt-3 text-5xl font-bold leading-none tracking-[-0.04em] tabular-nums text-ink sm:text-6xl">
        {formatPoints(summary.totalPoints)}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-6 sm:max-w-xs">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            Vault
          </div>
          <div className="mt-1 font-mono text-base tabular-nums text-foreground">
            {formatPoints(summary.vaultPoints)}
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            Trader
          </div>
          <div className="mt-1 font-mono text-base tabular-nums text-foreground">
            {formatPoints(summary.traderPoints)}
          </div>
        </div>
      </div>
    </section>
  );
}
