import { formatPoints } from "@/lib/format";
import type { UserPointsSummary } from "@/lib/types";

interface BreakdownChainProps {
  summary: UserPointsSummary;
}

function describeQuality(ratio: number): string {
  if (ratio < 0.99) {
    return `composite ${ratio.toFixed(2)}× — capital was active but below baseline productive`;
  }
  if (ratio < 1.01) return "baseline utilization, no quality adjustment";
  return `composite ${ratio.toFixed(2)}× — above-baseline productive utilization`;
}

function describeCampaign(delta: number): string {
  if (delta < 1) return "no campaign boost applied to this user's activity";
  return `+${formatPoints(delta)} from eligible campaign multipliers`;
}

interface StepProps {
  label: string;
  value: number;
  note?: string;
  emphasized?: boolean;
}

function Step({ label, value, note, emphasized = false }: StepProps) {
  return (
    <div className={emphasized ? "py-3" : "py-2.5"}>
      <div className="flex items-baseline justify-between gap-3">
        <div
          className={
            emphasized
              ? "text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
              : "text-sm text-zinc-700 dark:text-zinc-300"
          }
        >
          {label}
        </div>
        <div
          className={
            "tabular-nums " +
            (emphasized
              ? "text-2xl font-semibold text-zinc-950 dark:text-zinc-50"
              : "text-base font-semibold text-zinc-900 dark:text-zinc-100")
          }
        >
          {formatPoints(value)}
        </div>
      </div>
      {note ? (
        <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">{note}</div>
      ) : null}
    </div>
  );
}

interface CountedSplitProps {
  counted: number;
  discounted: number;
  countedPct: number;
}

function CountedSplit({ counted, discounted, countedPct }: CountedSplitProps) {
  const discountedPct = 100 - countedPct;
  const note =
    discounted > 0
      ? `Short-lived activity is counted at 25%; the remaining 75% is discounted to discourage open/close churn.`
      : `All pre-churn points counted — no short-lived activity to discount.`;

  return (
    <div className="py-3">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <div className="text-sm text-zinc-700 dark:text-zinc-300">Counted vs discounted</div>
        <div className="text-xs text-zinc-500 dark:text-zinc-500 tabular-nums">
          {countedPct.toFixed(0)}% counted
        </div>
      </div>
      <div
        className="flex h-2 overflow-hidden rounded-full bg-rose-200 dark:bg-rose-900/40"
        role="img"
        aria-label={`${countedPct.toFixed(0)} percent counted, ${discountedPct.toFixed(0)} percent discounted`}
      >
        <div
          className="bg-emerald-500 dark:bg-emerald-400"
          style={{ width: `${countedPct}%` }}
        />
      </div>
      <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-xs text-zinc-500 dark:text-zinc-500">Counted</dt>
          <dd className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
            {formatPoints(counted)}
          </dd>
        </div>
        <div className="text-right">
          <dt className="text-xs text-zinc-500 dark:text-zinc-500">Discounted</dt>
          <dd className="font-semibold tabular-nums text-rose-700 dark:text-rose-400">
            {formatPoints(discounted)}
          </dd>
        </div>
      </dl>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">{note}</p>
    </div>
  );
}

interface MiniProps {
  label: string;
  value: number;
  primary?: boolean;
}

function Mini({ label, value, primary = false }: MiniProps) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </div>
      <div
        className={
          "tabular-nums " +
          (primary
            ? "text-lg font-semibold text-zinc-950 dark:text-zinc-50"
            : "text-base font-semibold text-zinc-900 dark:text-zinc-100")
        }
      >
        {formatPoints(value)}
      </div>
    </div>
  );
}

export function BreakdownChain({ summary }: BreakdownChainProps) {
  const { breakdown } = summary;
  const afterQuality = breakdown.basePoints + breakdown.qualityUplift;
  const afterCampaigns = breakdown.preChurnPoints;
  const counted = breakdown.finalPoints;
  const discounted = breakdown.churnDiscount;
  const preChurn = afterCampaigns;

  const qualityRatio = breakdown.basePoints > 0 ? afterQuality / breakdown.basePoints : 1;
  const campaignDelta = afterCampaigns - afterQuality;
  const countedPct = preChurn > 0 ? (counted / preChurn) * 100 : 100;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <header className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
          {summary.user.name} — formula breakdown
        </h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Mini label="Vault" value={summary.vaultPoints} />
          <Mini label="Trader" value={summary.traderPoints} />
          <Mini label="Total" value={summary.totalPoints} primary />
        </div>
      </header>
      <div className="divide-y divide-zinc-100 px-4 dark:divide-zinc-800">
        <Step
          label="Active USD-days"
          value={breakdown.basePoints}
          note="time-weighted economic exposure: capital × hours / 24"
        />
        <Step
          label="After quality adjustment"
          value={afterQuality}
          note={describeQuality(qualityRatio)}
        />
        <Step
          label="After campaign boosts"
          value={afterCampaigns}
          note={describeCampaign(campaignDelta)}
        />
        <CountedSplit counted={counted} discounted={discounted} countedPct={countedPct} />
        <Step label="Final points" value={counted} emphasized />
      </div>
    </div>
  );
}
