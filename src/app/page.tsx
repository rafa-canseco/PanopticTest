"use client";

import { useMemo, useState } from "react";

import { type EnrichedActivity } from "@/components/activity-table";
import { InspectorTab } from "@/components/inspector-tab";
import { OverviewTab } from "@/components/overview-tab";
import { Tabs } from "@/components/tabs";
import { activities } from "@/data/activities";
import { campaigns } from "@/data/campaigns";
import { users } from "@/data/users";
import {
  aggregateUserPoints,
  getCampaignMultiplier,
  getChurnMultiplier,
  getQualityMultiplier,
} from "@/lib/points";
import type { UserPointsSummary } from "@/lib/types";

type TabId = "overview" | "inspector";

interface ComputeOk {
  kind: "ok";
  ranked: UserPointsSummary[];
  totals: { totalPoints: number; vaultPoints: number; traderPoints: number };
}

interface ComputeError {
  kind: "error";
  message: string;
}

function computeDashboard(): ComputeOk | ComputeError {
  try {
    const summaries = aggregateUserPoints(users, activities, campaigns);
    const ranked = [...summaries].sort(
      (a, b) =>
        b.totalPoints - a.totalPoints || a.user.id.localeCompare(b.user.id),
    );
    let totalPoints = 0;
    let vaultPoints = 0;
    let traderPoints = 0;
    for (const s of summaries) {
      totalPoints += s.totalPoints;
      vaultPoints += s.vaultPoints;
      traderPoints += s.traderPoints;
    }
    return { kind: "ok", ranked, totals: { totalPoints, vaultPoints, traderPoints } };
  } catch (err) {
    return { kind: "error", message: err instanceof Error ? err.message : String(err) };
  }
}

function enrichActivities(summary: UserPointsSummary): EnrichedActivity[] {
  return summary.activities
    .map((points) => ({
      points,
      qualityMultiplier: getQualityMultiplier(points.activity.usefulRatio),
      campaignMultiplier: getCampaignMultiplier(points.activity, campaigns),
      churnMultiplier: getChurnMultiplier(points.activity),
    }))
    .sort((a, b) => a.points.activity.date.localeCompare(b.points.activity.date));
}

export default function HomePage() {
  const result = useMemo(() => computeDashboard(), []);
  const ranked: UserPointsSummary[] = useMemo(
    () => (result.kind === "ok" ? result.ranked : []),
    [result],
  );

  const initialUserId = ranked[0]?.user.id ?? "";
  const [selectedUserId, setSelectedUserId] = useState(initialUserId);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const enrichedActivities = useMemo<EnrichedActivity[]>(() => {
    const sel = ranked.find((s) => s.user.id === selectedUserId);
    return sel ? enrichActivities(sel) : [];
  }, [ranked, selectedUserId]);

  const userActivities = useMemo(
    () => activities.filter((a) => a.userId === selectedUserId),
    [selectedUserId],
  );

  const handleInspectUser = (userId: string): void => {
    setSelectedUserId(userId);
    setActiveTab("inspector");
  };

  if (result.kind === "error") {
    return <ErrorPanel title="Points engine rejected the input data" message={result.message} />;
  }
  if (ranked.length === 0) {
    return (
      <ErrorPanel
        title="No data"
        message="There are no users in the dataset. Add entries in src/data/users.ts."
      />
    );
  }

  const selected = ranked.find((s) => s.user.id === selectedUserId) ?? ranked[0];

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

        <Tabs
          tabs={[
            {
              id: "overview",
              label: "Overview",
              panel: (
                <OverviewTab
                  ranked={ranked}
                  totals={result.totals}
                  campaigns={campaigns}
                  selectedUserId={selected.user.id}
                  onInspectUser={handleInspectUser}
                />
              ),
            },
            {
              id: "inspector",
              label: "User Inspector",
              panel: (
                <InspectorTab
                  users={users}
                  selected={selected}
                  selectedUserId={selected.user.id}
                  onSelectUser={setSelectedUserId}
                  enrichedActivities={enrichedActivities}
                  userActivities={userActivities}
                  campaigns={campaigns}
                />
              ),
            },
          ]}
          active={activeTab}
          onChange={(id) => setActiveTab(id as TabId)}
        />

        <footer className="pt-6 text-xs text-zinc-500 dark:text-zinc-500">
          All points computed live from <code className="font-mono">aggregateUserPoints</code>.
          No values are hardcoded.
        </footer>
      </main>
    </div>
  );
}

function ErrorPanel({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6 dark:bg-zinc-950">
      <div className="max-w-xl rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">{title}</h1>
        <pre className="mt-3 overflow-x-auto rounded bg-zinc-50 p-3 font-mono text-xs text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
          {message}
        </pre>
      </div>
    </div>
  );
}
