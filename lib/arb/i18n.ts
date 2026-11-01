import type { ArbAnswerKind, ArbLang } from "./types";

// UI chrome strings for /arb and the Word export. Content strings live in
// lib/arb/content; this file only labels the frame around them.

const STRINGS = {
  en: {
    switchTo: "עברית",
    switchLabel: "Switch to Hebrew",
    download: "Download Word",
    downloading: "Preparing...",
    downloadFailed: "Download failed. Please retry.",
    guidelines: "Course guidelines",
    courseDoc: "Original course brief",
    keyFacts: "Key facts",
    live: "Live data",
    liveLoading: "Loading live data...",
    liveFailed: "Live data is unavailable right now. Static answers below are unaffected.",
    liveFixture: "Synthetic fixture data (test mode), not real market data",
    checked: "Checked",
    source: "Source",
    sources: "Sources",
    timeline: "Timeline of significant events",
    partA: "Part A: common questions",
    partB: "Part B: Arbitrum-specific questions",
    question: "Question",
    researchDate: "Static answers researched on",
    contents: "Contents",
    price: "ARB price",
    change24h: "24h change",
    marketCap: "Market cap",
    fdv: "Fully diluted value",
    ath: "All-time high",
    circulating: "Circulating supply",
    totalSupply: "Total supply",
    tvl: "DeFi TVL (Arbitrum)",
    tvl30d: "30d change",
    stablecoins: "Stablecoins on Arbitrum",
    fees30d: "Arbitrum fees, last 30 days",
    github: "GitHub activity, last 30 days",
    commits: "Commits",
    contributors: "Distinct contributors",
    repos: "Repositories",
    competitors: "DeFi TVL comparison",
    chain: "Chain",
    trend: "Last 12 months, indexed to 100",
    trendPrice: "ARB price",
    trendTvl: "DeFi TVL",
    trendStables: "Stablecoins",
    na: "n/a",
    coverTitle: "Final project: Blockchain Expert track (cohort 14)",
    coverProject: "Project: Arbitrum (ARB), Layer 2",
    coverNameHe: "Full name (Hebrew):",
    coverNameEn: "Full name (English):",
    coverId: "ID number:",
    coverDate: "Date:",
    liveSnapshot: "Live data snapshot",
    personalNote: "To complete personally:",
    sourcesList: "List of sources",
  },
  he: {
    switchTo: "English",
    switchLabel: "Switch to English",
    download: "הורדת קובץ Word",
    downloading: "מכין...",
    downloadFailed: "ההורדה נכשלה. נסו שוב.",
    guidelines: "הנחיות הקורס",
    courseDoc: "מסמך ההנחיות המקורי",
    keyFacts: "עובדות מרכזיות",
    live: "נתונים בזמן אמת",
    liveLoading: "טוען נתונים בזמן אמת...",
    liveFailed: "הנתונים בזמן אמת אינם זמינים כרגע. התשובות הקבועות למטה לא מושפעות.",
    liveFixture: "נתוני בדיקה סינתטיים (מצב בדיקות), לא נתוני שוק אמיתיים",
    checked: "נבדק",
    source: "מקור",
    sources: "מקורות",
    timeline: "ציר זמן של אירועים משמעותיים",
    partA: "חלק א׳ - שאלות משותפות",
    partB: "חלק ב׳ - שאלות ייעודיות ל-Arbitrum",
    question: "שאלה",
    researchDate: "התשובות הקבועות נחקרו בתאריך",
    contents: "תוכן עניינים",
    price: "מחיר ARB",
    change24h: "שינוי 24 שעות",
    marketCap: "שווי שוק",
    fdv: "שווי בדילול מלא",
    ath: "שיא כל הזמנים",
    circulating: "היצע במחזור",
    totalSupply: "היצע כולל",
    tvl: "TVL של DeFi ב-Arbitrum",
    tvl30d: "שינוי 30 יום",
    stablecoins: "סטייבלקוינים ב-Arbitrum",
    fees30d: "עמלות Arbitrum ב-30 הימים האחרונים",
    github: "פעילות GitHub ב-30 הימים האחרונים",
    commits: "Commits",
    contributors: "תורמים ייחודיים",
    repos: "מאגרים",
    competitors: "השוואת TVL של DeFi",
    chain: "רשת",
    trend: "12 החודשים האחרונים, מנורמל ל-100",
    trendPrice: "מחיר ARB",
    trendTvl: "TVL של DeFi",
    trendStables: "סטייבלקוינים",
    na: "אין נתון",
    coverTitle: "פרויקט גמר - מסלול Blockchain Expert (מחזור 14)",
    coverProject: "הפרויקט: Arbitrum ‏(ARB), שכבה 2",
    coverNameHe: "שם מלא (עברית):",
    coverNameEn: "שם מלא (אנגלית):",
    coverId: "מספר זהות:",
    coverDate: "תאריך:",
    liveSnapshot: "תמונת מצב של נתונים בזמן אמת",
    personalNote: "להשלמה אישית:",
    sourcesList: "רשימת מקורות",
  },
} as const;

export type ArbStrings = { [K in keyof (typeof STRINGS)["en"]]: string };

export function arbStrings(lang: ArbLang): ArbStrings {
  return STRINGS[lang];
}

export function kindLabel(kind: ArbAnswerKind, lang: ArbLang): string {
  const labels: Record<ArbAnswerKind, { en: string; he: string }> = {
    fact: { en: "Fact-based", he: "מבוסס עובדות" },
    analysis: { en: "Analysis to defend", he: "ניתוח להגנה בריאיון" },
    personal: { en: "Needs your input", he: "דורש השלמה אישית" },
  };
  return labels[kind][lang];
}

/** Parse a language from a query value; English is the default. */
export function parseLang(value: string | null | undefined): ArbLang {
  return value === "he" ? "he" : "en";
}

export function langDir(lang: ArbLang): "rtl" | "ltr" {
  return lang === "he" ? "rtl" : "ltr";
}

/** Locale-aware date (dd.mm.yyyy for Hebrew, as the course writes dates). */
export function formatArbDate(iso: string, lang: ArbLang): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  if (lang === "he") {
    const dd = String(d.getUTCDate()).padStart(2, "0");
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    return `${dd}.${mm}.${d.getUTCFullYear()}`;
  }
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function formatArbDateTime(iso: string, lang: ArbLang): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mi = String(d.getUTCMinutes()).padStart(2, "0");
  return `${formatArbDate(iso, lang)} ${hh}:${mi} UTC`;
}
