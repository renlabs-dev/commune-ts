import "@polkadot/api-augment";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { Struct, u128, u32, Text } from "@polkadot/types";

console.log("Hello from Subspace!");

// == Start API ==

const wsProvider = new WsProvider(
  "wss://testnet-commune-api-node-1.communeai.net",
);
const api = await ApiPromise.create({ provider: wsProvider });

if (!api.isConnected) {
  throw new Error("API not connected");
}

console.log("API connected");

interface SubnetGovernanceConfig extends Struct {
  readonly proposalCost: u128;
  readonly proposalExpiration: u32;
  readonly voteMode: Text;
  readonly proposalRewardTreasuryAllocation: Text;
  readonly maxProposalRewardTreasuryAllocation: u128;
  readonly proposalRewardInterval: u32;
}

const governanceConfig =
  (await api.query.governanceModule.subnetGovernanceConfig(
    0,
  )) as unknown as SubnetGovernanceConfig;

const voteMode = governanceConfig.voteMode.toString();

console.log("Vote Mode:", voteMode);
