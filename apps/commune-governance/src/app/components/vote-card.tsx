"use client";

import { useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/20/solid";
import { match } from "rustie";

import type { ProposalStatus, TransactionResult } from "@commune-ts/types";
import { useCommune } from "@commune-ts/providers/use-commune";
import { WalletButton } from "@commune-ts/wallet";

import type { Vote } from "./vote-label";
import { Card } from "./card";
import { SectionHeaderText } from "./section-header-text";

export function VoteCard(props: {
  proposalStatus: ProposalStatus;
  proposalId: number;
  voted: Vote;
}): JSX.Element {
  const { proposalId, voted = "UNVOTED", proposalStatus } = props;
  const { isConnected, voteProposal } = useCommune();

  const [vote, setVote] = useState("UNVOTED");
  const [votingStatus, setVotingStatus] = useState<TransactionResult>({
    status: null,
    finalized: false,
    message: null,
  });

  function handleVotePreference(value: Vote): void {
    if (vote === "UNVOTED" || vote !== value) {
      setVote(value);
      return;
    }
    if (vote === value) {
      setVote("UNVOTED");
    }
  }

  function handleCallback(callbackReturn: TransactionResult): void {
    setVotingStatus(callbackReturn);
  }

  function handleVote(): void {
    void voteProposal({ proposalId, vote, callback: handleCallback });
  }

  if (voted !== "UNVOTED") {
    return (
      <Card.Root>
        <Card.Header>
          <SectionHeaderText text="Cast your vote" />
        </Card.Header>
        <Card.Body className="flex w-full flex-col space-y-4 p-6">
          <span>You already voted!</span>
        </Card.Body>
      </Card.Root>
    );
  }

  return match(proposalStatus)({
    open() {
      return (
        <>
          <SectionHeaderText text="Cast your vote" />
          {isConnected ? (
            <div className="flex w-full gap-4">
              <button
                className={`w-full border border-green-600 py-1 ${vote === "FAVORABLE" ? "border-green-500 bg-green-500/10 text-green-500" : "text-green-600"} ${votingStatus.status === "PENDING" && "cursor-not-allowed"}`}
                disabled={votingStatus.status === "PENDING"}
                onClick={() => {
                  handleVotePreference("FAVORABLE");
                }}
                type="button"
              >
                Favorable
              </button>
              <button
                className={`w-full border border-red-600 py-1 ${vote === "AGAINST" ? "border-red-500 bg-red-500/10 text-red-500" : "text-red-500"} ${votingStatus.status === "PENDING" && "cursor-not-allowed"}`}
                disabled={votingStatus.status === "PENDING"}
                onClick={() => {
                  handleVotePreference("AGAINST");
                }}
                type="button"
              >
                Against
              </button>
            </div>
          ) : null}

          {!isConnected && <WalletButton />}

          {isConnected ? (
            <button
              className={`mt-4 w-full border p-1.5 ${vote === "UNVOTED" || votingStatus.status === "PENDING" ? "cursor-not-allowed border-gray-400 text-gray-400" : "border-blue-400 bg-blue-500/10 text-blue-400"} `}
              disabled={vote === "UNVOTED" || votingStatus.status === "PENDING"}
              onClick={handleVote}
              type="button"
            >
              {vote === "UNVOTED" && "Chose Before Voting"}
              {vote !== "UNVOTED" && "Vote"}
            </button>
          ) : null}

          {votingStatus.status ? (
            <p
              className={`${votingStatus.status === "PENDING" && "text-yellow-300"} ${votingStatus.status === "ERROR" && "text-red-300"} ${votingStatus.status === "SUCCESS" && "text-green-300"} flex text-left text-base`}
            >
              {votingStatus.message}
              {votingStatus.status === "PENDING" && (
                <ArrowPathIcon className="ml-2 animate-spin" width={16} />
              )}
            </p>
          ) : null}
        </>
      );
    },
    accepted() {
      return <ProposalNotOpen statusText="Accepted" />;
    },
    expired() {
      return <ProposalNotOpen statusText="Expired" />;
    },
    refused() {
      return <ProposalNotOpen statusText="Refused" />;
    },
  });
}

function ProposalNotOpen({ statusText }: { statusText: string }): JSX.Element {
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="border border-white/20 bg-[#898989]/5 bg-opacity-80 px-4 py-2 shadow-md">
          <span className="font-semibold text-white">
            This Proposal is {statusText}.
          </span>
        </div>
      </div>

      <div className="relative z-0 opacity-10">
        <SectionHeaderText text="Cast your vote" />
        <div>
          <div className="flex w-full gap-4">
            <button
              className={`w-full border border-green-500 py-1 text-green-500`}
              disabled={true}
            >
              Favorable
            </button>
            <button
              className={`w-full border border-red-500 py-1 text-red-500`}
              disabled={true}
            >
              Against
            </button>
          </div>
          <button className={`mt-4 w-full border p-1.5 `} disabled={true}>
            Vote
          </button>
        </div>
      </div>
    </div>
  );
}
