import "@polkadot/api-augment";

import { WsProvider } from "@polkadot/api";
import express from "express";

import { ApiPromise, queryLastBlock } from "@commune-ts/subspace/queries";

import { log } from "./common";
import { moduleFetcherWorker } from "./workers/module-fetcher";
import { notifyNewApplicationsWorker } from "./workers/notify-dao-applications";
import { processDaoApplicationsWorker } from "./workers/process-dao-applications";
import { subnetFetcherWorker } from "./workers/subnet-fetcher";
import { weightAggregatorWorker } from "./workers/weight-aggregator";

async function setup(): Promise<ApiPromise> {
  const wsEndpoint = process.env.NEXT_PUBLIC_WS_PROVIDER_URL;

  log("Connecting to ", wsEndpoint);

  const provider = new WsProvider(wsEndpoint);
  const api = await ApiPromise.create({ provider });

  return api;
}

const workerType = process.argv[2] ?? "validator";

async function main() {
  const api = await setup();
  const lastBlockNumber = -1;
  const lastBlock = await queryLastBlock(api);

  if (workerType === "dao") {
    await processDaoApplicationsWorker({
      lastBlock,
      api,
      lastBlockNumber,
    });
  } else if (workerType === "notifier") {
    await notifyNewApplicationsWorker({
      lastBlock,
      api,
      lastBlockNumber,
    });
  } else if (workerType === "subnet") {
    await subnetFetcherWorker({
      lastBlock,
      api,
      lastBlockNumber,
    });
  } else if (workerType === "validator") {
    await moduleFetcherWorker({
      lastBlock,
      api,
      lastBlockNumber,
    });
  } else if (workerType === "weight-aggregator") {
    await weightAggregatorWorker(api);
  } else {
    console.error(
      "Invalid worker type argument. Please specify 'process_dao_applications' or 'validator'",
    );
    process.exit(1);
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit());

const app = express();

app.get("/api/health", (_, res) => {
  res.send(`${workerType} OK`);
});

const port = process.env.PORT ?? 3000;

app.listen(port, () => {
  log(`/api/health listening on port ${port}`);
});
