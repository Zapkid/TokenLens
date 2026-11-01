import type { ArbSource } from "./types";

// One registry of cited sources. Primary sources (docs, forum, L2BEAT,
// DefiLlama, Tally) are preferred; secondary press is cited only where it
// reports a primary document the course asks about.

export const SRC = {
  docsOverview: {
    label: "Arbitrum docs: How Arbitrum works",
    url: "https://docs.arbitrum.io/how-arbitrum-works/inside-arbitrum-nitro",
  },
  docsBold: {
    label: "Arbitrum docs: BoLD gentle introduction",
    url: "https://docs.arbitrum.io/bold/bold-gentle-introduction",
  },
  docsStylus: {
    label: "Arbitrum docs: Stylus",
    url: "https://docs.arbitrum.io/stylus/gentle-introduction",
  },
  docsTimeboost: {
    label: "Arbitrum docs: Timeboost",
    url: "https://docs.arbitrum.io/how-arbitrum-works/timeboost/gentle-introduction",
  },
  docsArbos61: {
    label: "Arbitrum docs: ArbOS 61 upgrade notice",
    url: "https://docs.arbitrum.io/notices/arbos61-upgrade-notice",
  },
  docsArbos51: {
    label: "Arbitrum docs: ArbOS 51 upgrade notice",
    url: "https://docs.arbitrum.io/notices/arbos51-upgrade-notice",
  },
  foundationDocs: {
    label: "Arbitrum Foundation docs: What is the Foundation",
    url: "https://docs.arbitrum.foundation/what-foundation",
  },
  constitution: {
    label: "ArbitrumDAO Constitution",
    url: "https://docs.arbitrum.foundation/dao-constitution",
  },
  tokenomics: {
    label: "Arbitrum Foundation docs: ARB token distribution",
    url: "https://docs.arbitrum.foundation/airdrop-eligibility-distribution",
  },
  securityCouncilDocs: {
    label: "Arbitrum Foundation docs: Security Council",
    url: "https://docs.arbitrum.foundation/security-council",
  },
  aepDocs: {
    label: "Arbitrum Foundation docs: Arbitrum Expansion Program",
    url: "https://docs.arbitrum.foundation/aep/ArbitrumExpansionProgramTerms.pdf",
  },
  l2beat: {
    label: "L2BEAT: Arbitrum One",
    url: "https://l2beat.com/scaling/projects/arbitrum",
  },
  l2beatStages: {
    label: "L2BEAT forum: Stage 1 requirements update",
    url: "https://forum.l2beat.com/t/stage-1-requirements-update-security-council-walkaway-test/412",
  },
  defillamaChain: {
    label: "DefiLlama: Arbitrum chain dashboard",
    url: "https://defillama.com/chain/arbitrum",
  },
  coingecko: {
    label: "CoinGecko: Arbitrum (ARB)",
    url: "https://www.coingecko.com/en/coins/arbitrum",
  },
  github: {
    label: "GitHub: OffchainLabs/nitro",
    url: "https://github.com/OffchainLabs/nitro",
  },
  arbiscan: {
    label: "Arbiscan block explorer",
    url: "https://arbiscan.io",
  },
  tally: {
    label: "Tally: Arbitrum DAO proposals",
    url: "https://www.tally.xyz/gov/arbitrum",
  },
  forum: {
    label: "Arbitrum DAO governance forum",
    url: "https://forum.arbitrum.foundation",
  },
  growthepie: {
    label: "growthepie: Arbitrum One",
    url: "https://www.growthepie.com/chains/arbitrum",
  },
  transparency2025: {
    label: "Arbitrum Foundation 2025 Transparency Report",
    url: "https://forum.arbitrum.foundation/t/the-arbitrum-foundation-2025-transparency-report-the-year-of-institutional-adoption/30660",
  },
  h1Revenue2026: {
    label: "The Block via KuCoin: Arbitrum DAO H1 2026 income $6.19M",
    url: "https://www.kucoin.com/news/flash/arbitrum-dao-revenue-hits-6-19m-in-h1-2026",
  },
  foundationFunding: {
    label: "Forum: Continued Funding for the Arbitrum Foundation",
    url: "https://forum.arbitrum.foundation/t/continued-funding-for-the-arbitrum-foundation/30908",
  },
  robinhoodFactsheet: {
    label: "ArbitrumDAO Factsheet: Robinhood Chain Mainnet Launch",
    url: "https://forum.arbitrum.foundation/t/arbitrumdao-factsheet-robinhood-chain-mainnet-launch/31041",
  },
  robinhoodTheBlock: {
    label: "The Block: Robinhood Chain goes live on mainnet",
    url: "https://www.theblock.co/post/406918/",
  },
  scFreeze: {
    label: "Forum: Security Council Emergency Action 30-10-2026",
    url: "https://forum.arbitrum.foundation/t/security-council-emergency-action-30-10-2026/31625",
  },
  stylusPause: {
    label: "CryptoBriefing: Arbitrum pauses new Stylus activations",
    url: "https://cryptobriefing.com/arbitrum-pauses-new-stylus-activations/",
  },
  scElection2026: {
    label: "Forum: March 2026 Security Council Elections, Complete",
    url: "https://forum.arbitrum.foundation/t/march-2026-security-council-elections-complete/30909",
  },
  scKeyRotation: {
    label: "Forum: Security Council Key Rotation, July 2026",
    url: "https://forum.arbitrum.foundation/t/key-rotation-july-2026/31081",
  },
  dvpQuorum: {
    label: "Forum: [Constitutional] DVP Quorum for ArbitrumDAO",
    url: "https://forum.arbitrum.foundation/t/constitutional-dvp-quorum-for-arbitrumdao-implementation-parameters/30484",
  },
  quorumReduction: {
    label: "Forum: Constitutional Quorum Threshold Reduction",
    url: "https://forum.arbitrum.foundation/t/constitutional-aip-constitutional-quorum-threshold-reduction/29145",
  },
  curiaVotingPower: {
    label: "Forum: Analysis of Voting Power in Arbitrum DAO (Curia)",
    url: "https://forum.arbitrum.foundation/t/quantifying-decentralization-analysis-of-voting-power-in-arbitrum-dao-by-curialab/30161",
  },
  aip1Defiant: {
    label: "The Defiant: Arbitrum amends Foundation proposal after failed vote",
    url: "https://thedefiant.io/arbitrum-amends-foundation-proposal",
  },
  aip1Blockworks: {
    label: "Blockworks: Arbitrum walks back proposal, already used some of it",
    url: "https://blockworks.co/news/arbitrum-walks-back-proposal",
  },
  seriesB: {
    label: "Blockworks: Offchain Labs raises $120M",
    url: "https://blockworks.co/news/funding-news-offchain-labs-raises-120m-alpaca-secures-50m",
  },
  seed: {
    label: "Finance Magnates: Offchain Labs raises $3.7M seed",
    url: "https://www.financemagnates.com/cryptocurrency/news/pantera-backed-offchain-labs-raises-3-7-million-in-seed-capital",
  },
  unlocks: {
    label: "Tokenomics.com: Arbitrum unlock schedule",
    url: "https://app.tokenomics.com/tokenomics/arbitrum/unlocks",
  },
  timeboostFees: {
    label: "The Block: Timeboost generates $2M in fees within three months",
    url: "https://www.theblock.co/post/361058/arbitrum-timeboost-fees",
  },
  usdgVote: {
    label: "TokenPost: ArbitrumDAO opens vote on 100M ARB for USDG",
    url: "https://www.tokenpost.com/news/business/43677",
  },
  arbPriceOct: {
    label: "CoinStats: Why ARB is down (26 Oct 2026)",
    url: "https://coinstats.app/news/de8da24cba9f8fe56245d231f45cad4fc9067db1162ce90d375e7a84532edfe3_Arbitrum-ARB-News-Today-Why-ARB-Is-Down--26-October-2026/",
  },
  sepoliaFaucet: {
    label: "Arbitrum docs: Testnet faucets and Arbitrum Sepolia",
    url: "https://docs.arbitrum.io/for-devs/dev-tools-and-resources/chain-info",
  },
  bridge: {
    label: "Arbitrum Bridge",
    url: "https://bridge.arbitrum.io",
  },
} satisfies Record<string, ArbSource>;
