"use client";

import React, { useState } from "react";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";

import type {
  Stake,
  StakeOutData,
  TransactionResult,
  Transfer,
  TransferStake,
} from "@commune-ts/subspace/types";
import type { InjectedAccountWithMeta } from "@commune-ts/ui";
import { formatToken } from "@commune-ts/subspace/utils";
import { CopyButton } from "@commune-ts/ui";
import { Loading } from "@commune-ts/ui/loading";

import type { ColorType, MenuType } from "~/utils/types";
import { Icon } from "../icon";
import { IconButton } from "../icon-button";

interface WalletProps {
  root: {
    children: React.ReactNode;
  };
  header: {
    handleConnect: () => void;
    selectedAccount: InjectedAccountWithMeta;
  };
  actions: {
    addStake: (stake: Stake) => Promise<void>;
    removeStake: (stake: Stake) => Promise<void>;
    transfer: (transfer: Transfer) => Promise<void>;
    transferStake: (transfer: TransferStake) => Promise<void>;
  };
  balance: {
    balance: bigint;
    stakeOut: StakeOutData | undefined;
    selectedAccount: InjectedAccountWithMeta;
  };
}

function WalletRoot(props: WalletProps["root"]) {
  return (
    <div className="flex w-full max-w-screen-lg animate-fade-up flex-col items-center justify-center divide-y divide-white/20 border border-white/20 bg-[#898989]/5 p-6 backdrop-blur-md">
      {props.children}
    </div>
  );
}

function WalletHeader(props: WalletProps["header"]) {
  return (
    <div className="flex w-full flex-col items-center justify-center text-lg text-gray-300">
      <p className="py-2">MAIN NET</p>
      <div className="flex w-full flex-col gap-4 pb-4 md:flex-row">
        <div className="flex w-full items-center justify-center gap-2 text-nowrap border border-white/20 bg-[#898989]/5 px-4 py-2.5 font-semibold">
          <Icon src="wallet-icon.svg" className="h-7 w-7" />
          <span className="flex gap-1">
            <p className="text-green-500">
              {props.selectedAccount.meta.name?.toUpperCase()}
            </p>
            <p>/ {props.selectedAccount.address}</p>
          </span>
        </div>
        <CopyButton code={props.selectedAccount.address} />
        <button
          onClick={props.handleConnect}
          className="flex w-fit items-center text-nowrap border border-green-500 bg-green-600/5 px-6 py-2.5 font-semibold text-green-500 transition duration-200 hover:border-green-400 hover:bg-green-500/15"
        >
          <ChevronLeftIcon className="h-6 w-6" /> Switch Wallet
        </button>
      </div>
    </div>
  );
}

function WalletBalance(props: WalletProps["balance"]) {
  let userStakeWeight: bigint | null = null;
  if (props.stakeOut != null) {
    const userStakeEntry = props.stakeOut.perAddr.get(
      props.selectedAccount.address,
    );
    userStakeWeight = userStakeEntry ?? 0n;
  }
  return (
    <div className="flex w-full animate-fade flex-col gap-4 border-white/20 py-4 text-white animate-delay-500">
      <div className="border border-white/20 p-4">
        <div className="flex w-full justify-between gap-6">
          <div>
            <p className="text-xl text-green-500">
              {formatToken(props.balance)}
              <span className="ml-1 text-sm font-light text-gray-400">
                COMAI
              </span>
            </p>
            <p className="text-xs text-gray-500">Free Balance</p>
          </div>
          <div className="text-right">
            <p className="text-xl text-red-500">
              {props.stakeOut
                ? formatToken(Number(userStakeWeight))
                : "Loading..."}
              <span className="ml-1 text-sm font-light text-gray-400">
                COMAI
              </span>
            </p>
            <p className="text-xs text-gray-500">Staked Balance</p>
          </div>
        </div>
        {userStakeWeight ? (
          <div className="relative flex h-2 w-full pt-1">
            <span
              className="absolute h-2 bg-green-500"
              style={{
                width: `${Number(formatToken(Number(userStakeWeight))).toFixed(2)}%`,
              }}
            />
            <span className="h-2 w-full bg-red-500" />
          </div>
        ) : (
          <div className="relative flex h-2 w-full animate-pulse pt-1">
            <span
              className="absolute h-2 bg-green-500/20"
              style={{
                width: `50%`,
              }}
            />
            <span className="h-2 w-full bg-red-500/20" />
          </div>
        )}
      </div>
    </div>
  );
}

function WalletActions(props: WalletProps["actions"]) {
  const [activeMenu, setActiveMenu] = useState<MenuType>(null);

  // Fields
  const [validator, setValidator] = useState<string>("");
  const [fromValidator, setFromValidator] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  // Field Validation
  const [inputError, setInputError] = useState<{
    validator: string | null;
    value: string | null;
  }>({
    validator: null,
    value: null,
  });

  const buttons = [
    {
      src: "send-icon.svg",
      text: "Send",
      color: "red",
    },
    {
      src: "stake-icon.svg",
      text: "Stake",
      color: "amber",
    },
    {
      src: "unstake-icon.svg",
      text: "Unstake",
      color: "purple",
    },
    {
      src: "transfer-icon.svg",
      text: "Transfer Stake",
      color: "green",
    },
  ];

  const [transactionStatus, setTransactionStatus] = useState<TransactionResult>(
    {
      status: null,
      message: null,
      finalized: false,
    },
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const handleCallback = (callbackReturn: TransactionResult) => {
      setTransactionStatus(callbackReturn);
    };

    setTransactionStatus({
      status: "STARTING",
      finalized: false,
      message: "Starting transaction...",
    });

    const handleCheckInput = () => {
      setInputError({ validator: null, value: null });
      if (!validator)
        setInputError((prev) => ({
          ...prev,
          validator: "Validator Address cannot be empty",
        }));
      if (!amount)
        setInputError((prev) => ({
          ...prev,
          value: "Value cannot be empty",
        }));
      return !!(amount && validator);
    };

    const isValidInput = handleCheckInput();

    if (!isValidInput) return;

    if (activeMenu === "Stake") {
      void props.addStake({
        validator,
        amount,
        callback: handleCallback,
      });
    }
    if (activeMenu === "Unstake") {
      void props.removeStake({
        validator,
        amount,
        callback: handleCallback,
      });
    }
    if (activeMenu === "Transfer Stake") {
      void props.transferStake({
        fromValidator: fromValidator,
        toValidator: validator,
        amount,
        callback: handleCallback,
      });
    }
    if (activeMenu === "Send") {
      void props.transfer({
        to: validator,
        amount,
        callback: handleCallback,
      });
    }
  };

  return (
    <>
      <div className="grid w-full grid-cols-1 gap-4 py-4 md:grid-cols-4">
        {buttons.map((button) => (
          <IconButton
            key={button.src}
            src={button.src}
            text={button.text}
            color={button.color as ColorType}
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
          />
        ))}
      </div>
      {activeMenu && (
        <div className="animate-zoom-in w-full">
          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-4 pt-4"
          >
            {activeMenu === "Transfer Stake" && (
              <div className="w-full">
                <p className="text-base">From Validator</p>
                <input
                  type="text"
                  value={fromValidator}
                  disabled={transactionStatus.status === "PENDING"}
                  onChange={(e) => setFromValidator(e.target.value)}
                  placeholder="The full address of the validator"
                  className="w-full border border-white/20 bg-[#898989]/5 p-2"
                />
              </div>
            )}
            <div className="w-full">
              <span className="text-base">
                {activeMenu === "Stake" ||
                activeMenu === "Transfer Stake" ||
                activeMenu === "Unstake" ? (
                  <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <p>
                      {activeMenu === "Transfer Stake"
                        ? "To Validator"
                        : "Validator Address"}
                    </p>
                  </div>
                ) : (
                  "To Address"
                )}
              </span>
              <div className="flex flex-row gap-3">
                <input
                  type="text"
                  value={validator}
                  disabled={transactionStatus.status === "PENDING"}
                  onChange={(e) => setValidator(e.target.value)}
                  placeholder={
                    activeMenu === "Stake" ||
                    activeMenu === "Transfer Stake" ||
                    activeMenu === "Unstake"
                      ? "The full address of the validator"
                      : "The full address of the recipient"
                  }
                  className="w-full border border-white/20 bg-[#898989]/5 p-2"
                />
                {activeMenu !== "Send" && (
                  <button
                    type="button"
                    onClick={() =>
                      activeMenu === "Unstake"
                        ? setOpenStakedValidators(true)
                        : setOpenValidators(true)
                    }
                    className="w-[40%] border bg-black/50 p-2 text-center text-green-500 transition hover:bg-green-500/10 hover:text-white"
                  >
                    {activeMenu === "Unstake"
                      ? "List of Staked Validators"
                      : "Validators"}
                  </button>
                )}
                {activeMenu === "Transfer Stake" && (
                  <button
                    type="button"
                    onClick={() => setOpenStakedValidators(true)}
                    className="w-[40%] border bg-black/50 p-2 text-center text-green-500 transition hover:bg-green-500/10 hover:text-white"
                  >
                    List of Staked Validators
                  </button>
                )}
              </div>
            </div>
            {inputError.validator && (
              <p className={`-mt-2 mb-1 flex text-left text-base text-red-400`}>
                {inputError.validator}
              </p>
            )}
            <div className="w-full">
              <p className="text-base">Value</p>
              <input
                type="text"
                disabled={transactionStatus.status === "PENDING"}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="The amount of COMAI to use in the transaction"
                className="w-full border border-white/20 bg-[#898989]/5 p-2"
              />
            </div>
            {inputError.value && (
              <p className={`-mt-2 mb-1 flex text-left text-base text-red-400`}>
                {inputError.value}
              </p>
            )}
            <button
              type="submit"
              disabled={transactionStatus.status === "PENDING"}
              className="flex w-full justify-center text-nowrap border border-green-500 bg-green-600/5 px-6 py-2.5 font-semibold text-green-500 transition duration-200 hover:border-green-400 hover:bg-green-500/15"
            >
              Start Transaction
            </button>
          </form>
          {transactionStatus.status ? (
            <p
              className={`items-center gap-3 pt-3 ${
                transactionStatus.status === "PENDING" && "text-yellow-400"
              } ${transactionStatus.status === "ERROR" && "text-red-400 "} ${
                transactionStatus.status === "SUCCESS" && "text-green-400"
              } ${
                transactionStatus.status === "STARTING" && "text-blue-400"
              } flex text-left text-base`}
            >
              {transactionStatus.status === "PENDING" && <Loading />}
              {transactionStatus.message}
            </p>
          ) : null}
        </div>
      )}
    </>
  );
}

export const Wallet = {
  Root: WalletRoot,
  Header: WalletHeader,
  Balance: WalletBalance,
  Actions: WalletActions,
};
