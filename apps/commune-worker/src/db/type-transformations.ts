/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { NetworkSubnetConfig, SubspaceModule } from "@commune-ts/types";

import type { Module, Subnet } from "./index.js";

export function SubspaceModuleToDatabase(
  module: SubspaceModule,
  atBlock: number,
): Module {
  return {
    netuid: module.netuid,
    moduleKey: module.key,
    atBlock: atBlock,
    name: module.name ?? null,
    registrationBlock: module.registrationBlock ?? null,
    addressUri: module.address ?? null,
    metadataUri: module.metadata ?? null,
    emission: module.emission ?? null,
    incentive: module.incentive ?? null,
    dividend: module.dividends ?? null,
    delegationFee: module.delegationFee ?? null,
    totalStaked: null,
    totalStakers: null,
    totalRewards: null,
    moduleId: module.uid,
  };
}

export function SubnetToDatabase(
  subnet: NetworkSubnetConfig,
  atBlock: number,
): Subnet {
  return {
    netuid: subnet.netuid,
    name: subnet.subnetNames,
    immunityPeriod: subnet.immunityPeriod,
    minAllowedWeights: subnet.minAllowedWeights,
    maxAllowedWeights: subnet.maxAllowedWeights,
    tempo: subnet.tempo,
    maxAllowedUids: subnet.maxAllowedUids,
    founder: subnet.founder,
    founderShare: subnet.founderShare,
    incentiveRatio: subnet.incentiveRatio,
    trustRatio: subnet.trustRatio,
    maxWeightAge: String(subnet.maxWeightAge),
    bondsMa: subnet.bondsMovingAverage ?? null,
    maximumSetWeightCallsPerEpoch: subnet.maximumSetWeightCallsPerEpoch ?? null,
    minValidatorStake: BigInt(subnet.minValidatorStake),
    maxAllowedValidators: subnet.maxAllowedValidators ?? null,
    subnetMetadata: subnet.subnetMetadata,
    minBurn: BigInt(subnet.moduleBurnConfig.minBurn),
    maxBurn: BigInt(subnet.moduleBurnConfig.maxBurn),
    adjustmentAlpha: String(subnet.moduleBurnConfig.adjustmentAlpha),
    targetRegistrationsInterval:
      subnet.moduleBurnConfig.targetRegistrationsInterval,
    maxRegistrationsPerInterval:
      subnet.moduleBurnConfig.maxRegistrationsPerInterval,
    proposalCost: BigInt(subnet.subnetGovernanceConfig.proposalCost),
    proposalExpiration: subnet.subnetGovernanceConfig.proposalExpiration,
    maxProposalRewardTreasuryAllocation: BigInt(
      subnet.subnetGovernanceConfig.maxProposalRewardTreasuryAllocation,
    ),
    proposalRewardTreasuryAllocation:
      subnet.subnetGovernanceConfig.proposalRewardTreasuryAllocation,
    proposalRewardInterval:
      subnet.subnetGovernanceConfig.proposalRewardInterval,
    targetRegistrationsPerInterval:
      subnet.moduleBurnConfig.targetRegistrationsPerInterval,
    atBlock: atBlock,
    voteMode: subnet.subnetGovernanceConfig.voteMode,
  };
}
