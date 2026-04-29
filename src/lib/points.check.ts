import { activities } from "@/data/activities";
import { campaigns } from "@/data/campaigns";
import { users } from "@/data/users";
import { aggregateUserPoints, calculateActivityPoints } from "@/lib/points";

const EPS = 1e-6;

function approx(a: number, b: number): boolean {
  return Math.abs(a - b) < EPS;
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

// 1. Every activity's breakdown reconciles internally.
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

// 2. Per user, vault + trader == total, and matches sum of activity finalPoints.
const summaries = aggregateUserPoints(users, activities, campaigns);
for (const s of summaries) {
  check(
    approx(s.totalPoints, s.vaultPoints + s.traderPoints),
    `total != vault + trader for ${s.user.name}`,
  );
  const sumFinal = s.activities.reduce((acc, a) => acc + a.breakdown.finalPoints, 0);
  check(approx(sumFinal, s.totalPoints), `sum of activity finals != total for ${s.user.name}`);
}

// 3. Persona-driven sanity checks.
function findActivity(id: string) {
  const found = summaries
    .flatMap((s) => s.activities)
    .find((a) => a.activity.id === id);
  if (!found) fail(`activity ${id} not found`);
  return found;
}

const aliceWeek1 = findActivity("alice-1");
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

// 4. Leaderboard output.
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
console.log("All reconciliation and persona checks passed.");
