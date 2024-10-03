import {
  // queryLastBlock,
  queryRegisteredSubnetsInfo,
} from "@commune-ts/subspace/queries";

import type { WorkerProps } from "../types";
import {
  BLOCK_TIME,
  // isNewBlock,
  log,
  sleep,
  sleepUntilNewBlock,
} from "../common";

// import { upsertSubnetData } from "../db";

export async function subnetFetcherWorker(props: WorkerProps) {
  while (true) {
    try {
      const currentTime = new Date();
      const lastBlock = await sleepUntilNewBlock(props);
      props.lastBlock = lastBlock;
      await queryRegisteredSubnetsInfo(props.api);
      log(`Block ${props.lastBlock.blockNumber}: processing`);

      //   const modules = await queryRegisteredSubnetsInfo(
      //     props.lastBlock.apiAtBlock,
      //     ["name", "address", "metadata", "registrationBlock"],
      //     [NETUID_ZERO],
      //   );
      //   log(
      //     `Block ${props.lastBlock.blockNumber}: upserting  ${subnet.length} subnets`,
      //   );

      //   await upsertSubnetData(subnet, props.lastBlock.blockNumber);

      log(
        `Block ${props.lastBlock.blockNumber}: subnet data upserted in ${(new Date().getTime() - currentTime.getTime()) / 1000} seconds`,
      );
    } catch (e) {
      log("UNEXPECTED ERROR: ", e);
      await sleep(BLOCK_TIME);
      continue;
    }
  }
}
