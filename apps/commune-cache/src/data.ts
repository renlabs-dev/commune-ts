import JSONBigInt from "json-bigint";

import type { LastBlock, StakeOutData } from "@commune-ts/types";
import {
  queryCalculateStakeFrom,
  queryCalculateStakeOut,
  queryLastBlock,
} from "@commune-ts/subspace/queries";

import { setup } from "./server";
import { log, sleep } from "./utils";

const JSONBig = JSONBigInt({
  useNativeBigInt: true,
  alwaysParseAsBig: true,
  strict: true,
});

const UPDATE_INTERVAL = 1000; //1 second

let stakeFromData: StakeOutData = {
  total: -1n,
  perAddr: {},
  atBlock: -1n,
  atTime: new Date(),
};
let stakeOutData: StakeOutData = {
  total: -1n,
  perAddr: {},
  atBlock: -1n,
  atTime: new Date(),
};

const stakeOutDataStringified = {
  data: JSONBig.stringify(stakeOutData),
  atBlock: -1n,
};

const stakeFromDataStringified = {
  data: JSONBig.stringify(stakeFromData),
  atBlock: -1n,
};

export function getStakeOutDataStringified() {
  if (stakeOutDataStringified.atBlock !== stakeOutData.atBlock) {
    stakeOutDataStringified.data = JSONBig.stringify(stakeOutData);
    stakeOutDataStringified.atBlock = stakeOutData.atBlock;
  }
  return stakeOutDataStringified.data;
}

export function getStakeFromDataStringified() {
  if (stakeFromDataStringified.atBlock !== stakeFromData.atBlock) {
    stakeFromDataStringified.data = JSONBig.stringify(stakeFromData);
    stakeFromDataStringified.atBlock = stakeFromData.atBlock;
  }
  return stakeFromDataStringified.data;
}

export async function updateStakeDataLoop() {
  try {
    let lastBlock: LastBlock;
    const api = await setup();

    // eslint-disable-next-line no-constant-condition
    while (true) {
      lastBlock = await queryLastBlock(api);
      if (
        lastBlock.blockNumber <=
        Math.max(Number(stakeFromData.atBlock), Number(stakeOutData.atBlock))
      ) {
        log(`Block ${lastBlock.blockNumber} already processed, skipping`);
        await sleep(UPDATE_INTERVAL);
        continue;
      }

      log(`Block ${lastBlock.blockNumber}: processing`);

      const [stakeFrom, stakeOut] = await Promise.all([
        queryCalculateStakeFrom(api),
        queryCalculateStakeOut(api),
      ]);

      stakeFromData = {
        total: stakeFrom.total,
        perAddr: Object.fromEntries(stakeFrom.perAddr),
        atBlock: BigInt(lastBlock.blockNumber),
        atTime: new Date(),
      };

      stakeOutData = {
        total: stakeOut.total,
        perAddr: Object.fromEntries(stakeOut.perAddr),
        atBlock: BigInt(lastBlock.blockNumber),
        atTime: new Date(),
      };

      log(`Data updated for block ${lastBlock.blockNumber}`);
    }
  } catch (e) {
    log("UNEXPECTED ERROR: ", e);
    log("Restarting loop in 5 seconds");
    await sleep(5000);
    updateStakeDataLoop().catch(console.error);
  }
}

export { stakeFromData, stakeOutData };
