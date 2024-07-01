import Image from "next/image";
import Link from "next/link";

import { links } from "../data";

export function Footer({ shouldBeFixed = false }): JSX.Element {
  return (
    <footer
      className={`${shouldBeFixed && "fixed"} animate-fade-up animate-delay-700 bottom-0 w-full border-t border-white/20 bg-[#898989]/5 backdrop-blur-md`}
    >
      <div className="mx-auto max-w-screen-2xl">
        <div className="flex flex-col items-center justify-between gap-2 px-4 py-4 md:flex-row">
          <p className="hidden w-4/12 text-sm text-gray-400 lg:block">
            Making decentralized AI for everyone. For blockchain data{" "}
            <Link
              className="text-green-500 hover:underline"
              href="https://stats.communex.ai/"
            >
              visit explorer
            </Link>
            .
          </p>

          <div className="flex justify-center gap-6 md:w-4/12">
            {socialList.map((item) => (
              <Link
                className="text-subtitle leading-6 hover:text-gray-800 hover:underline"
                href={item.href}
                key={item.name}
              >
                {item.icon}
              </Link>
            ))}
          </div>

          <p className="flex justify-end text-sm text-gray-400 md:w-4/12">
            &copy; 2024 Commune, Inc. No rights reserved.
          </p>
        </div>
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
