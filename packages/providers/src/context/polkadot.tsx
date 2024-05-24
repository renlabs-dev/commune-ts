"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  type InjectedAccountWithMeta,
  type InjectedExtension,
} from "@polkadot/extension-inject/types";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { WalletModal } from "../components/wallet-modal";

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

  return (
    <PolkadotContext.Provider
      value={{
        api,
        isConnected,
        isInitialized,

        handleConnect: handleConnectWrapper,
        accounts,
        selectedAccount,
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
