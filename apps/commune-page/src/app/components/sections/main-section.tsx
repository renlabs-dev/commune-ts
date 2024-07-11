"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import Animation from "../animation";
import { links } from "@commune-ts/ui";

export function MainSection(): JSX.Element {
  const [triggerAnimation, setTriggerAnimation] = useState(false);

  const handleButtonClick = () => {
    setTriggerAnimation(!triggerAnimation);
  };
  return (
    <div id="hero" className="flex justify-center">
      <div
        className={`animate-fade opacity-20 transition duration-700 animate-delay-700`}
      >
        <Animation />
      </div>
      <div className="flex h-full w-full max-w-screen-2xl flex-col mt-4 lg:mt-0">
        <div className="flex h-full min-h-[85svh] w-full flex-col justify-end gap-6 px-4 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex h-full w-fit flex-col items-start text-gray-400 lg:max-w-4xl">
            <p className="animate-fade-right font-medium animate-delay-200 md:text-xl">
              <span className="text-green-400">Peer-to-peer </span>
              Incentivized coordination network.
            </p>
            <Image
              alt="Commune ai logo"
              className="w-full animate-fade-right py-4 animate-delay-300"
              height={100}
              src="/logo-asci.svg"
              width={200}
            />
            <p className="animate-fade-right animate-delay-500 md:mt-1 md:text-lg">
              Protocol and Market System for Incentive-driven Coordination of
              Decentralized AI.
            </p>
            <p className="animate-fade-right animate-delay-500 md:text-lg">
              Fully community driven, no bureaucracy, no team, no pre-mine.
              Only code and contributors.
            </p>
          </div>
          <div className="flex w-full gap-3 lg:w-fit flex-col lg:flex-row">
            <Link href={links.governance}>
              <button
                onClick={handleButtonClick}
                className="hidden relative lg:inline-flex w-full animate-fade-up items-center justify-center gap-2 border border-white/20 bg-[#898989]/5 px-4 py-2 text-gray-400 backdrop-blur-md transition duration-300 animate-delay-500 hover:border-green-500 hover:bg-green-500/10 lg:w-fit"
              >
                <Image
                  src="/governance-icon.svg"
                  alt="link icon"
                  width={20}
                  height={20}
                />
                <span className="text-nowrap">DAO</span>
              </button>
            </Link>
            <Link href={links.docs}>
              <button
                onClick={handleButtonClick}
                className="hidden relative lg:inline-flex w-full animate-fade-up items-center justify-center gap-2 border border-white/20 bg-[#898989]/5 px-4 py-2 text-gray-400 backdrop-blur-md transition duration-300 animate-delay-500 hover:border-green-500 hover:bg-green-500/10 lg:w-fit"
              >
                <Image
                  src="/docs-icon.svg"
                  alt="link icon"
                  width={20}
                  height={20}
                />
                <span className="text-nowrap">DOCS</span>
              </button>
            </Link>
            <Link href={links.explorer}>
              <button
                onClick={handleButtonClick}
                className="hidden relative lg:inline-flex w-full animate-fade-up items-center justify-center gap-2 border border-white/20 bg-[#898989]/5 px-4 py-2 text-gray-400 backdrop-blur-md transition duration-300 animate-delay-500 hover:border-green-500 hover:bg-green-500/10 lg:w-fit"
              >
                <Image
                  src="/view-more-icon.svg"
                  alt="link icon"
                  width={20}
                  height={20}
                />
                <span className="text-nowrap">Scan</span>
              </button>
            </Link>
            <Link href={links.discord}>
              <button
                onClick={handleButtonClick}
                className="relative inline-flex w-full animate-fade-up items-center justify-center gap-2 border border-white/20 bg-[#898989]/5 px-4 py-2 text-gray-400 backdrop-blur-md transition duration-300 animate-delay-500 hover:border-green-500 hover:bg-green-500/10 lg:w-fit"
              >
                <Image
                  src="/join-community.svg"
                  alt="link icon"
                  width={20}
                  height={20}
                />
                <span className="text-nowrap">JOIN COMMUNITY</span>
              </button>
            </Link>

            <Link href={links.about}>
              <button
                onClick={handleButtonClick}
                className="relative inline-flex w-full animate-fade-up items-center justify-center gap-2 border border-white/20 bg-[#898989]/5 px-4 py-2 text-gray-400 backdrop-blur-md transition duration-300 animate-delay-500 hover:border-green-500 hover:bg-green-500/10 lg:w-fit"
              >
                <Image
                  src="/view-more.svg"
                  alt="link icon"
                  width={20}
                  height={20}
                />
                <span className="text-nowrap">VIEW MORE</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
