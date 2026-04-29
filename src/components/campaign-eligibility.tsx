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
  const base = "rounded-full px-2 py-0.5 text-xs font-medium ";
  switch (tone) {
    case "boosted":
      return base + "bg-success/15 text-success";
    case "partial":
      return base + "bg-amber-900/40 text-amber-200";
    case "eligible-no-qualify":
      return base + "bg-rose-900/40 text-rose-200";
    case "no-eligible":
      return base + "bg-elevated text-muted";
  }
}

export function CampaignEligibility({ campaigns, activities }: CampaignEligibilityProps) {
  return (
    <div className="rounded-lg border border-line bg-surface">
      <header className="border-b border-line px-4 py-3">
        <h2 className="text-sm font-bold text-ink">Campaign eligibility</h2>
        <p className="mt-0.5 text-xs text-muted">
          Why this user did or didn&apos;t earn each campaign boost.
        </p>
      </header>
      <ul className="divide-y divide-line">
        {campaigns.map((c) => {
          const stats = analyze(c, activities);
          const { tone, label, detail } = describe(stats, c);
          return (
            <li key={c.id} className="px-4 py-3">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-sm font-medium text-ink">{c.name}</h3>
                <span className={pillClass(tone)}>{label}</span>
              </div>
              <p className="mt-1 text-xs text-foreground">{detail}</p>
              <p className="mt-1 font-mono text-[11px] text-muted">
                {formatMultiplier(c.multiplier)} · ≥{c.minActiveHours}h · {c.startDate} → {c.endDate}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
