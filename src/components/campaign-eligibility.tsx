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
      return base + "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200";
    case "partial":
      return base + "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200";
    case "eligible-no-qualify":
      return base + "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200";
    case "no-eligible":
      return base + "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
  }
}

export function CampaignEligibility({ campaigns, activities }: CampaignEligibilityProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <header className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
          Campaign eligibility
        </h2>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          Why this user did or didn&apos;t earn each campaign boost.
        </p>
      </header>
      <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {campaigns.map((c) => {
          const stats = analyze(c, activities);
          const { tone, label, detail } = describe(stats, c);
          return (
            <li key={c.id} className="px-4 py-3">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{c.name}</h3>
                <span className={pillClass(tone)}>{label}</span>
              </div>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{detail}</p>
              <p className="mt-1 font-mono text-[11px] text-zinc-500 dark:text-zinc-500">
                {formatMultiplier(c.multiplier)} · ≥{c.minActiveHours}h · {c.startDate} → {c.endDate}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
