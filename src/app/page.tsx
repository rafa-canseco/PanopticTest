"use client";

import { useMemo, useState } from "react";

import { ArcMark } from "@/components/arc-mark";
import { LeaderboardTab } from "@/components/leaderboard-tab";
import { MyScoreTab } from "@/components/my-score-tab";
import { Tabs } from "@/components/tabs";
import { TourButton } from "@/components/tour-button";
import { activities } from "@/data/activities";
import { campaigns } from "@/data/campaigns";
import { users } from "@/data/users";
import {
  aggregateUserPoints,
  getCampaignMultiplier,
  getChurnMultiplier,
  getQualityMultiplier,
} from "@/lib/points";
import type { EnrichedActivity, UserPointsSummary } from "@/lib/types";

type TabId = "my-score" | "leaderboard";

interface ComputeOk {
  kind: "ok";
  ranked: UserPointsSummary[];
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
    return { kind: "ok", ranked };
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
  const [activeTab, setActiveTab] = useState<TabId>("my-score");

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
    setActiveTab("my-score");
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
    <div className="relative min-h-screen font-sans text-foreground">
      {/* Hero radial glow — sits behind the header, fades into the bg */}
      <div className="brand-glow pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px]" />

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-10">
        <header className="mb-10 sm:mb-14">
          {/* Display title */}
          <div className="reveal reveal-2 flex items-end gap-5 sm:gap-7">
            <ArcMark size={72} className="hidden sm:block" />
            <ArcMark size={56} className="block sm:hidden" />
            <h1 className="text-[44px] font-bold leading-[0.92] tracking-[-0.045em] text-ink sm:text-6xl lg:text-7xl">
              HyperUnicorn
              <br />
              <span className="text-brand-light">Points.</span>
            </h1>
          </div>

          <div className="reveal reveal-3 mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <p className="max-w-md text-base text-foreground sm:text-lg">
              Useful capital, not raw activity.
            </p>
            <TourButton onBeforeStart={() => setActiveTab("my-score")} />
          </div>

          <div className="reveal reveal-4 rule-fade mt-10" />
        </header>

        <div className="reveal reveal-4">
          <Tabs
            tabs={[
              {
                id: "my-score",
                label: "My Score",
                panel: (
                  <MyScoreTab
                    users={users}
                    selected={selected}
                    ranked={ranked}
                    selectedUserId={selected.user.id}
                    onSelectUser={setSelectedUserId}
                    enrichedActivities={enrichedActivities}
                    userActivities={userActivities}
                    campaigns={campaigns}
                  />
                ),
              },
              {
                id: "leaderboard",
                label: "Leaderboard",
                panel: (
                  <LeaderboardTab
                    ranked={ranked}
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
        </div>
      </main>
    </div>
  );
}

function ErrorPanel({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-xl border border-line bg-surface p-6">
        <h1 className="text-lg font-bold text-ink">{title}</h1>
        <pre className="mt-3 overflow-x-auto bg-bg p-3 font-mono text-xs text-foreground">
          {message}
        </pre>
      </div>
    </div>
  );
}
