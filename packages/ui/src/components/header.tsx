import Link from "next/link";
import Image from "next/image";
import { oxanium } from "../fonts";
import { MobileNavigation } from "./mobile-navigation";

interface HeaderProps {
  logoSrc: string;
  title: string;
  navigationLinks: { name: string; href: string; external: boolean }[];
  wallet: JSX.Element;
}

export function Header(props: HeaderProps): JSX.Element {
  return (
    <header className="ui-sticky ui-top-0 ui-z-50 ui-w-full ui-border-b ui-border-gray-500 ui-bg-black/50 ui-backdrop-blur-sm">
      <nav className="ui-mx-auto ui-flex ui-w-full ui-max-w-screen-2xl ui-items-center ui-justify-between ui-px-3 ui-py-3">
        <Link className="ui-flex ui-items-center ui-gap-3" href="/">
          <Image
            alt="Logo"
            className="ui-h-10 ui-w-10"
            height={100}
            src={props.logoSrc}
            width={100}
          />
          <h3
            className={`${oxanium.className} ui-mt-0.5 ui-hidden ui-text-2xl ui-font-light ui-text-white md:ui-flex`}
          >
            {props.title}
          </h3>
        </Link>
        <div className="ui-flex ui-items-center">
          <div className="ui-hidden ui-pr-6 lg:ui-flex lg:ui-gap-6">
            {props.navigationLinks.map(({ name, href, external }) => (
              <Link
                className="ui-flex ui-flex-col ui-items-center ui-text-lg ui-font-normal ui-leading-6 ui-text-white ui-transition ui-duration-500 hover:ui-text-green-500"
                href={href}
                key={name}
                target={external ? "_blank" : "_self"}
              >
                {name}
              </Link>
            ))}
          </div>
          {props.wallet}
          <MobileNavigation navigationLinks={props.navigationLinks} />
        </div>
      </nav>
    </header>
  );
}
