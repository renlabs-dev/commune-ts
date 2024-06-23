"use client";

import Image from "next/image";

import type { InjectedAccountWithMeta } from "../types";

interface PolkadotHook {
  handleConnect: () => void;
  isInitialized: boolean;
  selectedAccount: InjectedAccountWithMeta | null;
}

interface WalletButtonProps {
  hook: PolkadotHook;
}

export function WalletButton({ hook }: WalletButtonProps): JSX.Element {
  const { handleConnect, isInitialized, selectedAccount } = hook;

  if (!isInitialized) {
    return (
      <div className="relative inline-flex items-center justify-center gap-3 border border-gray-500 px-4 py-2 text-gray-400 hover:border-green-600 hover:bg-green-600/5 hover:text-green-600 active:top-1">
        <Image
          alt="Wallet Icon"
          className="w-6"
          height={40}
          src="/wallet-icon.svg"
          width={40}
        />
        <span>Loading Wallet Info...</span>
      </div>
    );
  }

  function formatString(text: string): string {
    if (text.length > 10) return `${text.slice(0, 10)}...`;
    return text;
  }

  return (
    <button
      className={`relative inline-flex items-center justify-center gap-3 border border-gray-500 px-4 py-2 text-gray-400 hover:border-green-600 hover:bg-green-600/5 hover:text-green-600 ${
        selectedAccount && "border-green-500 bg-green-500/5 text-green-500"
      }`}
      disabled={!isInitialized}
      onClick={handleConnect}
      type="button"
    >
      <span className="flex items-center gap-3 font-medium">
        <Image
          alt="Wallet Icon"
          className="w-6"
          height={40}
          src="/wallet-icon.svg"
          width={40}
        />
        {selectedAccount?.meta.name ? (
          <div className="flex flex-col items-start">
            <span className="font-light">
              {selectedAccount.address.slice(0, 8)}…
              {selectedAccount.address.slice(-8)}
            </span>
          </div>
        ) : (
          <span className="text-white">Connect Wallet</span>
        )}
      </span>
    </button>
  );
}
