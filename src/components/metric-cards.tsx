import { formatPoints } from "@/lib/format";

interface Metric {
  label: string;
  value: string;
  hint?: string;
}

interface MetricCardsProps {
  totalPoints: number;
  vaultPoints: number;
  traderPoints: number;
  activeCampaigns: number;
}

export function MetricCards({
  totalPoints,
  vaultPoints,
  traderPoints,
  activeCampaigns,
}: MetricCardsProps) {
  const metrics: Metric[] = [
    { label: "Total Points", value: formatPoints(totalPoints), hint: "All users, season-to-date" },
    { label: "Vault Points", value: formatPoints(vaultPoints), hint: "Strategy-vault deposits" },
    { label: "Trader Points", value: formatPoints(traderPoints), hint: "Direct positions" },
    {
      label: "Active Campaigns",
      value: activeCampaigns.toString(),
      hint: "Configured this season",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {m.label}
          </div>
          <div className="mt-2 text-2xl font-semibold tabular-nums text-zinc-950 dark:text-zinc-50">
            {m.value}
          </div>
          {m.hint ? (
            <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">{m.hint}</div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
