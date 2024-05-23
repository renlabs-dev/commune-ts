import Link from "next/link";
import Image from "next/image";
import { oxanium } from "../fonts";

interface HeaderProps {
  logoSrc: string;
  title: string;
  navigationLinks: { name: string; href: string; external: boolean }[];
}

export function Header(props: HeaderProps): JSX.Element {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-500 bg-black/50 backdrop-blur-sm">
      <nav className="mx-auto px-3 flex w-full max-w-screen-2xl items-center justify-between py-3">
        <Link className="flex items-center gap-3" href="/">
          <Image
            alt="Logo"
            className="h-10 w-10"
            height={100}
            src={props.logoSrc}
            width={100}
          />
          <h3
            className={`${oxanium.className} text-2xl font-light text-white mt-0.5`}
          >
            {props.title}
          </h3>
        </Link>
        <div className="hidden lg:flex lg:gap-6">
          {props.navigationLinks.map(({ name, href, external }) => (
            <Link
              className="flex flex-col items-center text-lg font-normal leading-6 text-white hover:text-green-500 transition duration-500"
              href={href}
              key={name}
              target={external ? "_blank" : "_self"}
            >
              {name}
            </Link>
          ))}
        </div>
        {/* mobile menu here */}
      </nav>
    </header>
  );
}
