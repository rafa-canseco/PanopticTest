"use client";

import { useMemo, useState } from "react";

import { ActivityTable, type EnrichedActivity } from "@/components/activity-table";
import { CampaignPanel } from "@/components/campaign-panel";
import { Leaderboard } from "@/components/leaderboard";
import { MetricCards } from "@/components/metric-cards";
import { UserBreakdown } from "@/components/user-breakdown";
import { activities } from "@/data/activities";
import { campaigns } from "@/data/campaigns";
import { users } from "@/data/users";
import {
  aggregateUserPoints,
  getCampaignMultiplier,
  getChurnMultiplier,
  getQualityMultiplier,
} from "@/lib/points";

export default function HomePage() {
  const summaries = useMemo(
    () => aggregateUserPoints(users, activities, campaigns),
    [],
  );

  const ranked = useMemo(
    () => [...summaries].sort((a, b) => b.totalPoints - a.totalPoints),
    [summaries],
  );

  const defaultUserId = ranked[0]?.user.id ?? "";
  const [selectedUserId, setSelectedUserId] = useState(defaultUserId);

  const selected =
    summaries.find((s) => s.user.id === selectedUserId) ?? summaries[0];

  const totals = useMemo(() => {
    let totalPoints = 0;
    let vaultPoints = 0;
    let traderPoints = 0;
    for (const s of summaries) {
      totalPoints += s.totalPoints;
      vaultPoints += s.vaultPoints;
      traderPoints += s.traderPoints;
    }
    return { totalPoints, vaultPoints, traderPoints };
  }, [summaries]);

  const enrichedActivities: EnrichedActivity[] = useMemo(() => {
    if (!selected) return [];
    return selected.activities.map((points) => ({
      points,
      qualityMultiplier: getQualityMultiplier(points.activity.usefulRatio),
      campaignMultiplier: getCampaignMultiplier(points.activity, campaigns),
      churnMultiplier: getChurnMultiplier(points.activity),
    }));
  }, [selected]);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-3xl">
            HyperUnicorn Points
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Useful capital, not raw activity.
          </p>
        </header>

        <section className="mb-6">
          <MetricCards
            totalPoints={totals.totalPoints}
            vaultPoints={totals.vaultPoints}
            traderPoints={totals.traderPoints}
            activeCampaigns={campaigns.length}
          />
        </section>

        <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Leaderboard
              summaries={summaries}
              selectedUserId={selected?.user.id ?? ""}
              onSelect={setSelectedUserId}
            />
          </div>
          <div className="lg:col-span-5">
            {selected ? (
              <UserBreakdown summary={selected} />
            ) : (
              <p className="text-sm text-zinc-500">No user selected.</p>
            )}
          </div>
        </section>

        <section className="mb-6">
          <CampaignPanel campaigns={campaigns} />
        </section>

        <section className="mb-6">
          {selected ? (
            <ActivityTable userName={selected.user.name} activities={enrichedActivities} />
          ) : null}
        </section>

        <footer className="pt-4 text-xs text-zinc-500 dark:text-zinc-500">
          All points computed live from <code className="font-mono">aggregateUserPoints</code>.
          No values are hardcoded.
        </footer>
      </main>
    </div>
  );
}
