import { z } from "zod";
import type { Enum, Tagged } from "rustie";
import { assert, type Extends } from "tsafe";
import type { Header } from "@polkadot/types/interfaces";
import type { Codec, IU8a } from "@polkadot/types/types";
import type { ApiDecoration } from "@polkadot/api/types";
import { decodeAddress } from "@polkadot/util-crypto";
export type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";

// == Misc ==
export type Entry<T> = [unknown, T];

export type Result<T, E> = Enum<{ Ok: T; Err: E }>;

export interface CustomMetadata {
  title?: string;
  body?: string;
}

export interface CustomDataError {
  message: string;
}

export type CustomMetadataState = Result<CustomMetadata, CustomDataError>;
export type WithMetadataState<T> = T & { customData?: CustomMetadataState };

export const URL_SCHEMA = z.string().trim().url();

export const isNotNull = <T>(item: T | null): item is T => item !== null;

// == Stake ==

export interface StakeData {
  blockNumber: number;
  blockHashHex: string;
  stakeOut: {
    total: bigint;
    perAddr: Map<string, bigint>;
    perNet: Map<number, bigint>;
    perAddrPerNet: Map<number, Map<string, bigint>>;
  };
}

export interface LastBlock {
  blockHeader: Header;
  blockNumber: number;
  blockHash: IU8a;
  blockHashHex: `0x${string}`;
  apiAtBlock: ApiDecoration<"promise">;
}

export interface ProposalStakeInfo {
  stakeFor: bigint;
  stakeAgainst: bigint;
  stakeVoted: bigint;
  stakeTotal: bigint;
}

// == SS58 ==

export type SS58Address = Tagged<string, "SS58Address">;

function isSS58(value: string): value is SS58Address {
  try {
    var decoded = decodeAddress(value);
  } catch (e) {
    console.error(e);
    return false;
  }
  return decoded != null;
}

export const ADDRESS_SCHEMA = z.string().refine(isSS58, "Invalid SS58 address");

// == Transactions ==
export interface TransactionResult {
  finalized: boolean;
  message: string | null;
  status: "SUCCESS" | "ERROR" | "PENDING" | "STARTING" | null;
}

export interface Stake {
  validator: string;
  amount: string;
  netUid: number;
  callback?: (status: TransactionResult) => void;
}

export interface Transfer {
  to: string;
  amount: string;
  callback?: (status: TransactionResult) => void;
}

export interface TransferStake {
  fromValidator: string;
  toValidator: string;
  amount: string;
  netUid: number;
  callback?: (status: TransactionResult) => void;
}

// == Governance ==

export interface Vote {
  proposalId: number;
  vote: string; // TODO i think this should be a boolean
  callback?: (status: TransactionResult) => void;
}

export interface AddCustomProposal {
  IpfsHash: string;
  callback?: (status: TransactionResult) => void;
}

export interface AddDaoApplication {
  IpfsHash: string;
  applicationKey: string;
  callback?: (status: TransactionResult) => void;
}

export const TOKEN_AMOUNT_SCHEMA = z
  .string()
  .or(z.number())
  .transform((value) => BigInt(value));

// == DAO Applications ==

export type DaoStatus = "Pending" | "Accepted" | "Refused";

export interface DaoApplications {
  id: number;
  userId: SS58Address;
  payingFor: SS58Address;
  data: string;
  body?: CustomMetadata;
  status: DaoStatus;
  applicationCost: bigint;
}

export const DAO_APPLICATIONS_SHEMA = z.object({
  id: z.number(),
  userId: ADDRESS_SCHEMA, // TODO: validate SS58 address
  payingFor: ADDRESS_SCHEMA, // TODO: validate SS58 address
  data: z.string(),
  status: z
    .string()
    .refine(
      (value) => ["Pending", "Accepted", "Refused"].includes(value),
      "Invalid proposal status",
    )
    .transform((value) => value as DaoStatus),
  applicationCost: TOKEN_AMOUNT_SCHEMA,
});

assert<Extends<z.infer<typeof DAO_APPLICATIONS_SHEMA>, DaoApplications>>();

export function parseDaos(valueRaw: Codec): DaoApplications | null {
  const value = valueRaw.toPrimitive();
  const validated = DAO_APPLICATIONS_SHEMA.safeParse(value);
  if (!validated.success) {
    return null;
  }
  return validated.data as unknown as DaoApplications;
}

export type DAOCardFields = {
  title: string | null;
  body: string | null;
};

export type DaoState = WithMetadataState<DaoApplications>;

// == Proposals ==

export type ProposalStatus = Enum<{
  open: {
    votesFor: SS58Address[];
    votesAgainst: SS58Address[];
    stakeFor: bigint;
    stakeAgainst: bigint;
  };
  accepted: { block: number; stakeFor: bigint; stakeAgainst: bigint };
  refused: { block: number; stakeFor: bigint; stakeAgainst: bigint };
  expired: null;
}>;

const PROPOSAL_STATUS_SCHEMA = z.union([
  z.object({
    open: z.object({
      votesFor: z.array(ADDRESS_SCHEMA),
      votesAgainst: z.array(ADDRESS_SCHEMA),
      stakeFor: TOKEN_AMOUNT_SCHEMA,
      stakeAgainst: TOKEN_AMOUNT_SCHEMA,
    }),
  }),
  z.object({
    accepted: z.object({
      block: z.number(),
      stakeFor: TOKEN_AMOUNT_SCHEMA,
      stakeAgainst: TOKEN_AMOUNT_SCHEMA,
    }),
  }),
  z.object({
    refused: z.object({
      block: z.number(),
      stakeFor: TOKEN_AMOUNT_SCHEMA,
      stakeAgainst: TOKEN_AMOUNT_SCHEMA,
    }),
  }),
  z.object({
    expired: z.null(),
  }),
]);

assert<Extends<z.infer<typeof PROPOSAL_STATUS_SCHEMA>, ProposalStatus>>();

export type ProposalData = Enum<{
  globalCustom: null;
  globalParams: Record<string, unknown>;
  subnetCustom: { subnetId: number };
  subnetParams: { subnetId: number; params: Record<string, unknown> };
  transferDaoTreasury: { account: SS58Address; amount: bigint };
}>;

export const PROPOSAL_DATA_SCHEMA = z.union([
  z.object({ globalCustom: z.null() }),
  z.object({ globalParams: z.record(z.unknown()) }),
  z.object({ subnetCustom: z.object({ subnetId: z.number() }) }),
  z.object({
    subnetParams: z.object({
      subnetId: z.number(),
      params: z.record(z.unknown()),
    }),
  }),
  z.object({
    transferDaoTreasury: z.object({
      account: ADDRESS_SCHEMA,
      amount: TOKEN_AMOUNT_SCHEMA,
    }),
  }),
]);

export function parseProposal(valueRaw: Codec): Proposal | null {
  const value = valueRaw.toPrimitive();
  const validated = PROPOSAL_SCHEMA.safeParse(value);
  if (!validated.success) {
    return null;
  }
  return validated.data;
}

assert<Extends<z.infer<typeof PROPOSAL_DATA_SCHEMA>, ProposalData>>();

export interface Proposal {
  id: number;
  proposer: SS58Address;
  expirationBlock: number;
  data: ProposalData;
  status: ProposalStatus;
  metadata: string;
  proposalCost: bigint;
  creationBlock: number;
}

export const PROPOSAL_SCHEMA = z.object({
  id: z.number(),
  proposer: ADDRESS_SCHEMA,
  expirationBlock: z.number(),
  data: PROPOSAL_DATA_SCHEMA,
  status: PROPOSAL_STATUS_SCHEMA,
  metadata: z.string(),
  proposalCost: TOKEN_AMOUNT_SCHEMA,
  creationBlock: z.number(),
});

assert<Extends<z.infer<typeof PROPOSAL_SCHEMA>, Proposal>>();

export type ProposalState = WithMetadataState<Proposal>;

export type ProposalCardFields = {
  title: string | null;
  body: string | null;
  netuid: number | "GLOBAL";
  invalid?: boolean;
};

// == Field Params ==

const PARAM_FIELD_DISPLAY_NAMES: Record<string, string> = {
  // # Global
  maxNameLength: "Max Name Length",
  maxAllowedSubnets: "Max Allowed Subnets",
  maxAllowedModules: "Max Allowed Modules",
  unitEmission: "Unit Emission",
  floorDelegationFee: "Floor Delegation Fee",
  maxRegistrationsPerBlock: "Max Registrations Per Block",
  targetRegistrationsPerInterval: "Target Registrations Per Interval",
  targetRegistrationsInterval: "Target Registrations Interval",
  burnRate: "Burn Rate",
  minBurn: "Min Burn",
  maxBurn: "Max Burn",
  adjustmentAlpha: "Adjustment Alpha",
  minStake: "Min Stake",
  maxAllowedWeights: "Max Allowed Weights",
  minWeightStake: "Min Weight Stake",
  proposalCost: "Proposal Cost",
  proposalExpiration: "Proposal Expiration",
  proposalParticipationThreshold: "Proposal Participation Threshold",
  // # Subnet
  founder: "Founder",
  founderShare: "Founder Share",
  immunityPeriod: "Immunity Period",
  incentiveRatio: "Incentive Ratio",
  maxAllowedUids: "Max Allowed UIDs",
  // maxAllowedWeights: "Max Allowed Weights",
  maxStake: "Max Stake",
  maxWeightAge: "Max Weight Age",
  minAllowedWeights: "Min Allowed Weights",
  // minStake: "Min Stake",
  name: "Name",
  tempo: "Tempo",
  trustRatio: "Trust Ratio",
  voteMode: "Vote Mode",
};

export const paramNameToDisplayName = (param_name: string): string => {
  return PARAM_FIELD_DISPLAY_NAMES[param_name] ?? param_name;
};
