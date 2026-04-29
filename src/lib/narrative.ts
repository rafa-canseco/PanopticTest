import type { UserPointsSummary } from "@/lib/types";

/**
 * Returns a one-sentence pattern-driven narrative for the user. Avoids
 * pronouns so it composes cleanly under "How {name} earned points".
 */
export function narrativeFor(summary: UserPointsSummary): string {
  const { breakdown, vaultPoints, traderPoints, totalPoints } = summary;

  if (totalPoints === 0) return "No scored activity yet.";

  const preChurn = breakdown.preChurnPoints;
  const churnPct = preChurn > 0 ? breakdown.churnDiscount / preChurn : 0;
  const qualityRatio =
    breakdown.basePoints > 0
      ? (breakdown.basePoints + breakdown.qualityUplift) / breakdown.basePoints
      : 1;

  if (churnPct >= 0.5) {
    const counted = Math.round((1 - churnPct) * 100);
    return `Most rows were short-lived — only ${counted}% of pre-churn points counted.`;
  }
  if (qualityRatio < 0.8) {
    return "Capital was active but below baseline productive — quality multiplier capped earned points.";
  }

  const vaultDominant = vaultPoints / totalPoints > 0.8;
  const traderDominant = traderPoints / totalPoints > 0.8;

  if (vaultDominant && qualityRatio >= 1.1) {
    return "Steady, well-utilized vault capital throughout the season.";
  }
  if (traderDominant && breakdown.campaignUplift > 0) {
    return "Direct trading concentrated inside an eligible campaign window for an extra boost.";
  }
  if (traderDominant) {
    return "Direct positions with strong utilization.";
  }
  if (vaultPoints > 0 && traderPoints > 0 && breakdown.campaignUplift > 0) {
    return "Mix of direct trading and yield-vault deposits, with extra boost from eligible campaigns.";
  }
  return "Steady accumulation across the season.";
}
