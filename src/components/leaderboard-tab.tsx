import { CampaignPanel } from "@/components/campaign-panel";
import { FormulaCard } from "@/components/formula-card";
import { Leaderboard } from "@/components/leaderboard";
import type { Campaign, UserPointsSummary } from "@/lib/types";

interface LeaderboardTabProps {
  ranked: UserPointsSummary[];
  campaigns: Campaign[];
  selectedUserId: string;
  onInspectUser: (userId: string) => void;
}

export function LeaderboardTab({
  ranked,
  campaigns,
  selectedUserId,
  onInspectUser,
}: LeaderboardTabProps) {
  return (
    <div className="space-y-10">
      <Leaderboard ranked={ranked} selectedUserId={selectedUserId} onSelect={onInspectUser} />
      <CampaignPanel campaigns={campaigns} />
      <FormulaCard />
    </div>
  );
}
