"use client";

import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import { useCallback, useEffect } from "react";

import { ArcMark } from "@/components/arc-mark";

const TOUR_FLAG = "hu-tour-seen";

const STEPS: DriveStep[] = [
  {
    popover: {
      title: "How HyperUnicorn Points work",
      description:
        "Points reward useful capital, not raw activity. The formula has four pillars:<br/><br/><strong>① Capital</strong> — how much you commit, time-weighted.<br/><strong>② Efficiency</strong> — how productive that capital stays.<br/><strong>③ Seasonal</strong> — boosts when the protocol needs it.<br/><strong>④ Anti-churn</strong> — short-lived activity is discounted (farming protection).<br/><br/>~30 seconds to walk through how each one shows up in your score.",
    },
  },
  {
    element: '[data-tour="user-selector"]',
    popover: {
      title: "5 mock users, 5 patterns",
      description:
        "Switch users to compare behaviors against the same formula: steady vault deposits, idle whale capital, short-lived churn, focused trading, mixed activity. Same math, very different totals.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: '[data-tour="my-points"]',
    popover: {
      title: "Where points come from",
      description:
        "Every activity row earns points individually, then they sum up. The total splits two ways:<br/><br/><strong>Vault points</strong> — capital deposited into strategy vaults (Lending, Covered Call, Gamma Scalping). The vault manages it for you.<br/><br/><strong>Trader points</strong> — positions you open and run directly.<br/><br/>Both paths use the exact same formula.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="my-standing"]',
    popover: {
      title: "Your rank in the season",
      description:
        "Where this user lands among everyone scoring the same season. Useful as relative context — your absolute score still depends on the formula below.",
      side: "left",
      align: "start",
    },
  },
  {
    element: '[data-tour="contribution"]',
    popover: {
      title: "Anatomy of a score",
      description:
        "Each row of activity goes through a four-stage chain.<br/><br/><strong>① Base activity</strong> = capital × hours / 24 → time-weighted USD-days. Capital active longer → more points.<br/><br/><strong>② Quality</strong> 0.5× to 1.5× — rewards productive utilization (in-range, fee-generating, balancing the market). Below baseline becomes <em>potential not counted</em>.<br/><br/><strong>③ Campaign boost</strong> +1.2× to 1.3× — only when the activity is in a campaign window, on an eligible strategy, and ≥12h active.<br/><br/><strong>④ Churn protection</strong> — short-lived rows count at 25%. Quick open/close farming gets discounted, not rewarded.",
      side: "top",
      align: "start",
    },
  },
  {
    element: '[data-tour="top-activities"]',
    popover: {
      title: "The rows that actually paid",
      description:
        "Each row shows what fed the formula — capital, hours active, useful ratio. The number on the right is the row's <em>final</em> points: capital × hours × quality × campaign × churn, all together.",
      side: "top",
      align: "start",
    },
  },
  {
    element: '[data-tour="eligibility"]',
    popover: {
      title: "Why some campaigns boosted (and some didn't)",
      description:
        "Campaigns reward protocol priorities — Lending Sprint for vault depth, Gamma Week for volatility, Covered Call Yield Week for short-vol yield. To earn the boost, an activity needs all three: <strong>date inside the window</strong>, <strong>eligible strategy</strong>, and <strong>≥12h active hours</strong>. Miss any one and the multiplier doesn't apply.",
      side: "left",
      align: "start",
    },
  },
  {
    element: '[data-tour="tabs"]',
    popover: {
      title: "Compare against everyone",
      description:
        "The Leaderboard tab shows all five users ranked, plus the active campaign cards in detail (windows, multipliers, eligible strategies, minimum hours).",
      side: "bottom",
      align: "center",
    },
  },
  {
    popover: {
      title: "That's the formula",
      description:
        "<strong>More capital × more time × more useful = more points.</strong> Each piece on screen is computed live from the engine — no hardcoded values. Replay this anytime from the header.",
    },
  },
];

interface TourButtonProps {
  /** Called right before the tour starts so the page can set state (e.g. switch to the My Score tab). */
  onBeforeStart?: () => void;
}

export function TourButton({ onBeforeStart }: TourButtonProps) {
  const start = useCallback(() => {
    onBeforeStart?.();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const drv = driver({
          showProgress: true,
          progressText: "{{current}} / {{total}}",
          nextBtnText: "Next →",
          prevBtnText: "← Back",
          doneBtnText: "Got it",
          steps: STEPS,
          onDestroyed: () => {
            try {
              localStorage.setItem(TOUR_FLAG, "1");
            } catch {
              // localStorage may be unavailable (private mode, etc.). Skip silently.
            }
          },
        });
        drv.drive();
      });
    });
  }, [onBeforeStart]);

  // Auto-start on first visit.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let seen = false;
    try {
      seen = localStorage.getItem(TOUR_FLAG) === "1";
    } catch {
      seen = true;
    }
    if (seen) return;
    const timer = setTimeout(start, 700);
    return () => clearTimeout(timer);
  }, [start]);

  return (
    <button
      type="button"
      onClick={start}
      aria-label="Learn how points are calculated"
      className="tour-glow group inline-flex items-center gap-2.5 self-start border border-brand-light bg-gradient-to-r from-brand to-brand-light px-4 py-2.5 text-sm font-medium text-ink transition-all duration-200 hover:from-brand-light hover:to-brand-light focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-light focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
    >
      <ArcMark
        size={18}
        variant="ink"
        className="shrink-0 transition-transform duration-300 group-hover:rotate-[20deg]"
      />
      <span className="tracking-tight">How are points calculated?</span>
      <span aria-hidden className="font-mono text-xs text-ink/70 transition-transform group-hover:translate-x-0.5">
        →
      </span>
    </button>
  );
}
