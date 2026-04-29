import { formatDateRange, formatMultiplier } from "@/lib/format";
import type { Campaign } from "@/lib/types";

interface CampaignPanelProps {
  campaigns: Campaign[];
}

export function CampaignPanel({ campaigns }: CampaignPanelProps) {
  return (
    <div className="rounded-lg border border-line bg-surface">
      <div className="border-b border-line px-4 py-3">
        <h2 className="text-sm font-bold text-ink">Active Campaigns</h2>
        <p className="mt-0.5 text-xs text-muted">
          Boosts apply only to eligible strategies and require the minimum active hours.
        </p>
      </div>
      <ul className="divide-y divide-line">
        {campaigns.map((c) => (
          <li key={c.id} className="px-4 py-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-sm font-bold text-ink">{c.name}</h3>
              <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand-light">
                {formatMultiplier(c.multiplier)}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">{c.description}</p>
            <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 text-xs sm:grid-cols-2">
              <div className="flex justify-between sm:block">
                <dt className="text-muted">Window</dt>
                <dd className="font-mono text-foreground">
                  {formatDateRange(c.startDate, c.endDate)}
                </dd>
              </div>
              <div className="flex justify-between sm:block">
                <dt className="text-muted">Min active hours</dt>
                <dd className="font-mono text-foreground">{c.minActiveHours}h</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted">Eligible strategies</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {c.eligibleStrategies.map((s) => (
                    <span
                      key={s}
                      className="rounded-md bg-elevated px-2 py-0.5 font-mono text-[11px] text-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}
