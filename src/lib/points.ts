import type {
  ActivityPoints,
  ActivityRow,
  Campaign,
  PointsBreakdown,
  Strategy,
  User,
  UserPointsSummary,
  VaultType,
} from "@/lib/types";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const VAULT_STRATEGY_TO_TYPE: Readonly<Partial<Record<Strategy, VaultType>>> = {
  "lending-vault": "lending",
  "covered-call-vault": "covered-call",
  "gamma-scalping-vault": "gamma-scalping",
};

const VAULT_STRATEGIES: ReadonlySet<Strategy> = new Set(
  Object.keys(VAULT_STRATEGY_TO_TYPE) as Strategy[],
);

const TRADER_STRATEGIES: ReadonlySet<Strategy> = new Set<Strategy>([
  "long-vol",
  "short-vol",
  "directional",
]);

function collectVaultTypeErrors(a: ActivityRow): string[] {
  const errors: string[] = [];
  if (a.category === "vault") {
    const expected = VAULT_STRATEGY_TO_TYPE[a.strategy];
    if (a.vaultType === undefined) {
      errors.push(
        `vault row must declare vaultType${expected ? ` (expected "${expected}")` : ""}`,
      );
    } else if (expected !== undefined && a.vaultType !== expected) {
      errors.push(
        `vaultType "${a.vaultType}" inconsistent with strategy "${a.strategy}" (expected "${expected}")`,
      );
    }
  } else if (a.vaultType !== undefined) {
    errors.push(`trader row must not declare vaultType (got "${a.vaultType}")`);
  }
  return errors;
}

function isFiniteNonNegative(n: number): boolean {
  return Number.isFinite(n) && n >= 0;
}

function isInRange(n: number, lo: number, hi: number): boolean {
  return Number.isFinite(n) && n >= lo && n <= hi;
}

function collectActivityErrors(
  a: ActivityRow,
  userIds: ReadonlySet<string>,
  seasonStart: string,
  seasonEnd: string,
): string[] {
  const errors: string[] = [];
  if (!userIds.has(a.userId)) errors.push(`unknown userId "${a.userId}"`);
  if (!ISO_DATE.test(a.date)) {
    errors.push(`date must be YYYY-MM-DD (got "${a.date}")`);
  } else if (a.date < seasonStart || a.date > seasonEnd) {
    errors.push(`date ${a.date} outside season [${seasonStart}, ${seasonEnd}]`);
  }
  if (!isFiniteNonNegative(a.usdCapital)) {
    errors.push(`usdCapital must be a non-negative finite number (got ${a.usdCapital})`);
  }
  if (!isInRange(a.activeHours, 0, 24)) {
    errors.push(`activeHours must be in [0, 24] (got ${a.activeHours})`);
  }
  if (!isInRange(a.usefulRatio, 0, 1)) {
    errors.push(`usefulRatio must be in [0, 1] (got ${a.usefulRatio})`);
  }
  const strategyOk =
    (a.category === "vault" && VAULT_STRATEGIES.has(a.strategy)) ||
    (a.category === "trader" && TRADER_STRATEGIES.has(a.strategy));
  if (!strategyOk) {
    errors.push(`category "${a.category}" inconsistent with strategy "${a.strategy}"`);
  }
  errors.push(...collectVaultTypeErrors(a));
  if (a.isVaultManagedRebalance && a.category !== "vault") {
    errors.push(`isVaultManagedRebalance requires category="vault"`);
  }
  return errors;
}

function validateCampaign(c: Campaign): void {
  const errors: string[] = [];
  if (!ISO_DATE.test(c.startDate)) errors.push(`startDate must be YYYY-MM-DD (got "${c.startDate}")`);
  if (!ISO_DATE.test(c.endDate)) errors.push(`endDate must be YYYY-MM-DD (got "${c.endDate}")`);
  if (errors.length === 0 && c.startDate > c.endDate) {
    errors.push(`startDate ${c.startDate} after endDate ${c.endDate}`);
  }
  if (!Number.isFinite(c.multiplier) || c.multiplier <= 0) {
    errors.push(`multiplier must be a positive finite number (got ${c.multiplier})`);
  }
  if (!Number.isFinite(c.minActiveHours) || c.minActiveHours < 0 || c.minActiveHours > 24) {
    errors.push(`minActiveHours must be in [0, 24] (got ${c.minActiveHours})`);
  }
  if (c.eligibleStrategies.length === 0) {
    errors.push(`eligibleStrategies must not be empty`);
  }
  if (errors.length > 0) throw new Error(`campaign ${c.id}: ${errors.join("; ")}`);
}

function assertUniqueIds<T extends { id: string }>(items: readonly T[], label: string): void {
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id)) throw new Error(`duplicate ${label} id: ${item.id}`);
    seen.add(item.id);
  }
}

function assertNoCampaignOverlap(campaigns: readonly Campaign[]): void {
  for (let i = 0; i < campaigns.length; i++) {
    for (let j = i + 1; j < campaigns.length; j++) {
      const a = campaigns[i];
      const b = campaigns[j];
      const overlap = a.startDate <= b.endDate && b.startDate <= a.endDate;
      const sharedStrategy = a.eligibleStrategies.some((s) =>
        b.eligibleStrategies.includes(s),
      );
      if (overlap && sharedStrategy) {
        throw new Error(
          `campaigns ${a.id} and ${b.id} overlap on a shared strategy; precedence is undefined`,
        );
      }
    }
  }
}

/**
 * Validates the entire input set. Throws on the first batch of activity errors
 * encountered, on any invalid campaign, on duplicate ids, or on overlapping
 * campaigns that share an eligible strategy.
 *
 * The season window is derived from the union of all campaign windows. An empty
 * `campaigns` list disables the season check.
 */
export function validateInputs(
  users: readonly User[],
  activities: readonly ActivityRow[],
  campaigns: readonly Campaign[],
): void {
  assertUniqueIds(users, "user");
  assertUniqueIds(activities, "activity");
  assertUniqueIds(campaigns, "campaign");
  for (const c of campaigns) validateCampaign(c);
  assertNoCampaignOverlap(campaigns);

  const userIds = new Set(users.map((u) => u.id));
  const seasonStart =
    campaigns.length > 0
      ? campaigns.reduce((min, c) => (c.startDate < min ? c.startDate : min), campaigns[0].startDate)
      : "0000-01-01";
  const seasonEnd =
    campaigns.length > 0
      ? campaigns.reduce((max, c) => (c.endDate > max ? c.endDate : max), campaigns[0].endDate)
      : "9999-12-31";

  for (const a of activities) {
    const errors = collectActivityErrors(a, userIds, seasonStart, seasonEnd);
    if (errors.length > 0) throw new Error(`activity ${a.id}: ${errors.join("; ")}`);
  }
}

/** Time-weighted economic exposure for a single activity row. */
export function getActiveUsdDays(activity: ActivityRow): number {
  return activity.usdCapital * (activity.activeHours / 24);
}

/**
 * Right-open quality bands: `[0, 0.4) -> 0.5x`, `[0.4, 0.7) -> 1.0x`,
 * `[0.7, 0.9) -> 1.25x`, `[0.9, 1.0] -> 1.5x`.
 */
export function getQualityMultiplier(usefulRatio: number): number {
  if (usefulRatio < 0.4) return 0.5;
  if (usefulRatio < 0.7) return 1.0;
  if (usefulRatio < 0.9) return 1.25;
  return 1.5;
}

/**
 * Returns the campaign multiplier for the activity. Three conditions must
 * hold: the activity date is inside the campaign window, its strategy is on
 * the eligible list, and `activeHours >= campaign.minActiveHours`. The
 * minimum-hours gate is the campaign-level anti-farming guard — short-lived
 * rows are filtered before the multiplier is applied, not just discounted
 * after the fact by the churn multiplier.
 *
 * Campaigns are required to be non-overlapping on shared strategies
 * (enforced by `validateInputs`), so at most one campaign can match.
 * Returns `1.0` when no campaign applies.
 */
export function getCampaignMultiplier(activity: ActivityRow, campaigns: Campaign[]): number {
  for (const campaign of campaigns) {
    const inWindow =
      activity.date >= campaign.startDate && activity.date <= campaign.endDate;
    const eligible = campaign.eligibleStrategies.includes(activity.strategy);
    const sufficient = activity.activeHours >= campaign.minActiveHours;
    if (inWindow && eligible && sufficient) return campaign.multiplier;
  }
  return 1.0;
}

/**
 * `0.25x` only when an activity is short-lived AND not a vault-managed
 * rebalance. The latter signals legitimate strategy maintenance (e.g. gamma
 * scalping rebalancing) and must not be penalized.
 */
export function getChurnMultiplier(activity: ActivityRow): number {
  if (activity.isShortLived && !activity.isVaultManagedRebalance) return 0.25;
  return 1.0;
}

/**
 * Computes per-activity points and a reconcilable breakdown.
 *
 * The decomposition guarantees:
 *   `basePoints + qualityUplift + campaignUplift === preChurnPoints`
 *   `preChurnPoints - churnDiscount === finalPoints`
 *
 * so a UI can attribute each component without re-running the formula.
 */
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

const EMPTY_BREAKDOWN = {
  basePoints: 0,
  qualityUplift: 0,
  campaignUplift: 0,
  preChurnPoints: 0,
  churnDiscount: 0,
  finalPoints: 0,
} as const satisfies PointsBreakdown;

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

/**
 * Aggregates per-user totals split by category (`vault` vs `trader`) and
 * returns one `UserPointsSummary` per user.
 *
 * Calls `validateInputs` first; throws on any malformed activity, unknown
 * userId, duplicate id, invalid campaign, or shared-strategy campaign overlap.
 * This is the system boundary — no data flows downstream until it is clean.
 */
export function aggregateUserPoints(
  users: User[],
  activities: ActivityRow[],
  campaigns: Campaign[],
): UserPointsSummary[] {
  validateInputs(users, activities, campaigns);

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
