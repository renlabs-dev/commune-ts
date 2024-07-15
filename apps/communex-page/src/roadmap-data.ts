interface RoadmapItem {
  date: "past" | "current" | "future";
  description: string;
  steps: string[];
}

export type RoadmapDataType = Record<string, RoadmapItem>;

export const roadmapData: RoadmapDataType = {
  "Q4 2023": {
    date: "past",
    description: "Laying the Foundation",
    steps: [
      "Full-time dedicated to the development of the CommuneX library & client in october 2023",
    ],
  },
  "Q1 2024": {
    date: "past",
    description: "Building the Core",
    steps: [
      "Released the first production ready version of CommuneX + docs",
      "Started operating our own chain infrastructure and made it public",
      "Resolved multiple complicated chain bugs in collaboration with fam",
    ],
  },
  "Q2 2024": {
    date: "past",
    description: "Building on the Foundation",
    steps: [
      "Build the DAO and governance portal, allowing fam to decentralize the control of Commune",
      "Proposed and delivered the incentives v1 update, implementing Yuma Consensus",
      "Launched the Synthia subnet and dataset",
      "Took responsibility and started an ongoing refactor of the blockchain code",
      "Released Commune docs",
      "Released the new communeai.org web design",
      "Proposed and delivered the DAO treasury update",
      "Released the stats.communex.ai explorer",
      "Released a non-custodial wallet with freedom of delegation",
      "Proposed the global stake update",
    ],
  },
  "Q3 2024": {
    date: "current",
    description: "Current Focus",
    steps: [
      "Delivered the global stake update",
      "Released the stCOMM LSD and bridge",
    ],
  },
  "Q4 2024": {
    date: "future",
    description: "TBD",
    steps: [
      "Community Validator",
      "Mojuru update",
      "Offchain subnet pricing",
      "Brute force growth",
      "Incentivized bizdev/marketing",
      "Move blockchain to PoS",
    ],
  },
};
