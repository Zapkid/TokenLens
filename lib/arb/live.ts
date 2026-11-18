// Live data for /arb: ARB market data (CoinGecko), Arbitrum DeFi TVL,
// stablecoins (native vs bridged), chain fees and chain TVL for the
// Arbitrum ecosystem and competitors (DefiLlama), stages, risks and Total
// Value Secured (ETHBEAT, formerly L2BEAT), and Offchain Labs repository
// activity (GitHub). Every block is fetched independently so one failing
// upstream never blanks the page; failures are reported by name.
//
// Pure parsers are exported for unit tests. Fetchers run server-side only
// (app/api/arb/route.ts) behind the in-process TTL cache. Cross-source
// validity checks live in lib/arb/verify.ts.

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
  maxSupply: number | null;
  athUsd: number | null;
  athDate: string | null;
  /** CoinGecko's own last_updated timestamp (ISO). */
  lastUpdated: string | null;
}

export interface ArbSeriesPoint {
  t: number;
  v: number;
}

export interface ArbTvl {
  currentUsd: number;
  change30dPct: number | null;
  /** Timestamp (ms) of the latest data point. */
  asOf: number;
  series: ArbSeriesPoint[];
}

export interface ArbStables {
  currentUsd: number;
  /** Issued natively on Arbitrum (DefiLlama totalMintedUSD). */
  nativeUsd: number | null;
  /** Bridged in from other chains (DefiLlama totalBridgedToUSD). */
  bridgedUsd: number | null;
  asOf: number;
  series: ArbSeriesPoint[];
}

export interface ArbGithub {
  repos: string[];
  commits30d: number;
  contributors30d: number;
  /** True when a repository hit the page cap, so counts are lower bounds. */
  truncated: boolean;
  /** Repositories with no commits on their default branch in 30 days. */
  quietRepos: string[];
  latestRelease: { repo: string; tag: string; date: string } | null;
}

export type ArbChainGroup = "arbitrum" | "competitor";

export interface ArbChainTvl {
  name: string;
  group: ArbChainGroup;
  tvlUsd: number;
}

export interface ArbL2Risk {
  name: string;
  value: string;
  sentiment: string | null;
}

export interface ArbL2Project {
  slug: string;
  name: string;
  group: ArbChainGroup;
  stage: string;
  tvsUsd: number | null;
  canonicalUsd: number | null;
  nativeUsd: number | null;
  externalUsd: number | null;
  stablecoinUsd: number | null;
  risks: ArbL2Risk[];
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
  /** DefiLlama chain TVL: Arbitrum ecosystem chains first, then competitors. */
  chains: ArbChainTvl[] | null;
  /** ETHBEAT (formerly L2BEAT) projects: Arbitrum ecosystem, then competitors. */
  l2beat: ArbL2Project[] | null;
  trend: ArbTrendPoint[];
  errors: string[];
}

export const ARB_GITHUB_ORG = "OffchainLabs";
/** Repositories that are always counted, on top of the most recently pushed ones. */
export const ARB_GITHUB_CORE_REPOS = ["nitro", "nitro-contracts"] as const;
export const ARB_GITHUB_REPO_LIMIT = 6;

/** DefiLlama chain names in display order. */
export const ARB_CHAIN_SET: { name: string; group: ArbChainGroup }[] = [
  { name: "Arbitrum", group: "arbitrum" },
  { name: "Robinhood Chain", group: "arbitrum" },
  { name: "Arbitrum Nova", group: "arbitrum" },
  { name: "Base", group: "competitor" },
  { name: "OP Mainnet", group: "competitor" },
];

/** ETHBEAT slugs in display order. */
export const ARB_L2BEAT_SET: { slug: string; group: ArbChainGroup }[] = [
  { slug: "arbitrum", group: "arbitrum" },
  { slug: "robinhood", group: "arbitrum" },
  { slug: "nova", group: "arbitrum" },
  { slug: "base", group: "competitor" },
  { slug: "op-mainnet", group: "competitor" },
];

const LIVE_TTL_MS = 15 * 60 * 1000;
const GITHUB_TTL_MS = 6 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const GITHUB_PAGE_CAP = 3;

// ---------- pure parsers ----------

function num(x: unknown): number | null {
  return typeof x === "number" && Number.isFinite(x) ? x : null;
}

function sumValues(o: unknown): number | null {
  if (!o || typeof o !== "object") return null;
  let total = 0;
  let any = false;
  for (const v of Object.values(o as Record<string, unknown>)) {
    if (typeof v === "number" && Number.isFinite(v)) {
      total += v;
      any = true;
    }
  }
  return any ? total : null;
}

interface CgCoin {
  last_updated?: string;
  market_data?: {
    current_price?: { usd?: number };
    price_change_percentage_24h?: number;
    market_cap?: { usd?: number };
    fully_diluted_valuation?: { usd?: number };
    circulating_supply?: number;
    total_supply?: number;
    max_supply?: number;
    ath?: { usd?: number };
    ath_date?: { usd?: string };
    last_updated?: string;
  };
}

export function parseCoinGeckoCoin(json: unknown): ArbMarket {
  const coin = json as CgCoin;
  const md = coin?.market_data;
  const price = num(md?.current_price?.usd);
  if (price === null) throw new Error("CoinGecko: missing ARB price");
  const updated = md?.last_updated ?? coin?.last_updated;
  return {
    priceUsd: price,
    change24hPct: num(md?.price_change_percentage_24h),
    marketCapUsd: num(md?.market_cap?.usd),
    fdvUsd: num(md?.fully_diluted_valuation?.usd),
    circulatingSupply: num(md?.circulating_supply),
    totalSupply: num(md?.total_supply),
    maxSupply: num(md?.max_supply),
    athUsd: num(md?.ath?.usd),
    athDate: typeof md?.ath_date?.usd === "string" ? md.ath_date.usd : null,
    lastUpdated: typeof updated === "string" ? updated : null,
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
    asOf: last.t,
    series: lastDays(series, 365),
  };
}

interface LlamaStableRow {
  date?: unknown;
  totalCirculatingUSD?: unknown;
  totalMintedUSD?: unknown;
  totalBridgedToUSD?: unknown;
}

/** stablecoins.llama.fi /stablecoincharts/{chain}: totals per peg bucket. */
export function parseLlamaStables(json: unknown): ArbStables {
  if (!Array.isArray(json)) throw new Error("DefiLlama: bad stablecoin payload");
  const series: ArbSeriesPoint[] = [];
  let lastRow: LlamaStableRow | null = null;
  for (const row of json as LlamaStableRow[]) {
    const d = Number(row?.date);
    const total = sumValues(row?.totalCirculatingUSD);
    if (!Number.isFinite(d) || total === null) continue;
    series.push({ t: d * 1000, v: total });
    if (!lastRow || d >= Number(lastRow.date)) lastRow = row;
  }
  if (series.length === 0 || !lastRow) throw new Error("DefiLlama: empty stablecoin history");
  series.sort((a, b) => a.t - b.t);
  const last = series[series.length - 1];
  return {
    currentUsd: last.v,
    nativeUsd: sumValues(lastRow.totalMintedUSD),
    bridgedUsd: sumValues(lastRow.totalBridgedToUSD),
    asOf: last.t,
    series: lastDays(series, 365),
  };
}

/** DefiLlama /summary/fees/{protocol}: { total30d }. */
export function parseLlamaFees(json: unknown): number {
  const v = num((json as { total30d?: unknown })?.total30d);
  if (v === null) throw new Error("DefiLlama: missing 30d fees");
  return v;
}

/** DefiLlama /v2/chains: [{ name, tvl }] filtered to the display set. */
export function parseLlamaChains(json: unknown): ArbChainTvl[] {
  if (!Array.isArray(json)) throw new Error("DefiLlama: bad chains payload");
  const byName = new Map<string, number>();
  for (const row of json as { name?: unknown; tvl?: unknown }[]) {
    const v = num(row?.tvl);
    if (typeof row?.name === "string" && v !== null) byName.set(row.name, v);
  }
  const out = ARB_CHAIN_SET.filter((c) => byName.has(c.name)).map((c) => ({
    name: c.name,
    group: c.group,
    tvlUsd: byName.get(c.name) as number,
  }));
  if (!out.some((c) => c.name === "Arbitrum")) throw new Error("DefiLlama: Arbitrum missing from chains");
  return out;
}

interface L2BeatProject {
  slug?: unknown;
  name?: unknown;
  stage?: unknown;
  risks?: { name?: unknown; value?: unknown; sentiment?: unknown }[];
  tvs?: { breakdown?: Record<string, unknown> };
}

/** ETHBEAT (formerly L2BEAT) /api/scaling/summary: { projects: { [id]: project } }. */
export function parseL2BeatSummary(json: unknown): ArbL2Project[] {
  const projects = (json as { projects?: unknown })?.projects;
  if (!projects || typeof projects !== "object") throw new Error("ETHBEAT: bad summary payload");
  const list = (Array.isArray(projects) ? projects : Object.values(projects)) as L2BeatProject[];
  const bySlug = new Map<string, L2BeatProject>();
  for (const p of list) if (typeof p?.slug === "string") bySlug.set(p.slug, p);
  const out: ArbL2Project[] = [];
  for (const { slug, group } of ARB_L2BEAT_SET) {
    const p = bySlug.get(slug);
    if (!p || typeof p.stage !== "string" || typeof p.name !== "string") continue;
    const b = p.tvs?.breakdown ?? {};
    out.push({
      slug,
      name: p.name,
      group,
      stage: p.stage,
      tvsUsd: num(b.total),
      canonicalUsd: num(b.canonical),
      nativeUsd: num(b.native),
      externalUsd: num(b.external),
      stablecoinUsd: num(b.stablecoin),
      risks: (p.risks ?? [])
        .filter((r) => typeof r?.name === "string" && typeof r?.value === "string")
        .map((r) => ({
          name: r.name as string,
          value: r.value as string,
          sentiment: typeof r.sentiment === "string" ? r.sentiment : null,
        })),
    });
  }
  if (!out.some((p) => p.slug === "arbitrum")) throw new Error("ETHBEAT: Arbitrum One missing");
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
  latestRelease: ArbGithub["latestRelease"] = null,
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
    quietRepos: pages.filter((p) => p.commits.length === 0).map((p) => p.repo),
    latestRelease,
  };
}

/** Pick repositories to count: core repos plus the most recently pushed
 * public, non-fork, non-archived ones, up to the limit. */
export function pickRepos(json: unknown, limit = ARB_GITHUB_REPO_LIMIT): string[] {
  const picked: string[] = ARB_GITHUB_CORE_REPOS.map((r) => `${ARB_GITHUB_ORG}/${r}`);
  if (Array.isArray(json)) {
    for (const r of json as { full_name?: unknown; fork?: unknown; archived?: unknown }[]) {
      if (picked.length >= limit) break;
      if (typeof r?.full_name !== "string" || r.fork === true || r.archived === true) continue;
      if (!picked.includes(r.full_name)) picked.push(r.full_name);
    }
  }
  return picked.slice(0, limit);
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

const GH = "https://api.github.com";

async function fetchRepoCommits(repo: string, sinceIso: string) {
  const commits: GhCommit[] = [];
  let truncated = false;
  for (let page = 1; page <= GITHUB_PAGE_CAP; page++) {
    const url = `${GH}/repos/${repo}/commits?since=${encodeURIComponent(sinceIso)}&per_page=100&page=${page}`;
    const batch = (await getJson(url, githubHeaders())) as GhCommit[];
    if (!Array.isArray(batch)) throw new Error(`GitHub: bad payload for ${repo}`);
    commits.push(...batch);
    if (batch.length < 100) break;
    if (page === GITHUB_PAGE_CAP) truncated = true;
  }
  return { repo, commits, truncated };
}

async function fetchLatestRelease(): Promise<ArbGithub["latestRelease"]> {
  const repo = `${ARB_GITHUB_ORG}/nitro`;
  const r = (await getJson(`${GH}/repos/${repo}/releases/latest`, githubHeaders())) as {
    tag_name?: unknown;
    published_at?: unknown;
  };
  if (typeof r?.tag_name !== "string" || typeof r?.published_at !== "string") return null;
  return { repo, tag: r.tag_name, date: r.published_at };
}

async function fetchGithub(now: number): Promise<ArbGithub> {
  const since = new Date(now - 30 * DAY_MS).toISOString();
  const list = await getJson(
    `${GH}/orgs/${ARB_GITHUB_ORG}/repos?type=public&sort=pushed&direction=desc&per_page=20`,
    githubHeaders(),
  ).catch(() => null);
  const repos = pickRepos(list);
  const [pages, release] = await Promise.all([
    Promise.all(repos.map((r) => fetchRepoCommits(r, since))),
    fetchLatestRelease().catch(() => null),
  ]);
  return summarizeCommits(pages, release);
}

const LLAMA = "https://api.llama.fi";
const STABLES = "https://stablecoins.llama.fi";
/** ETHBEAT is the new name of L2BEAT; l2beat.com redirects here. */
const ETHBEAT = "https://ethbeat.org";

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
    fees: () => getJson(`${LLAMA}/summary/fees/arbitrum?dataType=dailyFees`).then(parseLlamaFees),
    chains: () => getJson(`${LLAMA}/v2/chains`).then(parseLlamaChains),
    l2beat: () => getJson(`${ETHBEAT}/api/scaling/summary`).then(parseL2BeatSummary),
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
  const chains = pick<ArbChainTvl[]>("chains");
  const l2beat = pick<ArbL2Project[]>("l2beat");
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
    chains,
    l2beat,
    trend: buildTrend(priceSeries, tvl?.series ?? [], stablecoins?.series ?? []),
    errors,
  };
}

// ---------- fixture ----------

/** Deterministic synthetic data for e2e and offline runs; always labeled as
 * fixture in the UI so it can never be mistaken for real market data. */
export function arbFixture(now = Date.UTC(2026, 10, 18)): ArbLive {
  const start = now - 365 * DAY_MS;
  const series = (base: number, drift: number, wobble: number): ArbSeriesPoint[] =>
    Array.from({ length: 366 }, (_, i) => ({
      t: start + i * DAY_MS,
      v: base * (1 + (drift * i) / 365 + wobble * Math.sin(i / 17)),
    }));
  const priceSeries = series(0.24, -0.45, 0.05);
  const tvlSeries = series(2.0e9, -0.33, 0.04);
  const stableSeries = series(3.4e9, 0.24, 0.02);
  const tvl = parseLlamaTvl(tvlSeries.map((p) => ({ date: p.t / 1000, tvl: p.v })));
  const price = priceSeries[priceSeries.length - 1].v;
  const circulating = 7.0e9;
  const stablesNow = stableSeries[stableSeries.length - 1].v;
  return {
    mode: "fixture",
    fetchedAt: new Date(now).toISOString(),
    market: {
      priceUsd: price,
      change24hPct: -0.9,
      marketCapUsd: price * circulating,
      fdvUsd: price * 1e10,
      circulatingSupply: circulating,
      totalSupply: 1e10,
      maxSupply: 1e10,
      athUsd: 2.39,
      athDate: "2024-01-12T04:29:59.000Z",
      lastUpdated: new Date(now - 5 * 60 * 1000).toISOString(),
    },
    priceSeries,
    tvl,
    stablecoins: {
      currentUsd: stablesNow,
      nativeUsd: stablesNow * 0.78,
      bridgedUsd: stablesNow * 0.22,
      asOf: stableSeries[stableSeries.length - 1].t,
      series: stableSeries,
    },
    fees30dUsd: 5.2e5,
    github: {
      repos: ["OffchainLabs/nitro", "OffchainLabs/nitro-contracts", "OffchainLabs/prysm", "OffchainLabs/bold"],
      commits30d: 212,
      contributors30d: 41,
      truncated: false,
      quietRepos: ["OffchainLabs/nitro"],
      latestRelease: { repo: "OffchainLabs/nitro", tag: "v3.12.2", date: "2026-10-20T00:00:00Z" },
    },
    chains: [
      { name: "Arbitrum", group: "arbitrum", tvlUsd: tvl.currentUsd },
      { name: "Robinhood Chain", group: "arbitrum", tvlUsd: 0.99e9 },
      { name: "Arbitrum Nova", group: "arbitrum", tvlUsd: 430 },
      { name: "Base", group: "competitor", tvlUsd: 5.2e9 },
      { name: "OP Mainnet", group: "competitor", tvlUsd: 0.37e9 },
    ],
    l2beat: [
      {
        slug: "arbitrum",
        name: "Arbitrum One",
        group: "arbitrum",
        stage: "Stage 1",
        tvsUsd: 9.19e9,
        canonicalUsd: 2.84e9,
        nativeUsd: 1.84e9,
        externalUsd: 4.51e9,
        stablecoinUsd: 4.72e9,
        risks: [
          { name: "Sequencer Failure", value: "Self sequence", sentiment: "good" },
          { name: "State Validation", value: "Fraud proofs (INT)", sentiment: "good" },
          { name: "Data Availability", value: "Onchain", sentiment: "good" },
          { name: "Exit Window", value: "None", sentiment: "bad" },
          { name: "Proposer Failure", value: "Self propose", sentiment: "good" },
        ],
      },
      { slug: "robinhood", name: "Robinhood Chain", group: "arbitrum", stage: "Stage 0", tvsUsd: 1.9e9, canonicalUsd: 0.46e9, nativeUsd: 0.35e9, externalUsd: 1.08e9, stablecoinUsd: 1.08e9, risks: [] },
      { slug: "nova", name: "Arbitrum Nova", group: "arbitrum", stage: "Stage 0", tvsUsd: 7.7e6, canonicalUsd: 7.7e6, nativeUsd: 0, externalUsd: 0, stablecoinUsd: 0.33e6, risks: [] },
      { slug: "base", name: "Base Chain", group: "competitor", stage: "Stage 1", tvsUsd: 13.1e9, canonicalUsd: 2.53e9, nativeUsd: 5.64e9, externalUsd: 4.92e9, stablecoinUsd: 4.79e9, risks: [] },
      { slug: "op-mainnet", name: "OP Mainnet", group: "competitor", stage: "Stage 1", tvsUsd: 1.31e9, canonicalUsd: null, nativeUsd: null, externalUsd: null, stablecoinUsd: null, risks: [] },
    ],
    trend: buildTrend(priceSeries, tvl.series, stableSeries),
    errors: [],
  };
}

export async function getArbLive(mode: ArbLiveMode, now = Date.now()): Promise<ArbLive> {
  if (mode === "fixture") return arbFixture();
  return cached("arb:live", LIVE_TTL_MS, () => fetchLive(now));
}
