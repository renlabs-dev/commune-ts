"use client";

import MarkdownPreview from "@uiw/react-markdown-preview";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import type { ProposalState } from "@repo/providers/src/types";
import {
  calcProposalFavorablePercent,
  handleCustomProposal,
  handleProposalQuorumPercent,
  handleProposalStakeVoted,
  smallAddress,
} from "@repo/providers/src/utils";
import { cairo } from "@repo/ui/fonts";
import { useCommune } from "@repo/providers/src/context/polkadot";
import { Card } from "./card";
import { Label } from "./label";
import { Skeleton } from "./skeleton";
import { StatusLabel } from "./status-label";
import type { Vote } from "./vote-label";
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
      <Label className="w-full border border-gray-500 py-1.5 text-center text-yellow-500 lg:w-auto">
        – %
      </Label>
    );
  }
  return (
    <Label className="flex w-full items-center justify-center gap-1.5 border border-gray-500 py-2.5 text-center lg:w-auto">
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

export function ProposalCard(props: ProposalCardProps): JSX.Element {
  const { proposalState, voted } = props;
  const { stakeOut } = useCommune();
  const { title, body, netuid, invalid } = handleCustomProposal(proposalState);

  return (
    <Card.Root
      className={`${invalid ? "opacity-50" : ""} ${invalid ? "hidden" : ""}`}
      key={proposalState.id}
    >
      <Card.Header className="z-10 flex-col">
        {title ? (
          <h2 className="pb-4 text-base font-semibold text-white lg:pb-0">
            {title}
          </h2>
        ) : null}
        {!title && <Skeleton className="mb-3 w-8/12 py-3 pb-4 lg:mb-0" />}

        <div className="mb-2 flex w-full flex-row justify-center gap-2 lg:mb-0 lg:ml-auto lg:w-auto lg:flex-row lg:justify-end lg:pl-4">
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

        <div className="flex flex-col items-start justify-between border-t border-gray-500 p-2 lg:flex-row lg:items-center lg:p-4">
          <div className="flex w-full flex-col-reverse lg:flex-row lg:items-center">
            <div className="mr-3 w-full py-2 lg:w-auto lg:min-w-fit lg:py-0">
              <Link
                className="min-w-auto flex w-full items-center border border-green-500 px-2 py-2 text-sm text-green-500 hover:border-green-600 hover:bg-green-600/5 hover:text-green-600 lg:w-auto lg:px-4"
                href={`/item/proposal/${proposalState.id}`}
              >
                View full proposal
                <ArrowRightIcon className="ml-auto w-5 lg:ml-2" />
              </Link>
            </div>
            <span className="line-clamp-1 block w-full truncate text-base text-green-500">
              Posted by{" "}
              <span className="text-white">
                {smallAddress(proposalState.proposer)}
              </span>
            </span>
          </div>

          <div className="mx-auto flex w-full flex-col-reverse items-center gap-2 lg:flex-row lg:justify-end">
            <div className="flex w-full lg:w-auto">
              {handlePercentages(
                calcProposalFavorablePercent(proposalState.status),
              )}
            </div>

            {stakeOut?.total ? (
              <Label className="flex w-full justify-center border border-gray-500 px-2 py-2.5 text-center font-medium text-gray-300 lg:w-auto lg:px-4">
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
              <div className="h-fit w-full text-center lg:w-4/5">
                <span className="flex h-fit w-full animate-pulse bg-gray-700 py-3.5" />
              </div>
            )}
          </div>
        </div>
      </Card.Body>
    </Card.Root>
  );
}
