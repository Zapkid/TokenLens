// Content model for the /arb course project page (Blockchain Expert final
// project, Arbitrum track). Every user-facing string is bilingual so the
// page, the markdown rendition, and the Word export all render from the
// same source of truth.

export type ArbLang = "en" | "he";

export interface Bi {
  en: string;
  he: string;
}

export interface ArbSource {
  label: string;
  url: string;
}

/**
 * fact: answered from verifiable sources.
 * analysis: a reasoned position built on the cited facts (the student must
 *   be able to defend it in the interview).
 * personal: requires the student's own participation, screenshots, or
 *   decision; the page gives guidance and a draft, never a fabricated
 *   experience.
 */
export type ArbAnswerKind = "fact" | "analysis" | "personal";

/** Live metric slots a question can embed (rendered from /api/arb). */
export type ArbLiveSlot =
  | "market"
  | "supply"
  | "tvl"
  | "stablecoins"
  | "fees"
  | "github"
  | "chains"
  | "l2beat"
  | "trend";

export interface ArbQuestion {
  /** Course numbering, e.g. "1.1" or "B.3". */
  id: string;
  title: Bi;
  /** The course's question text (Hebrew original, English translation). */
  prompt: Bi;
  kind: ArbAnswerKind;
  /** Answer paragraphs, in order. */
  answer: Bi[];
  live?: ArbLiveSlot[];
  sources: ArbSource[];
}

export interface ArbChapter {
  id: string;
  part: "A" | "B";
  title: Bi;
  questions: ArbQuestion[];
}

export interface ArbKeyFact {
  label: Bi;
  value: Bi;
  source: ArbSource;
  verification: ArbVerification;
}

/**
 * How a static fact was verified on the research date.
 * primary: read in the primary source itself (docs, forum post, explorer,
 *   ETHBEAT, DefiLlama, CoinGecko, git history).
 * secondary: reported by press or aggregators citing a primary source that
 *   could not be opened directly.
 * derived: computed from verified figures (the note says how).
 * conflicting: sources disagree; the note says which value is used.
 */
export type ArbVerificationStatus = "primary" | "secondary" | "derived" | "conflicting";

export interface ArbVerification {
  status: ArbVerificationStatus;
  /** ISO date the fact was checked. */
  checkedOn: string;
  note?: Bi;
}

export type ArbHistoryCategory =
  | "research"
  | "launch"
  | "upgrade"
  | "governance"
  | "funding"
  | "partnership"
  | "security"
  | "market";

export interface ArbEra {
  id: string;
  title: Bi;
  summary: Bi;
  /** Inclusive ISO date range. */
  from: string;
  to: string;
}

export interface ArbHistoryEvent {
  id: string;
  /** "YYYY", "YYYY-MM" or "YYYY-MM-DD"; precision is shown as given. */
  date: string;
  category: ArbHistoryCategory;
  title: Bi;
  detail: Bi;
  /** Why it mattered for the chain as it is today. */
  impact: Bi;
  source: ArbSource;
  verification: ArbVerification;
  /** One of the 5 to 7 events used to answer course question 2.1. */
  core?: boolean;
  /** Course questions this event helps answer. */
  questions?: string[];
}

export type ArbRoadmapStatus = "done" | "voting" | "next" | "longterm";

export interface ArbRoadmapItem {
  id: string;
  status: ArbRoadmapStatus;
  when: Bi;
  title: Bi;
  detail: Bi;
  source: ArbSource;
  verification: ArbVerification;
}

export interface ArbGlossaryTerm {
  id: string;
  term: Bi;
  definition: Bi;
  questions: string[];
}

export interface ArbPracticeCard {
  id: string;
  question: Bi;
  answer: Bi;
  /** Course question it prepares for. */
  relates: string;
}

export interface ArbStep {
  id: string;
  phase: Bi;
  title: Bi;
  detail: Bi;
  /** Suggested target date (ISO). */
  due?: string;
  link?: ArbSource;
}
