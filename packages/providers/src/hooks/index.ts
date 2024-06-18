/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import "@polkadot/api-augment";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  type Api,
  type LastBlock,
  type Nullish,
  type Result,
  type SS58Address,
  type CustomMetadata,
  type CustomDataError,
  LAST_BLOCK_STALE_TIME,
  CUSTOM_METADATA_SCHEMA,
  PROPOSALS_STALE_TIME,
  STAKE_STALE_TIME,
} from "@repo/communext/types";
import {
  queryBalance,
  queryDaoTreasuryAddress,
  queryDaosEntries,
  queryLastBlock,
  queryNotDelegatingVotingPower,
  queryProposalsEntries,
  queryStakeOut,
} from "@repo/communext/queries";
import { buildIpfsGatewayUrl, parseIpfsUri } from "@repo/communext/utils";
import type { ApiPromise } from "@polkadot/api";

// == chain ==

export function useLastBlock(api: ApiPromise | null) {
  return useQuery({
    queryKey: ["last_block"],
    enabled: api != null,
    queryFn: () => queryLastBlock(api!),
    staleTime: LAST_BLOCK_STALE_TIME,
    refetchOnWindowFocus: false,
  });
}

// == system ==

export function useBalance(api: Api, address: SS58Address | string) {
  return useQuery({
    queryKey: ["balance", address],
    queryFn: () => queryBalance(api, address),
    staleTime: LAST_BLOCK_STALE_TIME,
    refetchOnWindowFocus: false,
  });
}

// == governanceModule ==

export function useProposals(api: Api) {
  return useQuery({
    queryKey: ["proposals"],
    queryFn: () => queryProposalsEntries(api),
    staleTime: PROPOSALS_STALE_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useDaos(api: Api) {
  return useQuery({
    queryKey: ["daos"],
    queryFn: () => queryDaosEntries(api),
    staleTime: PROPOSALS_STALE_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useDaoTreasury(api: Api) {
  return useQuery({
    queryKey: ["dao_treasury"],
    queryFn: () => queryDaoTreasuryAddress(api),
    staleTime: PROPOSALS_STALE_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useNotDelegatingVoting(api: Api) {
  return useQuery({
    queryKey: ["not_delegating_voting_power"],
    queryFn: () => queryNotDelegatingVotingPower(api),
    staleTime: LAST_BLOCK_STALE_TIME,
    refetchOnWindowFocus: false,
  });
}

// == subspaceModule ==

export function useAllStakeOut(api: Api) {
  return useQuery({
    queryKey: ["stake_out"],
    queryFn: () => queryStakeOut(api),
    staleTime: STAKE_STALE_TIME,
    refetchOnWindowFocus: false,
  });
}

// == Custom metadata ==

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
        refetchOnWindowFocus: false,
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
