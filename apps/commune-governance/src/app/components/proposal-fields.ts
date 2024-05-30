import {
  PARAM_FIELD_DISPLAY_NAMES,
  type CustomProposalDataState,
  type ProposalState,
} from "@repo/providers/src/types";
import { match } from "rustie";

export interface ProposalCardFields {
  title: string | null;
  body: string | null;
  netuid: number | "GLOBAL";
  invalid?: boolean;
}

function paramNameToDisplayName(paramName: string): string {
  return PARAM_FIELD_DISPLAY_NAMES[paramName] ?? paramName;
}

function paramsToMarkdown(params: Record<string, unknown>): string {
  const items = [];
  for (const [key, value] of Object.entries(params)) {
    const label = `**${paramNameToDisplayName(key)}**`;
    const formattedValue =
      typeof value === "string" || typeof value === "number"
        ? `\`${value}\``
        : "`???`";

    items.push(`${label}: ${formattedValue}`);
  }
  return `${items.join(" |  ")}\n`;
}

function handleCustomProposalData(
  proposalId: number,
  dataState: CustomProposalDataState | null,
  netuid: number | "GLOBAL"
): ProposalCardFields {
  if (dataState == null) {
    return {
      title: null,
      body: null,
      netuid,
    };
  }
  return match(dataState)({
    Err({ message }): ProposalCardFields {
      return {
        title: `⚠️😠 Failed fetching proposal data for proposal #${proposalId}`,
        body: `⚠️😠 Error fetching proposal data for proposal #${proposalId}:  \n${message}`,
        netuid,
        invalid: true,
      };
    },
    Ok(data): ProposalCardFields {
      return {
        title: data.title ?? null,
        body: data.body ?? null,
        netuid,
      };
    },
  });
}

function handleProposalParams(
  proposalId: number,
  params: Record<string, unknown>,
  netuid: number | "GLOBAL"
): ProposalCardFields {
  const title = `Parameters proposal #${proposalId} for ${
    netuid == "GLOBAL" ? "global network" : `subnet ${netuid}`
  }`;
  return {
    title,
    body: paramsToMarkdown(params),
    netuid,
  };
}

export const handleProposal = (proposal: ProposalState): ProposalCardFields =>
  match(proposal.data)({
    custom(/*rawData*/): ProposalCardFields {
      return handleCustomProposalData(
        proposal.id,
        proposal.customData ?? null,
        "GLOBAL"
      );
    },
    subnetCustom({ netuid /*rawData*/ }): ProposalCardFields {
      return handleCustomProposalData(
        proposal.id,
        proposal.customData ?? null,
        netuid
      );
    },
    globalParams(params): ProposalCardFields {
      return handleProposalParams(proposal.id, params, "GLOBAL");
    },
    subnetParams({ netuid, params }): ProposalCardFields {
      return handleProposalParams(proposal.id, params, netuid);
    },
    expired(): ProposalCardFields {
      return {
        title: `Proposal #${proposal.id} has expired`,
        body: "This proposal has expired.",
        netuid: "GLOBAL",
        invalid: true,
      };
    },
  });
