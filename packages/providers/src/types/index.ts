// == Transactions ==
import { z } from "zod";
import type { Tagged } from "rustie";

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
  vote: boolean;
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
  status: TransactionResult;
  applicationCost: number;
}

export type DaoStatus = "Pending" | "Accepted" | "Refused";

// == Schemas ==

export const ADDRESS_SCHEMA = z
  .string()
  .transform((value) => value as SS58Address);

export const DAO_SHEMA = z.object({
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
