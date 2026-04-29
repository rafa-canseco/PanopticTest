import type { Campaign } from "@/lib/types";

export const campaigns: Campaign[] = [
  {
    id: "lending-depth-sprint",
    name: "Lending Depth Sprint",
    startDate: "2026-04-01",
    endDate: "2026-04-07",
    multiplier: 1.2,
    minActiveHours: 12,
    eligibleStrategies: ["lending-vault"],
    description: "Boost lending vault depth available to traders during week 1.",
  },
  {
    id: "gamma-week",
    name: "Gamma Week",
    startDate: "2026-04-08",
    endDate: "2026-04-14",
    multiplier: 1.3,
    minActiveHours: 12,
    eligibleStrategies: ["gamma-scalping-vault", "long-vol"],
    description: "Highlight active volatility markets and long-vol participation.",
  },
  {
    id: "covered-call-yield-week",
    name: "Covered Call Yield Week",
    startDate: "2026-04-15",
    endDate: "2026-04-21",
    multiplier: 1.2,
    minActiveHours: 12,
    eligibleStrategies: ["covered-call-vault"],
    description: "Reward covered-call yield-oriented capital during week 3.",
  },
];
