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
  const [activeTab, setActiveTab] = useState<TabId>("inspector");

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
    <div className="min-h-screen font-sans text-foreground">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6 flex items-center gap-3">
          <BrandMark />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              HyperUnicorn Points
            </h1>
            <p className="mt-1 text-sm text-muted">Useful capital, not raw activity.</p>
          </div>
        </header>

        <Tabs
          tabs={[
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
          ]}
          active={activeTab}
          onChange={(id) => setActiveTab(id as TabId)}
        />
      </main>
    </div>
  );
}

function BrandMark() {
  return (
    <svg
      role="img"
      aria-label="Panoptic-inspired brand mark"
      viewBox="0 0 64 64"
      className="h-9 w-9 shrink-0"
    >
      <circle cx="32" cy="32" r="14" fill="none" stroke="#4e14d0" strokeWidth="6" />
      <path
        d="M14 14 A 24 24 0 0 0 14 50"
        fill="none"
        stroke="#4e14d0"
        strokeWidth="6"
        strokeLinecap="butt"
      />
      <path
        d="M50 14 A 24 24 0 0 1 50 50"
        fill="none"
        stroke="#4e14d0"
        strokeWidth="6"
        strokeLinecap="butt"
      />
    </svg>
  );
}

function ErrorPanel({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-xl rounded-lg border border-line bg-surface p-6">
        <h1 className="text-lg font-bold text-ink">{title}</h1>
        <pre className="mt-3 overflow-x-auto rounded bg-bg p-3 font-mono text-xs text-foreground">
          {message}
        </pre>
      </div>
    </div>
  );
}
