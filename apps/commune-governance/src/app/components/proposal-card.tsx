"use client";

import MarkdownPreview from "@uiw/react-markdown-preview";
import Image from "next/image";
import { assert } from "tsafe";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import type {
  ProposalStakeInfo,
  ProposalState,
  ProposalStatus,
} from "@repo/providers/src/types";
import {
  bigintDivision,
  formatToken,
  smallAddress,
} from "@repo/providers/src/utils";
import { cairo } from "@repo/ui/fonts";
import { Card } from "./card";
import { Label } from "./label";
import { Skeleton } from "./skeleton";
import { StatusLabel } from "./status-label";
import type { Vote } from "./vote-label";
import { VoteLabel } from "./vote-label";
import { handleProposal } from "./proposal-fields";

export interface ProposalCardProps {
  proposal: ProposalState;
  stakeInfo: ProposalStakeInfo | null;
  voted: Vote;
}

function handleFavorablePercent(favorablePercent: number): JSX.Element {
  const againstPercent = 100 - favorablePercent;
  if (Number.isNaN(favorablePercent)) {
    return (
      <Label className="w-full py-1.5 text-center text-yellow-500 border border-gray-500 lg:w-auto">
        – %
      </Label>
    );
  }
  return (
    <Label className="flex w-full items-center justify-center gap-1.5 border-gray-500 border py-2.5 text-center lg:w-auto">
      <span className="text-green-500">{favorablePercent.toFixed(0)}%</span>
      <Image
        alt="favorable arrow up icon"
        height={14}
        src="/favorable-up.svg"
        width={10}
      />
      <span className="text-gray-500">{" / "}</span>
      <span className="text-red-500"> {againstPercent.toFixed(0)}% </span>
      <Image
        alt="against arrow down icon"
        height={14}
        src="/against-down.svg"
        width={10}
      />
    </Label>
  );
}

function renderFavorablePercent(stakeInfo: ProposalStakeInfo): JSX.Element {
  const { stakeFor, stakeAgainst, stakeVoted } = stakeInfo;
  assert(
    stakeFor + stakeAgainst == stakeVoted,
    "stakeFor + stakeAgainst != stakeVoted"
  );
  const favorablePercent = bigintDivision(stakeFor, stakeVoted) * 100;
  return handleFavorablePercent(favorablePercent);
}

function renderQuorumPercent(stakeInfo: ProposalStakeInfo): JSX.Element {
  const { stakeVoted, stakeTotal } = stakeInfo;
  const quorumPercent = bigintDivision(stakeVoted, stakeTotal) * 100;
  return (
    <span className="text-yellow-600">
      {" ("}
      {quorumPercent.toFixed(2)} %)
    </span>
  );
}

export function ProposalCard(props: ProposalCardProps): JSX.Element {
  const { proposal, stakeInfo, voted } = props;

  const { title, body, netuid, invalid } = handleProposal(proposal);

  return (
    <Card.Root
      className={`${invalid ? "opacity-50" : ""} ${invalid ? "hidden" : ""}`}
      key={proposal.id}
    >
      <Card.Header className="z-10 flex-col">
        {title ? (
          <h2 className="pb-4 text-base font-semibold text-white lg:pb-0">
            {title}
          </h2>
        ) : null}
        {!title && <Skeleton className="w-8/12 py-3 pb-4 mb-3 lg:mb-0" />}

        <div className="flex flex-row justify-center w-full gap-2 mb-2 lg:mb-0 lg:ml-auto lg:w-auto lg:flex-row lg:justify-end lg:pl-4">
          <VoteLabel vote={voted} />
          <div className="flex items-center">
            <span className="border text-white border-white px-4 py-1.5 text-center text-sm font-medium">
              {netuid !== "GLOBAL" ? `Subnet ${netuid}` : "Global"}
            </span>
          </div>
          <StatusLabel result={proposal.status as ProposalStatus} />
        </div>
      </Card.Header>

      <Card.Body className="px-0 py-0">
        <div className="p-4 py-10">
          {body ? (
            <MarkdownPreview
              className={`line-clamp-4 ${cairo.className}`}
              source={body}
              style={{ backgroundColor: "transparent", color: "white" }}
            />
          ) : null}
          {/* TODO: skeleton for markdown body */}
        </div>

        <div className="flex flex-col items-start justify-between p-2 border-t border-gray-500 lg:p-4 lg:flex-row lg:items-center">
          <div className="flex flex-col-reverse w-full lg:items-center lg:flex-row">
            <div className="w-full py-2 mr-3 lg:py-0 lg:w-auto lg:min-w-fit">
              <Link
                className="flex items-center w-full px-2 py-2 text-sm text-green-500 border border-green-500 hover:bg-green-600/5 hover:border-green-600 hover:text-green-600 lg:px-4 min-w-auto lg:w-auto"
                href={`proposal/${proposal.id}`}
              >
                View full proposal
                <ArrowRightIcon className="w-5 ml-auto lg:ml-2" />
              </Link>
            </div>
            <span className="block w-full text-base text-green-500 truncate line-clamp-1">
              Posted by{" "}
              <span className="text-white">
                {smallAddress(proposal.proposer)}
              </span>
            </span>
          </div>

          <div className="flex flex-col-reverse items-center w-full gap-2 mx-auto lg:flex-row lg:justify-end">
            {!stakeInfo && (
              <div className="flex items-center w-full space-x-2 lg:justify-end">
                <span className="flex w-full animate-pulse bg-gray-700 py-3.5 lg:w-3/12" />
              </div>
            )}
            {stakeInfo ? (
              <div className="flex w-full lg:w-auto">
                {renderFavorablePercent(stakeInfo)}
              </div>
            ) : null}

            {!stakeInfo && (
              <div className="w-full text-center lg:w-4/5">
                <span className="flex w-full animate-pulse bg-gray-700 py-3.5" />
              </div>
            )}

            {stakeInfo ? (
              <Label className="w-full px-2 lg:px-4 border-gray-500 border text-gray-300 py-2.5 text-center flex justify-center font-medium lg:w-auto">
                Total staked:
                <span className="font-bold text-green-500">
                  {formatToken(stakeInfo.stakeVoted)}
                </span>
                <span className="text-xs text-gray-300 font-extralight">
                  COMAI
                </span>
                {renderQuorumPercent(stakeInfo)}
              </Label>
            ) : null}
          </div>
        </div>
      </Card.Body>
    </Card.Root>
  );
}
