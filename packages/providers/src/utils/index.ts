import { CID } from "multiformats/cid";
import { match } from "rustie";
import {
  URL_SCHEMA,
  type Proposal,
  type ProposalState,
  type ProposalStakeInfo,
  ProposalCardFields,
  paramNameToDisplayName,
  DAOCardFields,
  CustomMetadataState,
} from "../types";

export function calculateAmount(amount: string): number {
  return Math.floor(Number(amount) * 10 ** 9);
}

export function smallAddress(address: string): string {
  return `${address.slice(0, 8)}…${address.slice(-8)}`;
}

// == IPFS ==

export function parseIpfsUri(uri: string): CID | null {
  const validated = URL_SCHEMA.safeParse(uri);
  if (!validated.success) {
    return null;
  }
  const ipfsPrefix = "ipfs://";
  const rest = uri.startsWith(ipfsPrefix) ? uri.slice(ipfsPrefix.length) : uri;
  try {
    const cid = CID.parse(rest);
    return cid;
  } catch (e) {
    return null;
  }
}

export function buildIpfsGatewayUrl(cid: CID): string {
  const cidStr = cid.toString();
  return `https://ipfs.io/ipfs/${cidStr}`;
}

// == Balances ==

export function bigintDivision(a: bigint, b: bigint, precision = 8n): number {
  if (b === 0n) return NaN;
  const base = 10n ** precision;
  const baseNum = Number(base);
  return Number((a * base) / b) / baseNum;
}

export function fromNano(nano: number | bigint): number {
  if (typeof nano === "bigint") return bigintDivision(nano, 1_000_000_000n);
  return nano / 1_000_000_000;
}

export function formatToken(nano: number | bigint): string {
  const amount = fromNano(nano);
  return amount.toFixed(2);
}

// == Proposal ==

function sum(arr: Iterable<bigint>): bigint {
  return Array.from(arr).reduce((a, b) => a + b, 0n);
}

export function computeVotes(
  stakeMap: Map<string, bigint>,
  votesFor: string[],
  votesAgainst: string[],
  stakeTotal?: bigint,
): ProposalStakeInfo {
  let stakeFor = 0n;
  let stakeAgainst = 0n;
  let stakeVoted = 0n;

  if (stakeTotal == null) {
    // eslint-disable-next-line no-param-reassign
    stakeTotal = sum(stakeMap.values());
  }

  for (const voteAddr of votesFor) {
    const stake = stakeMap.get(voteAddr);
    if (stake == null) {
      continue;
    }
    stakeFor += stake;
    stakeVoted += stake;
  }

  for (const voteAddr of votesAgainst) {
    const stake = stakeMap.get(voteAddr);
    if (stake == null) {
      continue;
    }
    stakeAgainst += stake;
    stakeVoted += stake;
  }

  return { stakeFor, stakeAgainst, stakeVoted, stakeTotal };
}

// == Proposals ==

const paramsToMarkdown = (params: Record<string, unknown>): string => {
  const items = [];
  for (const [key, value] of Object.entries(params)) {
    const label = `**${paramNameToDisplayName(key)}**`;
    const formattedValue =
      typeof value === "string" || typeof value === "number"
        ? `\`${value}\``
        : "`???`";

    items.push(`${label}: ${formattedValue}`);
  }
  return items.join(" |  ") + "\n";
};
function handleCustomProposalData(
  proposalId: number,
  dataState: CustomMetadataState | null,
  netuid: number | "GLOBAL",
): ProposalCardFields {
  if (dataState == null) {
    return {
      title: null,
      body: null,
      netuid: netuid,
    };
  }
  return match(dataState)({
    Err: function ({ message }): ProposalCardFields {
      return {
        title: `⚠️😠 Failed fetching proposal data for proposal #${proposalId}`,
        body: `⚠️😠 Error fetching proposal data for proposal #${proposalId}:  \n${message}`,
        netuid: netuid,
        invalid: true,
      };
    },
    Ok: function (data): ProposalCardFields {
      return {
        title: data.title ?? null,
        body: data.body ?? null,
        netuid: netuid,
      };
    },
  });
}

function handleProposalParams(
  proposalId: number,
  params: Record<string, unknown>,
  netuid: number | "GLOBAL",
): ProposalCardFields {
  const title =
    `Parameters proposal #${proposalId} for ` +
    (netuid == "GLOBAL" ? "global network" : `subnet ${netuid}`);
  return {
    title,
    body: paramsToMarkdown(params),
    netuid,
  };
}

export const handleCustomProposal = (
  proposal: ProposalState,
): ProposalCardFields =>
  match(proposal.data)({
    globalCustom: function (): ProposalCardFields {
      return handleCustomProposalData(
        proposal.id,
        proposal.customData ?? null,
        "GLOBAL",
      );
    },
    subnetCustom: function ({ subnetId }): ProposalCardFields {
      return handleCustomProposalData(
        proposal.id,
        proposal.customData ?? null,
        subnetId,
      );
    },
    globalParams: function (params): ProposalCardFields {
      return handleProposalParams(proposal.id, params, "GLOBAL");
    },
    subnetParams: function ({ subnetId, params }): ProposalCardFields {
      return handleProposalParams(proposal.id, params, subnetId);
    },
    transferDaoTreasury: function (): ProposalCardFields {
      return {
        title: `Transfer proposal #${proposal.id}`,
        body: `Transfer proposal #${proposal.id} to treasury`,
        netuid: "GLOBAL",
        invalid: true,
      };
    },
  });

export function getProposalNetuid(proposal: Proposal): number | null {
  return match(proposal.data)({
    globalCustom: function (/*v: string*/): null {
      return null;
    },
    globalParams: function (/*v: unknown*/): null {
      return null;
    },
    subnetCustom: function ({ subnetId }): number {
      return subnetId;
    },
    subnetParams: function ({ subnetId }): number {
      return subnetId;
    },
    transferDaoTreasury: function (/*{ account, amount }*/): null {
      return null;
    },
  });
}

// == DAO Applications ==

export function handleDaoApplications(
  daoId: number | null,
  dataState: CustomMetadataState | null,
): DAOCardFields {
  if (dataState == null) {
    return {
      title: null,
      body: null,
    };
  }
  return match(dataState)({
    Err: function ({ message }): DAOCardFields {
      return {
        title: `⚠️😠 Failed fetching proposal data for proposal #${daoId}`,
        body: `⚠️😠 Error fetching proposal data for proposal #${daoId}:  \n${message}`,
      };
    },
    Ok: function (data): DAOCardFields {
      return {
        title: data.title ?? null,
        body: data.body ?? null,
      };
    },
  });
}
