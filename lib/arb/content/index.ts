import { SRC } from "../sources";
import type { ArbChapter, ArbKeyFact, ArbTimelineEvent, Bi } from "../types";
import { CHAPTER_1, CHAPTER_2, CHAPTER_3 } from "./part-a1";
import { CHAPTER_4, CHAPTER_5, CHAPTER_6, CHAPTER_7, CHAPTER_BONUS } from "./part-a2";
import { PART_B } from "./part-b";

/** Date the static answers were researched. Live numbers carry their own
 * fetch timestamp. */
export const ARB_RESEARCH_DATE = "2026-11-01";

export const ARB_COURSE_DOC_URL =
  "https://docs.google.com/document/d/1JKleEqcOZeB86PZ3wprSDvfa8Kle_1pgT4S0o5SPqnM";

/** Course order: Part A chapters 1 to 7, the bonus, then Part B. */
export const ARB_CHAPTERS: ArbChapter[] = [
  CHAPTER_1,
  CHAPTER_2,
  CHAPTER_3,
  CHAPTER_4,
  CHAPTER_5,
  CHAPTER_6,
  CHAPTER_7,
  CHAPTER_BONUS,
  PART_B,
];

export const ARB_TITLE: Bi = {
  en: "Arbitrum (ARB): Blockchain Expert final project",
  he: "Arbitrum ‏(ARB): פרויקט גמר במסלול Blockchain Expert",
};

export const ARB_INTRO: Bi = {
  en: "Research hub for the Blockchain Expert final project (cohort 14) on Arbitrum, the Layer 2 track. It answers every common question (Part A) and the Arbitrum-specific questions (Part B) from verifiable sources, shows live network and token data with check times, and exports the whole paper as a Word file.",
  he: "מרכז מחקר לפרויקט הגמר במסלול Blockchain Expert (מחזור 14) על Arbitrum, במסלול שכבה 2. העמוד עונה על כל השאלות המשותפות (חלק א׳) ועל השאלות הייעודיות ל-Arbitrum (חלק ב׳) על בסיס מקורות שניתן לאמת, מציג נתוני רשת וטוקן בזמן אמת עם זמן בדיקה, ומייצא את כל העבודה לקובץ Word.",
};

/** Course guidelines summarized from the official brief. */
export const ARB_GUIDELINES: { label: Bi; value: Bi }[] = [
  {
    label: { en: "Submission deadline", he: "מועד הגשה" },
    value: { en: "30 March 2027; grades for all participants by 30 June 2027", he: "עד 30.03.2027; הציונים יפורסמו עד 30.06.2027" },
  },
  {
    label: { en: "Format", he: "פורמט" },
    value: {
      en: "Word document only, Arial or David 12 pt, 1.5 line spacing; full name in the file name; cover page with full name in Hebrew and English and ID number; written in Hebrew unless approved otherwise",
      he: "מסמך Word בלבד, גופן Arial או David בגודל 12, רווח שורה וחצי; שם מלא בשם הקובץ; עמוד שער עם שם מלא בעברית ובאנגלית ומספר זהות; בעברית אלא אם התקבל אישור אחר",
    },
  },
  {
    label: { en: "Length", he: "היקף" },
    value: { en: "Up to 20 pages, excluding cover page, sources and appendices", he: "עד 20 עמודים, לא כולל עמוד שער, רשימת מקורות ונספחים" },
  },
  {
    label: { en: "Grading", he: "ציון" },
    value: {
      en: "Written paper up to 40 points, personal interview up to 60 (about 30 minutes); pass with 70 and at least 36 of 60 in the interview; bonus up to 3 points",
      he: "עבודה כתובה עד 40 נקודות, ריאיון אישי עד 60 (כ-30 דקות); ציון עובר 70 ולפחות 36 מתוך 60 בריאיון; בונוס עד 3 נקודות",
    },
  },
  {
    label: { en: "Structure", he: "מבנה" },
    value: {
      en: "Answer in the course order and label each answer with its question number; every number needs a source and a check date",
      he: "יש לענות לפי סדר השאלות ולציין לכל תשובה את מספר השאלה; לכל נתון מספרי יש לציין מקור ותאריך בדיקה",
    },
  },
  {
    label: { en: "AI tools", he: "שימוש ב-AI" },
    value: {
      en: "Allowed for research, summarizing and proofreading; you are responsible for every claim and must verify each figure against a primary source and defend it in the interview",
      he: "מותר למחקר, לסיכום מקורות ולהגהה; האחריות על כל טענה היא שלכם, ויש לאמת כל נתון מול מקור ראשוני ולהגן עליו בריאיון",
    },
  },
];

export const ARB_KEY_FACTS: ArbKeyFact[] = [
  {
    label: { en: "Type", he: "סוג" },
    value: { en: "Ethereum Layer 2, optimistic rollup (Nitro stack)", he: "שכבה 2 של אתריום, Rollup אופטימי (Nitro)" },
    source: SRC.docsOverview,
  },
  {
    label: { en: "Mainnet", he: "רשת ראשית" },
    value: { en: "Arbitrum One open to the public since 31 Aug 2021", he: "‏Arbitrum One פתוחה לציבור מ-31.8.2021" },
    source: SRC.docsOverview,
  },
  {
    label: { en: "Core developer", he: "מפתחת ליבה" },
    value: { en: "Offchain Labs (founded 2018, Princeton roots)", he: "‏Offchain Labs (נוסדה ב-2018, שורשים בפרינסטון)" },
    source: SRC.seriesB,
  },
  {
    label: { en: "Token", he: "טוקן" },
    value: { en: "ARB, governance only; 10B at genesis, up to 2% yearly inflation by DAO vote", he: "‏ARB, ממשל בלבד; 10 מיליארד ביצירה, עד 2% אינפלציה שנתית בהצבעת DAO" },
    source: SRC.tokenomics,
  },
  {
    label: { en: "Gas token", he: "טוקן עמלות" },
    value: { en: "ETH", he: "ETH" },
    source: SRC.docsOverview,
  },
  {
    label: { en: "L2BEAT stage", he: "דירוג L2BEAT" },
    value: { en: "Stage 1 (passes the walkaway test)", he: "‏Stage 1 (עוברת את מבחן ה-Walkaway)" },
    source: SRC.l2beat,
  },
  {
    label: { en: "Proof system", he: "מערכת הוכחות" },
    value: { en: "BoLD, permissionless interactive fraud proofs (since Feb 2025)", he: "‏BoLD, הוכחות הונאה אינטראקטיביות פתוחות לכל (מפברואר 2025)" },
    source: SRC.docsBold,
  },
  {
    label: { en: "Withdrawal delay", he: "זמן משיכה" },
    value: { en: "About 6.4 days via the canonical bridge", he: "כ-6.4 ימים דרך הגשר הקנוני" },
    source: SRC.docsBold,
  },
  {
    label: { en: "Security Council", he: "מועצת הביטחון" },
    value: { en: "12 elected members; emergency actions need 9 of 12", he: "‏12 חברים נבחרים; פעולות חירום דורשות 9 מתוך 12" },
    source: SRC.securityCouncilDocs,
  },
  {
    label: { en: "DAO income", he: "הכנסות ה-DAO" },
    value: { en: "About $23.5M gross in 2025; $6.19M in H1 2026", he: "כ-23.5 מיליון דולר ברוטו ב-2025; ‏6.19 מיליון דולר במחצית הראשונה של 2026" },
    source: SRC.h1Revenue2026,
  },
];

export const ARB_TIMELINE: ArbTimelineEvent[] = [
  {
    date: "2021-08-31",
    category: { en: "Launch and funding", he: "השקה וגיוס" },
    title: { en: "Arbitrum One opens to the public; $120M Series B", he: "‏Arbitrum One נפתחת לציבור; סבב B של 120 מיליון דולר" },
    detail: {
      en: "Mainnet beta opens to all users and apps. The same day Offchain Labs announces a $120M Series B led by Lightspeed at a reported $1.2B valuation.",
      he: "הרשת הראשית (בטא) נפתחת לכל המשתמשים והאפליקציות. באותו יום Offchain Labs מכריזה על סבב B של 120 מיליון דולר בהובלת Lightspeed לפי שווי מדווח של 1.2 מיליארד דולר.",
    },
    source: SRC.seriesB,
  },
  {
    date: "2022-08-31",
    category: { en: "Network upgrade", he: "שדרוג רשת" },
    title: { en: "Nitro upgrade", he: "שדרוג Nitro" },
    detail: {
      en: "Arbitrum One migrates to Nitro: a Geth-based execution core with WASM-based fraud proofs, cutting fees and raising throughput.",
      he: "‏Arbitrum One עוברת ל-Nitro: ליבת ביצוע מבוססת Geth עם הוכחות הונאה מבוססות WASM, שהוזילה עמלות והגדילה תפוקה.",
    },
    source: SRC.docsOverview,
  },
  {
    date: "2023-03-23",
    category: { en: "Token launch and listings", he: "השקת טוקן ורישום בבורסות" },
    title: { en: "ARB airdrop and DAO launch", he: "איירדרופ ARB והשקת ה-DAO" },
    detail: {
      en: "ARB is airdropped to users and DAOs, governance moves to the Arbitrum DAO, and ARB lists on major exchanges including Binance and Coinbase on day one.",
      he: "‏ARB מחולק באיירדרופ למשתמשים ול-DAOs, הממשל עובר ל-Arbitrum DAO, ו-ARB נרשם למסחר כבר ביום הראשון בבורסות מרכזיות כולל Binance ו-Coinbase.",
    },
    source: SRC.tokenomics,
  },
  {
    date: "2023-04-02",
    category: { en: "Governance crisis", he: "משבר ממשל" },
    title: { en: "AIP-1 fails; Foundation splits it into AIP-1.1 and 1.2", he: "‏AIP-1 נכשלת; הקרן מפצלת אותה ל-AIP-1.1 ו-1.2" },
    detail: {
      en: "After delegates learn the Foundation already moved 50M of the requested 750M ARB, the vote fails; the Foundation apologizes and restructures with lockups and transparency reports.",
      he: "אחרי שהדלגייטים מגלים שהקרן כבר הזיזה 50 מיליון מתוך 750 מיליון ה-ARB המבוקשים, ההצבעה נכשלת; הקרן מתנצלת ובונה מחדש את הבקשה עם נעילות ודוחות שקיפות.",
    },
    source: SRC.aip1Defiant,
  },
  {
    date: "2025-02-12",
    category: { en: "Security upgrade", he: "שדרוג אבטחה" },
    title: { en: "BoLD activates on Arbitrum One and Nova", he: "‏BoLD מופעל ב-Arbitrum One וב-Nova" },
    detail: {
      en: "Permissionless validation with bounded dispute delay replaces the allow-listed validator set.",
      he: "אימות פתוח לכל עם עיכוב מחלוקת חסום מחליף את רשימת המאמתים המורשים.",
    },
    source: SRC.docsBold,
  },
  {
    date: "2026-07-01",
    category: { en: "Strategic partnership", he: "שותפות אסטרטגית" },
    title: { en: "Robinhood Chain mainnet", he: "‏Robinhood Chain עולה לרשת ראשית" },
    detail: {
      en: "Robinhood launches its own Arbitrum chain settling to Ethereum for 24/7 tokenized stocks; it pays 10% of net revenue under the Expansion Program.",
      he: "‏Robinhood משיקה רשת Arbitrum משלה שמסלקת לאתריום, למסחר 24/7 במניות בטוקניזציה; היא משלמת 10% מההכנסה נטו במסגרת AEP.",
    },
    source: SRC.robinhoodFactsheet,
  },
  {
    date: "2026-10-30",
    category: { en: "Security incident response", he: "תגובה לאירוע אבטחה" },
    title: { en: "Security Council emergency actions", he: "פעולות חירום של מועצת הביטחון" },
    detail: {
      en: "After pausing new Stylus activations on 2 Oct, the council freezes 8,425 ETH and about 74.56M ARB tied to the Binance exploit on 30 Oct.",
      he: "אחרי עצירת הפעלות Stylus חדשות ב-2.10, המועצה מקפיאה ב-30.10 ‏8,425 ETH וכ-74.56 מיליון ARB שקשורים לפריצה ל-Binance.",
    },
    source: SRC.scFreeze,
  },
];

export function questionCount(): number {
  return ARB_CHAPTERS.reduce((n, c) => n + c.questions.length, 0);
}
