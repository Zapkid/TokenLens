import { SRC } from "../sources";
import type { ArbKeyFact, ArbVerification } from "../types";

/** Date the static answers were last researched and verified. */
export const ARB_RESEARCH_DATE = "2026-11-18";

/** Values the static answers state; lib/arb/verify.ts flags drift against live data. */
export const ARB_STATIC_STAGE = "Stage 1";
export const ARB_STATIC_ATH_USD = 2.39;

const primary = (note?: ArbVerification["note"]): ArbVerification => ({
  status: "primary",
  checkedOn: ARB_RESEARCH_DATE,
  note,
});
const secondary = (note?: ArbVerification["note"]): ArbVerification => ({
  status: "secondary",
  checkedOn: ARB_RESEARCH_DATE,
  note,
});
const conflicting = (note: ArbVerification["note"]): ArbVerification => ({
  status: "conflicting",
  checkedOn: ARB_RESEARCH_DATE,
  note,
});
const derived = (note: ArbVerification["note"]): ArbVerification => ({
  status: "derived",
  checkedOn: ARB_RESEARCH_DATE,
  note,
});
export const VERIFY = { primary, secondary, conflicting, derived };

export const ARB_KEY_FACTS: ArbKeyFact[] = [
  {
    label: { en: "Type", he: "סוג" },
    value: { en: "Ethereum Layer 2, optimistic rollup (Nitro stack)", he: "שכבה 2 של אתריום, Rollup אופטימי (Nitro)" },
    source: SRC.l2beat,
    verification: primary({ en: "ETHBEAT category: Optimistic Rollup.", he: "הקטגוריה ב-ETHBEAT: Optimistic Rollup." }),
  },
  {
    label: { en: "Mainnet", he: "רשת ראשית" },
    value: { en: "Arbitrum One open to the public since 31 Aug 2021", he: "‏Arbitrum One פתוחה לציבור מ-31.8.2021" },
    source: SRC.seriesB,
    verification: secondary(),
  },
  {
    label: { en: "Core developer", he: "מפתחת ליבה" },
    value: { en: "Offchain Labs (founded 2018, Princeton roots)", he: "‏Offchain Labs (נוסדה ב-2018, שורשים בפרינסטון)" },
    source: SRC.usenix2018,
    verification: primary(),
  },
  {
    label: { en: "Token", he: "טוקן" },
    value: { en: "ARB, governance only; 10B total, up to 2% yearly inflation by DAO vote (none minted)", he: "‏ARB, ממשל בלבד; 10 מיליארד בסך הכול, עד 2% אינפלציה שנתית בהצבעת DAO (לא הונפקה)" },
    source: SRC.coingecko,
    verification: primary({ en: "CoinGecko total supply 10,000,000,000 on 18 Nov 2026.", he: "ההיצע הכולל ב-CoinGecko הוא 10,000,000,000 ב-18.11.2026." }),
  },
  {
    label: { en: "Gas token", he: "טוקן עמלות" },
    value: { en: "ETH", he: "ETH" },
    source: SRC.docsOverview,
    verification: primary(),
  },
  {
    label: { en: "ETHBEAT (L2BEAT) stage", he: "דירוג ETHBEAT ‏(L2BEAT)" },
    value: { en: "Stage 1; exit window rated None because of the Security Council", he: "‏Stage 1; חלון היציאה מדורג None בגלל מועצת הביטחון" },
    source: SRC.l2beat,
    verification: primary({ en: "Also checked live on every page load (data quality panel).", he: "נבדק גם בזמן אמת בכל טעינה (לוח איכות הנתונים)." }),
  },
  {
    label: { en: "Proof system", he: "מערכת הוכחות" },
    value: { en: "BoLD, permissionless interactive fraud proofs (since Feb 2025)", he: "‏BoLD, הוכחות הונאה אינטראקטיביות פתוחות לכל (מפברואר 2025)" },
    source: SRC.docsBold,
    verification: primary({ en: "ETHBEAT: State validation, Fraud proofs (INT).", he: "‏ETHBEAT: אימות מצב, Fraud proofs ‏(INT)." }),
  },
  {
    label: { en: "Ordering policy", he: "מדיניות סידור עסקאות" },
    value: { en: "PGA (priority gas auctions) since 2026, replacing Timeboost (Apr 2025 to 2026)", he: "‏PGA (מכרזי עמלת עדיפות) מ-2026, במקום Timeboost (אפריל 2025 עד 2026)" },
    source: SRC.docsTimeboost,
    verification: primary(),
  },
  {
    label: { en: "Security Council", he: "מועצת הביטחון" },
    value: { en: "12 elected members; emergency actions need 9 of 12", he: "‏12 חברים נבחרים; פעולות חירום דורשות 9 מתוך 12" },
    source: SRC.scKeyRotation,
    verification: primary(),
  },
  {
    label: { en: "DAO income", he: "הכנסות ה-DAO" },
    value: { en: "$6.19M in H1 2026 at 97% gross margin; $125M non-ARB treasury", he: "‏6.19 מיליון דולר במחצית הראשונה של 2026 ברווח גולמי של 97%; ‏125 מיליון דולר בקופה שאינם ARB" },
    source: SRC.h1Revenue2026,
    verification: primary({ en: "The Foundation's own H1 2026 update; figures are unaudited.", he: "עדכון המחצית הראשונה של הקרן עצמה; הנתונים אינם מבוקרים." }),
  },
  {
    label: { en: "Voting venues", he: "מקומות ההצבעה" },
    value: { en: "Snapshot (off-chain) and the Foundation's on-chain portal (Tally wound down in 2026)", he: "‏Snapshot (אוף-צ׳יין) והפורטל האון-צ׳יין של הקרן (Tally נסגר ב-2026)" },
    source: SRC.tally,
    verification: primary(),
  },
  {
    label: { en: "Series B", he: "סבב B" },
    value: { en: "$120M (Aug 2021, led by Lightspeed)", he: "‏120 מיליון דולר (אוגוסט 2021, בהובלת Lightspeed)" },
    source: SRC.seriesB,
    verification: conflicting({
      en: "Some databases list $100M; $120M follows the contemporaneous announcement coverage.",
      he: "חלק ממאגרי המידע רושמים 100 מיליון דולר; 120 מיליון לפי סיקור ההכרזה בזמן אמת.",
    }),
  },
];
