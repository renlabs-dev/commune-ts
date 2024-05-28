"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  type InjectedAccountWithMeta,
  type InjectedExtension,
} from "@polkadot/extension-inject/types";
import type { SubmittableResult } from "@polkadot/api";
import { ApiPromise, WsProvider } from "@polkadot/api";
import type { SubmittableExtrinsic } from "@polkadot/api/types";
import { toast } from "react-toastify";
import type { DispatchError } from "@polkadot/types/interfaces";
import { WalletModal } from "../components/wallet-modal";
import { calculateAmount } from "../utils";
import type {
  AddCustomProposal,
  AddDaoApplication,
  DaoApplications,
  Stake,
  StakeData,
  TransactionResult,
  Transfer,
  TransferStake,
  Vote,
} from "../types";
import {
  getAllStakeOut,
  getBalance,
  getDaoApplications,
  getGlobalDaoTreasury,
} from "../querys";

interface PolkadotApiState {
  web3Accounts: (() => Promise<InjectedAccountWithMeta[]>) | null;
  web3Enable: ((appName: string) => Promise<InjectedExtension[]>) | null;
  web3FromAddress: ((address: string) => Promise<InjectedExtension>) | null;
}

interface PolkadotContextType {
  api: ApiPromise | null;
  isConnected: boolean;
  isInitialized: boolean;

  handleConnect: () => void;
  accounts: InjectedAccountWithMeta[];
  selectedAccount: InjectedAccountWithMeta | null;

  balance: string;

  addStake: (stake: Stake) => Promise<void>;
  removeStake: (stake: Stake) => Promise<void>;
  transfer: (transfer: Transfer) => Promise<void>;
  transferStake: (transfer: TransferStake) => Promise<void>;
  voteProposal: (vote: Vote) => Promise<void>;

  addCustomProposal: (proposal: AddCustomProposal) => Promise<void>;
  addDaoApplication: (application: AddDaoApplication) => Promise<void>;

  curatorApplications: DaoApplications[] | null;
  globalDaoTreasury: string;

  stakeData: StakeData | null;
}

const PolkadotContext = createContext<PolkadotContextType | null>(null);

interface PolkadotProviderProps {
  children: React.ReactNode;
  wsEndpoint: string;
}

export function PolkadotProvider({
  children,
  wsEndpoint,
}: PolkadotProviderProps): JSX.Element {
  const [api, setApi] = useState<ApiPromise | null>(null);

  const [polkadotApi, setPolkadotApi] = useState<PolkadotApiState>({
    web3Enable: null,
    web3Accounts: null,
    web3FromAddress: null,
  });

  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState(false);

  const [balance, setBalance] = useState("0");

  const [curatorApplications, setCuratorApplications] = useState<
    DaoApplications[] | null
  >(null);
  const [globalDaoTreasury, setGlobalDaoTreasury] = useState<string>("0");

  const [stakeData, setStakeData] = useState<StakeData | null>(null);

  const [openModal, setOpenModal] = useState(false);

  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [selectedAccount, setSelectedAccount] =
    useState<InjectedAccountWithMeta | null>(null);

  async function loadPolkadotApi(): Promise<void> {
    const { web3Accounts, web3Enable, web3FromAddress } = await import(
      "@polkadot/extension-dapp"
    );
    setPolkadotApi({
      web3Enable,
      web3Accounts,
      web3FromAddress,
    });
    const provider = new WsProvider(wsEndpoint);
    const newApi = await ApiPromise.create({ provider });
    setApi(newApi);
    setIsInitialized(true);
  }

  useEffect(() => {
    void loadPolkadotApi();

    return () => {
      void api?.disconnect();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsEndpoint]);

  async function fetchWallets(favoriteWalletAddress: string): Promise<void> {
    const walletList = await getWallets();
    const accountExist = walletList?.find(
      (wallet) => wallet.address === favoriteWalletAddress
    );
    if (accountExist) {
      setSelectedAccount(accountExist);
      setIsConnected(true);
    }
  }

  useEffect(() => {
    const favoriteWalletAddress = localStorage.getItem("favoriteWalletAddress");
    if (favoriteWalletAddress) {
      void fetchWallets(favoriteWalletAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized]);

  async function getWallets(): Promise<InjectedAccountWithMeta[] | undefined> {
    if (!polkadotApi.web3Enable || !polkadotApi.web3Accounts) return;
    await polkadotApi.web3Enable("Commune AI");
    try {
      const response = await polkadotApi.web3Accounts();
      return response;
    } catch (error) {
      return undefined;
    }
  }

  async function handleConnect(): Promise<void> {
    try {
      const allAccounts = await getWallets();
      if (allAccounts) {
        setAccounts(allAccounts);
        setOpenModal(true);
      }
    } catch (error) {
      return undefined;
    }
  }

  function handleConnectWrapper(): void {
    void handleConnect();
  }

  function handleWalletSelections(wallet: InjectedAccountWithMeta): void {
    localStorage.setItem("favoriteWalletAddress", wallet.address);
    setSelectedAccount(wallet);
    setIsConnected(true);
    setOpenModal(false);
  }

  // == Set State ==

  useEffect(() => {
    if (!api || !selectedAccount) return;

    void getBalance({
      api,
      address: selectedAccount.address,
    }).then((parsedBalance) => {
      setBalance(parsedBalance);
    });
  }, [api, selectedAccount]);

  useEffect(() => {
    if (!api) return;

    void getDaoApplications(api).then((daos) => {
      setCuratorApplications(daos);
    });

    void getGlobalDaoTreasury(api).then((treasury) => {
      setGlobalDaoTreasury(treasury);
    });

    void getAllStakeOut(api).then((stake) => {
      setStakeData(stake);
    });
  }, [api]);

  // == Transaction Handler ==

  async function sendTransaction(
    transactionType: string,
    transaction: SubmittableExtrinsic<"promise">,
    callback?: (result: TransactionResult) => void
  ): Promise<void> {
    if (!api || !selectedAccount || !polkadotApi.web3FromAddress) return;

    try {
      const injector = await polkadotApi.web3FromAddress(
        selectedAccount.address
      );

      await transaction.signAndSend(
        selectedAccount.address,
        { signer: injector.signer },
        (result: SubmittableResult) => {
          if (result.status.isInBlock) {
            callback?.({
              finalized: false,
              status: "PENDING",
              message: `${transactionType} in progress`,
            });
          }

          if (result.status.isFinalized) {
            const success = result.findRecord("system", "ExtrinsicSuccess");
            const failed = result.findRecord("system", "ExtrinsicFailed");

            if (success) {
              toast.success(`${transactionType} successful`);
              callback?.({
                finalized: true,
                status: "SUCCESS",
                message: `${transactionType} successful`,
              });
            } else if (failed) {
              const [dispatchError] = failed.event.data as unknown as [
                DispatchError,
              ];
              let msg = `${transactionType} failed: ${dispatchError.toString()}`;

              if (dispatchError.isModule) {
                const mod = dispatchError.asModule;
                const error = api.registry.findMetaError(mod);

                if (error.section && error.name) {
                  msg = `${transactionType} failed: ${error.name}`;
                }
              }

              toast.error(msg);
              callback?.({ finalized: true, status: "ERROR", message: msg });
            }
          }
        }
      );
    } catch (err) {
      toast.error(err as string);
    }
  }

  // == Transactions ==

  async function addStake({
    netUid,
    validator,
    amount,
    callback,
  }: Stake): Promise<void> {
    if (!api?.tx.subspaceModule.addStake) return;

    const transaction = api.tx.subspaceModule.addStake(
      netUid,
      validator,
      calculateAmount(amount)
    );
    await sendTransaction("Staking", transaction, callback);
  }

  async function removeStake({
    netUid,
    validator,
    amount,
    callback,
  }: Stake): Promise<void> {
    if (!api?.tx.subspaceModule.removeStake) return;

    const transaction = api.tx.subspaceModule.removeStake(
      netUid,
      validator,
      calculateAmount(amount)
    );
    await sendTransaction("Unstaking", transaction, callback);
  }

  async function transfer({ to, amount, callback }: Transfer): Promise<void> {
    if (!api?.tx.balances.transfer) return;

    const transaction = api.tx.balances.transfer(to, calculateAmount(amount));
    await sendTransaction("Transfer", transaction, callback);
  }

  async function transferStake({
    fromValidator,
    toValidator,
    amount,
    netUid,
    callback,
  }: TransferStake): Promise<void> {
    if (!api?.tx.subspaceModule.transferStake) return;

    const transaction = api.tx.subspaceModule.transferStake(
      netUid,
      fromValidator,
      toValidator,
      calculateAmount(amount)
    );
    await sendTransaction("Transfer Stake", transaction, callback);
  }

  // == Governance ==

  async function voteProposal({
    proposalId,
    vote,
    callback,
  }: Vote): Promise<void> {
    if (!api?.tx.subspaceModule.voteProposal) return;

    const transaction = api.tx.subspaceModule.voteProposal(proposalId, vote);
    await sendTransaction("Vote", transaction, callback);
  }

  async function addCustomProposal({
    IpfsHash,
    callback,
  }: AddCustomProposal): Promise<void> {
    if (!api?.tx.subspaceModule.addCustomProposal) return;

    const transaction = api.tx.subspaceModule.addCustomProposal(IpfsHash);
    await sendTransaction("Create Custom Proposal", transaction, callback);
  }

  async function addDaoApplication({
    IpfsHash,
    applicationKey,
    callback,
  }: AddDaoApplication): Promise<void> {
    if (!api?.tx.subspaceModule.addDaoApplication) return;

    const transaction = api.tx.subspaceModule.addDaoApplication(
      applicationKey,
      IpfsHash
    );
    await sendTransaction("Create S0 Applicaiton", transaction, callback);
  }

  return (
    <PolkadotContext.Provider
      value={{
        api,
        isConnected,
        isInitialized,

        accounts,
        selectedAccount,
        handleConnect: handleConnectWrapper,

        balance,

        addStake,
        removeStake,
        transfer,
        transferStake,

        curatorApplications,
        globalDaoTreasury,

        voteProposal,
        addCustomProposal,
        addDaoApplication,

        stakeData,
      }}
    >
      <WalletModal
        handleWalletSelections={handleWalletSelections}
        open={openModal}
        setOpen={setOpenModal}
        wallets={accounts}
      />
      {children}
    </PolkadotContext.Provider>
  );
}

export const usePolkadot = (): PolkadotContextType => {
  const context = useContext(PolkadotContext);
  if (context === null) {
    throw new Error("usePolkadot must be used within a PolkadotProvider");
  }
  return context;
};
