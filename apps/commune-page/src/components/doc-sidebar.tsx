"use client";

import Link from "next/link";
import { useState } from "react";
import { tutorials } from "../app/docs/[...slug]/tutorials";
import {
  Bars3Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/20/solid";

type TDocSidebarProps = {
  prefix: string;
  activeTutorial: number;
  activeContent: number;
  params: { slug: string };
};

export function DocSidebar(props: TDocSidebarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const commonButtonClass =
    "flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100/10 text-title dark:text-white p-1.5 hover:bg-gray-100/[0.15]";

  const { params, activeTutorial, activeContent, prefix } = props;
  return (
    <>
      <div
        className={`fixed z-10 h-[calc(100svh-81px)] w-full animate-menu-fade backdrop-blur-sm lg:w-[17rem] lg:backdrop-blur-none ${mobileMenuOpen ? "visible" : "hidden"} lg:block`}
        onClick={toggleMobileMenu}
        aria-label="Global"
      >
        <div
          className={`sm:min-w-2/6 relative h-full w-4/6 overflow-y-scroll border-r border-gray-900/[0.06] bg-[url('/bg-pattern.svg')] p-8  sm:w-3/6 md:w-2/6 lg:mx-auto lg:w-full`}
        >
          <button
            type="button"
            className={`${commonButtonClass} absolute right-0 top-0 m-5 h-8 w-8 rounded-xl lg:hidden`}
            onClick={toggleMobileMenu}
          >
            <span className="sr-only">Close menu</span>
            <ChevronLeftIcon
              className="w-6 h-6 fill-white"
              aria-hidden="true"
            />
          </button>
          {tutorials.map((tutorial, index) => {
            return (
              <div key={index}>
                <span className="text-base font-medium text-white">
                  {tutorial.title}
                </span>
                <div className="my-3 ml-1">
                  {tutorial.contents.map((content, index) => {
                    return (
                      <Link
                        key={index}
                        href={`${prefix}/${tutorial.tutorialId}/${content.href}`}
                        className={`relative mt-0 flex items-center border-l border-gray-600/70 p-3 ${params.slug[1] === content.href && params.slug[0] === tutorial.tutorialId ? "text-white" : " text-gray-400 hover:text-gray-200"}`}
                      >
                        {params.slug[1] === content.href &&
                          params.slug[0] === tutorial.tutorialId && (
                            <div className="absolute w-2 h-2 bg-white rounded-full -left-1" />
                          )}
                        <span>{content.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <div className="sticky top-0 z-0 flex h-12 w-full items-center border-b border-gray-50/[0.06] bg-transparent pl-6 text-sm text-gray-400 lg:hidden">
          <button
            className={`${commonButtonClass} mr-6 h-8 w-8 rounded-xl`}
            onClick={toggleMobileMenu}
          >
            <Bars3Icon width={16} className="fill-white" />
          </button>
          <span className="mr-2 font-light">
            {tutorials[activeTutorial].title}
          </span>
          <ChevronRightIcon width={16} />
          <span className="ml-2 font-semibold text-white">
            {tutorials[activeTutorial].contents[activeContent].name}
          </span>
        </div>
      </div>
    </>
  );
}
