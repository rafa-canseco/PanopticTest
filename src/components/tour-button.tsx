"use client";

import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import { useCallback, useEffect } from "react";

const TOUR_FLAG = "hu-tour-seen";

const STEPS: DriveStep[] = [
  {
    popover: {
      title: "HyperUnicorn Points",
      description:
        "This dashboard answers three questions about your score. Let me walk you through each one — about 30 seconds.",
    },
  },
  {
    element: '[data-tour="user-selector"]',
    popover: {
      title: "Pick a user",
      description:
        "Switch between mock users to see their score. Each one tells a different story — high quality, low utilization, churned activity, and so on.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: '[data-tour="my-points"]',
    popover: {
      title: "Q1 — How many points?",
      description:
        "Your total for the season, broken down into points earned from vault deposits and direct trading.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="my-standing"]',
    popover: {
      title: "Q2 — Where do I stand?",
      description: "Your rank in the season — out of all users with activity.",
      side: "left",
      align: "start",
    },
  },
  {
    element: '[data-tour="contribution"]',
    popover: {
      title: "Q3 — Why this score?",
      description:
        "Your base activity flows through quality, campaign, and churn. Each line is either points earned or potential points not counted — never negative points.",
      side: "top",
      align: "start",
    },
  },
  {
    element: '[data-tour="top-activities"]',
    popover: {
      title: "Where points came from",
      description:
        "The top contributing rows for this user, ranked by final points. Capital, hours, and useful ratio appear inline so you can read the story.",
      side: "top",
      align: "start",
    },
  },
  {
    element: '[data-tour="eligibility"]',
    popover: {
      title: "Campaign matchups",
      description:
        "For each season campaign, see whether the user qualified, partially qualified, or didn't — and why. The minimum-active-hours rule shows up here.",
      side: "left",
      align: "start",
    },
  },
  {
    element: '[data-tour="tabs"]',
    popover: {
      title: "Switch to Leaderboard",
      description:
        "The second tab gives you the full ranking of all users plus the active campaign cards.",
      side: "bottom",
      align: "center",
    },
  },
  {
    popover: {
      title: "You're set",
      description:
        "Everything you saw is computed live from the points engine — no hardcoded values. Replay the tour anytime from the header.",
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
    // Two RAFs to ensure React has flushed any tab change before the
    // driver tries to highlight elements that only render in that tab.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const drv = driver({
          showProgress: true,
          progressText: "{{current}} / {{total}}",
          nextBtnText: "Next →",
          prevBtnText: "← Back",
          doneBtnText: "Done",
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
      seen = true; // pretend seen if we can't read storage
    }
    if (seen) return;
    const timer = setTimeout(start, 700);
    return () => clearTimeout(timer);
  }, [start]);

  return (
    <button
      type="button"
      onClick={start}
      className="group inline-flex items-center gap-2 self-start border border-line bg-surface/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted transition-colors hover:border-brand/50 hover:bg-brand-soft hover:text-brand-light focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
      aria-label="Replay the dashboard tour"
    >
      <span aria-hidden className="text-brand-light">
        ●
      </span>
      <span>Take the tour</span>
    </button>
  );
}
