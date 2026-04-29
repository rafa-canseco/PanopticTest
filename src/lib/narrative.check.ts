import { narrativeFor } from "@/lib/narrative";
import type { PointsBreakdown, UserPointsSummary } from "@/lib/types";

function fail(msg: string): never {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

function check(actual: string, expected: string | RegExp, label: string): void {
  const ok = expected instanceof RegExp ? expected.test(actual) : actual === expected;
  if (!ok) {
    fail(
      `${label}: expected ${
        expected instanceof RegExp ? expected.toString() : JSON.stringify(expected)
      } got ${JSON.stringify(actual)}`,
    );
  }
}

function makeBreakdown(partial: Partial<PointsBreakdown>): PointsBreakdown {
  return {
    basePoints: 0,
    qualityUplift: 0,
    campaignUplift: 0,
    preChurnPoints: 0,
    churnDiscount: 0,
    finalPoints: 0,
    ...partial,
  };
}

function makeSummary(opts: {
  name: string;
  vault: number;
  trader: number;
  breakdown: PointsBreakdown;
}): UserPointsSummary {
  const total = opts.vault + opts.trader;
  return {
    user: { id: opts.name.toLowerCase(), name: opts.name },
    vaultPoints: opts.vault,
    traderPoints: opts.trader,
    totalPoints: total,
    breakdown: opts.breakdown,
    activities: [],
  };
}

// 1. Empty case → explicit no-activity sentence.
check(
  narrativeFor(
    makeSummary({ name: "Empty", vault: 0, trader: 0, breakdown: makeBreakdown({}) }),
  ),
  "No scored activity yet.",
  "totalPoints === 0",
);

// 2. Anomalous shape: totalPoints > 0 with basePoints === 0 — should warn,
//    not fall through to the generic "Steady accumulation" line.
check(
  narrativeFor(
    makeSummary({
      name: "Anomaly",
      vault: 100,
      trader: 0,
      breakdown: makeBreakdown({ basePoints: 0, finalPoints: 100, preChurnPoints: 100 }),
    }),
  ),
  /without recorded base activity/,
  "totalPoints > 0 with basePoints === 0",
);

// 3. Heavy churn: 75% discounted → "only 25% of pre-churn points counted."
check(
  narrativeFor(
    makeSummary({
      name: "Churned",
      vault: 25,
      trader: 0,
      breakdown: makeBreakdown({
        basePoints: 100,
        preChurnPoints: 100,
        churnDiscount: 75,
        finalPoints: 25,
      }),
    }),
  ),
  /only 25% of pre-churn points counted/,
  "churnPct >= 0.5 — Eve persona",
);

// 4. Low quality: qualityRatio = 0.5 (basePoints 100 + qualityUplift -50)
check(
  narrativeFor(
    makeSummary({
      name: "LowQuality",
      vault: 50,
      trader: 0,
      breakdown: makeBreakdown({
        basePoints: 100,
        qualityUplift: -50,
        preChurnPoints: 50,
        finalPoints: 50,
      }),
    }),
  ),
  /below baseline productive/,
  "qualityRatio < 0.8 — Dave persona",
);

// 5. Steady vault depositor: vault dominant, qualityRatio 1.25
check(
  narrativeFor(
    makeSummary({
      name: "Alice",
      vault: 1000,
      trader: 0,
      breakdown: makeBreakdown({
        basePoints: 800,
        qualityUplift: 200,
        preChurnPoints: 1000,
        finalPoints: 1000,
      }),
    }),
  ),
  /Steady, well-utilized vault capital/,
  "vault-dominant + above-baseline — Alice persona",
);

// 6. Trader with campaign boost
check(
  narrativeFor(
    makeSummary({
      name: "Bob",
      vault: 0,
      trader: 1300,
      breakdown: makeBreakdown({
        basePoints: 1000,
        qualityUplift: 0,
        campaignUplift: 300,
        preChurnPoints: 1300,
        finalPoints: 1300,
      }),
    }),
  ),
  /eligible campaign window/,
  "trader-dominant + campaign uplift — Bob persona",
);

// 7. Trader without campaign
check(
  narrativeFor(
    makeSummary({
      name: "TraderOnly",
      vault: 0,
      trader: 1000,
      breakdown: makeBreakdown({
        basePoints: 1000,
        preChurnPoints: 1000,
        finalPoints: 1000,
      }),
    }),
  ),
  /Direct positions with strong utilization/,
  "trader-dominant, no campaign",
);

// 8. Mixed with campaign — both vault and trader points
check(
  narrativeFor(
    makeSummary({
      name: "Carol",
      vault: 305,
      trader: 150,
      breakdown: makeBreakdown({
        basePoints: 300,
        qualityUplift: 100,
        campaignUplift: 55,
        preChurnPoints: 455,
        finalPoints: 455,
      }),
    }),
  ),
  /Mix of direct trading and yield-vault deposits/,
  "mixed + campaign uplift — Carol persona",
);

// 9. Default fallback — vault-dominant but at exactly baseline quality (1.0×)
//    so neither the vault-dominant high-quality branch nor any earlier branch
//    fires. Should land on the generic accumulation line.
check(
  narrativeFor(
    makeSummary({
      name: "Plain",
      vault: 100,
      trader: 0,
      breakdown: makeBreakdown({
        basePoints: 100,
        preChurnPoints: 100,
        finalPoints: 100,
      }),
    }),
  ),
  /Steady accumulation/,
  "default fallback",
);

// 10. Precedence — heavy churn AND low quality. Churn should win because the
//     discount is the dominant story; quality cap is secondary.
check(
  narrativeFor(
    makeSummary({
      name: "Both",
      vault: 25,
      trader: 0,
      breakdown: makeBreakdown({
        basePoints: 100,
        qualityUplift: -50,
        preChurnPoints: 50,
        churnDiscount: 25,
        finalPoints: 25,
      }),
    }),
  ),
  /only 50% of pre-churn points counted/,
  "precedence: churn outranks quality",
);

console.log("All narrative checks passed.");
