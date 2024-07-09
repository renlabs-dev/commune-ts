"use client";

import type { SS58Address } from "@commune-ts/providers/types";
import { CreateDao } from "./create-dao";
import { CreateProposal } from "./create-proposal";
import { LinkIcon } from "@heroicons/react/20/solid";
import { toast } from "@commune-ts/providers/use-toast";
import { smallAddress } from "@commune-ts/providers/utils";

interface ProposalListHeaderProps {
  viewMode: string;
  setViewMode: (mode: "proposals" | "daos") => void;
  daoTreasury: SS58Address | undefined;
}

export function ProposalListHeader(
  props: ProposalListHeaderProps,
): JSX.Element {
  const { setViewMode, viewMode, daoTreasury } = props;

  function handleCopyClick(): void {
    navigator.clipboard
      .writeText(daoTreasury as string)
      .then(() => {
        toast.success("Treasury address copied to clipboard");
      })
      .catch(() => {
        toast.error("Failed to copy treasury address");
      });
  }

  return (
    <div className="flex flex-col w-full gap-10 divide-gray-500 lg:pt-5 lg:max-w-screen-2xl lg:flex-row mt-10 lg:mt-0">
      <div className={`w-full hidden lg:flex`}>
        <button
          className="text-white flex lg:flex-col xl:flex-row justify-center px-5 py-3 items-center w-full border border-white/20 hover:border-green-500 bg-[#898989]/5 backdrop-blur-md xl:gap-2"
          onClick={handleCopyClick}
        >
          <span className="flex items-center text-base font-light text-gray-200 text-pretty">
            <LinkIcon className="w-5 h-5 mr-2" />
            DAO treasury address
          </span>
          {daoTreasury ? (
            <span className="text-green-500 text-pretty">
              {smallAddress(daoTreasury)}
            </span>
          ) : null}
        </button>
      </div>
      <div className="flex items-center justify-center w-full gap-3">
        <button
          className={`w-1/2 border bg-[#898989]/5 h-full backdrop-blur-md px-5 py-3 ${viewMode === "proposals" ? "border-green-500  text-green-500" : "border-white text-white hover:border-green-600 hover:text-green-600"}`}
          onClick={() => {
            setViewMode("proposals");
          }}
          type="button"
        >
          Proposals View
        </button>
        <button
          className={`w-1/2 border bg-[#898989]/5 h-full backdrop-blur-md px-5 py-3 ${viewMode === "daos" ? "border-green-500  text-green-500" : "border-white text-white hover:border-green-600 hover:text-green-600"}`}
          onClick={() => {
            setViewMode("daos");
          }}
          type="button"
        >
          S0 Applications
        </button>
      </div>
      <div className="items-center justify-end hidden w-full gap-2 lg:flex">
        <CreateProposal />
        <CreateDao />
      </div>
    </div >
  );
}
