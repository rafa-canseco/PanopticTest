"use client";

import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import { useCallback, useEffect, useRef } from "react";
import { flushSync } from "react-dom";

import { ArcMark } from "@/components/arc-mark";

const TOUR_FLAG = "hu-tour-seen";

const STEPS: DriveStep[] = [
  {
    popover: {
      title: "How HyperUnicorn Points work",
      description:
        "Points reward <strong>useful</strong> capital, not raw activity. Four pillars drive every score:<br/><br/><strong>① Capital</strong> — how much, time-weighted.<br/><strong>② Efficiency</strong> — how productive.<br/><strong>③ Seasonal</strong> — protocol-priority boosts.<br/><strong>④ Anti-churn</strong> — farming protection.",
    },
  },
  {
    element: '[data-tour="my-points"]',
    popover: {
      title: "Where points come from",
      description:
        "<strong>Vault points</strong> — capital deposited into a strategy vault (Lending, Covered Call, Gamma Scalping).<br/><br/><strong>Trader points</strong> — positions you run directly.<br/><br/>Both use the same formula.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="my-standing"]',
    popover: {
      title: "Your rank in the season",
      description:
        "Relative context only — the formula below decides the absolute score.",
      side: "left",
      align: "start",
    },
  },
  {
    element: '[data-tour="contribution"]',
    popover: {
      title: "Anatomy of a score",
      description:
        "Four stages, applied per row:<br/><br/><strong>① Base</strong> = capital × hours / 24 (USD-days).<br/><strong>② Quality</strong> 0.5×–1.5× — productive utilization. Below baseline → not counted.<br/><strong>③ Campaign</strong> 1.2×–1.3× — needs window + eligible strategy + ≥12h.<br/><strong>④ Churn</strong> — short-lived rows count at 25%.",
      side: "top",
      align: "start",
    },
  },
  {
    element: '[data-tour="top-activities"]',
    popover: {
      title: "The rows that actually paid",
      description:
        "Inputs on top (capital, hours, useful%), final points on the right after the full chain. Hover any underlined value for its definition.",
      side: "top",
      align: "start",
    },
  },
  {
    element: '[data-tour="eligibility"]',
    popover: {
      title: "Why campaigns boost (or don't)",
      description:
        "A row earns the boost only when <strong>all three</strong> hold: window match, eligible strategy, and ≥12h active. Miss any one — no multiplier.",
      side: "left",
      align: "start",
    },
  },
  {
    element: '[data-tour="tabs"]',
    popover: {
      title: "Compare against everyone",
      description:
        "The Leaderboard tab has the full ranking and the campaign cards with their windows, multipliers, and minimum hours.",
      side: "bottom",
      align: "center",
    },
  },
  {
    popover: {
      title: "That's the formula",
      description:
        "<strong>More capital × more time × more useful = more points.</strong> Everything on screen is computed live. Replay anytime from the header.",
    },
  },
];

interface TourButtonProps {
  /** Called right before the tour starts so the page can set state (e.g. switch to the My Score tab). */
  onBeforeStart?: () => void;
}

export function TourButton({ onBeforeStart }: TourButtonProps) {
  // Re-entrancy guard: prevents the auto-start setTimeout and a manual click
  // from racing into two driver instances.
  const startedRef = useRef(false);

  const start = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    // flushSync ensures any tab-state change in onBeforeStart is committed to
    // the DOM before driver.js reads selectors — otherwise the tour can fire
    // against elements that haven't been rendered yet.
    if (onBeforeStart) flushSync(() => onBeforeStart());
    const drv = driver({
      showProgress: true,
      progressText: "{{current}} / {{total}}",
      nextBtnText: "Next →",
      prevBtnText: "← Back",
      doneBtnText: "Got it",
      steps: STEPS,
      onDestroyed: () => {
        startedRef.current = false;
        try {
          localStorage.setItem(TOUR_FLAG, "1");
        } catch (err) {
          console.warn("Tour: localStorage unavailable, dismissal not persisted.", err);
        }
      },
    });
    drv.drive();
  }, [onBeforeStart]);

  // Auto-start on first visit.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let seen = false;
    try {
      seen = localStorage.getItem(TOUR_FLAG) === "1";
    } catch (err) {
      console.warn("Tour: localStorage unavailable, suppressing auto-start.", err);
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
