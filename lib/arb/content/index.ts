import type { ArbChapter, Bi } from "../types";
import { CHAPTER_1, CHAPTER_2, CHAPTER_3 } from "./part-a1";
import { CHAPTER_4, CHAPTER_5, CHAPTER_6, CHAPTER_7, CHAPTER_BONUS } from "./part-a2";
import { PART_B } from "./part-b";

export { ARB_KEY_FACTS, ARB_RESEARCH_DATE, ARB_STATIC_ATH_USD, ARB_STATIC_STAGE } from "./facts";
export { ARB_CATEGORY_LABELS, ARB_ERAS, ARB_HISTORY, ARB_TIMELINE, eraOf, historyDateLabel } from "./history";
export { ARB_GLOSSARY, ARB_PRACTICE, ARB_STEPS } from "./learn";
export { ARB_ROADMAP, ARB_ROADMAP_STATUS } from "./roadmap";

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

export function questionCount(): number {
  return ARB_CHAPTERS.reduce((n, c) => n + c.questions.length, 0);
}
