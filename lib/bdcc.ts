// Content model and pure helpers for the BDCC landing page (/bdcc).
// All copy, palette tokens, and link builders live here so the page stays a
// thin renderer and the data is unit-testable.
//
// Brand note: www.bdcc.co.il is not reachable from the build sandbox (egress
// policy), so the palette is a documented approximation of the BDCC look:
// deep navy surfaces with gold accents, Hebrew RTL. Swap the hex values in
// BDCC_PALETTE once the exact brand codes are confirmed; the page consumes
// colors only through these tokens.

export const BDCC_SITE_URL = "https://www.bdcc.co.il";

export const BDCC_PALETTE = {
  bg: "#0a0f1e",
  surface: "#121a30",
  surfaceRaised: "#1a2342",
  gold: "#f2b632",
  goldSoft: "#ffd166",
  text: "#f4f6fb",
  textMuted: "#9aa5c0",
  line: "rgba(244, 246, 251, 0.14)",
} as const;

export interface BdccCourse {
  id: string;
  /** Path on the official site, joined by bdccUrl(). */
  path: string;
  title: string;
  tagline: string;
  points: string[];
  badge?: string;
}

export const BDCC_CONTENT = {
  brand: "BDCC",
  nameHe: "המכללה לבלוקצ'יין ומטבעות דיגיטליים",
  heroTitle: "לומדים קריפטו נכון. מהיסודות ועד רמה מקצועית.",
  heroSubtitle:
    "המכללה לבלוקצ'יין ומטבעות דיגיטליים, מבית CryptoJungle, מכשירה משקיעים, סוחרים ואנשי מקצוע בתחום הבלוקצ'יין מאז 2017.",
  stats: [
    { value: "2017", label: "שנת הקמה, מבית CryptoJungle" },
    { value: "3", label: "מסלולי לימוד מרכזיים" },
    { value: "הסמכה רשמית", label: "מטעם לשכת טכנולוגיות המידע" },
  ],
  courses: [
    {
      id: "invest",
      path: "/course/invest-and-trade",
      title: "קורס השקעות קריפטו",
      tagline: "דרך פשוטה ונגישה להיכנס לעולם הקריפטו",
      points: [
        "רכישה והחזקה בטוחה של מטבעות דיגיטליים",
        "בניית אסטרטגיית השקעה לטווח ארוך",
        "ניהול סיכונים בלי ניתוחים טכניים מורכבים",
      ],
    },
    {
      id: "trading",
      path: "/course/trading",
      title: "קורס מסחר בקריפטו",
      tagline: "כלים מעשיים לסוחר האקטיבי",
      points: [
        "ניתוח גרפים מתקדם",
        "בניית אסטרטגיות מסחר",
        "עבודה נכונה עם פקודות וניהול פוזיציות",
      ],
    },
    {
      id: "expert",
      path: "/courses",
      title: "הסמכת Blockchain Expert",
      tagline: "התוכנית המקצועית עם הסמכה רשמית",
      badge: "הסמכה רשמית",
      points: [
        "תעודה מטעם לשכת טכנולוגיות המידע",
        "מוכרת בקרב בנקים, גופי אכיפה וחברות בלוקצ'יין",
        "הכשרה מקצועית מקיפה לעולם התוכן הטכנולוגי",
      ],
    },
  ] satisfies BdccCourse[],
  about:
    "BDCC הוקמה בשנת 2017 כזרוע ההדרכה של CryptoJungle, גוף התוכן והמדיה המוביל בישראל בתחום הקריפטו. המכללה מפעילה קהילת קריפטו ותיקה ומציעה מסלולי לימוד למשקיעים, לסוחרים ולאנשי מקצוע.",
  contact: {
    city: "רמת גן",
    email: "support@bdcc.co.il",
    phone: "+972 55-282-8741",
    phoneDisplay: "055-282-8741",
  },
  ticker: [
    "Bitcoin ₿",
    "Ethereum Ξ",
    "בלוקצ'יין",
    "DeFi",
    "NFT",
    "Web3",
    "מסחר",
    "השקעות",
    "ארנקים",
    "אבטחה",
    "רגולציה",
    "Smart Contracts",
  ],
  disclaimer:
    "עמוד נחיתה זה נבנה כהדגמה ומפנה אל האתר הרשמי של BDCC. התכנים והזכויות שייכים ל-BDCC.",
} as const;

/** Join a site path to the official BDCC origin. */
export function bdccUrl(path: string): string {
  if (!path.startsWith("/")) path = `/${path}`;
  return `${BDCC_SITE_URL}${path}`;
}

/** tel: href from a human-formatted phone: keeps digits and a leading +. */
export function telHref(phone: string): string {
  const plus = phone.trim().startsWith("+") ? "+" : "";
  return `tel:${plus}${phone.replace(/\D/g, "")}`;
}

/** mailto: href, trimmed. */
export function mailHref(email: string): string {
  return `mailto:${email.trim()}`;
}
