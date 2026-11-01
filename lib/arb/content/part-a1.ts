import { SRC } from "../sources";
import type { ArbChapter } from "../types";

// Part A, chapters 1 to 3: common questions (identical for all five course
// projects), answered for Arbitrum. Facts as of the research date in
// lib/arb/content/index.ts; live numbers are injected via `live` slots.

export const CHAPTER_1: ArbChapter = {
  id: "ch1",
  part: "A",
  title: { en: "Chapter 1: Getting to know the project", he: "פרק 1 - היכרות עם הפרויקט" },
  questions: [
    {
      id: "1.1",
      title: { en: "What the project is", he: "מהות הפרויקט" },
      prompt: {
        en: "What type of project is it (infrastructure, application, other) and what is its goal? How does it intend to achieve it (explain the mechanism)? Which network does it rely on, and does it have a token? What is its consensus or security mechanism (one paragraph)?",
        he: "מהו סוג הפרויקט (תשתית, אפליקציה או אחר), ומה מטרתו? כיצד הוא מתכוון להשיג את המטרה? על איזו רשת הוא נשען? האם יש לו טוקן? מהו מנגנון הקונצנזוס או מנגנון האבטחה של הפרויקט?",
      },
      kind: "fact",
      answer: [
        {
          en: "Type and goal: Arbitrum is infrastructure. Its flagship chain, Arbitrum One, is an optimistic rollup: a Layer 2 that executes transactions off Ethereum and settles them on Ethereum. The goal is to make Ethereum-compatible transactions much cheaper and faster while keeping Ethereum as the final arbiter of correctness. The same software (the Nitro stack) also powers Arbitrum Nova (an AnyTrust chain that relies on a Data Availability Committee for cheaper data) and third-party Arbitrum chains (formerly branded Orbit).",
          he: "סוג ומטרה: Arbitrum היא פרויקט תשתית. הרשת המרכזית, Arbitrum One, היא Rollup אופטימי: רשת שכבה 2 שמבצעת עסקאות מחוץ לאתריום ומסלקת אותן על אתריום. המטרה היא להוזיל ולהאיץ משמעותית עסקאות תואמות אתריום, תוך שמירה על אתריום כפוסק האחרון לגבי נכונות המצב. אותה תוכנה (Nitro) מפעילה גם את Arbitrum Nova (רשת AnyTrust שנשענת על ועדת זמינות נתונים, DAC, להוזלת עלויות) ורשתות צד שלישי שנבנות על הטכנולוגיה (לשעבר Orbit).",
        },
        {
          en: "Mechanism: a sequencer (today a single one, operated by Offchain Labs) orders transactions and gives users near-instant soft confirmations. It compresses transaction batches and posts them to Ethereum (as blobs since EIP-4844), so anyone can recompute the chain. Validators then post assertions (claims about the resulting state) to Ethereum with a bond. During a challenge window of about 6.4 days anyone can dispute a wrong assertion through an interactive fraud proof: the disagreement is bisected down to a single WebAssembly instruction that Ethereum executes itself. Users who suspect censorship can force-include transactions through the delayed inbox on Ethereum.",
          he: "המנגנון: Sequencer (כיום יחיד, מופעל בידי Offchain Labs) מסדר את העסקאות ונותן למשתמשים אישור רך כמעט מיידי. הוא דוחס אצוות עסקאות ומפרסם אותן לאתריום (כ-Blobs מאז EIP-4844), כך שכל אחד יכול לשחזר את מצב הרשת. מאמתים מפרסמים לאתריום טענות (Assertions) על המצב שנוצר, יחד עם ערבון. במהלך חלון ערעור של כ-6.4 ימים כל אחד יכול לערער על טענה שגויה באמצעות הוכחת הונאה אינטראקטיבית: המחלוקת מצומצמת בחיפוש בינארי עד להוראת WebAssembly בודדת שאתריום מריץ בעצמו. משתמש שחושד בצנזורה יכול לכפות הכללת עסקה דרך תיבת הדואר המושהית (Delayed Inbox) באתריום.",
        },
        {
          en: "Network and token: Arbitrum relies on Ethereum for data availability and settlement. Gas on Arbitrum One is paid in ETH. The ARB token is an ERC-20 governance token: it votes in the Arbitrum DAO, which controls protocol upgrades, the treasury, and the Security Council elections.",
          he: "רשת וטוקן: Arbitrum נשענת על אתריום לזמינות נתונים ולסליקה. העמלות ב-Arbitrum One משולמות ב-ETH. טוקן ARB הוא טוקן ממשל מסוג ERC-20: הוא משמש להצבעה ב-Arbitrum DAO, ששולט בשדרוגי הפרוטוקול, בקופה ובבחירות למועצת הביטחון.",
        },
        {
          en: "Security mechanism (one paragraph): Arbitrum has no consensus of its own in the Proof of Stake sense. Safety comes from Ethereum plus fraud proofs under a 1-of-N honesty assumption: as long as a single honest validator watches the chain, a wrong state cannot be finalized. Since February 2025 the BoLD protocol makes validation permissionless (anyone can bond and dispute) and bounds how long an attacker can delay finality. Liveness and ordering depend on the centralized sequencer (with forced inclusion as the escape hatch), and a 12-member Security Council can perform emergency upgrades with 9 of 12 signatures.",
          he: "מנגנון האבטחה (פסקה אחת): ל-Arbitrum אין קונצנזוס משלה במובן של Proof of Stake. הביטחון נובע מאתריום ומהוכחות הונאה, בהנחת יושר של 1 מתוך N: מספיק מאמת ישר אחד שעוקב אחרי הרשת כדי שמצב שגוי לא יאושר סופית. מאז פברואר 2025 פרוטוקול BoLD הופך את האימות לפתוח לכל (כל אחד יכול להפקיד ערבון ולערער) ומגביל את משך העיכוב שתוקף יכול לגרום. הזמינות וסדר העסקאות תלויים ב-Sequencer הריכוזי (עם הכללה כפויה כפתח מילוט), ומועצת ביטחון בת 12 חברים יכולה לבצע שדרוגי חירום בחתימת 9 מתוך 12.",
        },
      ],
      sources: [SRC.docsOverview, SRC.docsBold, SRC.l2beat, SRC.securityCouncilDocs],
    },
    {
      id: "1.2",
      title: { en: "Industry and target audience", he: "תעשייה וקהל יעד" },
      prompt: {
        en: "Which industry and audience is the project aimed at? Who is its real user today, in practice?",
        he: "לאיזו תעשייה ולאיזה קהל מכוון הפרויקט? מי המשתמש האמיתי שלו היום, בפועל?",
      },
      kind: "fact",
      answer: [
        {
          en: "Industry: Ethereum scaling infrastructure, serving DeFi, stablecoin payments, tokenized real-world assets (RWA), and companies that want their own chain. Stated audiences are developers (EVM plus Stylus for Rust, C and C++), DeFi users, and institutions.",
          he: "תעשייה: תשתית הרחבה (Scaling) לאתריום, שמשרתת DeFi, תשלומי סטייבלקוין, נכסים מהעולם האמיתי בטוקניזציה (RWA), וחברות שרוצות רשת משלהן. קהלי היעד המוצהרים הם מפתחים (EVM וגם Stylus בשפות Rust, C ו-C++), משתמשי DeFi ומוסדות.",
        },
        {
          en: "Real users today: the bulk of activity on Arbitrum One is DeFi and trading (lending, perpetuals and spot DEXs) and stablecoin flows, which is why DefiLlama tracks Arbitrum mainly through DeFi TVL and stablecoin market cap. A second user group is institutions: the Foundation's 2025 transparency report highlights more than $800M of tokenized RWAs, and DefiLlama showed about $895M of RWA active AUM on 31 Oct 2026. A third group is businesses launching their own Arbitrum chains, the most prominent being Robinhood Chain (mainnet 1 July 2026).",
          he: "המשתמשים בפועל היום: עיקר הפעילות ב-Arbitrum One הוא DeFi ומסחר (הלוואות, חוזים עתידיים ובורסות מבוזרות) ותנועות סטייבלקוין, ולכן DefiLlama עוקבת אחרי Arbitrum בעיקר דרך TVL של DeFi ושווי הסטייבלקוינים. קבוצה שנייה היא מוסדות: דוח השקיפות של הקרן ל-2025 מדגיש יותר מ-800 מיליון דולר בנכסי RWA, ו-DefiLlama הציגה כ-895 מיליון דולר בנכסי RWA פעילים ב-31.10.2026. קבוצה שלישית היא עסקים שמשיקים רשת Arbitrum משלהם, ובראשם Robinhood Chain (רשת ראשית מ-1.7.2026).",
        },
      ],
      live: ["tvl", "stablecoins"],
      sources: [SRC.defillamaChain, SRC.transparency2025, SRC.robinhoodTheBlock],
    },
    {
      id: "1.3",
      title: { en: "Team, investors and key players", he: "צוות, משקיעים ושחקני מפתח" },
      prompt: {
        en: "Who is the development team and what is its background? Is there a central entity (company or foundation)? How much money was raised, in how many rounds, and who are the main investors? Are there other key players (funds, strategic partners, advisors)?",
        he: "מי צוות הפיתוח ומה הרקע שלו? האם יש ישות מרכזית שמובילה את הפרויקט? כמה כסף גויס, בכמה סבבים, ומי המשקיעים המרכזיים? האם יש שחקני מפתח נוספים?",
      },
      kind: "fact",
      answer: [
        {
          en: "Team: Arbitrum is developed by Offchain Labs, founded in 2018 by Ed Felten (Princeton professor of computer science and former Deputy US Chief Technology Officer in the White House), Steven Goldfeder (CEO, Princeton PhD) and Harry Kalodner (CTO, Princeton PhD). Arbitrum began as Princeton research and was published at USENIX Security 2018. Offchain Labs also maintains Prysm, an Ethereum consensus client, after acquiring Prysmatic Labs in 2022.",
          he: "צוות: Arbitrum מפותחת בידי Offchain Labs, שנוסדה ב-2018 על ידי אד פלטן (פרופסור למדעי המחשב בפרינסטון ולשעבר סגן ה-CTO של ממשלת ארה״ב בבית הלבן), סטיבן גולדפדר (מנכ״ל, דוקטורט מפרינסטון) והארי קאלודנר (CTO, דוקטורט מפרינסטון). Arbitrum התחילה כמחקר בפרינסטון שפורסם בכנס USENIX Security ב-2018. Offchain Labs מתחזקת גם את Prysm, לקוח קונצנזוס של אתריום, לאחר שרכשה את Prysmatic Labs ב-2022.",
        },
        {
          en: "Central entities: the Arbitrum Foundation (a Cayman Islands foundation company) supports the ecosystem and executes DAO decisions; Offchain Labs is the main core developer and currently operates the sequencer; the Arbitrum DAO (ARB holders and their delegates) owns the treasury and decides upgrades.",
          he: "ישויות מרכזיות: קרן Arbitrum (חברת קרן הרשומה באיי קיימן) תומכת באקוסיסטם ומבצעת את החלטות ה-DAO; Offchain Labs היא מפתחת הליבה המרכזית ומפעילה כיום את ה-Sequencer; ה-Arbitrum DAO (מחזיקי ARB והנציגים שלהם) מחזיק בקופה ומחליט על שדרוגים.",
        },
        {
          en: "Funding: three priced rounds. Seed of $3.7M in 2019 led by Pantera Capital; Series A of $20M in April 2021 led by Lightspeed Venture Partners; Series B of $120M on 31 Aug 2021 led by Lightspeed, with Polychain Capital, Ribbit Capital, Redpoint, Pantera and others, at a reported $1.2B valuation. Total: about $143.7M (some databases list the Series B as $100M and the total as $123.7M; cite the Offchain Labs announcement as the primary figure).",
          he: "גיוסים: שלושה סבבים. סבב Seed של 3.7 מיליון דולר ב-2019 בהובלת Pantera Capital; סבב A של 20 מיליון דולר באפריל 2021 בהובלת Lightspeed Venture Partners; סבב B של 120 מיליון דולר ב-31.8.2021 בהובלת Lightspeed, בהשתתפות Polychain Capital, Ribbit Capital, Redpoint, Pantera ואחרים, לפי שווי מדווח של 1.2 מיליארד דולר. סך הכול כ-143.7 מיליון דולר (חלק ממאגרי המידע רושמים את סבב B כ-100 מיליון דולר ואת הסך כ-123.7 מיליון; יש לצטט את הודעת Offchain Labs כמקור הראשי).",
        },
        {
          en: "Other key players: the Security Council (12 elected signers with emergency powers); Entropy Advisors (DAO-funded strategy and treasury advisors, author of the October 2026 USDG incentive proposal); the Arbitrum Developer Guild (receives 2% of Expansion Program revenue); large delegates; anchor applications in DeFi; and institutional partners such as Robinhood, which built its own Arbitrum chain.",
          he: "שחקני מפתח נוספים: מועצת הביטחון (12 חותמים נבחרים עם סמכויות חירום); Entropy Advisors (יועצי אסטרטגיה וקופה במימון ה-DAO, מגישי הצעת התמריצים ל-USDG באוקטובר 2026); ה-Arbitrum Developer Guild (מקבל 2% מהכנסות תוכנית ההרחבה AEP); דלגייטים גדולים; אפליקציות DeFi מובילות; ושותפים מוסדיים כמו Robinhood שבנתה רשת Arbitrum משלה.",
        },
      ],
      sources: [SRC.seed, SRC.seriesB, SRC.foundationDocs, SRC.usdgVote],
    },
    {
      id: "1.4",
      title: { en: "Activity and network data", he: "פעילות ונתוני רשת" },
      prompt: {
        en: "How many code contributors were active in the last month on GitHub, and how many commits? How many validators, miners or nodes does the network have per the block explorer? Choose two usage metrics that best indicate success and justify the choice.",
        he: "כמה תורמי קוד היו פעילים בחודש האחרון ב-GitHub, וכמה commits? כמה מאמתים, כורים או צמתים יש לרשת? בחרו שני מדדי שימוש שמעידים יותר מכל על הצלחת הפרויקט, והציגו אותם. נמקו.",
      },
      kind: "fact",
      answer: [
        {
          en: "GitHub: the live panel below counts commits and distinct commit authors over the last 30 days in Offchain Labs' core repositories (nitro, nitro-contracts, stylus-sdk-rs), fetched from the GitHub API with the check time shown. Quote the number with that date in the paper.",
          he: "GitHub: הלוח החי למטה סופר commits ומספר כותבים ייחודיים ב-30 הימים האחרונים במאגרי הליבה של Offchain Labs (nitro, nitro-contracts, stylus-sdk-rs), מתוך ה-API של GitHub, עם זמן הבדיקה. בעבודה יש לצטט את המספר יחד עם התאריך.",
        },
        {
          en: "Validators and nodes: a rollup has no validator set like a Proof of Stake chain, so Arbiscan does not show a validator count. The relevant facts are: one active sequencer (Offchain Labs); permissionless validation under BoLD (anyone can run a node and post or challenge assertions with a bond); and any number of full nodes that anyone can run. L2BEAT lists the proposer and challenger setup and is the right source to cite here.",
          he: "מאמתים וצמתים: ל-Rollup אין סט מאמתים כמו ברשת Proof of Stake, ולכן Arbiscan לא מציג מספר מאמתים. העובדות הרלוונטיות: Sequencer פעיל יחיד (Offchain Labs); אימות פתוח לכל תחת BoLD (כל אחד יכול להריץ צומת ולפרסם או לערער על טענות עם ערבון); ומספר בלתי מוגבל של צמתים מלאים שכל אחד יכול להריץ. L2BEAT מפרט את מערך המציעים והמערערים והוא המקור הנכון לציטוט.",
        },
        {
          en: "Two usage metrics: (1) Stablecoin market cap on Arbitrum: stablecoins are real dollars parked on the chain for payments, trading and collateral, so they measure economic trust better than token-priced metrics. (2) Fees paid on Arbitrum One over 30 days: fees are what users actually pay for blockspace, and they feed the DAO's revenue. TVL is shown too, but it is inflated or deflated by token prices.",
          he: "שני מדדי שימוש: (1) שווי הסטייבלקוינים ב-Arbitrum: סטייבלקוינים הם דולרים אמיתיים שחונים ברשת לתשלומים, מסחר ובטוחות, ולכן הם מודדים אמון כלכלי טוב יותר ממדדים שמושפעים ממחירי טוקנים. (2) העמלות ששולמו ב-Arbitrum One ב-30 יום: עמלות הן מה שהמשתמשים משלמים בפועל על שטח בבלוק, והן מזינות את הכנסות ה-DAO. גם TVL מוצג, אבל הוא מתנפח ומתכווץ עם מחירי הטוקנים.",
        },
      ],
      live: ["github", "stablecoins", "fees", "tvl"],
      sources: [SRC.github, SRC.l2beat, SRC.arbiscan, SRC.defillamaChain],
    },
    {
      id: "1.5",
      title: { en: "Thinking question: claim vs reality", he: "שאלת חשיבה - טענה מול מציאות" },
      prompt: {
        en: "Pick one central claim the project makes about itself. Test it against your data. Do the data support it, refute it, or is the picture more complex?",
        he: "בחרו טענה מרכזית אחת שהפרויקט מציג על עצמו. בדקו אותה מול הנתונים שאספתם. האם הנתונים תומכים בטענה, מפריכים אותה, או שהתמונה מורכבת יותר?",
      },
      kind: "analysis",
      answer: [
        {
          en: "Claim: Arbitrum presents itself as a rollup secured by Ethereum, where users do not need to trust the operator. Data that supports it: BoLD made fraud proofs permissionless on Arbitrum One in February 2025, transaction data is posted to Ethereum, forced inclusion exists, and L2BEAT rates Arbitrum One Stage 1 and says it passes the walkaway test.",
          he: "הטענה: Arbitrum מציגה את עצמה כ-Rollup שמאובטח על ידי אתריום, שבו המשתמשים לא צריכים לסמוך על המפעיל. נתונים תומכים: BoLD הפך את הוכחות ההונאה לפתוחות לכל ב-Arbitrum One בפברואר 2025, נתוני העסקאות מתפרסמים באתריום, קיימת הכללה כפויה, ו-L2BEAT מדרג את Arbitrum One ב-Stage 1 וקובע שהיא עוברת את מבחן ה-Walkaway.",
        },
        {
          en: "Data that complicates it: the Security Council can act instantly with 9 of 12 signatures, with no exit window for users on that path. In October 2026 it used this power twice: it paused new Stylus activations (2 Oct) and moved 8,425 ETH and about 74.56M ARB tied to the Binance exploit from a specific address into a frozen wallet (30 Oct). Ordering also depends on one sequencer. Verdict: the claim holds for the technical security of state transitions, but trust in a 12-member committee remains part of the model. The picture is more complex than the slogan.",
          he: "נתונים שמסבכים: מועצת הביטחון יכולה לפעול מיידית בחתימת 9 מתוך 12, ובמסלול הזה אין למשתמשים חלון יציאה. באוקטובר 2026 היא השתמשה בסמכות הזאת פעמיים: עצרה הפעלות חדשות של חוזי Stylus (2.10) והעבירה 8,425 ETH וכ-74.56 מיליון ARB שקשורים לפריצה לבורסת Binance מכתובת מסוימת לארנק מוקפא (30.10). גם סדר העסקאות תלוי ב-Sequencer יחיד. המסקנה: הטענה נכונה לגבי האבטחה הטכנית של מעברי המצב, אבל אמון בוועדה בת 12 חברים הוא עדיין חלק מהמודל. התמונה מורכבת יותר מהסיסמה.",
        },
      ],
      sources: [SRC.l2beat, SRC.docsBold, SRC.scFreeze, SRC.stylusPause],
    },
  ],
};

export const CHAPTER_2: ArbChapter = {
  id: "ch2",
  part: "A",
  title: { en: "Chapter 2: Significant events", he: "פרק 2 - אירועים משמעותיים" },
  questions: [
    {
      id: "2.1",
      title: { en: "Timeline", he: "ציר זמן" },
      prompt: {
        en: "Present 5 to 7 significant events from different categories (launches and upgrades, partnerships, funding, regulatory or legal, hacks or outages, team changes, exchange listings). For each: date, what happened, source.",
        he: "הציגו 5-7 אירועים משמעותיים בתולדות הפרויקט, מקטגוריות שונות. לכל אירוע: תאריך, מה קרה, ומקור.",
      },
      kind: "fact",
      answer: [
        {
          en: "The seven events are listed in the timeline section of this page (and in the Word export), each with date, category and source. They cover a launch plus funding round (Aug 2021), a network upgrade (Nitro, Aug 2022), token launch and exchange listings (Mar 2023), a governance crisis (AIP-1, Apr 2023), a security upgrade (BoLD, Feb 2025), a strategic partnership (Robinhood Chain, Jul 2026) and emergency security actions (Oct 2026).",
          he: "שבעת האירועים מופיעים בחלק ציר הזמן בעמוד זה (ובקובץ ה-Word), לכל אחד תאריך, קטגוריה ומקור. הם מכסים השקה וסבב גיוס (אוגוסט 2021), שדרוג רשת (Nitro, אוגוסט 2022), השקת טוקן ורישום בבורסות (מרץ 2023), משבר ממשל (AIP-1, אפריל 2023), שדרוג אבטחה (BoLD, פברואר 2025), שותפות אסטרטגית (Robinhood Chain, יולי 2026) ופעולות חירום אבטחתיות (אוקטובר 2026).",
        },
      ],
      sources: [SRC.docsOverview, SRC.forum],
    },
    {
      id: "2.2",
      title: { en: "Analysis", he: "ניתוח" },
      prompt: {
        en: "Which event shaped the project most as it is today? Pick one event the market over- or under-reacted to: what did it miss? Is there a pending event that could change the picture: good and bad scenarios?",
        he: "איזה אירוע עיצב יותר מכל את הפרויקט? בחרו אירוע שהשוק הגיב אליו בצורה מוגזמת או לא הגיב אליו מספיק. מה השוק פספס? האם יש אירוע תלוי ועומד? מה התרחיש הטוב ומה הרע?",
      },
      kind: "analysis",
      answer: [
        {
          en: "Most formative: the March 2023 token launch and DAO handover, including the AIP-1 crisis that followed. It created the structure that defines Arbitrum today: a DAO that owns the treasury and sequencer revenue, a constitution with two proposal types, an elected Security Council, and a Foundation that must publish budgets and transparency reports. Every later strategic move (Timeboost revenue, the Expansion Program license, incentive programs) runs through that structure.",
          he: "האירוע המעצב ביותר: השקת הטוקן והעברת השליטה ל-DAO במרץ 2023, כולל משבר AIP-1 שבא אחריה. הוא יצר את המבנה שמגדיר את Arbitrum היום: DAO שמחזיק בקופה ובהכנסות ה-Sequencer, חוקה עם שני סוגי הצעות, מועצת ביטחון נבחרת, וקרן שמחויבת לפרסם תקציבים ודוחות שקיפות. כל מהלך אסטרטגי מאוחר יותר (הכנסות Timeboost, רישיון AEP, תוכניות תמריצים) עובר דרך המבנה הזה.",
        },
        {
          en: "Market reaction: Robinhood Chain is a case where usage and token price diverged. Robinhood's first-month license payment was about $360K in July 2026, roughly 35% of that month's DAO income, yet ARB fell about 24% over 30 days to around $0.16 in late October 2026. What the price reflects is that DAO income does not flow to ARB holders automatically and that team and investor unlocks continue until March 2027. Whether this is an under-reaction depends on whether the DAO ever links its revenue to the token.",
          he: "תגובת השוק: Robinhood Chain היא דוגמה לפער בין שימוש למחיר. תשלום הרישיון של Robinhood בחודש הראשון היה כ-360 אלף דולר ביולי 2026, כ-35% מהכנסות ה-DAO באותו חודש, ובכל זאת ARB ירד בכ-24% ב-30 יום לסביבת 0.16 דולר בסוף אוקטובר 2026. המחיר משקף את העובדה שהכנסות ה-DAO לא זורמות אוטומטית למחזיקי ARB, ושפתיחת הנעילות לצוות ולמשקיעים נמשכת עד מרץ 2027. האם זו תגובת חסר תלוי בשאלה אם ה-DAO יקשר אי פעם את ההכנסות לטוקן.",
        },
        {
          en: "Pending event: the end of the team and investor unlock schedule in March 2027. Good scenario: monthly sell pressure of about 92.6M ARB disappears, and supply becomes predictable. Bad scenario: final unlocks are sold into a weak market, and without a value-accrual mechanism demand does not absorb them. A second pending item is reopening Stylus activations: a safe reopening restores a key differentiator; a long pause weakens the multi-language story.",
          he: "אירוע תלוי ועומד: סיום לוח פתיחת הנעילות לצוות ולמשקיעים במרץ 2027. התרחיש הטוב: לחץ מכירה חודשי של כ-92.6 מיליון ARB נעלם וההיצע הופך צפוי. התרחיש הרע: הנעילות האחרונות נמכרות לשוק חלש, ובלי מנגנון שמחזיר ערך לטוקן הביקוש לא סופג אותן. נושא פתוח נוסף הוא חידוש הפעלת חוזי Stylus: חידוש בטוח מחזיר יתרון מבדל מרכזי; עצירה ממושכת מחלישה את סיפור הריבוי-שפות.",
        },
      ],
      live: ["market"],
      sources: [SRC.robinhoodFactsheet, SRC.h1Revenue2026, SRC.arbPriceOct, SRC.unlocks, SRC.stylusPause],
    },
  ],
};

export const CHAPTER_3: ArbChapter = {
  id: "ch3",
  part: "A",
  title: { en: "Chapter 3: Active community participation", he: "פרק 3 - השתתפות פעילה בקהילה" },
  questions: [
    {
      id: "3.1",
      title: { en: "Community size and platforms", he: "גודל הקהילה ופלטפורמות" },
      prompt: {
        en: "How large is the community and on which platforms does it operate? How much does the project support the community (languages, documentation, tutorials, Q&A events)?",
        he: "מה גודל הקהילה, ובאילו פלטפורמות היא פועלת? מה מידת התמיכה של הפרויקט בקהילה (שפות, תיעוד, סרטוני הדרכה, אירועי Q&A וכדומה)?",
      },
      kind: "fact",
      answer: [
        {
          en: "Platforms: the official X account (@arbitrum), the Arbitrum Discord, the governance forum (forum.arbitrum.foundation), Snapshot and Tally for votes, a YouTube channel, and developer channels on GitHub. Follower and member counts change daily, so read them on the day you submit and cite the date (the course requires a check date for every number).",
          he: "פלטפורמות: חשבון ה-X הרשמי (@arbitrum), שרת ה-Discord, פורום הממשל (forum.arbitrum.foundation), Snapshot ו-Tally להצבעות, ערוץ YouTube, וערוצי מפתחים ב-GitHub. מספרי העוקבים והחברים משתנים מדי יום, ולכן יש לקרוא אותם ביום ההגשה ולציין תאריך (הקורס דורש תאריך בדיקה לכל נתון).",
        },
        {
          en: "Support: extensive English documentation (docs.arbitrum.io for builders and users, docs.arbitrum.foundation for governance), Stylus quickstarts and SDKs, public weekly vote roundups on the forum, recorded governance calls, an open delegate program, and a free public testnet (Arbitrum Sepolia). Documentation is primarily English; community translations exist but are not the official track.",
          he: "תמיכה: תיעוד נרחב באנגלית (docs.arbitrum.io למפתחים ולמשתמשים, docs.arbitrum.foundation לממשל), מדריכי התחלה ו-SDK ל-Stylus, סיכומי הצבעות שבועיים בפורום, שיחות ממשל מוקלטות, תוכנית דלגייטים פתוחה, ורשת ניסוי ציבורית בחינם (Arbitrum Sepolia). התיעוד הוא בעיקר באנגלית; יש תרגומים קהילתיים אך הם לא הערוץ הרשמי.",
        },
      ],
      sources: [SRC.forum, SRC.docsOverview, SRC.tally],
    },
    {
      id: "3.2",
      title: { en: "Three discussions you joined", he: "שלושה דיונים שהשתתפתם בהם" },
      prompt: {
        en: "Attach screenshots of 3 discussions in which you actively participated (news, updates or questions about the project). Give short background for each.",
        he: "צרפו צילומי מסך של 3 דיונים שבהם השתתפתם באופן פעיל. לכל דיון תנו רקע קצר.",
      },
      kind: "personal",
      answer: [
        {
          en: "This must be your own participation; it cannot be answered from sources. Timely threads with real substance as of the research date: (1) the on-chain vote on 100M ARB for USDG incentives (29 Oct to 12 Nov 2026) on the forum and Tally; (2) the Security Council emergency action of 30 Oct 2026 (freezing funds tied to the Binance exploit); (3) the Stylus activation pause and its reopening plan. For each screenshot write: platform, date, the question or point you raised, and the response you got.",
          he: "זו חייבת להיות השתתפות אישית שלכם, ואי אפשר לענות עליה ממקורות. דיונים עדכניים ובעלי תוכן נכון למועד המחקר: (1) ההצבעה און-צ׳יין על 100 מיליון ARB לתמריצי USDG (29.10 עד 12.11.2026) בפורום וב-Tally; (2) פעולת החירום של מועצת הביטחון מ-30.10.2026 (הקפאת כספים שקשורים לפריצה ל-Binance); (3) עצירת הפעלת חוזי Stylus ותוכנית החידוש. לכל צילום מסך כתבו: פלטפורמה, תאריך, השאלה או הנקודה שהעליתם, והתגובה שקיבלתם.",
        },
      ],
      sources: [SRC.forum, SRC.scFreeze, SRC.usdgVote],
    },
    {
      id: "3.3",
      title: { en: "Your experience (100 to 200 words)", he: "החוויה שלכם (100-200 מילים)" },
      prompt: {
        en: "Write 100 to 200 words on the experience: was mutual help central? Was the atmosphere about price and hype or technology? How present was the project team?",
        he: "כתבו 100-200 מילים על החוויה: האם עזרה הדדית הייתה חלק מרכזי? האם האווירה סובבת סביב מחיר והייפ או סביב הטכנולוגיה? עד כמה הורגש צוות הפרויקט?",
      },
      kind: "personal",
      answer: [
        {
          en: "Write this from your own notes. Useful observable checks: on the governance forum, do Foundation or Offchain Labs staff reply in proposal threads? In Discord, are support questions answered by moderators or by other users? On X, are replies about ARB price or about upgrades and votes? Answer separately from 3.4, as the course requires.",
          he: "כתבו מתוך הרשמים שלכם. בדיקות שאפשר לעשות בפועל: בפורום הממשל, האם אנשי הקרן או Offchain Labs עונים בשרשורי ההצעות? ב-Discord, האם שאלות תמיכה נענות על ידי מנהלים או על ידי משתמשים אחרים? ב-X, האם התגובות עוסקות במחיר ARB או בשדרוגים ובהצבעות? יש לענות בנפרד משאלה 3.4, כנדרש.",
        },
      ],
      sources: [SRC.forum],
    },
    {
      id: "3.4",
      title: { en: "LinkedIn post", he: "פוסט ל-LinkedIn" },
      prompt: {
        en: "Write a LinkedIn post about your learning journey: what you learned and your main conclusions, how community participation contributed, and how the project fits your path to becoming a blockchain expert in the college's Blockchain Expert track. Attach an image.",
        he: "כתבו פוסט ל-LinkedIn על מסע הלמידה שעברתם בפרויקט: מה למדתם ומהן המסקנות המרכזיות, איך ההשתתפות בקהילה תרמה, ואיך העבודה משתלבת בדרך שלכם להפוך למומחי בלוקצ׳יין במסלול Blockchain Expert של המכללה. צרפו תמונה.",
        },
      kind: "personal",
      answer: [
        {
          en: "Draft to personalize (replace the bracketed parts): \"For my final project in the Blockchain Expert track at the Blockchain and Digital Currency College, I researched Arbitrum, Ethereum's largest optimistic rollup. Three takeaways: (1) security is a spectrum: BoLD made fraud proofs permissionless, yet a 12-member Security Council can still act in an emergency, as it did in October 2026; (2) usage and token value are different questions: institutions like Robinhood now build on Arbitrum technology, but DAO revenue does not flow to ARB holders automatically; (3) governance is real work: reading forum threads and votes taught me more than any dashboard. Taking part in [name the discussions] showed me [your insight]. Next: [your next step]. #Blockchain #Arbitrum #Ethereum #BDCC\"",
          he: "טיוטה להתאמה אישית (החליפו את החלקים שבסוגריים): \"בפרויקט הגמר שלי במסלול Blockchain Expert במכללה לבלוקצ׳יין ומטבעות דיגיטליים חקרתי את Arbitrum, ה-Rollup האופטימי הגדול של אתריום. שלוש תובנות: (1) אבטחה היא רצף: BoLD הפך את הוכחות ההונאה לפתוחות לכל, ועדיין מועצת ביטחון בת 12 חברים יכולה לפעול בחירום, כפי שקרה באוקטובר 2026; (2) שימוש וערך טוקן הן שאלות שונות: מוסדות כמו Robinhood בונים היום על הטכנולוגיה של Arbitrum, אבל הכנסות ה-DAO לא זורמות אוטומטית למחזיקי ARB; (3) ממשל הוא עבודה אמיתית: קריאת שרשורים והצבעות בפורום לימדה אותי יותר מכל דשבורד. ההשתתפות ב[שם הדיונים] הראתה לי [התובנה שלכם]. הצעד הבא: [הצעד שלכם]. #Blockchain #Arbitrum #Ethereum #BDCC\"",
        },
        {
          en: "Image: use your own screenshot (for example your Tally vote or forum post) or a photo from your studies; do not reuse Arbitrum brand assets as if they were your own. If you publish, add the link and tag the college page.",
          he: "תמונה: השתמשו בצילום מסך משלכם (למשל ההצבעה שלכם ב-Tally או פוסט בפורום) או בתמונה מהלימודים; אל תשתמשו בנכסי המותג של Arbitrum כאילו הם שלכם. אם פרסמתם, צרפו קישור ותייגו את עמוד המכללה.",
        },
      ],
      sources: [],
    },
  ],
};
