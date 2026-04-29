interface RowProps {
  symbol: string;
  factor: string;
  values: string;
  hint: string;
}

function FactorRow({ symbol, factor, values, hint }: RowProps) {
  return (
    <li className="flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-baseline sm:gap-6">
      <div className="flex items-baseline gap-2 sm:w-44 sm:shrink-0">
        <span className="font-mono text-sm text-brand-light">{symbol}</span>
        <span className="text-sm font-bold text-ink">{factor}</span>
      </div>
      <div className="flex-1">
        <div className="font-mono text-sm tabular-nums text-foreground">{values}</div>
        <div className="mt-0.5 text-xs text-muted">{hint}</div>
      </div>
    </li>
  );
}

export function FormulaCard() {
  return (
    <section
      className="border border-line bg-surface"
      aria-labelledby="formula-heading"
    >
      <header className="border-b border-line px-6 py-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
          Reference
        </div>
        <h2 id="formula-heading" className="mt-1 text-lg font-bold tracking-tight text-ink">
          The exact formula
        </h2>
        <p className="mt-3 overflow-x-auto rounded-sm border border-line bg-bg/60 px-4 py-3 font-mono text-sm tabular-nums text-ink">
          Final = (capital × hours / 24) × Quality × Campaign × Churn
        </p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
          where capital × hours / 24 = USD-days
        </p>
      </header>
      <ul className="divide-y divide-line">
        <FactorRow
          symbol="①"
          factor="USD-days"
          values="capital × hours / 24"
          hint="time-weighted economic exposure — sum of all activity rows"
        />
        <FactorRow
          symbol="②"
          factor="Quality"
          values="0.50× · 1.00× · 1.25× · 1.50×"
          hint="bands by useful ratio: <0.40 / [0.40, 0.70) / [0.70, 0.90) / ≥0.90"
        />
        <FactorRow
          symbol="③"
          factor="Campaign"
          values="1.00× by default · 1.20× or 1.30× when boosted"
          hint="boost requires: in-window date AND eligible strategy AND ≥12h active"
        />
        <FactorRow
          symbol="④"
          factor="Churn"
          values="0.25× short-lived · 1.00× otherwise"
          hint="vault-managed rebalances are exempt from the discount"
        />
      </ul>
    </section>
  );
}
