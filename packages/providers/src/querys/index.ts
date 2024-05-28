import "@polkadot/api-augment";
import type { ApiPromise } from "@polkadot/api";
import { formatToken, parseDaos, parseProposal } from "../utils";
import type { DaoApplications, Proposal } from "../types";

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

export async function getProposals(api: ApiPromise): Promise<Proposal[]> {
  const proposalsRaw = await api.query.subspaceModule.proposals.entries();

  const proposals = [];
  for (const proposalItem of proposalsRaw) {
    const [, valueRaw] = proposalItem;
    const proposal = parseProposal(valueRaw);

    proposals.push(proposal);
  }

  proposals.reverse();
  return proposals as Proposal[];
}

// == S0 Applications ==

export async function getDaoApplications(
  api: ApiPromise
): Promise<DaoApplications[]> {
  const daosRaw = await api.query.subspaceModule.curatorApplications.entries();

  const daos = [];
  for (const daoItem of daosRaw) {
    const [, valueRaw] = daoItem;
    const dao = parseDaos(valueRaw);
    if (dao === null) throw new Error("Invalid DAO");
    daos.push(dao);
  }

  daos.reverse();
  return daos;
}

export async function getGlobalDaoTreasury(api: ApiPromise): Promise<string> {
  const result = await api.query.subspaceModule.globalDaoTreasury();
  return formatToken(Number(JSON.stringify(result)));
}

// == RPC ==

export async function lastBlock(api: ApiPromise) {
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

export async function getAllStakeOut(api: ApiPromise) {
  const { apiAtBlock, blockNumber, blockHashHex } = await lastBlock(api);
  const stakeToQuery = await apiAtBlock.query.subspaceModule.stakeTo.entries();

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
    blockNumber,
    blockHashHex,
    stakeOut: { total, perAddr, perNet, perAddrPerNet },
  };
}
