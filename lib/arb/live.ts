// Live data for /arb: ARB market data (CoinGecko), Arbitrum DeFi TVL,
// stablecoins, chain fees and competitor TVL (DefiLlama), and core
// repository activity (GitHub). Every block is fetched independently so one
// failing upstream never blanks the page; failures are reported by name.
//
// Pure parsers are exported for unit tests. Fetchers run server-side only
// (app/api/arb/route.ts) behind the in-process TTL cache.

import { cached } from "../cache";
import { cgApiBase, cgApiHeaders } from "../providers/coingecko";

export type ArbLiveMode = "live" | "fixture";

export interface ArbMarket {
  priceUsd: number;
  change24hPct: number | null;
  marketCapUsd: number | null;
  fdvUsd: number | null;
  circulatingSupply: number | null;
  totalSupply: number | null;
  athUsd: number | null;
  athDate: string | null;
}

export interface ArbSeriesPoint {
  t: number;
  v: number;
}

export interface ArbTvl {
  currentUsd: number;
  change30dPct: number | null;
  series: ArbSeriesPoint[];
}

export interface ArbStables {
  currentUsd: number;
  series: ArbSeriesPoint[];
}

export interface ArbGithub {
  repos: string[];
  commits30d: number;
  contributors30d: number;
  /** True when a repository hit the page cap, so counts are lower bounds. */
  truncated: boolean;
}

export interface ArbCompetitor {
  name: string;
  tvlUsd: number;
}

export interface ArbTrendPoint {
  t: number;
  price: number | null;
  tvl: number | null;
  stables: number | null;
}

export interface ArbLive {
  mode: ArbLiveMode;
  fetchedAt: string;
  market: ArbMarket | null;
  priceSeries: ArbSeriesPoint[];
  tvl: ArbTvl | null;
  stablecoins: ArbStables | null;
  fees30dUsd: number | null;
  github: ArbGithub | null;
  competitors: ArbCompetitor[] | null;
  trend: ArbTrendPoint[];
  errors: string[];
}

export const ARB_GITHUB_REPOS = [
  "OffchainLabs/nitro",
  "OffchainLabs/nitro-contracts",
  "OffchainLabs/stylus-sdk-rs",
] as const;

/** DefiLlama chain names, Arbitrum first. */
export const ARB_COMPETITOR_CHAINS = ["Arbitrum", "Base", "OP Mainnet"] as const;

const LIVE_TTL_MS = 15 * 60 * 1000;
const GITHUB_TTL_MS = 6 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const GITHUB_PAGE_CAP = 5;

// ---------- pure parsers ----------

function num(x: unknown): number | null {
  return typeof x === "number" && Number.isFinite(x) ? x : null;
}

interface CgCoin {
  market_data?: {
    current_price?: { usd?: number };
    price_change_percentage_24h?: number;
    market_cap?: { usd?: number };
    fully_diluted_valuation?: { usd?: number };
    circulating_supply?: number;
    total_supply?: number;
    ath?: { usd?: number };
    ath_date?: { usd?: string };
  };
}

export function parseCoinGeckoCoin(json: unknown): ArbMarket {
  const md = (json as CgCoin)?.market_data;
  const price = num(md?.current_price?.usd);
  if (price === null) throw new Error("CoinGecko: missing ARB price");
  return {
    priceUsd: price,
    change24hPct: num(md?.price_change_percentage_24h),
    marketCapUsd: num(md?.market_cap?.usd),
    fdvUsd: num(md?.fully_diluted_valuation?.usd),
    circulatingSupply: num(md?.circulating_supply),
    totalSupply: num(md?.total_supply),
    athUsd: num(md?.ath?.usd),
    athDate: typeof md?.ath_date?.usd === "string" ? md.ath_date.usd : null,
  };
}

export function parseCoinGeckoChart(json: unknown): ArbSeriesPoint[] {
  const prices = (json as { prices?: unknown })?.prices;
  if (!Array.isArray(prices)) return [];
  const out: ArbSeriesPoint[] = [];
  for (const p of prices) {
    if (Array.isArray(p) && num(p[0]) !== null && num(p[1]) !== null) {
      out.push({ t: p[0] as number, v: p[1] as number });
    }
  }
  return out;
}

/** DefiLlama /v2/historicalChainTvl/{chain}: [{ date (unix s), tvl }]. */
export function parseLlamaTvl(json: unknown): ArbTvl {
  if (!Array.isArray(json) || json.length === 0) throw new Error("DefiLlama: empty TVL history");
  const series: ArbSeriesPoint[] = [];
  for (const row of json as { date?: unknown; tvl?: unknown }[]) {
    const d = num(row?.date);
    const v = num(row?.tvl);
    if (d !== null && v !== null) series.push({ t: d * 1000, v });
  }
  if (series.length === 0) throw new Error("DefiLlama: empty TVL history");
  series.sort((a, b) => a.t - b.t);
  const last = series[series.length - 1];
  const ref = valueAtOrBefore(series, last.t - 30 * DAY_MS);
  return {
    currentUsd: last.v,
    change30dPct: ref && ref > 0 ? last.v / ref - 1 : null,
    series: lastDays(series, 365),
  };
}

/** stablecoins.llama.fi /stablecoincharts/{chain}: [{ date, totalCirculatingUSD: { peggedUSD } }]. */
export function parseLlamaStables(json: unknown): ArbStables {
  if (!Array.isArray(json)) throw new Error("DefiLlama: bad stablecoin payload");
  const series: ArbSeriesPoint[] = [];
  for (const row of json as { date?: unknown; totalCirculatingUSD?: Record<string, unknown> }[]) {
    const d = Number(row?.date);
    const circ = row?.totalCirculatingUSD;
    if (!Number.isFinite(d) || !circ) continue;
    let total = 0;
    for (const v of Object.values(circ)) if (typeof v === "number" && Number.isFinite(v)) total += v;
    series.push({ t: d * 1000, v: total });
  }
  if (series.length === 0) throw new Error("DefiLlama: empty stablecoin history");
  series.sort((a, b) => a.t - b.t);
  return { currentUsd: series[series.length - 1].v, series: lastDays(series, 365) };
}

/** DefiLlama /summary/fees/{protocol}: { total30d }. */
export function parseLlamaFees(json: unknown): number {
  const v = num((json as { total30d?: unknown })?.total30d);
  if (v === null) throw new Error("DefiLlama: missing 30d fees");
  return v;
}

/** DefiLlama /v2/chains: [{ name, tvl }] filtered to the comparison set. */
export function parseLlamaChains(json: unknown): ArbCompetitor[] {
  if (!Array.isArray(json)) throw new Error("DefiLlama: bad chains payload");
  const byName = new Map<string, number>();
  for (const row of json as { name?: unknown; tvl?: unknown }[]) {
    const v = num(row?.tvl);
    if (typeof row?.name === "string" && v !== null) byName.set(row.name, v);
  }
  const out = ARB_COMPETITOR_CHAINS.filter((n) => byName.has(n)).map((name) => ({
    name,
    tvlUsd: byName.get(name) as number,
  }));
  if (out.length === 0) throw new Error("DefiLlama: comparison chains missing");
  return out;
}

interface GhCommit {
  author?: { login?: string } | null;
  commit?: { author?: { email?: string; name?: string } };
}

/** Stable identity for a commit author: GitHub login, else email, else name. */
export function commitAuthorKey(c: GhCommit): string | null {
  const login = c?.author?.login;
  if (login) return `login:${login.toLowerCase()}`;
  const email = c?.commit?.author?.email;
  if (email) return `email:${email.toLowerCase()}`;
  const name = c?.commit?.author?.name;
  return name ? `name:${name.toLowerCase()}` : null;
}

export function summarizeCommits(
  pages: { repo: string; commits: GhCommit[]; truncated: boolean }[],
): ArbGithub {
  const authors = new Set<string>();
  let commits = 0;
  for (const p of pages) {
    commits += p.commits.length;
    for (const c of p.commits) {
      const key = commitAuthorKey(c);
      if (key) authors.add(key);
    }
  }
  return {
    repos: pages.map((p) => p.repo),
    commits30d: commits,
    contributors30d: authors.size,
    truncated: pages.some((p) => p.truncated),
  };
}

/** Join price, TVL and stablecoin series by UTC day and index each to 100
 * at the first day where all available series have a value. */
export function buildTrend(
  price: ArbSeriesPoint[],
  tvl: ArbSeriesPoint[],
  stables: ArbSeriesPoint[],
): ArbTrendPoint[] {
  const day = (t: number) => Math.floor(t / DAY_MS) * DAY_MS;
  const toMap = (s: ArbSeriesPoint[]) => {
    const m = new Map<number, number>();
    for (const p of s) m.set(day(p.t), p.v);
    return m;
  };
  const pm = toMap(price);
  const tm = toMap(tvl);
  const sm = toMap(stables);
  const present = [pm, tm, sm].filter((m) => m.size > 0);
  if (present.length === 0) return [];
  const days = [...new Set(present.flatMap((m) => [...m.keys()]))].sort((a, b) => a - b);
  const base = days.find((d) => present.every((m) => (m.get(d) ?? 0) > 0));
  if (base === undefined) return [];
  const idx = (m: Map<number, number>, d: number) => {
    if (m.size === 0) return null;
    const v = m.get(d);
    const b = m.get(base);
    return v !== undefined && b ? (v / b) * 100 : null;
  };
  return days
    .filter((d) => d >= base)
    .map((d) => ({ t: d, price: idx(pm, d), tvl: idx(tm, d), stables: idx(sm, d) }))
    .filter((p) => p.price !== null || p.tvl !== null || p.stables !== null);
}

function valueAtOrBefore(series: ArbSeriesPoint[], t: number): number | null {
  let v: number | null = null;
  for (const p of series) {
    if (p.t <= t) v = p.v;
    else break;
  }
  return v;
}

function lastDays(series: ArbSeriesPoint[], days: number): ArbSeriesPoint[] {
  if (series.length === 0) return series;
  const cutoff = series[series.length - 1].t - days * DAY_MS;
  return series.filter((p) => p.t >= cutoff);
}

// ---------- fetchers ----------

async function getJson(url: string, headers?: Record<string, string>): Promise<unknown> {
  const res = await fetch(url, { headers, cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${new URL(url).host}`);
  return res.json();
}

function githubHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "TokenLens-arb",
  };
  // Optional server-side token raises the rate limit; never client exposed.
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

async function fetchRepoCommits(repo: string, sinceIso: string) {
  const commits: GhCommit[] = [];
  let truncated = false;
  for (let page = 1; page <= GITHUB_PAGE_CAP; page++) {
    const url = `https://api.github.com/repos/${repo}/commits?since=${encodeURIComponent(sinceIso)}&per_page=100&page=${page}`;
    const batch = (await getJson(url, githubHeaders())) as GhCommit[];
    if (!Array.isArray(batch)) throw new Error(`GitHub: bad payload for ${repo}`);
    commits.push(...batch);
    if (batch.length < 100) break;
    if (page === GITHUB_PAGE_CAP) truncated = true;
  }
  return { repo, commits, truncated };
}

async function fetchGithub(now: number): Promise<ArbGithub> {
  const since = new Date(now - 30 * DAY_MS).toISOString();
  const pages = await Promise.all(ARB_GITHUB_REPOS.map((r) => fetchRepoCommits(r, since)));
  return summarizeCommits(pages);
}

const LLAMA = "https://api.llama.fi";
const STABLES = "https://stablecoins.llama.fi";

async function fetchLive(now: number): Promise<ArbLive> {
  const cg = cgApiBase();
  const cgh = cgApiHeaders();
  const tasks = {
    market: () =>
      getJson(
        `${cg}/coins/arbitrum?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false`,
        cgh,
      ).then(parseCoinGeckoCoin),
    priceSeries: () =>
      getJson(`${cg}/coins/arbitrum/market_chart?vs_currency=usd&days=365&interval=daily`, cgh).then(
        parseCoinGeckoChart,
      ),
    tvl: () => getJson(`${LLAMA}/v2/historicalChainTvl/Arbitrum`).then(parseLlamaTvl),
    stablecoins: () => getJson(`${STABLES}/stablecoincharts/Arbitrum`).then(parseLlamaStables),
    fees: () =>
      getJson(`${LLAMA}/summary/fees/arbitrum?dataType=dailyFees`).then(parseLlamaFees),
    competitors: () => getJson(`${LLAMA}/v2/chains`).then(parseLlamaChains),
    github: () => cached("arb:github", GITHUB_TTL_MS, () => fetchGithub(now)),
  };
  const names = Object.keys(tasks) as (keyof typeof tasks)[];
  const settled = await Promise.allSettled(names.map((n) => tasks[n]()));
  const errors: string[] = [];
  const pick = <T>(name: keyof typeof tasks): T | null => {
    const r = settled[names.indexOf(name)];
    if (r.status === "fulfilled") return r.value as T;
    errors.push(name);
    return null;
  };
  const market = pick<ArbMarket>("market");
  const priceSeries = pick<ArbSeriesPoint[]>("priceSeries") ?? [];
  const tvl = pick<ArbTvl>("tvl");
  const stablecoins = pick<ArbStables>("stablecoins");
  const fees30dUsd = pick<number>("fees");
  const competitors = pick<ArbCompetitor[]>("competitors");
  const github = pick<ArbGithub>("github");
  return {
    mode: "live",
    fetchedAt: new Date(now).toISOString(),
    market,
    priceSeries,
    tvl,
    stablecoins,
    fees30dUsd,
    github,
    competitors,
    trend: buildTrend(priceSeries, tvl?.series ?? [], stablecoins?.series ?? []),
    errors,
  };
}

// ---------- fixture ----------

/** Deterministic synthetic data for e2e and offline runs; always labeled as
 * fixture in the UI so it can never be mistaken for real market data. */
export function arbFixture(now = Date.UTC(2026, 10, 1)): ArbLive {
  const start = now - 365 * DAY_MS;
  const series = (base: number, drift: number, wobble: number): ArbSeriesPoint[] =>
    Array.from({ length: 366 }, (_, i) => ({
      t: start + i * DAY_MS,
      v: base * (1 + (drift * i) / 365 + wobble * Math.sin(i / 17)),
    }));
  const priceSeries = series(0.4, -0.55, 0.05);
  const tvlSeries = series(2.2e9, -0.3, 0.04);
  const stableSeries = series(3.0e9, 0.2, 0.02);
  const tvl = parseLlamaTvl(tvlSeries.map((p) => ({ date: p.t / 1000, tvl: p.v })));
  return {
    mode: "fixture",
    fetchedAt: new Date(now).toISOString(),
    market: {
      priceUsd: priceSeries[priceSeries.length - 1].v,
      change24hPct: -1.8,
      marketCapUsd: 1.1e9,
      fdvUsd: 1.8e9,
      circulatingSupply: 6.3e9,
      totalSupply: 1e10,
      athUsd: 2.39,
      athDate: "2024-01-12T00:00:00.000Z",
    },
    priceSeries,
    tvl,
    stablecoins: { currentUsd: stableSeries[stableSeries.length - 1].v, series: stableSeries },
    fees30dUsd: 1.9e6,
    github: { repos: [...ARB_GITHUB_REPOS], commits30d: 212, contributors30d: 41, truncated: false },
    competitors: [
      { name: "Arbitrum", tvlUsd: tvl.currentUsd },
      { name: "Base", tvlUsd: 3.9e9 },
      { name: "OP Mainnet", tvlUsd: 0.4e9 },
    ],
    trend: buildTrend(priceSeries, tvl.series, stableSeries),
    errors: [],
  };
}

export async function getArbLive(mode: ArbLiveMode, now = Date.now()): Promise<ArbLive> {
  if (mode === "fixture") return arbFixture();
  return cached("arb:live", LIVE_TTL_MS, () => fetchLive(now));
}
