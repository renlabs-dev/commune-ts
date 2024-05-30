"use client";

import Image from "next/image";
import { usePolkadot } from "@repo/providers/src/context/polkadot";
import { formatToken } from "@repo/providers/src/utils";
import { Skeleton } from "./skeleton";

export function BalanceSection({
  className,
}: {
  className?: string;
}): JSX.Element {
  const {
    isInitialized,
    handleConnect,
    globalDaoTreasury,
    balance,
    selectedAccount,
    stakeData,
  } = usePolkadot();

  let userStakeWeight: bigint | null = null;
  if (stakeData != null && selectedAccount != null) {
    const userStakeEntry = stakeData.stakeOut.perAddr.get(
      selectedAccount.address
    );
    userStakeWeight = userStakeEntry ?? 0n;
  }

  function handleShowStakeWeight(): JSX.Element {
    if (userStakeWeight != null) {
      return (
        <p>
          {formatToken(userStakeWeight)}
          <span className="text-lg text-white"> COMAI</span>
        </p>
      );
    }

    if (isInitialized && !selectedAccount) {
      return (
        <div>
          <button
            onClick={() => {
              handleConnect();
            }}
            type="button"
          >
            Connect your wallet
          </button>
        </div>
      );
    }
    return <Skeleton className="w-1/5 py-3 md:mt-1 lg:w-2/5" />;
  }

  return (
    <div
      className={`w-full justify-between border-b border-gray-500 text-2xl text-green-500 ${className ?? ""}`}
    >
      <div className="mx-auto flex w-full flex-col divide-gray-500 lg:max-w-6xl lg:flex-row lg:divide-x lg:px-6">
        <div className="flex flex-row items-center justify-between border-b border-gray-500 p-6 pr-6 lg:w-1/3 lg:border-b-0 lg:pr-10">
          <div>
            {!isInitialized ? (
              <Skeleton className="w-1/5 py-3 md:mt-1 lg:w-2/5" />
            ) : (
              <p>
                {globalDaoTreasury}
                <span className="text-lg text-white"> COMAI</span>
              </p>
            )}
            <span className="text-base font-thin text-gray-400">
              DAO treasury funds
            </span>
          </div>
          <Image alt="Dao Icon" height={40} src="/dao-icon.svg" width={40} />
        </div>

        <div className="flex flex-row items-center justify-between border-b border-gray-500 p-6 pr-6 lg:w-1/3 lg:border-b-0 lg:pr-10">
          <div>
            {!balance || !selectedAccount ? (
              <Skeleton className="w-1/5 py-3 md:mt-1 lg:w-2/5" />
            ) : (
              <p>
                {balance}
                <span className="text-lg text-white"> COMAI</span>
              </p>
            )}
            <span className="text-base font-thin text-gray-400">
              Your on balance
            </span>
          </div>
          <Image
            alt="Wallet Icon"
            height={40}
            src="/wallet-icon.svg"
            width={40}
          />
        </div>

        <div className="flex flex-row items-center justify-between p-6 pr-6 lg:w-1/3 lg:pr-10">
          <div>
            {handleShowStakeWeight()}
            <span className="text-base font-thin text-gray-400">
              Your total staked balance
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
