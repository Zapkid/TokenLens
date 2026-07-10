# TokenLens

On-demand crypto token and blockchain analysis for personal use. Type a token
(SOL, Uniswap) or a chain (Ethereum, Solana) and get a full report generated
on the spot from public data: opportunity and risk scores, a scenario-based
trajectory, and a disciplined holding strategy.

Not a trading bot, not a price oracle, not financial advice.

## Stack

Next.js 15 (App Router) + TypeScript + Tailwind CSS 4 + Recharts. No external
database: reports cache in process with a 24 hour TTL, personal state
(watchlist, portfolio, weights) lives in localStorage. Free data tiers only:
CoinGecko, DeFiLlama, alternative.me.

## Run it

```bash
npm install
npm run dev            # live data mode (requires network egress)
TOKENLENS_DATA_MODE=fixture npm run dev   # deterministic synthetic data
```

Optional env (see .env.example): COINGECKO_API_KEY raises the free rate limit.

## Quality gate

```bash
npm run gate           # typecheck + lint + unit tests + build
npm run test:e2e       # Playwright e2e against a fixture-mode build
```

If your machine has a pre-provisioned Chromium instead of Playwright's own
download (for example sandboxed CI), point the tests at it:

```bash
PLAYWRIGHT_CHROMIUM_PATH=/opt/pw-browsers/chromium npm run test:e2e
```

## Docs

Start at [docs/README.md](docs/README.md). Every feature has a doc under
docs/features/ and a test plan under docs/test-plans/.
