import {
  formatHours,
  formatPercent,
  formatPoints,
  formatShortDate,
  formatStrategy,
  formatUsd,
} from "@/lib/format";
import type { Campaign, EnrichedActivity } from "@/lib/types";

interface TopActivitiesProps {
  activities: EnrichedActivity[];
  campaigns: Campaign[];
  limit?: number;
}

interface Storyline {
  tone: "boost" | "quality-up" | "quality-down" | "churn";
  label: string;
}

function findCampaign(entry: EnrichedActivity, campaigns: Campaign[]): Campaign | null {
  const a = entry.points.activity;
  return (
    campaigns.find(
      (c) =>
        a.date >= c.startDate &&
        a.date <= c.endDate &&
        c.eligibleStrategies.includes(a.strategy),
    ) ?? null
  );
}

function getStoryline(entry: EnrichedActivity, campaigns: Campaign[]): Storyline | null {
  const { qualityMultiplier, campaignMultiplier, churnMultiplier } = entry;
  if (campaignMultiplier > 1) {
    const campaign = findCampaign(entry, campaigns);
    return {
      tone: "boost",
      label: campaign ? `${campaign.name} boost` : "Campaign boost",
    };
  }
  if (churnMultiplier < 1) {
    return { tone: "churn", label: "Short-lived — counted at 25%" };
  }
  if (qualityMultiplier >= 1.5) return { tone: "quality-up", label: "Excellent utilization" };
  if (qualityMultiplier >= 1.25) return { tone: "quality-up", label: "Above-baseline utilization" };
  if (qualityMultiplier < 1) return { tone: "quality-down", label: "Below-baseline utilization" };
  return null;
}

function storylineClass(tone: Storyline["tone"]): string {
  const base = "rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] ";
  switch (tone) {
    case "boost":
      return base + "border-brand/40 bg-brand-soft text-brand-light";
    case "quality-up":
      return base + "border-success/40 bg-success/10 text-success";
    case "quality-down":
      return base + "border-amber-400/30 bg-amber-400/10 text-amber-200";
    case "churn":
      return base + "border-rose-400/40 bg-rose-400/10 text-rose-200";
  }
}

export function TopActivities({ activities, campaigns, limit = 5 }: TopActivitiesProps) {
  const top = [...activities]
    .sort((a, b) => b.points.breakdown.finalPoints - a.points.breakdown.finalPoints)
    .slice(0, limit);

  return (
    <section
      data-tour="top-activities"
      className="border border-line bg-surface"
      aria-labelledby="top-activities-heading"
    >
      <header className="border-b border-line px-6 py-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
          Where points came from
        </div>
        <h2
          id="top-activities-heading"
          className="mt-1 text-lg font-bold tracking-tight text-ink"
        >
          Top contributing activities
        </h2>
      </header>
      {top.length === 0 ? (
        <p className="px-6 py-8 text-sm text-muted">No activity rows for this user.</p>
      ) : (
        <ol className="divide-y divide-line">
          {top.map((entry, i) => {
            const a = entry.points.activity;
            const final = entry.points.breakdown.finalPoints;
            const story = getStoryline(entry, campaigns);
            return (
              <li key={a.id} className="px-6 py-4">
                <div className="flex items-baseline justify-between gap-4">
                  <div className="flex items-baseline gap-3 min-w-0">
                    <span
                      className="font-mono text-sm font-bold tabular-nums text-line"
                      aria-hidden
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-base font-bold text-ink truncate">
                      {formatStrategy(a.strategy)}
                    </h3>
                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted shrink-0">
                      {formatShortDate(a.date)}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xl font-bold tabular-nums tracking-[-0.02em] text-ink sm:text-2xl">
                      {formatPoints(final)}
                    </span>
                    <span className="ml-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                      pts
                    </span>
                  </div>
                </div>
                <div className="mt-1.5 ml-9 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted">
                  <span className="font-mono tabular-nums">
                    {formatUsd(a.usdCapital)} · {formatHours(a.activeHours)} ·{" "}
                    {formatPercent(a.usefulRatio)} useful
                  </span>
                  {story ? <span className={storylineClass(story.tone)}>{story.label}</span> : null}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
