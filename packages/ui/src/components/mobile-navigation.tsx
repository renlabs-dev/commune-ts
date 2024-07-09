"use client";

import React, { ReactElement, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/16/solid";

import { cn } from "..";
import { links } from "../data";

interface MobileNavigationProps {
  navigationLinks?: { name: string; href: string; external: boolean }[];
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
    {
      href: links.x, icon: "/x-icon.svg", alt: "Commune's X Link",
    },
  ];

  return (
    <div>
      <button
        type="button"
        className={cn(
          "ml-2 flex h-11 w-11 items-center justify-center border border-gray-500 p-2 text-white hover:bg-gray-400/[0.10] lg:hidden",
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
        <nav className={cn("absolute right-0 top-20 z-40 w-full h-full lg:hidden")}>
          <div className={cn("min-w-1/4 sticky right-3 top-3 z-[50] ml-auto h-auto w-[70%] lg:w-[30%] bg-[url('/bg-pattern.svg')] border border-white/20")}>
            <div className={cn("flow-root")}>

              {props.genericContent}

              <div className={cn("border-white/20 p-4 space-y-2")}>
                {props.navigationLinks &&
                  props?.navigationLinks?.map(({ name, href, external }) => (
                    <Link
                      key={name}
                      href={href}
                      onClick={toggleMobileMenu}
                      target={external ? "_blank" : "_self"}
                      className={cn(
                        " block w-full p-3 px-6 text-base font-semibold leading-7 border  text-gray-400 hover:border-green-600 hover:text-green-600 hover:bg-green-600/5 border-white/20 text-center hover:bg-gray-400/10 hover:backdrop-blur-sm",

                      )}
                    >
                      {name}
                    </Link>
                  ))}
              </div>

              <div className={cn("flex justify-between w-full p-6 py-4 border-t border-white/20 text-green-500")}>
                {headerSocialLinks.map((value) => {
                  return (
                    <Link key={value.href} href={value.href} target="_blank">
                      <Image src={value.icon} alt={`${value.alt} Icon`} width={40} height={40} className={cn("w-8 h-8")} />
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </nav>


      )
      }
    </div >
  );
}
