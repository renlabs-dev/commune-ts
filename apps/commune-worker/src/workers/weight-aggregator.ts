import { eq, sql } from "@commune-ts/db";
import { db } from "@commune-ts/db/client";
import { moduleData, userModuleData } from "@commune-ts/db/schema";
import { queryStakeOut } from "@commune-ts/subspace/queries";

import { BLOCK_TIME, log, sleep } from "../common";
import { calcFinalWeights, normalizeModuleWeights } from "../weights";

export async function weightAggregatorLoop() {
  while (true) {
    try {
      await weightCompilerTask();
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
export async function weightCompilerTask() {
  const stakeOutData = await queryStakeOut(
    String(process.env.NEXT_PUBLIC_CACHE_PROVIDER_URL),
  );
  const stakeOutMap = objToMap(stakeOutData.perAddr);

  const weightMap = await getUserWeightMap();

  const finalWeights = calcFinalWeights(stakeOutMap, weightMap);
  const normalizedWeights = normalizeModuleWeights(finalWeights);

  console.log(normalizedWeights);

  // TODO: build the list of weights corresponding to UIDs and vote
  // since we will need to edit the module table, i would propose to add the metadata and metadata fetching to the worker, it would be better for front end side of things :)
  const modules = [{ key: "123" }];

  const weightsToVote = [];
  for (const module of modules) {
    const moduleKey = module.key;
    weightsToVote.push([moduleKey]);
  }
}

async function getUserWeightMap() {
  const result = await db
    .select({
      userKey: userModuleData.userKey,
      weight: userModuleData.weight,
      moduleKey: moduleData.moduleKey,
    })
    .from(moduleData)
    // filter modules updated on the last seen block
    .where(
      eq(
        moduleData.atBlock,
        sql`(SELECT at_block FROM module_data ORDER BY at_block DESC LIMIT 1)`,
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
