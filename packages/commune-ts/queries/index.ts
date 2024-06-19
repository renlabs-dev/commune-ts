import "@polkadot/api-augment";
import { Api, LastBlock, SS58Address, isSS58 } from "../types";
import { handleDaos, handleProposals } from "../utils";
import { ApiPromise } from "@polkadot/api";

// == chain ==

export async function queryLastBlock(api: ApiPromise): Promise<LastBlock> {
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

// == system ==

export async function queryBalance(api: Api, address: SS58Address | string) {
  if (!isSS58(address)) {
    throw new Error("Invalid address format, expected SS58");
  }
  const {
    data: { free: freeBalance },
  } = await api.query.system.account(address);
  return BigInt(freeBalance.toString());
}

// == governanceModule ==

export async function queryProposalsEntries(api: Api) {
  const proposalsQuery = await api.query.governanceModule.proposals.entries();

  const [proposals, proposalsErrs] = handleProposals(proposalsQuery);
  for (const err of proposalsErrs) {
    console.error(err);
  }

  return proposals;
}

export async function queryDaosEntries(api: Api) {
  const daosQuery =
    await api.query.governanceModule.curatorApplications.entries();

  const [daos, daosErrs] = handleDaos(daosQuery);
  for (const err of daosErrs) {
    console.error(err);
  }

  return daos;
}

export async function queryDaoTreasuryAddress(api: Api) {
  return api.query.governanceModule
    .daoTreasuryAddress()
    .then((address) => address.toHuman() as SS58Address);
}

export async function queryNotDelegatingVotingPower(
  api: Api,
): Promise<string[]> {
  return api.query.governanceModule
    .notDelegatingVotingPower()
    .then((power) => power.toHuman() as SS58Address[]);
}

// == subspaceModule ==

export async function queryStakeOut(api: Api) {
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
