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
  modulePropResolvers,
  SUBSPACE_MODULE_SCHEMA,
} from "@commune-ts/types";
import {
  assertOrThrow,
  handleDaos,
  handleProposals,
  newSubstrateModule,
  StorageEntry,
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

  // Process all votes and push it to an array to avoid spreding
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

// def get_map_subnets_params(
//   client: CommuneClient, block_hash: str | None = None
// ) -> dict[int, SubnetParamsWithEmission]:
//   """
//   Gets all subnets info on the network
//   """
//   bulk_query = client.query_batch_map(
//       {
//           "SubspaceModule": [
//               ("ImmunityPeriod", []),
//               ("MinAllowedWeights", []),
//               ("MaxAllowedWeights", []),
//               ("Tempo", []),
//               ("MaxAllowedUids", []),
//               ("Founder", []),
//               ("FounderShare", []),
//               ("IncentiveRatio", []),
//               ("TrustRatio", []),
//               ("SubnetNames", []),
//               ("MaxWeightAge", []),
//               ("BondsMovingAverage", []),
//               ("MaximumSetWeightCallsPerEpoch", []),
//               ("MinValidatorStake", []),
//               ("MaxAllowedValidators", []),
//               ("ModuleBurnConfig", []),
//               ("SubnetMetadata", []),
//           ],
//           "GovernanceModule": [
//               ("SubnetGovernanceConfig", []),
//           ],
//           "SubnetEmissionModule": [
//               ("SubnetEmission", []),
//           ],

//       },
//       block_hash,
//   )
//   subnet_maps: SubnetParamsMaps = {
//       "netuid_to_emission": bulk_query["SubnetEmission"],
//       "netuid_to_tempo": bulk_query["Tempo"],
//       "netuid_to_min_allowed_weights": bulk_query["MinAllowedWeights"],
//       "netuid_to_max_allowed_weights": bulk_query["MaxAllowedWeights"],
//       "netuid_to_max_allowed_uids": bulk_query["MaxAllowedUids"],
//       "netuid_to_founder": bulk_query["Founder"],
//       "netuid_to_founder_share": bulk_query["FounderShare"],
//       "netuid_to_incentive_ratio": bulk_query["IncentiveRatio"],
//       "netuid_to_trust_ratio": bulk_query["TrustRatio"],
//       "netuid_to_name": bulk_query["SubnetNames"],
//       "netuid_to_max_weight_age": bulk_query["MaxWeightAge"],
//       "netuid_to_bonds_ma": bulk_query.get("BondsMovingAverage", {}),
//       "netuid_to_maximum_set_weight_calls_per_epoch": bulk_query.get("MaximumSetWeightCallsPerEpoch", {}),
//       "netuid_to_governance_configuration": bulk_query["SubnetGovernanceConfig"],
//       "netuid_to_immunity_period": bulk_query["ImmunityPeriod"],
//       "netuid_to_min_validator_stake": bulk_query.get("MinValidatorStake", {}),
//       "netuid_to_max_allowed_validators": bulk_query.get("MaxAllowedValidators", {}),
//       "netuid_to_module_burn_config": bulk_query.get("ModuleBurnConfig", {}),
//       "netuid_to_subnet_metadata": bulk_query.get("SubnetMetadata", {}),
//   }
//   result_subnets: dict[int, SubnetParamsWithEmission] = {}

//   for netuid, name in subnet_maps["netuid_to_name"].items():

//       subnet: SubnetParamsWithEmission = {
//           "name": name,
//           "founder": subnet_maps["netuid_to_founder"][netuid],
//           "founder_share": subnet_maps["netuid_to_founder_share"][netuid],
//           "incentive_ratio": subnet_maps["netuid_to_incentive_ratio"][netuid],
//           "max_allowed_uids": subnet_maps["netuid_to_max_allowed_uids"][netuid],
//           "max_allowed_weights": subnet_maps["netuid_to_max_allowed_weights"][netuid],
//           "min_allowed_weights": subnet_maps["netuid_to_min_allowed_weights"][netuid],
//           "tempo": subnet_maps["netuid_to_tempo"][netuid],
//           "trust_ratio": subnet_maps["netuid_to_trust_ratio"][netuid],
//           "emission": subnet_maps["netuid_to_emission"][netuid],
//           "max_weight_age": subnet_maps["netuid_to_max_weight_age"][netuid],
//           "bonds_ma": subnet_maps["netuid_to_bonds_ma"].get(netuid, None),
//           "maximum_set_weight_calls_per_epoch": subnet_maps["netuid_to_maximum_set_weight_calls_per_epoch"].get(netuid, 30),
//           "governance_config": subnet_maps["netuid_to_governance_configuration"][netuid],
//           "immunity_period": subnet_maps["netuid_to_immunity_period"][netuid],
//           "min_validator_stake": subnet_maps["netuid_to_min_validator_stake"].get(netuid, to_nano(50_000)),
//           "max_allowed_validators": subnet_maps["netuid_to_max_allowed_validators"].get(netuid, 50),
//           "module_burn_config": cast(BurnConfiguration, subnet_maps["netuid_to_module_burn_config"].get(netuid, None)),
//           "subnet_metadata": subnet_maps["netuid_to_subnet_metadata"].get(netuid, None),
//       }

//       result_subnets[netuid] = subnet

//   return result_subnets

export async function queryRegisteredSubnetsInfo(api: Api) {
  console.log("Fetching subnet keys from the chain...");
  const netuids = (await api.query.subspaceModule!.subnetNames!.entries()).map(
    (entry) => new StorageEntry(entry).netuid,
  );

  console.log(netuids);
}
export async function queryRegisteredModulesInfo<
  P extends OptionalProperties<SubspaceModule>,
>(
  api: Api,
  extraProps: P[] = [],
  netuidWhitelist?: number[],
): Promise<SubspaceModule[]> {
  netuidWhitelist = netuidWhitelist?.length
    ? Array.from(new Set(netuidWhitelist))
    : undefined;
  console.log("Fetching module keys from the chain...");

  const keyEntries = (await api.query.subspaceModule!.keys!.entries())
    .map((entry) => new StorageEntry(entry))
    .filter(
      (entry: StorageEntry) =>
        !netuidWhitelist || netuidWhitelist.includes(entry.netuid),
    );

  console.log(`Fetched ${keyEntries.length} module keys`);
  const modulesMap = newSubstrateModuleMap(keyEntries.map(newSubstrateModule));

  await enrichSubspaceModules(api, modulesMap, extraProps, netuidWhitelist);

  console.log("modules per netuid:");
  for (const [netuid, map] of modulesMap) {
    console.log(`netuid ${netuid}: ${map.size} modules`);
  }

  const modules = Array.from(modulesMap.values()).flatMap((map) =>
    Array.from(map.values()),
  );

  return modules
    .map((m) => SUBSPACE_MODULE_SCHEMA.safeParse(m))
    .filter((parsed) => parsed.success)
    .map((parsed) => parsed.data);
}

/**
 * enriches the modules fetching the properties in `props`
 *
 * @returns the same moduleMap passed as argument
 */
async function enrichSubspaceModules<
  P extends OptionalProperties<SubspaceModule>,
>(
  api: Api,
  moduleMap: Map<number, Map<SS58Address, SubspaceModule>>,
  props: P[],
  netuidWhitelist?: number[],
): Promise<Map<number, Map<SS58Address, SubspaceModule>>> {
  if (props.length === 0) {
    return moduleMap;
  }
  props = Array.from(new Set(props));

  const uidKeyMap = newUidKeyMap(moduleMap);

  console.log("api");

  await Promise.all(
    props.map(async (prop) => {
      console.log(`Fetching "${prop}" entries...`);
      const entries = (await api.query.subspaceModule?.[prop]?.entries())
        ?.map((entry) => new StorageEntry(entry))
        .filter(
          (entry: StorageEntry) =>
            !netuidWhitelist || netuidWhitelist.includes(entry.netuid),
        );
      assertOrThrow(Array.isArray(entries), `entries of "${prop}" is an array`);

      console.log(`Fetched ${entries.length} "${prop}" entries`);

      for (const entry of entries) {
        const netuid = entry.netuid;
        const key = entry.resolveKey(uidKeyMap);

        const module = moduleMap.get(netuid)?.get(key);

        if (!module) {
          if (process.env.DEBUG === "true") {
            console.info(
              `WARNING: while resolving "${prop}", key ${netuid}::${key} not found in moduleMap`,
            );
          }
          continue;
        }

        const parsedValue = modulePropResolvers[prop](entry.value);

        if (!parsedValue.success) {
          console.error(
            `Error parsing "${prop}" for module ${netuid}::${key} - fallback to undefined`,
          );
          console.error(parsedValue.error);
          continue;
        }

        module[prop] = parsedValue.data;
      }
    }),
  );

  return moduleMap;
}

/**
 * maps netuid -> uid -> key
 */
function newUidKeyMap(
  moduleMap: Map<number, Map<SS58Address, SubspaceModule>>,
): Map<number, Map<number, SS58Address>> {
  const uidKeyMap = new Map<number, Map<number, SS58Address>>();

  for (const [netuid, keyMap] of moduleMap) {
    if (!uidKeyMap.has(netuid)) {
      uidKeyMap.set(netuid, new Map());
    }

    for (const [key, module] of keyMap) {
      uidKeyMap.get(netuid)!.set(module.uid, key);
    }
  }

  return uidKeyMap;
}

/**
 * maps netuid -> key -> SubspaceModule
 */
function newSubstrateModuleMap(
  subspaceModules: SubspaceModule[],
): Map<number, Map<SS58Address, SubspaceModule>> {
  const moduleMap = new Map<number, Map<SS58Address, SubspaceModule>>();

  for (const module of subspaceModules) {
    if (!moduleMap.has(module.netuid)) {
      moduleMap.set(module.netuid, new Map());
    }

    moduleMap.get(module.netuid)!.set(module.key, module);
  }

  return moduleMap;
}
