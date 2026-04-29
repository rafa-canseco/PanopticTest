import {
  formatDateRange,
  formatHours,
  formatMultiplier,
  formatPercent,
  formatPoints,
  formatShortDate,
  formatSignedPoints,
  formatStrategy,
  formatUsd,
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

// formatUsd: compact for thousands+, dollar sign always, U+2212 minus.
check(formatUsd(0), "$0", "formatUsd(0)");
check(formatUsd(950), "$950", "formatUsd(950)");
check(formatUsd(999), "$999", "formatUsd(999) just under 1k cliff");
check(formatUsd(1000), "$1.0k", "formatUsd(1000) at 1k cliff");
check(formatUsd(1500), "$1.5k", "formatUsd(1500)");
check(formatUsd(9_999), "$10.0k", "formatUsd(9999) just under 10k cliff");
check(formatUsd(10_000), "$10k", "formatUsd(10000) at 10k cliff");
check(formatUsd(100_000), "$100k", "formatUsd(100k)");
check(formatUsd(999_999), "$1000k", "formatUsd(999999) just under 1M cliff");
check(formatUsd(1_000_000), "$1.00M", "formatUsd(1M) at 1M cliff");
check(formatUsd(-1500), "−$1.5k", "formatUsd(-1500) U+2212 sign placement");
check(formatUsd(-100), "−$100", "formatUsd(-100) negative under 1k");
check(formatUsd(NaN), "—", "formatUsd(NaN)");

// formatHours
check(formatHours(0), "0h", "formatHours(0)");
check(formatHours(12), "12h", "formatHours(12)");
check(formatHours(11.5), "11.5h", "formatHours(11.5)");
check(formatHours(NaN), "—", "formatHours(NaN)");

// formatPercent — floors so band-boundary values don't get visually
// promoted to the next visible band.
check(formatPercent(0), "0%", "formatPercent(0)");
check(formatPercent(0.75), "75%", "formatPercent(0.75)");
check(formatPercent(0.899), "89%", "formatPercent(0.899) floored, not 90%");
check(formatPercent(0.9), "90%", "formatPercent(0.9) at boundary");
check(formatPercent(0.999), "99%", "formatPercent(0.999) floored, not 100%");
check(formatPercent(1), "100%", "formatPercent(1)");
check(formatPercent(NaN), "—", "formatPercent(NaN)");

// formatShortDate
check(formatShortDate("2026-04-09"), "Apr 9", "formatShortDate Apr 9");
check(formatShortDate("2026-12-31"), "Dec 31", "formatShortDate Dec 31");
check(formatShortDate("2026-01-01"), "Jan 1", "formatShortDate Jan 1");
check(formatShortDate("2026-09-09"), "Sep 9", "formatShortDate single-digit month/day");
check(formatShortDate("oops"), "—", "formatShortDate invalid shape");
check(formatShortDate("2026-13-01"), "—", "formatShortDate month 13 rejected");
check(formatShortDate("2026-00-15"), "—", "formatShortDate month 0 rejected");
check(formatShortDate("2026-02-32"), "—", "formatShortDate day > 31 rejected");
check(formatShortDate("2026-04-00"), "—", "formatShortDate day 0 rejected");

// formatStrategy
check(formatStrategy("lending-vault"), "Lending Vault", "formatStrategy lending-vault");
check(formatStrategy("covered-call-vault"), "Covered Call Vault", "formatStrategy covered-call");
check(formatStrategy("gamma-scalping-vault"), "Gamma Scalping Vault", "formatStrategy gamma");
check(formatStrategy("long-vol"), "Long Volatility", "formatStrategy long-vol");
check(formatStrategy("short-vol"), "Short Volatility", "formatStrategy short-vol");
check(formatStrategy("directional"), "Directional", "formatStrategy directional");
check(formatStrategy("unknown"), "unknown", "formatStrategy unknown passthrough");

console.log("All format checks passed.");
