import { SRC } from "../sources";
import type { ArbChapter } from "../types";

// Part A, chapters 4 to 7 plus the bonus question.

export const CHAPTER_4: ArbChapter = {
  id: "ch4",
  part: "A",
  title: { en: "Chapter 4: Governance", he: "פרק 4 - ממשל" },
  questions: [
    {
      id: "4.1",
      title: { en: "The governance model", he: "מודל הממשל" },
      prompt: {
        en: "Who makes decisions and how (DAO, foundation, validators, core developers, a mix)? Where are decisions made: on-chain, off-chain or both? Who may propose and vote, what are the thresholds, and are there different proposal types?",
        he: "מי מקבל החלטות בפרויקט, וכיצד? היכן מתקבלות ההחלטות: און-צ׳יין, אוף-צ׳יין, או שילוב? מי רשאי להציע ולהצביע, ומהם הספים? האם יש סוגים שונים של הצעות?",
      },
      kind: "fact",
      answer: [
        {
          en: "Who decides: the Arbitrum DAO, meaning ARB holders voting directly or through delegates. Offchain Labs writes most protocol code and proposes upgrades, the Arbitrum Foundation executes and administers, and the Security Council handles emergencies. Chain upgrades, treasury spending and changes to the constitution all require a DAO vote.",
          he: "מי מחליט: ה-Arbitrum DAO, כלומר מחזיקי ARB שמצביעים ישירות או דרך דלגייטים. Offchain Labs כותבת את רוב קוד הפרוטוקול ומציעה שדרוגים, קרן Arbitrum מבצעת ומנהלת, ומועצת הביטחון מטפלת במצבי חירום. שדרוגי רשת, הוצאות מהקופה ושינויים בחוקה מחייבים הצבעת DAO.",
        },
        {
          en: "Where: a hybrid. Discussion starts on the forum, followed by an off-chain Snapshot temperature check, then an on-chain vote on Tally through one of two Governor contracts. On-chain results execute automatically after timelocks.",
          he: "היכן: שילוב. הדיון מתחיל בפורום, ממשיך בבדיקת עמדה (Temperature Check) אוף-צ׳יין ב-Snapshot, ואז הצבעה און-צ׳יין ב-Tally דרך אחד משני חוזי Governor. תוצאות און-צ׳יין מבוצעות אוטומטית לאחר תקופות המתנה (Timelocks).",
        },
        {
          en: "Who and thresholds: any ARB holder can vote or delegate. Submitting an on-chain proposal requires 1,000,000 ARB of delegated voting power (lowered from 5M by AIP-1.2). Two proposal types: Constitutional (changes to the constitution, core contracts, chain software or the Security Council) and Non-Constitutional (funding and other decisions). Quorum was historically 5% of votable supply for Constitutional and 3% for Non-Constitutional; the Constitutional quorum was cut to 4.5% in 2025, and in 2026 the DAO adopted a quorum based on delegated voting power (DVP). A Constitutional proposal takes about 37 days end to end because it passes waiting periods on L2 and L1 plus the withdrawal delay.",
          he: "מי ואילו ספים: כל מחזיק ARB יכול להצביע או להאציל את קולו. הגשת הצעה און-צ׳יין דורשת כוח הצבעה מואצל של 1,000,000 ARB (הורד מ-5 מיליון ב-AIP-1.2). שני סוגי הצעות: Constitutional (שינויי חוקה, חוזי ליבה, תוכנת הרשת או מועצת הביטחון) ו-Non-Constitutional (מימון והחלטות אחרות). הקוורום היה 5% מההיצע הזכאי להצבעה להצעות חוקתיות ו-3% ללא חוקתיות; ב-2025 הקוורום החוקתי הורד ל-4.5%, וב-2026 אימץ ה-DAO קוורום שמבוסס על כוח הצבעה מואצל (DVP). הצעה חוקתית נמשכת כ-37 ימים מקצה לקצה, כי היא עוברת תקופות המתנה ב-L2 וב-L1 וגם את השהיית המשיכה.",
        },
      ],
      sources: [SRC.constitution, SRC.tally, SRC.quorumReduction, SRC.dvpQuorum, SRC.aip1Defiant],
    },
    {
      id: "4.2",
      title: { en: "Centralization in practice", he: "ריכוזיות בפועל" },
      prompt: {
        en: "Check recent decisions or votes: what was the participation rate? How much power is concentrated with the largest actors? How is major conflict handled, and how can the governance model itself be changed?",
        he: "בדקו את ההחלטות או ההצבעות האחרונות: מה היה שיעור ההשתתפות? כמה מהכוח מרוכז בידי הגורמים הגדולים ביותר? כיצד מתמודדים עם קונפליקט גדול, וכיצד ניתן לשנות את מודל הממשל עצמו?",
      },
      kind: "fact",
      answer: [
        {
          en: "Participation: the DVP quorum proposal itself documents that participation fell from around 8% to 4 to 5% of votable supply over the preceding year, close to the quorum line. A recent example: the October 2026 Snapshot vote on 100M ARB for USDG incentives drew about 199.5M ARB in favor. Note that the DAO treasury's own ARB cannot vote.",
          he: "השתתפות: הצעת קוורום ה-DVP עצמה מתעדת שההשתתפות ירדה מכ-8% ל-4 עד 5% מההיצע הזכאי להצבעה בשנה שקדמה לה, קרוב לרף הקוורום. דוגמה עדכנית: הצבעת ה-Snapshot באוקטובר 2026 על 100 מיליון ARB לתמריצי USDG משכה כ-199.5 מיליון ARB בעד. יש לציין שה-ARB שבקופת ה-DAO עצמה לא מצביע.",
        },
        {
          en: "Concentration: analyses posted to the DAO forum report that the ten largest delegates hold roughly 40% of delegated voting power, and Curia's study found voting power heavily concentrated (Gini above 0.9). Hundreds of delegates receive delegation but rarely vote. Quote the latest Tally delegate table with its date for the current numbers.",
          he: "ריכוזיות: ניתוחים שפורסמו בפורום ה-DAO מראים שעשרת הדלגייטים הגדולים מחזיקים כ-40% מכוח ההצבעה המואצל, ומחקר של Curia מצא ריכוז גבוה מאוד של כוח הצבעה (מקדם ג׳יני מעל 0.9). מאות דלגייטים מקבלים האצלה אך כמעט לא מצביעים. לנתונים עדכניים יש לצטט את טבלת הדלגייטים ב-Tally עם תאריך.",
        },
        {
          en: "Conflict and change: disputes are argued on the forum and decided by votes; the clearest precedent is AIP-1 (April 2023), where a failed off-chain vote forced the Foundation to restructure its request. The governance model itself changes only through a Constitutional AIP, as with the 2025 quorum reduction, the 2026 DVP quorum, and the 2026 extension of Security Council terms.",
          he: "קונפליקט ושינוי: מחלוקות מתבררות בפורום ומוכרעות בהצבעות; התקדים הבולט הוא AIP-1 (אפריל 2023), שבו הצבעה אוף-צ׳יין שנכשלה אילצה את הקרן לבנות מחדש את בקשתה. מודל הממשל עצמו משתנה רק באמצעות הצעה חוקתית, כמו הורדת הקוורום ב-2025, קוורום ה-DVP ב-2026, והארכת כהונת חברי מועצת הביטחון ב-2026.",
        },
      ],
      sources: [SRC.dvpQuorum, SRC.curiaVotingPower, SRC.usdgVote, SRC.tally],
    },
    {
      id: "4.3",
      title: { en: "Thinking question: one decision, and a 1 to 5 rating", he: "שאלת חשיבה - החלטה אחת ודירוג 1 עד 5" },
      prompt: {
        en: "Analyze one significant decision: who initiated it, who opposed it, how was it decided, and was the process fair? Rate from 1 to 5 how decentralized governance is in practice, not on paper.",
        he: "נתחו החלטה משמעותית אחת: מי יזם אותה, מי התנגד, איך הוכרעה, והאם התהליך היה הוגן. דרגו מ-1 עד 5 עד כמה הממשל מבוזר בפועל, ולא על הנייר.",
      },
      kind: "analysis",
      answer: [
        {
          en: "Decision: adopting Timeboost (activated on Arbitrum One and Nova in April 2025). Initiator: Offchain Labs, which designed it as a replacement for pure first-come-first-served ordering. Mechanism: a sealed-bid, second-price auction each minute sells an express lane with a short time advantage; bids are paid in ETH and the proceeds go to the DAO. Critics on the forum argued it favors sophisticated searchers and adds a centralized auction step. It passed as a Constitutional AIP through the full Snapshot then Tally process. Outcome: Timeboost returned more than $6M to the DAO in 2025, its first year. Fairness: procedurally fair (public discussion, two votes, timelocks), but the proposal came from the core developer that also runs the sequencer, which shows how agenda-setting power sits with Offchain Labs.",
          he: "ההחלטה: אימוץ Timeboost (הופעל ב-Arbitrum One וב-Nova באפריל 2025). היוזמת: Offchain Labs, שתכננה אותו כחלופה לסידור עסקאות לפי סדר הגעה בלבד. המנגנון: מכרז חתום במחיר השני, פעם בדקה, שמוכר נתיב מהיר עם יתרון זמן קצר; ההצעות משולמות ב-ETH וההכנסות הולכות ל-DAO. מתנגדים בפורום טענו שהמנגנון מעדיף שחקנים מתוחכמים (Searchers) ומוסיף שלב מכרז ריכוזי. ההצעה עברה כהצעה חוקתית דרך תהליך מלא של Snapshot ואז Tally. התוצאה: Timeboost החזיר יותר מ-6 מיליון דולר ל-DAO ב-2025, השנה הראשונה. הוגנות: התהליך היה הוגן פרוצדורלית (דיון פומבי, שתי הצבעות, Timelocks), אבל ההצעה הגיעה ממפתחת הליבה שגם מפעילה את ה-Sequencer, וזה ממחיש שכוח קביעת סדר היום נמצא אצל Offchain Labs.",
        },
        {
          en: "Suggested rating: 2 out of 5. For: real on-chain votes that bind upgrades and treasury, a successful community revolt (AIP-1), elected Security Council. Against: low participation (4 to 5% of votable supply), roughly 40% of delegated power in ten delegates, one sequencer operator, and a Security Council that acted unilaterally twice in October 2026. This rating is a defended opinion; adjust it if your own reading of recent votes differs.",
          he: "דירוג מוצע: 2 מתוך 5. בעד: הצבעות און-צ׳יין אמיתיות שמחייבות שדרוגים וקופה, מרד קהילתי שהצליח (AIP-1), ומועצת ביטחון נבחרת. נגד: השתתפות נמוכה (4 עד 5% מההיצע הזכאי), כ-40% מהכוח המואצל בידי עשרה דלגייטים, מפעיל Sequencer יחיד, ומועצת ביטחון שפעלה באופן חד-צדדי פעמיים באוקטובר 2026. הדירוג הוא עמדה מנומקת; שנו אותו אם קריאתכם בהצבעות האחרונות שונה.",
        },
      ],
      sources: [SRC.docsTimeboost, SRC.timeboostFees, SRC.transparency2025, SRC.dvpQuorum, SRC.scFreeze],
    },
  ],
};

export const CHAPTER_5: ArbChapter = {
  id: "ch5",
  part: "A",
  title: { en: "Chapter 5: Token economics", he: "פרק 5 - כלכלת המטבע" },
  questions: [
    {
      id: "5.1",
      title: { en: "Token type, supply and distribution", he: "סוג המטבע, היצע וחלוקה" },
      prompt: {
        en: "What type of token is it and what is its role? What is the supply (maximum and available)? How was it initially distributed? Is there inflation, burning or expected unlocks? Has the economics changed over time?",
        he: "מה סוג המטבע ומה תפקידו? מהו ההיצע (מקסימלי וזמין)? כיצד חולק בהתחלה? האם יש אינפלציה, שריפה או פתיחת נעילות צפויות? האם הכלכלה השתנתה לאורך הזמן?",
      },
      kind: "fact",
      answer: [
        {
          en: "Type and role: ARB is an ERC-20 governance token. It is not used for gas (gas is ETH) and is not staked to secure the chain. Its role is voting on upgrades, treasury and Security Council elections, and funding ecosystem programs from the DAO treasury.",
          he: "סוג ותפקיד: ARB הוא טוקן ממשל מסוג ERC-20. הוא לא משמש לתשלום עמלות (העמלות ב-ETH) ולא מופקד כדי לאבטח את הרשת. תפקידו הוא הצבעה על שדרוגים, על הקופה ועל הבחירות למועצת הביטחון, ומימון תוכניות לאקוסיסטם מקופת ה-DAO.",
        },
        {
          en: "Supply: 10,000,000,000 ARB minted at genesis (March 2023). There is no hard cap: the DAO may mint up to 2% per year by a Constitutional vote. No burn mechanism. Circulating supply is shown live below.",
          he: "היצע: 10,000,000,000 ARB הונפקו ביצירה (מרץ 2023). אין תקרה קשיחה: ה-DAO רשאי להנפיק עד 2% בשנה בהצבעה חוקתית. אין מנגנון שריפה. ההיצע במחזור מוצג בזמן אמת למטה.",
        },
        {
          en: "Initial distribution: DAO treasury 35.28%; Offchain Labs team and future team plus advisors 26.94%; investors 17.53%; user airdrop 11.62%; Arbitrum Foundation 7.5%; airdrop to DAOs building on Arbitrum 1.13%.",
          he: "חלוקה ראשונית: קופת ה-DAO 35.28%; צוות Offchain Labs, צוות עתידי ויועצים 26.94%; משקיעים 17.53%; איירדרופ למשתמשים 11.62%; קרן Arbitrum 7.5%; איירדרופ ל-DAOs שבונים על Arbitrum 1.13%.",
        },
        {
          en: "Unlocks and changes: team and investor tokens had a one-year cliff (March 2024) followed by 36 monthly releases of about 92.6M ARB, ending in March 2027. After the AIP-1 crisis, the Foundation's remaining 700M ARB was put under a four-year smart-contract lockup (AIP-1.1). The economics changed mainly on the revenue side (Timeboost from 2025, Expansion Program licenses) and through large treasury spending programs; the 2% inflation option has not been part of those changes.",
          he: "פתיחת נעילות ושינויים: לטוקנים של הצוות והמשקיעים הייתה תקופת צוק של שנה (מרץ 2024) ואחריה 36 שחרורים חודשיים של כ-92.6 מיליון ARB, עד מרץ 2027. לאחר משבר AIP-1, 700 מיליון ה-ARB שנותרו לקרן הוכנסו לנעילה בחוזה חכם לארבע שנים (AIP-1.1). הכלכלה השתנתה בעיקר בצד ההכנסות (Timeboost מ-2025, רישיונות AEP) ובתוכניות הוצאה גדולות מהקופה; אופציית האינפלציה של 2% לא הייתה חלק מהשינויים האלה.",
        },
      ],
      live: ["supply"],
      sources: [SRC.tokenomics, SRC.constitution, SRC.unlocks, SRC.aip1Defiant, SRC.coingecko],
    },
    {
      id: "5.2",
      title: { en: "Value capture", he: "החזרת ערך למחזיקים" },
      prompt: {
        en: "How (if at all) does value created on the network return to token holders?",
        he: "כיצד (אם בכלל) ערך שנוצר ברשת חוזר למחזיקי הטוקן?",
      },
      kind: "fact",
      answer: [
        {
          en: "Directly: it does not. There is no fee switch, burn, buyback or staking yield paid from protocol revenue to ARB holders. Indirectly: revenue (net sequencer fees from Arbitrum One and Nova, Timeboost auction proceeds, 8% of net revenue from Arbitrum chains settling outside One and Nova under the Expansion Program, and treasury yield) accumulates in the DAO treasury, which ARB holders control by vote. Scale: about $23.5M gross revenue in 2025 and $6.19M of income in H1 2026, with $125M of non-ARB treasury assets at the end of June 2026. Any future link to the token (buybacks, staking rewards) would require a DAO decision.",
          he: "באופן ישיר: לא. אין מנגנון שמעביר הכנסות מהפרוטוקול למחזיקי ARB: אין Fee Switch, אין שריפה, אין רכישה חוזרת ואין תשואת סטייקינג. בעקיפין: ההכנסות (עמלות Sequencer נטו מ-Arbitrum One ומ-Nova, תמורת מכרזי Timeboost, 8% מההכנסה נטו של רשתות Arbitrum שמסלקות מחוץ ל-One ול-Nova במסגרת AEP, ותשואה על הקופה) מצטברות בקופת ה-DAO, שמחזיקי ARB שולטים בה בהצבעה. היקף: כ-23.5 מיליון דולר הכנסות ברוטו ב-2025 ו-6.19 מיליון דולר במחצית הראשונה של 2026, ו-125 מיליון דולר בנכסי קופה שאינם ARB בסוף יוני 2026. כל קישור עתידי לטוקן (רכישה חוזרת, תגמולי סטייקינג) מחייב החלטת DAO.",
        },
      ],
      sources: [SRC.h1Revenue2026, SRC.foundationFunding, SRC.aepDocs, SRC.docsTimeboost],
    },
    {
      id: "5.3",
      title: { en: "Thinking question: if the token disappeared tomorrow", he: "שאלת חשיבה - אם הטוקן היה נעלם מחר" },
      prompt: {
        en: "What would happen to the project if the token disappeared tomorrow? Would it keep functioning? What does the answer teach about the link between token economics and the project's vision?",
        he: "מה היה קורה לפרויקט אם הטוקן היה נעלם מחר? האם הפרויקט היה ממשיך לתפקד? מה התשובה מלמדת על הקשר בין כלכלת המטבע לחזון הפרויקט?",
      },
      kind: "analysis",
      answer: [
        {
          en: "Short term the chain keeps running: users pay gas in ETH, the sequencer keeps ordering, batches keep posting to Ethereum, and BoLD validators (bonded in ETH) keep securing withdrawals. What breaks is governance: both Governor contracts count ARB votes, so no Constitutional upgrade or treasury payment could pass, and Security Council elections (also ARB-weighted) would stop. Control would drift back to the Security Council and the Foundation, and the treasury's ARB (its largest asset) would vanish.",
          he: "בטווח הקצר הרשת ממשיכה לפעול: המשתמשים משלמים עמלות ב-ETH, ה-Sequencer ממשיך לסדר עסקאות, האצוות ממשיכות להתפרסם באתריום, ומאמתי BoLD (שהערבון שלהם ב-ETH) ממשיכים לאבטח משיכות. מה שנשבר הוא הממשל: שני חוזי ה-Governor סופרים קולות ARB, ולכן שום שדרוג חוקתי או תשלום מהקופה לא יעבור, והבחירות למועצת הביטחון (גם הן משוקללות ב-ARB) ייעצרו. השליטה תחזור בפועל למועצת הביטחון ולקרן, וה-ARB שבקופה (הנכס הגדול ביותר בה) ייעלם.",
        },
        {
          en: "Lesson: ARB is not needed for the product to work; it is needed for the project to be owned and upgraded by a community instead of a company. The token economics serve the decentralization vision, not the usage of the chain, which is exactly why usage growth does not automatically show up in the token price.",
          he: "המסקנה: ARB לא נדרש כדי שהמוצר יעבוד; הוא נדרש כדי שהפרויקט יהיה בבעלות קהילה שמשדרגת אותו, ולא בבעלות חברה. כלכלת המטבע משרתת את חזון הביזור, לא את השימוש ברשת, וזו בדיוק הסיבה שצמיחה בשימוש לא מתבטאת אוטומטית במחיר הטוקן.",
        },
      ],
      sources: [SRC.constitution, SRC.docsBold, SRC.securityCouncilDocs],
    },
  ],
};

export const CHAPTER_6: ArbChapter = {
  id: "ch6",
  part: "A",
  title: { en: "Chapter 6: Positioning, regulation and competition", he: "פרק 6 - מיצוב, רגולציה ותחרות" },
  questions: [
    {
      id: "6.1",
      title: { en: "Regulation", he: "רגולציה" },
      prompt: {
        en: "Which entity stands behind the project (company, foundation or association), in which jurisdiction, and what is its regulatory status?",
        he: "איזו ישות עומדת מאחורי הפרויקט, באיזה תחום שיפוט, ומהו הסטטוס הרגולטורי שלו?",
      },
      kind: "fact",
      answer: [
        {
          en: "Entities: the Arbitrum Foundation is a Cayman Islands foundation company that supports the ecosystem and holds the ARBITRUM trademark; Offchain Labs is a privately held US company that develops the software and runs the sequencer; the DAO itself has no legal wrapper. Status: as of the research date we found no SEC or other enforcement action against Arbitrum, the Foundation or Offchain Labs, and ARB is listed on major regulated exchanges (including Coinbase). The offshore foundation plus US developer structure is common and has not been tested in court for Arbitrum.",
          he: "ישויות: קרן Arbitrum היא חברת קרן באיי קיימן שתומכת באקוסיסטם ומחזיקה בסימן המסחר ARBITRUM; Offchain Labs היא חברה פרטית אמריקאית שמפתחת את התוכנה ומפעילה את ה-Sequencer; ל-DAO עצמו אין מעטפת משפטית. סטטוס: נכון למועד המחקר לא מצאנו הליך אכיפה של ה-SEC או של רגולטור אחר נגד Arbitrum, הקרן או Offchain Labs, ו-ARB נסחר בבורסות מפוקחות מרכזיות (כולל Coinbase). המבנה של קרן מחוץ לארה״ב ומפתחת אמריקאית נפוץ, ועדיין לא נבחן בבית משפט במקרה של Arbitrum.",
        },
      ],
      sources: [SRC.foundationDocs],
    },
    {
      id: "6.2",
      title: { en: "The blockchain trilemma", he: "טרילמת הבלוקצ׳יין" },
      prompt: {
        en: "What trade-offs does the project make? What failure points do you identify?",
        he: "אילו פשרות עושה הפרויקט? מהן נקודות הכשל שאתם מזהים?",
      },
      kind: "analysis",
      answer: [
        {
          en: "Trade-offs: Arbitrum gains scalability by executing off Ethereum, and keeps security close to Ethereum's by posting all data there and using fraud proofs. It pays for this mainly in decentralization of operations (one sequencer, an emergency council) and in finality for withdrawals (about 6.4 days to Ethereum). Arbitrum Nova trades further: it keeps data with a committee to be cheaper.",
          he: "פשרות: Arbitrum משיגה סקיילביליות על ידי ביצוע מחוץ לאתריום, ושומרת על אבטחה קרובה לזו של אתריום על ידי פרסום כל הנתונים שם ושימוש בהוכחות הונאה. המחיר הוא בעיקר בביזור התפעול (Sequencer יחיד, מועצת חירום) ובזמן הסופיות של משיכות (כ-6.4 ימים לאתריום). Arbitrum Nova מוותרת עוד יותר: היא שומרת את הנתונים אצל ועדה כדי להיות זולה יותר.",
        },
        {
          en: "Failure points: (1) sequencer downtime halts fast transactions (outages occurred in 2021, 2022 and on 15 Dec 2023); (2) Security Council collusion or key compromise (9 of 12 can upgrade instantly); (3) proof-system or VM bugs, which is why Stylus activations were paused in October 2026 and a guard was added to the one-step proof; (4) dependence on Ethereum for data and settlement, including its fees and censorship resistance.",
          he: "נקודות כשל: (1) השבתת ה-Sequencer עוצרת עסקאות מהירות (היו השבתות ב-2021, ב-2022 וב-15.12.2023); (2) קנוניה או פריצת מפתחות במועצת הביטחון (9 מתוך 12 יכולים לשדרג מיידית); (3) באגים במערכת ההוכחות או במכונה הווירטואלית, ולכן עצרו את הפעלת חוזי Stylus באוקטובר 2026 והוסיפו מנגנון הגנה להוכחה בצעד אחד; (4) תלות באתריום לנתונים ולסליקה, כולל העמלות ועמידות הצנזורה שלו.",
        },
      ],
      sources: [SRC.l2beat, SRC.stylusPause, SRC.docsOverview],
    },
    {
      id: "6.3",
      title: { en: "Interoperability", he: "אינטרופרביליות" },
      prompt: {
        en: "Does the project interface with other networks or layers (bridges, cross-chain standards, multi-chain deployment)? Volumes bridged and recent transfer volume; real uses and flows; risks and past incidents; thinking question: competitive advantage or weakening dependency?",
        he: "האם הפרויקט מתממשק עם רשתות או שכבות אחרות? היקפים, שימושים, סיכונים, ושאלת חשיבה: האם האינטרופרביליות היא יתרון תחרותי או תלות שמחלישה?",
      },
      kind: "analysis",
      answer: [
        {
          en: "Interfaces: the canonical Arbitrum bridge to Ethereum (deposits in minutes, withdrawals after the challenge period); Arbitrum chains that settle on Arbitrum One as L3s; Circle's CCTP for native USDC; and third-party messaging and liquidity bridges (Chainlink CCIP, LayerZero-based bridges, Across and others). ARB itself exists on both Ethereum and Arbitrum One.",
          he: "ממשקים: הגשר הקנוני של Arbitrum לאתריום (הפקדה בתוך דקות, משיכה אחרי תקופת הערעור); רשתות Arbitrum שמסלקות על Arbitrum One כשכבה 3; CCTP של Circle ל-USDC מקורי; וגשרי העברת מסרים ונזילות של צד שלישי (Chainlink CCIP, גשרים מבוססי LayerZero, Across ואחרים). ARB עצמו קיים גם באתריום וגם ב-Arbitrum One.",
        },
        {
          en: "Volumes: the authoritative figure is L2BEAT's Total Value Secured (canonically bridged, natively minted and externally bridged assets); a 2026 compilation of L2BEAT data put it at about $12.3B. Stablecoins on the chain are shown live below (DefiLlama). For transfer volumes over a recent period cite a Dune bridge dashboard with its date.",
          he: "היקפים: הנתון המוסמך הוא Total Value Secured של L2BEAT (נכסים שגושרו בגשר הקנוני, שהונפקו מקומית ושגושרו בגשרים חיצוניים); ריכוז נתונים מ-2026 העמיד אותו על כ-12.3 מיליארד דולר. הסטייבלקוינים ברשת מוצגים בזמן אמת למטה (DefiLlama). לנפח העברות בתקופה האחרונה יש לצטט דשבורד גשרים ב-Dune עם תאריך.",
        },
        {
          en: "Uses and risks: most flows are users moving ETH and stablecoins from Ethereum into Arbitrum DeFi and back, institutions minting RWAs, and liquidity moving to and from other L2s. Risks: third-party bridges add their own validator or multisig trust; the canonical bridge inherits the rollup's own risks (Security Council, proof bugs); and Arbitrum One is exposed to whatever hacked funds flow in, as the 30 Oct 2026 freeze of assets tied to the Binance exploit showed.",
          he: "שימושים וסיכונים: רוב התנועות הן משתמשים שמעבירים ETH וסטייבלקוינים מאתריום ל-DeFi ב-Arbitrum ובחזרה, מוסדות שמנפיקים RWA, ונזילות שעוברת לרשתות L2 אחרות וממנה. סיכונים: גשרי צד שלישי מוסיפים אמון במאמתים או ב-Multisig משלהם; הגשר הקנוני יורש את סיכוני ה-Rollup עצמו (מועצת הביטחון, באגים בהוכחות); ו-Arbitrum One חשופה לכספים פרוצים שזורמים אליה, כפי שהראתה ההקפאה ב-30.10.2026 של נכסים שקשורים לפריצה ל-Binance.",
        },
        {
          en: "Thinking question: interoperability is mostly an advantage, because Arbitrum's value proposition is being Ethereum's liquidity hub, and Arbitrum chains (like Robinhood Chain) extend its technology reach. It becomes a dependency where activity happens on chains that only license the technology: those chains bring license fees but can take users and liquidity away from Arbitrum One.",
          he: "שאלת חשיבה: האינטרופרביליות היא בעיקר יתרון, כי ההצעה של Arbitrum היא להיות מרכז הנזילות של אתריום, ורשתות Arbitrum (כמו Robinhood Chain) מרחיבות את פריסת הטכנולוגיה. היא הופכת לתלות כשהפעילות מתרחשת ברשתות שרק משתמשות ברישיון הטכנולוגיה: הן מביאות דמי רישיון, אבל עלולות למשוך משתמשים ונזילות מ-Arbitrum One.",
        },
      ],
      live: ["stablecoins"],
      sources: [SRC.l2beat, SRC.defillamaChain, SRC.bridge, SRC.scFreeze],
    },
    {
      id: "6.4",
      title: { en: "Competition", he: "תחרות" },
      prompt: {
        en: "Compare the project to at least 2 competitors using 2 criteria you consider most important in its industry. Justify the criteria. What are its advantages and disadvantages?",
        he: "השוו את הפרויקט ללפחות 2 מתחרים, לפי 2 קריטריונים שאתם מגדירים כמשמעותיים ביותר. נמקו את בחירת הקריטריונים. מהם היתרונות והחסרונות של הפרויקט מולם?",
      },
      kind: "analysis",
      answer: [
        {
          en: "Competitors: Base (built by Coinbase on the OP Stack) and OP Mainnet (Optimism). Criterion 1, economic gravity: DeFi TVL and stablecoins show where capital chooses to live (live table below). Criterion 2, trust model: the L2BEAT stage and proof system determine how much users must trust operators. All three are Stage 1 with permissionless proofs (Arbitrum via BoLD; OP Mainnet and Base via OP Stack fault proofs), so the differences sit in proof design, council powers and distribution.",
          he: "מתחרים: Base (נבנתה על ידי Coinbase על בסיס OP Stack) ו-OP Mainnet (של Optimism). קריטריון 1, כוח משיכה כלכלי: TVL של DeFi וסטייבלקוינים מראים היכן ההון בוחר לשבת (טבלה חיה למטה). קריטריון 2, מודל אמון: ה-Stage ב-L2BEAT ומערכת ההוכחות קובעים כמה המשתמשים צריכים לסמוך על המפעילים. שלושתן ב-Stage 1 עם הוכחות פתוחות לכל (Arbitrum דרך BoLD; OP Mainnet ו-Base דרך הוכחות התקלה של OP Stack), ולכן ההבדלים הם בתכנון ההוכחות, בסמכויות המועצה ובהפצה.",
        },
        {
          en: "Advantages: deep DeFi liquidity, a mature proof system with bounded delay (BoLD), Stylus for non-Solidity developers, and new DAO revenue lines (Timeboost, licenses). Disadvantages: no built-in consumer funnel comparable to Coinbase for Base, a token with no direct value capture, and October 2026 security actions that highlighted operational risk.",
          he: "יתרונות: נזילות DeFi עמוקה, מערכת הוכחות בשלה עם עיכוב חסום (BoLD), Stylus למפתחים שלא עובדים ב-Solidity, ומקורות הכנסה חדשים ל-DAO (Timeboost, רישיונות). חסרונות: אין משפך משתמשים מובנה כמו Coinbase עבור Base, טוקן ללא החזרת ערך ישירה, ופעולות האבטחה של אוקטובר 2026 שהבליטו סיכון תפעולי.",
        },
      ],
      live: ["competitors"],
      sources: [SRC.l2beat, SRC.defillamaChain, SRC.docsStylus],
    },
  ],
};

export const CHAPTER_7: ArbChapter = {
  id: "ch7",
  part: "A",
  title: { en: "Chapter 7: Looking ahead and conclusions", he: "פרק 7 - מבט קדימה ומסקנות" },
  questions: [
    {
      id: "7.1",
      title: { en: "Roadmap", he: "מפת דרכים" },
      prompt: {
        en: "What comes next per the roadmap? Which component is most critical to success, and why?",
        he: "מה הלאה לפי מפת הדרכים? איזה רכיב הוא הקריטי ביותר להצלחת הפרויקט, ומדוע?",
      },
      kind: "analysis",
      answer: [
        {
          en: "Next: Arbitrum ships through numbered ArbOS upgrades approved by the DAO. In 2026 these were ArbOS 51 \"Dia\" (January, Ethereum Fusaka compatibility and gas pricing changes) and ArbOS 61 \"Elara\" (activated 20 Aug 2026, multidimensional gas pricing and a 96 KB Stylus contract size limit). Upcoming items: compatibility with Ethereum's Glamsterdam upgrade, a decision on reopening Stylus activations, continued growth of Arbitrum chains under the Expansion Program, and the long-discussed path to Stage 2 (restricting the Security Council to provable on-chain bugs).",
          he: "הלאה: Arbitrum משדרגת דרך גרסאות ArbOS ממוספרות שה-DAO מאשר. ב-2026 אלה היו ArbOS 51 \"Dia\" (ינואר, תאימות לשדרוג Fusaka של אתריום ושינויי תמחור גז) ו-ArbOS 61 \"Elara\" (הופעל ב-20.8.2026, תמחור גז רב-ממדי ומגבלת גודל חוזה של 96KB ל-Stylus). הבא בתור: תאימות לשדרוג Glamsterdam של אתריום, החלטה על חידוש הפעלת חוזי Stylus, המשך צמיחת רשתות Arbitrum במסגרת AEP, והדרך ל-Stage 2 (הגבלת מועצת הביטחון לבאגים שניתן להוכיח און-צ׳יין).",
        },
        {
          en: "Most critical: the Arbitrum chains business (Expansion Program). It is the only revenue line that scales with adoption beyond Arbitrum One's own fees, and Robinhood Chain already contributed about 35% of the DAO's July 2026 income. Its success depends on the security reputation of the stack, which ties it directly to the Stylus and Security Council questions above.",
          he: "הרכיב הקריטי: עסקי רשתות Arbitrum (תוכנית AEP). זה מקור ההכנסה היחיד שגדל עם האימוץ מעבר לעמלות של Arbitrum One עצמה, ו-Robinhood Chain כבר תרמה כ-35% מהכנסות ה-DAO ביולי 2026. ההצלחה שלו תלויה במוניטין האבטחה של הטכנולוגיה, ולכן היא קשורה ישירות לשאלות Stylus ומועצת הביטחון שלמעלה.",
        },
      ],
      sources: [SRC.docsArbos51, SRC.docsArbos61, SRC.robinhoodFactsheet, SRC.l2beat],
    },
    {
      id: "7.2",
      title: { en: "Investment decision", he: "החלטת השקעה" },
      prompt: {
        en: "As a VC partner: would you invest (1 to 5)? If so, what share of the portfolio? Describe a realistic scenario in which the project fails within 3 years. What data or event would change your mind?",
        he: "אם הייתם שותפים בקרן הון סיכון: האם הייתם משקיעים? דרגו 1-5. כמה אחוזים מהתיק? תארו תרחיש ריאלי שבו הפרויקט נכשל תוך 3 שנים. איזה נתון או אירוע היה גורם לכם לשנות את דעתכם?",
      },
      kind: "analysis",
      answer: [
        {
          en: "Suggested position (yours to defend): 3 out of 5, a small allocation of about 2 to 3% of a crypto venture portfolio. Reasoning: strong technology, real institutional adoption and growing DAO revenue, offset by a token with no direct value capture, a price that fell from an all-time high of about $2.39 (January 2024) to about $0.17 (October 2026), and continuing unlocks until March 2027.",
          he: "עמדה מוצעת (שלכם להגן עליה): 3 מתוך 5, הקצאה קטנה של כ-2 עד 3% מתיק הון סיכון בקריפטו. נימוק: טכנולוגיה חזקה, אימוץ מוסדי אמיתי והכנסות DAO צומחות, מול טוקן ללא החזרת ערך ישירה, מחיר שירד משיא של כ-2.39 דולר (ינואר 2024) לכ-0.17 דולר (אוקטובר 2026), ופתיחת נעילות שנמשכת עד מרץ 2027.",
        },
        {
          en: "Realistic failure in 3 years: large institutions follow the Robinhood model but choose other stacks or negotiate away license fees; activity on Arbitrum One migrates to app-specific chains and to Base; DAO revenue stays in single-digit millions while the treasury is spent on incentives; and a serious proof-system or VM bug forces a long Security Council intervention, damaging the security brand that the licensing business depends on.",
          he: "כישלון ריאלי בתוך 3 שנים: מוסדות גדולים מאמצים את מודל Robinhood אבל בוחרים טכנולוגיות אחרות או מנהלים מו״מ לביטול דמי הרישיון; הפעילות ב-Arbitrum One עוברת לרשתות ייעודיות ול-Base; הכנסות ה-DAO נשארות במיליונים בודדים בזמן שהקופה מתרוקנת על תמריצים; ובאג חמור במערכת ההוכחות או במכונה הווירטואלית מחייב התערבות ממושכת של מועצת הביטחון ופוגע במוניטין האבטחה שעסקי הרישוי תלויים בו.",
        },
        {
          en: "What would change the view: upward, a DAO decision that ties revenue to ARB (buybacks or staking rewards), several more large institutions launching Arbitrum chains, or reaching Stage 2. Downward: a sustained drop in stablecoin supply on Arbitrum One, a quarter of falling license revenue, or another emergency action caused by a protocol bug.",
          he: "מה ישנה את דעתנו: כלפי מעלה, החלטת DAO שקושרת הכנסות ל-ARB (רכישה חוזרת או תגמולי סטייקינג), עוד מוסדות גדולים שמשיקים רשתות Arbitrum, או הגעה ל-Stage 2. כלפי מטה: ירידה מתמשכת בהיצע הסטייבלקוינים ב-Arbitrum One, רבעון של ירידה בהכנסות הרישוי, או פעולת חירום נוספת שנגרמה מבאג בפרוטוקול.",
        },
      ],
      live: ["market"],
      sources: [SRC.coingecko, SRC.h1Revenue2026, SRC.unlocks, SRC.robinhoodFactsheet],
    },
  ],
};

export const CHAPTER_BONUS: ArbChapter = {
  id: "bonus",
  part: "A",
  title: { en: "Bonus: hands-on practice (up to 3 points)", he: "שאלת בונוס - התנסות מעשית (עד 3 נקודות)" },
  questions: [
    {
      id: "Bonus",
      title: { en: "One documented on-chain action", he: "פעולה מתועדת אחת ברשת" },
      prompt: {
        en: "Perform one practical action on the project's network (preferably on testnet) and document it: transaction hash, screenshot, and a short account of what was simple, what was confusing, and what it says about readiness for the average user.",
        he: "בצעו פעולה מעשית אחת ברשת הפרויקט ותעדו אותה. צרפו בנספח את ה-Transaction Hash וצילום מסך, ותארו מה היה פשוט, מה היה מבלבל, ומה זה מלמד על מוכנות הפרויקט למשתמש הממוצע.",
      },
      kind: "personal",
      answer: [
        {
          en: "Recommended path on Arbitrum Sepolia (free, no financial risk): (1) add Arbitrum Sepolia to your wallet (chain id 421614); (2) get Sepolia ETH from a faucet listed in the Arbitrum docs; (3) bridge it from Ethereum Sepolia to Arbitrum Sepolia with the official Arbitrum Bridge (testnet mode), or send a small transfer between two of your addresses; (4) open the transaction on the Sepolia Arbiscan explorer and copy its hash. Note how long the deposit took versus how long a withdrawal back to Sepolia would take: that gap is the challenge period from question B.1 in practice.",
          he: "מסלול מומלץ ב-Arbitrum Sepolia (בחינם, ללא סיכון כספי): (1) הוסיפו את Arbitrum Sepolia לארנק (Chain ID ‏421614); (2) קבלו Sepolia ETH מ-Faucet שמופיע בתיעוד של Arbitrum; (3) גשרו אותו מ-Ethereum Sepolia ל-Arbitrum Sepolia דרך גשר Arbitrum הרשמי (במצב Testnet), או שלחו העברה קטנה בין שתי כתובות שלכם; (4) פתחו את העסקה בסייר Arbiscan של Sepolia והעתיקו את ה-Hash. שימו לב כמה זמן לקחה ההפקדה לעומת כמה זמן תיקח משיכה חזרה ל-Sepolia: הפער הזה הוא תקופת הערעור משאלה ב.1, בפועל.",
        },
      ],
      sources: [SRC.sepoliaFaucet, SRC.bridge],
    },
  ],
};
