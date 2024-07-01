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
        className={`transition duration-700 ${triggerAnimation ? "opacity-70" : "opacity-90"}`}
      >
        <Animation />
      </div>
      <div className="flex h-full w-full max-w-screen-2xl flex-col">
        {!triggerAnimation ? (
          <div className="flex h-full min-h-[85vh] w-full items-end justify-between">
            <div className="flex h-full w-full flex-col items-start text-gray-400 lg:max-w-4xl xl:pl-10">
              <p className="text-xl font-medium">
                <span className="text-green-400">Peer-to-peer </span>
                Incentivized coordination network.
              </p>
              <Image
                alt="Commune ai logo"
                className="w-full py-4"
                height={100}
                src="/logo-asci.svg"
                width={200}
              />
              <p className="mt-1 text-lg">
                Protocol and Market System for Incentive-driven Coordination of
                Decentralized AI.
              </p>
              <p className="text-lg">
                Fully community driven, no bureaucracy, no team, no pre-mine.
                Only code and contributors.
              </p>
            </div>
            <button
              onClick={handleButtonClick}
              className="relative inline-flex items-center justify-center gap-3 border border-white/20 bg-[#898989]/5 px-4 py-2 text-gray-400 backdrop-blur-md"
            >
              View More
            </button>
          </div>
        ) : (
          <div className="flex h-full min-h-[85vh] w-full flex-col items-end justify-between">
            <button
              onClick={handleButtonClick}
              className="relative inline-flex items-center justify-center gap-3 border border-white/20 bg-[#898989]/5 px-4 py-2 text-gray-400 backdrop-blur-md"
            >
              Back
            </button>
            <div className="flex w-full max-w-screen-2xl flex-col gap-6 lg:flex-row">
              {applicationsList.map((app, index) => {
                return (
                  <Link
                    key={index}
                    href={app.href}
                    target={app.target ? app.target : "_self"}
                    className="flex w-full flex-col border border-white/20 bg-[#898989]/5 p-8 backdrop-blur-md"
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
