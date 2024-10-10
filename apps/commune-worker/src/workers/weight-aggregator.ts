import { assert } from "tsafe";

import type { ApiPromise } from "@commune-ts/subspace/queries";
import { and, eq, sql } from "@commune-ts/db";
import { db } from "@commune-ts/db/client";
import { moduleData, userModuleData } from "@commune-ts/db/schema";
import { queryStakeOut } from "@commune-ts/subspace/queries";

import { BLOCK_TIME, log, sleep } from "../common";
import { calcFinalWeights, normalizeModuleWeights } from "../weights";

// TODO: get comrads Substrate key from environment
// TODO: subnets
// TODO: send weights to chain
// TODO: update tables on DB

export async function weightAggregatorWorker(api: ApiPromise) {
  while (true) {
    try {
      await weightCompilerTask(api);
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
export async function weightCompilerTask(api: ApiPromise) {
  const stakeOutData = await queryStakeOut(
    String(process.env.NEXT_PUBLIC_CACHE_PROVIDER_URL),
  );
  const stakeOutMap = objToMap(stakeOutData.perAddr);

  const uidMap = await getModuleUids();
  const weightMap = await getUserWeightMap();

  const finalWeights = calcFinalWeights(stakeOutMap, weightMap);
  const normalizedWeights = normalizeModuleWeights(finalWeights);

  console.log(normalizedWeights);

  const uids: number[] = [];
  const weights: number[] = [];
  for (const [moduleKey, weight] of normalizedWeights) {
    const uid = uidMap.get(moduleKey);
    if (uid == null) {
      console.error(`Module key ${moduleKey} not found in uid map`);
      continue;
    }
    uids.push(uid);
    weights.push(Number(weight));
  }

  setWeights(api, 666, uids, weights);

  // TODO: update tables on DB
}

function setWeights(
  api: ApiPromise,
  netuid: number,
  uids: number[],
  weights: number[],
) {
  assert(api.tx.subspaceModule != undefined);
  assert(api.tx.subspaceModule.setWeights != undefined);
  const tx = api.tx.subspaceModule.setWeights(netuid, uids, weights);
  // TODO
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
