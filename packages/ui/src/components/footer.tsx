import Link from "next/link";
import Image from "next/image";
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
    <footer className="ui-flex ui-flex-col">
      <div className="ui-px-4 lg:ui-px-20">
        <div className="ui-mx-auto ui-max-w-screen-2xl ui-space-y-12">
          <div className="ui-flex ui-flex-col ui-gap-6 ui-pt-10 lg:ui-flex-row lg:ui-items-center lg:ui-gap-16 lg:ui-pt-20">
            <div className="ui-space-y-5">
              <h3 className="ui-text-3xl ui-text-white lg:ui-text-5xl">
                Join the revolution of Incentive-driven Decentralized AI
              </h3>
            </div>
          </div>
          <div className="ui-flex ui-flex-col ui-justify-between ui-space-y-4 ui-pb-10 lg:ui-flex-row lg:ui-space-x-4 lg:ui-space-y-0 lg:ui-pb-20">
            {props.applicationsList.map((app) => {
              return (
                <Link
                  className="ui-w-full ui-border ui-border-gray-500 ui-bg-black/50 ui-p-8 ui-text-gray-400 ui-transition ui-duration-200 hover:ui-bg-green-950/15 hover:ui-text-gray-300"
                  href={app.href}
                  key={app.title}
                >
                  <div className="ui-flex ui-items-center ui-justify-between">
                    <div>
                      <p className="ui-text-white">{app.title}</p>
                    </div>
                    <Image
                      alt="link icon"
                      className="ui-w-12 ui-border ui-border-green-500 ui-p-3"
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

      <div className="ui-border-t ui-border-gray-500 ui-black/50 ui-px-4 lg:ui-px-20">
        <div className="ui-mx-auto ui-flex ui-w-full ui-max-w-screen-2xl ui-flex-col ui-items-center ui-justify-between ui-gap-6 ui-p-6 lg:ui-flex-row lg:ui-gap-0">
          <p className="ui-hidden ui-text-left ui-text-sm ui-leading-5 ui-text-gray-400 lg:ui-block">
            Making decentralized AI for everyone
          </p>
          <div className="ui-flex ui-space-x-5 ui-px-4">
            {socialList.map((item) => (
              <Link
                className="ui-leading-6 ui-text-subtitle hover:ui-text-gray-800 hover:ui-underline"
                href={item.href}
                key={item.name}
              >
                {item.icon}
              </Link>
            ))}
          </div>

          <p className="ui-text-center ui-text-sm ui-leading-5 ui-text-gray-400">
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
