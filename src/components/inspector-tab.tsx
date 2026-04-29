import { ActivityTable, type EnrichedActivity } from "@/components/activity-table";
import { BreakdownChain } from "@/components/breakdown-chain";
import { CampaignEligibility } from "@/components/campaign-eligibility";
import { UserSelector } from "@/components/user-selector";
import type { ActivityRow, Campaign, User, UserPointsSummary } from "@/lib/types";

interface InspectorTabProps {
  users: User[];
  selected: UserPointsSummary;
  selectedUserId: string;
  onSelectUser: (userId: string) => void;
  enrichedActivities: EnrichedActivity[];
  userActivities: ActivityRow[];
  campaigns: Campaign[];
}

export function InspectorTab({
  users,
  selected,
  selectedUserId,
  onSelectUser,
  enrichedActivities,
  userActivities,
  campaigns,
}: InspectorTabProps) {
  return (
    <div className="space-y-6">
      <UserSelector users={users} selectedUserId={selectedUserId} onSelect={onSelectUser} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <BreakdownChain summary={selected} />
        </div>
        <div className="lg:col-span-5">
          <CampaignEligibility campaigns={campaigns} activities={userActivities} />
        </div>
      </div>
      <ActivityTable userName={selected.user.name} activities={enrichedActivities} />
    </div>
  );
}
