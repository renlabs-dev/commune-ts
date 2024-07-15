"use client";

import { ArrowPathIcon } from "@heroicons/react/20/solid";

import type {
  ProposalStatus,
  SS58Address,
} from "@commune-ts/providers/types";
import { useCommune } from "@commune-ts/providers/use-commune";
import { formatToken, smallAddress } from "@commune-ts/providers/utils";

import type { Vote } from "../../../components/vote-label";
import {
  calcProposalFavorablePercent,
  handleCustomProposal,
} from "../../../../utils";
import { MarkdownView } from "../../../components/markdown-view";
import { StatusLabel } from "../../../components/status-label";
import { VoteCard } from "../../../components/vote-card";
import { VoteLabel } from "../../../components/vote-label";
import { VotingPowerButton } from "../../../components/voting-power-button";

interface CustomContent {
  paramId: number;
}

function renderVoteData(favorablePercent: number | null): JSX.Element | null {
  if (favorablePercent === null) return null;

  const againstPercent = 100 - favorablePercent;
  return (
    <>
      <div className="flex justify-between">
        <span className="text-sm font-semibold">Favorable</span>
        <div className="flex items-center gap-2 divide-x">
          <span className="text-xs">{favorablePercent} COMAI</span>
          <span className="pl-2 text-sm font-semibold text-green-500">
            {favorablePercent.toFixed(2)}%
          </span>
        </div>
      </div>
      <div className="bg-section-gray my-2 w-full">
        <div
          className="bg-green-400 py-2"
          style={{
            width: `${favorablePercent.toFixed(0)}%`,
          }}
        />
      </div>
      <div className="mt-8 flex justify-between">
        <span className="font-semibold">Against</span>
        <div className="flex items-center gap-2 divide-x">
          <span className="text-xs">{formatToken(againstPercent)} COMAI</span>
          <span className="pl-2 text-sm font-semibold text-red-500">
            {againstPercent.toFixed(2)}%
          </span>
        </div>
      </div>
      <div className="bg-section-gray my-2 w-full">
        <div
          className="bg-red-400 py-2"
          style={{
            width: `${againstPercent.toFixed(0)}%`,
          }}
        />
      </div>
    </>
  );
}

const handleUserVotes = ({
  proposalStatus,
  selectedAccountAddress,
}: {
  proposalStatus: ProposalStatus;
  selectedAccountAddress: SS58Address;
}): Vote => {
  if (!Object.prototype.hasOwnProperty.call(proposalStatus, "open"))
    return "UNVOTED";

  if (
    "open" in proposalStatus &&
    proposalStatus.open.votesFor.includes(selectedAccountAddress)
  ) {
    return "FAVORABLE";
  }
  if (
    "open" in proposalStatus &&
    proposalStatus.open.votesAgainst.includes(selectedAccountAddress)
  ) {
    return "AGAINST";
  }

  return "UNVOTED";
};

export function ProposalExpandedView(props: CustomContent): JSX.Element {
  const { paramId } = props;

  const {
    selectedAccount,
    proposalsWithMeta,
    isProposalsLoading,
  } = useCommune();

  function handleProposalsContent() {
    const proposal = proposalsWithMeta?.find((p) => p.id === paramId);
    if (!proposal) return null;

    const { body, netuid, title, invalid } = handleCustomProposal(proposal);

    const voted = handleUserVotes({
      proposalStatus: proposal.status,
      selectedAccountAddress: selectedAccount?.address as SS58Address,
    });

    const CustomContent = {
      body,
      title,
      netuid,
      invalid,
      id: proposal.id,
      status: proposal.status,
      author: proposal.proposer,
      expirationBlock: proposal.expirationBlock,
      voted,
    };
    return CustomContent;
  }

  function handleContent() {
    return handleProposalsContent();
  }

  const content = handleContent();

  if (isProposalsLoading || !content)
    return (
      <div className="flex w-full items-center justify-center lg:h-[calc(100svh-203px)]">
        <h1 className="text-2xl text-white">Loading...</h1>
        <ArrowPathIcon className="ml-2 animate-spin" color="#FFF" width={20} />
      </div>
    );

  return (
    <>
      <div className="flex flex-col lg:h-[calc(100svh-203px)] lg:w-2/3 lg:overflow-auto">
        <div className="border-b border-gray-500 p-6">
          <h2 className="text-base font-semibold">{content.title}</h2>
        </div>
        <div className="h-full p-6 lg:overflow-auto">
          <MarkdownView source={(content.body as string | undefined) ?? ""} />
        </div>
      </div>

      <div className="flex flex-col lg:w-1/3">
        <div className="border-b border-t border-gray-500 p-6 pr-20 lg:border-t-0">
          <div className="flex flex-col gap-3">
            <div>
              <span className="text-gray-500">ID</span>
              <span className="flex items-center">{content.id}</span>
            </div>

            <div>
              <span className="text-gray-500">Author</span>
              <span className="flex items-center">
                {smallAddress(content.author)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Expiration block</span>
              <span className="flex items-center">
                {content.expirationBlock}
              </span>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-500 p-6">
          <div className="flex items-center gap-3">
            <VoteLabel vote={content.voted!} />
            <span className="border border-white px-4 py-1.5 text-center text-sm font-medium text-white">
              {(content.netuid !== "GLOBAL" && (
                <span> Subnet {content.netuid} </span>
              )) || <span> Global </span>}
            </span>
            <StatusLabel result={content.status as ProposalStatus} />
          </div>
        </div>

        <VoteCard proposalId={content.id} voted="UNVOTED" />
        <div className="border-b border-gray-500 p-6">
          <VotingPowerButton />
        </div>
        <div className="w-full border-gray-500 p-6 lg:border-b">
          {renderVoteData(
            calcProposalFavorablePercent(content.status as ProposalStatus),
          )}
        </div>
      </div>
    </>
  );
}
