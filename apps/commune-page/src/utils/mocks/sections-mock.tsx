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
          "Commune follows a modular, reusable and minimal architecture philosophy, able to quickly add, adapt and compose parts of the system on the fly.",
        icon: SquaresPlusIcon,
      },
      {
        description:
          "Commune assumes to be continually innovated and build upon through the DAO, making a scalable and robust architecture a foundational requirement.",
        icon: ShareIcon,
      },
    ],
  },

  {
    sectionName: "parallel",
    title: "Parallel",
    subtitle: "Horizontal scaling",
    iconSrc: "/scalability-icon.svg",
    features: [
      {
        description:
          "Subnets and other economic applications run and scale in parallel, allowing to host highly specialized and complimentary mechanisms.",
        icon: ServerStackIcon,
      },
    ],
  },
  {
    sectionName: "offchain",
    title: "Offchain",
    subtitle: "Any mechanism on any compute",
    iconSrc: "/scalability-icon.svg",
    features: [
      {
        description:
          "The blockchain is only responsible for the economic information. all mechanisms and applications build on Commune run offchain without constraints.",
        icon: ServerStackIcon,
      },
      {
        description: `This allows subnets and applications to be arbitrarily complex and computationally expensive, without facing blockchain limitations.`,
        icon: GlobeAltIcon,
      },
    ],
  },
  {
    sectionName: "decentralized",
    title: "Decentralized",
    subtitle: "Any mechanism on any compute",
    iconSrc: "/scalability-icon.svg",
    features: [
      {
        description:
          "All changes to Commune are decided collectively by the DAO. No central authority has full control over the Protocol.",
        icon: ServerStackIcon,
      },
      {
        description: `DAO participation is incentivized to motivate holders to take part in deciding their destiny.`,
        icon: GlobeAltIcon,
      },
    ],
  },
  {
    sectionName: "bottomup",
    title: "Bottom up",
    subtitle: "Any mechanism on any compute",
    iconSrc: "/scalability-icon.svg",
    features: [
      {
        description:
          "There was never any bureaucracy or rigid hierarchy, Commune was birthed out of cypherpunk ideals.",
        icon: ServerStackIcon,
      },
      {
        description: `Anyone can become a core contributor and grow to wield big impact. Ideas efficiently rise from the bottom up to implementation. `,
        icon: GlobeAltIcon,
      },
    ],
  },
  {
    sectionName: "tokenomics",
    title: "Tokenomics",
    subtitle: "No Premine, Meritocratic Distribution",
    iconSrc: "/tokenomics-icon.svg",
    features: [
      {
        description:
          "Commune is continuously optimizing the allocation of emissions to create positive sum competitions.",
        icon: CircleStackIcon,
      },
      {
        description:
          "The current standard framework is a 50/50 reward split between miners and validators. miners compete to optimize or solve what validators define. validators evaluate the performance of miners.",
        icon: GiftTopIcon,
      },
      {
        description:
          "Rewards are distributed every 100 blocks, with a block time of 8 seconds.",
        icon: GiftTopIcon,
      },
    ],
  },
];
