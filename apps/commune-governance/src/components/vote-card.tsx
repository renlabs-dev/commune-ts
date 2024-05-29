"use client";

import { useState } from "react";
import { Card } from "./card";

import { ArrowPathIcon } from "@heroicons/react/20/solid";
import { TransactionResult } from "@repo/providers/src/types";
import { usePolkadot } from "@repo/providers/src/context/polkadot";
import { Vote } from "./vote-label";
import { WalletButton } from "@repo/providers";

export const VoteCard = (props: { proposalId: number; voted: Vote }) => {
  const { proposalId, voted = "UNVOTED" } = props;
  const { isConnected, voteProposal } = usePolkadot();

  const [vote, setVote] = useState("UNVOTED");
  const [votingStatus, setVotingStatus] = useState<TransactionResult>({
    status: null,
    finalized: false,
    message: null,
  });

  const handleVotePreference = (value: Vote) => {
    if (vote === "UNVOTED" || vote !== value) return setVote(value);
    if (vote === value) return setVote("UNVOTED");
  };

  const handleCallback = (callbackReturn: TransactionResult) => {
    setVotingStatus(callbackReturn);
  };

  const handleVote = () => {
    voteProposal({ proposalId, vote, callback: handleCallback });
  };

  if (voted !== "UNVOTED") {
    return (
      <Card.Root>
        <Card.Header>
          <h3 className="text-base font-semibold">Cast your vote</h3>
        </Card.Header>
        <Card.Body className="flex flex-col w-full p-6 space-y-4">
          <span>You already voted!</span>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root className="bg-transparent border-none">
      <Card.Header>
        <h3 className="text-base font-semibold">Cast your vote</h3>
      </Card.Header>
      <Card.Body className="flex flex-col w-full p-6 space-y-4 border-b border-gray-500">
        {isConnected && (
          <div className="flex w-full gap-4">
            <button
              disabled={!isConnected || votingStatus.status === "PENDING"}
              className={`w-full border border-green-600 py-1 ${vote === "FAVORABLE" ? "bg-green-500/20 border-green-500 text-green-500" : "text-green-600"} ${votingStatus.status === "PENDING" && "cursor-not-allowed"}`}
              onClick={() => handleVotePreference("FAVORABLE")}
            >
              Favorable
            </button>
            <button
              disabled={!isConnected || votingStatus.status === "PENDING"}
              className={`w-full border border-red-600 py-1 ${vote === "AGAINST" ? "bg-red-500/20 text-red-500 border-red-500" : "text-red-500 "} ${votingStatus.status === "PENDING" && "cursor-not-allowed"}`}
              onClick={() => handleVotePreference("AGAINST")}
            >
              Against
            </button>
          </div>
        )}

        {!isConnected && <WalletButton />}

        {isConnected && (
          <button
            onClick={handleVote}
            disabled={vote === "UNVOTED" || votingStatus.status === "PENDING"}
            className={`w-full border p-1.5 ${vote === "UNVOTED" || votingStatus.status === "PENDING" ? "cursor-not-allowed border-gray-400 text-gray-400" : "border-blue-400 bg-blue-400/20 text-blue-400"} `}
          >
            {vote === "UNVOTED" && "Chose Before Voting"}
            {vote !== "UNVOTED" && "Vote"}
          </button>
        )}

        {votingStatus.status && (
          <p
            className={`${votingStatus.status === "PENDING" && "text-yellow-300"} ${votingStatus.status === "ERROR" && "text-red-300"} ${votingStatus.status === "SUCCESS" && "text-green-300"} flex text-left text-base`}
          >
            {votingStatus.message}
            {votingStatus.status === "PENDING" && (
              <ArrowPathIcon width={16} className="ml-2 animate-spin" />
            )}
          </p>
        )}
      </Card.Body>
    </Card.Root>
  );
};
