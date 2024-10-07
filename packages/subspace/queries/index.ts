/* eslint-disable @typescript-eslint/no-non-null-assertion */
import "@polkadot/api-augment";

import { ApiPromise, Keyring } from "@polkadot/api";
import { encodeAddress } from "@polkadot/util-crypto";

import type {
  Api,
  LastBlock,
  OptionalProperties,
  SS58Address,
  StakeOutData,
  SubspaceModule,
  VoteWithStake,
} from "@commune-ts/types";
import {
  isSS58,
  NetworkSubnetConfig,
  NetworkSubnetConfigSchema,
  MODULE_BURN_CONFIG_SCHEMA,
  GOVERNANCE_CONFIG_SCHEMA,
  SUBSPACE_MODULE_SCHEMA,
} from "@commune-ts/types";
import {
  ChainEntry,
  handleDaos,
  handleProposals,
  StorageEntry,
  getPropsToMap,
  standardizeUidToSS58address,
  SubspacePalletName,
  SubspaceStorageName,
} from "@commune-ts/utils";

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
  } = await api.query.system.account(address);
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

export async function pushToWhitelist(
  api: ApiPromise,
  moduleKey: SS58Address,
  mnemonic: string | undefined,
) {
  if (!api.tx.governanceModule?.addToWhitelist) return false;

  const keyring = new Keyring({ type: "sr25519" });

  if (!mnemonic) {
    throw new Error("No sudo mnemonic provided");
  }
  const sudoKeypair = keyring.addFromUri(mnemonic);
  const accountId = encodeAddress(moduleKey, 42);

  const tx = api.tx.governanceModule.addToWhitelist(accountId);

  const extrinsic = await tx
    .signAndSend(sudoKeypair)
    .catch((err) => {
      console.error(err);
      return false;
    })
    .then(() => {
      console.log(`Extrinsic: ${extrinsic}`);
      return true;
    });
}

export async function removeFromWhitelist(
  api: ApiPromise,
  moduleKey: SS58Address,
  mnemonic: string | undefined,
) {
  if (!api.tx.governanceModule?.removeFromWhitelist) return false;
  if (!mnemonic) {
    throw new Error("No sudo mnemonic provided");
  }

  const accountId = encodeAddress(moduleKey, 42);
  const tx = api.tx.governanceModule.removeFromWhitelist(accountId);

  const keyring = new Keyring({ type: "sr25519" });
  const sudoKeypair = keyring.addFromUri(mnemonic);
  const extrinsic = await tx
    .signAndSend(sudoKeypair)
    .catch((err) => {
      console.error(err);
      return false;
    })
    .then(() => {
      console.log(`Extrinsic: ${extrinsic}`);
      return true;
    });
}

export async function refuseDaoApplication(
  api: ApiPromise,
  proposalId: number,
  mnemonic: string | undefined,
) {
  if (!api.tx.governanceModule?.refuseDaoApplication) return false;
  if (!mnemonic) {
    throw new Error("No sudo mnemonic provided");
  }

  const tx = api.tx.governanceModule.refuseDaoApplication(proposalId);

  const keyring = new Keyring({ type: "sr25519" });
  const sudoKeypair = keyring.addFromUri(mnemonic);
  const extrinsic = await tx
    .signAndSend(sudoKeypair)
    .catch((err) => {
      console.error(err);
      return false;
    })
    .then(() => {
      console.log(`Extrinsic: ${extrinsic}`);
      return true;
    });

  return true;
}

export async function queryDaoTreasuryAddress(api: Api) {
  return api.query.governanceModule
    ?.daoTreasuryAddress?.()
    .then((address) => address.toHuman() as SS58Address);
}

export async function queryUnrewardedProposals(api: Api): Promise<number[]> {
  const unrewardedProposals =
    await api.query.governanceModule?.unrewardedProposals?.entries();

  if (!unrewardedProposals) {
    throw new Error("unrewardedProposals is falsey");
  }

  return unrewardedProposals
    .map(([key]) => {
      // The key is a StorageKey, which contains the proposal ID
      // We need to extract the proposal ID from this key and convert it to a number
      const proposalId = key.args[0]?.toString();
      return proposalId ? parseInt(proposalId, 10) : NaN;
    })
    .filter((id): id is number => !isNaN(id));
}

enum VoteMode {
  Vote,
}

interface GovernanceConfiguration {
  proposalCost?: bigint;
  proposalExpiration?: number;
  voteMode?: VoteMode;
  proposalRewardTreasuryAllocation?: number;
  maxProposalRewardTreasuryAllocation?: bigint;
  proposalRewardInterval?: bigint;
}

export async function queryGlobalGovernanceConfig(
  api: Api,
): Promise<GovernanceConfiguration> {
  const globalGovernanceConfig =
    api.query.governanceModule?.globalGovernanceConfig;

  if (!globalGovernanceConfig) {
    throw new Error("globalGovernanceConfig is falsey");
  }

  const config = (await globalGovernanceConfig()) as GovernanceConfiguration;

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!config) {
    throw new Error("Failed to fetch global governance config");
  }

  const parsedConfig: GovernanceConfiguration = {};

  // Safely parse each field
  if ("proposalCost" in config) {
    parsedConfig.proposalCost = BigInt(config.proposalCost?.toString() ?? "0");
  }
  if ("proposalExpiration" in config) {
    parsedConfig.proposalExpiration = config.proposalExpiration;
  }
  if ("voteMode" in config) {
    parsedConfig.voteMode = config.voteMode;
  }
  if ("proposalRewardTreasuryAllocation" in config) {
    parsedConfig.proposalRewardTreasuryAllocation =
      config.proposalRewardTreasuryAllocation;
  }
  if ("maxProposalRewardTreasuryAllocation" in config) {
    parsedConfig.maxProposalRewardTreasuryAllocation = BigInt(
      config.maxProposalRewardTreasuryAllocation?.toString() ?? "0",
    );
  }
  if ("proposalRewardInterval" in config) {
    parsedConfig.proposalRewardInterval = BigInt(
      config.proposalRewardInterval?.toString() ?? "0",
    );
  }

  return parsedConfig;
}

export function getRewardAllocation(
  treasuryBalance: bigint,
  governanceConfig: GovernanceConfiguration,
) {
  if (governanceConfig.proposalRewardTreasuryAllocation == null) return null;
  if (governanceConfig.maxProposalRewardTreasuryAllocation == null) return null;

  const allocationPercentage = BigInt(
    governanceConfig.proposalRewardTreasuryAllocation,
  );
  const maxAllocation = BigInt(
    governanceConfig.maxProposalRewardTreasuryAllocation,
  );

  let allocation = (treasuryBalance * allocationPercentage) / 100n;

  if (allocation > maxAllocation) allocation = maxAllocation;

  // Here there is a "decay" calculation for the n-th proposal reward that
  // we are ignoring, as we want only the first.

  return allocation;
}

export async function queryRewardAllocation(api: Api) {
  const balance = await queryDaoTreasuryAddress(api).then((result) =>
    queryBalance(api, result!),
  );

  const governanceConfig = await queryGlobalGovernanceConfig(api);

  return getRewardAllocation(balance, governanceConfig);
}

export async function queryNotDelegatingVotingPower(api: Api) {
  return api.query.governanceModule
    ?.notDelegatingVotingPower?.()
    .then((power) => power.toHuman() as SS58Address[]);
}

// == subspaceModule ==

export async function queryStakeOut(
  communeCacheUrl: string,
): Promise<StakeOutData> {
  const response = await fetch(`${communeCacheUrl}/api/stake-out`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  const stakeOutData = response.json() as unknown as StakeOutData;
  return stakeOutData;
}

export async function queryCalculateStakeOut(api: Api) {
  // StakeTo is the list of keys that have staked to that key.
  const stakeToQuery = await api.query.subspaceModule?.stakeTo?.entries();

  if (!stakeToQuery) {
    throw new Error("stakeTo is probably undefined");
  }

  let total = 0n;
  const perAddr = new Map<string, bigint>();

  for (const [keyRaw, valueRaw] of stakeToQuery) {
    const [fromAddrRaw] = keyRaw.args;
    const fromAddr = fromAddrRaw!.toString();

    const staked = BigInt(valueRaw.toString());

    total += staked;
    perAddr.set(fromAddr, (perAddr.get(fromAddr) ?? 0n) + staked);
  }

  return {
    total,
    perAddr,
  };
}

export async function queryStakeFrom(
  communeCacheUrl: string,
): Promise<StakeOutData> {
  const response = await fetch(`${communeCacheUrl}/api/stake-from`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  const stakeOutData = response.json() as unknown as StakeOutData;
  return stakeOutData;
}

export async function queryCalculateStakeFrom(api: Api) {
  // Stake From is the list of keys that the key has staked to.

  const stakeFromQuery = await api.query.subspaceModule?.stakeFrom?.entries();

  if (!stakeFromQuery) {
    throw new Error("stakeFrom is probably undefined");
  }

  let total = 0n;
  const perAddr = new Map<string, bigint>();

  for (const [storageKey, value] of stakeFromQuery) {
    const addr = storageKey.toString();

    const staked = BigInt(value.toString());

    total += staked;
    perAddr.set(addr, staked);
  }

  return {
    total,
    perAddr,
  };
}

export async function processVotesAndStakes(
  api: Api,
  communeCacheUrl: string,
  votesFor: SS58Address[],
  votesAgainst: SS58Address[],
): Promise<VoteWithStake[]> {
  // Get addresses not delegating voting power and get stake information
  const [notDelegatingAddresses, stakeFrom, stakeOut] = await Promise.all([
    queryNotDelegatingVotingPower(api),
    queryStakeFrom(communeCacheUrl),
    queryStakeOut(communeCacheUrl),
  ]);

  const notDelegatingSet = new Set(notDelegatingAddresses);

  const stakeOutMap = new Map(
    Object.entries(stakeOut.perAddr).map(([key, value]) => [
      key,
      BigInt(value),
    ]),
  );

  const stakeFromMap = new Map(
    Object.entries(stakeFrom.perAddr).map(([key, value]) => [
      key,
      BigInt(value),
    ]),
  );

  // Pre-calculate total stake for each address
  const totalStakeMap = new Map<SS58Address, bigint>();
  const allAddresses = new Set([...votesFor, ...votesAgainst]);

  for (const address of allAddresses) {
    const stakeFrom = stakeFromMap.get(address) ?? 0n;
    const stakeOut = stakeOutMap.get(address) ?? 0n;

    const totalStake =
      stakeOut > 0n && !notDelegatingSet.has(address)
        ? 0n
        : stakeFrom + stakeOut;
    totalStakeMap.set(address, totalStake);
  }

  // Process all votes and push it to an array to avoid spread
  const processedVotes: VoteWithStake[] = [];
  votesFor.map((address) => {
    processedVotes.push({
      address,
      stake: totalStakeMap.get(address) ?? 0n,
      vote: "In Favor" as const,
    });
  });

  votesAgainst.map((address) => {
    processedVotes.push({
      address,
      stake: totalStakeMap.get(address) ?? 0n,
      vote: "Against" as const,
    });
  });

  // Sort the processed votes
  const sortedVotes = processedVotes.sort((a, b) => Number(b.stake - a.stake));
  return sortedVotes;
}

export async function queryUserTotalStaked(
  api: Api,
  address: SS58Address | string,
) {
  const stakeEntries =
    await api.query.subspaceModule?.stakeTo?.entries(address);

  const stakes = stakeEntries?.map(([key, value]) => {
    const [, stakeToAddress] = key.args;
    const stake = value.toString();

    return {
      address: stakeToAddress!.toString(),
      stake,
    };
  });

  // Filter out any entries with zero stake
  return stakes?.filter((stake) => stake.stake !== "0");
}

// === modules ===

/**
 * @param api
 * @param extraProps if empty, only the required properties are returned (netuid, uid, key)
 * @param netuidWhitelist if empty, modules from all subnets are returned
 */

export async function queryRegisteredSubnetsInfo(api: Api) {
  console.log("Fetching subnet keys from the chain...");
  const netuids = (await api.query.subspaceModule!.subnetNames!.entries()).map(
    (entry) => new StorageEntry(entry).netuid,
  );

  console.log(netuids);
}


export async function querySubnetParams(api: Api): Promise<Array<NetworkSubnetConfig>> {
  const subnetProps: Array<SubspaceStorageName> = [
    "subnetNames",
    "immunityPeriod",
    "minAllowedWeights",
    "maxAllowedWeights", "tempo", "maxAllowedUids", "founder", "founderShare",
    "incentiveRatio", "trustRatio", "maxWeightAge", "bondsMovingAverage",
    "maximumSetWeightCallsPerEpoch", "minValidatorStake", "maxAllowedValidators",
    "moduleBurnConfig", "subnetMetadata"
  ]
  const props: Record<SubspacePalletName, SubspaceStorageName[]> =
    {
      subspaceModule: subnetProps,
      subnetEmissionModule: ["subnetEmission"],
      governanceModule: ["subnetGovernanceConfig"]
    } as Record<SubspacePalletName, SubspaceStorageName[]>;
  const subnetInfo = await queryChain(api, props, [0]);
  const subnetNames = subnetInfo["subnetNames"];


  let subnets: Array<NetworkSubnetConfig> = [];
  for (const [netuid, name] of Object.entries(subnetNames)) {
    const subnet: NetworkSubnetConfig = NetworkSubnetConfigSchema.parse({
      subnetNames: subnetInfo["subnetNames"][netuid]!,
      immunityPeriod: subnetInfo["immunityPeriod"][netuid]!,
      minAllowedWeights: subnetInfo["minAllowedWeights"][netuid]!,
      maxAllowedWeights: subnetInfo["maxAllowedWeights"][netuid]!,
      tempo: subnetInfo["tempo"][netuid]!,
      maxAllowedUids: subnetInfo["maxAllowedUids"][netuid]!,
      founder: subnetInfo["founder"][netuid]!,
      founderShare: subnetInfo["founderShare"][netuid]!,
      incentiveRatio: subnetInfo["incentiveRatio"][netuid]!,
      trustRatio: subnetInfo["trustRatio"][netuid]!,
      maxWeightAge: subnetInfo["maxWeightAge"][netuid]!,
      bondsMovingAverage: subnetInfo["bondsMovingAverage"][netuid],
      maximumSetWeightCallsPerEpoch: subnetInfo["maximumSetWeightCallsPerEpoch"][netuid],
      minValidatorStake: subnetInfo["minValidatorStake"][netuid]!,
      maxAllowedValidators: subnetInfo["maxAllowedValidators"][netuid],
      moduleBurnConfig: MODULE_BURN_CONFIG_SCHEMA.parse(subnetInfo["moduleBurnConfig"][netuid]),
      subnetMetadata: subnetInfo["subnetMetadata"][netuid],
      netuid: netuid,
      subnetGovernanceConfig: GOVERNANCE_CONFIG_SCHEMA.parse(subnetInfo["subnetGovernanceConfig"][netuid]),
      subnetEmission: subnetInfo["subnetEmission"][netuid],
    });
    subnets.push(subnet);
  }
  return subnets;
}


export async function queryRegisteredModulesInfo<
  P extends OptionalProperties<SubspaceModule> & SubspaceStorageName,
>(
  api: Api,
  extraProps: P[] = [],
  netuidWhitelist?: number[],
): Promise<SubspaceModule[]> {
  netuidWhitelist = netuidWhitelist?.length
    ? Array.from(new Set(netuidWhitelist))
    : undefined;
  console.log("Fetching module keys from the chain...");
  const keyQuery: Record<SubspacePalletName, SubspaceStorageName[]> = { subspaceModule: ["keys"] }
  const uidToSS58Query = await queryChain(api, keyQuery, netuidWhitelist);
  const uidToSS58 = uidToSS58Query['keys'] as Record<string, SS58Address>;
  const extraPropsQuery: Record<SubspacePalletName, P[]> = { subspaceModule: extraProps }
  const modulesInfo = await queryChain(api, extraPropsQuery, netuidWhitelist);
  //eslint-disable-next-line
  const processedModules = standardizeUidToSS58address(modulesInfo, uidToSS58);
  const moduleMap: SubspaceModule[] = [];

  for (const uid of Object.keys(uidToSS58)) {
    const moduleKey = uidToSS58[uid];
    if (moduleKey === undefined) {
      console.error(`Module key not found for uid ${uid}`);
      continue;
    }
    // TODO: remove ts-igore
    // @ts-ignore
    const emission = processedModules["emission"][moduleKey];
    // @ts-ignore
    const incentive = processedModules["incentive"][moduleKey];
    // @ts-ignore
    const dividends = processedModules["dividends"][moduleKey];
    const module = SUBSPACE_MODULE_SCHEMA.parse({
      uid: parseInt(uid),
      key: moduleKey,
      netuid: 0,
      // @ts-ignore
      name: processedModules["name"][moduleKey],
      // @ts-ignore
      address: processedModules["address"][moduleKey],
      // @ts-ignore
      registrationBlock: processedModules["registrationBlock"][moduleKey],
      // @ts-ignore
      metadata: processedModules["metadata"][moduleKey],
      // @ts-ignore
      lastUpdate: processedModules["lastUpdate"][moduleKey],
      atBlock: 0,
      emission: emission ? BigInt(emission) : -1n,
      incentive: incentive ? BigInt(incentive) : -1n,
      dividends: dividends ? BigInt(dividends) : -1n,
      delegationFee: 0,
      stakeFrom: 0n,

    })
    moduleMap.push(module);
  }
  return moduleMap;
}

/**
 * enriches the modules fetching the properties in `props`
 *
 * @returns the same moduleMap passed as argument
 */
async function queryChain<
  T extends SubspaceStorageName,
>(
  api: Api,
  props: Record<SubspacePalletName, T[]>,
  netuidWhitelist?: number[],
): Promise<Record<T, Record<string, string | Record<string, any>>>> {
  if (Object.keys(props).length === 0) {
    return {} as Record<T, Record<string, string>>;
  }
  // TODO: accept multiple netuids
  const modulePropMap: Record<T, Record<string, string>> = {} as Record<T, Record<string, string>>;
  const moduletas = await getPropsToMap(props, api, 0);
  const entries = Object.entries(moduletas) as [T, ChainEntry][];
  entries.map(([prop, entry]) => {
    modulePropMap[prop] = entry.getMapModules(0);
  });
  return modulePropMap;
}
