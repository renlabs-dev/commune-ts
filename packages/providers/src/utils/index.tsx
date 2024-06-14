import { CID } from "multiformats/cid";
import { match } from "rustie";
import {
  URL_SCHEMA,
  paramNameToDisplayName,
  type ProposalCardFields,
  type DAOCardFields,
  type CustomMetadataState,
  type Proposal,
  type ProposalState,
  type ProposalStakeInfo,
  type ProposalStatus,
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

// == Governance ==

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
  return `${items.join(" |  ")}\n`;
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
      netuid,
    };
  }
  return match(dataState)({
    Err(): ProposalCardFields {
      return {
        title: `ID: ${proposalId} | This proposal has no custom metadata`,
        body: null,
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
  netuid: number | "GLOBAL",
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

export const handleCustomProposal = (
  proposal: ProposalState,
): ProposalCardFields =>
  match(proposal.data)({
    globalCustom(): ProposalCardFields {
      return handleCustomProposalData(
        proposal.id,
        proposal.customData ?? null,
        "GLOBAL",
      );
    },
    subnetCustom({ subnetId }): ProposalCardFields {
      return handleCustomProposalData(
        proposal.id,
        proposal.customData ?? null,
        subnetId,
      );
    },
    globalParams(params): ProposalCardFields {
      return handleProposalParams(proposal.id, params, "GLOBAL");
    },
    subnetParams({ subnetId, params }): ProposalCardFields {
      return handleProposalParams(proposal.id, params, subnetId);
    },
    transferDaoTreasury(): ProposalCardFields {
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
    globalCustom(/*v: string*/): null {
      return null;
    },
    globalParams(/*v: unknown*/): null {
      return null;
    },
    subnetCustom({ subnetId }): number {
      return subnetId;
    },
    subnetParams({ subnetId }): number {
      return subnetId;
    },
    transferDaoTreasury(/*{ account, amount }*/): null {
      return null;
    },
  });
}

export function calcProposalFavorablePercent(
  proposalStatus: ProposalStatus,
): number | null {
  function calcStakePercent(
    stakeFor: bigint,
    stakeAgainst: bigint,
  ): number | null {
    const totalStake = stakeFor + stakeAgainst;
    if (totalStake === 0n) {
      return null;
    }
    const ratio = bigintDivision(stakeFor, totalStake);
    const percentage = ratio * 100;
    return percentage;
  }
  return match(proposalStatus)({
    open: ({ stakeFor, stakeAgainst }) =>
      calcStakePercent(stakeFor, stakeAgainst),
    accepted: ({ stakeFor, stakeAgainst }) =>
      calcStakePercent(stakeFor, stakeAgainst),
    refused: ({ stakeFor, stakeAgainst }) =>
      calcStakePercent(stakeFor, stakeAgainst),
    expired: () => null,
  });
}

export function handleProposalStakeVoted(
  proposalStatus: ProposalStatus,
): string {
  // TODO: extend rustie `if_let` to provide other variants on else arm
  // const txt = if_let(proposalStatus)("expired")(() => "—")(({ stakeFor }) => formatToken(Number(stakeFor)));

  return match(proposalStatus)({
    open: ({ stakeFor, stakeAgainst }) =>
      formatToken(Number(stakeFor + stakeAgainst)),
    accepted: ({ stakeFor, stakeAgainst }) =>
      formatToken(Number(stakeFor + stakeAgainst)),
    refused: ({ stakeFor, stakeAgainst }) =>
      formatToken(Number(stakeFor + stakeAgainst)),
    expired: () => "—",
  });
}

export function handleProposalQuorumPercent(
  proposalStatus: ProposalStatus,
  totalStake: bigint,
): JSX.Element {
  function quorumPercent(stakeFor: bigint, stakeAgainst: bigint): JSX.Element {
    const percentage =
      bigintDivision(stakeFor + stakeAgainst, totalStake) * 100;
    const percentDisplay = `${Number.isNaN(percentage) ? "—" : percentage.toFixed(1)}%`;
    return <span className="text-yellow-600">{`(${percentDisplay})`}</span>;
  }
  return match(proposalStatus)({
    open: ({ stakeFor, stakeAgainst }) => quorumPercent(stakeFor, stakeAgainst),
    accepted: ({ stakeFor, stakeAgainst }) =>
      quorumPercent(stakeFor, stakeAgainst),
    refused: ({ stakeFor, stakeAgainst }) =>
      quorumPercent(stakeFor, stakeAgainst),
    expired: () => {
      return <span className="text-yellow-600">{` (Expired)`}</span>;
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
    Err(): DAOCardFields {
      return {
        title: `ID: ${daoId} | This DAO has no custom metadata`,
        body: null,
      };
    },
    Ok(data): DAOCardFields {
      return {
        title: data.title ?? null,
        body: data.body ?? null,
      };
    },
  });
}

// == DAOs ==

export function handleCustomDaos(
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
    Err(): DAOCardFields {
      return {
        title: `ID: ${daoId} | This DAO has no custom metadata`,
        body: null,
      };
    },
    Ok(data): DAOCardFields {
      return {
        title: data.title ?? null,
        body: data.body ?? null,
      };
    },
  });
}
