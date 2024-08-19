"use client";

import { useCommune } from "@commune-ts/providers/use-commune";

import { IntroSection } from "./intro";
import { Wallet } from "./wallet";

export function MainSection() {
  const {
    // Wallet
    balance,
    stakeOut,
    // Connections
    handleConnect,
    selectedAccount,
    // Transactions
    addStake,
    removeStake,
    transfer,
    transferStake,
  } = useCommune();
  return (
    <main className="flex min-h-[86dvh] flex-col items-center justify-center gap-3 text-white">
      {selectedAccount ? (
        <Wallet.Root>
          <Wallet.Header
            handleConnect={handleConnect}
            selectedAccount={selectedAccount}
          />
          <Wallet.Balance
            balance={balance ? balance : 0n}
            stakeOut={stakeOut}
            selectedAccount={selectedAccount}
          />
          <Wallet.Actions
            addStake={addStake}
            removeStake={removeStake}
            transfer={transfer}
            transferStake={transferStake}
          />
        </Wallet.Root>
      ) : (
        <IntroSection />
      )}
    </main>
  );
}
