/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import "@polkadot/api-augment";
import type { ApiPromise } from "@polkadot/api";
import { useQueries, useQuery } from "@tanstack/react-query";
import type { Codec } from "@polkadot/types/types";
import { buildIpfsGatewayUrl, formatToken, parseIpfsUri } from "../utils";
import {
  type StakeOutData,
  type Nullish,
  type LastBlock,
  type RawEntry,
  type Proposal,
  type Entry,
  type Result,
  type DaoApplications,
  type CustomMetadata,
  type CustomDataError,
  parseProposal,
  parseDaos,
  PROPOSALS_STALE_TIME,
  LAST_BLOCK_STALE_TIME,
  CUSTOM_METADATA_SCHEMA,
} from "../types";

// == Handlers ==

function useGenericQuery<T>(
  lastBlock: LastBlock | Nullish,
  queryKey: string,
  queryFn: () => Promise<T>,
) {
  const api = lastBlock?.apiAtBlock;
  const blockNumber = lastBlock?.blockNumber;

  return useQuery({
    queryKey: [{ blockNumber }, queryKey],
    enabled: api != null,
    queryFn: () => queryFn(),
    staleTime: PROPOSALS_STALE_TIME,
  });
}

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

interface BaseProposal {
  id: number;
  metadata: string;
}

interface BaseDao {
  id: number;
  data: string;
}

export async function fetchCustomMetadata(
  kind: "proposal" | "dao",
  entryId: number,
  metadataField: string,
): Promise<Result<CustomMetadata, CustomDataError>> {
  const cid = parseIpfsUri(metadataField);
  if (cid == null) {
    const message = `Invalid IPFS URI '${metadataField}' for ${kind} ${entryId}`;
    return { Err: { message } };
  }

  const url = buildIpfsGatewayUrl(cid);
  const response = await fetch(url);
  const obj: unknown = await response.json();

  const schema = CUSTOM_METADATA_SCHEMA;
  const validated = schema.safeParse(obj);

  if (!validated.success) {
    const message = `Invalid metadata for ${kind} ${entryId} at ${url}`;
    return { Err: { message } };
  }

  return { Ok: validated.data };
}

export function useCustomMetadata<T extends BaseProposal | BaseDao>(
  kind: "proposal" | "dao",
  lastBlock: LastBlock | Nullish,
  items: T[],
) {
  type Output = Awaited<ReturnType<typeof fetchCustomMetadata>>;
  const blockNumber = lastBlock?.blockNumber;
  return useQueries({
    queries: items.map((item) => {
      const id = item.id;
      const metadataField = "metadata" in item ? item.metadata : item.data;
      return {
        queryKey: [{ blockNumber }, "metadata", { kind, id }],
        queryFn: async (): Promise<[number, Output]> => {
          const data = await fetchCustomMetadata(kind, id, metadataField);
          return [id, data];
        },
        staleTime: Infinity,
      };
    }),
    combine: (results) => {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      type ListItem<L> = L extends (infer T)[] ? T : never;
      const outputs = new Map<number, ListItem<typeof results>>();
      results.forEach((result) => {
        const { data } = result;
        if (data != null) {
          const [id] = data;
          outputs.set(id, result);
        } else {
          // eslint-disable-next-line no-console
          console.info(`Missing result for ${kind} metadata query`);
        }
      });
      return outputs;
    },
  });
}

// == Balance ==

export async function getBalance({
  api,
  address,
}: {
  api: ApiPromise;
  address: string;
}): Promise<string> {
  const {
    data: {
      free,
      // reserved
    },
  } = await api.query.system.account(address);

  const balanceNum = Number(free);
  return formatToken(balanceNum);
}

// == Proposals ==

export function useProposals(lastBlock: LastBlock | Nullish) {
  return useGenericQuery(lastBlock, "proposals", async () => {
    const api = lastBlock?.apiAtBlock;
    return api?.query.governanceModule.proposals.entries();
  });
}

export function handleProposals(
  rawProposals: Entry<Codec>[] | undefined,
): [Proposal[], Error[]] {
  return handleEntries(rawProposals, parseProposal);
}

// == S0 Applications ==

export function useDaos(lastBlock: LastBlock | Nullish) {
  return useGenericQuery(lastBlock, "daos", async () => {
    const api = lastBlock?.apiAtBlock;
    return api?.query.governanceModule.curatorApplications.entries();
  });
}

export function handleDaos(
  rawDaos: Entry<Codec>[] | undefined,
): [DaoApplications[], Error[]] {
  return handleEntries(rawDaos, parseDaos);
}

export function useDaoTreasury(lastBlock: LastBlock | Nullish) {
  return useGenericQuery(lastBlock, "dao_treasury", async () => {
    const api = lastBlock?.apiAtBlock;
    return api?.query.governanceModule?.daoTreasuryAddress?.();
  });
}

// == General Queries ==

export function useNotDelegatingVoting(lastBlock: LastBlock | Nullish) {
  return useGenericQuery(lastBlock, "not_delegating_voting", async () => {
    const api = lastBlock?.apiAtBlock;
    return api?.query.governanceModule?.daoTreasuryAddress?.();
  });
}

// == RPC ==

export async function getLastBlock(api: ApiPromise): Promise<LastBlock> {
  const blockHeader = await api.rpc.chain.getHeader();
  const blockNumber = blockHeader.number.toNumber();
  const blockHash = blockHeader.hash;
  const blockHashHex = blockHash.toHex();
  const apiAtBlock = await api.at(blockHeader.hash);
  return {
    blockHeader,
    blockNumber,
    blockHash,
    blockHashHex,
    apiAtBlock,
  };
}

export function useLastBlock(api: ApiPromise | null) {
  return useQuery({
    queryKey: ["last_block"],
    enabled: api != null,
    queryFn: () => getLastBlock(api!),
    staleTime: LAST_BLOCK_STALE_TIME,
  });
}

export async function getAllStakeOut(
  lastBlock: LastBlock | Nullish,
): Promise<StakeOutData> {
  if (lastBlock == null) {
    throw new Error("lastBlock is null");
  }

  const api = lastBlock.apiAtBlock;

  const stakeToQuery = await api.query.subspaceModule.stakeTo.entries();

  let total = 0n;
  const perAddr = new Map<string, bigint>();
  const perNet = new Map<number, bigint>();
  const perAddrPerNet = new Map<number, Map<string, bigint>>();

  for (const [keyRaw, valueRaw] of stakeToQuery) {
    const [netuidRaw, fromAddrRaw] = keyRaw.args;
    const netuid = netuidRaw.toPrimitive() as number;
    const fromAddr = fromAddrRaw.toString();
    const stakeToMapForKey = valueRaw.toJSON() as Record<
      string,
      string | number
    >;

    for (const moduleKey in stakeToMapForKey) {
      const staked = BigInt(stakeToMapForKey[moduleKey]);

      total += staked;
      perAddr.set(fromAddr, (perAddr.get(fromAddr) ?? 0n) + staked);
      perNet.set(netuid, (perNet.get(netuid) ?? 0n) + staked);

      const mapNet = perAddrPerNet.get(netuid) ?? new Map<string, bigint>();
      mapNet.set(fromAddr, (mapNet.get(fromAddr) ?? 0n) + staked);
      perAddrPerNet.set(netuid, mapNet);
    }
  }

  return {
    total,
    perAddr,
    perNet,
    perAddrPerNet,
  };
}

export function useAllStakeOut(lastBlock: LastBlock | Nullish) {
  return useGenericQuery(lastBlock, "stake_out", async () => {
    return getAllStakeOut(lastBlock);
  });
}
