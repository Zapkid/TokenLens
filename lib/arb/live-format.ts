import { formatCompactUsd, formatNumber, formatPct, formatUsd } from "../format";
import { arbStrings, formatArbDate } from "./i18n";
import type { ArbLive } from "./live";
import { SRC } from "./sources";
import type { ArbLang, ArbLiveSlot, ArbSource } from "./types";

// Turns live data into labeled, sourced facts per slot. Shared by the page
// (metric tiles) and the Word export (snapshot lines), so both always show
// the same numbers with the same source and check time.

export interface ArbLiveFact {
  label: string;
  value: string;
  source: ArbSource;
}

function compactSupply(x: number | null | undefined): string | null {
  if (x === null || x === undefined || !Number.isFinite(x)) return null;
  if (x >= 1e9) return `${(x / 1e9).toFixed(2)}B ARB`;
  if (x >= 1e6) return `${(x / 1e6).toFixed(1)}M ARB`;
  return `${formatNumber(x)} ARB`;
}

export function liveFacts(live: ArbLive | null, slot: ArbLiveSlot, lang: ArbLang): ArbLiveFact[] {
  if (!live) return [];
  const t = arbStrings(lang);
  const out: ArbLiveFact[] = [];
  const add = (label: string, value: string | null, source: ArbSource) => {
    if (value !== null && value !== "n/a") out.push({ label, value, source });
  };
  const m = live.market;
  switch (slot) {
    case "market":
      if (m) {
        add(t.price, formatUsd(m.priceUsd), SRC.coingecko);
        add(t.change24h, m.change24hPct === null ? null : formatPct(m.change24hPct / 100), SRC.coingecko);
        add(t.marketCap, formatCompactUsd(m.marketCapUsd), SRC.coingecko);
        if (m.athUsd !== null) {
          const when = m.athDate ? ` (${formatArbDate(m.athDate, lang)})` : "";
          add(t.ath, `${formatUsd(m.athUsd)}${when}`, SRC.coingecko);
        }
      }
      break;
    case "supply":
      if (m) {
        add(t.circulating, compactSupply(m.circulatingSupply), SRC.coingecko);
        add(t.totalSupply, compactSupply(m.totalSupply), SRC.coingecko);
        add(t.fdv, formatCompactUsd(m.fdvUsd), SRC.coingecko);
      }
      break;
    case "tvl":
      if (live.tvl) {
        add(t.tvl, formatCompactUsd(live.tvl.currentUsd), SRC.defillamaChain);
        add(t.tvl30d, live.tvl.change30dPct === null ? null : formatPct(live.tvl.change30dPct), SRC.defillamaChain);
      }
      break;
    case "stablecoins":
      if (live.stablecoins) add(t.stablecoins, formatCompactUsd(live.stablecoins.currentUsd), SRC.defillamaChain);
      break;
    case "fees":
      if (live.fees30dUsd !== null) add(t.fees30d, formatCompactUsd(live.fees30dUsd), SRC.defillamaChain);
      break;
    case "github":
      if (live.github) {
        const plus = live.github.truncated ? "+" : "";
        add(t.commits, `${formatNumber(live.github.commits30d)}${plus}`, SRC.github);
        add(t.contributors, `${formatNumber(live.github.contributors30d)}${plus}`, SRC.github);
        add(t.repos, live.github.repos.join(", "), SRC.github);
      }
      break;
    case "competitors":
      for (const c of live.competitors ?? []) add(c.name, formatCompactUsd(c.tvlUsd), SRC.defillamaChain);
      break;
    case "trend": {
      const last = live.trend[live.trend.length - 1];
      if (last) {
        const fmt = (v: number | null) => (v === null ? null : formatPct(v / 100 - 1));
        add(t.trendPrice, fmt(last.price), SRC.coingecko);
        add(t.trendTvl, fmt(last.tvl), SRC.defillamaChain);
        add(t.trendStables, fmt(last.stables), SRC.defillamaChain);
      }
      break;
    }
  }
  return out;
}
