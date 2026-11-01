import { SRC } from "../sources";
import type { ArbChapter } from "../types";

// Part B: the Arbitrum-specific questions only. The course's dedicated
// questions for TON, Optimism, Ondo and Zcash are intentionally excluded.

export const PART_B: ArbChapter = {
  id: "partB",
  part: "B",
  title: { en: "Part B: Arbitrum-specific questions", he: "חלק ב׳ - שאלות ייעודיות: Arbitrum" },
  questions: [
    {
      id: "B.1",
      title: { en: "Technology: what makes Arbitrum's rollup unique", he: "טכנולוגיה: מה מייחד את ה-Rollup של Arbitrum" },
      prompt: {
        en: "How is Arbitrum's fraud-proof mechanism (interactive proving and BoLD) unique compared to other optimistic rollups? What is Stylus and what does it enable? Which L2BEAT stage is Arbitrum One rated, and what prevents it from moving up? Thinking question: why does an official withdrawal to Ethereum take about a week, what would happen to security if it were one hour, and how do users bypass the wait?",
        he: "במה ייחודי מנגנון הוכחות ההונאה של Arbitrum (הוכחה אינטראקטיבית ו-BoLD) לעומת Rollups אופטימיים אחרים? מהו Stylus? באיזה Stage מדורגת Arbitrum One ב-L2Beat ומה מונע ממנה לעלות? שאלת חשיבה: מדוע משיכה לוקחת כשבוע, מה היה קורה אילו ההמתנה הייתה שעה, וכיצד עוקפים אותה?",
      },
      kind: "fact",
      answer: [
        {
          en: "Interactive proving: Arbitrum never re-executes a whole block on Ethereum. When two parties disagree, they bisect the disputed execution until a single WebAssembly (WAVM) instruction remains, and only that one step is executed on L1 by the one-step prover. Execution runs natively (Nitro compiles a modified Geth core), while the same code compiled to WASM is used for proofs. This keeps L1 cost small and lets the same engine that runs the chain prove it.",
          he: "הוכחה אינטראקטיבית: Arbitrum אף פעם לא מריצה בלוק שלם מחדש באתריום. כששני צדדים חלוקים, הם מצמצמים את הביצוע השנוי במחלוקת בחיפוש בינארי עד שנותרת הוראת WebAssembly ‏(WAVM) אחת, ורק הצעד הזה מורץ ב-L1 על ידי ה-One-Step Prover. הביצוע עצמו רץ באופן מקורי (Nitro מהדר ליבת Geth מותאמת), ואותו קוד מהודר ל-WASM משמש להוכחות. כך עלות ה-L1 נשארת קטנה, ואותו מנוע שמריץ את הרשת גם מוכיח אותה.",
        },
        {
          en: "BoLD (Bounded Liquidity Delay), live on Arbitrum One and Nova since February 2025: earlier Arbitrum disputes were one-against-one between allow-listed validators, so an attacker with many identities could delay finality by forcing sequential challenges. BoLD is all-against-all and permissionless: a single honest party can defend the correct state against any number of attackers, and the worst-case delay is bounded (about one extra challenge period) regardless of how many attackers join. Top-level assertions require a large ETH bond, which makes delay attacks expensive. OP Stack chains also have permissionless fault proofs, but BoLD's distinctive property is this bounded delay against many adversaries.",
          he: "BoLD ‏(Bounded Liquidity Delay), פעיל ב-Arbitrum One וב-Nova מפברואר 2025: קודם לכן מחלוקות ב-Arbitrum היו אחד מול אחד בין מאמתים מורשים, ותוקף עם זהויות רבות יכול היה לעכב את הסופיות על ידי כפיית ערעורים בזה אחר זה. BoLD הוא כולם מול כולם ופתוח לכל: צד ישר יחיד יכול להגן על המצב הנכון מול כל מספר של תוקפים, והעיכוב במקרה הגרוע חסום (בערך תקופת ערעור נוספת אחת) ללא תלות במספר התוקפים. טענות ברמה העליונה דורשות ערבון ETH גדול, מה שמייקר התקפות עיכוב. גם לרשתות OP Stack יש הוכחות תקלה פתוחות לכל, אבל התכונה הייחודית של BoLD היא העיכוב החסום מול יריבים רבים.",
        },
        {
          en: "Stylus: a second virtual machine next to the EVM (live on mainnet since September 2024). Developers write contracts in Rust, C or C++ compiled to WebAssembly, and these contracts are fully interoperable with Solidity contracts. Compute- and memory-heavy logic (cryptography, on-chain games, verification) becomes much cheaper. ArbOS 61 raised the Stylus contract size limit to 96 KB. On 2 Oct 2026 the Security Council paused new Stylus activations on One and Nova over risks from hand-crafted WebAssembly programs; existing Stylus contracts keep running and Solidity is unaffected.",
          he: "Stylus: מכונה וירטואלית שנייה לצד ה-EVM (פעילה ברשת הראשית מספטמבר 2024). מפתחים כותבים חוזים ב-Rust, C או C++ שמהודרים ל-WebAssembly, והחוזים האלה עובדים באופן מלא יחד עם חוזי Solidity. לוגיקה כבדה בחישוב ובזיכרון (קריפטוגרפיה, משחקים און-צ׳יין, אימות) נעשית זולה בהרבה. ArbOS 61 העלה את מגבלת גודל חוזה Stylus ל-96KB. ב-2.10.2026 מועצת הביטחון עצרה הפעלות חדשות של חוזי Stylus ב-One וב-Nova בגלל סיכונים מתוכניות WebAssembly שנבנו ידנית; חוזי Stylus קיימים ממשיכים לרוץ ו-Solidity לא מושפע.",
        },
        {
          en: "L2BEAT stage: Arbitrum One is Stage 1 and passes the walkaway test. What blocks Stage 2: the Security Council can act on issues that are not provable on-chain bugs, and its emergency path (9 of 12) takes effect immediately with no exit window. Regular upgrades give users only about 10 days to exit (8 days on L2 plus 3 days on L1, adjusted for the forced-transaction delay), while Stage 2 requires at least 30 days for upgrades unrelated to provable bugs.",
          he: "דירוג L2BEAT: ‏Arbitrum One מדורגת Stage 1 ועוברת את מבחן ה-Walkaway. מה מונע Stage 2: מועצת הביטחון יכולה לפעול בנושאים שאינם באגים שניתן להוכיח און-צ׳יין, ומסלול החירום שלה (9 מתוך 12) נכנס לתוקף מיידית ללא חלון יציאה. שדרוגים רגילים נותנים למשתמשים רק כ-10 ימים לצאת (8 ימים ב-L2 ועוד 3 ב-L1, בהתחשב בהשהיית העסקאות הכפויות), בעוד ש-Stage 2 דורש לפחות 30 יום לשדרוגים שאינם קשורים לבאגים מוכחים.",
        },
        {
          en: "Thinking question: the roughly 6.4-day wait (about 45,800 Ethereum blocks) is the challenge period: it must be long enough that an honest validator can get a dispute included on Ethereum even if an attacker censors or congests L1, or if validators need time to coordinate. With a one-hour window, an attacker who can censor Ethereum blocks or knock validators offline for an hour could finalize a false state and drain the bridge, so security would fall from one honest party to whoever controls a short window of L1 inclusion. Users bypass the wait with liquidity bridges and exchanges (for example Across or a centralized exchange): a liquidity provider pays them on Ethereum within minutes for a fee and waits out the challenge period itself.",
          he: "שאלת חשיבה: ההמתנה של כ-6.4 ימים (כ-45,800 בלוקים באתריום) היא תקופת הערעור: היא צריכה להיות ארוכה מספיק כדי שמאמת ישר יוכל להכניס ערעור לאתריום גם אם תוקף מצנזר או מעמיס את L1, או אם המאמתים צריכים זמן להתארגן. עם חלון של שעה, תוקף שמסוגל לצנזר בלוקים באתריום או להפיל מאמתים לשעה יכול לאשר סופית מצב שקרי ולרוקן את הגשר, כלומר האבטחה תרד מ\"צד ישר אחד\" ל\"מי ששולט בחלון קצר של הכללה ב-L1\". משתמשים עוקפים את ההמתנה עם גשרי נזילות ובורסות (למשל Across או בורסה ריכוזית): ספק נזילות משלם להם באתריום בתוך דקות תמורת עמלה, ומחכה בעצמו את תקופת הערעור.",
        },
      ],
      sources: [SRC.docsBold, SRC.docsOverview, SRC.docsStylus, SRC.docsArbos61, SRC.stylusPause, SRC.l2beat, SRC.l2beatStages],
    },
    {
      id: "B.2",
      title: { en: "The strategic move: \"Arbitrum Everywhere\"", he: "המהלך האסטרטגי: \"Arbitrum Everywhere\"" },
      prompt: {
        en: "What is Arbitrum Orbit, and what is the Arbitrum Expansion Program (AEP)? How does the DAO earn from chains built on Arbitrum technology? Robinhood launched its own chain on Arbitrum technology instead of operating directly on Arbitrum One: when did it launch and what is its purpose? Thinking question: a win for Arbitrum, or a sign that large players prefer their own chain? Who gains most: Arbitrum One, the DAO or ARB holders?",
        he: "מהו Arbitrum Orbit ומהי תוכנית AEP? כיצד מרוויח ה-DAO מרשתות שנבנות על הטכנולוגיה? Robinhood בחרה להשיק רשת משלה: מתי הושקה ומה מטרתה? שאלת חשיבה: ניצחון של Arbitrum או סימן שגופים גדולים מעדיפים רשת משלהם? מי מרוויח יותר: Arbitrum One, ה-DAO או מחזיקי ARB?",
      },
      kind: "fact",
      answer: [
        {
          en: "Orbit: the permissionless framework (now marketed as \"Arbitrum chains\") for launching your own chain with the Nitro stack: rollup or AnyTrust data mode, custom gas token, custom permissions, settling either on Arbitrum One or Nova (as an L3) or on Ethereum or another chain. AEP: the license under which any chain using Arbitrum technology that settles somewhere other than Arbitrum One or Nova pays 10% of its net protocol revenue to the ecosystem: 8% to the DAO treasury and 2% to the Arbitrum Developer Guild. Chains settling on One or Nova pay nothing extra because they already pay fees to the parent chain.",
          he: "Orbit: מסגרת פתוחה לכל (כיום משווקת כ\"Arbitrum chains\") להשקת רשת משלך על בסיס Nitro: מצב Rollup או AnyTrust, טוקן גז מותאם, הרשאות מותאמות, וסליקה על Arbitrum One או Nova (כשכבה 3) או על אתריום או רשת אחרת. AEP: הרישיון שלפיו כל רשת שמשתמשת בטכנולוגיה של Arbitrum ומסלקת במקום אחר מ-Arbitrum One או Nova משלמת 10% מההכנסה נטו של הפרוטוקול לאקוסיסטם: 8% לקופת ה-DAO ו-2% ל-Arbitrum Developer Guild. רשתות שמסלקות על One או Nova לא משלמות תוספת, כי הן כבר משלמות עמלות לרשת האם.",
        },
        {
          en: "Robinhood Chain: public testnet on 10 Feb 2026 (Consensus, Hong Kong); public mainnet on 1 July 2026 at Robinhood's event in London. It is a dedicated Arbitrum chain that settles to Ethereum, built for tokenized real-world assets: Stock Tokens of US equities and ETFs tradable 24/7 and usable in DeFi as collateral. Because it settles to Ethereum, it pays the AEP share: about $360K in July 2026, roughly 35% of that month's DAO income.",
          he: "Robinhood Chain: רשת ניסוי ציבורית ב-10.2.2026 (כנס Consensus בהונג קונג); רשת ראשית ציבורית ב-1.7.2026 באירוע של Robinhood בלונדון. זו רשת Arbitrum ייעודית שמסלקת לאתריום, ונבנתה לנכסים מהעולם האמיתי בטוקניזציה: טוקנים של מניות ותעודות סל אמריקאיות שנסחרים 24/7 וניתנים לשימוש ב-DeFi כבטוחה. מאחר שהיא מסלקת לאתריום, היא משלמת את חלק ה-AEP: כ-360 אלף דולר ביולי 2026, כ-35% מהכנסות ה-DAO באותו חודש.",
        },
        {
          en: "Thinking question: both. It is a technology win (a top US broker picked the Arbitrum stack and pays a license) and a signal that large brands want their own chain: control of sequencing, fees, compliance and branding. The DAO gains most directly (license revenue that scales with Robinhood's activity). Arbitrum One gains least and may lose activity and liquidity to the new chain. ARB holders gain only indirectly, through a richer treasury they govern, unless the DAO creates a mechanism that links revenue to the token.",
          he: "שאלת חשיבה: שניהם. זה ניצחון טכנולוגי (ברוקר אמריקאי מוביל בחר בטכנולוגיה של Arbitrum ומשלם רישיון) וגם סימן לכך שמותגים גדולים רוצים רשת משלהם: שליטה בסידור העסקאות, בעמלות, ברגולציה ובמיתוג. ה-DAO מרוויח באופן הישיר ביותר (הכנסות רישוי שגדלות עם הפעילות של Robinhood). Arbitrum One מרוויחה הכי פחות ועלולה לאבד פעילות ונזילות לרשת החדשה. מחזיקי ARB מרוויחים רק בעקיפין, דרך קופה עשירה יותר שהם שולטים בה, אלא אם ה-DAO ייצור מנגנון שמקשר את ההכנסות לטוקן.",
        },
      ],
      sources: [SRC.aepDocs, SRC.robinhoodFactsheet, SRC.robinhoodTheBlock, SRC.h1Revenue2026],
    },
    {
      id: "B.3",
      title: { en: "Formative event: the AIP-1 crisis (2023)", he: "אירוע מכונן: משבר AIP-1 (2023)" },
      prompt: {
        en: "What was AIP-1 and why did it cause a storm shortly after the DAO launched? How did the Foundation and the community respond, and how did the crisis end? Thinking question: what did it teach about the balance of power between the Foundation and the DAO? Did it strengthen or weaken Arbitrum's governance in the long run?",
        he: "מה הייתה הצעת AIP-1 ומדוע עוררה סערה? כיצד הגיבו הקרן והקהילה, ואיך הסתיים המשבר? שאלת חשיבה: מה המשבר לימד על יחסי הכוחות בין הקרן ל-DAO? האם חיזק את הממשל בטווח הארוך או החליש אותו?",
      },
      kind: "fact",
      answer: [
        {
          en: "What it was: days after the March 2023 airdrop, the Foundation posted AIP-1, a \"ratification\" of the governance documents and structure that also allocated 750M ARB (worth about $1B at the time) to the Foundation for grants and operations, plus a budget for legal and administrative costs.",
          he: "מה הייתה ההצעה: ימים ספורים אחרי האיירדרופ במרץ 2023 פרסמה הקרן את AIP-1, \"אשרור\" של מסמכי הממשל והמבנה, שכלל גם הקצאה של 750 מיליון ARB (כמיליארד דולר באותה עת) לקרן עבור מענקים ותפעול, ותקציב להוצאות משפטיות ומנהליות.",
        },
        {
          en: "The storm: delegates discovered the Foundation had already started using the tokens before any vote: 10M ARB had been sold for fiat to cover operating costs and 40M ARB had been lent to a market-making counterparty. The DAO was being asked to approve a decision already executed. The off-chain vote failed decisively (about 100M ARB against versus 16M for).",
          he: "הסערה: הדלגייטים גילו שהקרן כבר התחילה להשתמש בטוקנים לפני כל הצבעה: 10 מיליון ARB נמכרו תמורת כסף פיאט לכיסוי הוצאות תפעול, ו-40 מיליון ARB הושאלו לגורם עושה שוק. ה-DAO התבקש לאשר החלטה שכבר בוצעה. ההצבעה אוף-צ׳יין נכשלה באופן חד (כ-100 מיליון ARB נגד מול 16 מיליון בעד).",
        },
        {
          en: "Response and resolution: the Foundation apologized publicly and split the request into AIP-1.1 (the remaining 700M ARB locked in a smart contract and released over four years, with defined budget categories and mandatory transparency reports) and AIP-1.2 (amending the governance documents, removing AIP-1 references, and cutting the proposal threshold from 5M to 1M ARB). Both passed their temperature checks with 98.13% and 99.15% support and were then confirmed on-chain.",
          he: "תגובה וסיום: הקרן התנצלה בפומבי ופיצלה את הבקשה ל-AIP-1.1 (700 מיליון ה-ARB שנותרו ננעלו בחוזה חכם לשחרור על פני ארבע שנים, עם קטגוריות תקציב מוגדרות ודוחות שקיפות מחייבים) ול-AIP-1.2 (תיקון מסמכי הממשל, הסרת ההפניות ל-AIP-1, והורדת סף ההגשה מ-5 מיליון ל-1 מיליון ARB). שתיהן עברו את בדיקות העמדה ברוב של 98.13% ו-99.15%, ואושרו לאחר מכן און-צ׳יין.",
        },
        {
          en: "Thinking question: the crisis showed that formal power was asymmetric (the Foundation held the keys and could move tokens) but that the DAO's legitimacy was decisive: an off-chain vote with no binding force still forced a full retreat. Long term it strengthened governance: lockups, budgets and transparency reports became norms (the Foundation still publishes them, for example the 2025 Transparency Report), and the lower proposal threshold opened the agenda to more delegates. It also left a lasting trust deficit that shows up whenever the Foundation asks for funding.",
          he: "שאלת חשיבה: המשבר הראה שהכוח הפורמלי היה לא סימטרי (המפתחות היו אצל הקרן והיא יכלה להעביר טוקנים), אבל הלגיטימיות של ה-DAO הכריעה: הצבעה אוף-צ׳יין שאינה מחייבת אילצה נסיגה מלאה. בטווח הארוך המשבר חיזק את הממשל: נעילות, תקציבים ודוחות שקיפות הפכו לנורמה (הקרן ממשיכה לפרסם אותם, למשל דוח השקיפות ל-2025), וסף ההגשה הנמוך פתח את סדר היום לדלגייטים נוספים. הוא גם השאיר גירעון אמון מתמשך שעולה בכל פעם שהקרן מבקשת מימון.",
        },
      ],
      sources: [SRC.aip1Defiant, SRC.aip1Blockworks, SRC.transparency2025, SRC.foundationFunding],
    },
    {
      id: "B.4",
      title: { en: "Governance: the Security Council", he: "ממשל: מועצת הביטחון (Security Council)" },
      prompt: {
        en: "Who are its members, how are they elected, and what powers do they have, including emergency powers without a DAO vote? What is the difference between Constitutional and Non-Constitutional proposals, and why does it matter? Thinking question: does a council with emergency powers contradict decentralized governance, or is it a necessary compromise for a network holding billions? When should it be abolished?",
        he: "מי חבריה, כיצד הם נבחרים, ואילו סמכויות יש להם, כולל סמכויות חירום ללא הצבעת DAO? מה ההבדל בין הצעות Constitutional ל-Non-Constitutional ומדוע הוא חשוב? שאלת חשיבה: האם מועצה עם סמכויות חירום סותרת ממשל מבוזר, או שזו פשרה הכרחית? מתי נכון לבטל אותה?",
      },
      kind: "fact",
      answer: [
        {
          en: "Members and elections: 12 members split into two cohorts of six; one cohort is elected every six months by ARB-weighted DAO votes after a nomination phase and a Foundation compliance check, with limits on how many members may come from one organization. In the March 2026 election six members were elected (reported winners include Michael Lewellen, Certora, bartek.eth and yoav.eth; cite the forum results post for the full list). In July 2026 the DAO extended member terms from one year to two, and the council removed one member and appointed Patrick Collins (Cyfrin) by 9-of-12 votes.",
          he: "חברים ובחירות: 12 חברים בשתי קבוצות (Cohorts) של שישה; קבוצה אחת נבחרת כל שישה חודשים בהצבעת DAO משוקללת ב-ARB, אחרי שלב מועמדות ובדיקת ציות של הקרן, עם הגבלה על מספר החברים מאותו ארגון. בבחירות מרץ 2026 נבחרו שישה חברים (בין הזוכים המדווחים: Michael Lewellen, Certora, ‏bartek.eth ו-yoav.eth; לרשימה המלאה יש לצטט את פוסט התוצאות בפורום). ביולי 2026 האריך ה-DAO את הכהונה משנה לשנתיים, והמועצה הדיחה חבר אחד ומינתה את Patrick Collins ‏(Cyfrin) ברוב של 9 מתוך 12.",
        },
        {
          en: "Powers: through emergency multisigs on Ethereum and Arbitrum, 9 of 12 members can execute any action immediately, including contract upgrades and parameter changes, with no DAO vote and no delay. Non-emergency actions by the council go through the same delays as DAO proposals. October 2026 examples: on 2 Oct it set the Stylus activation gas to the maximum, effectively pausing new activations; on 30 Oct it moved 8,425 ETH and about 74.56M ARB tied to the Binance exploit into a frozen wallet that only further council action or a DAO vote can release.",
          he: "סמכויות: באמצעות Multisig חירום באתריום וב-Arbitrum, ‏9 מתוך 12 חברים יכולים לבצע כל פעולה מיידית, כולל שדרוג חוזים ושינוי פרמטרים, ללא הצבעת DAO וללא השהיה. פעולות שאינן חירום עוברות את אותן השהיות כמו הצעות DAO. דוגמאות מאוקטובר 2026: ב-2.10 המועצה הציבה את גז הפעלת Stylus למקסימום, ובכך עצרה בפועל הפעלות חדשות; ב-30.10 היא העבירה 8,425 ETH וכ-74.56 מיליון ARB שקשורים לפריצה ל-Binance לארנק מוקפא, שרק פעולה נוספת של המועצה או הצבעת DAO יכולות לשחרר.",
        },
        {
          en: "Constitutional versus Non-Constitutional: Constitutional AIPs change the constitution, core contracts, chain software or the Security Council; they need a higher quorum and pass through L2 waiting, the L2-to-L1 delay and L1 waiting (about 37 days), so users can exit before a change they reject takes effect. Non-Constitutional AIPs (grants, treasury, guidelines) need a lower quorum and execute faster. The split matters because it gives the strongest protection exactly to changes that can affect user funds.",
          he: "Constitutional לעומת Non-Constitutional: הצעות חוקתיות משנות את החוקה, חוזי הליבה, תוכנת הרשת או את מועצת הביטחון; הן דורשות קוורום גבוה יותר ועוברות המתנה ב-L2, השהיית L2 ל-L1 והמתנה ב-L1 (כ-37 ימים), כדי שמשתמשים יוכלו לצאת לפני ששינוי שהם מתנגדים לו נכנס לתוקף. הצעות לא חוקתיות (מענקים, קופה, הנחיות) דורשות קוורום נמוך יותר ומבוצעות מהר יותר. ההבחנה חשובה כי היא נותנת את ההגנה החזקה ביותר בדיוק לשינויים שיכולים להשפיע על כספי המשתמשים.",
        },
        {
          en: "Thinking question: it is a compromise, not a contradiction, as long as three conditions hold: the council is elected and removable by the DAO, its emergency actions are published and justified (both October 2026 actions were announced on the forum), and its scope is narrowed over time. The October freeze shows the cost: the same power that blocked stolen funds can freeze any address. It is right to limit it to provable on-chain bugs (the Stage 2 bar) once the proof system and Stylus have run for a sustained period without emergency fixes, and to remove it only when the protocol no longer needs upgradability for safety.",
          he: "שאלת חשיבה: זו פשרה ולא סתירה, כל עוד מתקיימים שלושה תנאים: המועצה נבחרת וניתנת להדחה על ידי ה-DAO, פעולות החירום שלה מתפרסמות ומנומקות (שתי הפעולות של אוקטובר 2026 פורסמו בפורום), והיקף סמכויותיה מצטמצם עם הזמן. ההקפאה באוקטובר ממחישה את המחיר: אותה סמכות שחסמה כספים גנובים יכולה להקפיא כל כתובת. נכון להגביל אותה לבאגים שניתן להוכיח און-צ׳יין (הרף של Stage 2) אחרי שמערכת ההוכחות ו-Stylus פועלות תקופה ממושכת בלי תיקוני חירום, ולבטל אותה רק כשהפרוטוקול כבר לא זקוק ליכולת שדרוג לצורכי בטיחות.",
        },
      ],
      sources: [SRC.securityCouncilDocs, SRC.scElection2026, SRC.scKeyRotation, SRC.scFreeze, SRC.stylusPause, SRC.constitution, SRC.l2beat],
    },
    {
      id: "B.5",
      title: { en: "Real adoption versus token value", he: "אימוץ אמיתי מול ערך הטוקן" },
      prompt: {
        en: "What are the DAO's revenue sources (transaction fees, Timeboost, AEP licensing, treasury yield) and how large is each recently? Show the evolution of key network metrics (transactions, TVL, stablecoins and RWA) against the ARB price over the same period. What do you see?",
        he: "מהם מקורות ההכנסה של ה-DAO ומה היקף כל אחד מהם בתקופה האחרונה? הציגו את התפתחות מדדי הרשת המרכזיים לעומת התפתחות מחיר ARB באותה תקופה. מה אתם מזהים?",
      },
      kind: "fact",
      answer: [
        {
          en: "Revenue sources: (1) Arbitrum One and Nova net sequencer fees (users' gas minus the cost of posting to Ethereum); (2) Timeboost express-lane auctions, more than $6M in 2025, its first year; (3) AEP licensing, led by Robinhood Chain (about $360K in July 2026); (4) treasury management returns on stablecoins and tokenized treasuries, with $125M of non-ARB assets at the end of June 2026. Totals: about $23.5M gross revenue in 2025; $6.19M in H1 2026, with gross margin above 97%. The Foundation's unaudited report gives the H1 2026 total; ask for the per-line split in the report itself when citing exact shares.",
          he: "מקורות הכנסה: (1) עמלות Sequencer נטו מ-Arbitrum One ומ-Nova (עמלות המשתמשים פחות עלות הפרסום לאתריום); (2) מכרזי הנתיב המהיר של Timeboost, יותר מ-6 מיליון דולר ב-2025, השנה הראשונה; (3) רישוי AEP, בהובלת Robinhood Chain (כ-360 אלף דולר ביולי 2026); (4) תשואה מניהול הקופה על סטייבלקוינים ואג״ח ממשלתיות בטוקניזציה, עם 125 מיליון דולר בנכסים שאינם ARB בסוף יוני 2026. סך הכול: כ-23.5 מיליון דולר הכנסות ברוטו ב-2025; ‏6.19 מיליון דולר במחצית הראשונה של 2026, עם רווח גולמי מעל 97%. הדוח הלא מבוקר של הקרן מוסר את הסך למחצית הראשונה; לציטוט חלוקה מדויקת לפי מקור יש להפנות לדוח עצמו.",
        },
        {
          en: "Metrics versus price: the live chart below indexes ARB price, DeFi TVL and stablecoin supply on Arbitrum to 100 at the start of the last year, so their paths can be compared directly. The pattern documented across sources: stablecoins and RWAs on Arbitrum grew (the Foundation reported stablecoin supply up about 80% year on year in 2025 and more than $800M of RWAs), while ARB fell from its January 2024 high of about $2.39 to about $0.17 by late October 2026. Conclusion: adoption and token value have decoupled, consistent with a token that has no direct claim on revenue and with ongoing unlocks.",
          he: "מדדים מול מחיר: הגרף החי למטה מנרמל את מחיר ARB, ה-TVL של DeFi והיצע הסטייבלקוינים ב-Arbitrum ל-100 בתחילת השנה האחרונה, כך שאפשר להשוות את המסלולים ישירות. הדפוס שמתועד במקורות: הסטייבלקוינים ונכסי ה-RWA ב-Arbitrum גדלו (הקרן דיווחה על עלייה של כ-80% בהיצע הסטייבלקוינים בשנה ב-2025 ועל יותר מ-800 מיליון דולר ב-RWA), בעוד ש-ARB ירד מהשיא של כ-2.39 דולר בינואר 2024 לכ-0.17 דולר בסוף אוקטובר 2026. מסקנה: האימוץ וערך הטוקן התנתקו זה מזה, בהתאם לטוקן שאין לו זכות ישירה בהכנסות ולפתיחת נעילות מתמשכת.",
        },
      ],
      live: ["trend", "fees", "stablecoins", "market"],
      sources: [SRC.h1Revenue2026, SRC.transparency2025, SRC.timeboostFees, SRC.robinhoodFactsheet, SRC.defillamaChain, SRC.growthepie, SRC.coingecko],
    },
  ],
};
