# HyperUnicorn Points

HyperUnicorn Points is a mini points system for a hypothetical DeFi protocol where users can either deposit into managed vaults or create direct option-like positions using AMM liquidity.

**Goal:** show how a points program can reward meaningful protocol activity while reducing incentives for low-quality farming.

## TL;DR

**HyperUnicorn Points rewards useful capital, not raw activity.**

The scoring model is intentionally small:

```text
Daily Points = Active USD-days × Quality × Campaign × Churn
```

- **Active USD-days:** capital over time. The base conversion is **1 point per $1 active for 1 full day**. Example: $10,000 active for 12 hours becomes `10,000 × 12 / 24 = 5,000` base points.
- **Quality:** separates capital that is merely present from capital that is productive. Example: a lending vault dollar that is actually borrowed by traders should count more than a dollar sitting idle.
- **Campaign:** capped seasonal boosts for protocol priorities. Example: Gamma Week boosts eligible gamma or long-vol activity that stays active for at least 12 hours.
- **Churn:** discounts short-lived farming behavior. Example: rapid open/close activity counts at **25%**, while vault-managed rebalancing is not treated as churn.

The system separates **Vault Points** and **Trader Points** because vault users and direct traders create different kinds of value:

- **Vault users** provide stable capital.
- **Direct traders** create market activity and take structured risk.

The dashboard turns the formula into a user-facing scorecard:

1. How many points do I have?
2. Where do I stand relative to others?
3. How did my activity contribute to my score?

## Approach

We approached the points system as an incentive design problem, not just a scoring problem.

The goal was to reward behavior that would be valuable to HyperUnicorn even if points did not exist: capital staying active, vaults being utilized, traders taking real option-like exposure, and users supporting seasonal protocol priorities. We wanted the system to create a healthy flywheel instead of a short-term farming loop.

Before defining the formula, we looked at common DeFi points programs and their failure modes. Raw TVL rewards whales and mercenary capital. Raw volume rewards churn and wash trading. Referral-heavy systems invite Sybil behavior. Overly complex boost systems become hard to understand and easy to game.

That led to the core design principle:

> **Reward useful capital, not raw activity.**

From there, the system is built in layers:

1. **Measure capital over time** through Active USD-days.
2. **Adjust for usefulness** through a quality multiplier.
3. **Apply capped seasonal boosts** for protocol priorities.
4. **Discount short-lived farming** through a churn multiplier.

This structure lets HyperUnicorn reward both vault users and direct traders without pretending they contribute in the same way. Vault users provide stable capital. Direct traders create market activity and take structured risk. Both matter, but both need quality filters.

We also considered Panoptic-style behavior specifically. Gamma scalping and vault-managed rebalancing can involve frequent position updates, so the system avoids treating all movement as bad churn. The goal is to discount obvious open/close farming while preserving legitimate strategy maintenance.

Finally, we intentionally kept reward redemption out of the implementation. In a production version, points could potentially convert into stable credits that users can claim or auto-compound back into vaults. That would turn points into a retention and liquidity flywheel instead of a one-time token distribution. For this assignment, the focus is the scoring model and dashboard clarity.

## Decisions

**1. Use Active USD-days instead of raw TVL.** A dollar deposited for a few minutes is not worth the same as a dollar that stays active, gets deployed by a vault, or supports real trading activity.

**2. Score quality explicitly.** In traditional markets, market maker programs do not reward all liquidity equally. They reward liquidity that improves the market: tighter quotes, better depth, and reliable availability. I applied the same idea here by distinguishing a regular dollar from a useful dollar. Vault capital is scored by whether it is actually deployed into the strategy. Direct trader capital is scored by whether the position stayed economically active and in range.

**3. Use seasonal campaigns, but keep them capped and explicit.** Campaigns direct attention toward protocol priorities such as market events, protocol launches, volatility windows, new vault launches, or liquidity bootstrapping periods. Examples could include major macro announcements, ETH upgrade windows, or new vault launch weeks. Campaigns are not the core of the system; they are small boosts on top of useful capital.

**4. Discount obvious farming without punishing legitimate strategy maintenance or inexperienced users.** I chose to discount farmers rather than slash them. Out-of-range or low-quality activity earns less; it does not create negative points. A user who picks a poor range may be inexperienced rather than malicious, so the system should reduce rewards for unhelpful capital without treating every bad position as an attack.

Short-lived open/close activity only receives partial credit, but vault-managed rebalancing is not treated as churn. This matters because Panoptic-style gamma scalping can require frequent hedging or re-centering. The system should discourage low-quality farming, not penalize strategies that are active by design.

## Why These Decisions

I made these decisions to favor **long-term protocol health** over **short-term points farming**.

A points system can easily become a game where users optimize for rewards without improving the product. I wanted the opposite: points should amplify behavior that already helps HyperUnicorn work better. More useful capital should improve vault capacity, market depth, trading availability, and strategy execution.

The design borrows from what has worked in both DeFi and TradFi. From DeFi, I took the idea of seasons and clear campaign-based participation. From TradFi, I took the idea that not all liquidity is equally valuable: market maker programs reward liquidity quality, reliability, and usefulness, not just size.

That is why the system rewards Active USD-days, quality, and capped seasonal boosts instead of raw TVL or raw volume. It should be understandable enough for users, strict enough to reduce obvious farming, and flexible enough for HyperUnicorn to direct incentives toward the parts of the protocol that need support.

## Scoring Model

The exact formula is:

```text
Final Points = (capital × hours / 24) × Quality × Campaign × Churn
```

### 1. Active USD-days

```text
capital × hours / 24
```

This measures how much capital a user commits, time-weighted by how long it stays active.

**Example:**

```text
$100,000 active for 24 hours = 100,000 USD-days
$100,000 active for 12 hours = 50,000 USD-days
```

**Time and size matter together.** A snapshot deposit does not earn the same credit as capital that stays active for the full day.

### 2. Quality

```text
0.50× · 1.00× · 1.25× · 1.50×
```

Quality measures how productive that capital actually was.

The demo uses a `usefulRatio` with four bands:

```text
< 0.40       -> 0.50×
0.40 - 0.70  -> 1.00×
0.70 - 0.90  -> 1.25×
>= 0.90      -> 1.50×
```

For **vault activity**, this represents how much capital was actually deployed into the vault strategy. For **direct trader activity**, it represents how much of the position's lifetime was economically active and in range.

The broader idea is that **in-range, fee-generating, market-balancing capital should count more than idle capital**.

### 3. Campaign

```text
1.00× by default
1.20× or 1.30× when boosted
```

Campaigns are seasonal boosts for activity the protocol wants to support during a specific window.

A row earns the campaign multiplier only if all three conditions hold:

1. The date is inside the campaign window.
2. The strategy is on the campaign's eligible list.
3. The row is active for at least the campaign's minimum active hours.

In the mock data, campaigns require at least **12 active hours**. Missing any condition leaves the multiplier at `1.00×`.

### 4. Churn

```text
0.25× for short-lived activity
1.00× otherwise
```

Churn discounts short-lived open/close behavior.

Rows flagged as short-lived count at **25% of pre-churn points**, so three-quarters of those potential points do not count. **Vault-managed rebalances are exempt** because they can represent legitimate strategy maintenance, especially for gamma scalping.

## Tradeoffs And Limitations

**Simplicity vs. abuse resistance.** A very simple system like raw TVL or raw volume would be easy to explain, but it would also reward whales, churn, and low-quality farming. Adding quality, campaign, and churn multipliers makes the system more robust, but also more complex. I tried to offset that complexity with an explicit dashboard that shows how each component affects the final score.

**Useful capital vs. beginner mistakes.** Out-of-range or low-quality activity earns fewer points, but it does not create negative points. A bad range selection may be inexperience, not abuse.

**Seasonal campaigns vs. predictability.** Campaigns help HyperUnicorn direct incentives toward moments that matter, such as volatility windows, new vault launches, or liquidity bootstrapping periods. But if campaigns are too frequent or arbitrary, they can feel like marketing rather than protocol design. I kept them capped and explicit.

**Vault users vs. direct traders.** Vault users and direct traders create different kinds of value. Vault users provide stable capital, while direct traders create market activity and take structured risk. The dashboard separates Vault Points and Trader Points so the system does not pretend those behaviors are identical.

**Anti-churn vs. legitimate rebalancing.** Gamma scalping and vault management may require frequent adjustments, so the model discounts short-lived farming behavior while excluding vault-managed rebalancing from that penalty.

## Concerns And Edge Cases

Out-of-range activity is more nuanced than it looks. In a simple LP system, out-of-range liquidity often means idle or less useful capital. In a Panoptic-style system, however, the user may be interacting with short LP exposure or option-like structures where the economic meaning is more complex. This demo handles that through a simple useful capital ratio, but a production system should distinguish between idle liquidity, valid short-LP exposure, and structured positions that are intentionally out of range.

Seasonal campaigns create timing edge cases. Users may try to enter right before a campaign window or split activity into many small rows. To reduce this, campaign boosts require minimum active hours and are capped.

Sybil resistance is less central to the scoring model because points are driven by capital-time and usefulness, not wallet count. Splitting activity across wallets should not improve the score by itself. It would become more important if rewards introduced per-wallet caps, referrals, identity-based boosts, or a fixed token/revenue distribution.

## Intentional Simplifications

I intentionally simplified identity and Sybil resistance. The model scores capital-time and usefulness rather than wallet count, so splitting activity across wallets should not improve the score by itself. If rewards later introduced per-wallet caps, referrals, or fixed token distributions, Sybil resistance would become more important.

I also simplified out-of-range liquidity. In a Panoptic-style system, out-of-range activity can represent different things depending on whether the user is an LP, short LP exposure, or part of a structured position. This demo compresses that nuance into a useful capital ratio.

The quality model is intentionally small. A production version would likely combine utilization, fee generation, range width, strategy risk, position health, and market impact. This demo uses one useful capital ratio so the dashboard remains explainable.

Campaigns are static configs with fixed dates and multipliers. In production, campaigns could be triggered by protocol metrics, governance, vault launches, market events, or liquidity needs.

Finally, reward redemption is out of scope. Points do not convert into tokens, stable credits, revenue share, or vault deposits in this implementation.

## Future Improvements

The first improvement would be completing the reward flywheel. Instead of points only being a leaderboard number, season rewards could convert into stable credits that users can claim or auto-compound into their current vault or position. This would let rewards increase productive protocol capital instead of creating sell pressure or token dilution.

I would also improve the quality model. The demo uses one useful capital ratio, but a production system should consider fees generated, utilization, range width, position health, strategy risk, and market impact.

Campaigns could also become dynamic. Instead of only using fixed seasonal configs, HyperUnicorn could adjust boosts based on internal protocol conditions such as low trading volume, underutilized vault capacity, liquidity gaps, or long/short imbalance.

I would spend more time on strategy-specific scoring. Gamma scalping, covered calls, lending vaults, range strategies, and short LP exposure all create different kinds of value. A more mature version should score each strategy according to its actual role in the protocol rather than forcing everything through one useful ratio.

I would also consider user risk profiles so campaigns do not push passive users toward strategies they do not understand.

Finally, I would add post-season analytics. The protocol should evaluate which campaigns attracted sticky, useful capital and which ones attracted mercenary behavior, then use that feedback to tune the next season.

## Mock Data

The mock data lives in [`src/data`](./src/data):

- [`users.ts`](./src/data/users.ts): five sample users.
- [`campaigns.ts`](./src/data/campaigns.ts): three seasonal campaigns.
- [`activities.ts`](./src/data/activities.ts): vault and trader activity rows across the season.

The scoring logic consumes these files directly; dashboard values are not hardcoded.

## Dashboard

The dashboard is a user-facing scorecard for the points system. It shows each user's points, relative standing, and how their activity contributes to the final score.

## Running Locally

```bash
bun install
bun run dev
```

Then open [http://localhost:3000](http://localhost:3000).
