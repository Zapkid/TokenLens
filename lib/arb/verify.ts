import { formatCompactUsd } from "../format";
import { ARB_STATIC_STAGE, ARB_STATIC_ATH_USD } from "./content/facts";
import type { ArbLive } from "./live";
import { SRC } from "./sources";
import type { ArbSource, Bi } from "./types";

// Data validity checks for /arb. Every live number is tested against an
// independent number: another field of the same source (internal
// consistency), another source (cross-source agreement), the clock
// (freshness), or the page's own static answers (static drift). Pure and
// deterministic given `now`, so it is unit tested and also rendered into the
// Word appendix.

export type ArbCheckStatus = "pass" | "warn" | "fail" | "skip";

export interface ArbCheck {
  id: string;
  kind: "consistency" | "cross-source" | "freshness" | "static-drift" | "coverage";
  status: ArbCheckStatus;
  label: Bi;
  detail: Bi;
  sources: ArbSource[];
}

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

function pct(x: number): string {
  return `${(x * 100).toFixed(1)}%`;
}

function relDiff(a: number, b: number): number {
  const base = Math.max(Math.abs(a), Math.abs(b));
  return base === 0 ? 0 : Math.abs(a - b) / base;
}

function band(diff: number, passMax: number, warnMax: number): ArbCheckStatus {
  if (diff <= passMax) return "pass";
  if (diff <= warnMax) return "warn";
  return "fail";
}

function age(ms: number): Bi {
  if (ms < HOUR) {
    const m = Math.max(0, Math.round(ms / 60_000));
    return { en: `${m} min`, he: `${m} דקות` };
  }
  if (ms < 2 * DAY) {
    const h = Math.round(ms / HOUR);
    return { en: `${h} h`, he: `${h} שעות` };
  }
  const d = Math.round(ms / DAY);
  return { en: `${d} days`, he: `${d} ימים` };
}

const skip = (id: string, kind: ArbCheck["kind"], label: Bi, sources: ArbSource[]): ArbCheck => ({
  id,
  kind,
  status: "skip",
  label,
  detail: { en: "Not checked: an input is unavailable right now.", he: "לא נבדק: אחד מהנתונים אינו זמין כרגע." },
  sources,
});

export function verifyArbLive(live: ArbLive | null, now = Date.now()): ArbCheck[] {
  if (!live) return [];
  const checks: ArbCheck[] = [];
  const m = live.market;

  // 1. Market cap = price x circulating supply (CoinGecko internal).
  {
    const label = { en: "Market cap matches price × circulating supply", he: "שווי השוק תואם מחיר × היצע במחזור" };
    if (m?.marketCapUsd && m.circulatingSupply) {
      const implied = m.priceUsd * m.circulatingSupply;
      const d = relDiff(implied, m.marketCapUsd);
      checks.push({
        id: "mcap-consistency",
        kind: "consistency",
        status: band(d, 0.03, 0.1),
        label,
        detail: {
          en: `Reported ${formatCompactUsd(m.marketCapUsd)} vs implied ${formatCompactUsd(implied)} (difference ${pct(d)}).`,
          he: `מדווח ${formatCompactUsd(m.marketCapUsd)} מול מחושב ${formatCompactUsd(implied)} (פער ${pct(d)}).`,
        },
        sources: [SRC.coingecko],
      });
    } else checks.push(skip("mcap-consistency", "consistency", label, [SRC.coingecko]));
  }

  // 2. Supply bounds and the 10B genesis supply (no DAO inflation minted).
  {
    const label = { en: "Supply within bounds; total still 10B (no inflation minted)", he: "ההיצע בגבולות; ההיצע הכולל עדיין 10 מיליארד (לא הונפקה אינפלציה)" };
    if (m?.circulatingSupply && m.totalSupply) {
      const ordered = m.circulatingSupply <= m.totalSupply && (m.maxSupply === null || m.totalSupply <= m.maxSupply * 1.0001);
      const genesis = relDiff(m.totalSupply, 1e10) < 0.001;
      const share = m.circulatingSupply / m.totalSupply;
      checks.push({
        id: "supply-bounds",
        kind: "static-drift",
        status: !ordered ? "fail" : genesis ? "pass" : "warn",
        label,
        detail: genesis
          ? {
              en: `Total ${(m.totalSupply / 1e9).toFixed(2)}B; ${pct(share)} circulating. Matches answer 5.1.`,
              he: `סך הכול ${(m.totalSupply / 1e9).toFixed(2)} מיליארד; ${pct(share)} במחזור. תואם לתשובה 5.1.`,
            }
          : {
              en: `Total supply is ${(m.totalSupply / 1e9).toFixed(3)}B, not 10B: check whether the DAO minted inflation and update answer 5.1.`,
              he: `ההיצע הכולל הוא ${(m.totalSupply / 1e9).toFixed(3)} מיליארד ולא 10 מיליארד: יש לבדוק אם ה-DAO הנפיק אינפלציה ולעדכן את תשובה 5.1.`,
            },
        sources: [SRC.coingecko, SRC.tokenomics],
      });
    } else checks.push(skip("supply-bounds", "static-drift", label, [SRC.coingecko]));
  }

  // 3. Price freshness (CoinGecko's own timestamp).
  {
    const label = { en: "Price is fresh", he: "המחיר עדכני" };
    const t = m?.lastUpdated ? Date.parse(m.lastUpdated) : NaN;
    if (Number.isFinite(t)) {
      const a = now - t;
      const status: ArbCheckStatus = a <= 2 * HOUR ? "pass" : a <= DAY ? "warn" : "fail";
      const ag = age(a);
      checks.push({
        id: "price-freshness",
        kind: "freshness",
        status,
        label,
        detail: { en: `CoinGecko last updated ${ag.en} ago.`, he: `CoinGecko עודכן לפני ${ag.he}.` },
        sources: [SRC.coingecko],
      });
    } else checks.push(skip("price-freshness", "freshness", label, [SRC.coingecko]));
  }

  // 4. TVL and stablecoin freshness (DefiLlama daily series).
  for (const [id, asOf, label] of [
    ["tvl-freshness", live.tvl?.asOf, { en: "DeFi TVL series is current", he: "סדרת ה-TVL עדכנית" }],
    ["stables-freshness", live.stablecoins?.asOf, { en: "Stablecoin series is current", he: "סדרת הסטייבלקוינים עדכנית" }],
  ] as const) {
    if (typeof asOf === "number") {
      const a = now - asOf;
      const ag = age(a);
      checks.push({
        id,
        kind: "freshness",
        status: a <= 3 * DAY ? "pass" : a <= 7 * DAY ? "warn" : "fail",
        label,
        detail: { en: `Latest daily point is ${ag.en} old.`, he: `הנקודה היומית האחרונה בת ${ag.he}.` },
        sources: [SRC.defillamaChain],
      });
    } else checks.push(skip(id, "freshness", label, [SRC.defillamaChain]));
  }

  // 5. TVL: history endpoint vs chains endpoint (two DefiLlama datasets).
  {
    const label = { en: "TVL agrees across two DefiLlama endpoints", he: "ה-TVL תואם בין שני ממשקים של DefiLlama" };
    const listed = live.chains?.find((c) => c.name === "Arbitrum")?.tvlUsd;
    if (live.tvl && listed) {
      const d = relDiff(live.tvl.currentUsd, listed);
      checks.push({
        id: "tvl-cross",
        kind: "cross-source",
        status: band(d, 0.05, 0.15),
        label,
        detail: {
          en: `History ${formatCompactUsd(live.tvl.currentUsd)} vs chain list ${formatCompactUsd(listed)} (difference ${pct(d)}).`,
          he: `היסטוריה ${formatCompactUsd(live.tvl.currentUsd)} מול רשימת הרשתות ${formatCompactUsd(listed)} (פער ${pct(d)}).`,
        },
        sources: [SRC.defillamaChain],
      });
    } else checks.push(skip("tvl-cross", "cross-source", label, [SRC.defillamaChain]));
  }

  // 6. Spot price vs the last point of the 365 day chart.
  {
    const label = { en: "Spot price agrees with the price history", he: "המחיר הנוכחי תואם להיסטוריית המחיר" };
    const last = live.priceSeries[live.priceSeries.length - 1];
    if (m && last) {
      const d = relDiff(m.priceUsd, last.v);
      checks.push({
        id: "price-cross",
        kind: "consistency",
        status: band(d, 0.1, 0.25),
        label,
        detail: {
          en: `Spot $${m.priceUsd.toFixed(4)} vs last chart point $${last.v.toFixed(4)} (difference ${pct(d)}).`,
          he: `מחיר נוכחי $${m.priceUsd.toFixed(4)} מול נקודת הגרף האחרונה $${last.v.toFixed(4)} (פער ${pct(d)}).`,
        },
        sources: [SRC.coingecko],
      });
    } else checks.push(skip("price-cross", "consistency", label, [SRC.coingecko]));
  }

  // 7. Stablecoins: DefiLlama circulating vs ETHBEAT stablecoin value secured.
  {
    const label = { en: "Stablecoins agree across DefiLlama and ETHBEAT", he: "הסטייבלקוינים תואמים בין DefiLlama ל-ETHBEAT" };
    const l2 = live.l2beat?.find((p) => p.slug === "arbitrum")?.stablecoinUsd;
    if (live.stablecoins && l2) {
      const d = relDiff(live.stablecoins.currentUsd, l2);
      checks.push({
        id: "stables-cross",
        kind: "cross-source",
        status: band(d, 0.15, 0.4),
        label,
        detail: {
          en: `DefiLlama ${formatCompactUsd(live.stablecoins.currentUsd)} vs ETHBEAT ${formatCompactUsd(l2)} (difference ${pct(d)}). Methods differ: DefiLlama counts stablecoin supply on the chain, ETHBEAT counts stablecoin value it secures, so cite which one you use.`,
          he: `DefiLlama ${formatCompactUsd(live.stablecoins.currentUsd)} מול ETHBEAT ${formatCompactUsd(l2)} (פער ${pct(d)}). השיטות שונות: DefiLlama סופרת את היצע הסטייבלקוינים ברשת, ו-ETHBEAT סופרת את ערך הסטייבלקוינים שהיא מאבטחת, ולכן יש לציין באיזה מקור השתמשתם.`,
        },
        sources: [SRC.defillamaChain, SRC.l2beat],
      });
    } else checks.push(skip("stables-cross", "cross-source", label, [SRC.defillamaChain, SRC.l2beat]));
  }

  // 8. Static answers vs live: L2BEAT stage and ARB all-time high.
  {
    const label = { en: "Static answer: Arbitrum One stage still current", he: "תשובה קבועה: ה-Stage של Arbitrum One עדיין עדכני" };
    const stage = live.l2beat?.find((p) => p.slug === "arbitrum")?.stage;
    if (stage) {
      checks.push({
        id: "stage-static",
        kind: "static-drift",
        status: stage === ARB_STATIC_STAGE ? "pass" : "fail",
        label,
        detail:
          stage === ARB_STATIC_STAGE
            ? { en: `ETHBEAT rates Arbitrum One ${stage}, as answers 1.5 and B.1 state.`, he: `ETHBEAT מדרגת את Arbitrum One ב-${stage}, כפי שנכתב בתשובות 1.5 ו-ב.1.` }
            : { en: `ETHBEAT now rates Arbitrum One ${stage}; answers 1.5 and B.1 say ${ARB_STATIC_STAGE} and must be updated.`, he: `ETHBEAT מדרגת כעת את Arbitrum One ב-${stage}; בתשובות 1.5 ו-ב.1 כתוב ${ARB_STATIC_STAGE} ויש לעדכן.` },
        sources: [SRC.l2beat],
      });
    } else checks.push(skip("stage-static", "static-drift", label, [SRC.l2beat]));
  }
  {
    const label = { en: "Static answer: all-time high still $2.39", he: "תשובה קבועה: שיא כל הזמנים עדיין 2.39 דולר" };
    if (m?.athUsd) {
      const d = relDiff(m.athUsd, ARB_STATIC_ATH_USD);
      checks.push({
        id: "ath-static",
        kind: "static-drift",
        status: d <= 0.01 ? "pass" : "fail",
        label,
        detail: { en: `CoinGecko all-time high $${m.athUsd.toFixed(2)}; answers 7.2 and B.5 use $${ARB_STATIC_ATH_USD}.`, he: `שיא כל הזמנים ב-CoinGecko הוא $${m.athUsd.toFixed(2)}; בתשובות 7.2 ו-ב.5 נכתב $${ARB_STATIC_ATH_USD}.` },
        sources: [SRC.coingecko],
      });
    } else checks.push(skip("ath-static", "static-drift", label, [SRC.coingecko]));
  }

  // 9. GitHub coverage: a silent default branch is a weak activity signal.
  {
    const label = { en: "GitHub activity measured across several repositories", he: "פעילות GitHub נמדדת על פני כמה מאגרים" };
    const g = live.github;
    if (g) {
      const quiet = g.quietRepos.length;
      checks.push({
        id: "github-coverage",
        kind: "coverage",
        status: quiet === 0 ? "pass" : quiet < g.repos.length ? "warn" : "fail",
        label,
        detail:
          quiet === 0
            ? { en: `${g.repos.length} repositories, all with commits in the last 30 days.`, he: `${g.repos.length} מאגרים, בכולם היו commits ב-30 הימים האחרונים.` }
            : {
                en: `No default-branch commits in 30 days in: ${g.repos.filter((r) => g.quietRepos.includes(r)).join(", ")}. Work may happen on other branches or in release batches, so quote the organization total, not one repository.`,
                he: `לא היו commits בענף הראשי ב-30 יום ב: ${g.repos.filter((r) => g.quietRepos.includes(r)).join(", ")}. ייתכן שהעבודה נעשית בענפים אחרים או באצוות שחרור, ולכן יש לצטט את הסך של הארגון ולא של מאגר יחיד.`,
              },
        sources: [SRC.github],
      });
    } else checks.push(skip("github-coverage", "coverage", label, [SRC.github]));
  }

  return checks;
}

export function summarizeChecks(checks: ArbCheck[]): Record<ArbCheckStatus, number> {
  const out: Record<ArbCheckStatus, number> = { pass: 0, warn: 0, fail: 0, skip: 0 };
  for (const c of checks) out[c.status]++;
  return out;
}
