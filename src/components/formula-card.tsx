interface Factor {
  symbol: string;
  name: string;
  formula: string;
  pillar: string;
  detail: string;
}

const FACTORS: Factor[] = [
  {
    symbol: "①",
    name: "USD-days · Capital",
    formula: "capital × hours / 24",
    pillar: "How much capital you commit, time-weighted by how long it stays active.",
    detail:
      "$100k active for a full day = 100,000 USD-days. The same $100k for half a day = 50,000. Time and size matter equally — snapshot deposits don't earn full credit.",
  },
  {
    symbol: "②",
    name: "Quality · Efficiency",
    formula: "0.50× · 1.00× · 1.25× · 1.50×",
    pillar: "How productive that capital actually was.",
    detail:
      "Quality is set by the row's useful ratio in four bands: under 0.40 → 0.50× (capital active but not productive), 0.40 to 0.70 → 1.00× (baseline), 0.70 to 0.90 → 1.25× (above baseline), 0.90 or higher → 1.50× (excellent). In-range, fee-generating, market-balancing capital lands in the higher bands.",
  },
  {
    symbol: "③",
    name: "Campaign · Seasonal",
    formula: "1.00× by default · 1.20× or 1.30× when boosted",
    pillar: "Boosts when the protocol needs that activity right now.",
    detail:
      "A row earns the campaign multiplier only if all three conditions hold: the date is inside the campaign's window, the strategy is on the eligible list, and the row is at least 12 hours active. Miss any one and the multiplier stays at 1.00×.",
  },
  {
    symbol: "④",
    name: "Churn · Anti-farming",
    formula: "0.25× short-lived · 1.00× otherwise",
    pillar: "Short-lived activity is discounted to discourage open/close farming.",
    detail:
      "Rows flagged short-lived count at 25% of pre-churn — three-quarters of those potential points don't count. Vault-managed rebalances (legitimate strategy maintenance, e.g. gamma scalping) are exempt from this discount.",
  },
];

interface FactorRowProps {
  factor: Factor;
}

function FactorRow({ factor }: FactorRowProps) {
  return (
    <details className="group border-b border-line last:border-b-0">
      <summary className="flex cursor-pointer list-none items-baseline gap-3 px-6 py-4 transition-colors hover:bg-elevated/50 focus:bg-elevated/50 focus:outline-none">
        <span className="font-mono text-sm text-brand-light shrink-0">{factor.symbol}</span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <span className="text-sm font-bold text-ink">{factor.name}</span>
            <span className="font-mono text-xs tabular-nums text-foreground">
              {factor.formula}
            </span>
          </div>
        </div>
        <span
          aria-hidden
          className="font-mono text-[10px] text-muted transition-transform group-open:rotate-180"
        >
          ▾
        </span>
      </summary>
      <div className="space-y-2 px-6 pb-5 pl-[3.4rem] sm:pl-14">
        <p className="text-sm font-medium text-foreground">{factor.pillar}</p>
        <p className="text-xs leading-relaxed text-muted">{factor.detail}</p>
      </div>
    </details>
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
          Click any factor below to expand its meaning.
        </p>
      </header>
      <div>
        {FACTORS.map((f) => (
          <FactorRow key={f.symbol} factor={f} />
        ))}
      </div>
    </section>
  );
}
