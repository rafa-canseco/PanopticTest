"use client";

import { useMemo, useState } from "react";

import {
  formatHours,
  formatMultiplier,
  formatPercent,
  formatPoints,
  formatUsd,
} from "@/lib/format";
import {
  calculateActivityPoints,
  getCampaignMultiplier,
  getChurnMultiplier,
  getQualityMultiplier,
} from "@/lib/points";
import type {
  ActivityCategory,
  ActivityRow,
  Campaign,
  Strategy,
  VaultType,
} from "@/lib/types";

interface SimulatorTabProps {
  campaigns: Campaign[];
}

interface StrategyMeta {
  category: ActivityCategory;
  vaultType?: VaultType;
}

const STRATEGY_META: Record<Strategy, StrategyMeta> = {
  "lending-vault": { category: "vault", vaultType: "lending" },
  "covered-call-vault": { category: "vault", vaultType: "covered-call" },
  "gamma-scalping-vault": { category: "vault", vaultType: "gamma-scalping" },
  "long-vol": { category: "trader" },
  "short-vol": { category: "trader" },
  "directional": { category: "trader" },
};

const STRATEGY_OPTIONS: Strategy[] = [
  "lending-vault",
  "covered-call-vault",
  "gamma-scalping-vault",
  "long-vol",
  "short-vol",
  "directional",
];

function addDaysIso(start: string, offset: number): string {
  const d = new Date(`${start}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
}

function daysBetween(start: string, end: string): number {
  const a = new Date(`${start}T00:00:00Z`).getTime();
  const b = new Date(`${end}T00:00:00Z`).getTime();
  return Math.round((b - a) / 86_400_000);
}

function findActiveCampaign(date: string, strategy: Strategy, campaigns: Campaign[]): Campaign | null {
  return (
    campaigns.find(
      (c) =>
        date >= c.startDate &&
        date <= c.endDate &&
        c.eligibleStrategies.includes(strategy),
    ) ?? null
  );
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
  display: string;
  hint?: string;
}

function Slider({ label, value, min, max, step, onChange, display, hint }: SliderProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-xs font-medium uppercase tracking-wide text-muted">
          {label}
        </label>
        <span className="font-mono text-sm text-ink tabular-nums">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="mt-1 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-elevated accent-brand-light focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
      />
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  hint?: string;
}

function Toggle({ label, checked, onChange, disabled = false, hint }: ToggleProps) {
  return (
    <label className={"flex items-start gap-2 " + (disabled ? "opacity-50" : "cursor-pointer")}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 cursor-pointer rounded border-line bg-elevated accent-brand-light focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
      />
      <span>
        <span className="text-sm text-foreground">{label}</span>
        {hint ? <span className="block text-xs text-muted">{hint}</span> : null}
      </span>
    </label>
  );
}

interface RowProps {
  label: string;
  value: string;
  emphasize?: boolean;
  tone?: "ink" | "muted" | "success";
}

function Row({ label, value, emphasize = false, tone = "ink" }: RowProps) {
  const valueClass =
    tone === "success"
      ? "text-success"
      : tone === "muted"
        ? "text-muted"
        : "text-ink";
  return (
    <div className={"flex items-baseline justify-between gap-3 " + (emphasize ? "py-2" : "py-1.5")}>
      <span className={emphasize ? "text-xs font-semibold uppercase tracking-wide text-muted" : "text-sm text-foreground"}>
        {label}
      </span>
      <span className={`tabular-nums ${valueClass} ${emphasize ? "text-xl font-bold" : "text-sm font-bold"}`}>
        {value}
      </span>
    </div>
  );
}

export function SimulatorTab({ campaigns }: SimulatorTabProps) {
  const seasonStart = useMemo(
    () =>
      campaigns.reduce((min, c) => (c.startDate < min ? c.startDate : min), campaigns[0].startDate),
    [campaigns],
  );
  const seasonEnd = useMemo(
    () => campaigns.reduce((max, c) => (c.endDate > max ? c.endDate : max), campaigns[0].endDate),
    [campaigns],
  );
  const seasonSpan = daysBetween(seasonStart, seasonEnd);

  const [capital, setCapital] = useState(100_000);
  const [hours, setHours] = useState(24);
  const [useful, setUseful] = useState(0.75);
  const [strategy, setStrategy] = useState<Strategy>("lending-vault");
  const [dayOffset, setDayOffset] = useState(8); // lands inside Gamma Week by default
  const [isShortLived, setIsShortLived] = useState(false);
  const [isVaultManagedRebalance, setIsVaultManagedRebalance] = useState(false);

  const meta = STRATEGY_META[strategy];
  const date = addDaysIso(seasonStart, dayOffset);
  const isVault = meta.category === "vault";

  // If the strategy flips to trader, the rebalance flag has no meaning.
  const effectiveRebalance = isVault && isVaultManagedRebalance;

  const probe: ActivityRow = {
    id: "sim-probe",
    userId: "sim-user",
    date,
    category: meta.category,
    strategy,
    vaultType: meta.vaultType,
    usdCapital: capital,
    activeHours: hours,
    usefulRatio: useful,
    isShortLived,
    isVaultManagedRebalance: effectiveRebalance,
  };

  const result = calculateActivityPoints(probe, campaigns);
  const qMult = getQualityMultiplier(useful);
  const cMult = getCampaignMultiplier(probe, campaigns);
  const chMult = getChurnMultiplier(probe);

  const activeCampaign = findActiveCampaign(date, strategy, campaigns);
  // A campaign matched the date+strategy but the multiplier didn't apply (under min hours)
  const campaignBlockedBy =
    activeCampaign && cMult === 1 ? `under ${activeCampaign.minActiveHours}h minimum` : null;

  const dateHint = activeCampaign
    ? campaignBlockedBy
      ? `${activeCampaign.name} — ${campaignBlockedBy}`
      : `inside ${activeCampaign.name} (×${activeCampaign.multiplier.toFixed(2)})`
    : "outside any campaign window for this strategy";

  const counted = result.breakdown.finalPoints;
  const discounted = result.breakdown.churnDiscount;
  const preChurn = result.breakdown.preChurnPoints;
  const countedPct = preChurn > 0 ? (counted / preChurn) * 100 : 100;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-line bg-surface p-4">
        <h2 className="text-sm font-bold text-ink">Points simulator</h2>
        <p className="mt-0.5 text-xs text-muted">
          Drag the sliders to see how a single activity row scores. Engine functions
          are called live — the math here is the same one applied to every user.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* INPUTS */}
        <div className="rounded-lg border border-line bg-surface p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Inputs</h3>
          <div className="mt-4 space-y-4">
            <Slider
              label="USD capital"
              value={capital}
              min={0}
              max={1_000_000}
              step={5_000}
              onChange={setCapital}
              display={formatUsd(capital)}
            />
            <Slider
              label="Active hours / day"
              value={hours}
              min={0}
              max={24}
              step={0.5}
              onChange={setHours}
              display={formatHours(hours)}
            />
            <Slider
              label="Useful ratio"
              value={useful}
              min={0}
              max={1}
              step={0.01}
              onChange={setUseful}
              display={formatPercent(useful)}
              hint={`Current band: ${formatMultiplier(qMult)} quality factor`}
            />
            <div>
              <label
                htmlFor="sim-strategy"
                className="text-xs font-medium uppercase tracking-wide text-muted"
              >
                Strategy
              </label>
              <select
                id="sim-strategy"
                value={strategy}
                onChange={(e) => setStrategy(e.target.value as Strategy)}
                className="mt-1 w-full rounded-md border border-line bg-elevated px-3 py-1.5 font-mono text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-light"
              >
                {STRATEGY_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s} ({STRATEGY_META[s].category})
                  </option>
                ))}
              </select>
            </div>
            <Slider
              label="Date"
              value={dayOffset}
              min={0}
              max={seasonSpan}
              step={1}
              onChange={setDayOffset}
              display={`Day ${dayOffset + 1} — ${date}`}
              hint={dateHint}
            />
            <div className="space-y-2 pt-2">
              <Toggle
                label="Short-lived activity"
                checked={isShortLived}
                onChange={setIsShortLived}
                hint="quick open/close — flagged as farming churn"
              />
              <Toggle
                label="Vault-managed rebalance"
                checked={isVaultManagedRebalance}
                onChange={setIsVaultManagedRebalance}
                disabled={!isVault}
                hint={
                  isVault
                    ? "exempts the row from churn discount (e.g. gamma scalping rebalance)"
                    : "only valid for vault strategies"
                }
              />
            </div>
          </div>
        </div>

        {/* RESULT */}
        <div className="rounded-lg border border-line bg-surface p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Result</h3>
          <div className="mt-3 divide-y divide-line">
            <Row
              label="Active USD-days"
              value={formatPoints(result.breakdown.basePoints)}
              tone="muted"
            />
            <Row
              label="After quality"
              value={formatPoints(result.breakdown.basePoints + result.breakdown.qualityUplift)}
            />
            <Row label="After campaign boost" value={formatPoints(preChurn)} />

            <div className="py-3">
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <span className="text-sm text-foreground">Counted vs discounted</span>
                <span className="text-xs tabular-nums text-muted">
                  {countedPct.toFixed(0)}% counted
                </span>
              </div>
              <div
                className="flex h-2 overflow-hidden rounded-full bg-elevated"
                role="img"
                aria-label={`${countedPct.toFixed(0)} percent counted`}
              >
                <div className="bg-success" style={{ width: `${countedPct}%` }} />
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-xs text-muted">Counted</div>
                  <div className="font-bold tabular-nums text-success">{formatPoints(counted)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted">Discounted</div>
                  <div className="font-bold tabular-nums text-muted">{formatPoints(discounted)}</div>
                </div>
              </div>
            </div>

            <Row label="Final points" value={formatPoints(counted)} emphasize tone="ink" />
          </div>

          <div className="mt-4 rounded-md border border-line bg-elevated/40 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              Live multipliers
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 font-mono text-sm">
              <div>
                <div className="text-[11px] text-muted">Quality</div>
                <div className="font-bold tabular-nums text-ink">{formatMultiplier(qMult)}</div>
              </div>
              <div>
                <div className="text-[11px] text-muted">Campaign</div>
                <div
                  className={
                    "font-bold tabular-nums " +
                    (cMult > 1 ? "text-success" : "text-muted")
                  }
                >
                  {formatMultiplier(cMult)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-muted">Churn</div>
                <div
                  className={
                    "font-bold tabular-nums " +
                    (chMult < 1 ? "text-rose-400" : "text-muted")
                  }
                >
                  {formatMultiplier(chMult)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
