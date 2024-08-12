"use client";

import { useState } from "react";
import {
  ChevronDoubleDownIcon,
  ChevronDoubleUpIcon,
  UserIcon,
} from "@heroicons/react/20/solid";

import type { ProposalStatus, SS58Address } from "@commune-ts/providers/types";
import { useCommune } from "@commune-ts/providers/use-commune";
import { toast } from "@commune-ts/providers/use-toast";
import { formatToken, smallAddress } from "@commune-ts/providers/utils";

import { api } from "~/trpc/react";
import { ReportComment } from "./report-comment";

export enum VoteType {
  UP = "UP",
  DOWN = "DOWN",
}

export function ProposalComment({
  proposalId,
  proposalStatus,
}: {
  proposalId: number;
  proposalStatus: ProposalStatus;
}) {
  const { selectedAccount } = useCommune();
  const [votingCommentId, setVotingCommentId] = useState<string | null>(null);
  const [localVotes, setLocalVotes] = useState<Record<string, VoteType | null>>(
    {},
  );

  function getVoterStake(address: SS58Address) {
    if (!selectedAccount?.address) return null;

    if ("open" in proposalStatus) {
      const { votesFor, votesAgainst, stakeFor, stakeAgainst } =
        proposalStatus.open;

      if (votesFor.includes(address)) {
        return `${formatToken(stakeFor / BigInt(votesFor.length))} COMAI`;
      }

      if (votesAgainst.includes(address)) {
        return `${formatToken(stakeAgainst / BigInt(votesAgainst.length))} COMAI`;
      }
    }
    return null;
  }

  const {
    data: proposalComments,
    error,
    isLoading,
    refetch,
  } = api.proposalComment.byId.useQuery(
    { proposalId },
    { enabled: !!proposalId },
  );

  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "mostUpvotes">(
    "oldest",
  );

  const sortedComments = proposalComments
    ? [...proposalComments].sort((a, b) => {
        if (sortBy === "newest") {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        } else if (sortBy === "oldest") {
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        } else {
          return b.upvotes - a.upvotes;
        }
      })
    : [];

  const { data: userVotes } = api.proposalComment.byUserId.useQuery(
    { proposalId, userKey: selectedAccount?.address ?? "" },
    { enabled: !!selectedAccount?.address && !!proposalId },
  );

  const castVoteMutation = api.proposalComment.castVote.useMutation({
    onSuccess: () => refetch(),
  });

  const deleteVoteMutation = api.proposalComment.deleteVote.useMutation({
    onSuccess: () => refetch(),
  });

  if (error) {
    console.error("Error fetching proposal comments:", error);
  }

  const handleVote = async (commentId: string, voteType: VoteType) => {
    if (!selectedAccount?.address) {
      return toast.error("Please connect your wallet to vote");
    }

    setVotingCommentId(commentId);

    try {
      const comment = proposalComments?.find((c) => c.id === commentId);
      if (!comment) return;

      const currentVote = localVotes[commentId] ?? userVotes?.[commentId];

      if (currentVote === voteType) {
        await deleteVoteMutation.mutateAsync({
          commentId,
          userKey: selectedAccount.address,
        });
        setLocalVotes((prev) => ({ ...prev, [commentId]: null }));
      } else {
        await castVoteMutation.mutateAsync({
          commentId,
          userKey: selectedAccount.address,
          voteType,
        });
        setLocalVotes((prev) => ({ ...prev, [commentId]: voteType }));
      }
    } catch (err) {
      console.error("Error voting:", err);
    } finally {
      setVotingCommentId(null);
    }
  };

  return (
    <div className="flex w-full flex-col">
      <div className="m-2 flex h-full min-h-max animate-fade-down flex-col items-center justify-between border border-white/20 bg-[#898989]/5 p-6 text-white backdrop-blur-md animate-delay-200">
        <div className="mb-4 flex w-full flex-col items-center justify-between gap-1 border-b border-gray-500 border-white/20 pb-2 text-gray-400 md:flex-row">
          <h2 className="w-full text-start font-semibold">
            Community Comments
          </h2>
          <div className="flex w-full space-x-2 md:justify-end">
            {["oldest", "newest", "mostUpvotes"].map((option) => (
              <button
                key={option}
                onClick={() => setSortBy(option as typeof sortBy)}
                className={`px-3 py-1 text-sm ${
                  sortBy === option
                    ? "border border-green-500 bg-green-500/20 text-white"
                    : "border border-white/20 bg-[#898989]/5 text-gray-300 hover:bg-gray-600/50"
                }`}
              >
                {option === "newest"
                  ? "Newest"
                  : option === "oldest"
                    ? "Oldest"
                    : "Most Upvotes"}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <>
            <div className="flex w-full animate-pulse flex-col gap-2 border border-white/20 bg-[#898989]/5 p-2">
              <div className="flex justify-between border-b border-white/20 px-2 py-1 pb-2">
                <span className="flex items-center gap-1">
                  <UserIcon className="h-4 w-4" /> Loading user address...
                </span>
                <div className="flex gap-1">
                  <button
                    disabled={true}
                    className={`flex items-center text-gray-300`}
                  >
                    <ChevronDoubleUpIcon className="h-5 w-5" />
                    <span>-</span>
                  </button>
                  <button
                    disabled={true}
                    className={`flex items-center text-gray-300`}
                  >
                    <ChevronDoubleDownIcon className="h-5 w-5" />
                    <span>-</span>
                  </button>
                </div>
              </div>
              <p className="p-2">Loading...</p>
            </div>
          </>
        ) : (
          <>
            {sortedComments.length ? (
              <div className="flex max-h-[25vh] w-full flex-col gap-3 overflow-auto pb-3">
                {sortedComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="relative flex w-full flex-col gap-2 border border-white/20 bg-[#898989]/5 p-2 pb-4"
                  >
                    <div className="flex justify-between border-b border-white/20 px-2 py-1 pb-2">
                      <span className="flex items-center gap-1">
                        <UserIcon className="h-4 w-4" />{" "}
                        {smallAddress(comment.userKey)}
                        <span className="ml-2 text-sm text-gray-400">
                          {formatToken(
                            Number(
                              getVoterStake(comment.userKey as SS58Address),
                            ),
                          )}{" "}
                          COMAI
                        </span>
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleVote(comment.id, VoteType.UP)}
                          disabled={votingCommentId === comment.id}
                          className={`flex items-center ${
                            (localVotes[comment.id] ??
                              userVotes?.[comment.id]) === VoteType.UP
                              ? "text-green-500"
                              : ""
                          }`}
                        >
                          <ChevronDoubleUpIcon className="h-5 w-5" />
                          <span>{comment.upvotes}</span>
                        </button>
                        <button
                          onClick={() => handleVote(comment.id, VoteType.DOWN)}
                          disabled={votingCommentId === comment.id}
                          className={`flex items-center ${
                            (localVotes[comment.id] ??
                              userVotes?.[comment.id]) === VoteType.DOWN
                              ? "text-red-500"
                              : ""
                          }`}
                        >
                          <ChevronDoubleDownIcon className="h-5 w-5" />
                          <span>{comment.downvotes}</span>
                        </button>
                      </div>
                    </div>
                    <p className="p-2">{comment.content}</p>
                    <div className="absolute bottom-2 right-2">
                      <ReportComment commentId={comment.id} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No comments yet</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
