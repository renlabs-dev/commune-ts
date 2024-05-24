"use client";

import Image from "next/image";
import { usePolkadot } from "../context/polkadot";

export function WalletButton(): JSX.Element {
  const { handleConnect, isInitialized, selectedAccount } = usePolkadot();

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center px-4">Close Icon</div>
    );
  }

  function formatString(text: string): string {
    if (text.length > 10) return `${text.slice(0, 10)}...`;
    return text;
  }

  return (
    <button
      className={`relative inline-flex items-center justify-center gap-3 px-4 py-2 border border-gray-500 text-gray-400 active:top-1 hover:border-green-600 hover:text-green-600 hover:bg-green-600/5 ${selectedAccount && "text-green-500 border-green-500 bg-green-500/5"}`}
      disabled={!isInitialized}
      onClick={handleConnect}
      type="button"
    >
      <span className="flex items-center gap-3 font-medium">
        <Image
          alt="Dao Icon"
          className="w-6"
          height={40}
          src="/wallet-icon.svg"
          width={40}
        />
        {selectedAccount?.meta.name ? (
          <div className="flex flex-col items-start">
            <span className="text-lg font-light">
              {formatString(selectedAccount.meta.name)}
            </span>
          </div>
        ) : (
          <span className="text-lg text-white">Connect Wallet</span>
        )}
      </span>
    </button>
  );
}
