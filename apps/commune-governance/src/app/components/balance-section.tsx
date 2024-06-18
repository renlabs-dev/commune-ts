/* eslint-disable no-nested-ternary */
"use client";

import Image from "next/image";
import { useCommune } from "@repo/providers/src/context/commune";
import { useEffect, useState } from "react";
import { toast } from "@repo/providers/src/context/toast";
import { LinkIcon } from "@heroicons/react/20/solid";
import { queryBalance } from "@repo/communext/queries";
import { Skeleton } from "./skeleton";
import { formatToken, smallAddress } from "@repo/communext/utils";

export function BalanceSection({
  className,
}: {
  className?: string;
}): JSX.Element {
  const {
    isInitialized,
    handleConnect,
    daoTreasury,
    balance,
    selectedAccount,
    stakeOut,
    api,
  } = useCommune();

  const [daosTreasuries, setDaosTreasuries] = useState<string | null>(null);

  useEffect(() => {
    if (isInitialized && api && daoTreasury) {
      void queryBalance(api, daoTreasury).then((daoBalance) => {
        setDaosTreasuries(daoBalance);
      });
    }
  }, [isInitialized, api, daoTreasury]);

  let userStakeWeight: bigint | null = null;
  if (stakeOut != null && selectedAccount != null) {
    const userStakeEntry = stakeOut.perAddr.get(selectedAccount.address);
    userStakeWeight = userStakeEntry ?? 0n;
  }

  function handleCopyClick(): void {
    navigator.clipboard
      .writeText(daoTreasury as string)
      .then(() => {
        toast.success("Treasury address copied to clipboard");
      })
      .catch(() => {
        toast.error("Failed to copy treasury address");
      });
  }

  return (
    <div
      className={`w-full justify-between border-b border-gray-500 text-2xl text-green-500 ${className ?? ""}`}
    >
      <div className="mx-auto flex w-full flex-col divide-gray-500 lg:max-w-screen-2xl lg:flex-row lg:divide-x lg:px-6">
        <div className="flex flex-row items-center justify-between border-b border-gray-500 p-6 pr-6 lg:w-1/3 lg:border-b-0 lg:pr-10">
          <div className="flex flex-col gap-1">
            {!daosTreasuries && !isInitialized ? (
              <Skeleton className="w-1/5 py-3 md:mt-1 lg:w-2/5" />
            ) : (
              <p>
                {daosTreasuries}
                <span className="text-lg text-white"> COMAI</span>
              </p>
            )}
            <span className="text-base font-light text-gray-200">
              DAO treasury funds
            </span>
            <button
              className="flex flex-row items-center gap-1 text-center text-base font-light text-gray-400 hover:underline"
              onClick={handleCopyClick}
              type="button"
            >
              {daoTreasury ? (
                <>
                  <LinkIcon className="h-4 w-4" /> {smallAddress(daoTreasury)}
                </>
              ) : null}
            </button>
          </div>
          <Image alt="Dao Icon" height={40} src="/dao-icon.svg" width={40} />
        </div>

        <div className="flex flex-row items-center justify-between border-b border-gray-500 p-6 pr-6 lg:w-1/3 lg:border-b-0 lg:pr-10">
          <div className="flex flex-col items-start gap-2">
            {!isInitialized ? (
              <Skeleton className="w-1/5 py-3 md:mt-1 lg:w-2/5" />
            ) : !balance || !selectedAccount?.meta.name ? (
              <button
                className="inline-flex items-center justify-center text-gray-300 hover:text-green-600"
                disabled={!isInitialized}
                onClick={handleConnect}
                type="button"
              >
                Connect wallet
              </button>
            ) : (
              <p>
                {balance}
                <span className="text-lg text-white"> COMAI</span>
              </p>
            )}
            <span className="text-base font-light text-gray-200">
              Your total free balance
            </span>
          </div>
          <Image
            alt="Wallet Icon"
            height={40}
            src="/wallet-icon.svg"
            width={40}
          />
        </div>

        <div className="flex flex-row items-center justify-between border-b border-gray-500 p-6 pr-6 lg:w-1/3 lg:border-b-0 lg:pr-10">
          <div className="flex flex-col items-start gap-2">
            {!isInitialized ||
            (selectedAccount?.meta.name && userStakeWeight == null) ? (
              <Skeleton className="w-1/5 py-3 md:mt-1 lg:w-2/5" />
            ) : !selectedAccount?.meta.name || userStakeWeight == null ? (
              <button
                className="inline-flex items-center justify-center text-gray-300 hover:text-green-600"
                disabled={!isInitialized}
                onClick={handleConnect}
                type="button"
              >
                Connect wallet
              </button>
            ) : (
              <p>
                {formatToken(userStakeWeight)}{" "}
                <span className="text-lg text-white"> COMAI</span>
              </p>
            )}
            <span className="text-base font-light text-gray-200">
              Your total Staked balance
            </span>
          </div>
          <Image
            alt="Globe Icon"
            height={40}
            src="/globe-icon.svg"
            width={40}
          />
        </div>
      </div>
    </div>
  );
}
