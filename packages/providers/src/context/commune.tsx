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
import { WalletModal } from "@repo/ui/wallet-modal";
import type { Codec } from "@polkadot/types/types";
import { calculateAmount } from "../utils";
import type {
  LastBlock,
  AddCustomProposal,
  AddDaoApplication,
  Stake,
  TransactionResult,
  Transfer,
  TransferStake,
  Vote,
  BaseProposal,
  BaseDao,
  DaoState,
  ProposalState,
  StakeOutData,
  UpdateDelegatingVotingPower,
} from "../types";
import {
  getBalance,
  handleDaos,
  handleProposals,
  useAllStakeOut,
  useCustomMetadata,
  useDaoTreasury,
  useDaos,
  useLastBlock,
  useNotDelegatingVoting,
  useProposals,
} from "../hooks";

interface CommuneApiState {
  web3Accounts: (() => Promise<InjectedAccountWithMeta[]>) | null;
  web3Enable: ((appName: string) => Promise<InjectedExtension[]>) | null;
  web3FromAddress: ((address: string) => Promise<InjectedExtension>) | null;
}

interface CommuneContextType {
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

  updateDelegatingVotingPower: (
    updateDelegating: UpdateDelegatingVotingPower,
  ) => Promise<void>;

  lastBlock: LastBlock | undefined;
  isLastBlockLoading: boolean;

  daoTreasury: Codec | undefined;
  isDaoTreasuryLoading: boolean;

  notDelegatingVoting: Codec | undefined;
  isNotDelegatingVotingLoading: boolean;

  stakeOut: StakeOutData | undefined;
  isStakeOutLoading: boolean;

  proposalsWithMeta: ProposalState[];
  isProposalsLoading: boolean;

  daosWithMeta: DaoState[];
  isDaosLoading: boolean;
}

const CommuneContext = createContext<CommuneContextType | null>(null);

interface CommuneProviderProps {
  children: React.ReactNode;
  wsEndpoint: string;
}

export function CommuneProvider({
  children,
  wsEndpoint,
}: CommuneProviderProps): JSX.Element {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [communeApi, setCommuneApi] = useState<CommuneApiState>({
    web3Enable: null,
    web3Accounts: null,
    web3FromAddress: null,
  });
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState("0");
  const [openModal, setOpenModal] = useState(false);
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [selectedAccount, setSelectedAccount] =
    useState<InjectedAccountWithMeta | null>(null);

  // == Initialize Polkadot ==

  async function loadCommuneApi(): Promise<void> {
    const { web3Accounts, web3Enable, web3FromAddress } = await import(
      "@polkadot/extension-dapp"
    );
    setCommuneApi({
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
    void loadCommuneApi();

    return () => {
      void api?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsEndpoint]);

  async function fetchWallets(favoriteWalletAddress: string): Promise<void> {
    const walletList = await getWallets();
    const accountExist = walletList?.find(
      (wallet) => wallet.address === favoriteWalletAddress,
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
    if (!communeApi.web3Enable || !communeApi.web3Accounts) return;
    await communeApi.web3Enable("Commune AI");
    try {
      const response = await communeApi.web3Accounts();
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

  // == Transaction Handler ==

  async function sendTransaction(
    transactionType: string,
    transaction: SubmittableExtrinsic<"promise">,
    callback?: (result: TransactionResult) => void,
  ): Promise<void> {
    if (!api || !selectedAccount || !communeApi.web3FromAddress) return;
    try {
      const injector = await communeApi.web3FromAddress(
        selectedAccount.address,
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
        },
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
      calculateAmount(amount),
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
      calculateAmount(amount),
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
      calculateAmount(amount),
    );
    await sendTransaction("Transfer Stake", transaction, callback);
  }

  // == Governance ==

  async function voteProposal({
    proposalId,
    vote,
    callback,
  }: Vote): Promise<void> {
    if (!api?.tx.governanceModule.voteProposal) return;

    const transaction = api.tx.governanceModule.voteProposal(proposalId, vote);
    await sendTransaction("Vote", transaction, callback);
  }

  async function addCustomProposal({
    IpfsHash,
    callback,
  }: AddCustomProposal): Promise<void> {
    if (!api?.tx.governanceModule.addGlobalCustomProposal) return;

    const transaction =
      api.tx.governanceModule.addGlobalCustomProposal(IpfsHash);
    await sendTransaction("Create Custom Proposal", transaction, callback);
  }

  async function addDaoApplication({
    IpfsHash,
    applicationKey,
    callback,
  }: AddDaoApplication): Promise<void> {
    if (!api?.tx.governanceModule.addDaoApplication) return;

    const transaction = api.tx.governanceModule.addDaoApplication(
      applicationKey,
      IpfsHash,
    );
    await sendTransaction("Create S0 Application", transaction, callback);
  }

  async function updateDelegatingVotingPower({
    isDelegating,
    callback,
  }: UpdateDelegatingVotingPower): Promise<void> {
    if (!api?.tx.governanceModule.addCustomProposal) return;

    const transaction = isDelegating
      ? api.tx.governanceModule.enableVotePowerDelegation()
      : api.tx.governanceModule.disableVotePowerDelegation();

    await sendTransaction("Create Custom Proposal", transaction, callback);
  }

  // Hooks

  // Last block with API
  const { data: lastBlock, isLoading: isLastBlockLoading } = useLastBlock(api);

  // Dao Treasury
  const { data: daoTreasury, isLoading: isDaoTreasuryLoading } =
    useDaoTreasury(lastBlock);

  // Not Delegating Voting Power Set
  const { data: notDelegatingVoting, isLoading: isNotDelegatingVotingLoading } =
    useNotDelegatingVoting(lastBlock);

  // Stake Out
  const { data: stakeOut, isLoading: isStakeOutLoading } =
    useAllStakeOut(lastBlock);

  // Proposals
  const { data: proposalQuery, isLoading: isProposalsLoading } =
    useProposals(lastBlock);

  // Custom Metadata for Proposals
  const [proposals, proposalsErrs] = handleProposals(proposalQuery);
  for (const err of proposalsErrs) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
  const customProposalMetadataQueryMap = useCustomMetadata<BaseProposal>(
    "proposal",
    lastBlock,
    proposals,
  );
  for (const entry of customProposalMetadataQueryMap.entries()) {
    const [id, query] = entry;
    const { data } = query;
    if (data == null) {
      // eslint-disable-next-line no-console
      console.info(`Missing custom proposal metadata for proposal ${id}`);
    }
  }

  const proposalsWithMeta = proposals.map((proposal) => {
    const id = proposal.id;
    const metadataQuery = customProposalMetadataQueryMap.get(id);
    const data = metadataQuery?.data;
    if (data == null) {
      return proposal;
    }
    const [, customData] = data;
    return { ...proposal, customData };
  });

  // Daos

  const { data: daoQuery, isLoading: isDaosLoading } = useDaos(lastBlock);
  const [daos, daosErrs] = handleDaos(daoQuery);
  for (const err of daosErrs) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
  const customDaoMetadataQueryMap = useCustomMetadata<BaseDao>(
    "dao",
    lastBlock,
    daos,
  );
  for (const entry of customDaoMetadataQueryMap.entries()) {
    const [id, query] = entry;
    const { data } = query;
    if (data == null) {
      // eslint-disable-next-line no-console
      console.info(`Missing custom dao metadata for dao ${id}`);
    }
  }

  const daosWithMeta = daos.map((dao) => {
    const id = dao.id;
    const metadataQuery = customDaoMetadataQueryMap.get(id);
    const data = metadataQuery?.data;
    if (data == null) {
      return dao;
    }
    const [, customData] = data;
    return { ...dao, customData };
  });

  return (
    <CommuneContext.Provider
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

        voteProposal,
        addCustomProposal,
        addDaoApplication,

        updateDelegatingVotingPower,

        lastBlock,
        isLastBlockLoading,

        daoTreasury,
        isDaoTreasuryLoading,

        notDelegatingVoting,
        isNotDelegatingVotingLoading,

        stakeOut,
        isStakeOutLoading,

        proposalsWithMeta,
        isProposalsLoading,

        daosWithMeta,
        isDaosLoading,
      }}
    >
      <WalletModal
        handleWalletSelections={handleWalletSelections}
        open={openModal}
        setOpen={setOpenModal}
        wallets={accounts}
      />
      {children}
    </CommuneContext.Provider>
  );
}

export const useCommune = (): CommuneContextType => {
  const context = useContext(CommuneContext);
  if (context === null) {
    throw new Error("useCommune must be used within a CommuneProvider");
  }
  return context;
};
