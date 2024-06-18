"use client";

import { ArrowPathIcon } from "@heroicons/react/20/solid";
import { formatToken, smallAddress } from "@repo/communext/utils";
import type {
  DaoStatus,
  ProposalStatus,
  SS58Address,
} from "@repo/communext/types";
import { useCommune } from "@repo/providers/src/context/commune";
import { MarkdownView } from "../../../components/markdown-view";
import { VoteLabel, type Vote } from "../../../components/vote-label";
import { StatusLabel } from "../../../components/status-label";
import { DaoStatusLabel } from "../../../components/dao-status-label";
import { VotingPowerButton } from "../../../components/voting-power-button";
import {
  calcProposalFavorablePercent,
  handleCustomDaos,
  handleCustomProposal,
} from "../../../../utils";
import { VoteCard } from "../../../components/vote-card";

interface CustomContent {
  paramId: number;
  contentType: string;
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
      <div className="bg-dark my-2 w-full">
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
      <div className="bg-dark my-2 w-full">
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

export function ExpandedView(props: CustomContent): JSX.Element {
  const { paramId, contentType } = props;

  const {
    selectedAccount,
    daosWithMeta,
    isDaosLoading,
    proposalsWithMeta,
    isProposalsLoading,
  } = useCommune();

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function handleProposalsContent() {
    const proposal = proposalsWithMeta.find((p) => p.id === paramId);
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

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function handleDaosContent() {
    const dao = daosWithMeta.find((d) => d.id === paramId);
    if (!dao) return null;

    const { body, title } = handleCustomDaos(dao.id, dao.customData ?? null);

    const daoContent = {
      body,
      title,
      status: dao.status,
      author: dao.userId,
      id: dao.id,
      expirationBlock: null,
      invalid: null,
      netuid: null,
      voted: null,
      stakeInfo: null,
    };
    return daoContent;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function handleContent() {
    if (contentType === "dao") {
      return handleDaosContent();
    }
    if (contentType === "proposal") {
      return handleProposalsContent();
    }
    return null;
  }

  function handleIsLoading(type: string | undefined): boolean {
    switch (type) {
      case "dao":
        return isDaosLoading;

      case "proposal":
        return isProposalsLoading;

      default:
        return false;
    }
  }

  const isLoading = handleIsLoading(contentType);

  const content = handleContent();

  if (isLoading || !content)
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

            {content.expirationBlock ? (
              <div>
                <span className="text-gray-500">Expiration block</span>
                <span className="flex items-center">
                  {content.expirationBlock}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="border-b border-gray-500 p-6">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
            <VoteLabel vote={content.voted!} />
            {contentType === "proposal" && (
              <span className="border border-white px-4 py-1.5 text-center text-sm font-medium text-white">
                {(content.netuid !== "GLOBAL" && (
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                  <span> Subnet {content.netuid} </span>
                )) || <span> Global </span>}
              </span>
            )}
            {contentType === "dao" ? (
              <DaoStatusLabel result={content.status as DaoStatus} />
            ) : (
              <StatusLabel result={content.status as ProposalStatus} />
            )}
          </div>
        </div>

        {contentType == "proposal" && (
          <>
            <VoteCard proposalId={content.id} voted="UNVOTED" />
            <div className="border-b border-gray-500 p-6">
              <VotingPowerButton />
            </div>
            <div className="w-full border-gray-500 p-6 lg:border-b">
              {renderVoteData(
                calcProposalFavorablePercent(content.status as ProposalStatus),
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
