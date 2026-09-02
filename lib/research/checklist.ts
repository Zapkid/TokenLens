// The guided fundamental research checklist, adapted in English from the BDCC
// (Blockchain and Digital Currencies College) fundamental research and coin
// analysis checklist. Three stages: first impression, deep research, summary.
// This module is the catalog plus pure rollup math. It must stay
// dependency-light: UI, storage, and tests all import from here.

export type ChecklistStage = 1 | 2;

export type ChecklistScore = 1 | 2 | 3 | 4 | 5;

export interface ChecklistItem {
  /** Stable key. Persisted answers are stored under it, never rename lightly. */
  key: string;
  label: string;
  /** Extra guidance shown under the label. */
  hint?: string;
  /**
   * Keys of report metrics this item can be pre-filled from. Items with an
   * autofill stay manual whenever the report lacks the metric.
   */
  autofill?: boolean;
}

export interface ChecklistSection {
  key: string;
  label: string;
  stage: ChecklistStage;
  items: ChecklistItem[];
}

export const STAGE_LABELS: Record<ChecklistStage, string> = {
  1: "Stage 1: first impression",
  2: "Stage 2: deep research",
};

/** Answer for one item: a 1-5 score and a free-text note, both optional. */
export interface ResearchAnswer {
  score?: ChecklistScore;
  note?: string;
}

/** Everything the user recorded for one asset. */
export interface ResearchRecord {
  updatedAt: string;
  answers: Record<string, ResearchAnswer>;
}

/** An answer derived from report data: display text plus a suggested score. */
export interface AutoAnswer {
  /** Human readable derived value, e.g. "$4.2B" or "128 commits in 4 weeks". */
  display: string;
  /** Suggested 1-5 score. Null when the value is informational only. */
  suggested: ChecklistScore | null;
  /** Where the value came from, shown so the proxy is always labeled. */
  basis: string;
}

export const CHECKLIST: ChecklistSection[] = [
  {
    key: "dryData",
    label: "Dry data",
    stage: 1,
    items: [
      { key: "marketCap", label: "Market cap at research time", autofill: true },
      { key: "ticker", label: "Symbol (ticker)", autofill: true },
      { key: "circulatingSupply", label: "Circulating supply", autofill: true },
      {
        key: "maxSupply",
        label: "Max supply",
        hint: "A hard cap limits future dilution. No cap means the issuance policy needs review.",
        autofill: true,
      },
      {
        key: "volumeShare",
        label: "24h volume as a share of market cap",
        hint: "Healthy turnover signals real trading interest, not a stale listing.",
        autofill: true,
      },
      {
        key: "tokenOrCoin",
        label: "Token or native coin",
        hint: "If it is a token, is there a plan to migrate to its own chain?",
        autofill: true,
      },
      { key: "launchDate", label: "Launch date" },
      {
        key: "athDistance",
        label: "All time high and current distance from it",
        autofill: true,
      },
      { key: "lastLow", label: "Last major low: price and date" },
      { key: "exchanges", label: "Which exchanges list it?" },
    ],
  },
  {
    key: "website",
    label: "Official website review",
    stage: 1,
    items: [
      { key: "siteUrl", label: "Website address" },
      { key: "sitePolish", label: "Does the site look invested and error free?" },
      { key: "siteUx", label: "Is browsing comfortable and fast?" },
      { key: "branding", label: "How much was invested in branding?" },
      { key: "languages", label: "Is there foreign language support?" },
      {
        key: "socialBreadth",
        label: "Does the project cover a range of social networks and stay active on them?",
      },
      {
        key: "docsQuality",
        label: "Are the project documents available, clear, and comprehensive?",
      },
      { key: "faqPage", label: "Is there a questions and answers page?" },
    ],
  },
  {
    key: "project",
    label: "The project",
    stage: 1,
    items: [
      { key: "goals", label: "What are its goals?" },
      { key: "solution", label: "What solution does it offer?" },
      { key: "workingProducts", label: "Are there products or services already working?" },
      { key: "targetIndustries", label: "Which industries does the project target?" },
    ],
  },
  {
    key: "team",
    label: "The team",
    stage: 1,
    items: [
      { key: "founders", label: "Who are the founders and what is their background?" },
      { key: "keyMembers", label: "Are there other important team members?" },
      { key: "advisors", label: "Who advises the project?" },
      {
        key: "foundersSocial",
        label: "Are the founders active on social networks with a high follower count?",
      },
      {
        key: "mediaMentions",
        label: "Are there media mentions of the team?",
        hint: "If yes: are the sites credible, and is the content organic or sponsored?",
      },
    ],
  },
  {
    key: "funding",
    label: "Partnerships and fundraising",
    stage: 1,
    items: [
      {
        key: "raisedUsd",
        label: "How much was raised in USD terms?",
        hint: "If there were several rounds, note each one.",
      },
      {
        key: "raisedCrypto",
        label: "How much was raised in BTC or ETH terms at the time of the raise?",
      },
      {
        key: "raiseType",
        label: "How was the raise done?",
        hint: "Private or public? Did large investment funds participate?",
      },
      {
        key: "cryptoPartners",
        label: "Does the project collaborate with other crypto projects?",
      },
      {
        key: "traditionalPartners",
        label: "Does the project collaborate with recognized traditional companies?",
      },
    ],
  },
  {
    key: "community",
    label: "Community",
    stage: 1,
    items: [
      {
        key: "socialReach",
        label: "Follower counts: Twitter, Telegram, Facebook, Reddit",
      },
      { key: "blogCadence", label: "Is there a blog, and how often is it updated?" },
      { key: "nodeCount", label: "How many nodes run the software?" },
      { key: "activeWallets", label: "Active wallets over the last 3 months" },
      { key: "communityEngagement", label: "How engaged is the community?" },
      {
        key: "teamCommunityRelations",
        label: "What is the relationship between the team and the community?",
      },
    ],
  },
  {
    key: "whitepaper",
    label: "The whitepaper",
    stage: 2,
    items: [
      { key: "consensus", label: "What is the consensus mechanism?" },
      { key: "audience", label: "Who is the target audience of the project?" },
      { key: "techClarity", label: "How do the consensus mechanism and technology work?" },
      {
        key: "forkOrigin",
        label: "Is it a fork of another coin?",
        hint: "If yes, what are the differences from the original?",
      },
    ],
  },
  {
    key: "tokenomics",
    label: "Token economics",
    stage: 2,
    items: [
      {
        key: "issuance",
        label: "How are new coins created, and at what rate?",
      },
      { key: "utility", label: "What is the coin used for?" },
      {
        key: "dilution",
        label: "How much of the fully diluted supply is not yet circulating?",
        hint: "The MC to FDV gap approximates unlock overhang.",
        autofill: true,
      },
    ],
  },
  {
    key: "redFlags",
    label: "Warning signs",
    stage: 2,
    items: [
      {
        key: "paperTone",
        label: "Is the whitepaper marketing and branding, or academic?",
        hint: "Score 5 when it reads like research, 1 when it reads like an ad.",
      },
      {
        key: "promisedReturns",
        label: "Is any return promised?",
        hint: "Promised returns are a serious red flag. Score 5 for none, 1 for explicit promises.",
      },
      {
        key: "affiliateModel",
        label: "Is there an affiliate marketing model?",
        hint: "Score 5 for none, 1 for a recruitment-driven model.",
      },
    ],
  },
  {
    key: "legal",
    label: "Legal",
    stage: 2,
    items: [
      { key: "entityType", label: "Is it a company or a nonprofit?" },
      { key: "jurisdiction", label: "Which jurisdiction is the entity located in?" },
      { key: "regulatoryStatus", label: "What is the regulatory status of the project?" },
      { key: "usInvestors", label: "Did the project raise money from US investors?" },
    ],
  },
  {
    key: "roadmap",
    label: "Milestones and future roadmap",
    stage: 2,
    items: [
      {
        key: "pastMilestones",
        label: "What important milestones has the project passed so far?",
        hint: "Product launches, fundraising, key hires, major collaborations.",
      },
      {
        key: "timelineAdherence",
        label: "Did the team meet its milestone timelines?",
        hint: "Compare against past roadmaps and media coverage.",
      },
      {
        key: "upcoming",
        label: "What big items are expected in the next 1-2 years?",
      },
      { key: "roadmapCadence", label: "How often is the roadmap updated?" },
    ],
  },
  {
    key: "github",
    label: "GitHub and the open source code",
    stage: 2,
    items: [
      {
        key: "commitActivity",
        label: "How many code pushes were there, and how frequently?",
        autofill: true,
      },
      {
        key: "contributorCount",
        label: "How many people contribute code?",
        autofill: true,
      },
      {
        key: "prIssueActivity",
        label: "Pull request, issue, wiki, and comment activity and frequency",
      },
      { key: "repoStructure", label: "How many repositories exist, and since when?" },
      {
        key: "githubVsPeers",
        label: "How does GitHub activity compare to other projects?",
      },
    ],
  },
  {
    key: "industry",
    label: "The industry and the market",
    stage: 2,
    items: [
      { key: "industryFocus", label: "Which industry does the project aim at?" },
      { key: "industrySize", label: "How big is the industry in market value terms?" },
      {
        key: "growthPotential",
        label: "What is the growth potential of the project?",
        hint: "Estimate the upside at 20, 40, and 60 percent market share.",
      },
      { key: "entryBarriers", label: "What are the barriers to entry in the industry?" },
      {
        key: "ecosystemBreadth",
        label: "How broad is the on-chain ecosystem?",
        hint: "Chains only: protocols building on the network, from DeFiLlama.",
        autofill: true,
      },
      {
        key: "networkEconomics",
        label: "Does the network earn meaningful fees?",
        hint: "Chains only: 24h fee level, from DeFiLlama.",
        autofill: true,
      },
    ],
  },
  {
    key: "competition",
    label: "The competition",
    stage: 2,
    items: [
      {
        key: "traditionalCompetitors",
        label: "Who are the big competitors from the traditional industry?",
      },
      {
        key: "traditionalEdge",
        label: "What are the project's advantages and disadvantages against them?",
      },
      {
        key: "cryptoCompetitors",
        label: "Who are the big competitors from the crypto industry?",
      },
      {
        key: "cryptoEdge",
        label: "What are the project's advantages and disadvantages against them?",
      },
    ],
  },
  {
    key: "products",
    label: "The products, if any",
    stage: 2,
    items: [
      { key: "webWalletUx", label: "How is the web wallet experience?" },
      { key: "mobileWalletUx", label: "How is the mobile wallet experience?" },
      {
        key: "onlineReviews",
        label: "What do online reviews say about the project and its products?",
      },
      { key: "transferSpeedFees", label: "Network transfer speed and fee levels" },
      { key: "dappUx", label: "How is the experience of using decentralized apps?" },
    ],
  },
];

/** Threshold on the stage 1 average that justifies continuing to deep research. */
export const STAGE1_GATE_THRESHOLD = 3;

export type GateVerdict = "proceed" | "stop" | "insufficient";

export interface SectionSummary {
  key: string;
  label: string;
  stage: ChecklistStage;
  /** Average of answered scores, 1 decimal. Null with no answers. */
  score: number | null;
  answered: number;
  total: number;
}

export interface ChecklistSummary {
  sections: SectionSummary[];
  /** Average of section scores that have answers, 1 decimal. */
  overall: number | null;
  answered: number;
  total: number;
  /** Stage 1 average and whether it justifies deep research. */
  stage1Score: number | null;
  gate: GateVerdict;
}

function round1(x: number): number {
  return Math.round(x * 10) / 10;
}

/**
 * The effective 1-5 score of an item: the user's manual score when set,
 * otherwise the suggested score from the auto answer, otherwise null.
 */
export function effectiveScore(
  item: ChecklistItem,
  answer: ResearchAnswer | undefined,
  auto: AutoAnswer | undefined,
): number | null {
  if (answer?.score) return answer.score;
  if (auto && auto.suggested !== null) return auto.suggested;
  return null;
}

/** Roll answers and auto suggestions up into the stage 3 summary. */
export function summarizeChecklist(
  answers: Record<string, ResearchAnswer>,
  autoAnswers: Record<string, AutoAnswer>,
): ChecklistSummary {
  const sections: SectionSummary[] = CHECKLIST.map((section) => {
    const scores = section.items
      .map((item) => effectiveScore(item, answers[item.key], autoAnswers[item.key]))
      .filter((s): s is number => s !== null);
    return {
      key: section.key,
      label: section.label,
      stage: section.stage,
      score: scores.length > 0 ? round1(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
      answered: scores.length,
      total: section.items.length,
    };
  });

  const scored = sections.filter((s) => s.score !== null);
  const overall =
    scored.length > 0
      ? round1(scored.reduce((a, s) => a + (s.score ?? 0), 0) / scored.length)
      : null;

  const stage1Scored = sections.filter((s) => s.stage === 1 && s.score !== null);
  const stage1Score =
    stage1Scored.length > 0
      ? round1(stage1Scored.reduce((a, s) => a + (s.score ?? 0), 0) / stage1Scored.length)
      : null;

  // The gate needs a real read on stage 1: at least half of its sections scored.
  const stage1Total = sections.filter((s) => s.stage === 1).length;
  const gate: GateVerdict =
    stage1Score === null || stage1Scored.length < Math.ceil(stage1Total / 2)
      ? "insufficient"
      : stage1Score >= STAGE1_GATE_THRESHOLD
        ? "proceed"
        : "stop";

  return {
    sections,
    overall,
    answered: sections.reduce((a, s) => a + s.answered, 0),
    total: sections.reduce((a, s) => a + s.total, 0),
    stage1Score,
    gate,
  };
}

export const GATE_LABELS: Record<GateVerdict, string> = {
  proceed: "First impression justifies deep research",
  stop: "First impression does not yet justify deep research",
  insufficient: "Score more of stage 1 to unlock the gate verdict",
};

/** Storage key for one asset's research record. */
export function researchKey(type: string, id: string): string {
  return `${type}:${id}`;
}
