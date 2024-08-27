"use client";

import type { ProposalStatus } from "@commune-ts/types";
import { useProcessVotesAndStakes } from "@commune-ts/providers/hooks";
import { useCommune } from "@commune-ts/providers/use-commune";
import { formatToken, smallAddress } from "@commune-ts/utils";

import { SectionHeaderText } from "./section-header-text";

interface VoterListProps {
  proposalStatus: ProposalStatus;
}

export function VoterList({ proposalStatus }: VoterListProps): JSX.Element {
  const { api } = useCommune();

  const votesFor = "open" in proposalStatus ? proposalStatus.open.votesFor : [];
  const votesAgainst =
    "open" in proposalStatus ? proposalStatus.open.votesAgainst : [];

  const {
    data: voters,
    isLoading,
    isError,
  } = useProcessVotesAndStakes(api, votesFor, votesAgainst);

  if (isLoading) {
    return (
      <div className="m-2 h-full animate-fade-down border border-white/20 bg-[#898989]/5 p-6 text-gray-400 backdrop-blur-md animate-delay-[1200ms]">
        <SectionHeaderText text="Voters List" />
        <p className="animate-pulse">Loading voters...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="m-2 h-full animate-fade-down border border-white/20 bg-[#898989]/5 p-6 text-gray-400 backdrop-blur-md animate-delay-[1200ms]">
        <SectionHeaderText text="Voters List" />
        <p>Error loading voters. Please try again later.</p>
      </div>
    );
  }

  if (!voters || voters.length === 0) {
    return (
      <div className="m-2 h-full animate-fade-down border border-white/20 bg-[#898989]/5 p-6 text-gray-400 backdrop-blur-md animate-delay-[1200ms]">
        <SectionHeaderText text="Voters List" />
        <p>This proposal has no voters yet or is closed.</p>
      </div>
    );
  }

  const sortedVoters = [...voters].sort((a, b) => Number(b.stake - a.stake));

  return (
    <div className="m-2 h-full animate-fade-down border border-white/20 bg-[#898989]/5 p-6 text-gray-400 backdrop-blur-md animate-delay-[1200ms]">
      <SectionHeaderText text="Voters List" />
      <div className="max-h-72 overflow-y-auto">
        {sortedVoters.map(({ address, vote, stake }, index) => (
          <div key={index} className="mb-2 flex items-end justify-between pr-2">
            <span className="text-white">
              {smallAddress(address as string)}
            </span>
            <div className="flex flex-col items-end">
              <span
                className={
                  vote === "In Favor" ? "text-green-500" : "text-red-500"
                }
              >
                {vote}
              </span>
              <span className="text-sm text-gray-400">
                {stake === 0n ? "Delegated" : formatToken(Number(stake))}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
