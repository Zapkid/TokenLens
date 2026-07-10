import { Card } from "@/components/ui";
import { DISCLAIMER } from "@/lib/constants";

export const metadata = { title: "Methodology · TokenLens" };

export default function MethodologyPage() {
  return (
    <div className="prose-sm mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Methodology</h1>
      <Card>
        <h2 className="text-lg font-semibold">Two scores, never one</h2>
        <p className="mt-2 text-sm text-ink-2">
          Every report computes an Opportunity Score and a Risk Score
          independently, then combines them into an Overall Rating. Collapsing
          everything into one number hides the most important information: a
          token can be high-potential and high-risk at once, and most small
          caps are. The quadrant map keeps both dimensions visible.
        </p>
      </Card>
      <Card>
        <h2 className="text-lg font-semibold">Opportunity pillars</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink-2">
          <li>
            Fundamentals and usage (default 30%): turnover, volume, and MC/FDV
            versus a peer cohort fetched at generation time; for chains, TVL
            level and growth, fee levels, and the MC/TVL valuation of the
            native token.
          </li>
          <li>
            Valuation headroom (20%): distance from ATH conditioned on whether
            the asset is in freefall, and the price percentile within the
            asset&apos;s own trailing history, inverted.
          </li>
          <li>
            Momentum and trend (20%): 50/200-day structure, 90-day return
            versus peers, and a Sharpe-style risk-adjusted return.
          </li>
          <li>
            Development and ecosystem (15%): commit and contributor activity;
            for chains, protocol breadth.
          </li>
          <li>
            Narrative and catalysts (15%): reserved for the news-signal engine.
            Not wired in this build, so the pillar reports no data and the
            other weights renormalize. A token should never rank higher purely
            because it is being talked about.
          </li>
        </ul>
      </Card>
      <Card>
        <h2 className="text-lg font-semibold">Risk pillars</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink-2">
          <li>Volatility and drawdown (20%): realized volatility, 1y max drawdown, downside deviation.</li>
          <li>Liquidity (15%): inverse of turnover and volume percentiles.</li>
          <li>
            Tokenomics and dilution (20%): the MC/FDV gap as a dilution
            overhang. Verified unlock calendars are a designed upgrade.
          </li>
          <li>
            Concentration and dependence (15%): for chains, the top protocol&apos;s
            share of TVL; for tokens, a labeled market-depth proxy from cap rank
            (holder concentration data is inconsistent across chains).
          </li>
          <li>
            Legal and regulatory (15%): auto-baseline only in this build,
            clearly labeled as not manually reviewed.
          </li>
          <li>Track record and security (15%): asset age and cycle survival.</li>
        </ul>
        <p className="mt-2 text-sm text-ink-2">
          Risk maps to letter grades: A (0 to 20) through E (80 to 100). The
          Risk section always shows the reasons, not just the grade.
        </p>
      </Card>
      <Card>
        <h2 className="text-lg font-semibold">Overall rating</h2>
        <p className="mt-2 text-sm text-ink-2">
          Overall = Opportunity x (1 - RiskScore/100 x RiskAversion), with
          RiskAversion 0.8 (conservative), 0.6 (balanced), or 0.4 (aggressive).
          Pillar sub-scores ship inside every report payload, so editing
          weights re-scores instantly on the client and historical reports stay
          interpretable: each stores the weight-set version it was computed
          with.
        </p>
      </Card>
      <Card>
        <h2 className="text-lg font-semibold">Trajectory: scenarios, not predictions</h2>
        <p className="mt-2 text-sm text-ink-2">
          No model reliably predicts crypto prices. From the trailing daily
          closes (a year on the free CoinGecko tier) the engine computes
          realized volatility and a
          volatility cone per horizon (3, 6, 12 months), then adjusts scenario
          probabilities with visible modifiers: market regime, the asset&apos;s
          valuation band within its own history, dilution pressure, trend
          structure, and pending dated decisions. Output is always a range
          with drivers. Assets with under 180 daily closes get &quot;insufficient
          history&quot; instead of a forced number. Chain reports run the same
          engine twice: once on price, once on TVL.
        </p>
      </Card>
      <Card>
        <h2 className="text-lg font-semibold">Peer cohorts</h2>
        <p className="mt-2 text-sm text-ink-2">
          There is no maintained universe. Each generation pulls a cohort of
          peers in the subject&apos;s market-cap band from the top 250 (or the full
          chain list for chain reports), log-transforms fat-tailed metrics,
          and ranks the subject within it. The cohort snapshot is stored with
          the report so re-renders never refetch it. Category-first cohort
          matching is a designed refinement over the current cap-band cohort.
        </p>
      </Card>
      <Card>
        <h2 className="text-lg font-semibold">Honesty rules</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink-2">
          <li>Every report labels its data tier (auto-baseline in this build) and its data mode (live or synthetic fixture).</li>
          <li>Missing data excludes a pillar and renormalizes weights; it never silently scores 50 and pretends.</li>
          <li>Free-tier data is daily-granularity and delayed: fine for an investing cadence, unusable for trading, and the UI must never imply otherwise.</li>
          <li>{DISCLAIMER}</li>
        </ul>
      </Card>
    </div>
  );
}
