"use client";

import Image from "next/image";

import { useBalance } from "@commune-ts/providers/hooks";
import { useCommune } from "@commune-ts/providers/use-commune";
import { formatToken } from "@commune-ts/providers/utils";

import { Skeleton } from "./skeleton";

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

  const { data: daosTreasuries } = useBalance(api, daoTreasury);

  let userStakeWeight: bigint | null = null;
  if (stakeOut != null && selectedAccount != null) {
    const userStakeEntry = stakeOut.perAddr.get(selectedAccount.address);
    userStakeWeight = userStakeEntry ?? 0n;
  }

  return (
    <div className={`flex w-full items-center justify-center lg:mt-10`}>
      <div
        className={`flex w-full flex-col divide-gray-500 border-b border-white/20 text-2xl text-green-500 lg:flex-row lg:gap-10 lg:pb-5 ${className ?? ""}`}
      >
        <div className="flex flex-row items-center justify-between border-white/20 bg-[#898989]/5 p-6 pr-6 backdrop-blur-md lg:w-1/3 lg:border lg:pr-10">
          <div className="flex flex-col gap-1">
            {!daoTreasury && !isInitialized ? (
              <Skeleton className="w-1/5 py-3 md:mt-1 lg:w-2/5" />
            ) : (
              <p>
                {formatToken(daosTreasuries ?? 0n)}
                <span className="text-lg text-white"> COMAI</span>
              </p>
            )}
            <span className="text-base font-light text-gray-200">
              DAO treasury funds
            </span>
          </div>
          <Image alt="Dao Icon" height={40} src="/dao-icon.svg" width={40} />
        </div>

        <div className="flex flex-row items-center justify-between border-t !border-white/20 bg-[#898989]/5 p-6 pr-6 backdrop-blur-md lg:w-1/3 lg:border lg:pr-10">
          <div className="flex flex-col items-start gap-2">
            {!isInitialized && (
              <Skeleton className="w-1/5 py-3 md:mt-1 lg:w-2/5" />
            )}

            {isInitialized && !selectedAccount?.meta.name && (
              <button
                className="inline-flex items-center justify-center text-gray-300 hover:text-green-600"
                disabled={!isInitialized}
                onClick={handleConnect}
                type="button"
              >
                Connect wallet
              </button>
            )}

            {isInitialized &&
              selectedAccount?.meta.name &&
              typeof balance !== "undefined" && (
                <p>
                  {formatToken(balance)}
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

        <div className="flex flex-row items-center justify-between border-t !border-white/20 bg-[#898989]/5 p-6 pr-6 backdrop-blur-md lg:w-1/3 lg:border lg:pr-10">
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
