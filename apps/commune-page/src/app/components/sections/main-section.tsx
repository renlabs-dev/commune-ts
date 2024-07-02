"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { applicationsList } from "~/utils/applications-list";
import Animation from "../animation";

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
      <div className="flex h-full w-full max-w-screen-2xl flex-col">
        {!triggerAnimation ? (
          <div className="flex h-full min-h-[85vh] w-full flex-col justify-end gap-6 px-4 pb-6 md:flex-row md:items-end md:justify-between">
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
            <div className="flex w-full gap-3 md:w-fit">
              <button
                onClick={handleButtonClick}
                className="relative inline-flex w-full animate-fade-up items-center justify-center gap-2 border border-white/20 bg-[#898989]/5 px-4 py-2 text-gray-400 backdrop-blur-md transition duration-300 animate-delay-500 hover:border-green-500 hover:bg-green-500/10 md:w-fit"
              >
                <Image
                  src="/join-community.svg"
                  alt="link icon"
                  width={20}
                  height={20}
                />
                <span className="text-nowrap">JOIN COMMUNITY</span>
              </button>
              <button
                onClick={handleButtonClick}
                className="relative inline-flex w-full animate-fade-up items-center justify-center gap-2 border border-white/20 bg-[#898989]/5 px-4 py-2 text-gray-400 backdrop-blur-md transition duration-300 animate-delay-500 hover:border-green-500 hover:bg-green-500/10 md:w-fit"
              >
                <Image
                  src="/view-more.svg"
                  alt="link icon"
                  width={20}
                  height={20}
                />
                <span className="text-nowrap">VIEW MORE</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-[85vh] w-full flex-col items-end justify-between p-4 pb-6">
            <button
              onClick={handleButtonClick}
              className="relative inline-flex animate-fade-down items-center justify-center gap-3 border border-white/20 bg-[#898989]/5 px-4 py-2 text-gray-400 backdrop-blur-md transition duration-300 animate-delay-200 hover:border-green-500 hover:bg-green-500/10"
            >
              <Image
                src="/view-more.svg"
                alt="link icon"
                width={20}
                height={20}
                className="rotate-180"
              />
              <span className="text-nowrap">GO BACK</span>
            </button>
            <div className="flex w-full flex-col items-center justify-center gap-6">
              <div className="flex flex-col items-center gap-1">
                <h1 className="animate-fade-down pt-52 text-center text-3xl text-white md:pt-0 md:text-5xl">
                  Welcome to the <span className="text-green-500">commune</span>
                </h1>
                <p className="animate-fade-down text-center text-xl text-white">
                  A place for permission-less and censorship resistant
                  cooperation.
                </p>
              </div>
              <div className="flex w-full animate-fade-up flex-col gap-6 backdrop-blur-md md:flex-row">
                {applicationsList.map((app, index) => {
                  return (
                    <Link
                      key={index}
                      href={app.href}
                      target={app.target ? app.target : "_self"}
                      className="flex w-full flex-row gap-6 border border-white/20 bg-[#898989]/5 p-8 transition duration-300 hover:border-green-500 hover:bg-green-500/10 md:flex-col xl:flex-row xl:items-center"
                    >
                      <Image
                        alt="Governance icon"
                        className="w-12"
                        height={200}
                        src={app.icon}
                        width={200}
                      />
                      <div
                        id="welcome"
                        className="flex flex-row justify-between gap-6 md:flex-col xl:flex-row"
                      >
                        <div>
                          <p className="text-white">{app.title}</p>
                          <p className="text-gray-400">{app.description}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
