import Link from "next/link";
import {
  ArrowRightIcon,
  Square2StackIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

import { smallAddress } from "@commune-ts/providers/utils";

import { DelegateModulePercentage } from "./delegate-module-percentage";

interface ModuleCardProps {
  id: number;
  title: string; // IPFS
  description: string; // IPFS
  address: string; // SS58
}

export function ModuleCard(props: ModuleCardProps) {
  return (
    <div className="flex flex-col gap-2 border border-white/20 bg-[#898989]/5 p-6 text-gray-400 backdrop-blur-md">
      <h2 className="text-xl font-semibold text-white">{props.title}</h2>
      <p className="mb-1">{props.description}</p>
      <div className="flex items-center justify-between gap-2">
        <span className="flex w-full items-center gap-2 border border-white/20 bg-[#898989]/5 p-2 backdrop-blur-md">
          <Squares2X2Icon className="h-6 w-6 text-green-500" />{" "}
          {smallAddress(String(props.address))}
        </span>
        <button className="border border-white/20 bg-[#898989]/5 p-2 backdrop-blur-md transition duration-200 hover:border-green-500 hover:bg-green-500/10">
          <Square2StackIcon className="h-6 w-6 text-gray-400 transition duration-200 hover:text-green-500" />
        </button>
      </div>
      <div className="flex items-center justify-between gap-2">
        <DelegateModulePercentage />
        <Link
          className="flex w-full items-center justify-between border border-white/20 bg-[#898989]/5 p-2 pl-3 text-white backdrop-blur-md transition duration-200 hover:border-green-500 hover:bg-green-500/10"
          href={`module/${props.id}`}
        >
          View More <ArrowRightIcon className="h-5 w-5 text-green-500" />
        </Link>
      </div>
    </div>
  );
}
