import {
  formatDateRange,
  formatMultiplier,
  formatPoints,
  formatSignedPoints,
} from "@/lib/format";

function fail(msg: string): never {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

function check(actual: string, expected: string, label: string): void {
  if (actual !== expected) {
    fail(`${label}: expected ${JSON.stringify(expected)} got ${JSON.stringify(actual)}`);
  }
}

// formatPoints: single rule (min 0, max 2 fractional digits) so adjacent
// rows in a column never disagree on precision around the |n| = 1000 cliff.
check(formatPoints(0), "0", "formatPoints(0)");
check(formatPoints(150), "150", "formatPoints(150)");
check(formatPoints(999.99), "999.99", "formatPoints(999.99)");
check(formatPoints(1000), "1,000", "formatPoints(1000)");
check(formatPoints(1000.5), "1,000.5", "formatPoints(1000.5)");
check(formatPoints(800_000), "800,000", "formatPoints(800,000)");
check(formatPoints(-1500), "-1,500", "formatPoints(-1500)");
check(formatPoints(NaN), "—", "formatPoints(NaN)");
check(formatPoints(Infinity), "—", "formatPoints(Infinity)");
check(formatPoints(-Infinity), "—", "formatPoints(-Infinity)");

// formatSignedPoints: explicit sign for ± non-zero, "0" for exact zero,
// "—" sentinel for non-finite. Uses U+2212 minus, not ASCII -.
check(formatSignedPoints(0), "0", "formatSignedPoints(0)");
check(formatSignedPoints(150), "+150", "formatSignedPoints(150)");
const negFormatted = formatSignedPoints(-12.5);
check(negFormatted, "−12.5", "formatSignedPoints(-12.5)");
if (negFormatted.charCodeAt(0) !== 0x2212) {
  fail(
    `formatSignedPoints uses wrong minus codepoint: U+${negFormatted
      .charCodeAt(0)
      .toString(16)} (expected U+2212)`,
  );
}
check(formatSignedPoints(NaN), "—", "formatSignedPoints(NaN)");
check(formatSignedPoints(-Infinity), "—", "formatSignedPoints(-Infinity)");

// formatMultiplier: always two decimals, "—×" for non-finite.
check(formatMultiplier(1), "1.00×", "formatMultiplier(1)");
check(formatMultiplier(1.25), "1.25×", "formatMultiplier(1.25)");
check(formatMultiplier(0.25), "0.25×", "formatMultiplier(0.25)");
check(formatMultiplier(NaN), "—×", "formatMultiplier(NaN)");
check(formatMultiplier(Infinity), "—×", "formatMultiplier(Infinity)");

// formatDateRange: ISO YYYY-MM-DD or sentinel.
check(
  formatDateRange("2026-04-01", "2026-04-07"),
  "2026-04-01 → 2026-04-07",
  "formatDateRange ok",
);
check(formatDateRange("oops", "2026-04-07"), "—", "formatDateRange invalid start");
check(formatDateRange("2026-04-01", ""), "—", "formatDateRange invalid end");
check(formatDateRange("04/01/2026", "2026-04-07"), "—", "formatDateRange wrong format");

console.log("All format checks passed.");
