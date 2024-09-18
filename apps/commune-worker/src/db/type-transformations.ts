import type { SubspaceModule } from "@commune-ts/types";

import type { Module } from "./index.ts";

export function SubspaceModuleToDatabase(module: SubspaceModule): Module {
  return {
    netuid: module.netuid,
    moduleKey: module.key,
    atBlock: module.atBlock ?? 0,
    name: module.name ?? null,
    registrationBlock: module.registrationBlock ?? null,
    addressUri: module.addressUri ?? null,
    metadataUri: module.metadataUri ?? null,
    emission: module.emission ?? null,
    incentive: module.incentive ?? null,
    dividend: module.dividend ?? null,
    delegationFee: module.delegationFee ?? null,
    totalStaked: module.totalStaked ?? null,
    totalStakers: module.totalStakers ?? null,
    totalRewards: module.totalRewards ?? null,
  };
}
