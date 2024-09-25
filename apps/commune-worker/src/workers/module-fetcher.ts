import {
  queryLastBlock,
  queryRegisteredModulesInfo,
} from "@commune-ts/subspace/queries";

import type { WorkerProps } from "../types";
import { BLOCK_TIME, isNewBlock, log, NETUID_ZERO, sleep } from "../common";
import { upsertModuleData } from "../db";
import { SubspaceModuleToDatabase } from "../db/type-transformations.js";

export async function moduleFetcherWorker(props: WorkerProps) {
  while (true) {
    try {
      const currentTime = new Date();
      const lastBlock = await queryLastBlock(props.api);
      if (!isNewBlock(props.lastBlock.blockNumber, lastBlock.blockNumber)) {
        await sleep(BLOCK_TIME);
        continue;
      }
      props.lastBlock = lastBlock;

      log(`Block ${props.lastBlock.blockNumber}: processing`);

      // TODO: do this in a better way
      const modules = await queryRegisteredModulesInfo(
        props.lastBlock.apiAtBlock,
        [
          "name",
          "address",
          "registrationBlock",
          "metadata",
          "lastUpdate",
          "emission",
          "incentive",
          "dividends",
          "delegationFee",
          "stakeFrom",
        ],
        [NETUID_ZERO],
      );
      const modulesData = modules.map((module) =>
        SubspaceModuleToDatabase(module, props.lastBlock.blockNumber),
      );
      log(
        `Block ${props.lastBlock.blockNumber}: upserting  ${modules.length} modules`,
      );

      await upsertModuleData(modulesData);

      log(
        `Block ${props.lastBlock.blockNumber}: module data upserted in ${(new Date().getTime() - currentTime.getTime()) / 1000} seconds`,
      );
    } catch (e) {
      log("UNEXPECTED ERROR: ", e);
      await sleep(BLOCK_TIME);
      continue;
    }
  }
}
