/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { assert } from "tsafe";

/** Related to weights computation */

type Key = string;

/**
 * Calculates the final weights for the community validator, resulting in
 * unbound integers.
 *
 * @param user_stakes        user -> amount staked
 * @param user_weight_maps   user -> module key -> weight (0–100)
 */
export function calcFinalWeights(
  user_stakes: Map<Key, bigint>,
  user_weight_maps: Map<Key, Map<Key, bigint>>,
) {
  const acc_module_weights = new Map<Key, bigint>();

  for (const [user_key, user_stake] of user_stakes.entries()) {
    const user_weights = user_weight_maps.get(user_key);
    if (user_weights == null) continue;

    // Total weight the user has distributed to modules
    // total_user_weight = Σ(weight_i)
    const total_user_weight = [...user_weights.values()].reduce(
      (a, b) => a + b,
      0n,
    );
    if (total_user_weight == 0n) continue;

    for (const [module_key, weight] of user_weights.entries()) {
      if (weight == 0n) continue;

      const stake_weight = (user_stake * weight) / total_user_weight;

      const cur_module_weight = acc_module_weights.get(module_key) ?? 0n;
      acc_module_weights.set(module_key, cur_module_weight + stake_weight);
    }

    /*
    We have Σ(weight_i) / total_user_weight = 1  
    so      Σ(stake_weight_i) = user_stake

    This effectively distributes the user's stake in nano as "points" to each
    module in proportion to the weights they have assigned to them.
    */
  }

  return acc_module_weights;
}

/**
 * Normalize module weights to integer percentages.
 */
export function normalizeModuleWeights(
  module_weights: Map<Key, bigint>,
): Map<string, bigint> {
  const module_key_arr: string[] = [];
  const module_weight_arr: bigint[] = [];

  let max_weight = 0n;
  for (const [module_key, weight] of module_weights.entries()) {
    module_key_arr.push(module_key);
    module_weight_arr.push(weight);
    if (weight > max_weight) max_weight = weight;
  }

  const normalized_weights: bigint[] = [];
  for (const weight of module_weight_arr) {
    normalized_weights.push((weight * 100n) / max_weight);
  }

  const result = new Map<string, bigint>();
  // for (let i = 0; i < module_key_arr.length; i++) {
  module_key_arr.forEach((module_key, i) => {
    const nw = normalized_weights[i];
    assert(nw != null);
    result.set(module_key, nw);
  });
  return result;
}

/*
Example:

Then we just normalize.

So if users have:

A: 1000 nano
B:  500 nano
C:  500 nano


and vote:

A:
100% module1

B:
 50% module2
 50% module3

C:
100% module3


We have:

module1: 1000
module2:  250
module3:  750


Final weights:

module1: 100%
module2: 025%
module3: 075%
*/

function _testFinalWeights() {
  const user_stakes = new Map();
  user_stakes.set("A", 1000n);
  user_stakes.set("B", 500n);
  user_stakes.set("C", 500n);

  const user_weight_maps = new Map<string, Map<string, bigint>>();
  user_weight_maps.set("A", new Map());
  user_weight_maps.set("B", new Map());
  user_weight_maps.set("C", new Map());
  user_weight_maps.get("A")!.set("module1", 100n);
  user_weight_maps.get("B")!.set("module2", 50n);
  user_weight_maps.get("B")!.set("module3", 50n);
  user_weight_maps.get("C")!.set("module3", 100n);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const result = calcFinalWeights(user_stakes, user_weight_maps);
  const normalized = normalizeModuleWeights(result);

  console.log(result);
  console.log(normalized);
}

// _testFinalWeights();
