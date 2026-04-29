import { formatPoints } from "@/lib/format";
import type { UserPointsSummary } from "@/lib/types";

interface LeaderboardProps {
  ranked: UserPointsSummary[];
  selectedUserId: string;
  onSelect: (userId: string) => void;
}

export function Leaderboard({ ranked, selectedUserId, onSelect }: LeaderboardProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Leaderboard</h2>
        <span className="text-xs text-zinc-500" aria-hidden>
          click or press Enter to inspect
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">
            Users ranked by total points. Activate a row to inspect that user.
          </caption>
          <thead className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th scope="col" className="px-4 py-2 text-left font-medium">
                Rank
              </th>
              <th scope="col" className="px-4 py-2 text-left font-medium">
                User
              </th>
              <th scope="col" className="px-4 py-2 text-right font-medium">
                Vault
              </th>
              <th scope="col" className="px-4 py-2 text-right font-medium">
                Trader
              </th>
              <th scope="col" className="px-4 py-2 text-right font-medium">
                Total
              </th>
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
                    "cursor-pointer border-b border-zinc-100 transition-colors last:border-b-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 dark:border-zinc-800 " +
                    (selected
                      ? "bg-zinc-100 dark:bg-zinc-800"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50")
                  }
                >
                  <td className="px-4 py-2 text-zinc-500 tabular-nums">{i + 1}</td>
                  <td className="px-4 py-2 font-medium text-zinc-950 dark:text-zinc-50">
                    {s.user.name}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    {formatPoints(s.vaultPoints)}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    {formatPoints(s.traderPoints)}
                  </td>
                  <td className="px-4 py-2 text-right font-semibold tabular-nums text-zinc-950 dark:text-zinc-50">
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
