"use client";

import {
  ArrowPathIcon,
  InformationCircleIcon,
} from "@heroicons/react/20/solid";
import { useState, useEffect } from "react";
import { useCommune } from "@repo/providers/src/context/polkadot";
import type { TransactionResult } from "@repo/providers/src/types";

export function VotingPowerButton(): JSX.Element | null {
  const { selectedAccount, updateDelegatingVotingPower, notDelegatingVoting } =
    useCommune();

  const [votingStatus, setVotingStatus] = useState<TransactionResult>({
    status: null,
    finalized: false,
    message: null,
  });

  const [isPowerUser, setIsPowerUser] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const notDelegatingList = notDelegatingVoting?.toHuman() as string[];

  useEffect(() => {
    if (selectedAccount?.address) {
      const isUserPower = notDelegatingList.includes(selectedAccount.address);
      setIsPowerUser(isUserPower);
    }
  }, [selectedAccount, notDelegatingVoting, notDelegatingList]);

  function handleCallback(callbackReturn: TransactionResult): void {
    setVotingStatus(callbackReturn);
  }

  if (!selectedAccount) {
    return null;
  }

  function handleVote(): void {
    void updateDelegatingVotingPower({
      isDelegating: isPowerUser,
      callback: handleCallback,
    });
  }

  const tooltipText =
    "By default, your voting power is delegated to a validator. If you're not a validator and prefer to manage your own votes, click here!";

  return (
    <div className="p-6">
      <div className="flex w-full flex-row items-center justify-center gap-3">
        <button
          className="w-11/12 border border-gray-500 py-1 font-semibold text-green-500 transition duration-200 hover:border-green-600 hover:bg-green-500/10"
          onClick={() => {
            handleVote();
          }}
          type="submit"
        >
          {isPowerUser ? "Enable vote power delegation" : "Become a Power User"}
        </button>
        <div className="relative w-1/12">
          <button
            onClick={() => {
              setShowTooltip(!showTooltip);
            }}
            onMouseEnter={() => {
              setShowTooltip(true);
            }}
            onMouseLeave={() => {
              setShowTooltip(false);
            }}
            type="button"
          >
            <InformationCircleIcon className="h-7 w-7 pt-1.5 text-green-500" />
          </button>
          {showTooltip ? (
            <div className="absolute bottom-10 right-0 w-64 border border-gray-500 bg-green-950/50 p-2 text-sm text-white shadow-lg backdrop-blur-md">
              {tooltipText}
            </div>
          ) : null}
        </div>
      </div>
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
    </div>
  );
}
