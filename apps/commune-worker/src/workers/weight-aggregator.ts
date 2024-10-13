import type { KeyringPair } from "@polkadot/keyring/types";
import { Keyring } from "@polkadot/api";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import { assert } from "tsafe";

import type { ApiPromise } from "@commune-ts/subspace/queries";
import type { LastBlock, SS58Address } from "@commune-ts/types";
import {STAKE_FROM_SCHEMA} from "@commune-ts/types";
import { and, eq, sql } from "@commune-ts/db";
import { db } from "@commune-ts/db/client";
import { moduleData, userModuleData, userSubnetDataSchema, subnetDataSchema } from "@commune-ts/db/schema";
import { 
  queryLastBlock, 
  queryChain,
} from "@commune-ts/subspace/queries";
import type {
  SubspaceStorageName,
} from "@commune-ts/utils";

import { BLOCK_TIME, log, sleep } from "../common";
import { env } from "../env";
import {
  calcFinalWeights,
  normalizeWeightsForVote,
  normalizeWeightsToPercent,
} from "../weights";
import type{
  ModuleWeight,
  SubnetWeight,
} from "../db";
import {
  insertModuleWeight,
  insertSubnetWeight,
} from "../db";
// TODO: subnets
// TODO: update tables on DB

export async function weightAggregatorWorker(api: ApiPromise) {
  await cryptoWaitReady();
  const keyring = new Keyring({ type: "sr25519" });
  const keypair = keyring.addFromUri(env.COMMUNITY_VALIDATOR_MNEMONIC);

  let knownLastBlock: LastBlock | null = null;

  while (true) {
    try {
      const lastBlock = await queryLastBlock(api);
      if (
        knownLastBlock != null &&
        lastBlock.blockNumber <= knownLastBlock.blockNumber
      ) {
        log(`Block ${lastBlock.blockNumber} already processed, skipping`);
        await sleep(BLOCK_TIME / 2);
        continue;
      }
      knownLastBlock = lastBlock;

      log(`Block ${lastBlock.blockNumber}: processing`);

      await weightAggregatorTask(api, keypair, lastBlock.blockNumber);

      await sleep(BLOCK_TIME * 2);

    } catch (e) {
      log("UNEXPECTED ERROR: ", e);
      await sleep(BLOCK_TIME);
      continue;
    }
  }
}

function getNormalizedWeights(
  stakeOnCommunityValidator: Map<SS58Address, bigint>, 
  weightMap: Map<string, Map<number, bigint>>
){
  const finalWeights = calcFinalWeights(stakeOnCommunityValidator, weightMap);
  const normalizedVoteWeights = normalizeWeightsForVote(finalWeights);
  const normalizedPercWeights = normalizeWeightsToPercent(finalWeights);
  return {
    normalizedWeights: normalizedVoteWeights, 
    percWeights: normalizedPercWeights
  };
}

/**
 * Builds network vote arrays from a vote map.
 *
 * @param voteMap - A Map object containing uid-weight pairs.
 * @returns An object containing two arrays: uids and weights.
 * - `uids`: An array of user IDs.
 * - `weights`: An array of corresponding weights.
 */
function buildNetworkVote(voteMap: Map<number, number>){
  const uids: number[] = [];
  const weights: number[] = [];
  for (const [uid, weight] of voteMap) {
    uids.push(uid);
    weights.push(weight);
  }
  return {uids, weights};
}


async function voteAndUpdate<T>(
  api: ApiPromise,
  keypair: KeyringPair,
  uids: number[],
  weights: number[],
  netuid: number,
  insertFunction: (data: T[]) => Promise<void>,
  toInsert: T[],
){
  try {
    // TODO: whats this 2, netuid? should be a constant
    await setChainWeights(api, keypair, netuid, uids, weights);
    await insertFunction(toInsert)
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.error(`Failed to set weights on chain: ${err}`); 
    return;
  }
}
async function postModuleAggregation(
  stakeOnCommunityValidator: Map<SS58Address, bigint>,
  api: ApiPromise,
  keypair: KeyringPair,
  lastBlock: number,
){
  const moduleWeightMap = await getUserWeightMap();
  const moduleWeightsInfo = getNormalizedWeights(
    stakeOnCommunityValidator, 
    moduleWeightMap
  );
  const uidMap = await getModuleUids();
  const moduleWeights: ModuleWeight[] = Array.from(
    moduleWeightsInfo.normalizedWeights
  )
  .map(([moduleId, weight]): ModuleWeight | null => {
    const moduleActualId = uidMap.get(moduleId);
    if (moduleActualId === undefined) {
      console.error(`Module id ${moduleId} not found in uid map`);
      return null;
    }
    const modulePercWeight = moduleWeightsInfo.percWeights.get(moduleId);
    if (modulePercWeight === undefined) {
      console.error(`Module id ${moduleId} not found in normalizedPercWeights`);
      return null;
    }
    return {
      moduleId: moduleActualId,
      percWeight: modulePercWeight,
      stakeWeight: weight,
      atBlock: lastBlock,
    };
  })
  .filter((module): module is ModuleWeight => module !== null
  );
  const {uids, weights} = buildNetworkVote(moduleWeightsInfo.normalizedWeights);
  await voteAndUpdate(
    api, keypair, uids, weights, 2, insertModuleWeight, moduleWeights
  );
}


async function postSubnetAggregation(
  stakeOnCommunityValidator: Map<SS58Address, bigint>,
  api: ApiPromise,
  keypair: KeyringPair,
  lastBlock: number,
){
  const subnetWeightMap = await getUserSubnetWeightMap();

  const subnetWeightsInfo = getNormalizedWeights(
    stakeOnCommunityValidator, 
    subnetWeightMap
  );
  
  const subnetWeights: SubnetWeight[] = Array.from(subnetWeightsInfo.normalizedWeights)
  .map(([netuid, weight]): SubnetWeight | null => {
    const subnetPercWeight = subnetWeightsInfo.percWeights.get(netuid);
    if(subnetPercWeight === undefined) {
      console.error(`Subnet id ${netuid} not found in normalizedPercWeights`);
      return null;
    }
    return {
      netuid: netuid,
      percWeight: subnetPercWeight,
      stakeWeight: weight,
      atBlock: lastBlock,
    }
  }).filter((subnet): subnet is SubnetWeight => subnet !== null);
  const {uids, weights} = buildNetworkVote(subnetWeightsInfo.normalizedWeights);
  await voteAndUpdate(
    api, 
    keypair, 
    uids, 
    weights, 
    0,
    insertSubnetWeight, 
    subnetWeights,
  );
}


/**
 * Fetches assigned weights by users and their stakes, to calculate the final
 * weights for the community validator.
 */
export async function weightAggregatorTask(
  api: ApiPromise,
  keypair: KeyringPair,
  lastBlock: number,
) {
  const storages: SubspaceStorageName[] = ["stakeFrom"]
  const storageMap = {subspaceModule: storages}
  const queryResult = await queryChain(api, storageMap, lastBlock);
  const stakeFromData = STAKE_FROM_SCHEMA.parse(
    {stakeFromStorage: queryResult.stakeFrom}
  ).stakeFromStorage;
  const communityValidatorAddress = keypair.address as SS58Address;
  const stakeOnCommunityValidator = stakeFromData.get(communityValidatorAddress);
  if(stakeOnCommunityValidator == undefined) {
    throw new Error(
      `Community validator ${communityValidatorAddress} not found in stake data`
    );
  }
  await postModuleAggregation(stakeOnCommunityValidator, api, keypair, lastBlock);
  // TODO: solve priority too low.
  await postSubnetAggregation(stakeOnCommunityValidator, api, keypair, lastBlock);
}

async function setChainWeights(
  api: ApiPromise,
  keypair: KeyringPair,
  netuid: number,
  uids: number[],
  weights: number[],
) {
  assert(api.tx.subspaceModule != undefined);
  assert(api.tx.subspaceModule.setWeights != undefined);
  const tx = await api.tx.subspaceModule
    .setWeights(netuid, uids, weights)
    .signAndSend(keypair);
  return tx;
}

/**
 * Queries the module data table to build a mapping of module UIDS to ids.
 */
async function getModuleUids(): Promise<Map<number, number>> {
  const result = await db
    .select({
      moduleId: moduleData.moduleId,
      uid: moduleData.id,
    })
    .from(moduleData)
    .where(
      eq(
        moduleData.atBlock,
        sql`(SELECT at_block FROM module_data ORDER BY at_block DESC LIMIT 1)`,
      ),
    )
    .execute();

  // TODO: by module table id
  const uidMap = new Map<number, number>();
  result.forEach((row) => {
    uidMap.set(row.moduleId, row.uid);
  });
  return uidMap;
}

/**
 * Queries the user-module data table to build a mapping of user keys to
 * module keys to weights.
 * 
 * @returns user key -> module id -> weight (0–100)
 */
async function getUserWeightMap(): Promise<Map<string, Map<number, bigint>>> {
  const result = await db
    .select({
      userKey: userModuleData.userKey,
      weight: userModuleData.weight,
      moduleKey: moduleData.moduleKey,
      moduleId: moduleData.moduleId,
    })
    .from(moduleData)
    // filter modules updated on the last seen block
    .where(
      and(
        eq(
          moduleData.atBlock,
          sql`(SELECT at_block FROM module_data ORDER BY at_block DESC LIMIT 1)`,
        ),
        eq(moduleData.isWhitelisted, true),
      ),
    )
    .innerJoin(userModuleData, eq(moduleData.id, userModuleData.moduleId));
  const weightMap = new Map<string, Map<number, bigint>>();
  result.forEach((entry) => {
    if (!weightMap.has(entry.userKey)) {
      weightMap.set(entry.userKey, new Map());
    }
    weightMap.get(entry.userKey)?.set(entry.moduleId, BigInt(entry.weight));
  });
  return weightMap;
  }

  async function getUserSubnetWeightMap(): Promise<Map<string, Map<number, bigint>>> {
  const result = await db
    .select({
      userKey: userSubnetDataSchema.userKey,
      weight: userSubnetDataSchema.weight,
      netuid: subnetDataSchema.netuid,
    })
    .from(subnetDataSchema)
    // filter modules updated on the last seen block
    .where(
      and(
        eq(
          subnetDataSchema.atBlock,
          sql`(SELECT at_block FROM subnet_data ORDER BY at_block DESC LIMIT 1)`,
        ),
        ),
    )
    .innerJoin(
      userSubnetDataSchema, 
      eq(subnetDataSchema.netuid, userSubnetDataSchema.netuid)
    );
  const weightMap = new Map<string, Map<number, bigint>>();
  result.forEach((entry) => {
    if (!weightMap.has(entry.userKey)) {
      weightMap.set(entry.userKey, new Map());
    }
    weightMap.get(entry.userKey)?.set(entry.netuid, BigInt(entry.weight));
  });
  return weightMap;
}
