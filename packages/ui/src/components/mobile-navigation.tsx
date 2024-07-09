"use client";

import { ReactElement, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/16/solid";

import { cn } from "..";
import { links } from "../data";

interface MobileNavigationProps {
  navigationLinks: { name: string; href: string; external: boolean }[];
  genericContent?: ReactElement;
}

export function MobileNavigation(props: MobileNavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

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
        type="button"
        className={cn(
          "ml-2 flex h-11 w-11 items-center justify-center border border-gray-500 p-2 text-white hover:bg-gray-400/[0.10] md:hidden",
        )}
        onClick={toggleMobileMenu}
      >
        {mobileMenuOpen ? (
          <XMarkIcon className={cn("h-6 w-6 text-gray-500")} />
        ) : (
          <Bars3Icon className={cn("h-6 w-6 text-gray-500")} />
        )}
      </button>

      {mobileMenuOpen && (
        <div
          className={cn(
            "animate-fade-in fixed left-0 top-16 z-50 h-full w-full md:hidden",
          )}
        >
          <div
            className={cn(
              "relative mx-auto my-6 w-11/12 space-y-4 divide-y divide-gray-200/40 border border-gray-500 bg-black p-4",
            )}
          >
            <div className={cn("space-y-2")}>
              {props.genericContent}

              {!props.genericContent &&
                props.navigationLinks.map(({ name, href, external }) => (
                  <Link
                    key={name}
                    href={href}
                    onClick={toggleMobileMenu}
                    target={external ? "_blank" : "_self"}
                    className={cn(
                      "-mx-3 block w-full px-3 py-1 text-base font-semibold leading-7 text-white hover:bg-gray-400/10 hover:backdrop-blur-sm",
                    )}
                  >
                    {name}
                  </Link>
                ))}
            </div>
            <div className={cn("flex justify-between space-x-3 py-4")}>
              {headerSocialLinks.map(({ href, icon, alt }) => (
                <Link
                  key={href}
                  href={href}
                  target="_blank"
                  className={cn(
                    "flex h-12 w-12 items-center justify-center p-1.5 text-white hover:bg-gray-400/[0.10]",
                  )}
                >
                  <Image src={icon} width={25} height={25} alt={alt} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
