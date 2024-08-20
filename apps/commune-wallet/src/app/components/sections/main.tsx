"use client";

import { useEffect, useState } from "react";

import { useCommune } from "@commune-ts/providers/use-commune";

import { IntroSection } from "./intro";
import { Wallet } from "./wallet";

export function MainSection() {
  const {
    // Wallet
    balance,
    stakeOut,
    // Connections
    selectedAccount,
    // Transactions
    addStake,
    removeStake,
    transfer,
    transferStake,
  } = useCommune();

  const [showWallets, setShowWallets] = useState(false);
  const [userStakeWeight, setUserStakeWeight] = useState<bigint | null>(null);

  function calculateUserStakeWeight() {
    if (stakeOut != null && selectedAccount != null) {
      const userStakeEntry = stakeOut.perAddr.get(selectedAccount.address);
      return userStakeEntry ?? 0n;
    }
    return null;
  }

  const refreshUserStakeWeight = () => {
    const newUserStakeWeight = calculateUserStakeWeight();
    setUserStakeWeight(newUserStakeWeight);
  };

  useEffect(() => {
    refreshUserStakeWeight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccount, stakeOut]);

  const handleSwitchWallet = () => {
    setShowWallets(true);
  };

  return (
    <main className="flex min-h-[86dvh] flex-col items-center justify-center gap-3 text-white">
      {selectedAccount && !showWallets ? (
        <>
          <p className="animate-fade text-gray-400 animate-delay-700">
            MAIN NET
          </p>
          <Wallet.Root>
            <Wallet.Header
              selectedAccount={selectedAccount}
              onSwitchWallet={handleSwitchWallet}
            />
            <Wallet.Balance
              balance={balance ? balance : 0n}
              userStakeWeight={userStakeWeight}
              selectedAccount={selectedAccount}
            />
            <Wallet.Actions
              addStake={addStake}
              removeStake={removeStake}
              transfer={transfer}
              transferStake={transferStake}
              selectedAccount={selectedAccount}
            />
          </Wallet.Root>
        </>
      ) : (
        <IntroSection
          showWallets={showWallets}
          setShowWallets={setShowWallets}
          onWalletSwitch={refreshUserStakeWeight}
        />
      )}
    </main>
  );
}
