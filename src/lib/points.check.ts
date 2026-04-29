import { activities } from "@/data/activities";
import { campaigns } from "@/data/campaigns";
import { users } from "@/data/users";
import {
  aggregateUserPoints,
  calculateActivityPoints,
  getCampaignMultiplier,
  getQualityMultiplier,
} from "@/lib/points";
import type { ActivityPoints, ActivityRow } from "@/lib/types";

function approx(a: number, b: number): boolean {
  const tol = Math.max(1e-6, 1e-9 * Math.max(Math.abs(a), Math.abs(b)));
  return Math.abs(a - b) <= tol;
}

function fail(msg: string): never {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

function check(cond: boolean, msg: string): void {
  if (!cond) fail(msg);
}

function fmt(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

// 0. Datasets are non-empty (defends against accidental "all green on no data").
check(users.length > 0, "users dataset is empty");
check(activities.length > 0, "activities dataset is empty");
check(campaigns.length > 0, "campaigns dataset is empty");

// 1. Quality-band boundaries. The bands are right-open: a refactor that flips
//    `<` to `<=` would silently re-classify users on a band edge.
check(getQualityMultiplier(0) === 0.5, "quality boundary: 0.0 -> 0.5x");
check(getQualityMultiplier(0.39) === 0.5, "quality boundary: 0.39 -> 0.5x");
check(getQualityMultiplier(0.4) === 1.0, "quality boundary: exactly 0.40 -> 1.0x");
check(getQualityMultiplier(0.69) === 1.0, "quality boundary: 0.69 -> 1.0x");
check(getQualityMultiplier(0.7) === 1.25, "quality boundary: exactly 0.70 -> 1.25x");
check(getQualityMultiplier(0.89) === 1.25, "quality boundary: 0.89 -> 1.25x");
check(getQualityMultiplier(0.9) === 1.5, "quality boundary: exactly 0.90 -> 1.5x");
check(getQualityMultiplier(1.0) === 1.5, "quality boundary: 1.0 -> 1.5x");

// 1b. minActiveHours gate: at exactly 12 hours the campaign applies; below
//     12 it does not, even if the date and strategy match. Synthetic probes
//     so the boundary is locked independent of the seed dataset.
const probeBase: ActivityRow = {
  id: "probe",
  userId: "alice",
  date: "2026-04-02",
  category: "vault",
  strategy: "lending-vault",
  vaultType: "lending",
  usdCapital: 100_000,
  activeHours: 12,
  usefulRatio: 0.75,
  isShortLived: false,
  isVaultManagedRebalance: false,
};
check(
  getCampaignMultiplier(probeBase, campaigns) === 1.2,
  "campaign should apply at exactly 12 active hours",
);
check(
  getCampaignMultiplier({ ...probeBase, activeHours: 11.99 }, campaigns) === 1.0,
  "campaign should NOT apply below 12 active hours",
);

// 2. Every activity's breakdown reconciles internally.
for (const activity of activities) {
  const { breakdown } = calculateActivityPoints(activity, campaigns);
  const sum =
    breakdown.basePoints + breakdown.qualityUplift + breakdown.campaignUplift;
  check(
    approx(sum, breakdown.preChurnPoints),
    `preChurnPoints != base + qualityUplift + campaignUplift for ${activity.id}`,
  );
  check(
    approx(breakdown.preChurnPoints - breakdown.churnDiscount, breakdown.finalPoints),
    `finalPoints != preChurnPoints - churnDiscount for ${activity.id}`,
  );
}

// 3. Per user, vault + trader == total, and matches sum of activity finalPoints.
const summaries = aggregateUserPoints(users, activities, campaigns);
for (const s of summaries) {
  check(
    approx(s.totalPoints, s.vaultPoints + s.traderPoints),
    `total != vault + trader for ${s.user.name}`,
  );
  const sumFinal = s.activities.reduce((acc, a) => acc + a.breakdown.finalPoints, 0);
  check(approx(sumFinal, s.totalPoints), `sum of activity finals != total for ${s.user.name}`);
}

// 4. Persona-driven sanity checks.
function findActivity(id: string): ActivityPoints {
  const found = summaries.flatMap((s) => s.activities).find((a) => a.activity.id === id);
  if (!found) throw new Error(`activity ${id} not found`);
  return found;
}

const aliceWeek1 = findActivity("alice-1");
// $100k * (24/24) * 1.25 quality * 1.2 Lending Sprint = $150,000.
const aliceWeek1Expected = 100_000 * 1.25 * 1.2;
check(
  approx(aliceWeek1.breakdown.finalPoints, aliceWeek1Expected),
  `alice-1 finalPoints: expected ${aliceWeek1Expected}, got ${aliceWeek1.breakdown.finalPoints}`,
);
check(aliceWeek1.breakdown.campaignUplift > 0, "alice-1 should get Lending Sprint boost");

const aliceWeek2 = findActivity("alice-3");
check(approx(aliceWeek2.breakdown.campaignUplift, 0), "alice-3 outside campaign window");

const bobGamma = findActivity("bob-2");
check(bobGamma.breakdown.campaignUplift > 0, "bob-2 should get Gamma Week boost");

const carolRebalance = findActivity("carol-3");
check(
  approx(carolRebalance.breakdown.churnDiscount, 0),
  "vault-managed rebalance must not be churned",
);
check(carolRebalance.breakdown.campaignUplift > 0, "carol-3 eligible for Gamma Week");

const daveActivity = findActivity("dave-1");
check(daveActivity.breakdown.qualityUplift < 0, "dave-1 low quality should reduce points");

const eveChurn = findActivity("eve-1");
check(eveChurn.breakdown.churnDiscount > 0, "eve-1 churn discount should apply");
check(
  approx(eveChurn.breakdown.finalPoints, eveChurn.breakdown.preChurnPoints * 0.25),
  "eve-1 churn multiplier should be 0.25",
);

// eve-2: gamma-scalping vault on 04-09 (inside Gamma Week, eligible strategy)
// but only 3 active hours — below the 12h minActiveHours gate. The campaign
// boost must NOT apply, before the churn multiplier discounts it.
const eveShortGamma = findActivity("eve-2");
check(
  approx(eveShortGamma.breakdown.campaignUplift, 0),
  "eve-2 must not get Gamma Week boost (3h < 12h minActiveHours)",
);

// 5. Persona narrative: Alice (steady, high quality) outranks Dave (whale,
//    idle, low quality). Pinning this lets the leaderboard "story" survive
//    future tweaks to the dataset.
function findUser(id: string) {
  const found = summaries.find((s) => s.user.id === id);
  if (!found) throw new Error(`user ${id} summary missing`);
  return found;
}
const alice = findUser("alice");
const dave = findUser("dave");
check(
  alice.totalPoints > dave.totalPoints,
  `Alice (${fmt(alice.totalPoints)}) must outrank Dave (${fmt(dave.totalPoints)})`,
);

// 6. Leaderboard output.
const sorted = [...summaries].sort((a, b) => b.totalPoints - a.totalPoints);

console.log("HyperUnicorn Points - Leaderboard (3-week window)");
console.log("-------------------------------------------------");
console.log("User      Vault            Trader           Total");
for (const s of sorted) {
  const name = s.user.name.padEnd(8);
  const vault = fmt(s.vaultPoints).padStart(13);
  const trader = fmt(s.traderPoints).padStart(13);
  const total = fmt(s.totalPoints).padStart(13);
  console.log(`${name}  ${vault}  ${trader}  ${total}`);
}

console.log();
console.log("Per-activity breakdown (final points):");
for (const s of sorted) {
  console.log(`  ${s.user.name}:`);
  for (const a of s.activities) {
    const tag = `${a.activity.date} ${a.activity.strategy}`.padEnd(34);
    console.log(`    ${tag} -> ${fmt(a.breakdown.finalPoints).padStart(11)}`);
  }
}

console.log();
console.log("All reconciliation, boundary, and persona checks passed.");
