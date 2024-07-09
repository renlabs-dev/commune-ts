import "@polkadot/api-augment";

import { ApiPromise } from "@polkadot/api";

import { Api, isSS58, LastBlock, SS58Address, SubspaceModuleProperty, SubspaceModule } from "../types";
import { handleDaos, handleProposals } from "../utils";
import { assert } from "console";

export { ApiPromise };

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
  } = await api.query.system!.account(address) || {};
  return BigInt(freeBalance.toString());
}

// == governanceModule ==

export async function queryProposalsEntries(api: Api) {
  const proposalsQuery = await api.query.governanceModule?.proposals?.entries();

  const [proposals, proposalsErrs] = handleProposals(proposalsQuery);
  for (const err of proposalsErrs) {
    console.error(err);
  }
 
  return proposals;
}

export async function queryDaosEntries(api: Api) {
  const daosQuery =
    await api.query.governanceModule?.curatorApplications?.entries();

  const [daos, daosErrs] = handleDaos(daosQuery);
  for (const err of daosErrs) {
    console.error(err);
  }

  return daos;
}

export async function queryDaoTreasuryAddress(api: Api) {
  return api.query.governanceModule?.daoTreasuryAddress?.()
    .then((address) => address.toHuman() as SS58Address);
}

export async function queryNotDelegatingVotingPower(
  api: Api,
): Promise<string[] | undefined> {
  return api.query.governanceModule?.notDelegatingVotingPower?.().then((power) => power.toHuman() as SS58Address[]);
}

// == subspaceModule ==

export async function queryStakeOut(api: Api) {
  const stakeToQuery = await api.query.subspaceModule?.stakeTo?.entries();

  if (!stakeToQuery) {
    throw new Error("stakeTo is probably undefined");
  }

  let total = 0n;
  const perAddr = new Map<string, bigint>();
  const perNet = new Map<number, bigint>();
  const perAddrPerNet = new Map<number, Map<string, bigint>>();

  for (const [keyRaw, valueRaw] of stakeToQuery) {
    const [netuidRaw, fromAddrRaw] = keyRaw.args;
    assert(netuidRaw, "netuidRaw is defined");
    assert(fromAddrRaw, "fromAddrRaw is defined");
    const netuid = netuidRaw!.toPrimitive() as number;
    const fromAddr = fromAddrRaw!.toString();

    const stakeToMapForKey = valueRaw.toJSON() as Record<
      string,
      string | number
    >;

    for (const moduleKey in stakeToMapForKey) {
      assert(stakeToMapForKey[moduleKey], "stakeToMapForKey[moduleKey] is defined");
      const staked = BigInt(stakeToMapForKey[moduleKey]!);

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

// === validators ===

export async function queryRegisteredModulesInfo<P extends SubspaceModuleProperty>(api: Api, props: P[]): Promise<Pick<SubspaceModule, P | 'uid'>[]> {
  const result = (await Promise.all(props.map(async (prop) => {
    const values = await api.query.subspaceModule![prop]?.entriesPaged({pageSize: 256, args: []});
    // const values = await api.query.subspaceModule![prop]?.entries();
    console.log(values?.length);
    return [prop, values] as const;
  }))).reduce((acc, [prop, values]) => {
    acc[prop] = values!;
    return acc;
  }, {} as Record<P, SubspaceModule[P][]>);

  const registeredModules = [];

  for (let i = 0; i < result['keys'].length; i++) {
    const module = { uid: i } as Pick<SubspaceModule, P | 'uid'>;
    for (const prop of props) {
      module[prop] = result[prop][i]!;
    }
    registeredModules.push(module);
  }

  return registeredModules;
}

// const a = await queryRegisteredModulesInfo({} as any, ["Name", "Address"])