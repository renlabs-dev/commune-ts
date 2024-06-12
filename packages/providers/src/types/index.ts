import { z } from "zod";
import type { Enum, Tagged } from "rustie";
import { assert, type Extends } from "tsafe";
import type { Header } from "@polkadot/types/interfaces";
import type { IU8a } from "@polkadot/types/types";
import type { ApiDecoration } from "@polkadot/api/types";

export type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";

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

export type SS58Address = Tagged<string, "SS58Address">;

// == S0 Applications ==

export type DaoStatus = "Pending" | "Accepted" | "Refused";

export interface CustomDaoData {
  discordId?: string;
  title?: string;
  body?: string;
}

export interface DaoApplications {
  id: number;
  userId: SS58Address;
  payingFor: SS58Address;
  data: string;
  body?: CustomDaoData;
  status: DaoStatus;
  applicationCost: number;
}

// == Proposals ==

export type ProposalStatus = "Pending" | "Accepted" | "Refused" | "Expired";

export type ProposalData = Enum<{
  custom: string;
  globalParams: Record<string, unknown>;
  subnetParams: { netuid: number; params: Record<string, unknown> };
  subnetCustom: { netuid: number; data: string };
  expired: null;
}>;

export interface Proposal {
  id: number;
  proposer: SS58Address;
  status: ProposalStatus;
  expirationBlock: number;
  votesFor: SS58Address[];
  votesAgainst: SS58Address[];
  finalizationBlock: number | null;
  data: ProposalData;
}

export interface CustomProposalData {
  title?: string;
  body?: string;
}

export interface CustomDataError {
  message: string;
}

export type Result<T, E> = Enum<{ Ok: T; Err: E }>;

export const isNotNull = <T>(item: T | null): item is T => item !== null;

export type CustomProposalDataState = Result<
  CustomProposalData,
  CustomDataError
>;
export interface ProposalState extends Proposal {
  customData?: CustomProposalDataState;
}

export interface ProposalStakeInfo {
  stakeFor: bigint;
  stakeAgainst: bigint;
  stakeVoted: bigint;
  stakeTotal: bigint;
}

export interface LastBlock {
  blockHeader: Header;
  blockNumber: number;
  blockHash: IU8a;
  blockHashHex: `0x${string}`;
  apiAtBlock: ApiDecoration<"promise">;
}

// == Schemas ==

export const URL_SCHEMA = z.string().trim().url();

export const ADDRESS_SCHEMA = z
  .string()
  .transform((value) => value as SS58Address);

export const DAO_SCHEMA = z.object({
  id: z.number(),
  userId: ADDRESS_SCHEMA,
  payingFor: ADDRESS_SCHEMA,
  data: z.string(),
  status: z
    .string()
    .refine(
      (value) => ["Pending", "Accepted", "Refused"].includes(value),
      "Invalid proposal status"
    )
    .transform((value) => value as DaoStatus),
  applicationCost: z.number(),
});

export const PROPOSAL_DATA_SCHEMA = z.union([
  z.object({
    custom: z.string(),
  }),
  z.object({
    globalParams: z
      .object({})
      .passthrough()
      .transform((value) => value as Record<string, unknown>),
  }),
  z.object({
    subnetParams: z.object({
      netuid: z.number(),
      params: z
        .object({})
        .passthrough()
        .transform((value) => value as Record<string, unknown>),
    }),
  }),
  z.object({
    subnetCustom: z.object({
      netuid: z.number(),
      data: z.string(),
    }),
  }),
  z.object({ expired: z.null() }),
]);

assert<Extends<z.infer<typeof PROPOSAL_DATA_SCHEMA>, ProposalData>>();

export const PROPOSAL_SCHEMA = z
  .object({
    id: z.number(),
    proposer: ADDRESS_SCHEMA,
    expirationBlock: z.number(),
    data: PROPOSAL_DATA_SCHEMA,
    status: z
      .string()
      .refine(
        (value) =>
          ["Pending", "Accepted", "Refused", "Expired"].includes(value),
        "Invalid proposal status"
      )
      .transform((value) => value as ProposalStatus),
    votesFor: z.array(ADDRESS_SCHEMA),
    votesAgainst: z.array(ADDRESS_SCHEMA),
    proposalCost: z.number(),
    finalizationBlock: z.number().nullable(),
  })
  .superRefine((value, ctx) => {
    if (value.status === "Accepted" && value.finalizationBlock === null) {
      ctx.addIssue({
        code: "custom",
        message:
          "Proposal status is 'Accepted', but no finalization block was found",
      });
    }
  });

export const CUSTOM_PROPOSAL_METADATA_SCHEMA = z.object({
  title: z.string().optional(),
  body: z.string().optional(),
});

export const PARAM_FIELD_DISPLAY_NAMES: Record<string, string> = {
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
