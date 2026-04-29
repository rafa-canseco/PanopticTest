import { formatPoints } from "@/lib/format";
import type { UserPointsSummary } from "@/lib/types";

interface LeaderboardProps {
  ranked: UserPointsSummary[];
  selectedUserId: string;
  onSelect: (userId: string) => void;
}

export function Leaderboard({ ranked, selectedUserId, onSelect }: LeaderboardProps) {
  return (
    <div className="rounded-lg border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="text-sm font-bold text-ink">Leaderboard</h2>
        <span className="text-xs text-muted" aria-hidden>
          click or press Enter to inspect
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">
            Users ranked by total points. Activate a row to inspect that user.
          </caption>
          <thead className="text-xs uppercase tracking-wide text-muted">
            <tr className="border-b border-line">
              <th scope="col" className="px-4 py-2 text-left font-medium">Rank</th>
              <th scope="col" className="px-4 py-2 text-left font-medium">User</th>
              <th scope="col" className="px-4 py-2 text-right font-medium">Vault</th>
              <th scope="col" className="px-4 py-2 text-right font-medium">Trader</th>
              <th scope="col" className="px-4 py-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((s, i) => {
              const selected = s.user.id === selectedUserId;
              const handleActivate = () => onSelect(s.user.id);
              return (
                <tr
                  key={s.user.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selected}
                  aria-label={`Inspect ${s.user.name}`}
                  onClick={handleActivate}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleActivate();
                    }
                  }}
                  className={
                    "cursor-pointer border-b border-line transition-colors last:border-b-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-light " +
                    (selected
                      ? "bg-elevated"
                      : "hover:bg-elevated/60")
                  }
                >
                  <td className="px-4 py-2 tabular-nums text-muted">{i + 1}</td>
                  <td className="px-4 py-2 font-medium text-ink">{s.user.name}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-foreground">
                    {formatPoints(s.vaultPoints)}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums text-foreground">
                    {formatPoints(s.traderPoints)}
                  </td>
                  <td className="px-4 py-2 text-right font-bold tabular-nums text-ink">
                    {formatPoints(s.totalPoints)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
