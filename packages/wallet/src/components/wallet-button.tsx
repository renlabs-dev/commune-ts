"use client";
import '../output.css'

import { useCommune } from "@commune-ts/providers/use-commune";
import Image from "next/image";

export function WalletButton() {
  const { isInitialized, handleConnect, selectedAccount } = useCommune();

  if (!isInitialized) {
    return (
      <div className="relative inline-flex items-center justify-center gap-3 border border-white/20 bg-[#898989]/5 px-4 py-2 text-gray-400 backdrop-blur-md">
        <Image alt="Wallet Icon" className="h-6 w-6" src="/wallet-icon.svg" width={40} height={40} />
        <span>Loading Wallet Info...</span>
      </div>
    );
  }

  return (
    <button
      className={`hover:text-green-600" relative z-50 inline-flex items-center justify-center gap-3 border border-white/20 bg-[#898989]/5 px-4 py-2 text-gray-400 backdrop-blur-md hover:border-green-600 hover:bg-green-600/5
        ${selectedAccount && "border-green-500 bg-green-500/5 text-green-500"}`}
      onClick={handleConnect}
      disabled={!isInitialized}
      type="button"
    >
      <span className="flex items-center gap-3 font-medium">
        <Image
          alt="Wallet Icon"
          className="w-6"
          height={40}
          width={40}
          src="/wallet-icon.svg"
        />
        {selectedAccount?.meta.name ? (
          <div className="flex flex-col items-start">
            <span className="font-light">
              {selectedAccount.address.slice(0, 8)}…
              {selectedAccount.address.slice(-8)}
            </span>
          </div>
        ) : (
          <span className="text-white">Wallet</span>
        )}
      </span>
    </button>
  );
}
