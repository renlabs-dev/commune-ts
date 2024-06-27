import Image from "next/image";

export function HeroSection(): JSX.Element {
  return (
    <div id="hero" className="flex justify-center">
      <div className="flex h-full min-h-screen w-full max-w-screen-2xl items-end pb-24">
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
            Fully community driven, no bureaucracy, no team, no pre-mine. Only
            code and contributors.
          </p>
        </div>
      </div>
    </div>
  );
}
