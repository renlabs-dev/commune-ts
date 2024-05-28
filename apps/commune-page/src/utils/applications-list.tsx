import { links } from "@repo/ui/data";
import Image from "next/image";

export const applicationsList = [
  {
    title: "Governance",
    description: "Community Proposals",
    href: links.governance,
    icon: (
      <Image
        src={"/governance-icon.svg"}
        alt="Governance icon"
        width={75}
        height={75}
        className="mb-5 w-10"
      />
    ),
  },
  {
    title: "Docs",
    description: "Dev Documentation",
    href: links.docs,
    icon: (
      <Image
        src={"/docs-icon.svg"}
        alt="Docs icon"
        width={75}
        height={75}
        className="mb-5 w-10"
      />
    ),
  },
  {
    title: "Blog",
    target: "_blank",
    description: "View recent updates",
    href: links.blog,
    icon: (
      <Image
        src={"/updates-icon.svg"}
        alt="Updates icon"
        width={75}
        height={75}
        className="mb-5 w-10"
      />
    ),
  },
  {
    title: "Join Community",
    description: null,
    href: links.discord,
    icon: (
      <Image
        src={"/community-icon.svg"}
        alt="Community icon"
        width={75}
        height={75}
        className="mb-5 w-10"
      />
    ),
  },
];
