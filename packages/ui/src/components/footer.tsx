import Image from "next/image";
import Link from "next/link";

import { cn } from "..";
import { links } from "../data";
import { handleDescription } from "./discord-widget";

interface FooterProps {
  applicationsList: {
    title: string;
    description: string | null;
    href: string;
    icon: JSX.Element;
  }[];
}

export function Footer(props: FooterProps): JSX.Element {
  return (
    <footer className={cn("flex flex-col")}>
      <div className={cn("px-4 lg:px-20")}>
        <div className={cn("mx-auto max-w-screen-2xl space-y-12")}>
          <div
            className={cn(
              "flex flex-col gap-6 pt-10 lg:flex-row lg:items-center lg:gap-16 lg:pt-20",
            )}
          >
            <div className={cn("space-y-5")}>
              <h3 className={cn("text-3xl text-white lg:text-5xl")}>
                Join the revolution of Incentive-driven Decentralized AI
              </h3>
            </div>
          </div>
          <div
            className={cn(
              "flex flex-col justify-between space-y-4 pb-10 lg:flex-row lg:space-x-4 lg:space-y-0 lg:pb-20",
            )}
          >
            {props.applicationsList.map((app) => {
              return (
                <Link
                  className={cn(
                    "w-full border border-gray-500 bg-black/50 p-8 text-gray-400 transition duration-200 hover:bg-green-950/15 hover:text-gray-300",
                  )}
                  href={app.href}
                  key={app.title}
                >
                  <div className={cn("flex items-center justify-between")}>
                    <div>
                      <p className={cn("text-white")}>{app.title}</p>
                    </div>
                    <Image
                      alt="link icon"
                      className={cn("w-12 border border-green-500 p-3")}
                      height={75}
                      src="/arrow-link-icon.svg"
                      width={75}
                    />
                  </div>
                  {handleDescription(app.description)}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "black/50 border-t border-gray-500 bg-black/50 px-4 lg:px-20",
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
            Making decentralized AI for everyone
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
