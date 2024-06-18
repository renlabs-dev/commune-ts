import { z } from "zod";
import type { Enum, Tagged } from "rustie";
import { assert, type Extends } from "tsafe";
import { decodeAddress } from "@polkadot/util-crypto";
import type { Header } from "@polkadot/types/interfaces";
import type { Codec, IU8a } from "@polkadot/types/types";
import type { ApiDecoration } from "@polkadot/api/types";
import { ApiPromise } from "@polkadot/api";
export type { Codec } from "@polkadot/types/types";

// == Misc ==

export type Entry<T> = [unknown, T];
export type RawEntry = Entry<Codec>[] | undefined;
export type Result<T, E> = Enum<{ Ok: T; Err: E }>;

export type Nullish = null | undefined;
export type Api = ApiDecoration<"promise"> | ApiPromise;

export interface CustomMetadata {
  title?: string;
  body?: string;
}

export interface BaseProposal {
  id: number;
  metadata: string;
}

export interface BaseDao {
  id: number;
  data: string;
}

export const CUSTOM_METADATA_SCHEMA = z.object({
  title: z.string().optional(),
  body: z.string().optional(),
});

assert<Extends<z.infer<typeof CUSTOM_METADATA_SCHEMA>, CustomMetadata>>();

export interface CustomDataError {
  message: string;
}

export type CustomMetadataState = Result<CustomMetadata, CustomDataError>;
export type WithMetadataState<T> = T & { customData?: CustomMetadataState };

export const URL_SCHEMA = z.string().trim().url();

export const isNotNull = <T>(item: T | null): item is T => item !== null;

// == Subspace refresh times ==
// TODO: these values should be passed as parameters in the functions passed by the apps (env).

// Time to consider last block query un-fresh. Half block time is the expected
// time for a new block at a random point in time, so:
// block_time / 2  ==  8 seconds / 2  ==  4 seconds
export const LAST_BLOCK_STALE_TIME = (1000 * 8) / 2;

// Time to consider proposals query state un-fresh. They don't change a lot,
// only when a new proposal is created and people should be able to see new
// proposals fast enough.
// 1 minute (arbitrary).
export const PROPOSALS_STALE_TIME = 1000 * 60;

// Time to consider stake query state un-fresh. They also don't change a lot,
// only when people move their stake / delegation. That changes the way votes
// are computed, but only very marginally for a given typical stake change, with
// a small chance of a relevant difference in displayed state.
// 5 minutes (arbitrary).
export const STAKE_STALE_TIME = 1000 * 60 * 5; // 5 minutes (arbitrary)

// == Stake ==

export interface StakeOutData {
  total: bigint;
  perAddr: Map<string, bigint>;
  perNet: Map<number, bigint>;
  perAddrPerNet: Map<number, Map<string, bigint>>;
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

export function isSS58(value: string): value is SS58Address {
  let decoded = null;
  try {
    decoded = decodeAddress(value);
  } catch (e) {
    return false;
  }
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return decoded != null;
}

export const ADDRESS_SCHEMA = z.string().refine(isSS58, "Invalid SS58 address");

export function parseAddress(valueRaw: Codec): DaoApplications | null {
  const value = valueRaw.toPrimitive();
  const validated = DAO_APPLICATIONS_SCHEMA.safeParse(value);
  if (!validated.success) {
    return null;
  }
  return validated.data as unknown as DaoApplications;
}

// == Query params validation ==
export const QUERY_PARAMS_SCHEMA = z.object({
  netuid: z.number(),
  address: ADDRESS_SCHEMA,
});

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

export interface UpdateDelegatingVotingPower {
  isDelegating: boolean;
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

export const DAO_APPLICATIONS_SCHEMA = z.object({
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

assert<Extends<z.infer<typeof DAO_APPLICATIONS_SCHEMA>, DaoApplications>>();

export function parseDaos(valueRaw: Codec): DaoApplications | null {
  const value = valueRaw.toPrimitive();
  const validated = DAO_APPLICATIONS_SCHEMA.safeParse(value);
  if (!validated.success) {
    return null;
  }
  return validated.data as unknown as DaoApplications;
}

export interface DAOCardFields {
  title: string | null;
  body: string | null;
}

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

export interface ProposalCardFields {
  title: string | null;
  body: string | null;
  netuid: number | "GLOBAL";
  invalid?: boolean;
}

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

export const paramNameToDisplayName = (paramName: string): string => {
  return PARAM_FIELD_DISPLAY_NAMES[paramName] ?? paramName;
};
