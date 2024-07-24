"use client";

import { LinkIcon } from "@heroicons/react/20/solid";

import type { SS58Address } from "@commune-ts/providers/types";
import { toast } from "@commune-ts/providers/use-toast";
import { smallAddress } from "@commune-ts/providers/utils";

import { CreateDao } from "./create-dao";
import { CreateProposal } from "./create-proposal";

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
    <div className="mt-10 flex w-full flex-col gap-10 divide-gray-500 lg:mt-0 lg:max-w-screen-2xl lg:flex-row lg:pt-5">
      <div
        className={`hidden w-full animate-fade-down animate-delay-300 lg:flex`}
      >
        <button
          className="flex w-full items-center justify-center border border-white/20 bg-[#898989]/5 px-5 py-3 text-white backdrop-blur-md hover:border-green-500 lg:flex-col xl:flex-row xl:gap-2"
          onClick={handleCopyClick}
        >
          <span className="flex items-center text-pretty text-base font-light text-gray-200">
            <LinkIcon className="mr-2 h-5 w-5" />
            DAO treasury address
          </span>
          {daoTreasury ? (
            <span className="text-pretty text-green-500">
              {smallAddress(daoTreasury)}
            </span>
          ) : null}
        </button>
      </div>
      <div className="flex w-full animate-fade-down items-center justify-center gap-3 animate-delay-500">
        <button
          className={`h-full w-1/2 border bg-[#898989]/5 px-5 py-3 backdrop-blur-md ${viewMode === "proposals" ? "border-green-500  text-green-500" : "border-white text-white hover:border-green-600 hover:text-green-600"}`}
          onClick={() => {
            setViewMode("proposals");
          }}
          type="button"
        >
          Proposals View
        </button>
        <button
          className={`h-full w-1/2 border bg-[#898989]/5 px-5 py-3 backdrop-blur-md ${viewMode === "daos" ? "border-green-500  text-green-500" : "border-white text-white hover:border-green-600 hover:text-green-600"}`}
          onClick={() => {
            setViewMode("daos");
          }}
          type="button"
        >
          S0 Applications
        </button>
      </div>
      <div className="hidden w-full items-center justify-end gap-2 lg:flex">
        <CreateProposal />
        <CreateDao />
      </div>
    </div>
  );
}
