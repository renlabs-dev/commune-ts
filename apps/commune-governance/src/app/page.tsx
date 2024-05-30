"use client";

import { usePolkadot } from "@repo/providers/src/context/polkadot";
import type { SS58Address } from "@repo/providers/src/types";
import { useState } from "react";
import { computeVotes, getProposalNetuid } from "@repo/providers/src/utils";
import type { Vote } from "./components/vote-label";
import { ProposalCard } from "./components/proposal-card";
import { DaoCard } from "./components/dao-card";
import { Container } from "./components/container";
import { BalanceSection } from "./components/balance-section";
import { ProposalListHeader } from "./components/proposal-list-header";
import { CardSkeleton } from "./components/card-skeleton";

export default function HomePage(): JSX.Element {
  const { proposals, curatorApplications, stakeData, selectedAccount } =
    usePolkadot();

  const [viewMode, setViewMode] = useState<"proposals" | "daos">("proposals");

  function handleIsLoading(type: "proposals" | "daos"): boolean {
    switch (type) {
      case "daos":
        return curatorApplications == null;

      case "proposals":
        return proposals == null;

      default:
        return false;
    }
  }

  const isLoading = handleIsLoading(viewMode);

  const handleUserVotes = ({
    votesAgainst,
    votesFor,
    selectedAccountAddress,
  }: {
    votesAgainst: string[];
    votesFor: string[];
    selectedAccountAddress: SS58Address;
  }): Vote => {
    if (votesAgainst.includes(selectedAccountAddress)) return "AGAINST";
    if (votesFor.includes(selectedAccountAddress)) return "FAVORABLE";
    return "UNVOTED";
  };

  // TODO check this fucker
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function renderProposals() {
    const proposalsContent = proposals?.map((proposal) => {
      const voted = handleUserVotes({
        votesAgainst: proposal.votesAgainst,
        votesFor: proposal.votesFor,
        selectedAccountAddress: selectedAccount?.address as SS58Address,
      });

      const netuid = getProposalNetuid(proposal);
      let proposalStakeInfo = null;
      if (stakeData != null) {
        const stakeMap =
          netuid != null
            ? stakeData.stakeOut.perAddrPerNet.get(netuid) ??
              new Map<string, bigint>()
            : stakeData.stakeOut.perAddr;
        proposalStakeInfo = computeVotes(
          stakeMap,
          proposal.votesFor,
          proposal.votesAgainst
        );
      }
      return (
        <div className="animate-fade-in-down" key={proposal.id}>
          <ProposalCard
            key={proposal.id}
            proposal={proposal}
            stakeInfo={proposalStakeInfo}
            voted={voted}
          />
        </div>
      );
    });
    return proposalsContent;
  }

  // TODO check this fucker
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function renderDaos() {
    const daosContent = curatorApplications?.map((daos) => {
      return (
        <div key={daos.id}>
          <DaoCard dao={daos} key={daos.id} />
        </div>
      );
    });

    return daosContent;
  }

  const content = viewMode === "proposals" ? renderProposals() : renderDaos();

  return (
    <main className="flex flex-col items-center justify-center w-full">
      <div className="w-full h-full bg-repeat">
        <Container>
          <BalanceSection className="hidden lg:flex" />

          <ProposalListHeader setViewMode={setViewMode} viewMode={viewMode} />

          <div className="max-w-6xl px-4 py-8 mx-auto space-y-10">
            {!isLoading && content}
            {isLoading ? <CardSkeleton /> : null}
          </div>
        </Container>
      </div>
    </main>
  );
}
