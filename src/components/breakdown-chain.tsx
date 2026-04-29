import { formatMultiplier, formatPoints, formatSignedPoints } from "@/lib/format";
import type { UserPointsSummary } from "@/lib/types";

interface BreakdownChainProps {
  summary: UserPointsSummary;
}

function describeQuality(ratio: number): string {
  if (ratio < 0.99) return "below baseline · capital active but not productive";
  if (ratio < 1.01) return "baseline utilization · no adjustment";
  return "above baseline · productive utilization";
}

function describeCampaign(delta: number): string {
  if (delta < 1) return "no campaign multiplier earned";
  return "boost from eligible campaign multipliers";
}

interface StepProps {
  index: string;
  label: string;
  value: number;
  detail?: string;
  meta?: string;
}

function Step({ index, label, value, detail, meta }: StepProps) {
  return (
    <div className="flex gap-4 py-5 sm:gap-6">
      <span className="select-none font-mono text-[10px] tracking-normal text-line">{index}</span>
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">{label}</div>
        <div className="mt-1 text-3xl font-bold leading-none tracking-[-0.025em] tabular-nums text-ink sm:text-4xl">
          {formatPoints(value)}
        </div>
        {detail ? <div className="mt-2 text-xs text-foreground">{detail}</div> : null}
        {meta ? <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">{meta}</div> : null}
      </div>
    </div>
  );
}

interface ConnectorProps {
  label: string;
  tone?: "neutral" | "positive";
}

function Connector({ label, tone = "neutral" }: ConnectorProps) {
  const color = tone === "positive" ? "text-brand-light" : "text-muted";
  return (
    <div className="ml-1 flex items-center gap-3 pl-3 pr-2">
      <span className="text-line" aria-hidden>
        ↓
      </span>
      <span className={`font-mono text-[10px] uppercase tracking-[0.18em] ${color}`}>{label}</span>
      <span aria-hidden className="h-px flex-1 bg-line" />
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
    <div className="flex gap-4 py-5 sm:gap-6">
      <span className="select-none font-mono text-[10px] text-line">04</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
            Counted vs discounted
          </div>
          <span className="font-mono text-[11px] tabular-nums text-muted">
            {countedPct.toFixed(0)}% counted
          </span>
        </div>
        <div
          className="mt-3 flex h-2 overflow-hidden bg-elevated"
          role="img"
          aria-label={`${countedPct.toFixed(0)} percent counted, ${discountedPct.toFixed(0)} percent discounted`}
        >
          <div className="bg-success" style={{ width: `${countedPct}%` }} />
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Counted</dt>
            <dd className="mt-0.5 text-xl font-bold tabular-nums text-success">
              {formatPoints(counted)}
            </dd>
          </div>
          <div className="text-right">
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
              Discounted
            </dt>
            <dd className="mt-0.5 text-xl font-bold tabular-nums text-muted">
              {formatPoints(discounted)}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-foreground">{note}</p>
      </div>
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
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{label}</div>
      <div
        className={
          "mt-1 tabular-nums " +
          (primary
            ? "text-2xl font-bold tracking-tight text-ink"
            : "text-lg font-bold text-foreground")
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

  const qualityDelta = afterQuality - breakdown.basePoints;
  const churnPct = preChurn > 0 ? (1 - counted / preChurn) * 100 : 0;

  return (
    <section
      className="border border-line bg-surface"
      aria-labelledby="breakdown-heading"
    >
      <header className="border-b border-line px-6 py-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
          Section · Formula
        </div>
        <h2 id="breakdown-heading" className="mt-1 text-lg font-bold tracking-tight text-ink">
          {summary.user.name}
          <span className="text-muted"> / breakdown</span>
        </h2>
        <div className="mt-5 grid grid-cols-3 gap-4">
          <Mini label="Vault" value={summary.vaultPoints} />
          <Mini label="Trader" value={summary.traderPoints} />
          <Mini label="Total" value={summary.totalPoints} primary />
        </div>
      </header>

      <div className="px-6">
        <Step
          index="01"
          label="Active USD-days"
          value={breakdown.basePoints}
          detail="time-weighted economic exposure"
          meta="capital × hours / 24"
        />
        <Connector
          label={`Quality ${formatMultiplier(qualityRatio)} · ${formatSignedPoints(qualityDelta)}`}
          tone={qualityDelta > 0 ? "positive" : "neutral"}
        />
        <Step
          index="02"
          label="After quality adjustment"
          value={afterQuality}
          detail={describeQuality(qualityRatio)}
        />
        <Connector
          label={
            campaignDelta > 0
              ? `Campaign · ${formatSignedPoints(campaignDelta)}`
              : `Campaign · no boost`
          }
          tone={campaignDelta > 0 ? "positive" : "neutral"}
        />
        <Step
          index="03"
          label="After campaign boosts"
          value={afterCampaigns}
          detail={describeCampaign(campaignDelta)}
        />
        <Connector
          label={
            discounted > 0
              ? `Churn · ${churnPct.toFixed(0)}% discounted`
              : `Churn · all counted`
          }
          tone={discounted > 0 ? "neutral" : "positive"}
        />
        <CountedSplit counted={counted} discounted={discounted} countedPct={countedPct} />
      </div>

      {/* Final points — treated as a poster */}
      <div className="border-t border-line bg-elevated/40 px-6 py-7">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand-light">
              ✦ Final points
            </div>
            <div className="mt-1 text-5xl font-bold leading-none tracking-[-0.035em] tabular-nums text-ink sm:text-6xl">
              {formatPoints(counted)}
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
              Counted at
            </div>
            <div className="mt-0.5 text-2xl font-bold tabular-nums text-success">
              {countedPct.toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
