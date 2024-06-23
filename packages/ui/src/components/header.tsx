import Image from "next/image";
import Link from "next/link";

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
    <header className="sticky top-0 z-50 w-full border-b border-gray-500 bg-black/50 backdrop-blur-sm">
      <nav className="mx-auto flex w-full max-w-screen-2xl items-center justify-between px-3 py-3">
        <Link className="flex items-center gap-3" href="/">
          <Image
            alt="Logo"
            className="h-10 w-10"
            height={100}
            src={props.logoSrc}
            width={100}
          />
          <h3
            className={`${oxanium.className} mt-0.5 hidden text-2xl font-light text-white md:flex`}
          >
            {props.title}
          </h3>
        </Link>
        <div className="flex items-center">
          <div className="hidden pr-6 lg:flex lg:gap-6">
            {props.navigationLinks.map(({ name, href, external }) => (
              <Link
                className="flex flex-col items-center text-lg font-normal leading-6 text-white transition duration-500 hover:text-green-500"
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
