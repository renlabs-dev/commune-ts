import Link from "next/link";
import Image from "next/image";
import { handleDescription } from "@repo/ui/discord-widget";
import Animation from "../animation/index";
import { CountUpArea } from "../count-up-area";
import { applicationsList } from "../../../utils/applications-list";

export function HeroSection(): JSX.Element {
  return (
    <div
      className="flex w-full flex-col justify-center overflow-hidden text-gray-400"
      id="hero"
    >
      <div className="flex flex-col lg:flex-row">
        <div className="flex w-full flex-col justify-between border-gray-500 bg-[url('/bg-pattern.svg')] z-10 lg:max-w-[60%] lg:border-r">
          <div className="flex h-full flex-col justify-center space-y-4 border-b border-gray-500 px-8">
            <div className="flex w-full py-16 lg:justify-end">
              <div className="flex w-full flex-col justify-between lg:max-w-4xl xl:pl-10">
                <p className="text-xl font-medium">
                  <span className="text-green-400">Peer-to-peer </span>
                  incentivized coordination network.
                </p>
                <Image
                  alt="Commune ai logo"
                  className="w-full py-4"
                  height={100}
                  src="/logo-asci.svg"
                  width={200}
                />
                <p className="mt-1 text-lg">
                  Protocol and Market System for Incentive-driven Coordination
                  of Decentralized AI.
                </p>
                <p className="text-lg">
                  Fully community driven, no bureaucracy, no team, no premine.
                  Only code and contributors.
                </p>
              </div>
            </div>
          </div>
          <div className="flex w-full justify-end">
            <CountUpArea />
          </div>
        </div>
        <div className="relative flex h-96 flex-col items-center justify-center border-b border-gray-500 p-4 md:h-full lg:w-[45%] lg:flex-row lg:border-none lg:p-0">
          <div>
            <Animation />
          </div>

          <Link
            className="absolute bottom-0 mb-4 hidden w-full items-center justify-center border border-gray-500 bg-black/50 px-5 py-3 hover:border-gray-500  hover:bg-black/70 hover:text-gray-200 md:flex lg:bottom-8 lg:left-8 lg:mb-0 lg:w-auto lg:justify-start"
            href="#welcome"
          >
            View More
            <Image
              alt="Community icon"
              className="ml-1 w-5"
              height={75}
              src="/arrow-down-icon.svg"
              width={75}
            />
          </Link>
        </div>
      </div>

      <div className="flex justify-center border-t border-gray-500">
        <div className="flex w-full max-w-screen-2xl flex-col md:flex-row">
          {applicationsList.map((app) => {
            return (
              <Link
                className="w-full border-b border-gray-500 p-8 px-4 last:border-none hover:bg-black/20 hover:text-gray-300 lg:border-b-0 lg:border-l lg:border-r lg:p-16 lg:py-16 lg:first:border-none"
                href={app.href}
                key={app.title}
                target={app.target ? app.target : "_self"}
              >
                {app.icon}
                <div
                  className="flex flex-row justify-between gap-6 mt-2 md:flex-col xl:flex-row"
                  id="welcome"
                >
                  <div>
                    <p className="text-white">{app.title}</p>
                    {handleDescription(app.description)}
                  </div>
                  <Image
                    alt="link icon"
                    className="w-12 border border-green-500 bg-black/50 p-3 hover:bg-black/70"
                    height={75}
                    src="/arrow-link-icon.svg"
                    width={75}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
