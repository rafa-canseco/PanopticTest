import { CampaignPanel } from "@/components/campaign-panel";
import { Leaderboard } from "@/components/leaderboard";
import { MetricCards } from "@/components/metric-cards";
import type { Campaign, UserPointsSummary } from "@/lib/types";

interface OverviewTabProps {
  ranked: UserPointsSummary[];
  totals: { totalPoints: number; vaultPoints: number; traderPoints: number };
  campaigns: Campaign[];
  selectedUserId: string;
  onInspectUser: (userId: string) => void;
}

export function OverviewTab({
  ranked,
  totals,
  campaigns,
  selectedUserId,
  onInspectUser,
}: OverviewTabProps) {
  return (
    <div className="space-y-10">
      <MetricCards
        totalPoints={totals.totalPoints}
        vaultPoints={totals.vaultPoints}
        traderPoints={totals.traderPoints}
        activeCampaigns={campaigns.length}
      />
      <Leaderboard ranked={ranked} selectedUserId={selectedUserId} onSelect={onInspectUser} />
      <CampaignPanel campaigns={campaigns} />
    </div>
  );
}
