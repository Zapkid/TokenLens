"use client";

// The front door: type-ahead search across tokens (CoinGecko) and chains
// (DeFiLlama). Ambiguous input renders a disambiguation list with type and
// rank hints before a report is generated; nothing is silently matched.

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui";
import { SEL } from "@/lib/selectors";
import type { SearchResult } from "@/lib/types";

export function SearchBox({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlight, setHighlight] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Search failed");
        setResults(data.results ?? []);
        setOpen(true);
        setHighlight(0);
      } catch (e) {
        if (!(e instanceof DOMException && e.name === "AbortError")) {
          setError(e instanceof Error ? e.message : "Search failed");
          setOpen(true);
        }
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const go = (r: SearchResult) => {
    setOpen(false);
    router.push(`/report/${r.type}/${encodeURIComponent(r.id)}`);
  };

  return (
    <div className="relative">
      <input
        data-testid={SEL.searchInput}
        autoFocus={autoFocus}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (!open || results.length === 0) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, results.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            go(results[highlight]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder="Enter a token or blockchain: SOL, Solana, Uniswap..."
        className="w-full rounded-xl border border-hairline bg-surface px-4 py-3 text-base shadow-sm outline-none placeholder:text-faint focus:border-[var(--series-1)]"
        aria-label="Search for a token or blockchain"
        role="combobox"
        aria-expanded={open}
        aria-controls="search-results-listbox"
      />
      {open ? (
        <div
          id="search-results-listbox"
          data-testid={SEL.searchResults}
          className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-hairline bg-surface shadow-lg"
          role="listbox"
        >
          {error ? (
            <div className="px-4 py-3 text-sm" style={{ color: "var(--status-critical)" }}>
              {error}
            </div>
          ) : results.length === 0 && !loading ? (
            <div className="px-4 py-3 text-sm text-faint">
              No matches. Try a full name, symbol, or contract address.
            </div>
          ) : (
            results.map((r, i) => (
              <button
                key={`${r.type}:${r.id}`}
                data-testid={SEL.searchResultItem}
                onClick={() => go(r)}
                onMouseEnter={() => setHighlight(i)}
                role="option"
                aria-selected={i === highlight}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm ${
                  i === highlight ? "bg-page" : ""
                }`}
              >
                <span className="font-medium">{r.name}</span>
                {r.symbol ? <span className="text-faint">{r.symbol}</span> : null}
                <span className="ml-auto flex items-center gap-2">
                  {r.hint ? <span className="text-xs text-faint">{r.hint}</span> : null}
                  <Badge tone={r.type === "chain" ? "accent" : "neutral"}>
                    {r.type}
                  </Badge>
                </span>
              </button>
            ))
          )}
          {loading ? (
            <div className="px-4 py-2 text-xs text-faint">Searching...</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
