import { LinkIcon } from "@heroicons/react/20/solid";

import type { SS58Address } from "@commune-ts/providers/types";
import { toast } from "@commune-ts/providers/use-toast";
import { smallAddress } from "@commune-ts/providers/utils";

import { CreateModal } from "./modal";

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

  function handleViewChange(event: React.ChangeEvent<HTMLSelectElement>): void {
    setViewMode(event.target.value as "proposals" | "daos");
  }

  return (
    <div className="mt-10 flex w-full flex-row justify-between gap-6 divide-gray-500 lg:mt-0 lg:max-w-screen-2xl lg:pt-5">
      <div
        className={`hidden w-full animate-fade-down flex-col justify-end gap-1 animate-delay-300 lg:flex`}
      >
        <p className="flex items-center text-pretty text-base font-light text-gray-200">
          DAO treasury address:
        </p>
        <button
          className="flex h-full w-full items-center justify-center border border-white/20 bg-[#898989]/5 p-5 text-white backdrop-blur-md hover:border-green-500 lg:flex-col xl:flex-row"
          onClick={handleCopyClick}
        >
          {daoTreasury ? (
            <span className="flex text-pretty text-white hover:text-green-500">
              <LinkIcon className="mr-2 h-5 w-5" />
              {smallAddress(daoTreasury)}
            </span>
          ) : (
            <span className="flex animate-pulse text-pretty text-white hover:text-green-500">
              <LinkIcon className="mr-2 h-5 w-5" />
              Loading address...
            </span>
          )}
        </button>
      </div>
      <div className="flex w-full animate-fade-down flex-col items-start justify-start gap-1 pt-[1px] animate-delay-500">
        <p className="flex items-center text-pretty pb-0.5 text-base font-light text-gray-200">
          View mode:
        </p>
        <select
          className="w-full border-r-[16px] border-transparent bg-[#898989]/5 p-[14px] px-6 pb-[17px] text-white outline-none outline-1 outline-white/25 backdrop-blur-md transition duration-300 hover:bg-green-500/5 hover:text-green-500 hover:outline-green-500"
          value={viewMode}
          onChange={handleViewChange}
        >
          <option value="proposals" className="bg-gray-900">
            Proposals View
          </option>
          <option value="daos" className="bg-gray-900">
            S2 Applications
          </option>
        </select>
      </div>
      <div className="hidden w-full flex-col items-start gap-1 lg:flex">
        <p className="flex animate-fade-down items-center text-pretty text-base font-light text-gray-200 animate-delay-700">
          Want to change something:
        </p>
        <CreateModal />
      </div>
    </div>
  );
}
