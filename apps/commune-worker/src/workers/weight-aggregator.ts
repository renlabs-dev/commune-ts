import type { KeyringPair } from "@polkadot/keyring/types";
import { Keyring } from "@polkadot/api";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import { assert } from "tsafe";

import type { ApiPromise } from "@commune-ts/subspace/queries";
import type { LastBlock } from "@commune-ts/types";
import { and, eq, sql } from "@commune-ts/db";
import { db } from "@commune-ts/db/client";
import { moduleData, userModuleData } from "@commune-ts/db/schema";
import { queryLastBlock, queryStakeOut } from "@commune-ts/subspace/queries";

import { BLOCK_TIME, log, sleep } from "../common";
import { env } from "../env";
import {
  calcFinalWeights,
  normalizeWeightsForVote,
  normalizeWeightsToPercent,
} from "../weights";

// TODO: get comrads Substrate key from environment
// TODO: subnets
// TODO: send weights to chain
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

      await weightAggregatorTask(api, keypair);

      await sleep(BLOCK_TIME * 2);

    } catch (e) {
      log("UNEXPECTED ERROR: ", e);
      await sleep(BLOCK_TIME);
      continue;
    }
  }
}

/**
 * Fetches assigned weights by users and their stakes, to calculate the final
 * weights for the community validator.
 */
export async function weightAggregatorTask(
  api: ApiPromise,
  keypair: KeyringPair,
) {
  const stakeOutData = await queryStakeOut(
    String(process.env.NEXT_PUBLIC_CACHE_PROVIDER_URL),
  );
  const stakeOutMap = objToMap(stakeOutData.perAddr);

  const uidMap = await getModuleUids();
  const weightMap = await getUserWeightMap();

  const finalWeights = calcFinalWeights(stakeOutMap, weightMap);
  const normalizedVoteWeights = normalizeWeightsForVote(finalWeights);
  const normalizedPercWeights = normalizeWeightsToPercent(finalWeights);

  // TODO: normalize weights with (sum(weights) == 100%) for DB

  console.log(normalizedVoteWeights);

  const uids: number[] = [];
  const weights: number[] = [];
  for (const [moduleKey, weight] of normalizedVoteWeights) {
    const uid = uidMap.get(moduleKey);
    if (uid == null) {
      console.error(`Module key ${moduleKey} not found in uid map`);
      continue;
    }
    uids.push(uid);
    weights.push(weight);
  }

  try {
    await setChainWeights(api, keypair, 2, uids, weights);
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.error(`Failed to set weights on chain: ${err}`); 
    return;
  }

  // TODO: update tables on DB
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
 * Queries the module data table to build a mapping of module keys to UIDs.
 */
async function getModuleUids(): Promise<Map<string, number>> {
  const result = await db
    .select({
      moduleKey: moduleData.moduleKey,
      uid: moduleData.moduleId,
    })
    .from(moduleData)
    .where(
      eq(
        moduleData.atBlock,
        sql`(SELECT at_block FROM module_data ORDER BY at_block DESC LIMIT 1)`,
      ),
    )
    .execute();

  const uidMap = new Map<string, number>();
  result.forEach((row) => {
    uidMap.set(row.moduleKey, row.uid);
  });
  return uidMap;
}

/**
 * Queries the user-module data table to build a mapping of user keys to
 * module keys to weights.
 */
async function getUserWeightMap(): Promise<Map<string, Map<string, bigint>>> {
  const result = await db
    .select({
      userKey: userModuleData.userKey,
      weight: userModuleData.weight,
      moduleKey: moduleData.moduleKey,
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

  // Maps: user key -> module key -> weight (0–100)
  const weightMap = new Map<string, Map<string, bigint>>();
  result.forEach((entry) => {
    if (!weightMap.has(entry.userKey)) {
      weightMap.set(entry.userKey, new Map());
    }
    weightMap.get(entry.userKey)?.set(entry.moduleKey, BigInt(entry.weight));
  });
  return weightMap;
}

function objToMap<K extends string | number | symbol, V>(
  obj: Record<K, V>,
): Map<K, V> {
  const map = new Map<K, V>();
  for (const [key, value] of Object.entries(obj)) {
    map.set(key as K, value as V);
  }
  return map;
}
