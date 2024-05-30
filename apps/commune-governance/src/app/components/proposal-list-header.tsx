"use client";

import { CreateProposal } from "./create-proposal";
import { CreateDao } from "./create-dao";

interface ProposalListHeaderProps {
  viewMode: string;
  setViewMode: (mode: "proposals" | "daos") => void;
}

export function ProposalListHeader(
  props: ProposalListHeaderProps
): JSX.Element {
  const { setViewMode, viewMode } = props;
  return (
    <div className="flex-col items-center justify-between w-full gap-6 py-6 border-b border-gray-500 lg:flex lg:flex-row ">
      <div className="flex items-center w-full max-w-6xl px-4 mx-auto lg:px-4">
        <div className="flex items-center justify-start w-full gap-3">
          <button
            className={`border w-1/2 lg:w-auto border-gray-500 px-5 py-2 ${viewMode === "proposals" ? "bg-green-500/5 text-green-500 border-green-500" : "text-gray-500 hover:border-green-600 bg-green-600/5 hover:text-green-600"}`}
            onClick={() => {
              setViewMode("proposals");
            }}
            type="button"
          >
            Proposals View
          </button>
          <button
            className={`border w-1/2 lg:w-auto border-gray-500 px-5 py-2 ${viewMode === "daos" ? "bg-green-500/5 text-green-500 border-green-500" : "text-gray-500 hover:border-green-600 bg-green-600/5 hover:text-green-600"}`}
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
      </div>
    </div>
  );
}
