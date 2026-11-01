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
  | "competitors"
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

export interface ArbTimelineEvent {
  date: string;
  category: Bi;
  title: Bi;
  detail: Bi;
  source: ArbSource;
}

export interface ArbKeyFact {
  label: Bi;
  value: Bi;
  source: ArbSource;
}
