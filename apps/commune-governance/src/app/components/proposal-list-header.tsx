"use client";

import { CreateDao } from "./create-dao";
import { CreateProposal } from "./create-proposal";

interface ProposalListHeaderProps {
  viewMode: string;
  setViewMode: (mode: "proposals" | "daos") => void;
}

export function ProposalListHeader(
  props: ProposalListHeaderProps,
): JSX.Element {
  const { setViewMode, viewMode } = props;
  return (
    <div className="w-full flex-col items-center justify-between gap-6 border-b border-gray-500 bg-black/50 py-6 lg:flex lg:flex-row">
      <div className="mx-auto flex w-full max-w-screen-2xl items-center px-4 lg:px-4">
        <div className="flex w-full items-center justify-start gap-3">
          <button
            className={`w-1/2 border border-gray-500 px-5 py-2 lg:w-auto ${viewMode === "proposals" ? "border-green-500 bg-green-500/5 text-green-500" : "bg-green-600/5 text-gray-500 hover:border-green-600 hover:text-green-600"}`}
            onClick={() => {
              setViewMode("proposals");
            }}
            type="button"
          >
            Proposals View
          </button>
          <button
            className={`w-1/2 border border-gray-500 px-5 py-2 lg:w-auto ${viewMode === "daos" ? "border-green-500 bg-green-500/5 text-green-500" : "bg-green-600/5 text-gray-500 hover:border-green-600 hover:text-green-600"}`}
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
    </div>
  );
}
