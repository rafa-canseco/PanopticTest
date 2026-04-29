import { formatPoints } from "@/lib/format";
import type { Campaign, EnrichedActivity } from "@/lib/types";

interface PointsTimelineProps {
  userName: string;
  activities: EnrichedActivity[];
  campaigns: Campaign[];
}

// Layout constants (SVG units, not pixels)
const VIEW_W = 800;
const VIEW_H = 240;
const PAD_LEFT = 56;
const PAD_RIGHT = 16;
const PAD_TOP = 28;
const PAD_BOTTOM = 36;
const PLOT_W = VIEW_W - PAD_LEFT - PAD_RIGHT;
const PLOT_H = VIEW_H - PAD_TOP - PAD_BOTTOM;

function dateToMs(iso: string): number {
  return new Date(`${iso}T00:00:00Z`).getTime();
}

interface CumulativeRow {
  date: string;
  strategy: string;
  finalPoints: number;
  running: number;
}

function buildStepPolyline(
  rows: CumulativeRow[],
  xFor: (iso: string) => number,
  yFor: (val: number) => number,
): string {
  const points: string[] = [`${PAD_LEFT},${yFor(0)}`];
  let prev = 0;
  for (const p of rows) {
    const x = xFor(p.date);
    points.push(`${x},${yFor(prev)}`);
    points.push(`${x},${yFor(p.running)}`);
    prev = p.running;
  }
  points.push(`${PAD_LEFT + PLOT_W},${yFor(prev)}`);
  return points.join(" ");
}

function buildCumulative(activities: EnrichedActivity[]): {
  rows: CumulativeRow[];
  total: number;
} {
  const rows: CumulativeRow[] = [];
  let running = 0;
  for (const a of activities) {
    const finalPoints = a.points.breakdown.finalPoints;
    running += finalPoints;
    rows.push({
      date: a.points.activity.date,
      strategy: a.points.activity.strategy,
      finalPoints,
      running,
    });
  }
  return { rows, total: running };
}

export function PointsTimeline({ userName, activities, campaigns }: PointsTimelineProps) {
  const sorted = [...activities].sort((a, b) =>
    a.points.activity.date.localeCompare(b.points.activity.date),
  );

  // Season window from campaign extents (one source of truth)
  const seasonStart = campaigns.reduce(
    (min, c) => (c.startDate < min ? c.startDate : min),
    campaigns[0].startDate,
  );
  const seasonEnd = campaigns.reduce(
    (max, c) => (c.endDate > max ? c.endDate : max),
    campaigns[0].endDate,
  );
  const startMs = dateToMs(seasonStart);
  const endMs = dateToMs(seasonEnd);
  const totalMs = Math.max(endMs - startMs, 1);

  const { rows: cumulativePoints, total: totalCumulative } = buildCumulative(sorted);

  const xFor = (iso: string): number =>
    PAD_LEFT + ((dateToMs(iso) - startMs) / totalMs) * PLOT_W;
  const yFor = (val: number): number => {
    if (totalCumulative === 0) return PAD_TOP + PLOT_H;
    return PAD_TOP + PLOT_H - (val / totalCumulative) * PLOT_H;
  };

  const linePoints = buildStepPolyline(cumulativePoints, xFor, yFor);

  // Build the same polyline as a closed area (for a faint fill)
  const areaPoints = `${linePoints} ${PAD_LEFT + PLOT_W},${yFor(0)} ${PAD_LEFT},${yFor(0)}`;

  // Y-axis ticks at 25%, 50%, 75%, 100%
  const ticks = [0.25, 0.5, 0.75, 1].map((frac) => ({
    frac,
    value: frac * totalCumulative,
    y: yFor(frac * totalCumulative),
  }));

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
          Cumulative final points across the season. Each step is one activity row; shaded bands
          mark active campaigns.
        </p>
      </header>
      {sorted.length === 0 || totalCumulative === 0 ? (
        <p className="px-6 py-8 text-sm text-muted">No activity to chart.</p>
      ) : (
        <div className="px-3 pb-3 pt-4 sm:px-5 sm:pt-5">
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="block w-full"
            role="img"
            aria-label={`${userName} cumulative points from ${seasonStart} to ${seasonEnd}`}
          >
            {/* Campaign window bands */}
            {campaigns.map((c) => {
              const x1 = xFor(c.startDate);
              const x2 = xFor(c.endDate);
              return (
                <g key={c.id}>
                  <rect
                    x={x1}
                    y={PAD_TOP}
                    width={Math.max(x2 - x1, 1)}
                    height={PLOT_H}
                    fill="rgba(78, 20, 208, 0.1)"
                  />
                  <line
                    x1={x1}
                    x2={x1}
                    y1={PAD_TOP}
                    y2={PAD_TOP + PLOT_H}
                    stroke="rgba(155, 111, 255, 0.25)"
                    strokeDasharray="2 3"
                  />
                  <line
                    x1={x2}
                    x2={x2}
                    y1={PAD_TOP}
                    y2={PAD_TOP + PLOT_H}
                    stroke="rgba(155, 111, 255, 0.25)"
                    strokeDasharray="2 3"
                  />
                  <text
                    x={(x1 + x2) / 2}
                    y={PAD_TOP - 8}
                    textAnchor="middle"
                    fontSize="9"
                    fontFamily="var(--font-mono), ui-monospace, monospace"
                    fill="rgba(168, 155, 200, 0.75)"
                    style={{ letterSpacing: "0.16em", textTransform: "uppercase" }}
                  >
                    {c.name}
                  </text>
                </g>
              );
            })}

            {/* Y-axis tick lines + labels */}
            {ticks.map((t) => (
              <g key={t.frac}>
                <line
                  x1={PAD_LEFT}
                  x2={PAD_LEFT + PLOT_W}
                  y1={t.y}
                  y2={t.y}
                  stroke="rgba(78, 20, 208, 0.1)"
                />
                <text
                  x={PAD_LEFT - 6}
                  y={t.y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fontFamily="var(--font-mono), ui-monospace, monospace"
                  fill="rgba(168, 155, 200, 0.7)"
                >
                  {formatPoints(t.value)}
                </text>
              </g>
            ))}

            {/* Baseline */}
            <line
              x1={PAD_LEFT}
              x2={PAD_LEFT + PLOT_W}
              y1={yFor(0)}
              y2={yFor(0)}
              stroke="rgba(168, 155, 200, 0.4)"
            />

            {/* Area fill (under the curve) */}
            <polygon points={areaPoints} fill="rgba(155, 111, 255, 0.12)" />

            {/* Cumulative step line */}
            <polyline
              points={linePoints}
              fill="none"
              stroke="#9b6fff"
              strokeWidth="2"
              strokeLinejoin="miter"
              strokeLinecap="butt"
            />

            {/* Activity markers */}
            {cumulativePoints.map((p) => (
              <g key={p.date + p.strategy}>
                <circle
                  cx={xFor(p.date)}
                  cy={yFor(p.running)}
                  r="4"
                  fill="#9b6fff"
                  stroke="#160934"
                  strokeWidth="2"
                />
                <title>{`${p.date} · ${p.strategy} · +${formatPoints(p.finalPoints)} → ${formatPoints(p.running)}`}</title>
              </g>
            ))}

            {/* X-axis date labels */}
            <text
              x={PAD_LEFT}
              y={VIEW_H - 12}
              textAnchor="start"
              fontSize="9"
              fontFamily="var(--font-mono), ui-monospace, monospace"
              fill="rgba(168, 155, 200, 0.7)"
            >
              {seasonStart}
            </text>
            <text
              x={PAD_LEFT + PLOT_W}
              y={VIEW_H - 12}
              textAnchor="end"
              fontSize="9"
              fontFamily="var(--font-mono), ui-monospace, monospace"
              fill="rgba(168, 155, 200, 0.7)"
            >
              {seasonEnd}
            </text>
          </svg>
        </div>
      )}
    </section>
  );
}
