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

type Outcome = "earned" | "partial" | "missed-hours" | "wrong-strategy" | "no-activity";

interface OutcomeView {
  kind: Outcome;
  badge: string;
  detail: string;
}

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

function describe(stats: Stats, c: Campaign): OutcomeView {
  if (stats.boosted > 0 && stats.boosted === stats.eligibleStrategy) {
    return {
      kind: "earned",
      badge: "Earned",
      detail: `${stats.boosted} eligible row${stats.boosted === 1 ? "" : "s"} qualified — full boost claimed.`,
    };
  }
  if (stats.boosted > 0) {
    const missed = stats.eligibleStrategy - stats.boosted;
    return {
      kind: "partial",
      badge: `${stats.boosted} of ${stats.eligibleStrategy} earned`,
      detail: `${missed} eligible row${missed === 1 ? "" : "s"} were under the ${c.minActiveHours}h minimum.`,
    };
  }
  if (stats.eligibleStrategy > 0) {
    return {
      kind: "missed-hours",
      badge: "Missed cutoff",
      detail: `${stats.eligibleStrategy} eligible row${stats.eligibleStrategy === 1 ? " was" : "s were"} under the ${c.minActiveHours}h minimum. Hold longer to qualify.`,
    };
  }
  if (stats.inWindow > 0) {
    return {
      kind: "wrong-strategy",
      badge: "Didn't apply",
      detail: `Activity in this window wasn't on an eligible strategy.`,
    };
  }
  return {
    kind: "no-activity",
    badge: "Didn't apply",
    detail: `No activity during this campaign window.`,
  };
}

function dotColor(o: Outcome): string {
  switch (o) {
    case "earned":
      return "bg-success";
    case "partial":
      return "bg-amber-400";
    case "missed-hours":
      return "bg-rose-400";
    case "wrong-strategy":
    case "no-activity":
      return "bg-line";
  }
}

function badgeClass(o: Outcome): string {
  const base = "rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] ";
  switch (o) {
    case "earned":
      return base + "border-success/40 bg-success/10 text-success";
    case "partial":
      return base + "border-amber-400/40 bg-amber-400/10 text-amber-200";
    case "missed-hours":
      return base + "border-rose-400/40 bg-rose-400/10 text-rose-200";
    case "wrong-strategy":
    case "no-activity":
      return base + "border-line bg-elevated text-muted";
  }
}

export function CampaignEligibility({ campaigns, activities }: CampaignEligibilityProps) {
  return (
    <section
      data-tour="eligibility"
      className="border border-line bg-surface"
      aria-labelledby="eligibility-heading"
    >
      <header className="border-b border-line px-6 py-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
          Section · Campaigns
        </div>
        <h2 id="eligibility-heading" className="mt-1 text-lg font-bold tracking-tight text-ink">
          Did campaigns boost your score?
        </h2>
        <p className="mt-2 text-sm text-muted">
          Each season runs targeted boosts. Here&apos;s whether your activity claimed each one.
        </p>
      </header>
      <ul className="divide-y divide-line">
        {campaigns.map((c) => {
          const stats = analyze(c, activities);
          const view = describe(stats, c);
          return (
            <li key={c.id} className="px-6 py-4">
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <span
                    aria-hidden
                    className={`mr-1 inline-block h-2 w-2 rounded-full ${dotColor(view.kind)}`}
                  />
                  <h3 className="text-sm font-bold text-ink">{c.name}</h3>
                  <span className="font-mono text-xs text-brand-light">
                    {formatMultiplier(c.multiplier)}
                  </span>
                </div>
                <span className={badgeClass(view.kind)}>{view.badge}</span>
              </div>
              <p className="mt-1.5 ml-5 text-xs text-foreground">{view.detail}</p>
              <p className="mt-1 ml-5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                ≥{c.minActiveHours}h · {c.startDate} → {c.endDate}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
