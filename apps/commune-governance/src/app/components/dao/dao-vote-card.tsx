"use client";

import { useState } from "react";
import { BackspaceIcon, ReceiptRefundIcon } from "@heroicons/react/24/outline";

import type {
  DaoApplicationStatus,
  DaoApplicationVote,
} from "@commune-ts/types";
import { useCommune } from "@commune-ts/providers/use-commune";
import { toast } from "@commune-ts/providers/use-toast";
import { WalletButton } from "@commune-ts/wallet";

import { api } from "~/trpc/react";
import { GovernanceStatusNotOpen } from "../governance-status-not-open";
import { SectionHeaderText } from "../section-header-text";

type DaoApplicationVoteExtended = DaoApplicationVote | "UNVOTED";

export function DaoVoteCard(props: {
  daoStatus: DaoApplicationStatus;
  daoId: number;
}) {
  const { daoId, daoStatus } = props;
  const { isConnected, selectedAccount } = useCommune();

  const [vote, setVote] = useState<DaoApplicationVoteExtended>("UNVOTED");

  const { data: votes } = api.dao.byId.useQuery({ id: daoId });
  const { data: cadreUsers } = api.dao.byCadre.useQuery();

  const userVote = votes?.find(
    (vote) => vote.userKey === selectedAccount?.address,
  );

  const createVoteMutation = api.dao.createVote.useMutation({
    onSuccess: () => {
      toast.success("Vote submitted successfully!");
      setTimeout(() => {
        window.location.reload();
      }, 700);
    },
    onError: (error) => {
      toast.error(`Error submitting vote: ${error.message}`);
    },
  });

  const deleteVoteMutation = api.dao.deleteVote.useMutation({
    onSuccess: () => {
      toast.success("Vote removed successfully!");
      setVote("UNVOTED");
      setTimeout(() => {
        window.location.reload();
      }, 700);
    },
    onError: (error) => {
      toast.error(`Error removing vote: ${error.message}`);
    },
  });

  function handleRemoveFromWhitelist(): void {
    if (!selectedAccount?.address) {
      toast.error("Please connect your wallet to vote.");
      return;
    }

    if (!cadreUsers?.some((user) => user.userKey === selectedAccount.address)) {
      toast.error("Only Cadre members can vote to remove from the whitelist.");
      return;
    }

    if (userVote) {
      // If user has already voted, first remove the existing vote
      deleteVoteMutation.mutate(
        {
          userKey: selectedAccount.address,
          daoId,
        },
        {
          onSuccess: () => {
            // After successful deletion, create a new "remove" vote
            createVoteMutation.mutate({
              daoId,
              userKey: selectedAccount.address,
              daoVoteType: "REMOVE",
            });
          },
        },
      );
    } else {
      // If user hasn't voted yet, directly create a "remove" vote
      createVoteMutation.mutate({
        daoId,
        userKey: selectedAccount.address,
        daoVoteType: "REMOVE",
      });
    }
  }

  function handleVotePreference(value: DaoApplicationVoteExtended): void {
    if (vote === "UNVOTED" || vote !== value) {
      setVote(value);
      return;
    }
    if (vote === value) {
      setVote("UNVOTED");
    }
  }

  function handleVote(): void {
    if (!selectedAccount?.address) {
      toast.error("Please connect your wallet to vote.");
      return;
    }

    let daoVoteType: "ACCEPT" | "REFUSE" | "REMOVE"; // TODO: vote
    switch (vote) {
      case "FAVORABLE":
        daoVoteType = "ACCEPT";
        break;
      case "AGAINST":
        daoVoteType = "REFUSE";
        break;
      case "REMOVE":
        daoVoteType = "REMOVE";
        break;
      default:
        toast.error("Invalid vote type.");
        return;
    }

    createVoteMutation.mutate({
      daoId,
      userKey: selectedAccount.address,
      daoVoteType,
    });
  }

  function handleRemoveVote(): void {
    if (!selectedAccount?.address) {
      toast.error("Please connect your wallet to remove your vote.");
      return;
    }

    deleteVoteMutation.mutate({
      userKey: selectedAccount.address,
      daoId,
    });
  }

  if (userVote) {
    return (
      <>
        <SectionHeaderText text="Cast your vote" />
        <div className="flex w-full flex-col gap-2">
          <span>
            You already voted to{" "}
            {userVote.daoVoteType === "Accepted" ? (
              <b className="text-green-500">Accept</b>
            ) : userVote.daoVoteType === "Refused" ? (
              <b className="text-red-500">Refuse</b>
            ) : (
              <b className="text-red-500">Remove from the whitelist</b>
            )}{" "}
          </span>
          <button
            className="flex w-full items-center justify-between text-nowrap border border-amber-500 bg-amber-600/5 px-4 py-2.5 text-center font-semibold text-amber-500 transition duration-200 hover:border-amber-400 hover:bg-amber-500/15 active:bg-amber-500/50"
            onClick={handleRemoveVote}
            type="button"
            disabled={deleteVoteMutation.isPending}
          >
            {deleteVoteMutation.isPending ? "Removing..." : "Remove Vote"}{" "}
            <ReceiptRefundIcon className="h-5 w-5" />
          </button>
        </div>
      </>
    );
  }

  switch (daoStatus) {
    case "Pending":
      return (
        <>
          <SectionHeaderText text="Cast your vote" />
          {isConnected ? (
            <>
              <div className="flex w-full gap-4">
                <button
                  className={`w-full border border-green-600 py-1 ${
                    vote === "FAVORABLE"
                      ? "border-green-500 bg-green-500/10 text-green-500"
                      : "text-green-600"
                  } ${createVoteMutation.isPending && "cursor-not-allowed"}`}
                  onClick={() => handleVotePreference("FAVORABLE")}
                  type="button"
                  disabled={createVoteMutation.isPending}
                >
                  Approve
                </button>
                <button
                  className={`w-full border border-red-600 py-1 ${
                    vote === "AGAINST"
                      ? "border-red-500 bg-red-500/10 text-red-500"
                      : "text-red-500"
                  } ${createVoteMutation.isPending && "cursor-not-allowed"}`}
                  onClick={() => handleVotePreference("AGAINST")}
                  type="button"
                  disabled={createVoteMutation.isPending}
                >
                  Refuse
                </button>
              </div>
              <button
                className={`mt-4 w-full border p-1.5 ${
                  vote === "UNVOTED" || createVoteMutation.isPending
                    ? "cursor-not-allowed border-gray-400 text-gray-400"
                    : "border-blue-400 bg-blue-500/10 text-blue-400"
                } `}
                disabled={vote === "UNVOTED" || createVoteMutation.isPending}
                onClick={handleVote}
                type="button"
              >
                {createVoteMutation.isPending
                  ? "Voting..."
                  : vote === "UNVOTED"
                    ? "Choose Before Voting"
                    : "Vote"}
              </button>
            </>
          ) : null}

          {!isConnected && <WalletButton />}
        </>
      );
    case "Accepted":
      return (
        <div>
          <GovernanceStatusNotOpen
            statusText="Accepted"
            governanceModel="DAO"
          />

          {isConnected ? (
            <button
              className="mt-6 flex w-full items-center justify-between text-nowrap border border-red-500 bg-amber-600/5 px-4 py-2.5 text-center font-semibold text-red-500 transition duration-200 hover:border-red-400 hover:bg-red-500/15 active:bg-red-500/50"
              onClick={handleRemoveFromWhitelist}
              type="button"
              disabled={
                createVoteMutation.isPending || deleteVoteMutation.isPending
              }
            >
              {createVoteMutation.isPending || deleteVoteMutation.isPending
                ? "Processing..."
                : "Vote to remove from whitelist"}{" "}
              <BackspaceIcon className="h-5 w-5" />
            </button>
          ) : (
            <WalletButton />
          )}
        </div>
      );
    case "Removed":
      return (
        <GovernanceStatusNotOpen statusText="Removed" governanceModel="DAO" />
      );
    case "Refused":
      return (
        <GovernanceStatusNotOpen statusText="Refused" governanceModel="DAO" />
      );
  }
}
