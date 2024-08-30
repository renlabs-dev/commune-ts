import { ApiPromise, WsProvider } from "@polkadot/api";
import express from "express";
import JSONBigInt from "json-bigint";

import type { LastBlock, StakeOutData } from "@commune-ts/types";
import {
  queryCalculateStakeOut,
  queryLastBlock,
  queryStakeFrom,
} from "@commune-ts/subspace/queries";

import { log, sleep, waitFor } from "./utils";

const JSONBig = JSONBigInt({
  useNativeBigInt: true,
  alwaysParseAsBig: true,
  strict: true,
});

const app = express();
const port = process.env.PORT ?? 3000;

let api: ApiPromise;
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

const getStakeOutDataStringified = () => {
  if (stakeOutDataStringified.atBlock !== stakeOutData.atBlock) {
    stakeOutDataStringified.data = JSONBig.stringify(stakeOutData);
    stakeOutDataStringified.atBlock = stakeOutData.atBlock;
  }
  return stakeOutDataStringified.data;
};

const getStakeFromDataStringified = () => {
  if (stakeFromDataStringified.atBlock !== stakeFromData.atBlock) {
    stakeFromDataStringified.data = JSONBig.stringify(stakeFromData);
    stakeFromDataStringified.atBlock = stakeFromData.atBlock;
  }
  return stakeFromDataStringified.data;
};

async function setupApi() {
  const wsEndpoint = "wss://commune.api.onfinality.io/public-ws";
  const provider = new WsProvider(wsEndpoint);
  api = await ApiPromise.create({ provider });
  console.log("API connected");
}

async function updateStakeDataLoop() {
  try {
    let lastBlock: LastBlock;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      lastBlock = await queryLastBlock(api);
      if (
        lastBlock.blockNumber <=
        Math.max(Number(stakeFromData.atBlock), Number(stakeOutData.atBlock))
      ) {
        log(`Block ${lastBlock.blockNumber} already processed, skipping`);
        await sleep(1000);
        continue;
      }

      log(`Block ${lastBlock.blockNumber}: processing`);

      const [stakeFrom, stakeOut] = await Promise.all([
        queryStakeFrom(api),
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
    return;
  }
}

// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.get("/api/stake-out", async (req, res) => {
  const hasData = () => stakeOutData.atBlock !== -1n;

  // if we don't have data yet, wait for it for at most 50s
  await waitFor(
    `request ${req.ip}`,
    "StakeOut data",
    2000,
    50_000,
    hasData,
    true,
  );

  if (!hasData()) {
    res.status(503).send("StakeOut data not available yet");
    return;
  }
  res
    .header("Content-Type", "application/json")
    .send(getStakeOutDataStringified());
});

// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.get("/api/stake-from", async (req, res) => {
  const hasData = () => stakeFromData.atBlock !== -1n;

  // if we don't have data yet, wait for it for at most 50s
  await waitFor(
    `request ${req.ip}`,
    "StakeOut data",
    2000,
    50_000,
    hasData,
    true,
  );

  if (!hasData()) {
    res.status(503).send("StakeFrom data not available yet");
    return;
  }
  res
    .header("Content-Type", "application/json")
    .send(getStakeFromDataStringified());
});

app.get("/api/health", (req, res) => {
  res.status(200).send("OK");
});

app.get("/api/health/details", (req, res) => {
  res.json({
    status: "ok",
    lastBlock: Number(stakeOutData.atBlock),
    atTime: stakeOutData.atTime,
    deltaSeconds: (new Date().getTime() - stakeOutData.atTime.getTime()) / 1000,
  });
});

async function startServer() {
  try {
    await setupApi();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      updateStakeDataLoop().catch(console.error);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer().catch(console.error);
