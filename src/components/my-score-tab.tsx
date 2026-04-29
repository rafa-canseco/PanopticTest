import { ActivityLog } from "@/components/activity-log";
import { CampaignEligibility } from "@/components/campaign-eligibility";
import { ContributionBreakdown } from "@/components/contribution-breakdown";
import { MyPointsCard } from "@/components/my-points-card";
import { PointsTimeline } from "@/components/points-timeline";
import { StandingCard } from "@/components/standing-card";
import { TopActivities } from "@/components/top-activities";
import { UserSelector } from "@/components/user-selector";
import type {
  ActivityRow,
  Campaign,
  EnrichedActivity,
  User,
  UserPointsSummary,
} from "@/lib/types";

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

      {/* Season timeline — cumulative points over time per user */}
      <PointsTimeline
        userName={selected.user.name}
        activities={enrichedActivities}
        campaigns={campaigns}
      />

      {/* Where points came from + which campaigns applied */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <TopActivities activities={enrichedActivities} />
        </div>
        <div className="lg:col-span-5">
          <CampaignEligibility campaigns={campaigns} activities={userActivities} />
        </div>
      </div>

      {/* Detail · Full activity log — collapsed by default */}
      <ActivityLog userName={selected.user.name} activities={enrichedActivities} />
    </div>
  );
}
