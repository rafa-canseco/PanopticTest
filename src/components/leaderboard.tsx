import { formatPoints } from "@/lib/format";
import type { UserPointsSummary } from "@/lib/types";

interface LeaderboardProps {
  ranked: UserPointsSummary[];
  selectedUserId: string;
  onSelect: (userId: string) => void;
}

function categoryNote(s: UserPointsSummary): string {
  if (s.vaultPoints > 0 && s.traderPoints > 0) return "vault + trader";
  if (s.vaultPoints > 0) return "vault only";
  if (s.traderPoints > 0) return "trader only";
  return "no activity";
}

export function Leaderboard({ ranked, selectedUserId, onSelect }: LeaderboardProps) {
  return (
    <section
      className="border border-line bg-surface"
      aria-labelledby="leaderboard-heading"
    >
      <header className="flex items-baseline justify-between gap-3 border-b border-line px-6 py-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
            Section · Leaderboard
          </div>
          <h2
            id="leaderboard-heading"
            className="mt-1 text-lg font-bold tracking-tight text-ink"
          >
            Ranked by total points
          </h2>
        </div>
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-muted sm:block">
          ↵ activate to inspect
        </span>
      </header>

      <ul className="divide-y divide-line">
        {ranked.map((s, i) => {
          const selected = s.user.id === selectedUserId;
          const handleActivate = () => onSelect(s.user.id);
          const rank = String(i + 1).padStart(2, "0");
          return (
            <li key={s.user.id}>
              <button
                type="button"
                onClick={handleActivate}
                aria-pressed={selected}
                aria-label={`Inspect ${s.user.name}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleActivate();
                  }
                }}
                className={
                  "group relative flex w-full items-center gap-4 px-6 py-5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-light sm:gap-6 sm:py-6 " +
                  (selected ? "bg-elevated" : "hover:bg-elevated/50")
                }
              >
                {selected ? (
                  <span
                    aria-hidden
                    className="absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-brand-light via-brand to-brand-light"
                  />
                ) : null}

                {/* Rank — display numeric */}
                <span
                  className={
                    "font-mono text-2xl font-bold tabular-nums leading-none sm:text-3xl " +
                    (selected ? "text-brand-light" : "text-line")
                  }
                  aria-hidden
                >
                  {rank}
                </span>

                {/* Name + segment label */}
                <div className="min-w-0 flex-1">
                  <div className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
                    {s.user.name}
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                    {categoryNote(s)}
                  </div>
                </div>

                {/* Vault / trader split — hide on mobile */}
                <div className="hidden text-right md:block">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                    Vault · Trader
                  </div>
                  <div className="mt-0.5 font-mono text-sm tabular-nums text-foreground">
                    {formatPoints(s.vaultPoints)}{" "}
                    <span className="text-line">·</span>{" "}
                    {formatPoints(s.traderPoints)}
                  </div>
                </div>

                {/* Total — display number */}
                <div className="min-w-[110px] text-right sm:min-w-[160px]">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                    Total
                  </div>
                  <div className="mt-0.5 text-2xl font-bold tabular-nums leading-none tracking-[-0.025em] text-ink sm:text-3xl">
                    {formatPoints(s.totalPoints)}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
