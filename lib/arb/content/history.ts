import { SRC } from "../sources";
import type { ArbEra, ArbHistoryCategory, ArbHistoryEvent, Bi } from "../types";
import { VERIFY } from "./facts";

const { primary, secondary } = VERIFY;

export const ARB_CATEGORY_LABELS: Record<ArbHistoryCategory, Bi> = {
  research: { en: "Research", he: "מחקר" },
  launch: { en: "Launch", he: "השקה" },
  upgrade: { en: "Network upgrade", he: "שדרוג רשת" },
  governance: { en: "Governance", he: "ממשל" },
  funding: { en: "Funding", he: "גיוס" },
  partnership: { en: "Partnership", he: "שותפות" },
  security: { en: "Security and outages", he: "אבטחה ותקלות" },
  market: { en: "Token and market", he: "טוקן ושוק" },
};

export const ARB_ERAS: ArbEra[] = [
  {
    id: "research",
    from: "2015-01-01",
    to: "2021-08-30",
    title: { en: "From Princeton research to a company", he: "ממחקר בפרינסטון לחברה" },
    summary: {
      en: "Interactive proving is designed at Princeton, published in 2018, and turned into a venture-backed company that opens a mainnet beta to developers.",
      he: "ההוכחה האינטראקטיבית מתוכננת בפרינסטון, מתפרסמת ב-2018, והופכת לחברה במימון הון סיכון שפותחת רשת ראשית בבטא למפתחים.",
    },
  },
  {
    id: "launch",
    from: "2021-08-31",
    to: "2023-12-31",
    title: { en: "Launch, Nitro and the DAO", he: "השקה, Nitro וה-DAO" },
    summary: {
      en: "Public launch, early sequencer outages, the Nitro rewrite, the ARB airdrop and the AIP-1 crisis that set the rules of governance.",
      he: "השקה לציבור, השבתות Sequencer מוקדמות, שכתוב Nitro, איירדרופ ARB ומשבר AIP-1 שקבע את כללי הממשל.",
    },
  },
  {
    id: "decentralize",
    from: "2024-01-01",
    to: "2025-12-31",
    title: { en: "Cheaper data and a decentralizing stack", he: "נתונים זולים יותר וביזור הטכנולוגיה" },
    summary: {
      en: "Blobs cut costs, unlocks begin, Stylus adds a second VM, BoLD makes validation permissionless and Timeboost creates the first ordering revenue.",
      he: "‏Blobs מוזילים עלויות, פתיחת הנעילות מתחילה, Stylus מוסיף מכונה וירטואלית שנייה, BoLD פותח את האימות לכל ו-Timeboost יוצר את הכנסת הסידור הראשונה.",
    },
  },
  {
    id: "institutions",
    from: "2026-01-01",
    to: "2026-12-31",
    title: { en: "Institutions, Arbitrum everywhere, and emergency powers tested", he: "מוסדות, Arbitrum בכל מקום, ובחינת סמכויות החירום" },
    summary: {
      en: "Robinhood Chain goes live, PGA replaces Timeboost, and the Security Council freezes exploit funds twice and pauses Stylus, testing the limits of emergency powers.",
      he: "‏Robinhood Chain עולה לאוויר, PGA מחליף את Timeboost, ומועצת הביטחון מקפיאה כספי פריצה פעמיים ועוצרת את Stylus, וכך נבחנים גבולות סמכויות החירום.",
    },
  },
];

export const ARB_HISTORY: ArbHistoryEvent[] = [
  {
    id: "usenix-2018",
    date: "2018-08",
    category: "research",
    title: { en: "Arbitrum paper at USENIX Security", he: "מאמר Arbitrum בכנס USENIX Security" },
    detail: {
      en: "Kalodner, Goldfeder, Chen, Weinberg and Felten publish the Arbitrum design with interactive, bisection-based dispute resolution.",
      he: "קאלודנר, גולדפדר, צ׳ן, ויינברג ופלטן מפרסמים את תכנון Arbitrum עם יישוב מחלוקות אינטראקטיבי מבוסס חיפוש בינארי.",
    },
    impact: {
      en: "The core idea, proving only the single disputed step on Ethereum, is still how Arbitrum's fraud proofs work today.",
      he: "הרעיון המרכזי, להוכיח באתריום רק את הצעד היחיד שבמחלוקת, הוא עדיין האופן שבו עובדות הוכחות ההונאה של Arbitrum היום.",
    },
    source: SRC.usenix2018,
    verification: primary(),
    questions: ["1.1", "B.1"],
  },
  {
    id: "seed-2019",
    date: "2019",
    category: "funding",
    title: { en: "$3.7M seed led by Pantera", he: "סבב Seed של 3.7 מיליון דולר בהובלת Pantera" },
    detail: { en: "Offchain Labs raises its first round to build Arbitrum.", he: "‏Offchain Labs מגייסת את הסבב הראשון שלה לבניית Arbitrum." },
    impact: { en: "Turned academic research into a company with a product roadmap.", he: "הפך מחקר אקדמי לחברה עם מפת דרכים למוצר." },
    source: SRC.seed,
    verification: secondary(),
    questions: ["1.3"],
  },
  {
    id: "series-b-2021",
    date: "2021-08-31",
    category: "launch",
    core: true,
    title: { en: "Arbitrum One opens to the public; $120M Series B", he: "‏Arbitrum One נפתחת לציבור; סבב B של 120 מיליון דולר" },
    detail: {
      en: "The mainnet beta opens to all users and apps. The same day Offchain Labs announces a $120M Series B led by Lightspeed at a reported $1.2B valuation.",
      he: "הרשת הראשית (בטא) נפתחת לכל המשתמשים והאפליקציות. באותו יום Offchain Labs מכריזה על סבב B של 120 מיליון דולר בהובלת Lightspeed לפי שווי מדווח של 1.2 מיליארד דולר.",
    },
    impact: {
      en: "First-mover position among general-purpose rollups, which built the DeFi liquidity Arbitrum still relies on.",
      he: "יתרון ראשון בין ה-Rollups הכלליים, שבנה את נזילות ה-DeFi ש-Arbitrum נשענת עליה עד היום.",
    },
    source: SRC.seriesB,
    verification: secondary(),
    questions: ["1.3", "2.1"],
  },
  {
    id: "outage-2021",
    date: "2021-09-14",
    category: "security",
    title: { en: "First sequencer outage", he: "השבתת Sequencer ראשונה" },
    detail: {
      en: "A burst of transactions during a token sale stalls the single sequencer for roughly 45 minutes.",
      he: "גל עסקאות בזמן מכירת טוקנים משבית את ה-Sequencer היחיד לכ-45 דקות.",
    },
    impact: { en: "Exposed the liveness cost of a single sequencer, a risk still listed in answer 6.2.", he: "חשף את מחיר הזמינות של Sequencer יחיד, סיכון שעדיין מופיע בתשובה 6.2." },
    source: SRC.outage2021,
    verification: primary({ en: "Offchain Labs' own outage report: sequencer offline about 45 minutes; the chain itself kept its state.", he: "דוח ההשבתה של Offchain Labs: ה-Sequencer לא פעל כ-45 דקות; הרשת עצמה שמרה על מצבה." }),
    questions: ["6.2"],
  },
  {
    id: "outage-2022",
    date: "2022-01-09",
    category: "security",
    title: { en: "Seven-hour sequencer outage", he: "השבתת Sequencer של שבע שעות" },
    detail: { en: "A hardware failure at the sequencer halts Arbitrum One for about seven hours.", he: "תקלת חומרה ב-Sequencer עוצרת את Arbitrum One לכשבע שעות." },
    impact: { en: "Pushed redundancy work and kept forced inclusion through Ethereum central to the security story.", he: "דחף לעבודה על יתירות ושמר את ההכללה הכפויה דרך אתריום במרכז סיפור האבטחה." },
    source: SRC.outage2022,
    verification: secondary(),
    questions: ["6.2"],
  },
  {
    id: "nova-2022",
    date: "2022-08",
    category: "launch",
    title: { en: "Arbitrum Nova launches (AnyTrust)", he: "השקת Arbitrum Nova ‏(AnyTrust)" },
    detail: {
      en: "A second chain keeps transaction data with a Data Availability Committee instead of Ethereum, for cheaper gaming and social apps.",
      he: "רשת שנייה ששומרת את נתוני העסקאות אצל ועדת זמינות נתונים במקום באתריום, לאפליקציות משחקים וחברתיות זולות יותר.",
    },
    impact: {
      en: "A deliberate trade of security for cost; ETHBEAT rates Nova Stage 0 and it secures only a few million dollars today.",
      he: "ויתור מכוון על אבטחה תמורת עלות; ETHBEAT מדרגת את Nova ב-Stage 0 והיא מאבטחת היום רק מיליוני דולרים בודדים.",
    },
    source: SRC.l2beatApi,
    verification: primary({ en: "Current Stage 0 and value secured checked live on ETHBEAT.", he: "‏Stage 0 והערך המאובטח נבדקו בזמן אמת ב-ETHBEAT." }),
    questions: ["6.2", "B.2"],
  },
  {
    id: "nitro-2022",
    date: "2022-08-31",
    category: "upgrade",
    core: true,
    title: { en: "Nitro upgrade", he: "שדרוג Nitro" },
    detail: {
      en: "Arbitrum One migrates to Nitro: a Geth-based execution core with WASM-based fraud proofs, cutting fees and raising throughput.",
      he: "‏Arbitrum One עוברת ל-Nitro: ליבת ביצוע מבוססת Geth עם הוכחות הונאה מבוססות WASM, שהוזילה עמלות והגדילה תפוקה.",
    },
    impact: {
      en: "Made Arbitrum fully EVM-equivalent and created the stack later licensed to other chains and extended by Stylus.",
      he: "הפך את Arbitrum לשקולת EVM מלאה ויצר את הטכנולוגיה שבהמשך קיבלו רשתות אחרות ברישיון והורחבה עם Stylus.",
    },
    source: SRC.docsOverview,
    verification: primary(),
    questions: ["2.1", "B.1"],
  },
  {
    id: "airdrop-2023",
    date: "2023-03-23",
    category: "market",
    core: true,
    title: { en: "ARB airdrop and DAO launch", he: "איירדרופ ARB והשקת ה-DAO" },
    detail: {
      en: "ARB is airdropped to users and DAOs, governance moves to the Arbitrum DAO, and ARB lists on major exchanges including Binance and Coinbase on day one.",
      he: "‏ARB מחולק באיירדרופ למשתמשים ול-DAOs, הממשל עובר ל-Arbitrum DAO, ו-ARB נרשם למסחר כבר ביום הראשון בבורסות מרכזיות כולל Binance ו-Coinbase.",
    },
    impact: { en: "Created the DAO that owns the treasury, decides upgrades and elects the Security Council.", he: "יצר את ה-DAO שמחזיק בקופה, מחליט על שדרוגים ובוחר את מועצת הביטחון." },
    source: SRC.tokenomics,
    verification: primary(),
    questions: ["2.1", "2.2", "4.1", "5.1"],
  },
  {
    id: "aip1-2023",
    date: "2023-04-02",
    category: "governance",
    core: true,
    title: { en: "AIP-1 fails; Foundation splits it into AIP-1.1 and 1.2", he: "‏AIP-1 נכשלת; הקרן מפצלת אותה ל-AIP-1.1 ו-1.2" },
    detail: {
      en: "After delegates learn the Foundation already moved 50M of the requested 750M ARB, the vote fails; the Foundation apologizes and restructures with lockups and transparency reports.",
      he: "אחרי שהדלגייטים מגלים שהקרן כבר הזיזה 50 מיליון מתוך 750 מיליון ה-ARB המבוקשים, ההצבעה נכשלת; הקרן מתנצלת ובונה מחדש את הבקשה עם נעילות ודוחות שקיפות.",
    },
    impact: { en: "Set lasting norms: lockups, budgets, transparency reports and a lower proposal threshold.", he: "קבע נורמות מתמשכות: נעילות, תקציבים, דוחות שקיפות וסף הגשה נמוך יותר." },
    source: SRC.aip1Defiant,
    verification: secondary(),
    questions: ["2.1", "4.2", "B.3"],
  },
  {
    id: "outage-2023",
    date: "2023-12-15",
    category: "security",
    title: { en: "Outage during an inscriptions surge", he: "השבתה בזמן גל Inscriptions" },
    detail: { en: "A surge of inscriptions stalls the sequencer for well over an hour.", he: "גל Inscriptions משבית את ה-Sequencer ליותר משעה." },
    impact: { en: "Third outage on record; reinforced sequencer decentralization as an open issue.", he: "ההשבתה השלישית המתועדת; חיזקה את ביזור ה-Sequencer כנושא פתוח." },
    source: SRC.outage2023,
    verification: VERIFY.conflicting({
      en: "Press reports 78 minutes; the status timestamps (10:29 to 11:57 ET) imply about 88; one outlet says about two hours.",
      he: "בעיתונות דווח על 78 דקות; חותמות הזמן בדף הסטטוס (10:29 עד 11:57 שעון החוף המזרחי) מרמזות על כ-88; כלי תקשורת אחד מדווח על כשעתיים.",
    }),
    questions: ["6.2"],
  },
  {
    id: "ath-2024",
    date: "2024-01-12",
    category: "market",
    title: { en: "ARB all-time high of $2.39", he: "שיא כל הזמנים של ARB: ‏2.39 דולר" },
    detail: { en: "ARB peaks before the first team and investor unlock.", he: "‏ARB מגיע לשיא לפני פתיחת הנעילה הראשונה לצוות ולמשקיעים." },
    impact: { en: "The reference point for answer B.5: usage grew afterwards while the price fell.", he: "נקודת הייחוס לתשובה ב.5: השימוש גדל אחרי כן בזמן שהמחיר ירד." },
    source: SRC.coingecko,
    verification: primary({ en: "CoinGecko ath_date 2024-01-12, also checked live.", he: "‏ath_date ב-CoinGecko הוא 12.1.2024, נבדק גם בזמן אמת." }),
    questions: ["7.2", "B.5"],
  },
  {
    id: "blobs-2024",
    date: "2024-03",
    category: "upgrade",
    title: { en: "Blob support after Ethereum's Dencun (ArbOS 20 Atlas)", he: "תמיכה ב-Blobs אחרי Dencun של אתריום (ArbOS 20 Atlas)" },
    detail: { en: "Batches move to EIP-4844 blobs, cutting the main cost of posting data to Ethereum.", he: "האצוות עוברות ל-Blobs של EIP-4844, מה שמוזיל את העלות העיקרית של פרסום נתונים באתריום." },
    impact: { en: "Fees dropped sharply, which grew usage but also shrank fee revenue per transaction.", he: "העמלות ירדו בחדות, מה שהגדיל את השימוש אבל גם הקטין את ההכנסה מעמלות לכל עסקה." },
    source: SRC.docsOverview,
    verification: secondary(),
    questions: ["5.2", "B.5"],
  },
  {
    id: "cliff-2024",
    date: "2024-03-16",
    category: "market",
    title: { en: "First team and investor unlock", he: "פתיחת הנעילה הראשונה לצוות ולמשקיעים" },
    detail: {
      en: "The one-year cliff ends; monthly releases of about 92.6M ARB follow until March 2027.",
      he: "תקופת הצוק בת השנה מסתיימת; אחריה שחרורים חודשיים של כ-92.6 מיליון ARB עד מרץ 2027.",
    },
    impact: { en: "Steady supply growth that weighs on price; ends in March 2027 (see roadmap).", he: "גידול היצע קבוע שמכביד על המחיר; מסתיים במרץ 2027 (ראו מפת דרכים)." },
    source: SRC.unlocks,
    verification: secondary(),
    questions: ["5.1", "2.2"],
  },
  {
    id: "stylus-2024",
    date: "2024-09",
    category: "upgrade",
    title: { en: "Stylus goes live on mainnet", he: "‏Stylus עולה לרשת הראשית" },
    detail: { en: "A WebAssembly VM next to the EVM lets developers write contracts in Rust, C and C++.", he: "מכונה וירטואלית WebAssembly לצד ה-EVM מאפשרת לכתוב חוזים ב-Rust, ‏C ו-C++." },
    impact: { en: "Arbitrum's main technical differentiator for developers, paused for new activations in October 2026.", he: "היתרון הטכני המבדל העיקרי של Arbitrum למפתחים, שהפעלות חדשות בו נעצרו באוקטובר 2026." },
    source: SRC.docsStylus,
    verification: secondary(),
    questions: ["B.1"],
  },
  {
    id: "bold-2025",
    date: "2025-02-12",
    category: "upgrade",
    core: true,
    title: { en: "BoLD activates on Arbitrum One and Nova", he: "‏BoLD מופעל ב-Arbitrum One וב-Nova" },
    detail: { en: "Permissionless validation with bounded dispute delay replaces the allow-listed validator set.", he: "אימות פתוח לכל עם עיכוב מחלוקת חסום מחליף את רשימת המאמתים המורשים." },
    impact: { en: "The change that keeps Arbitrum One at Stage 1 under the stricter stage rules.", he: "השינוי ששומר את Arbitrum One ב-Stage 1 תחת כללי הדירוג המחמירים." },
    source: SRC.docsBold,
    verification: secondary({ en: "BoLD on One and Nova confirmed in docs and ETHBEAT; exact day from press.", he: "‏BoLD ב-One וב-Nova אושר בתיעוד וב-ETHBEAT; היום המדויק לפי העיתונות." }),
    questions: ["2.1", "B.1"],
  },
  {
    id: "timeboost-2025",
    date: "2025-04",
    category: "governance",
    title: { en: "Timeboost ordering goes live", he: "‏Timeboost עולה לאוויר" },
    detail: {
      en: "A sealed-bid, second-price auction sells a 60-second express lane; proceeds go to the DAO, 3% to the Developer Guild.",
      he: "מכרז חתום במחיר שני מוכר נתיב מהיר של 60 שניות; ההכנסות הולכות ל-DAO, ו-3% מהן ל-Developer Guild.",
    },
    impact: { en: "The DAO's first ordering revenue (more than $6M in 2025), later replaced by PGA.", he: "הכנסת הסידור הראשונה של ה-DAO (יותר מ-6 מיליון דולר ב-2025), שהוחלפה בהמשך ב-PGA." },
    source: SRC.docsTimeboost,
    verification: primary({ en: "Docs: \"Arbitrum One has used Timeboost since April 2025\".", he: "בתיעוד: \"Arbitrum One has used Timeboost since April 2025\"." }),
    questions: ["4.3", "5.2", "B.5"],
  },
  {
    id: "stocks-2025",
    date: "2025-06",
    category: "partnership",
    title: { en: "Robinhood Classic Stock Tokens on Arbitrum One", he: "טוקני המניות הקלאסיים של Robinhood על Arbitrum One" },
    detail: { en: "Robinhood's first-generation tokenized stocks for EU customers launch on Arbitrum One.", he: "דור ראשון של מניות בטוקניזציה של Robinhood ללקוחות באיחוד האירופי עולה על Arbitrum One." },
    impact: { en: "The relationship that led Robinhood to build its own Arbitrum chain a year later.", he: "הקשר שהוביל את Robinhood לבנות רשת Arbitrum משלה שנה לאחר מכן." },
    source: SRC.robinhoodFactsheet,
    verification: primary(),
    questions: ["1.2", "B.2"],
  },
  {
    id: "dia-2026",
    date: "2026-01-08",
    category: "upgrade",
    title: { en: "ArbOS 51 \"Dia\"", he: "‏ArbOS 51 \"Dia\"" },
    detail: { en: "Upgrade for Ethereum Fusaka compatibility and gas pricing changes on One and Nova.", he: "שדרוג לתאימות לשדרוג Fusaka של אתריום ולשינויי תמחור גז ב-One וב-Nova." },
    impact: { en: "Keeps Arbitrum aligned with Ethereum's upgrade cadence.", he: "שומר על Arbitrum מסונכרנת עם קצב השדרוגים של אתריום." },
    source: SRC.docsArbos51,
    verification: secondary(),
    questions: ["7.1"],
  },
  {
    id: "kelp-2026",
    date: "2026-04-21",
    category: "security",
    title: { en: "Security Council freezes KelpDAO exploiter funds", he: "מועצת הביטחון מקפיאה כספי תוקף KelpDAO" },
    detail: {
      en: "The council freezes 30,765.67 ETH held by the KelpDAO exploiter on Arbitrum One and moves it to 0x...0DA0; releasing it requires an Arbitrum governance action.",
      he: "המועצה מקפיאה 30,765.67 ETH שהחזיק תוקף KelpDAO ב-Arbitrum One ומעבירה אותם לכתובת 0x...0DA0; שחרורם מחייב פעולת ממשל של Arbitrum.",
    },
    impact: {
      en: "The first use of emergency powers to seize funds from a specific address, setting the template reused in October.",
      he: "השימוש הראשון בסמכויות החירום כדי להקפיא כספים בכתובת מסוימת, תבנית שחזרה באוקטובר.",
    },
    source: SRC.kelpFreeze,
    verification: primary(),
    questions: ["1.5", "B.4"],
  },
  {
    id: "hyperliquid-2026",
    date: "2026-06",
    category: "market",
    title: { en: "Stablecoins halve as Hyperliquid leaves its Arbitrum bridge", he: "הסטייבלקוינים נחתכים בחצי כש-Hyperliquid עוזבת את הגשר שלה ב-Arbitrum" },
    detail: {
      en: "Stablecoins on Arbitrum fall by about $4.3B in 30 days (20 May to 19 Jun 2026, DefiLlama), from a peak of $10.6B in October 2025 to about $4.2B, as Hyperliquid moves to natively minted USDC; about $3.95B left its Arbitrum bridge in June.",
      he: "הסטייבלקוינים ב-Arbitrum יורדים בכ-4.3 מיליארד דולר ב-30 יום (20.5 עד 19.6.2026, לפי DefiLlama), משיא של 10.6 מיליארד באוקטובר 2025 לכ-4.2 מיליארד, כש-Hyperliquid עוברת ל-USDC שמונפק אצלה באופן מקורי; כ-3.95 מיליארד דולר יצאו מהגשר שלה ב-Arbitrum ביוני.",
    },
    impact: {
      en: "Shows how much of Arbitrum's dollar base was one external app's deposit route, and why stablecoin supply alone overstated organic adoption (answers 1.4 and B.5).",
      he: "מראה כמה מבסיס הדולרים של Arbitrum היה בפועל נתיב הפקדה של אפליקציה חיצונית אחת, ולמה היצע הסטייבלקוינים לבדו הגזים בהערכת האימוץ האורגני (תשובות 1.4 ו-ב.5).",
    },
    source: SRC.defillamaStables,
    verification: VERIFY.derived({
      en: "Size and dates computed from DefiLlama's daily series on 18 Nov 2026; the Hyperliquid cause and the June bridge figure come from Bitquery and press.",
      he: "ההיקף והתאריכים חושבו מהסדרה היומית של DefiLlama ב-18.11.2026; הסיבה (Hyperliquid) ונתון הגשר ליוני מקורם ב-Bitquery ובעיתונות.",
    }),
    questions: ["1.4", "6.3", "B.5"],
  },
  {
    id: "robinhood-2026",
    date: "2026-07-01",
    category: "partnership",
    core: true,
    title: { en: "Robinhood Chain mainnet", he: "‏Robinhood Chain עולה לרשת ראשית" },
    detail: {
      en: "Robinhood launches its own Arbitrum chain settling to Ethereum for 24/7 tokenized stocks; it pays 10% of net revenue under the Expansion Program.",
      he: "‏Robinhood משיקה רשת Arbitrum משלה שמסלקת לאתריום, למסחר 24/7 במניות בטוקניזציה; היא משלמת 10% מההכנסה נטו במסגרת AEP.",
    },
    impact: {
      en: "Proof that the Arbitrum stack wins institutions, and the DAO's largest new revenue line; ETHBEAT rates the chain Stage 0.",
      he: "הוכחה שהטכנולוגיה של Arbitrum זוכה במוסדות, ומקור ההכנסה החדש הגדול של ה-DAO; ETHBEAT מדרגת את הרשת ב-Stage 0.",
    },
    source: SRC.robinhoodFactsheet,
    verification: primary(),
    questions: ["2.1", "B.2", "7.1"],
  },
  {
    id: "elara-2026",
    date: "2026-08-20",
    category: "upgrade",
    title: { en: "ArbOS 61 \"Elara\"", he: "‏ArbOS 61 \"Elara\"" },
    detail: { en: "Multidimensional gas pricing and a 96 KB Stylus contract size limit, approved in a Constitutional vote.", he: "תמחור גז רב-ממדי ומגבלת גודל חוזה Stylus של 96KB, באישור הצבעה חוקתית." },
    impact: { en: "Fee markets that price compute, storage and data separately, matching Robinhood Chain's \"Dynamic Pricing\".", he: "שוקי עמלות שמתמחרים חישוב, אחסון ונתונים בנפרד, בדומה ל-\"Dynamic Pricing\" של Robinhood Chain." },
    source: SRC.docsArbos61,
    verification: secondary(),
    questions: ["7.1", "B.1"],
  },
  {
    id: "pga-2026",
    date: "2026-10",
    category: "governance",
    title: { en: "PGA replaces Timeboost", he: "‏PGA מחליף את Timeboost" },
    detail: {
      en: "A consolidated Constitutional vote adopts Priority Gas Auctions plus a paid Fast Feed; by October 2026 the treasury is accruing PGA revenue, again with 3% to the Developer Guild.",
      he: "הצבעה חוקתית מאוחדת מאמצת מכרזי עמלת עדיפות (PGA) יחד עם Fast Feed בתשלום; עד אוקטובר 2026 הקופה כבר צוברת הכנסות PGA, שוב עם 3% ל-Developer Guild.",
    },
    impact: {
      en: "Shows governance revising its own earlier decision on evidence: Timeboost's entry barrier and 60-second lane did not suit new latency-sensitive DeFi.",
      he: "מראה ממשל שמתקן החלטה קודמת שלו על סמך ראיות: חסם הכניסה של Timeboost והנתיב בן 60 השניות לא התאימו ל-DeFi חדש ורגיש לזמן תגובה.",
    },
    source: SRC.pgaAip,
    verification: primary({
      en: "Adoption from the AIP thread and docs; the activation month is inferred from PGA revenue reported as of 26 Oct 2026.",
      he: "האימוץ לפי שרשור ה-AIP והתיעוד; חודש ההפעלה מוסק מהכנסות PGA שדווחו נכון ל-26.10.2026.",
    }),
    questions: ["4.3", "5.2", "B.5"],
  },
  {
    id: "stylus-pause-2026",
    date: "2026-10-02",
    category: "security",
    title: { en: "Stylus activations paused; BoLD guard added", he: "הפעלות Stylus נעצרו; נוספה הגנה ל-BoLD" },
    detail: {
      en: "On a Foundation notification the Security Council pauses new Stylus activations on One and Nova and adds a permissionless guard to BoLD's one-step proof, citing AI-assisted attacks; known Stylus bugs affected liveness, not funds.",
      he: "לאחר התראה מהקרן, מועצת הביטחון עוצרת הפעלות Stylus חדשות ב-One וב-Nova ומוסיפה הגנה פתוחה לכל להוכחה בצעד אחד של BoLD, בגלל התקפות בסיוע AI; באגי Stylus הידועים פגעו בזמינות, לא בכספים.",
    },
    impact: {
      en: "A key differentiator is on hold; a Constitutional AIP (23 Oct 2026) proposes resuming activations for audited contracts only.",
      he: "יתרון מבדל מרכזי מוקפא; הצעה חוקתית (23.10.2026) מציעה לחדש הפעלות רק לחוזים שעברו ביקורת.",
    },
    source: SRC.stylusPause,
    verification: primary(),
    questions: ["B.1", "6.2", "7.1"],
  },
  {
    id: "usdg-2026",
    date: "2026-10-06",
    category: "partnership",
    title: { en: "USDG launches natively on Arbitrum One", he: "‏USDG עולה באופן מקורי על Arbitrum One" },
    detail: { en: "Paxos-issued USDG (also Robinhood Chain's dollar liquidity) goes live; the DAO debates 100M ARB to grow it.", he: "‏USDG של Paxos (גם מקור הנזילות הדולרית של Robinhood Chain) עולה; ה-DAO דן ב-100 מיליון ARB לקידומו." },
    impact: { en: "Ties Arbitrum One's stablecoin strategy to the Robinhood ecosystem.", he: "קושר את אסטרטגיית הסטייבלקוינים של Arbitrum One לאקוסיסטם של Robinhood." },
    source: SRC.usdgInitiative,
    verification: primary(),
    questions: ["1.2", "3.2"],
  },
  {
    id: "binance-2026",
    date: "2026-10-30",
    category: "security",
    core: true,
    title: { en: "Security Council freezes Binance exploit funds", he: "מועצת הביטחון מקפיאה כספי הפריצה ל-Binance" },
    detail: {
      en: "The council atomically upgrades the Inbox contract on Ethereum to freeze 8,425 ETH and about 74.56M ARB held by an address tied to the Binance exploit; only a DAO governance vote can move them.",
      he: "המועצה משדרגת באופן אטומי את חוזה ה-Inbox באתריום כדי להקפיא 8,425 ETH וכ-74.56 מיליון ARB שהחזיקה כתובת הקשורה לפריצה ל-Binance; רק הצבעת ממשל של ה-DAO יכולה להזיז אותם.",
    },
    impact: {
      en: "The second freeze in six months; Binance has proposed a DAO vote to release the funds, keeping the debate about emergency powers live.",
      he: "ההקפאה השנייה בתוך חצי שנה; Binance הציעה הצבעת DAO לשחרור הכספים, והוויכוח על סמכויות החירום נמשך.",
    },
    source: SRC.scFreeze,
    verification: primary(),
    questions: ["2.1", "1.5", "B.4"],
  },
];

/** The 5 to 7 events that answer course question 2.1. */
export const ARB_TIMELINE = ARB_HISTORY.filter((e) => e.core);

/** Display a partial ISO date at its own precision. */
export function historyDateLabel(date: string, lang: "en" | "he"): string {
  const [y, m, d] = date.split("-");
  if (!m) return y;
  const monthsEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  if (!d) return lang === "he" ? `${m}.${y}` : `${monthsEn[Number(m) - 1]} ${y}`;
  return lang === "he" ? `${d}.${m}.${y}` : `${Number(d)} ${monthsEn[Number(m) - 1]} ${y}`;
}

/** Era containing a (possibly partial) date. */
export function eraOf(date: string): string {
  const full = date.length === 4 ? `${date}-07-01` : date.length === 7 ? `${date}-15` : date;
  return ARB_ERAS.find((e) => full >= e.from && full <= e.to)?.id ?? ARB_ERAS[ARB_ERAS.length - 1].id;
}
