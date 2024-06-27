import Image from "next/image";
import Link from "next/link";

import { cn } from "..";
import { links } from "../data";

export function Footer(): JSX.Element {
  return (
    <footer
      className={cn(
        "flex flex-col border-t border-white/20 bg-[#898989]/5 backdrop-blur-md",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-screen-2xl flex-col items-center justify-between gap-6 p-6 lg:flex-row lg:gap-0",
        )}
      >
        <p
          className={cn(
            "hidden text-left text-sm leading-5 text-gray-400 lg:block",
          )}
        >
          Making decentralized AI for everyone. For blockchain data{" "}
          <Link
            className="text-green-500 hover:underline"
            href={"https://stats.communex.ai/"}
          >
            visit explorer
          </Link>
          .
        </p>
        <div className={cn("flex space-x-5 px-4")}>
          {socialList.map((item) => (
            <Link
              className={cn(
                "text-subtitle leading-6 hover:text-gray-800 hover:underline",
              )}
              href={item.href}
              key={item.name}
            >
              {item.icon}
            </Link>
          ))}
        </div>

        <p className={cn("text-center text-sm leading-5 text-gray-400")}>
          &copy; 2024 Commune, Inc. No rights reserved.
        </p>
      </div>
    </footer>
  );
}

const socialList = [
  {
    name: "Discord",
    href: links.discord,
    icon: (
      <Image
        alt="Discord icon"
        height={26}
        src="/discord-icon.svg"
        width={26}
      />
    ),
  },
  {
    name: "X",
    href: links.x,
    icon: <Image alt="X icon" height={22} src="/x-icon.svg" width={22} />,
  },
  {
    name: "GitHub",
    href: links.github,
    icon: (
      <Image alt="Github icon" height={23} src="/github-icon.svg" width={23} />
    ),
  },
  {
    name: "Telegram",
    href: links.telegram,
    icon: (
      <Image
        alt="Telegram icon"
        height={22}
        src="/telegram-icon.svg"
        width={22}
      />
    ),
  },
];
