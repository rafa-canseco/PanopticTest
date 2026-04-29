import { ArcMark } from "@/components/arc-mark";
import { formatMultiplier } from "@/lib/format";
import type { Campaign } from "@/lib/types";

interface CampaignPanelProps {
  campaigns: Campaign[];
}

export function CampaignPanel({ campaigns }: CampaignPanelProps) {
  return (
    <section className="border border-line bg-surface" aria-labelledby="campaigns-heading">
      <header className="border-b border-line px-6 py-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
          Section · Active campaigns
        </div>
        <h2 id="campaigns-heading" className="mt-1 text-lg font-bold tracking-tight text-ink">
          Season multipliers
          <span className="text-muted">
            {" "}
            / {campaigns.length} configured
          </span>
        </h2>
        <p className="mt-2 text-sm text-muted">
          Boosts apply only to eligible strategies and require the minimum active hours.
        </p>
      </header>

      <ul className="grid grid-cols-1 divide-y divide-line lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        {campaigns.map((c, i) => {
          const index = String(i + 1).padStart(2, "0");
          return (
            <li key={c.id} className="relative overflow-hidden p-5 sm:p-6">
              {/* Decorative arc mark in the corner — the Panoptic motif */}
              <div
                aria-hidden
                className="pointer-events-none absolute -right-6 -top-6 opacity-25"
              >
                <ArcMark size={120} variant="soft" />
              </div>

              <div className="relative">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[10px] text-line">{index}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
                    Campaign
                  </span>
                </div>

                <h3 className="mt-2 text-xl font-bold leading-tight tracking-tight text-ink sm:text-2xl">
                  {c.name}
                </h3>

                {/* Multiplier — treated as stamp */}
                <div className="mt-4 inline-flex items-baseline gap-2 border border-brand bg-brand-soft px-3 py-1">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand-light">
                    Boost
                  </span>
                  <span className="font-mono text-2xl font-bold tabular-nums leading-none text-ink">
                    {formatMultiplier(c.multiplier)}
                  </span>
                </div>

                <p className="mt-4 text-sm text-foreground">{c.description}</p>

                {/* Spec strip */}
                <dl className="mt-5 space-y-2.5 border-t border-line pt-4">
                  <SpecRow label="Window" value={`${c.startDate} → ${c.endDate}`} mono />
                  <SpecRow label="Min active" value={`${c.minActiveHours}h`} mono />
                  <div>
                    <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                      Eligible
                    </dt>
                    <dd className="mt-1.5 flex flex-wrap gap-1.5">
                      {c.eligibleStrategies.map((s) => (
                        <span
                          key={s}
                          className="border border-line bg-bg/40 px-2 py-0.5 font-mono text-[11px] text-foreground"
                        >
                          {s}
                        </span>
                      ))}
                    </dd>
                  </div>
                </dl>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

interface SpecRowProps {
  label: string;
  value: string;
  mono?: boolean;
}

function SpecRow({ label, value, mono = false }: SpecRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">{label}</dt>
      <dd className={"text-sm text-foreground " + (mono ? "font-mono" : "")}>{value}</dd>
    </div>
  );
}
