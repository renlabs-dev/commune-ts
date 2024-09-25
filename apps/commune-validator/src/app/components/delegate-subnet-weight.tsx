"use client";

import { ChartPieIcon } from "@heroicons/react/24/outline";

import { useDelegateSubnetStore } from "~/stores/delegateSubnetStore";

interface DelegateSubnetWeightProps {
  id: number;
  founder: string;
  name: string;
}

export function DelegateSubnetWeight(props: DelegateSubnetWeightProps) {
  const { delegatedSubnets, addSubnet, removeSubnet } =
    useDelegateSubnetStore();
  const isSubnetDelegated = delegatedSubnets.some((m) => m.id === props.id);

  const handleDelegateClick = () => {
    if (isSubnetDelegated) {
      removeSubnet(props.id);
    } else {
      addSubnet({
        id: props.id,
        founder: props.founder,
        name: props.name,
      });
    }
  };

  return (
    <button
      onClick={handleDelegateClick}
      className={`flex w-fit items-center gap-2 border border-white/20 bg-[#898989]/5 p-2 text-sm text-white backdrop-blur-md transition duration-200 ${
        isSubnetDelegated
          ? "hover:border-red-500 hover:bg-red-500/20"
          : "hover:border-cyan-500 hover:bg-cyan-500/10"
      }`}
    >
      <ChartPieIcon
        className={`h-5 w-5 ${isSubnetDelegated ? "text-red-500" : "text-cyan-500"}`}
      />
      {isSubnetDelegated ? "Remove" : "Delegate"}
    </button>
  );
}
