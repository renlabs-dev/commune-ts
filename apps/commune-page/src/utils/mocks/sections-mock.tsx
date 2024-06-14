import {
  ShareIcon,
  SquaresPlusIcon,
  GlobeAltIcon,
  ServerStackIcon,
  CircleStackIcon,
  GiftTopIcon,
  ScaleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/20/solid";

export const sections = [
  {
    sectionName: "modular",
    title: "Modular",
    subtitle: "Composable architecture",
    iconSrc: "/reusability-icon.svg",
    features: [
      {
        description:
          "Commune supports a modular architecture that encourages code reuse, allowing developers to create self-contained modules that can be easily integrated into multiple projects. This enhances scalability and maintainability. ",
        icon: SquaresPlusIcon,
      },
      {
        description:
          "Commune facilitates the sharing and discovery of reusable modules among developers, enabling them to contribute their own modules and benefit from the shared pool of resources. ",
        icon: ShareIcon,
      },
    ],
  },
  {
    sectionName: "scalability",
    title: "Scalability",
    subtitle: "Parallelize Use cases ",
    iconSrc: "/scalability-icon.svg",
    features: [
      {
        description:
          "With a large number of specialized network sectors (subnets), the protocol ensures that every industry can be represented.",
        icon: ServerStackIcon,
      },
      {
        description: `The low entry cost and the protocol's landscape ensure that useful miners have incentive to participate, helping the network to grow.`,
        icon: GlobeAltIcon,
      },
    ],
  },
  {
    sectionName: "tokenomics",
    title: "Tokenomics",
    subtitle: "No Pre mine, Meritocratic Distribution",
    iconSrc: "/tokenomics-icon.svg",
    features: [
      {
        description:
          "Rewards are split 50% to miners (specialized APIs with off-chain architectures) and 50% to validators, validating the legitimacy of the miners.",
        icon: CircleStackIcon,
      },
      {
        description:
          "Rewards are distributed every 100 blocks, with a block time of 8 seconds.",
        icon: GiftTopIcon,
      },
    ],
  },
  {
    sectionName: "validators",
    title: "Validators",
    subtitle: `Managing protocol's incentives`,
    iconSrc: "/validators-icon.svg",
    features: [
      {
        description: `Validators have to evaluate miners at regular intervals, ensuring coverage of the entire network and updating for new projects.`,
        icon: ShieldCheckIcon,
      },
      {
        description: `Miner's prioritize serving Validators based on Stake and consensus, the more Stake the more weight on incentives.`,
        icon: ScaleIcon,
      },
    ],
  },
];
