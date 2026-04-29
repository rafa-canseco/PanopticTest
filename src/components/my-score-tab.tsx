import { type EnrichedActivity } from "@/components/activity-table";
import { CampaignEligibility } from "@/components/campaign-eligibility";
import { ContributionBreakdown } from "@/components/contribution-breakdown";
import { MyPointsCard } from "@/components/my-points-card";
import { StandingCard } from "@/components/standing-card";
import { TopActivities } from "@/components/top-activities";
import { UserSelector } from "@/components/user-selector";
import type { ActivityRow, Campaign, User, UserPointsSummary } from "@/lib/types";

interface MyScoreTabProps {
  users: User[];
  selected: UserPointsSummary;
  ranked: UserPointsSummary[];
  selectedUserId: string;
  onSelectUser: (userId: string) => void;
  enrichedActivities: EnrichedActivity[];
  userActivities: ActivityRow[];
  campaigns: Campaign[];
}

export function MyScoreTab({
  users,
  selected,
  ranked,
  selectedUserId,
  onSelectUser,
  enrichedActivities,
  userActivities,
  campaigns,
}: MyScoreTabProps) {
  return (
    <div className="space-y-8">
      <UserSelector users={users} selectedUserId={selectedUserId} onSelect={onSelectUser} />

      {/* Answer 1 + 2: how many points + where do I stand */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <MyPointsCard summary={selected} />
        <StandingCard summary={selected} ranked={ranked} />
      </div>

      {/* Answer 3: how did the activity contribute */}
      <ContributionBreakdown summary={selected} />

      {/* Where points came from + which campaigns applied */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <TopActivities activities={enrichedActivities} />
        </div>
        <div className="lg:col-span-5">
          <CampaignEligibility campaigns={campaigns} activities={userActivities} />
        </div>
      </div>
    </div>
  );
}
