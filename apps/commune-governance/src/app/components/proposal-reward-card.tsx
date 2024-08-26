"use client";

import { InformationCircleIcon } from "@heroicons/react/24/outline";

import { useCommune } from "@commune-ts/providers/use-commune";
import { formatToken } from "@commune-ts/utils";

export default function ProposalRewardCard() {
  const {
    rewardAllocation,
    globalGovernanceConfig,
    unrewardedProposals,
    lastBlock,
  } = useCommune();

  console.log("proposalRewardInterval", globalGovernanceConfig);
  console.log("lastBlock", lastBlock?.blockNumber);
  console.log(unrewardedProposals);

  return (
    <div className="flex w-full animate-fade-down border-b border-white/20 py-2.5">
      <div className="mx-auto flex max-w-screen-md items-center gap-1 px-2">
        <InformationCircleIcon className="h-6 w-6 text-green-500 md:h-5 md:w-5" />
        <p className="text-gray-400">
          Next DAO incentives payout:{" "}
          <span
            className={`text-green-500 ${!rewardAllocation && "animate-pulse"}`}
          >
            {rewardAllocation
              ? formatToken(Number(rewardAllocation))
              : "Loading Reward..."}
          </span>{" "}
          $COMAI
        </p>
      </div>
    </div>
  );
}

function calc_target_reward_time(
  current_block: bigint,
  proposal_block: bigint,
  reward_interval: bigint,
) {
  // round up to the next reward interval

  const _target_time =
    ((proposal_block + reward_interval - 1n) / reward_interval) *
    reward_interval;

  return _target_time;
}
