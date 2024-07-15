"use client";

import { useState } from "react";

import type { ProposalStatus, SS58Address } from "@commune-ts/providers/types";
import { useCommune } from "@commune-ts/providers/use-commune";

import type { Vote } from "./components/vote-label";
import { BalanceSection } from "./components/balance-section";
import { CardSkeleton } from "./components/card-skeleton";
import { Container } from "./components/container";
import { DaoCard } from "./components/dao-card";
import { ProposalCard } from "./components/proposal-card";
import { ProposalListHeader } from "./components/proposal-list-header";
import { FooterDivider } from "./components/footer-divider";

export default function HomePage(): JSX.Element {
  const {
    proposalsWithMeta,
    isProposalsLoading,
    daosWithMeta,
    isDaosLoading,
    selectedAccount,
    daoTreasury,
  } = useCommune();

  const [viewMode, setViewMode] = useState<"proposals" | "daos">("proposals");

  function handleIsLoading(type: "proposals" | "daos"): boolean {
    switch (type) {
      case "daos":
        return isDaosLoading;
      case "proposals":
        return isProposalsLoading;
      default:
        return false;
    }
  }

  const isLoading = handleIsLoading(viewMode);

  const handleUserVotes = ({
    proposalStatus,
    selectedAccountAddress,
  }: {
    proposalStatus: ProposalStatus;
    selectedAccountAddress: SS58Address;
  }): Vote => {
    if (!Object.prototype.hasOwnProperty.call(proposalStatus, "open"))
      return "UNVOTED";

    if (
      "open" in proposalStatus &&
      proposalStatus.open.votesFor.includes(selectedAccountAddress)
    ) {
      return "FAVORABLE";
    }
    if (
      "open" in proposalStatus &&
      proposalStatus.open.votesAgainst.includes(selectedAccountAddress)
    ) {
      return "AGAINST";
    }

    return "UNVOTED";
  };

  function renderProposals(): JSX.Element[] | undefined {
    const proposalsContent = proposalsWithMeta?.map((proposal) => {
      const voted = handleUserVotes({
        proposalStatus: proposal.status,
        selectedAccountAddress: selectedAccount?.address as SS58Address,
      });

      return (
        <div className="animate-fade-in-down" key={proposal.id}>
          <ProposalCard
            key={proposal.id}
            proposalState={proposal}
            voted={voted}
          />
        </div>
      );
    });
    return proposalsContent;
  }

  function renderDaos(): JSX.Element[] | undefined {
    const daosContent = daosWithMeta?.map((dao) => {
      return (
        <div key={dao.id}>
          <DaoCard daoState={dao} key={dao.id} />
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

          <ProposalListHeader setViewMode={setViewMode} viewMode={viewMode} daoTreasury={daoTreasury} />

          <div className="w-full py-10 space-y-10">
            {isLoading ? <CardSkeleton /> : content}
          </div>
          <FooterDivider />
        </Container>
      </div>
    </main>
  );
}
