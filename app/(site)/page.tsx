import Link from "next/link";
import { tokenLensJsonLd } from "@/lib/agent-content";
import { siteUrl } from "@/lib/site";
import { SearchBox } from "@/components/SearchBox";
import { WatchlistSection } from "@/components/WatchlistSection";
import { Badge, Card, Delta } from "@/components/ui";
import { formatCompactUsd, formatDate } from "@/lib/format";
import { getProvider } from "@/lib/providers";
import { buildEvents } from "@/lib/report/events";
import { computeRegime } from "@/lib/report/regime";
import { SEL } from "@/lib/selectors";
import type { RegimeSnapshot, TrendingItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  alternates: { canonical: "/" },
};

const identityJsonLd = tokenLensJsonLd(siteUrl(), {
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE,
  address: {
    streetAddress: process.env.NEXT_PUBLIC_ORG_STREET,
    addressLocality: process.env.NEXT_PUBLIC_ORG_LOCALITY,
    postalCode: process.env.NEXT_PUBLIC_ORG_POSTAL,
    addressCountry: process.env.NEXT_PUBLIC_ORG_COUNTRY,
  },
});

function RegimeBanner({ regime }: { regime: RegimeSnapshot }) {
  const tone =
    regime.state === "risk-on"
      ? "good"
      : regime.state === "risk-off"
        ? "critical"
        : "warning";
  return (
    <Card testId={SEL.regimeBanner}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Badge tone={tone}>{regime.state}</Badge>
        <span className="text-sm text-ink-2">
          Market regime score {regime.score > 0 ? "+" : ""}
          {regime.score}
        </span>
        {regime.fearGreed ? (
          <span className="text-sm text-ink-2">
            Fear and Greed: {regime.fearGreed.value} ({regime.fearGreed.label})
          </span>
        ) : null}
        {regime.totalMarketCapUsd ? (
          <span className="text-sm text-ink-2">
            Total market cap {formatCompactUsd(regime.totalMarketCapUsd)}
          </span>
        ) : null}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-faint">
        {regime.components.map((c) => (
          <span key={c.label}>
            {c.label}: {c.value}
          </span>
        ))}
      </div>
    </Card>
  );
}

function TrendingStrip({ trending }: { trending: TrendingItem[] }) {
  if (trending.length === 0) return null;
  return (
    <div
      data-testid={SEL.trendingStrip}
      className="flex flex-wrap items-center gap-2"
    >
      <span className="text-xs font-medium uppercase tracking-wide text-faint">
        Trending
      </span>
      {trending.map((t) => (
        <Link
          key={t.id}
          href={`/report/token/${encodeURIComponent(t.id)}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface px-3 py-1 text-xs hover:border-[var(--series-1)]"
        >
          <span className="font-medium">{t.symbol}</span>
          <Delta value={t.change24hPct} />
        </Link>
      ))}
    </div>
  );
}

export default async function HomePage() {
  let regime: RegimeSnapshot | null = null;
  let trending: TrendingItem[] = [];
  let marketError: string | null = null;
  try {
    const snapshot = await getProvider().getMarketSnapshot();
    regime = computeRegime(snapshot);
    trending = snapshot.trending;
  } catch (e) {
    marketError = e instanceof Error ? e.message : "Market data unavailable";
  }

  const upcoming = buildEvents(
    { id: "market", type: "token", name: "Market", symbol: "" },
    { mcFdvRatio: null, horizonDays: 45 },
  );

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-2xl pt-8 text-center">
        <h1 className="text-3xl font-bold">TokenLens</h1>
        <p className="mt-2 text-sm text-ink-2">
          Type a token or a blockchain. Get a full report: scores, risk,
          scenarios, and a disciplined way to hold it.
        </p>
      </div>
      {regime ? (
        <RegimeBanner regime={regime} />
      ) : (
        <Card>
          <p className="text-sm text-ink-2">
            Market regime unavailable: {marketError}. Reports can still be
            generated if providers recover.
          </p>
        </Card>
      )}
      <div className="mx-auto max-w-2xl">
        <SearchBox autoFocus />
      </div>
      <TrendingStrip trending={trending} />
      {upcoming.length > 0 ? (
        <div data-testid={SEL.decisionStrip}>
          <span className="text-xs font-medium uppercase tracking-wide text-faint">
            Decision calendar (next 45 days)
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {upcoming.map((e) => (
              <span
                key={`${e.date}-${e.title}`}
                className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 text-xs"
              >
                <span className="tabular text-faint">{formatDate(e.date)}</span>
                {e.title}
                <Badge tone={e.impact === "high" ? "critical" : "warning"}>
                  {e.impact}
                </Badge>
              </span>
            ))}
          </div>
        </div>
      ) : null}
      <WatchlistSection />
      <Card className="no-print">
        <p className="text-sm text-ink-2">
          Want instant answers? The{" "}
          <Link href="/library" className="underline">
            Report Library
          </Link>{" "}
          keeps the top 10 tokens by market cap and top 10 chains by TVL a click
          away.
        </p>
      </Card>
      {/* Server-rendered site summary: gives crawlers and agents meaningful
          content and a real heading structure without JavaScript. */}
      <section className="mx-auto max-w-2xl space-y-4 border-t border-hairline pt-6 text-sm text-ink-2">
        <div>
          <h2 className="text-base font-semibold text-ink">
            What TokenLens does
          </h2>
          <p className="mt-1.5">
            TokenLens builds an on-demand analysis report for any crypto token
            or blockchain: opportunity and risk scores across defined pillars,
            a letter risk grade, bear, base, and bull scenario trajectories
            over three horizons, and a disciplined holding strategy with
            tiers, DCA schedules, and exit ladders. Reports for two to four
            assets can be compared side by side on the same rubric.
          </p>
        </div>
        <div>
          <h2 className="text-base font-semibold text-ink">
            Data sources and method
          </h2>
          <p className="mt-1.5">
            Market data comes from CoinGecko, TVL from DeFiLlama, and
            sentiment from the alternative.me Fear and Greed index. Every
            score is computed from public data with the method documented on
            the{" "}
            <Link href="/methodology" className="underline">
              methodology page
            </Link>
            . TokenLens is decision support for personal use, not financial
            advice.
          </p>
        </div>
        <div>
          <h2 className="text-base font-semibold text-ink">
            For AI agents and developers
          </h2>
          <p className="mt-1.5">
            TokenLens exposes a public REST API and an MCP server so agents
            can search assets, generate reports, and read the market regime
            programmatically. Start at the{" "}
            <Link href="/developers" className="underline">
              developer guide
            </Link>
            , <a href="/llms.txt" className="underline">/llms.txt</a>, or the{" "}
            <a href="/openapi.json" className="underline">
              OpenAPI description
            </a>
            .
          </p>
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(identityJsonLd) }}
      />
    </div>
  );
}
