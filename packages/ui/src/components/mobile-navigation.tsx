"use client";

import { Bars3Icon, XMarkIcon } from "@heroicons/react/16/solid";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { links } from "../data";

interface MobileNavigationProps {
  navigationLinks: { name: string; href: string; external: boolean }[];
}

export function MobileNavigation(props: MobileNavigationProps): JSX.Element {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  function toggleMobileMenu(): void {
    setMobileMenuOpen(!mobileMenuOpen);
  }

  const headerSocialLinks = [
    {
      href: links.discord,
      icon: "/discord-icon.svg",
      alt: "Commune's Discord Link",
    },
    {
      href: links.github,
      icon: "/github-icon.svg",
      alt: "Commune's GitHub Link",
    },
    {
      href: links.telegram,
      icon: "/telegram-icon.svg",
      alt: "Commune's Telegram Link",
    },
    { href: links.x, icon: "/x-icon.svg", alt: "Commune's X Link" },
  ];

  return (
    <div>
      <button
        className="ui-ml-2 ui-flex ui-h-11 ui-w-11 ui-items-center ui-justify-center ui-border ui-border-gray-500 ui-p-2 ui-text-white hover:ui-bg-gray-400/[0.10] md:ui-hidden"
        onClick={toggleMobileMenu}
        type="button"
      >
        {mobileMenuOpen ? (
          <XMarkIcon className="ui-h-6 ui-w-6 ui-text-gray-500" />
        ) : (
          <Bars3Icon className="ui-h-6 ui-w-6 ui-text-gray-500" />
        )}
      </button>
      {mobileMenuOpen ? (
        <div className="ui-fixed ui-left-0 ui-top-16 ui-z-50 ui-h-full ui-w-full ui-animate-fade-in">
          <div className="ui-relative ui-mx-auto ui-my-6 ui-w-11/12 ui-space-y-4 ui-divide-y ui-divide-gray-200/40 ui-border ui-border-gray-500 ui-bg-black ui-p-4">
            <div className="ml-2 mt-6 space-y-2">
              {props.navigationLinks.map(({ name, href, external }) => (
                <Link
                  className="ui-hover:bg-gray-400/10 ui-hover:backdrop-blur-sm ui--mx-3 ui-block ui-w-full ui-px-3 ui-py-1 ui-text-base ui-font-semibold ui-leading-7 ui-text-white"
                  href={href}
                  key={name}
                  onClick={toggleMobileMenu}
                  target={external ? "_blank" : "_self"}
                >
                  {name}
                </Link>
              ))}
            </div>
            <div className="ui-flex ui-justify-between ui-space-x-3 ui-py-4">
              {headerSocialLinks.map(({ href, icon, alt }) => (
                <Link
                  className="ui-hover:bg-gray-400/[0.10] ui-flex ui-h-12 ui-w-12 ui-items-center ui-justify-center ui-p-1.5 ui-text-white"
                  href={href}
                  key={href}
                  target="_blank"
                >
                  <Image alt={alt} height={25} src={icon} width={25} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
