import { formatDateRange, formatMultiplier } from "@/lib/format";
import type { Campaign } from "@/lib/types";

interface CampaignPanelProps {
  campaigns: Campaign[];
}

export function CampaignPanel({ campaigns }: CampaignPanelProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
          Active Campaigns
        </h2>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          Boosts apply only to eligible strategies and require the minimum active hours.
        </p>
      </div>
      <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {campaigns.map((c) => (
          <li key={c.id} className="px-4 py-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{c.name}</h3>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                {formatMultiplier(c.multiplier)}
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{c.description}</p>
            <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 text-xs sm:grid-cols-2">
              <div className="flex justify-between sm:block">
                <dt className="text-zinc-500 dark:text-zinc-500">Window</dt>
                <dd className="font-mono text-zinc-700 dark:text-zinc-300">
                  {formatDateRange(c.startDate, c.endDate)}
                </dd>
              </div>
              <div className="flex justify-between sm:block">
                <dt className="text-zinc-500 dark:text-zinc-500">Min active hours</dt>
                <dd className="font-mono text-zinc-700 dark:text-zinc-300">{c.minActiveHours}h</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-zinc-500 dark:text-zinc-500">Eligible strategies</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {c.eligibleStrategies.map((s) => (
                    <span
                      key={s}
                      className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[11px] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
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
