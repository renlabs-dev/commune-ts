"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";

import type { InjectedAccountWithMeta } from "@commune-ts/ui";
import { useCommune } from "@commune-ts/providers/use-commune";
import { oxanium } from "@commune-ts/ui/fonts";

export const IntroSection = () => {
  const { accounts, setSelectedAccount, setIsConnected, handleConnect } =
    useCommune();
  const [showWallets, setShowWallets] = useState(false);

  const handleConnectWallet = async () => {
    await handleConnect();
    setShowWallets(true);
  };

  const handleBack = () => {
    setShowWallets(false);
  };

  const handleSelectWallet = (account: InjectedAccountWithMeta) => {
    setSelectedAccount(account);
    setIsConnected(true);
  };

  return (
    <>
      {showWallets ? (
        <div className="flex w-full max-w-screen-lg animate-fade-up flex-col items-center justify-center divide-y divide-white/20 border border-white/20 bg-[#898989]/5 p-6 backdrop-blur-md">
          <div className="flex w-full animate-fade-up items-center justify-between pb-4">
            <button
              onClick={handleBack}
              className="text-green-500 hover:text-green-400"
            >
              <span className="flex items-center">
                <ChevronLeftIcon className="h-6 w-6" />{" "}
                <p className="text-lg">BACK</p>
              </span>
            </button>
            <h2 className={`${oxanium.className} text-xl`}>Select Wallet</h2>
          </div>
          <div className="flex w-full animate-fade-up flex-col gap-2 pt-6 animate-delay-300">
            {accounts && accounts.length > 0 ? (
              accounts.map((account, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectWallet(account)}
                  className="w-full border border-white/20 p-4 text-left transition duration-200 hover:bg-white/10"
                >
                  <p className="font-semibold">{account.meta.name}</p>
                  <p className="text-sm text-gray-400">{account.address}</p>
                </button>
              ))
            ) : (
              <p className="text-center text-gray-400">No wallets found</p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex w-full max-w-screen-lg animate-fade-up flex-col items-center justify-center divide-y divide-white/20 border border-white/20 bg-[#898989]/5 p-6 backdrop-blur-md">
          <div className="col-span-1 flex items-center pb-6">
            <Image
              src="/logo-green.svg"
              width={45}
              height={45}
              alt="commune logo"
              priority
              className="mr-[3px] animate-fade-up animate-delay-200"
            />
            <h2
              className={`${oxanium.className} ml-2 animate-fade-up text-2xl animate-delay-200`}
            >
              Commune AI Wallet
            </h2>
          </div>
          <p className="w-full animate-fade-up py-6 text-center text-lg text-gray-300 animate-delay-300">
            Enjoy full control over your assets with our non-custodial wallet,
            designed for user <span className="text-green-500">autonomy</span>{" "}
            and <span className="text-green-500">security</span>.
          </p>
          <div className="flex w-full animate-fade-up space-x-4 pt-6 animate-delay-500">
            <button
              onClick={handleConnectWallet}
              className="w-full border border-green-500 bg-green-600/5 py-2.5 text-lg font-semibold text-green-500 transition duration-200 hover:border-green-400 hover:bg-green-500/15 hover:text-green-400"
            >
              <p>Connect Wallet</p>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
