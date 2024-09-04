import "@polkadot/api-augment";

import { WsProvider } from "@polkadot/api";
import express from "express";

import type { DaoApplications, DaoStatus, LastBlock } from "@commune-ts/types";
import {
  ApiPromise,
  pushToWhitelist,
  queryDaosEntries,
  queryLastBlock,
  queryRegisteredModulesInfo,
} from "@commune-ts/subspace/queries";

import {
  computeTotalVotesPerDao,
  countCadreKeys,
  upsertModuleData,
} from "./db";

type WorkerType = "dao" | "validator";
const workerName = process.argv[2] as WorkerType;
const blockTime = 8000;
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function log(...args: unknown[]) {
  const [first, ...rest] = args;
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  console.log(`[${new Date().toISOString()}] ${first}`, ...rest);
}

const NETUID_ZERO = 0;
// const DAO_EXPIRATION_TIME = 75600; // blocks
const DAO_EXPIRATION_TIME = 0; // blocks

async function setup(): Promise<ApiPromise> {
  const wsEndpoint = process.env.NEXT_PUBLIC_WS_PROVIDER_URL;

  log("Connecting to ", wsEndpoint);

  const provider = new WsProvider(wsEndpoint);
  const api = await ApiPromise.create({ provider });

  return api;
}

interface WorkerProps {
  lastBlockNumber: number;
  lastBlock: LastBlock;
  api: ApiPromise;
}

function is_new_block(saved_block: number, queried_block: number) {
  if (saved_block === queried_block) {
    log(`Block ${queried_block} already processed, skipping`);
    return false;
  }
  return true;
}
async function run_validator_worker(props: WorkerProps) {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const currentTime = new Date();
      const lastBlock = await queryLastBlock(props.api);
      if (!is_new_block(props.lastBlock.blockNumber, lastBlock.blockNumber)) {
        await sleep(blockTime);
        continue;
      }
      props.lastBlock = lastBlock;

      log(`Block ${props.lastBlock.blockNumber}: processing`);

      const modules = await queryRegisteredModulesInfo(
        props.lastBlock.apiAtBlock,
        ["name", "address", "metadata", "registrationBlock"],
        [NETUID_ZERO],
      );

      log(
        `Block ${props.lastBlock.blockNumber}: upserting  ${modules.length} modules`,
      );

      await upsertModuleData(modules, props.lastBlock.blockNumber);

      log(
        `Block ${props.lastBlock.blockNumber}: module data upserted in ${(new Date().getTime() - currentTime.getTime()) / 1000} seconds`,
      );
    } catch (e) {
      log("UNEXPECTED ERROR: ", e);
      await sleep(blockTime);
      continue;
    }
  }
}

async function get_cadre_threshold() {
  const keys = await countCadreKeys();
  return Math.floor(keys / 2) + 1;
}

async function run_dao_worker(props: WorkerProps) {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const lastBlock = await queryLastBlock(props.api);
      if (!is_new_block(props.lastBlock.blockNumber, lastBlock.blockNumber)) {
        await sleep(blockTime);
        continue;
      }
      props.lastBlock = lastBlock;
      log(`Block ${props.lastBlock.blockNumber}: processing`);
      const votes = await computeTotalVotesPerDao();
      const dao_entries = await queryDaosEntries(props.api);
      const pending: DaoStatus = "Pending";
      const accepted: DaoStatus = "Accepted";
      const pending_daos = dao_entries.filter(
        (app) => app.status === pending || app.status === accepted,
      );
      const dao_hash_map: Record<number, DaoApplications> = pending_daos.reduce(
        (hashmap, dao) => {
          hashmap[dao.id] = dao;
          return hashmap;
        },
        {} as Record<number, DaoApplications>,
      );

      const votes_on_pending = votes.filter(
        (vote) =>
          dao_hash_map[vote.daoId] &&
          (dao_hash_map[vote.daoId]?.blockNumber || lastBlock.blockNumber) +
            DAO_EXPIRATION_TIME <=
            lastBlock.blockNumber,
      );
      const vote_threshold = await get_cadre_threshold();
      console.log(vote_threshold);
      console.log(votes_on_pending);
      for (const vote_info of votes_on_pending) {
        const { daoId, acceptVotes, refuseVotes, removeVotes } = vote_info;
        console.log(
          `Accept: ${acceptVotes} ${daoId} Threshold: ${vote_threshold}`,
        );
        if (acceptVotes >= vote_threshold) {
          // sanity check
          if (daoId in dao_hash_map) {
            await pushToWhitelist(
              props.api,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              dao_hash_map[daoId]!.userId,
              "",
            );
          }
          console.log("shadowheart");
          // push to whitelist
        } else if (refuseVotes >= vote_threshold) {
          console.log("shadowheart");
          // refuse
        } else if (
          removeVotes >= vote_threshold &&
          dao_hash_map[daoId]?.status === accepted
        )
          console.log("Shadowheart");
        // remove
      }
      // console.log(votes);
    } catch (e) {
      log("UNEXPECTED ERROR: ", e);
      await sleep(blockTime);
      continue;
    }
  }
}

async function main(worker_type: WorkerType) {
  const api = await setup();
  const lastBlockNumber = -1;
  const lastBlock = await queryLastBlock(api);
  if (worker_type === "validator") {
    await run_validator_worker({
      lastBlock,
      api,
      lastBlockNumber,
    });
  } else {
    await run_dao_worker({
      lastBlock,
      api,
      lastBlockNumber,
    });
  }
}

main(workerName)
  .catch(console.error)
  .finally(() => process.exit());

const app = express();

app.get("/api/health", (_, res) => {
  res.send(`${workerName} OK`);
});

const port = process.env.PORT ?? 3000;

app.listen(port, () => {
  log(`/helth listening on port ${port}`);
});
