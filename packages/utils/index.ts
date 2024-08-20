import { CID } from "multiformats/cid";
import { AssertionError } from "tsafe";

import {
  AnyTuple,
  Codec,
  DAO_APPLICATIONS_SCHEMA,
  DaoApplications,
  Entry,
  isSS58,
  Proposal,
  PROPOSAL_SCHEMA,
  RawEntry,
  SS58Address,
  StorageKey,
  SUBSPACE_MODULE_SCHEMA,
  SubspaceModule,
  URL_SCHEMA,
} from "@commune-ts/types";

/**
 * == Subspace refresh times ==
 *
 * TODO: these values should be passed as parameters in the functions passed by the apps (env).
 *
 * Time to consider last block query un-fresh. Half block time is the expected
 * time for a new block at a random point in time, so:
 * block_time / 2  ==  8 seconds / 2  ==  4 seconds
 */
export const LAST_BLOCK_STALE_TIME = (1000 * 8) / 2;

/**
 * Time to consider proposals query state un-fresh. They don't change a lot,
 * only when a new proposal is created and people should be able to see new
 * proposals fast enough.
 *
 * 1 minute (arbitrary).
 */
export const PROPOSALS_STALE_TIME = 1000 * 60;

/**
 * Time to consider stake query state un-fresh. They also don't change a lot,
 * only when people move their stake / delegation. That changes the way votes
 * are computed, but only very marginally for a given typical stake change, with
 * a small chance of a relevant difference in displayed state.
 * 5 minutes (arbitrary).
 */
export const STAKE_STALE_TIME = 1000 * 60 * 5; // 5 minutes (arbitrary)

export const PARAM_FIELD_DISPLAY_NAMES = {
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
} as const;

// == assertion ==

export function assertOrThrow(
  condition: any,
  message: string,
): asserts condition {
  if (!condition) {
    throw new AssertionError(message);
  }
}

// == Calc ==

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
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function calculateAmount(amount: string): number {
  return Math.floor(Number(amount) * 10 ** 9);
}

export function smallAddress(address: string, size?: number): string {
  return `${address.slice(0, size || 8)}…${address.slice(size ? size * -1 : -8)}`;
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

// == Handlers ==

export function handleEntries<T>(
  rawEntries: RawEntry,
  parser: (value: Codec) => T | null,
): [T[], Error[]] {
  const entries: T[] = [];
  const errors: Error[] = [];
  for (const entry of rawEntries ?? []) {
    const [, valueRaw] = entry;
    const parsedEntry = parser(valueRaw);
    if (parsedEntry == null) {
      errors.push(new Error(`Invalid entry: ${entry.toString()}`));
      continue;
    }
    entries.push(parsedEntry);
  }
  entries.reverse();
  return [entries, errors];
}

export function handleProposals(
  rawProposals: Entry<Codec>[] | undefined,
): [Proposal[], Error[]] {
  return handleEntries(rawProposals, parseProposal);
}

export function handleDaos(
  rawDaos: Entry<Codec>[] | undefined,
): [DaoApplications[], Error[]] {
  return handleEntries(rawDaos, parseDaos);
}

export const copyToClipboard = (text: string) => {
  // @ts-ignore
  navigator.clipboard.writeText(text);
};

// == Time ==

export function getExpirationTime(
  blockNumber: number | undefined,
  expirationBlock: number,
  shouldReturnRemainingTime: boolean,
) {
  if (!blockNumber) return "Unknown";

  const blocksRemaining = expirationBlock - blockNumber;
  const secondsRemaining = blocksRemaining * 8; // 8 seconds per block

  const expirationDate = new Date(Date.now() + secondsRemaining * 1000);
  const currentDate = new Date();

  // Format the date as MM/DD/YYYY
  const month = (expirationDate.getMonth() + 1).toString().padStart(2, "0");
  const day = expirationDate.getDate().toString().padStart(2, "0");
  const year = expirationDate.getFullYear();

  const formattedDate = `${month}/${day}/${year}`;

  // Check if the expiration time has passed
  if (expirationDate <= currentDate) {
    return `${formattedDate} ${shouldReturnRemainingTime ? "(Matured)" : ""}`;
  }

  // Calculate hours remaining
  const hoursRemaining = Math.floor(secondsRemaining / 3600);

  return `${formattedDate} ${shouldReturnRemainingTime ? `(${hoursRemaining} hours)` : ""}`;
}

export class StorageEntry {
  constructor(private readonly entry: [StorageKey<AnyTuple>, unknown]) {}

  get netuid(): number {
    return this.entry[0].args[0]!.toPrimitive() as number;
  }

  get uidOrKey(): string | number {
    return this.entry[0].args[1]!.toPrimitive() as string | number;
  }

  get value(): Codec {
    return this.entry[1] as Codec;
  }

  /**
   * as the module identifier can be a uid or a key, this function resolves it to a key
   */
  resolveKey(uidKeyMap: Map<number, Map<number, SS58Address>>): SS58Address {
    const isUid = typeof this.uidOrKey === "number";

    const key = isUid
      ? uidKeyMap.get(this.netuid)!.get(this.uidOrKey)!
      : this.uidOrKey;

    assertOrThrow(isSS58(key), `key ${this.netuid}::${key} is an SS58Address`);

    return key;
  }
}

// the value of a "keys" entry is a codec that holds a ss58 address
export function newSubstrateModule(keyEntry: StorageEntry): SubspaceModule {
  const key = keyEntry.value.toPrimitive() as SS58Address;

  return SUBSPACE_MODULE_SCHEMA.parse({
    uid: keyEntry.uidOrKey as number,
    netuid: keyEntry.netuid,
    key,
  });
}

export function parseAddress(valueRaw: Codec): DaoApplications | null {
  const value = valueRaw.toPrimitive();
  const validated = DAO_APPLICATIONS_SCHEMA.safeParse(value);
  if (!validated.success) {
    return null;
  }
  return validated.data as unknown as DaoApplications;
}

export function parseDaos(valueRaw: Codec): DaoApplications | null {
  const value = valueRaw.toPrimitive();
  const validated = DAO_APPLICATIONS_SCHEMA.safeParse(value);
  if (!validated.success) {
    return null;
  }
  return validated.data as unknown as DaoApplications;
}

export function parseProposal(valueRaw: Codec): Proposal | null {
  const value = valueRaw.toPrimitive();
  const validated = PROPOSAL_SCHEMA.safeParse(value);
  if (!validated.success) {
    return null;
  }
  return validated.data;
}

export const paramNameToDisplayName = (paramName: string): string => {
  return (
    PARAM_FIELD_DISPLAY_NAMES[
      paramName as keyof typeof PARAM_FIELD_DISPLAY_NAMES
    ] ?? paramName
  );
};

export const isNotNull = <T>(item: T | null): item is T => item !== null;
