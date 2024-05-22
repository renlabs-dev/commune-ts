"use client";

import { useState } from "react";

import Link from "next/link";
import Image from "next/image";

import { links } from "../data";
import { oxanium } from "../fonts";

type THeaderLinkProps = {
  href: string;
  target?: string;
  icon: string;
  alt: string;
  className?: string;
};

const HeaderLink = ({
  href,
  target = "_blank",
  icon,
  alt,
}: THeaderLinkProps) => (
  <Link
    href={href}
    target={target}
    className="flex h-12 w-12 items-center justify-center text-white p-1.5 hover:bg-gray-400/[0.10]"
  >
    <Image src={icon} width={25} height={25} alt={alt} />
  </Link>
);

const navigation = [
  { name: "Governance", href: links.governance, external: true },
  { name: "Docs", href: links.docs, external: false },
  { name: "Blog", href: links.blog, external: true },
  { name: "Join Community", href: links.discord, external: true },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const commonButtonClass =
    "flex h-12 w-12 items-center justify-center text-white p-1.5 hover:bg-gray-400/[0.10]";

  return (
    <>
      <div
        className={`absolute z-50 h-full w-full backdrop-blur-sm ${mobileMenuOpen ? "visible" : "hidden"} max-w-screen-2xl animate-menu-fade lg:hidden`}
      >
        <nav className={`fixed z-40 h-full w-full`}>
          <div
            className={`min-w-1/4 sticky right-3 top-3 z-[50] ml-auto h-auto w-[70%] border  border-gray-500 bg-[url('/bg-pattern.svg')] bg-cover p-5 lg:w-[30%]`}
          >
            <button
              type="button"
              className={`${commonButtonClass} absolute right-0 top-0 m-5 h-8 w-8 `}
              onClick={toggleMobileMenu}
            >
              <span className="sr-only">Close menu</span>
              <span className="sr-only">Close</span>
            </button>
            <div className="flow-root">
              <div className="-my-6 space-y-4 divide-y divide-gray-200/40">
                <div className="ml-2 mt-6 space-y-2">
                  {navigation.map(({ name, href, external }) => (
                    <Link
                      key={name}
                      href={href}
                      onClick={toggleMobileMenu}
                      target={external ? "_blank" : "_self"}
                      className="-mx-3 block w-[80%] px-3 py-1 text-base font-semibold leading-7 text-white hover:bg-gray-400/10 hover:backdrop-blur-sm"
                    >
                      {name}
                    </Link>
                  ))}
                </div>
                <div className="flex justify-between space-x-3 py-4">
                  {navigation.map(({ name, href, external }) => (
                    <HeaderLink
                      key={name}
                      href={href}
                      target={external ? "_blank" : "_self"}
                      icon={"/"}
                      alt="Discord icon"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>

      <header
        className={`sticky top-0 z-40 flex w-full flex-none border-b border-gray-500 bg-black bg-opacity-75 backdrop-blur transition-colors duration-500 `}
      >
        <nav
          className={`mx-auto flex w-full max-w-screen-2xl items-center justify-between py-3`}
          aria-label="Global"
        >
          <Link
            href={"/"}
            className="flex items-center gap-2 text-2xl font-light text-white"
          >
            <Image
              src="/commune-logo-white.svg"
              width={100}
              height={100}
              className="ml-2 h-10 w-10"
              alt="Telegram icon"
            />
            <p className={`${oxanium.className} ml-1`}>Commune AI</p>
          </Link>
          <div className="hidden lg:flex lg:gap-x-8">
            {navigation.map(({ name, href, external }) => (
              <Link
                key={name}
                href={href}
                target={external ? "_blank" : "_self"}
                className={`flex flex-col items-center text-lg font-normal leading-6 text-white hover:text-green-500 active:animate-squeeze`}
              >
                {name}
              </Link>
            ))}
          </div>
          <div className="ml-auto mr-8 lg:hidden">
            <button
              type="button"
              className={`${commonButtonClass} -m-2.5`}
              onClick={toggleMobileMenu}
            >
              <span className="sr-only">Open main menu</span>
              <span className="h-6 w-6 fill-white" aria-hidden="true">
                Open
              </span>
            </button>
          </div>
        </nav>
      </header>
    </>
  );
};
