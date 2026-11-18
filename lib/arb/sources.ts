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
    label: "Arbitrum docs: PGA (Priority Gas Auctions), successor to Timeboost",
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
    label: "ETHBEAT (formerly L2BEAT): Arbitrum One",
    url: "https://ethbeat.org/scaling/projects/arbitrum",
  },
  l2beatApi: {
    label: "ETHBEAT (formerly L2BEAT) scaling summary API",
    url: "https://ethbeat.org/api/scaling/summary",
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
    label: "Arbitrum on-chain governance portal (replaced Tally in 2026)",
    url: "https://alt.gov.arbitrum.foundation",
  },
  snapshot: {
    label: "Snapshot: Arbitrum DAO temperature checks",
    url: "https://snapshot.org/#/arbitrumfoundation.eth",
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
    label: "Forum: The Arbitrum Foundation H1 2026 Progress Update",
    url: "https://forum.arbitrum.foundation/t/the-arbitrum-foundation-h1-2026-progress-update/31378",
  },
  robinhoodJuly: {
    label: "The Block via KuCoin: Robinhood Chain drives 35% of July 2026 DAO revenue",
    url: "https://www.kucoin.com/news/flash/arbitrum-posts-6-2m-in-h1-2026-income-robinhood-chain-drives-35-revenue",
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
    label: "Forum: Security Council Emergency Action 2-10-2026 (Stylus pause, BoLD guard)",
    url: "https://forum.arbitrum.foundation/t/security-council-emergency-action-2-10-2026/31530",
  },
  stylusResume: {
    label: "Forum: [Constitutional] AIP: Stylus Activation Contract",
    url: "https://forum.arbitrum.foundation/t/constitutional-aip-stylus-activation-contract/31605",
  },
  pgaAip: {
    label: "Forum: [Constitutional] AIP: Transition Arbitrum One ordering policy to PGA",
    url: "https://forum.arbitrum.foundation/t/constitutional-aip-transition-arbitrum-one-ordering-policy-to-priority-gas-auctions-pga/30942",
  },
  fastFeedAip: {
    label: "Forum: [Constitutional] AIP Fast Feed",
    url: "https://forum.arbitrum.foundation/t/constitutional-aip-fast-feed/31003",
  },
  timeboostAip: {
    label: "Forum: Constitutional AIP to adopt Timeboost (2024)",
    url: "https://forum.arbitrum.foundation/t/constitutional-aip-proposal-to-adopt-timeboost-a-new-transaction-ordering-policy/25167",
  },
  votesNov2026: {
    label: "Forum: 11 November 2026 roundup of active and upcoming votes",
    url: "https://forum.arbitrum.foundation/t/11-november-2026-roundup-of-active-upcoming-votes/31691",
  },
  ethTransfer: {
    label: "Forum: Transfer 1,800 ETH to the Developer Guild and ATMC (Timeboost and PGA revenue)",
    url: "https://forum.arbitrum.foundation/t/transfer-1-800-eth-from-the-treasury-to-the-arbitrum-developer-guild-atmcs-eth-treasury-strategies/31557",
  },
  usdgInitiative: {
    label: "Forum: Adopting USDG as a Core Strategic Initiative for the ArbitrumDAO",
    url: "https://forum.arbitrum.foundation/t/adopting-usdg-as-a-core-strategic-initiative-for-the-arbitrumdao/31548",
  },
  kelpFreeze: {
    label: "Forum: Security Council Emergency Action 21-04-2026 (KelpDAO exploiter)",
    url: "https://forum.arbitrum.foundation/t/security-council-emergency-action-21-04-2026/30803",
  },
  kelpRelease: {
    label: "Forum: [Constitutional] AIP: Approve Release of Frozen ETH (KelpDAO)",
    url: "https://forum.arbitrum.foundation/t/constitutional-aip-approve-release-of-frozen-eth/30825",
  },
  binanceRelease: {
    label: "Forum: [Constitutional] AIP: Approve Release of Frozen ETH and ARB (Binance)",
    url: "https://forum.arbitrum.foundation/t/constitutional-aip-approve-release-of-frozen-eth-and-arb/31655",
  },
  arbUtility: {
    label: "Forum: From Governance Token to Utility Token: Evolving ARB Beyond Governance",
    url: "https://forum.arbitrum.foundation/t/from-governance-token-to-utility-token-evolving-arb-beyond-governance/30192",
  },
  studentThread: {
    label: "Forum: research questions from a blockchain course student (Oct 2026)",
    url: "https://forum.arbitrum.foundation/t/reaserch-questions-blockchain-course-focusing-on-how-decentralized-arbitrum-really-is-in-practice/31590",
  },
  outage2021: {
    label: "Offchain Labs: Arbitrum One outage report (Sep 2021)",
    url: "https://medium.com/offchainlabs/arbitrum-one-outage-report-d365b24d49c",
  },
  outage2022: {
    label: "Cointelegraph: Arbitrum network suffers outage due to hardware failure (Jan 2022)",
    url: "https://cointelegraph.com/news/arbitrum-network-suffers-minor-outage-due-to-hardware-failure",
  },
  outage2023: {
    label: "The Block: inscriptions surge caused Arbitrum outage (Dec 2023)",
    url: "https://www.theblock.co/post/267950/",
  },
  hyperliquidBridge: {
    label: "Bitquery: Hyperliquid bridge deposits and withdrawals on Arbitrum",
    url: "https://bitquery.io/investigations/hyperliquid-bridge-ledger",
  },
  stablesFall: {
    label: "Crypto Adventure: Arbitrum stablecoin supply falls from $7.7B to $4.4B since May",
    url: "https://cryptoadventure.com/arbitrum-stablecoin-supply-falls-from-7-7b-to-4-4b-since-may/",
  },
  defillamaStables: {
    label: "DefiLlama: stablecoins on Arbitrum",
    url: "https://defillama.com/stablecoins/Arbitrum",
  },
  usenix2018: {
    label: "USENIX Security 2018: Arbitrum: Scalable, private smart contracts",
    url: "https://www.usenix.org/conference/usenixsecurity18/presentation/kalodner",
  },
  offchainGit: {
    label: "git history: OffchainLabs repositories",
    url: "https://github.com/OffchainLabs",
  },
  scElection2026: {
    label: "Forum: March 2026 Security Council Elections, Complete",
    url: "https://forum.arbitrum.foundation/t/march-2026-security-council-elections-complete/30909",
  },
  scKeyRotation: {
    label: "Forum: Non-emergency key rotation of the Security Council, July 2026",
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
