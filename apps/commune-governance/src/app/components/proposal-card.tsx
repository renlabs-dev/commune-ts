"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import MarkdownPreview from "@uiw/react-markdown-preview";

import type { ProposalState } from "@commune-ts/providers/types";
import { useCommune } from "@commune-ts/providers/use-commune";
import { smallAddress } from "@commune-ts/providers/utils";
import { cairo } from "@commune-ts/ui/fonts";

import type { Vote } from "./vote-label";
import {
  calcProposalFavorablePercent,
  handleCustomProposal,
  handleProposalQuorumPercent,
  handleProposalStakeVoted,
} from "../../utils";
import { Card } from "./card";
import { Label } from "./label";
import { Skeleton } from "./skeleton";
import { StatusLabel } from "./status-label";
import { VoteLabel } from "./vote-label";

export interface ProposalCardProps {
  proposalState: ProposalState;
  voted: Vote;
}

function handlePercentages(
  favorablePercent: number | null,
): JSX.Element | null {
  if (favorablePercent === null) return null;

  const againstPercent = 100 - favorablePercent;
  if (Number.isNaN(favorablePercent)) {
    return (
      <Label className="w-full py-4 text-center text-yellow-500 border border-white/10 lg:w-auto">
        – %
      </Label>
    );
  }
  return (
    <Label className="flex items-center justify-center w-full py-4 space-x-0 text-center border divide-x divide-white/10 border-white/10 lg:w-auto">
      <div className="flex pr-1.5 gap-1">
        <span className="text-green-500">{favorablePercent.toFixed(0)}%</span>
        <Image
          alt="favorable arrow up icon"
          height={14}
          src="/favorable-up.svg"
          width={10}
        />
      </div>
      <div className="flex pl-1.5 gap-1">
        {/* <span className="text-gray-500">{" | "}</span> */}
        <span className="text-red-500"> {againstPercent.toFixed(0)}% </span>
        <Image
          alt="against arrow down icon"
          height={14}
          src="/against-down.svg"
          width={10}
        />
      </div>

    </Label>
  );
}

export function ProposalCard(props: ProposalCardProps): JSX.Element {
  const { proposalState, voted } = props;
  const { stakeOut } = useCommune();
  const { title, body, netuid, invalid } = handleCustomProposal(proposalState);

  return (
    <Card.Root
      className={`${invalid ? "opacity-50" : ""} ${invalid ? "hidden" : ""}`}
      key={proposalState.id}
    >
      <Card.Header className="z-10 flex-col bg-[#898989]/5 backdrop-blur-md">
        {title ? (
          <h2 className="pb-4 text-base font-semibold text-white lg:pb-0">
            {title}
          </h2>
        ) : null}
        {!title && <Skeleton className="w-8/12 py-3 pb-4 mb-3 lg:mb-0" />}

        <div className="flex flex-row justify-center w-full gap-2 mb-2 lg:mb-0 lg:ml-auto lg:w-auto lg:flex-row lg:justify-end lg:pl-4">
          <VoteLabel vote={voted} />

          <div className="flex items-center">
            <span className="border border-white px-4 py-1.5 text-center text-sm font-medium text-white">
              {netuid !== "GLOBAL" ? `Subnet ${netuid}` : "Global"}
            </span>
          </div>
          <StatusLabel result={proposalState.status} />

        </div>
      </Card.Header>

      <Card.Body className="px-0 py-0">
        <div className="p-4 py-10 bg-black/[50%] backdrop-blur-md">
          {body ? (
            <MarkdownPreview
              className={`line-clamp-4 ${cairo.className}`}
              source={body}
              style={{ backgroundColor: "transparent", color: "white" }}
            />
          ) : null}
          {/* TODO: skeleton for markdown body */}
        </div>

        <div className="flex flex-col items-start justify-between border-t bg-[#898989]/5 border-white/20 backdrop-blur-md p-2 lg:flex-row lg:items-center lg:p-4">
          <div className="flex flex-col-reverse w-full lg:flex-row lg:items-center">
            <div className="w-full py-2 mr-3 lg:w-auto lg:min-w-fit lg:py-0">
              <Link
                className="flex items-center w-full px-2 py-4 text-sm text-white border border-white/10 min-w-auto hover:border-green-500 hover:bg-green-500/5 hover:text-green-500 lg:w-auto lg:px-4"
                href={`/proposal/${proposalState.id}`}
              >
                View full proposal
                <ArrowRightIcon className="w-5 ml-auto lg:ml-2" />
              </Link>
            </div>
            <span className="block w-full text-base text-white truncate line-clamp-1">
              Posted by{" "}
              <span className="text-green-500">
                {smallAddress(proposalState.proposer)}
              </span>
            </span>
          </div>

          <div className="flex flex-col-reverse items-center w-full gap-2 mx-auto lg:flex-row lg:justify-end">
            <div className="flex w-full lg:w-auto">
              {handlePercentages(
                calcProposalFavorablePercent(proposalState.status),
              )}
            </div>

            {stakeOut?.total ? (
              <Label className="flex justify-center w-full px-2 py-4 font-medium text-center text-gray-300 border border-white/10 lg:w-auto lg:px-4">
                Stake Voted:
                <span className="font-bold text-green-500">
                  {handleProposalStakeVoted(proposalState.status)}
                </span>
                {handleProposalQuorumPercent(
                  proposalState.status,
                  stakeOut.total,
                )}
              </Label>
            ) : (
              <div className="w-full text-center h-fit lg:w-4/5">
                <span className="flex h-fit w-full animate-pulse bg-gray-700 py-3.5" />
              </div>
            )}
          </div>
        </div>
      </Card.Body>
    </Card.Root>
  );
}
