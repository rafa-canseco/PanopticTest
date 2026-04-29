import type {
  ActivityPoints,
  ActivityRow,
  Campaign,
  PointsBreakdown,
  User,
  UserPointsSummary,
} from "@/lib/types";

export function getActiveUsdDays(activity: ActivityRow): number {
  return activity.usdCapital * (activity.activeHours / 24);
}

export function getQualityMultiplier(usefulRatio: number): number {
  if (usefulRatio < 0.4) return 0.5;
  if (usefulRatio < 0.7) return 1.0;
  if (usefulRatio < 0.9) return 1.25;
  return 1.5;
}

export function getCampaignMultiplier(activity: ActivityRow, campaigns: Campaign[]): number {
  for (const campaign of campaigns) {
    const inWindow =
      activity.date >= campaign.startDate && activity.date <= campaign.endDate;
    const eligible = campaign.eligibleStrategies.includes(activity.strategy);
    if (inWindow && eligible) {
      return campaign.multiplier;
    }
  }
  return 1.0;
}

export function getChurnMultiplier(activity: ActivityRow): number {
  if (activity.isShortLived && !activity.isVaultManagedRebalance) {
    return 0.25;
  }
  return 1.0;
}

export function calculateActivityPoints(
  activity: ActivityRow,
  campaigns: Campaign[],
): ActivityPoints {
  const basePoints = getActiveUsdDays(activity);
  const qualityMult = getQualityMultiplier(activity.usefulRatio);
  const campaignMult = getCampaignMultiplier(activity, campaigns);
  const churnMult = getChurnMultiplier(activity);

  const qualityUplift = basePoints * (qualityMult - 1);
  const campaignUplift = basePoints * qualityMult * (campaignMult - 1);
  const preChurnPoints = basePoints * qualityMult * campaignMult;
  const churnDiscount = preChurnPoints * (1 - churnMult);
  const finalPoints = preChurnPoints * churnMult;

  return {
    activity,
    breakdown: {
      basePoints,
      qualityUplift,
      campaignUplift,
      preChurnPoints,
      churnDiscount,
      finalPoints,
    },
  };
}

const EMPTY_BREAKDOWN: PointsBreakdown = {
  basePoints: 0,
  qualityUplift: 0,
  campaignUplift: 0,
  preChurnPoints: 0,
  churnDiscount: 0,
  finalPoints: 0,
};

function addBreakdowns(a: PointsBreakdown, b: PointsBreakdown): PointsBreakdown {
  return {
    basePoints: a.basePoints + b.basePoints,
    qualityUplift: a.qualityUplift + b.qualityUplift,
    campaignUplift: a.campaignUplift + b.campaignUplift,
    preChurnPoints: a.preChurnPoints + b.preChurnPoints,
    churnDiscount: a.churnDiscount + b.churnDiscount,
    finalPoints: a.finalPoints + b.finalPoints,
  };
}

export function aggregateUserPoints(
  users: User[],
  activities: ActivityRow[],
  campaigns: Campaign[],
): UserPointsSummary[] {
  return users.map((user) => {
    const userActivities = activities.filter((a) => a.userId === user.id);
    const scored = userActivities.map((a) => calculateActivityPoints(a, campaigns));

    let vaultPoints = 0;
    let traderPoints = 0;
    let breakdown: PointsBreakdown = EMPTY_BREAKDOWN;

    for (const item of scored) {
      breakdown = addBreakdowns(breakdown, item.breakdown);
      if (item.activity.category === "vault") {
        vaultPoints += item.breakdown.finalPoints;
      } else {
        traderPoints += item.breakdown.finalPoints;
      }
    }

    return {
      user,
      vaultPoints,
      traderPoints,
      totalPoints: vaultPoints + traderPoints,
      breakdown,
      activities: scored,
    };
  });
}
