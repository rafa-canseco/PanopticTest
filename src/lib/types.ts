export type ActivityCategory = "vault" | "trader";

export type VaultType = "lending" | "covered-call" | "gamma-scalping";

export type Strategy =
  | "lending-vault"
  | "covered-call-vault"
  | "gamma-scalping-vault"
  | "long-vol"
  | "short-vol"
  | "directional";

export interface User {
  id: string;
  name: string;
}

export interface Campaign {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  multiplier: number;
  minActiveHours: number;
  eligibleStrategies: Strategy[];
  description: string;
}

export interface ActivityRow {
  id: string;
  userId: string;
  date: string;
  category: ActivityCategory;
  strategy: Strategy;
  vaultType?: VaultType;
  usdCapital: number;
  activeHours: number;
  usefulRatio: number;
  isShortLived: boolean;
  isVaultManagedRebalance: boolean;
}

export interface PointsBreakdown {
  basePoints: number;
  qualityUplift: number;
  campaignUplift: number;
  preChurnPoints: number;
  churnDiscount: number;
  finalPoints: number;
}

export interface ActivityPoints {
  activity: ActivityRow;
  breakdown: PointsBreakdown;
}

export interface UserPointsSummary {
  user: User;
  vaultPoints: number;
  traderPoints: number;
  totalPoints: number;
  breakdown: PointsBreakdown;
  activities: ActivityPoints[];
}
