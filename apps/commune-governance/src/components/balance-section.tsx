"use client";

import Image from "next/image";
import { Skeleton } from "./skeleton";
import { usePolkadot } from "@repo/providers/src/context/polkadot";
import { formatToken } from "@repo/providers/src/utils";

export function BalanceSection({ className }: { className?: string }) {
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

  const handleShowStakeWeight = () => {
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
          <button onClick={() => handleConnect()}>Connect your wallet</button>
        </div>
      );
    }
    return <Skeleton className="w-1/5 py-3 md:mt-1 lg:w-2/5" />;
  };

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
          <Image src={"/dao-icon.svg"} width={40} height={40} alt="Dao Icon" />
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
            src={"/wallet-icon.svg"}
            width={40}
            height={40}
            alt="Wallet Icon"
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
            src={"/globe-icon.svg"}
            width={40}
            height={40}
            alt="Globe Icon"
          />
        </div>
      </div>
    </div>
  );
}
