"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { applicationsList } from "~/utils/applications-list";
import Animation from "../animation";

export function HeroSection(): JSX.Element {
  const [triggerAnimation, setTriggerAnimation] = useState(false);

  const handleButtonClick = () => {
    setTriggerAnimation(!triggerAnimation);
  };
  return (
    <div id="hero" className="flex justify-center">
      <div
        className={`animate-fade animate-delay-700 transition duration-700 ${triggerAnimation ? "opacity-70" : "opacity-100"}`}
      >
        <Animation />
      </div>
      <div className="flex h-full w-full max-w-screen-2xl flex-col">
        {!triggerAnimation ? (
          <div className="flex h-full min-h-[85vh] w-full flex-col justify-end gap-6 px-4 pb-12 md:flex-row md:items-end md:justify-between md:pb-0">
            <div className="flex h-full w-fit flex-col items-start text-gray-400 lg:max-w-4xl">
              <p className="animate-fade-right animate-delay-200 font-medium md:text-xl">
                <span className="text-green-400">Peer-to-peer </span>
                Incentivized coordination network.
              </p>
              <Image
                alt="Commune ai logo"
                className="animate-fade-right animate-delay-300 w-full py-4"
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
                className="animate-fade-up animate-delay-500 relative inline-flex w-full items-center justify-center gap-2 border border-white/20 bg-[#898989]/5 px-4 py-2 text-gray-400 backdrop-blur-md transition duration-300 hover:border-green-500 hover:bg-green-500/10 md:w-fit"
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
                className="animate-fade-up animate-delay-500 relative inline-flex w-full items-center justify-center gap-2 border border-white/20 bg-[#898989]/5 px-4 py-2 text-gray-400 backdrop-blur-md transition duration-300 hover:border-green-500 hover:bg-green-500/10 md:w-fit"
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
          <div className="flex h-full min-h-[85vh] w-full flex-col items-end justify-between px-4 pt-12">
            <button
              onClick={handleButtonClick}
              className="animate-fade-down animate-delay-200 relative inline-flex items-center justify-center gap-3 border border-white/20 bg-[#898989]/5 px-4 py-2 text-gray-400 backdrop-blur-md transition duration-300 hover:border-green-500 hover:bg-green-500/10"
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
            <div className="animate-fade-up flex w-full max-w-screen-2xl flex-col gap-6 backdrop-blur-md lg:flex-row">
              {applicationsList.map((app, index) => {
                return (
                  <Link
                    key={index}
                    href={app.href}
                    target={app.target ? app.target : "_self"}
                    className="flex w-full flex-col border border-white/20 bg-[#898989]/5 p-8 transition duration-300 hover:border-green-500 hover:bg-green-500/10"
                  >
                    {app.icon}
                    <div
                      id="welcome"
                      className="flex flex-row justify-between gap-6 md:flex-col xl:flex-row"
                    >
                      <div>
                        <p className="text-white">{app.title}</p>
                        <p className="text-white">{app.description}</p>
                      </div>
                      <Image
                        src={"/arrow-link-icon.svg"}
                        alt="link icon"
                        width={75}
                        height={75}
                        className="w-12 border border-green-500 bg-black/50 p-3 hover:bg-black/70"
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
