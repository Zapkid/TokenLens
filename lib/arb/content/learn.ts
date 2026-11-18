import { SRC } from "../sources";
import type { ArbGlossaryTerm, ArbPracticeCard, ArbStep } from "../types";

// Learning aids: a glossary tied to course questions, practice cards for
// the 60-point interview, and the step plan to finish the project.

export const ARB_GLOSSARY: ArbGlossaryTerm[] = [
  {
    id: "rollup",
    term: { en: "Optimistic rollup", he: "‏Rollup אופטימי" },
    definition: {
      en: "A chain that executes transactions off Ethereum, posts the data to Ethereum, and assumes results are correct unless someone proves fraud within a challenge window.",
      he: "רשת שמבצעת עסקאות מחוץ לאתריום, מפרסמת את הנתונים באתריום, ומניחה שהתוצאות נכונות אלא אם מישהו מוכיח הונאה בתוך חלון ערעור.",
    },
    questions: ["1.1", "6.2"],
  },
  {
    id: "sequencer",
    term: { en: "Sequencer", he: "Sequencer" },
    definition: {
      en: "The node that orders transactions and gives instant soft confirmations. On Arbitrum One it is a single operator (Offchain Labs); if it censors, users can force inclusion through Ethereum.",
      he: "הצומת שמסדר את העסקאות ונותן אישורים רכים מיידיים. ב-Arbitrum One זהו מפעיל יחיד (Offchain Labs); אם הוא מצנזר, המשתמשים יכולים לכפות הכללה דרך אתריום.",
    },
    questions: ["1.1", "6.2"],
  },
  {
    id: "challenge",
    term: { en: "Challenge period", he: "תקופת ערעור" },
    definition: {
      en: "About 6.4 days (45,818 Ethereum blocks) during which an assertion can be disputed; the reason canonical withdrawals take about a week.",
      he: "כ-6.4 ימים (45,818 בלוקים באתריום) שבהם אפשר לערער על טענה; הסיבה לכך שמשיכה בגשר הקנוני לוקחת כשבוע.",
    },
    questions: ["B.1"],
  },
  {
    id: "interactive",
    term: { en: "Interactive fraud proof", he: "הוכחת הונאה אינטראקטיבית" },
    definition: {
      en: "Two parties bisect a disputed execution until one instruction remains; Ethereum executes only that one step to decide who is right.",
      he: "שני צדדים מצמצמים ביצוע שנוי במחלוקת בחיפוש בינארי עד שנותרת הוראה אחת; אתריום מריץ רק את הצעד הזה כדי להכריע מי צודק.",
    },
    questions: ["B.1"],
  },
  {
    id: "bold",
    term: { en: "BoLD", he: "BoLD" },
    definition: {
      en: "Bounded Liquidity Delay: Arbitrum's permissionless, all-against-all dispute protocol, where one honest party wins against any number of attackers within a bounded delay.",
      he: "‏Bounded Liquidity Delay: פרוטוקול המחלוקות של Arbitrum, פתוח לכל, כולם מול כולם, שבו צד ישר אחד מנצח מול כל מספר תוקפים בתוך עיכוב חסום.",
    },
    questions: ["1.1", "B.1"],
  },
  {
    id: "stage",
    term: { en: "Stage 0, 1, 2 (ETHBEAT, formerly L2BEAT)", he: "‏Stage 0, 1, 2 ‏(ETHBEAT, לשעבר L2BEAT)" },
    definition: {
      en: "A maturity scale for rollups. Stage 1 means proofs work and users can exit even without the council, but a council can still override; Stage 2 limits it to provable bugs and gives at least 30 days to exit.",
      he: "סולם בשלות ל-Rollups. ‏Stage 1 פירושו שההוכחות עובדות ומשתמשים יכולים לצאת גם בלי המועצה, אבל המועצה עדיין יכולה לגבור; Stage 2 מגביל אותה לבאגים מוכחים ונותן לפחות 30 יום ליציאה.",
    },
    questions: ["B.1", "6.4"],
  },
  {
    id: "stylus",
    term: { en: "Stylus", he: "Stylus" },
    definition: {
      en: "A WebAssembly virtual machine beside the EVM for contracts in Rust, C and C++, interoperable with Solidity and cheaper for heavy compute.",
      he: "מכונה וירטואלית WebAssembly לצד ה-EVM לחוזים ב-Rust, ‏C ו-C++, שעובדת יחד עם Solidity וזולה יותר לחישובים כבדים.",
    },
    questions: ["B.1"],
  },
  {
    id: "anytrust",
    term: { en: "AnyTrust (Arbitrum Nova)", he: "‏AnyTrust ‏(Arbitrum Nova)" },
    definition: {
      en: "A mode where a Data Availability Committee keeps the data instead of Ethereum: cheaper, but users must trust that at least some committee members are honest.",
      he: "מצב שבו ועדת זמינות נתונים שומרת את הנתונים במקום אתריום: זול יותר, אבל המשתמשים צריכים לסמוך על כך שלפחות חלק מחברי הוועדה ישרים.",
    },
    questions: ["6.2"],
  },
  {
    id: "orbit",
    term: { en: "Arbitrum chains (Orbit) and AEP", he: "רשתות Arbitrum ‏(Orbit) ו-AEP" },
    definition: {
      en: "Anyone can launch a chain on the Arbitrum stack; chains settling outside One or Nova pay 10% of net revenue under the Arbitrum Expansion Program (8% DAO, 2% Developer Guild).",
      he: "כל אחד יכול להשיק רשת על הטכנולוגיה של Arbitrum; רשתות שמסלקות מחוץ ל-One או Nova משלמות 10% מההכנסה נטו במסגרת AEP ‏(8% ל-DAO, ‏2% ל-Developer Guild).",
    },
    questions: ["B.2", "5.2"],
  },
  {
    id: "pga",
    term: { en: "Timeboost and PGA", he: "‏Timeboost ו-PGA" },
    definition: {
      en: "Transaction-ordering policies that sell priority. Timeboost (2025) auctioned a 60-second express lane; PGA (2026) lets anyone bid a priority fee per transaction. Proceeds go to the DAO.",
      he: "מדיניות סידור עסקאות שמוכרות עדיפות. ‏Timeboost ‏(2025) מכר במכרז נתיב מהיר של 60 שניות; PGA ‏(2026) מאפשר לכל אחד להציע עמלת עדיפות לכל עסקה. ההכנסות הולכות ל-DAO.",
    },
    questions: ["4.3", "5.2", "B.5"],
  },
  {
    id: "council",
    term: { en: "Security Council", he: "מועצת הביטחון" },
    definition: {
      en: "Twelve DAO-elected signers; 9 of 12 can act instantly in an emergency, as in the April and October 2026 freezes.",
      he: "שנים עשר חותמים שנבחרים על ידי ה-DAO; ‏9 מתוך 12 יכולים לפעול מיידית בחירום, כמו בהקפאות של אפריל ואוקטובר 2026.",
    },
    questions: ["4.1", "B.4"],
  },
  {
    id: "aip",
    term: { en: "Constitutional vs Non-Constitutional AIP", he: "הצעה חוקתית מול לא חוקתית" },
    definition: {
      en: "Constitutional AIPs touch the constitution, core contracts or chain software and pass longer delays and a higher quorum; Non-Constitutional AIPs cover funding and guidelines.",
      he: "הצעות חוקתיות נוגעות בחוקה, בחוזי הליבה או בתוכנת הרשת ועוברות השהיות ארוכות וקוורום גבוה יותר; הצעות לא חוקתיות עוסקות במימון ובהנחיות.",
    },
    questions: ["4.1", "B.4"],
  },
  {
    id: "tvs",
    term: { en: "TVL vs Total Value Secured", he: "‏TVL מול Total Value Secured" },
    definition: {
      en: "DefiLlama's TVL counts assets deposited in DeFi apps; ETHBEAT's Total Value Secured counts all assets on the chain, split into canonically bridged, natively minted and externally bridged.",
      he: "ה-TVL של DefiLlama סופר נכסים שהופקדו באפליקציות DeFi; ה-Total Value Secured של ETHBEAT סופר את כל הנכסים ברשת, בחלוקה לגושרו בגשר הקנוני, הונפקו מקומית וגושרו בגשרים חיצוניים.",
    },
    questions: ["1.4", "6.3"],
  },
  {
    id: "dvp",
    term: { en: "Votable supply and DVP quorum", he: "היצע זכאי להצבעה וקוורום DVP" },
    definition: {
      en: "Quorum used to be a share of votable ARB (treasury ARB excluded); in 2026 the DAO tied it to delegated voting power because participation had fallen to about 4 to 5%.",
      he: "הקוורום היה אחוז מה-ARB הזכאי להצבעה (בלי ה-ARB שבקופה); ב-2026 ה-DAO קשר אותו לכוח ההצבעה המואצל, כי ההשתתפות ירדה לכ-4 עד 5%.",
    },
    questions: ["4.1", "4.2"],
  },
];

export const ARB_PRACTICE: ArbPracticeCard[] = [
  {
    id: "p-stage1",
    relates: "B.1",
    question: { en: "Arbitrum One is Stage 1, yet ETHBEAT rates its exit window None. How can both be true?", he: "‏Arbitrum One ב-Stage 1, ובכל זאת ETHBEAT מדרגת את חלון היציאה שלה כ-None. איך שניהם נכונים?" },
    answer: {
      en: "Stage 1 needs working permissionless proofs and a walkaway path without the council. The exit window is None because the council's 9-of-12 emergency path can upgrade instantly, which is exactly what Stage 2 would forbid outside provable bugs.",
      he: "‏Stage 1 דורש הוכחות פתוחות שעובדות ומסלול יציאה גם בלי המועצה. חלון היציאה הוא None כי מסלול החירום של 9 מתוך 12 יכול לשדרג מיידית, ובדיוק את זה Stage 2 אוסר מחוץ לבאגים מוכחים.",
    },
  },
  {
    id: "p-freeze",
    relates: "B.4",
    question: { en: "Who can release the funds frozen on 30 Oct 2026, and how?", he: "מי יכול לשחרר את הכספים שהוקפאו ב-30.10.2026, ואיך?" },
    answer: {
      en: "Only an ArbitrumDAO governance vote. Binance's AIP would repeat the council's method: upgrade the Ethereum Inbox atomically, send the recovery transaction, and restore the contract.",
      he: "רק הצבעת ממשל של ה-ArbitrumDAO. ההצעה של Binance תחזור על השיטה של המועצה: שדרוג אטומי של ה-Inbox באתריום, שליחת עסקת השיקום, והחזרת החוזה למצבו.",
    },
  },
  {
    id: "p-week",
    relates: "B.1",
    question: { en: "Why not shorten withdrawals to one hour?", he: "למה לא לקצר משיכות לשעה?" },
    answer: {
      en: "An attacker able to censor Ethereum or knock validators offline for an hour could finalize a false state and drain the bridge. A week gives an honest party time to get a dispute included. Users who want speed pay a liquidity bridge instead.",
      he: "תוקף שמסוגל לצנזר את אתריום או להפיל מאמתים לשעה יכול לאשר מצב שקרי ולרוקן את הגשר. שבוע נותן לצד ישר זמן להכניס ערעור. משתמשים שרוצים מהירות משלמים לגשר נזילות.",
    },
  },
  {
    id: "p-pga",
    relates: "4.3",
    question: { en: "Why did the DAO replace Timeboost with PGA?", he: "למה ה-DAO החליף את Timeboost ב-PGA?" },
    answer: {
      en: "Per the docs: the ahead-of-time auction had a high entry barrier (custom tooling, forecasting a minute of MEV) and a 60-second single-holder lane did not suit latency-sensitive DeFi such as proprietary AMMs. PGA uses the standard priority fee anyone can set.",
      he: "לפי התיעוד: למכרז המוקדם היה חסם כניסה גבוה (כלים ייעודיים, חיזוי MEV של דקה שלמה), ונתיב של 60 שניות בידי מחזיק יחיד לא התאים ל-DeFi רגיש לזמן תגובה כמו AMM קנייניים. ‏PGA משתמש בעמלת העדיפות הסטנדרטית שכל אחד יכול לקבוע.",
    },
  },
  {
    id: "p-value",
    relates: "5.2",
    question: { en: "The DAO earns millions. Why doesn't ARB benefit?", he: "ה-DAO מרוויח מיליונים. למה ARB לא נהנה?" },
    answer: {
      en: "Revenue (sequencer fees, ordering revenue, AEP, treasury yield) stays in the DAO treasury; no fee switch, burn or buyback sends it to holders. A forum discussion on ARB utility exists, but nothing has passed.",
      he: "ההכנסות (עמלות Sequencer, הכנסות סידור, AEP, תשואת קופה) נשארות בקופת ה-DAO; שום מנגנון חלוקה, שריפה או רכישה חוזרת לא מעביר אותן למחזיקים. יש דיון בפורום על שימושיות ל-ARB, אבל שום הצעה לא עברה.",
    },
  },
  {
    id: "p-robinhood",
    relates: "B.2",
    question: { en: "Is Robinhood Chain as secure as Arbitrum One?", he: "האם Robinhood Chain מאובטחת כמו Arbitrum One?" },
    answer: {
      en: "No, by ETHBEAT's rating: Robinhood Chain is Stage 0 and has no guaranteed mechanism to force transactions if its sequencer censors, while Arbitrum One is Stage 1. Same stack, different configuration.",
      he: "לא, לפי הדירוג של ETHBEAT: ‏Robinhood Chain ב-Stage 0 ואין לה מנגנון מובטח לכפות עסקאות אם ה-Sequencer שלה מצנזר, בעוד Arbitrum One ב-Stage 1. אותה טכנולוגיה, תצורה שונה.",
    },
  },
  {
    id: "p-tvs",
    relates: "6.3",
    question: { en: "Why do DefiLlama and ETHBEAT give different stablecoin totals?", he: "למה DefiLlama ו-ETHBEAT נותנות סכומי סטייבלקוינים שונים?" },
    answer: {
      en: "Different methods: DefiLlama counts stablecoin supply circulating on the chain; ETHBEAT counts stablecoin value it secures under its own classification. Cite the source and date of the one you use (the data quality panel shows the gap live).",
      he: "שיטות שונות: DefiLlama סופרת את היצע הסטייבלקוינים שבמחזור ברשת; ETHBEAT סופרת את ערך הסטייבלקוינים שהיא מאבטחת לפי הסיווג שלה. יש לצטט מקור ותאריך של הנתון שבחרתם (לוח איכות הנתונים מציג את הפער בזמן אמת).",
    },
  },
  {
    id: "p-stables",
    relates: "B.5",
    question: { en: "Stablecoins on Arbitrum roughly halved in 2026. Is Arbitrum dying?", he: "הסטייבלקוינים ב-Arbitrum ירדו בערך בחצי ב-2026. האם Arbitrum גוססת?" },
    answer: {
      en: "Mostly one app left: about $4.3B fell in a month (May to June 2026) as Hyperliquid moved to native USDC and stopped routing deposits through its Arbitrum bridge. It shows how concentrated the dollar base was. Separate that from organic signals: native issuance is now about 77% of supply, and DAO revenue now includes ordering revenue and AEP licenses.",
      he: "בעיקר אפליקציה אחת עזבה: כ-4.3 מיליארד דולר ירדו בחודש (מאי עד יוני 2026) כש-Hyperliquid עברה ל-USDC מקורי והפסיקה לנתב הפקדות דרך הגשר שלה ב-Arbitrum. זה מראה כמה מרוכז היה בסיס הדולרים. יש להפריד זאת מאותות אורגניים: הנפקה מקומית היא היום כ-77% מההיצע, והכנסות ה-DAO כוללות היום הכנסות סידור ורישיונות AEP.",
    },
  },
  {
    id: "p-aip1",
    relates: "B.3",
    question: { en: "If AIP-1's vote was not binding, why did the Foundation back down?", he: "אם ההצבעה על AIP-1 לא הייתה מחייבת, למה הקרן נסוגה?" },
    answer: {
      en: "Legitimacy: a Foundation that ignores its own DAO weeks after launch loses the community, delegates and exchanges. It restructured into AIP-1.1 and 1.2, which passed with about 98 to 99%.",
      he: "לגיטימיות: קרן שמתעלמת מה-DAO שלה שבועות אחרי ההשקה מאבדת את הקהילה, הדלגייטים והבורסות. היא בנתה מחדש את ההצעה ל-AIP-1.1 ו-1.2, שעברו ברוב של כ-98 עד 99%.",
    },
  },
  {
    id: "p-github",
    relates: "1.4",
    question: { en: "The nitro repository shows almost no commits this month. Is development dead?", he: "במאגר nitro כמעט אין commits החודש. האם הפיתוח מת?" },
    answer: {
      en: "Not necessarily: the default branch receives batched merges and releases, while work happens on branches and in other repositories. That is why this page counts several Offchain Labs repositories and shows the latest release.",
      he: "לא בהכרח: הענף הראשי מקבל מיזוגים ושחרורים באצוות, והעבודה עצמה נעשית בענפים ובמאגרים אחרים. לכן העמוד סופר כמה מאגרים של Offchain Labs ומציג את השחרור האחרון.",
    },
  },
  {
    id: "p-decentral",
    relates: "4.3",
    question: { en: "Defend your 1 to 5 decentralization rating in one minute.", he: "הגנו על דירוג הביזור שלכם (1 עד 5) בדקה אחת." },
    answer: {
      en: "Use evidence for each side: binding on-chain votes, an elected council and the AIP-1 precedent, against 4 to 5% participation, about 40% of delegated power in ten delegates, one sequencer operator, and two unilateral freezes in 2026.",
      he: "השתמשו בראיות לשני הצדדים: הצבעות און-צ׳יין מחייבות, מועצה נבחרת ותקדים AIP-1, מול השתתפות של 4 עד 5%, כ-40% מהכוח המואצל בידי עשרה דלגייטים, מפעיל Sequencer יחיד ושתי הקפאות חד-צדדיות ב-2026.",
    },
  },
];

export const ARB_STEPS: ArbStep[] = [
  {
    id: "s-read",
    phase: { en: "1. Prepare", he: "1. הכנה" },
    title: { en: "Read the brief and this page end to end", he: "קראו את ההנחיות ואת העמוד הזה מתחילתו ועד סופו" },
    detail: { en: "Note the rules: Word only, Arial or David 12, 1.5 spacing, up to 20 pages, answers in course order, a source and check date for every number.", he: "שימו לב לכללים: Word בלבד, ‏Arial או David בגודל 12, רווח שורה וחצי, עד 20 עמודים, תשובות לפי הסדר, ומקור ותאריך בדיקה לכל נתון." },
    due: "2026-11-30",
  },
  {
    id: "s-join",
    phase: { en: "2. Community (chapter 3)", he: "2. קהילה (פרק 3)" },
    title: { en: "Join the forum, Discord and X; follow the weekly vote roundups", he: "הצטרפו לפורום, ל-Discord ול-X; עקבו אחרי סיכומי ההצבעות השבועיים" },
    detail: { en: "Create accounts now: forum trust levels and reply history take time to build.", he: "פתחו חשבונות עכשיו: רמות אמון בפורום והיסטוריית תגובות לוקחות זמן." },
    due: "2026-12-07",
    link: SRC.forum,
  },
  {
    id: "s-discuss",
    phase: { en: "2. Community (chapter 3)", he: "2. קהילה (פרק 3)" },
    title: { en: "Take part in three discussions and screenshot them (3.2)", he: "השתתפו בשלושה דיונים וצלמו מסך (3.2)" },
    detail: {
      en: "Good candidates: the Binance funds release AIP, the Stylus Activation Contract AIP, and the course-student research thread already on the forum. Ask a real question you need for your paper.",
      he: "אפשרויות טובות: הצעת שחרור כספי Binance, הצעת חוזה הפעלת Stylus, ושרשור המחקר של סטודנט מהקורס שכבר נמצא בפורום. שאלו שאלה אמיתית שאתם צריכים לעבודה.",
    },
    due: "2027-01-31",
    link: SRC.studentThread,
  },
  {
    id: "s-testnet",
    phase: { en: "3. Hands-on (bonus)", he: "3. התנסות (בונוס)" },
    title: { en: "Do one Arbitrum Sepolia transaction and keep the hash", he: "בצעו עסקה אחת ב-Arbitrum Sepolia ושמרו את ה-Hash" },
    detail: { en: "Bridge Sepolia ETH or send a transfer; screenshot the explorer page and note what was confusing.", he: "גשרו Sepolia ETH או שלחו העברה; צלמו את דף הסייר ורשמו מה היה מבלבל." },
    due: "2027-02-15",
    link: SRC.sepoliaFaucet,
  },
  {
    id: "s-verify",
    phase: { en: "4. Write", he: "4. כתיבה" },
    title: { en: "Re-check every number on your writing day", he: "בדקו מחדש כל נתון ביום הכתיבה" },
    detail: { en: "Use the live panel and the data quality checks; open each cited source yourself and record the check date next to the number.", he: "השתמשו בלוח החי ובבדיקות איכות הנתונים; פתחו בעצמכם כל מקור מצוטט ורשמו את תאריך הבדיקה ליד הנתון." },
    due: "2027-03-01",
  },
  {
    id: "s-download",
    phase: { en: "4. Write", he: "4. כתיבה" },
    title: { en: "Download the Hebrew Word file as your draft", he: "הורידו את קובץ ה-Word בעברית כטיוטה" },
    detail: { en: "It already has the cover page, numbering, formatting, live snapshot and source list.", he: "יש בו כבר עמוד שער, מספור, עיצוב, תמונת מצב חיה ורשימת מקורות." },
    due: "2027-03-01",
  },
  {
    id: "s-own",
    phase: { en: "4. Write", he: "4. כתיבה" },
    title: { en: "Rewrite the analysis answers in your own words", he: "כתבו מחדש את תשובות הניתוח במילים שלכם" },
    detail: { en: "1.5, 2.2, 4.3, 5.3, 6.2 to 6.4, 7.1, 7.2 and the thinking questions in Part B are graded on your judgment; change the ratings if you disagree.", he: "‏1.5, ‏2.2, ‏4.3, ‏5.3, ‏6.2 עד 6.4, ‏7.1, ‏7.2 ושאלות החשיבה בחלק ב׳ נבדקות לפי שיקול הדעת שלכם; שנו את הדירוגים אם אינכם מסכימים." },
    due: "2027-03-10",
  },
  {
    id: "s-personal",
    phase: { en: "4. Write", he: "4. כתיבה" },
    title: { en: "Write 3.3 (100 to 200 words) and the 3.4 LinkedIn post separately", he: "כתבו את 3.3 ‏(100-200 מילים) ואת פוסט ה-LinkedIn של 3.4 בנפרד" },
    detail: { en: "Add the 3.2 screenshots, the 3.4 image and the bonus appendix.", he: "הוסיפו את צילומי המסך של 3.2, את התמונה של 3.4 ואת נספח הבונוס." },
    due: "2027-03-15",
  },
  {
    id: "s-fit",
    phase: { en: "5. Finalize", he: "5. סיום" },
    title: { en: "Fit 20 pages, proofread, name the file", he: "התאימו ל-20 עמודים, הגיהו, ותנו שם לקובץ" },
    detail: { en: "Cover page with full name in Hebrew and English plus ID; your full name in the file name; spelling and grammar check.", he: "עמוד שער עם שם מלא בעברית ובאנגלית ומספר זהות; שם מלא בשם הקובץ; בדיקת כתיב ודקדוק." },
    due: "2027-03-25",
  },
  {
    id: "s-submit",
    phase: { en: "5. Finalize", he: "5. סיום" },
    title: { en: "Submit early", he: "הגישו מוקדם" },
    detail: { en: "Papers are graded in submission order and interviews scheduled accordingly; the deadline is 30 March 2027.", he: "העבודות נבדקות לפי סדר ההגשה והריאיונות נקבעים בהתאם; המועד האחרון הוא 30.03.2027." },
    due: "2027-03-30",
  },
  {
    id: "s-interview",
    phase: { en: "6. Interview (60 points)", he: "6. ריאיון (60 נקודות)" },
    title: { en: "Practice the interview cards until you can answer without notes", he: "תרגלו את כרטיסי הריאיון עד שתוכלו לענות בלי דפים" },
    detail: { en: "Re-check the roadmap the week before: votes, freezes and Stylus may have moved since you wrote.", he: "בדקו שוב את מפת הדרכים בשבוע שלפני: הצבעות, הקפאות ו-Stylus אולי התקדמו מאז שכתבתם." },
  },
];
