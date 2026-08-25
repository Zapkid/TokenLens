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

export interface BdccCohort {
  cycle: string;
  when: string;
  /** full: sold out; few: last spots (gets the urgency CTA); open: enrolling. */
  status: "full" | "few" | "open";
}

export interface BdccLead {
  name: string;
  phone: string;
  email: string;
  track: string;
  consent: boolean;
}

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
  announcement: {
    text: "מחזור 15 של הסמכת Blockchain Expert יוצא לדרך באוקטובר 2026. נותרו מקומות בודדים!",
    cta: "להרשמה",
  },
  video: {
    title: "הציצו פנימה: כך נראים הלימודים אצלנו",
    subtitle: "דקה אחת שמסבירה למה אלפי ישראלים בוחרים ללמוד קריפטו איתנו.",
    src: "https://player.vimeo.com/video/1016720884?h=4066582383&app_id=122963&byline=0&badge=0&portrait=0&title=0",
  },
  gallery: {
    title: "רגעים מהמכללה",
    subtitle: "שיעורים, מפגשי קהילה וכנסים של BDCC ו-CryptoJungle.",
    images: [
      "https://lwfiles.mycourse.app/665da46393d9513408ea79ea-public/c25485c203487e9806d8d1e6d56cf65c.jpg",
      "https://lwfiles.mycourse.app/665da46393d9513408ea79ea-public/5f6af3e7d9e3af693d587066aae03cd5.png",
      "https://lwfiles.mycourse.app/665da46393d9513408ea79ea-public/f76d457cb9ccff7148b1c5392ffefca8.jpg",
      "https://lwfiles.mycourse.app/665da46393d9513408ea79ea-public/695e8e5d79416f756191434cd9a0d94f.jpg",
      "https://lwfiles.mycourse.app/665da46393d9513408ea79ea-public/ed6d37d1c79d756c5f82a55ebb8ca245.jpg",
      "https://lwfiles.mycourse.app/665da46393d9513408ea79ea-public/09053620519e7b2843d03c6c94a41dd3.jpg",
    ],
  },
  cohorts: {
    title: "בדוק התאמתך לקורס Blockchain Expert הקרוב",
    subtitle:
      "ההכשרה המקצועית ביותר בישראל והיחידה עם הסמכה רשמית מאת הלשכה לטכנולוגיות המידע. מספר המקומות מוגבל!",
    fewSpotsCta: "הרשם עכשיו!!",
    items: [
      { cycle: "מחזור 13", when: "מרץ 2026", status: "full" },
      { cycle: "מחזור 14", when: "יוני 2026", status: "full" },
      { cycle: "מחזור 15", when: "אוקטובר 2026", status: "few" },
      { cycle: "מחזור 16", when: "ינואר 2027", status: "open" },
    ] satisfies BdccCohort[],
  },
  leadForm: {
    title: "לבדיקת התאמה למסלולי הלימוד שלנו",
    subtitle:
      "אתה מעוניין להגדיל את הונך באמצעות השקעה או מסחר? או אולי להצמיח את ההזדמנויות הקריירה שלך? התייעץ כעת עם יועץ הלימודים שלנו ושריין את מקומך בהקדם!",
    namePlaceholder: "שם מלא",
    phonePlaceholder: "טלפון",
    emailPlaceholder: "מייל",
    trackLabel: "באיזה מסלול תתעניינ/י?",
    tracks: [
      "הכשרה מקצועית: מומחה בלוקצ'יין",
      "תוכנית ליווי והדרכה להשקעה בקריפטו",
      "קורס מסחר",
    ],
    consent: "אני מאשר/ת קבלת חומר פרסומי, שיווקי ועדכונים חדשותיים",
    submit: "שליחה",
    invalid: "נא למלא שם, טלפון, מייל תקין, מסלול ואישור קבלת עדכונים.",
    success:
      "מעולה! נפתחה טיוטת מייל עם הפרטים אל צוות המכללה. אפשר גם לכתוב לנו ישירות:",
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

/** Minimal lead validation: real-looking name, phone, email, a chosen track,
 * and marketing consent. Mirrored by the form UI and unit tests. */
export function isValidLead(lead: BdccLead): boolean {
  return (
    lead.name.trim().length >= 2 &&
    /^[+\d][\d\s()-]{7,}$/.test(lead.phone.trim()) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email.trim()) &&
    lead.track.trim().length > 0 &&
    lead.consent
  );
}

/** mailto draft to the BDCC team carrying the lead details. The page stores
 * nothing server-side; the visitor's own mail client does the sending. */
export function buildLeadMailto(to: string, lead: BdccLead): string {
  const subject = "בדיקת התאמה למסלולי הלימוד (מדף הנחיתה)";
  const body = [
    `שם מלא: ${lead.name.trim()}`,
    `טלפון: ${lead.phone.trim()}`,
    `מייל: ${lead.email.trim()}`,
    `מסלול מבוקש: ${lead.track}`,
  ].join("\n");
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
