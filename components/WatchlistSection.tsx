"use client";

import Link from "next/link";
import { Badge } from "@/components/ui";
import { SEL } from "@/lib/selectors";
import { useWatchlist } from "@/lib/storage";

export function WatchlistSection() {
  const { items } = useWatchlist();
  if (items.length === 0) return null;
  return (
    <div data-testid={SEL.watchlistSection}>
      <span className="text-xs font-medium uppercase tracking-wide text-faint">
        Watchlist
      </span>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((a) => (
          <Link
            key={`${a.type}:${a.id}`}
            href={`/report/${a.type}/${encodeURIComponent(a.id)}`}
            className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 text-xs hover:border-[var(--series-1)]"
          >
            <span className="font-medium">{a.symbol || a.name}</span>
            <Badge tone={a.type === "chain" ? "accent" : "neutral"}>{a.type}</Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
