import "@polkadot/api-augment";
import { ApiPromise, WsProvider } from "@polkadot/api";

console.log("Hello from Subspace!");

// == Start API ==

const wsProvider = new WsProvider("wss://commune.api.onfinality.io/public-ws");
const api = await ApiPromise.create({ provider: wsProvider });

if (!api.isConnected) {
  throw new Error("API not connected");
}

console.log("API connected");

// This file is a test file to check if the queries are working as expected

// const testAddress = "5Dw5xxnpgVAbBgXtxT1DEWKv3YJJxHGELZKHNCEWzRNKbXdL";
// const lastBlockQuery = await queryLastBlock(api);
// const balanceQuery = await queryBalance(api, testAddress);
// const stakeToQuery = await queryStakeTo(api);
// const proposalsQuery = await queryProposalsEntries(
//   lastBlockQuery.apiAtBlock as ApiPromise,
// );
// const daosQuery = await queryDaosEntries(api);
// console.log("proposalsQuery:", proposalsQuery);
