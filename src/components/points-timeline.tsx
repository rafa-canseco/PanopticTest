"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatPoints, formatShortDate, formatStrategy } from "@/lib/format";
import type { Campaign, EnrichedActivity } from "@/lib/types";

interface TooltipPayload {
  payload: DailyPoint;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

interface PointsTimelineProps {
  userName: string;
  activities: EnrichedActivity[];
  campaigns: Campaign[];
}

interface DailyPoint {
  date: string;
  cumulative: number;
  earnedToday: number;
  strategies: string[];
}

function dateToMs(iso: string): number {
  return new Date(`${iso}T00:00:00Z`).getTime();
}

function addDaysIso(start: string, offset: number): string {
  const d = new Date(`${start}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
}

function daysBetween(start: string, end: string): number {
  return Math.round((dateToMs(end) - dateToMs(start)) / 86_400_000);
}

function buildDailyCumulative(
  activities: EnrichedActivity[],
  seasonStart: string,
  seasonEnd: string,
): DailyPoint[] {
  const sorted = [...activities].sort((a, b) =>
    a.points.activity.date.localeCompare(b.points.activity.date),
  );

  // Group activity points by their date
  const byDate = new Map<string, { earned: number; strategies: string[] }>();
  for (const e of sorted) {
    const date = e.points.activity.date;
    const earned = e.points.breakdown.finalPoints;
    const existing = byDate.get(date);
    if (existing) {
      existing.earned += earned;
      existing.strategies.push(formatStrategy(e.points.activity.strategy));
    } else {
      byDate.set(date, {
        earned,
        strategies: [formatStrategy(e.points.activity.strategy)],
      });
    }
  }

  const days = daysBetween(seasonStart, seasonEnd);
  if (days < 0) {
    console.error(`PointsTimeline: invalid season window ${seasonStart} → ${seasonEnd}`);
    return [];
  }
  const result: DailyPoint[] = [];
  let running = 0;
  for (let i = 0; i <= days; i++) {
    const date = addDaysIso(seasonStart, i);
    const today = byDate.get(date);
    const earnedToday = today?.earned ?? 0;
    running += earnedToday;
    result.push({
      date,
      cumulative: running,
      earnedToday,
      strategies: today?.strategies ?? [],
    });
  }
  return result;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;
  return (
    <div className="border border-brand/40 bg-surface px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
        {formatShortDate(point.date)}
      </div>
      <div className="mt-1 font-mono text-base font-bold tabular-nums text-ink">
        {formatPoints(point.cumulative)}{" "}
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted">total</span>
      </div>
      {point.earnedToday > 0 ? (
        <div className="mt-1 font-mono text-xs tabular-nums text-success">
          +{formatPoints(point.earnedToday)} today
        </div>
      ) : (
        <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          no activity
        </div>
      )}
      {point.strategies.length > 0 ? (
        <div className="mt-1 max-w-[180px] text-[10px] text-foreground">
          {point.strategies.join(" · ")}
        </div>
      ) : null}
    </div>
  );
}

const AXIS_TICK = {
  fontFamily: "var(--font-mono), ui-monospace, monospace",
  fontSize: 10,
  fill: "rgba(168, 155, 200, 0.7)",
};

export function PointsTimeline({ userName, activities, campaigns }: PointsTimelineProps) {
  if (campaigns.length === 0) {
    return (
      <section className="border border-line bg-surface px-6 py-8" aria-label="Points timeline">
        <p className="text-sm text-muted">
          No season window configured — add at least one campaign to render the timeline.
        </p>
      </section>
    );
  }

  const seasonStart = campaigns.reduce(
    (min, c) => (c.startDate < min ? c.startDate : min),
    campaigns[0].startDate,
  );
  const seasonEnd = campaigns.reduce(
    (max, c) => (c.endDate > max ? c.endDate : max),
    campaigns[0].endDate,
  );

  const data = buildDailyCumulative(activities, seasonStart, seasonEnd);
  const total = data[data.length - 1]?.cumulative ?? 0;

  return (
    <section
      data-tour="points-timeline"
      className="border border-line bg-surface"
      aria-labelledby="timeline-heading"
    >
      <header className="border-b border-line px-6 py-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
          Points over time
        </div>
        <h2 id="timeline-heading" className="mt-1 text-lg font-bold tracking-tight text-ink">
          {userName}
          <span className="text-muted"> / season timeline</span>
        </h2>
        <p className="mt-2 text-sm text-muted">
          Hover anywhere on the chart to see the running total and what was earned that day.
          Shaded bands mark active campaigns.
        </p>
      </header>

      {total === 0 ? (
        <p className="px-6 py-8 text-sm text-muted">No activity to chart.</p>
      ) : (
        <div className="h-[260px] w-full px-2 py-4 sm:px-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 12, right: 16, left: -8, bottom: 4 }}
            >
              <defs>
                <linearGradient id="timeline-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9b6fff" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#9b6fff" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="2 4"
                stroke="rgba(78, 20, 208, 0.12)"
                vertical={false}
              />

              {campaigns.map((c) => (
                <ReferenceArea
                  key={c.id}
                  x1={c.startDate}
                  x2={c.endDate}
                  fill="rgba(78, 20, 208, 0.12)"
                  stroke="rgba(155, 111, 255, 0.3)"
                  strokeDasharray="2 3"
                  label={{
                    value: c.name,
                    position: "insideTop",
                    offset: 8,
                    style: {
                      fontFamily: "var(--font-mono), ui-monospace, monospace",
                      fontSize: 9,
                      fill: "rgba(168, 155, 200, 0.7)",
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                    },
                  }}
                  ifOverflow="extendDomain"
                />
              ))}

              <XAxis
                dataKey="date"
                tickFormatter={formatShortDate}
                tick={AXIS_TICK}
                stroke="rgba(168, 155, 200, 0.4)"
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={56}
              />
              <YAxis
                tickFormatter={(v: number) => formatPoints(v)}
                tick={AXIS_TICK}
                stroke="rgba(168, 155, 200, 0.4)"
                tickLine={false}
                axisLine={false}
                width={64}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: "#9b6fff",
                  strokeWidth: 1,
                  strokeDasharray: "2 4",
                }}
              />

              <Area
                type="stepAfter"
                dataKey="cumulative"
                stroke="#9b6fff"
                strokeWidth={2}
                fill="url(#timeline-fill)"
                isAnimationActive={false}
                activeDot={{
                  r: 5,
                  fill: "#9b6fff",
                  stroke: "#160934",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
