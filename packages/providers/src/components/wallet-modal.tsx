"use client";

import Image from "next/image";
import { useState } from "react";
import { type InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import Link from "next/link";
import { toast } from "../context/toast";

export function WalletModal({
  open,
  wallets,
  setOpen,
  handleWalletSelections,
}: {
  open: boolean;
  setOpen: (args: boolean) => void;
  wallets: InjectedAccountWithMeta[];
  handleWalletSelections: (arg: InjectedAccountWithMeta) => void;
}): JSX.Element {
  const [selectedAccount, setSelectedAccount] =
    useState<InjectedAccountWithMeta>();

  return (
    <div
      className={`fixed inset-0 z-[100] ${open ? "block" : "hidden"} animate-fade-in-down`}
      role="dialog"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[url(/bg-pattern.svg)]" />

      {/* Modal */}
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <div className="relative w-[100%] max-w-3xl transform overflow-hidden border bg-black/50 text-left text-white">
            {/* Modal Header */}
            <div className="flex flex-col items-center justify-between gap-3 border-b p-6 md:flex-row">
              <div className="flex flex-col items-center md:flex-row">
                <Image
                  alt="Module Logo"
                  height={32}
                  src="/logo.svg"
                  width={32}
                />
                <h3 className="pl-2 text-xl font-light leading-6">
                  Select Wallet
                </h3>
              </div>
              <button
                className="border p-2 transition duration-200"
                onClick={() => {
                  setOpen(false);
                }}
                type="button"
              >
                Close Icon
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex flex-col gap-y-4 overflow-y-auto p-6">
              {wallets.map((item) => (
                <button
                  className={`text-md flex cursor-pointer items-center gap-x-3 overflow-auto border p-5 ${selectedAccount === item ? "border-green-500" : " border-white"}`}
                  key={item.address}
                  onClick={() => {
                    setSelectedAccount(item);
                  }}
                  type="button"
                >
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-semibold">{item.meta.name}</span>
                    <span>{item.address}</span>
                  </div>
                </button>
              ))}
              {!wallets.length && (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-sm text-gray-300">
                  <div className="flex flex-col gap-2">
                    <p>
                      <b className="text-red-500">No wallet found</b>. Please
                      install a Wallet extension or check permission settings.
                    </p>
                  </div>
                  <p>
                    If you don&apos;t have a wallet, we recomend one of these:
                  </p>
                  <div className="flex gap-3">
                    <Link
                      className="text-blue-600"
                      href="https://subwallet.app/"
                      rel="noreferrer"
                      target="_blank"
                    >
                      SubWallet
                    </Link>
                    <Link
                      className="text-blue-600"
                      href="https://polkadot.js.org/extension/"
                      rel="noreferrer"
                      target="_blank"
                    >
                      Polkadot JS
                    </Link>
                  </div>
                </div>
              )}
              <button
                className={`w-full border  p-4 text-xl font-semibold ${selectedAccount ? "border-green-500  text-green-500" : "border-gray-500 text-gray-300"} transition hover:bg-white/5`}
                disabled={!selectedAccount}
                onClick={() => {
                  if (!selectedAccount) {
                    toast.error("No account selected");
                    return;
                  }
                  handleWalletSelections(selectedAccount);
                }}
                type="button"
              >
                Connect Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
