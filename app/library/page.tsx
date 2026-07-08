import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import { formatAgo, formatCompactUsd } from "@/lib/format";
import { cached } from "@/lib/cache";
import { LIBRARY_TTL_MS } from "@/lib/constants";
import { currentDataMode, getProvider } from "@/lib/providers";
import { SEL } from "@/lib/selectors";
import type { Library, LibraryEntry } from "@/lib/types";

export const dynamic = "force-dynamic";

function LibraryCard({ entry, metric }: { entry: LibraryEntry; metric: string }) {
  return (
    <Link
      href={`/report/${entry.asset.type}/${encodeURIComponent(entry.asset.id)}`}
      data-testid={SEL.libraryCard}
      className="block rounded-xl border border-hairline bg-surface p-4 shadow-sm transition-colors hover:border-[var(--series-1)]"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs tabular text-faint">#{entry.rank}</span>
        <Badge tone={entry.asset.type === "chain" ? "accent" : "neutral"}>
          {entry.asset.type}
        </Badge>
      </div>
      <div className="mt-2 font-semibold">{entry.asset.name}</div>
      <div className="text-xs text-faint">{entry.asset.symbol}</div>
      <div className="mt-2 text-sm tabular text-ink-2">{metric}</div>
    </Link>
  );
}

export default async function LibraryPage() {
  let library: Library | null = null;
  let error: string | null = null;
  try {
    library = await cached<Library>(
      `library:${currentDataMode()}`,
      LIBRARY_TTL_MS,
      async () => {
        const provider = getProvider();
        const [tokens, chains] = await Promise.all([
          provider.getTopTokens(10),
          provider.getTopChains(10),
        ]);
        return {
          tokens,
          chains,
          asOf: new Date().toISOString(),
          dataMode: currentDataMode(),
        };
      },
    );
  } catch (e) {
    error = e instanceof Error ? e.message : "Library fetch failed";
  }

  if (!library) {
    return (
      <Card>
        <p className="text-sm text-ink-2">Library unavailable: {error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Report Library</h1>
        <p className="mt-1 text-sm text-ink-2">
          The current top 10 tokens by market cap (ex-stablecoins) and top 10
          chains by TVL, recomputed from live rankings rather than hardcoded.
          Membership drifts with the market. List as of {formatAgo(library.asOf)}.
          {library.dataMode === "fixture"
            ? " Fixture data mode is active: rankings are synthetic."
            : ""}
        </p>
      </div>
      <section data-testid={SEL.libraryTokens}>
        <h2 className="mb-3 text-lg font-semibold">Top tokens by market cap</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {library.tokens.map((t) => (
            <LibraryCard
              key={t.asset.id}
              entry={t}
              metric={`MC ${formatCompactUsd(t.marketCap ?? null)}`}
            />
          ))}
        </div>
      </section>
      <section data-testid={SEL.libraryChains}>
        <h2 className="mb-3 text-lg font-semibold">Top chains by TVL</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {library.chains.map((c) => (
            <LibraryCard
              key={c.asset.id}
              entry={c}
              metric={`TVL ${formatCompactUsd(c.tvl ?? null)}`}
            />
          ))}
        </div>
      </section>
      <p className="text-xs text-faint">
        Reports open on demand and cache for 24 hours. A standing pre-generation
        cron is the deploy-time upgrade path; the library page itself already
        reads the same pipeline the cron would call.
      </p>
    </div>
  );
}
