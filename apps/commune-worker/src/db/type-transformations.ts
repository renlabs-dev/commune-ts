import type { SubspaceModule } from "@commune-ts/types";

import type { Module } from "./index.ts";

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
    totalStaked: module.totalStaked ?? null,
    totalStakers: module.totalStakers ?? null,
    totalRewards: module.totalRewards ?? null,
    moduleId: module.uid,
  };
}
