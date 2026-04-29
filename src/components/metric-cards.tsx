import { formatPoints } from "@/lib/format";

interface Metric {
  index: string;
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
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
    {
      index: "01",
      label: "Total points",
      value: formatPoints(totalPoints),
      hint: "All users · season-to-date",
      accent: true,
    },
    {
      index: "02",
      label: "Vault points",
      value: formatPoints(vaultPoints),
      hint: "Strategy-vault deposits",
    },
    {
      index: "03",
      label: "Trader points",
      value: formatPoints(traderPoints),
      hint: "Direct positions",
    },
    {
      index: "04",
      label: "Active campaigns",
      value: activeCampaigns.toString(),
      hint: "Configured this season",
    },
  ];

  return (
    <div className="grid grid-cols-1 divide-y divide-line border border-line bg-surface sm:grid-cols-2 sm:divide-y-0 sm:[&>*:nth-child(odd)]:border-r sm:[&>*:nth-child(odd)]:border-line lg:grid-cols-4 lg:divide-x lg:divide-y-0 lg:[&>*]:border-r-0 lg:[&>*:not(:last-child)]:border-r lg:[&>*]:border-line">
      {metrics.map((m) => (
        <div key={m.label} className="relative px-5 py-6 sm:px-6 sm:py-7">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[10px] text-line">{m.index}</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
              {m.label}
            </span>
          </div>
          <div
            className={
              "mt-3 font-bold tabular-nums leading-none tracking-[-0.025em] " +
              (m.accent ? "text-3xl text-ink sm:text-4xl" : "text-3xl text-foreground sm:text-4xl")
            }
          >
            {m.value}
          </div>
          {m.hint ? (
            <div className="mt-2 font-mono text-[11px] text-muted">{m.hint}</div>
          ) : null}
          {m.accent ? (
            <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-brand-light via-brand to-transparent" />
          ) : null}
        </div>
      ))}
    </div>
  );
}
