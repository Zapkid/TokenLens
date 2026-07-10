"use client";

// Self-contained add-position form: a small token typeahead (debounced fetch
// to /api/search, up to 6 token-type results), quantity, and total USD cost
// basis. Does not reuse SearchBox since that component navigates to a report
// on selection instead of returning a value to a parent form.

import { useEffect, useRef, useState, type FormEvent } from "react";
import { SEL } from "@/lib/selectors";
import { usePositions } from "@/lib/storage";
import type { Position, SearchResult } from "@/lib/types";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 250;
const MAX_RESULTS = 6;

export function PositionForm({
  onAdded,
}: {
  /** Optional hook for callers/tests that want to observe additions. */
  onAdded?: (position: Position) => void;
}) {
  const [, setPositions] = usePositions();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [quantity, setQuantity] = useState("");
  const [costBasis, setCostBasis] = useState("");

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (selected && selected.name === query) {
      setOpen(false);
      return;
    }
    if (q.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setOpen(false);
      return;
    }
    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setSearchError(null);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Search failed");
        const tokens = ((data.results ?? []) as SearchResult[])
          .filter((r) => r.type === "token")
          .slice(0, MAX_RESULTS);
        setResults(tokens);
        setOpen(true);
      } catch (e) {
        if (!(e instanceof DOMException && e.name === "AbortError")) {
          setSearchError(e instanceof Error ? e.message : "Search failed");
          setOpen(true);
        }
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query, selected]);

  const selectResult = (r: SearchResult) => {
    setSelected(r);
    setQuery(r.name);
    setOpen(false);
    setResults([]);
  };

  const quantityNum = Number(quantity);
  const costBasisNum = Number(costBasis);
  const isValid =
    selected !== null &&
    quantity.trim() !== "" &&
    Number.isFinite(quantityNum) &&
    quantityNum > 0 &&
    costBasis.trim() !== "" &&
    Number.isFinite(costBasisNum) &&
    costBasisNum >= 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selected || !isValid) return;
    const position: Position = {
      assetId: selected.id,
      assetType: selected.type,
      name: selected.name,
      symbol: selected.symbol,
      quantity: quantityNum,
      costBasisUsd: costBasisNum,
    };
    setPositions((prev) => [...prev, position]);
    onAdded?.(position);
    setSelected(null);
    setQuery("");
    setResults([]);
    setQuantity("");
    setCostBasis("");
  };

  return (
    <form
      data-testid={SEL.positionForm}
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-3"
    >
      <div className="relative min-w-[220px] flex-1">
        <label className="mb-1 block text-xs text-faint" htmlFor="position-asset">
          Asset
        </label>
        <input
          id="position-asset"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
          }}
          placeholder="Search a token: BTC, Solana..."
          autoComplete="off"
          className="w-full rounded-md border border-hairline bg-surface px-3 py-2 text-sm outline-none placeholder:text-faint focus:border-[var(--series-1)]"
        />
        {open ? (
          <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-hairline bg-surface shadow-lg">
            {searchError ? (
              <div className="px-3 py-2 text-xs" style={{ color: "var(--status-critical)" }}>
                {searchError}
              </div>
            ) : results.length === 0 && !loading ? (
              <div className="px-3 py-2 text-xs text-faint">No token matches.</div>
            ) : (
              results.map((r) => (
                <button
                  type="button"
                  key={`${r.type}:${r.id}`}
                  onClick={() => selectResult(r)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-page"
                >
                  <span className="font-medium">{r.name}</span>
                  <span className="text-faint">{r.symbol}</span>
                </button>
              ))
            )}
            {loading ? <div className="px-3 py-2 text-xs text-faint">Searching...</div> : null}
          </div>
        ) : null}
      </div>

      <div>
        <label className="mb-1 block text-xs text-faint" htmlFor="position-quantity">
          Quantity
        </label>
        <input
          id="position-quantity"
          type="number"
          min="0"
          step="any"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-28 rounded-md border border-hairline bg-surface px-3 py-2 text-sm tabular outline-none focus:border-[var(--series-1)]"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-faint" htmlFor="position-cost-basis">
          Cost basis (USD total)
        </label>
        <input
          id="position-cost-basis"
          type="number"
          min="0"
          step="any"
          value={costBasis}
          onChange={(e) => setCostBasis(e.target.value)}
          className="w-36 rounded-md border border-hairline bg-surface px-3 py-2 text-sm tabular outline-none focus:border-[var(--series-1)]"
        />
      </div>

      <button
        type="submit"
        disabled={!isValid}
        className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-page disabled:cursor-not-allowed disabled:opacity-40"
      >
        Add position
      </button>
    </form>
  );
}
