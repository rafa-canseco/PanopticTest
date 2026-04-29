import { formatMultiplier } from "@/lib/format";
import type { ActivityRow, Campaign } from "@/lib/types";

interface CampaignEligibilityProps {
  campaigns: Campaign[];
  activities: ActivityRow[];
}

interface Stats {
  inWindow: number;
  eligibleStrategy: number;
  boosted: number;
}

type Tone = "boosted" | "partial" | "eligible-no-qualify" | "no-eligible";

function analyze(campaign: Campaign, activities: ActivityRow[]): Stats {
  const inWindow = activities.filter(
    (a) => a.date >= campaign.startDate && a.date <= campaign.endDate,
  );
  const eligibleStrategy = inWindow.filter((a) =>
    campaign.eligibleStrategies.includes(a.strategy),
  );
  const boosted = eligibleStrategy.filter((a) => a.activeHours >= campaign.minActiveHours);
  return {
    inWindow: inWindow.length,
    eligibleStrategy: eligibleStrategy.length,
    boosted: boosted.length,
  };
}

function describe(stats: Stats, campaign: Campaign): { tone: Tone; label: string; detail: string } {
  if (stats.eligibleStrategy === 0) {
    return {
      tone: "no-eligible",
      label: "Not boosted",
      detail:
        stats.inWindow === 0
          ? "no activity in this campaign's window"
          : "in-window activity wasn't on an eligible strategy",
    };
  }
  if (stats.boosted === 0) {
    return {
      tone: "eligible-no-qualify",
      label: "Eligible, no boost",
      detail: `${stats.eligibleStrategy} eligible row${stats.eligibleStrategy === 1 ? "" : "s"}, all under the ${campaign.minActiveHours}h minimum`,
    };
  }
  if (stats.boosted < stats.eligibleStrategy) {
    return {
      tone: "partial",
      label: `${stats.boosted} of ${stats.eligibleStrategy} boosted`,
      detail: `${stats.eligibleStrategy - stats.boosted} eligible row${stats.eligibleStrategy - stats.boosted === 1 ? "" : "s"} under the ${campaign.minActiveHours}h minimum`,
    };
  }
  return {
    tone: "boosted",
    label: `All ${stats.boosted} boosted`,
    detail: `${campaign.eligibleStrategies.join(", ")} qualified during the window`,
  };
}

function pillClass(tone: Tone): string {
  const base = "rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] ";
  switch (tone) {
    case "boosted":
      return base + "border-success/30 bg-success/10 text-success";
    case "partial":
      return base + "border-amber-400/30 bg-amber-400/10 text-amber-200";
    case "eligible-no-qualify":
      return base + "border-rose-400/30 bg-rose-400/10 text-rose-200";
    case "no-eligible":
      return base + "border-line bg-elevated text-muted";
  }
}

function rail(tone: Tone): string {
  switch (tone) {
    case "boosted":
      return "bg-success";
    case "partial":
      return "bg-amber-400";
    case "eligible-no-qualify":
      return "bg-rose-400";
    case "no-eligible":
      return "bg-line";
  }
}

export function CampaignEligibility({ campaigns, activities }: CampaignEligibilityProps) {
  return (
    <section className="border border-line bg-surface" aria-labelledby="eligibility-heading">
      <header className="border-b border-line px-6 py-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
          Section · Eligibility
        </div>
        <h2 id="eligibility-heading" className="mt-1 text-lg font-bold tracking-tight text-ink">
          Campaign matchups
        </h2>
        <p className="mt-2 text-sm text-muted">
          Why this user did or didn&apos;t earn each campaign boost.
        </p>
      </header>
      <ul className="divide-y divide-line">
        {campaigns.map((c, i) => {
          const stats = analyze(c, activities);
          const { tone, label, detail } = describe(stats, c);
          const index = String(i + 1).padStart(2, "0");
          return (
            <li key={c.id} className="relative px-6 py-4">
              <span aria-hidden className={`absolute left-0 top-3 h-[calc(100%-1.5rem)] w-[3px] ${rail(tone)}`} />
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[10px] text-line">{index}</span>
                <h3 className="text-base font-bold tracking-tight text-ink">{c.name}</h3>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-xs text-foreground">{detail}</p>
                <span className={pillClass(tone)}>{label}</span>
              </div>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                {formatMultiplier(c.multiplier)} · ≥{c.minActiveHours}h · {c.startDate} → {c.endDate}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
