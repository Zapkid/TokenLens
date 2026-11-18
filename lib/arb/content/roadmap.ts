import { SRC } from "../sources";
import type { ArbRoadmapItem, ArbRoadmapStatus, Bi } from "../types";
import { VERIFY } from "./facts";

const { primary, secondary } = VERIFY;

export const ARB_ROADMAP_STATUS: Record<ArbRoadmapStatus, Bi> = {
  done: { en: "Delivered in 2026", he: "הושלם ב-2026" },
  voting: { en: "Decided by DAO vote (Nov 2026)", he: "בהכרעת הצבעת DAO (נובמבר 2026)" },
  next: { en: "Next", he: "הבא בתור" },
  longterm: { en: "Long term and open questions", he: "טווח ארוך ושאלות פתוחות" },
};

/** Arbitrum has no single official roadmap document: these items are
 * assembled from ArbOS upgrade notices, AIPs and Foundation updates. */
export const ARB_ROADMAP: ArbRoadmapItem[] = [
  {
    id: "dia",
    status: "done",
    when: { en: "Jan 2026", he: "ינואר 2026" },
    title: { en: "ArbOS 51 \"Dia\"", he: "‏ArbOS 51 \"Dia\"" },
    detail: { en: "Ethereum Fusaka compatibility and gas pricing changes on One and Nova.", he: "תאימות לשדרוג Fusaka של אתריום ושינויי תמחור גז ב-One וב-Nova." },
    source: SRC.docsArbos51,
    verification: secondary(),
  },
  {
    id: "robinhood",
    status: "done",
    when: { en: "1 Jul 2026", he: "1.7.2026" },
    title: { en: "Robinhood Chain mainnet (AEP license)", he: "‏Robinhood Chain ברשת ראשית (רישיון AEP)" },
    detail: { en: "First large institution on its own Arbitrum chain; 8% of its net revenue goes to the DAO.", he: "המוסד הגדול הראשון ברשת Arbitrum משלו; 8% מההכנסה נטו שלו הולכים ל-DAO." },
    source: SRC.robinhoodFactsheet,
    verification: primary(),
  },
  {
    id: "elara",
    status: "done",
    when: { en: "20 Aug 2026", he: "20.8.2026" },
    title: { en: "ArbOS 61 \"Elara\"", he: "‏ArbOS 61 \"Elara\"" },
    detail: { en: "Multidimensional gas pricing; Stylus contract size limit raised to 96 KB.", he: "תמחור גז רב-ממדי; מגבלת גודל חוזה Stylus הועלתה ל-96KB." },
    source: SRC.docsArbos61,
    verification: secondary(),
  },
  {
    id: "pga",
    status: "done",
    when: { en: "By Oct 2026", he: "עד אוקטובר 2026" },
    title: { en: "PGA and Fast Feed replace Timeboost", he: "‏PGA ו-Fast Feed מחליפים את Timeboost" },
    detail: {
      en: "Ordering by priority fee on standard transactions, 250 ms blocks with two 125 ms PGA rounds, plus a paid low-latency Fast Feed; 3% of ordering revenue to the Developer Guild.",
      he: "סידור לפי עמלת עדיפות בעסקאות רגילות, בלוקים של 250 מילישניות עם שני סבבי PGA של 125 מילישניות, ו-Fast Feed בתשלום עם השהיה נמוכה; 3% מהכנסות הסידור ל-Developer Guild.",
    },
    source: SRC.docsTimeboost,
    verification: primary(),
  },
  {
    id: "usdg",
    status: "voting",
    when: { en: "On-chain vote ended 12 Nov 2026", he: "הצבעה און-צ׳יין הסתיימה ב-12.11.2026" },
    title: { en: "USDG as a core strategic initiative", he: "‏USDG כיוזמה אסטרטגית מרכזית" },
    detail: {
      en: "Adds 100M ARB to the DRIP incentive budget, lets the treasury committee deploy assets for USDG, and routes AEP fees (net of the Developer Guild share) into USDG. Check the final result on the governance portal.",
      he: "מוסיף 100 מיליון ARB לתקציב התמריצים DRIP, מאפשר לוועדת הקופה להשקיע נכסים לטובת USDG, ומנתב את דמי ה-AEP (אחרי חלק ה-Developer Guild) ל-USDG. יש לבדוק את התוצאה הסופית בפורטל הממשל.",
    },
    source: SRC.votesNov2026,
    verification: primary(),
  },
  {
    id: "glamsterdam-params",
    status: "voting",
    when: { en: "On-chain vote ended 12 Nov 2026", he: "הצבעה און-צ׳יין הסתיימה ב-12.11.2026" },
    title: { en: "L1 pricing parameters for Ethereum Glamsterdam", he: "פרמטרי תמחור L1 לשדרוג Glamsterdam של אתריום" },
    detail: {
      en: "Updates parentGasFloorPerToken and perBatchGasCharge on One and Nova so the L1 fee users pay keeps matching the cost of posting batches after Glamsterdam; no ArbOS upgrade.",
      he: "מעדכן את parentGasFloorPerToken ו-perBatchGasCharge ב-One וב-Nova כדי שעמלת ה-L1 שמשתמשים משלמים תמשיך לשקף את עלות פרסום האצוות אחרי Glamsterdam; ללא שדרוג ArbOS.",
    },
    source: SRC.votesNov2026,
    verification: primary(),
  },
  {
    id: "binance-release",
    status: "voting",
    when: { en: "Temperature check ended 16 Nov 2026", he: "בדיקת עמדה הסתיימה ב-16.11.2026" },
    title: { en: "Release of the frozen Binance exploit funds", he: "שחרור כספי הפריצה ל-Binance שהוקפאו" },
    detail: {
      en: "Binance asks the DAO to return 8,425.997 ETH and 74,559,805.2 ARB to its recovery address through the same atomic Inbox upgrade the council used. A Constitutional on-chain vote would follow.",
      he: "‏Binance מבקשת מה-DAO להחזיר 8,425.997 ETH ו-74,559,805.2 ARB לכתובת השיקום שלה, באמצעות אותו שדרוג Inbox אטומי שהמועצה השתמשה בו. אחריה אמורה לבוא הצבעה חוקתית און-צ׳יין.",
    },
    source: SRC.binanceRelease,
    verification: primary(),
  },
  {
    id: "stylus-resume",
    status: "next",
    when: { en: "AIP posted 23 Oct 2026", he: "ההצעה פורסמה ב-23.10.2026" },
    title: { en: "Resume Stylus activations via an audited allow-list", he: "חידוש הפעלות Stylus דרך רשימת היתר מבוקרת" },
    detail: {
      en: "A Stylus Activation Contract would let the Foundation authorize new Stylus contracts that pass a limited security audit; the DAO could revoke the delegation by Constitutional vote.",
      he: "חוזה הפעלת Stylus יאפשר לקרן לאשר חוזי Stylus חדשים שעברו ביקורת אבטחה מוגבלת; ה-DAO יוכל לבטל את ההאצלה בהצבעה חוקתית.",
    },
    source: SRC.stylusResume,
    verification: primary(),
  },
  {
    id: "glamsterdam",
    status: "next",
    when: { en: "With Ethereum's Glamsterdam upgrade", he: "עם שדרוג Glamsterdam של אתריום" },
    title: { en: "Glamsterdam compatibility", he: "תאימות ל-Glamsterdam" },
    detail: { en: "Arbitrum Sepolia and Sepolia-based chains prepared for activation on 6 Oct 2026; mainnet follows Ethereum's schedule.", he: "‏Arbitrum Sepolia ורשתות מבוססות Sepolia נערכו להפעלה ב-6.10.2026; הרשת הראשית תעקוב אחר לוח הזמנים של אתריום." },
    source: SRC.docsArbos61,
    verification: secondary(),
  },
  {
    id: "unlock-end",
    status: "next",
    when: { en: "Mar 2027", he: "מרץ 2027" },
    title: { en: "Team and investor unlocks end", he: "סיום פתיחת הנעילות לצוות ולמשקיעים" },
    detail: { en: "The last of 36 monthly releases of about 92.6M ARB.", he: "האחרון מתוך 36 שחרורים חודשיים של כ-92.6 מיליון ARB." },
    source: SRC.unlocks,
    verification: secondary(),
  },
  {
    id: "foundation-funding",
    status: "next",
    when: { en: "2027", he: "2027" },
    title: { en: "Next Arbitrum Foundation funding request", he: "בקשת המימון הבאה של קרן Arbitrum" },
    detail: { en: "The 2026 request ($16M in RWAs, 1.7K ETH and 230M ARB) expects the Foundation to return to the DAO in 2027.", he: "בקשת 2026 (‏16 מיליון דולר ב-RWA, ‏1,700 ETH ו-230 מיליון ARB) צופה שהקרן תחזור ל-DAO ב-2027." },
    source: SRC.foundationFunding,
    verification: secondary(),
  },
  {
    id: "stage2",
    status: "longterm",
    when: { en: "No date set", he: "ללא תאריך" },
    title: { en: "Stage 2", he: "‏Stage 2" },
    detail: {
      en: "Requires limiting the Security Council to provable on-chain bugs and giving at least 30 days to exit before other upgrades; ETHBEAT rates the current exit window None.",
      he: "מחייב להגביל את מועצת הביטחון לבאגים שניתן להוכיח און-צ׳יין ולתת לפחות 30 יום ליציאה לפני שדרוגים אחרים; ETHBEAT מדרגת את חלון היציאה הנוכחי כ-None.",
    },
    source: SRC.l2beat,
    verification: primary(),
  },
  {
    id: "arb-utility",
    status: "longterm",
    when: { en: "Forum discussion since Nov 2025", he: "דיון בפורום מנובמבר 2025" },
    title: { en: "ARB beyond governance", he: "‏ARB מעבר לממשל" },
    detail: {
      en: "Delegates discuss gas abstraction, staking and Orbit alignment for ARB; no proposal has passed, so ARB remains governance-only.",
      he: "דלגייטים דנים בהפשטת גז, סטייקינג והתאמה לרשתות Orbit עבור ARB; שום הצעה לא עברה, ולכן ARB נשאר טוקן ממשל בלבד.",
    },
    source: SRC.arbUtility,
    verification: primary(),
  },
  {
    id: "emergency-policy",
    status: "longterm",
    when: { en: "Open after two freezes in 2026", he: "פתוח אחרי שתי הקפאות ב-2026" },
    title: { en: "A written policy for emergency freezes", he: "מדיניות כתובה להקפאות חירום" },
    detail: {
      en: "After the April and October freezes, delegates asked for written rules on when the Security Council may freeze funds.",
      he: "אחרי ההקפאות באפריל ובאוקטובר, דלגייטים ביקשו כללים כתובים לגבי מתי מועצת הביטחון רשאית להקפיא כספים.",
    },
    source: SRC.kelpFreeze,
    verification: primary(),
  },
];
