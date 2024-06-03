"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { InjectedAccountWithMeta } from "../types";

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
      className={`ui-fixed ui-inset-0 ui-z-[100] ${open ? "ui-block" : "ui-hidden"}`}
      role="dialog"
    >
      {/* Modal */}
      <div className="ui-fixed ui-right-0 ui-top-16 ui-z-10 ui-overflow-y-auto">
        <div className="ui-flex ui-min-h-full ui-items-center ui-justify-center ui-p-4 ui-text-center">
          <div className="ui-relative ui-w-[100%] ui-max-w-3xl ui-transform ui-overflow-hidden ui-border ui-bg-black/70 ui-text-left ui-text-white ui-backdrop-blur-sm">
            {/* Modal Header */}
            <div className="ui-flex ui-flex-col ui-items-center ui-justify-between ui-gap-3 ui-border-b ui-p-6 md:ui-flex-row">
              <div className="ui-flex ui-flex-col ui-items-center md:ui-flex-row">
                <Image
                  alt="Module Logo"
                  height={32}
                  src="/logo.svg"
                  width={32}
                />
                <h3 className="ui-pl-2 ui-text-xl ui-font-light ui-leading-6">
                  Select Wallet
                </h3>
              </div>
              <button
                className="ui-border ui-p-2 ui-transition ui-duration-200"
                onClick={() => {
                  setOpen(false);
                }}
                type="button"
              >
                Close
              </button>
            </div>

            {/* Modal Body */}
            <div className="ui-flex ui-flex-col ui-gap-y-4 ui-overflow-y-auto ui-p-6">
              {wallets.map((item) => (
                <button
                  className={`ui-text-md ui-flex ui-cursor-pointer ui-items-center ui-gap-x-3 ui-overflow-auto ui-border ui-p-5 ${selectedAccount === item ? "ui-border-green-500" : "ui-border-white"}`}
                  key={item.address}
                  onClick={() => {
                    setSelectedAccount(item);
                  }}
                  type="button"
                >
                  <div className="ui-flex ui-flex-col ui-items-start ui-gap-1">
                    <span className="font-semibold">{item.meta.name}</span>
                    <span>{item.address}</span>
                  </div>
                </button>
              ))}
              {!wallets.length && (
                <div className="ui-flex ui-h-full ui-flex-col ui-items-center ui-justify-center ui-gap-4 ui-text-center ui-text-sm ui-text-gray-300">
                  <div className="ui-flex ui-flex-col ui-gap-2">
                    <p>
                      <b className="ui-text-red-500">No wallet found</b>. Please
                      install a Wallet extension or check permission settings.
                    </p>
                  </div>
                  <p>
                    If you don&apos;t have a wallet, we recomend one of these:
                  </p>
                  <div className="ui-flex ui-gap-3">
                    <Link
                      className="ui-text-blue-600"
                      href="https://subwallet.app/"
                      rel="noreferrer"
                      target="_blank"
                    >
                      SubWallet
                    </Link>
                    <Link
                      className="ui-text-blue-600"
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
                className={`ui-w-full ui-border ui-p-4 ui-text-xl ui-font-semibold ${selectedAccount ? "ui-border-green-500 ui-text-green-500" : "ui-border-gray-500 ui-text-gray-300"} ui-transition hover:ui-bg-white/5`}
                disabled={!selectedAccount}
                onClick={() => {
                  if (!selectedAccount) {
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
