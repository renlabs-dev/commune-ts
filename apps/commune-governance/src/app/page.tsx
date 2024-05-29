"use client";

import { usePolkadot } from "@repo/providers/src/context/polkadot";
import { SS58Address } from "@repo/providers/src/types";
import { useState } from "react";
import { Vote } from "../components/vote-label";
import { computeVotes, getProposalNetuid } from "@repo/providers/src/utils";
import { ProposalCard } from "../components/proposal-card";
import { DaoCard } from "../components/dao-card";
import { Container } from "../components/container";
import { BalanceSection } from "../components/balance-section";
import { ProposalListHeader } from "../components/proposal-list-header";
import { CardSkeleton } from "../components/card-skeleton";

export default function HomePage() {
  const { proposals, curatorApplications, stakeData, selectedAccount } =
    usePolkadot();

  const [viewMode, setViewMode] = useState<"proposals" | "daos">("proposals");

  const handleIsLoading = (type: "proposals" | "daos") => {
    switch (type) {
      case "daos":
        return curatorApplications == null;

      case "proposals":
        return proposals == null;

      default:
        return false;
    }
  };

  const isLoading = handleIsLoading(viewMode);

  const handleUserVotes = ({
    votesAgainst,
    votesFor,
    selectedAccountAddress,
  }: {
    votesAgainst: Array<string>;
    votesFor: Array<string>;
    selectedAccountAddress: SS58Address;
  }): Vote => {
    if (votesAgainst.includes(selectedAccountAddress)) return "AGAINST";
    if (votesFor.includes(selectedAccountAddress)) return "FAVORABLE";
    return "UNVOTED";
  };

  const renderProposals = () => {
    const proposalsContent = proposals?.map((proposal) => {
      const voted = handleUserVotes({
        votesAgainst: proposal.votesAgainst,
        votesFor: proposal.votesFor,
        selectedAccountAddress: selectedAccount?.address as SS58Address,
      });

      const netuid = getProposalNetuid(proposal);
      let proposalStakeInfo = null;
      if (stakeData != null) {
        const stake_map =
          netuid != null
            ? stakeData.stakeOut.perAddrPerNet.get(netuid) ??
              new Map<string, bigint>()
            : stakeData.stakeOut.perAddr;
        proposalStakeInfo = computeVotes(
          stake_map,
          proposal.votesFor,
          proposal.votesAgainst
        );
      }
      return (
        <div key={proposal.id} className="animate-fade-in-down">
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
  };

  const renderDaos = () => {
    const daosContent = curatorApplications?.map((curatorApplications) => {
      return (
        <div key={curatorApplications.id}>
          <DaoCard key={curatorApplications.id} dao={curatorApplications} />
        </div>
      );
    });

    return daosContent;
  };

  const content = viewMode === "proposals" ? renderProposals() : renderDaos();

  return (
    <main className="flex flex-col items-center justify-center w-full">
      <div className="w-full h-full bg-repeat">
        <Container>
          <BalanceSection className="hidden lg:flex" />

          <ProposalListHeader viewMode={viewMode} setViewMode={setViewMode} />

          <div className="max-w-6xl px-4 py-8 mx-auto space-y-10">
            {!isLoading && content}
            {isLoading && <CardSkeleton />}
          </div>
        </Container>
      </div>
    </main>
  );
}
