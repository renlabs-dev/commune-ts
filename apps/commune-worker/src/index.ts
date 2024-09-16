import "@polkadot/api-augment";

import { WsProvider } from "@polkadot/api";
import axios from "axios";
import express from "express";

import type {
  DaoApplications,
  GovernanceModeType,
  LastBlock,
} from "@commune-ts/types";
import {
  ApiPromise,
  pushToWhitelist,
  queryDaosEntries,
  queryLastBlock,
  queryRegisteredModulesInfo,
  refuseDaoApplication,
  removeFromWhitelist,
} from "@commune-ts/subspace/queries";
import {
  buildIpfsGatewayUrl,
  flattenResult,
  parseIpfsUri,
  processDaoMetadata,
} from "@commune-ts/subspace/utils";

import type { NewNotification, VotesByProposal } from "./db";
import {
  addSeenProposal,
  computeTotalVotesPerDao,
  countCadreKeys,
  getProposalIdsByType,
  upsertModuleData,
} from "./db";

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
const DAO_EXPIRATION_TIME = 75600; // 7 days in blocks

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

async function notifyNewApplication(pending_apps: DaoApplications[]) {
  async function pushNotification(proposal: DaoApplications) {
    const r = parseIpfsUri(proposal.data);
    const cid = flattenResult(r);
    if (cid === null) {
      console.log(`Failed to parse ${proposal.id} cid`);
    } else {
      const url = buildIpfsGatewayUrl(cid); // this is wrong
      const metadata = await processDaoMetadata(url, proposal.id);
      const resolved_metadata = flattenResult(metadata);
      // shadowheart
      if (resolved_metadata === null) {
        console.log(`Failed to get metadata on proposal ${proposal.id}`);
      } else {
        const notification = {
          discord_uid: `${resolved_metadata.discord_id}`,
          app_id: `${proposal.id}`,
          application_url: `https://governance.communeai.org/dao/${proposal.id}`,
        };
        const headers = {
          "X-token": process.env.DISCORD_API_TOKEN,
        };
        const seen_proposal: NewNotification = {
          governanceModel: p_type,
          proposalId: proposal.id,
        };
        await axios
          .post(`${process.env.DISCORD_API_ENDPOINT}`, notification, {
            headers,
          })
          .then(async function (response) {
            console.log(response);
            await addSeenProposal(seen_proposal);
          })
          .catch((reason) => console.log(`Reject bc ${reason}`));
        console.log("pushed notification"); // actually to call the discord endpoint and etc
        return;
      }
    }
    return;
  }

  const p_type: GovernanceModeType = "DAO";
  const proposals = await getProposalIdsByType(p_type);
  const proposalsSet: Set<number> = new Set<number>(proposals);
  const unseen_proposals = pending_apps.filter(
    (application) => !proposalsSet.has(application.id),
  );
  const notifications_promises = unseen_proposals.map(pushNotification);
  Promise.all(notifications_promises).catch((error) =>
    console.log(`Failed to notify proposal for reason: ${error}`),
  );
}

async function getPendingApplications(api: ApiPromise) {
  const dao_entries = await queryDaosEntries(api);
  const pending_daos = dao_entries.filter(
    (app) => app.status === "Pending" || app.status === "Accepted",
  );
  const dao_hash_map: Record<number, DaoApplications> = pending_daos.reduce(
    (hashmap, dao) => {
      hashmap[dao.id] = dao;
      return hashmap;
    },
    {} as Record<number, DaoApplications>,
  );
  return dao_hash_map;
}

async function getVotesOnPending(
  dao_hash_map: Record<number, DaoApplications>,
  last_block_number: number,
): Promise<VotesByProposal[]> {
  const votes = await computeTotalVotesPerDao();
  const votes_on_pending = votes.filter(
    (vote) =>
      dao_hash_map[vote.daoId] &&
      (dao_hash_map[vote.daoId]?.status == "Pending" ||
        dao_hash_map[vote.daoId]?.status == "Accepted") &&
      (dao_hash_map[vote.daoId]?.blockNumber ?? last_block_number) +
        DAO_EXPIRATION_TIME <=
        last_block_number,
  );
  return votes_on_pending;
}

async function process_votes_on_proposal(
  vote_info: VotesByProposal,
  vote_threshold: number,
  dao_hash_map: Record<number, DaoApplications>,
  api: ApiPromise,
) {
  const mnemonic = process.env.SUBSPACE_MNEMONIC;
  const { daoId, acceptVotes, refuseVotes, removeVotes } = vote_info;
  console.log(`Accept: ${acceptVotes} ${daoId} Threshold: ${vote_threshold}`);
  console.log(`Refuse: ${refuseVotes} ${daoId} Threshold: ${vote_threshold}`);
  console.log(`Remove: ${removeVotes} ${daoId} Threshold: ${vote_threshold}`);
  if (acceptVotes >= vote_threshold) {
    // sanity check
    if (daoId in dao_hash_map) {
      log(`Accepting proposal ${daoId}`);
      await pushToWhitelist(
        api,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        dao_hash_map[daoId]!.userId,
        mnemonic,
      );
    }
  } else if (refuseVotes >= vote_threshold) {
    log(`Refusing proposal ${daoId}`);
    await refuseDaoApplication(api, daoId, mnemonic);

    // refuse
  } else if (
    removeVotes >= vote_threshold &&
    dao_hash_map[daoId] !== undefined &&
    dao_hash_map[daoId].status === "Accepted"
  ) {
    log(`Removing proposal ${daoId}`);
    await removeFromWhitelist(api, dao_hash_map[daoId].userId, mnemonic);
  }
}
async function process_all_votes(
  votes_on_pending: VotesByProposal[],
  vote_threshold: number,
  dao_hash_map: Record<number, DaoApplications>,
  api: ApiPromise,
) {
  await Promise.all(
    votes_on_pending.map((vote_info) =>
      process_votes_on_proposal(
        vote_info,
        vote_threshold,
        dao_hash_map,
        api,
      ).catch((error) =>
        console.log(`Failed to process vote for reason: ${error}`),
      ),
    ),
  );
}

async function sleep_until_new_block(props: WorkerProps) {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const lastBlock = await queryLastBlock(props.api);
      if (!is_new_block(props.lastBlock.blockNumber, lastBlock.blockNumber)) {
        await sleep(blockTime);
      } else {
        props.lastBlock = lastBlock;
        return lastBlock;
      }
    } catch (e) {
      log("UNEXPECTED ERROR: ", e);
    }
  }
}
async function run_dao_worker(props: WorkerProps) {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const lastBlock = await sleep_until_new_block(props);
      log(`Block ${props.lastBlock.blockNumber}: processing`);
      const dao_hash_map = await getPendingApplications(props.api);

      const votes_on_pending = await getVotesOnPending(
        dao_hash_map,
        lastBlock.blockNumber,
      );
      const vote_threshold = await get_cadre_threshold();
      const proc_promise = process_all_votes(
        votes_on_pending,
        vote_threshold,
        dao_hash_map,
        props.api,
      );
      const notify_promise = notifyNewApplication(Object.values(dao_hash_map));
      await proc_promise;
      await notify_promise;
    } catch (e) {
      log("UNEXPECTED ERROR: ", e);
      await sleep(blockTime);
      continue;
    }
  }
}

const workerType = process.argv[2] ?? "validator";

async function main() {
  const api = await setup();
  const lastBlockNumber = -1;
  const lastBlock = await queryLastBlock(api);

  if (workerType === "dao") {
    await run_dao_worker({
      lastBlock,
      api,
      lastBlockNumber,
    });
  } else if (workerType === "validator") {
    await run_validator_worker({
      lastBlock,
      api,
      lastBlockNumber,
    });
  } else {
    console.error(
      "Invalid worker type argument. Please specify 'dao' or 'validator'",
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
  log(`/heth listening on port ${port}`);
});
