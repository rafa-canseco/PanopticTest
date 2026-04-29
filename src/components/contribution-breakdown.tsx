import { formatPoints } from "@/lib/format";
import { narrativeFor } from "@/lib/narrative";
import type { UserPointsSummary } from "@/lib/types";

interface ContributionBreakdownProps {
  summary: UserPointsSummary;
}

type Tone = "add" | "trim" | "neutral" | "total";

interface Row {
  label: string;
  value: string;
  hint?: string;
  tone: Tone;
}

function valueClass(tone: Tone): string {
  switch (tone) {
    case "add":
      return "text-success";
    case "trim":
      return "text-rose-300";
    case "total":
      return "text-ink";
    case "neutral":
      return "text-foreground";
  }
}

function labelClass(tone: Tone): string {
  return tone === "total"
    ? "font-mono text-[11px] uppercase tracking-[0.22em] text-brand-light"
    : "font-mono text-[10px] uppercase tracking-[0.22em] text-muted";
}

export function ContributionBreakdown({ summary }: ContributionBreakdownProps) {
  const { breakdown, user } = summary;
  const qualityEffect = breakdown.qualityUplift;
  const campaignEffect = breakdown.campaignUplift;
  const churnEffect = breakdown.churnDiscount;

  const rows: Row[] = [
    {
      label: "Base activity",
      value: `+${formatPoints(breakdown.basePoints)}`,
      hint: "USD-days, time-weighted exposure",
      tone: "neutral",
    },
  ];

  if (qualityEffect > 0) {
    rows.push({
      label: "Quality boost",
      value: `+${formatPoints(qualityEffect)}`,
      hint: "above baseline utilization",
      tone: "add",
    });
  } else if (qualityEffect < 0) {
    rows.push({
      label: "Quality cap",
      value: `${formatPoints(Math.abs(qualityEffect))} not counted`,
      hint: "below baseline utilization",
      tone: "trim",
    });
  }

  rows.push({
    label: "Campaign boosts",
    value: campaignEffect > 0 ? `+${formatPoints(campaignEffect)}` : "—",
    hint:
      campaignEffect > 0
        ? "from eligible campaign multipliers"
        : "no campaign multiplier earned this season",
    tone: campaignEffect > 0 ? "add" : "neutral",
  });

  if (churnEffect > 0) {
    rows.push({
      label: "Short-lived discount",
      value: `${formatPoints(churnEffect)} not counted`,
      hint: "farming protection — short-lived rows count at 25%",
      tone: "trim",
    });
  }

  rows.push({
    label: "Final points",
    value: formatPoints(breakdown.finalPoints),
    tone: "total",
  });

  return (
    <section
      data-tour="contribution"
      className="border border-line bg-surface"
      aria-labelledby="contribution-heading"
    >
      <header className="border-b border-line px-6 py-5 sm:px-8 sm:py-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
          Why this score
        </div>
        <h2 id="contribution-heading" className="mt-1 text-lg font-bold tracking-tight text-ink">
          How {user.name} earned points
        </h2>
        <p className="mt-2 max-w-xl text-sm text-foreground">{narrativeFor(summary)}</p>
      </header>
      <ul className="divide-y divide-line">
        {rows.map((r) => (
          <li
            key={r.label}
            className={
              "flex items-baseline justify-between gap-4 px-6 sm:px-8 " +
              (r.tone === "total" ? "bg-elevated/40 py-5 sm:py-6" : "py-4")
            }
          >
            <div className="min-w-0">
              <div className={labelClass(r.tone)}>{r.label}</div>
              {r.hint ? (
                <div className="mt-1 text-xs text-muted">{r.hint}</div>
              ) : null}
            </div>
            <div
              className={
                "tabular-nums " +
                (r.tone === "total"
                  ? "text-3xl font-bold tracking-[-0.025em] sm:text-4xl"
                  : "font-mono text-base font-bold") +
                " " +
                valueClass(r.tone)
              }
            >
              {r.value}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
