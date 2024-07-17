"use client";

import { ChartPieIcon } from "@heroicons/react/24/outline";

import { useDelegateStore } from "~/stores/delegateStore";

interface DelegateModuleWeightProps {
  id: number;
  title: string;
  name: string;
  moduleKey: string;
}

export function DelegateModuleWeight(props: DelegateModuleWeightProps) {
  const { delegatedModules, addModule, removeModule } = useDelegateStore();
  const isModuleDelegated = delegatedModules.some((m) => m.id === props.id);

  const handleDelegateClick = () => {
    if (isModuleDelegated) {
      removeModule(props.id);
    } else {
      addModule({
        id: props.id,
        address: props.moduleKey,
        title: props.title,
        name: props.name,
      });
    }
  };

  return (
    <button
      onClick={handleDelegateClick}
      className={`flex w-fit items-center gap-2 border border-white/20 bg-[#898989]/5 p-2 text-white backdrop-blur-md transition duration-200 ${
        isModuleDelegated
          ? "border-red-500 bg-red-500/10 hover:bg-red-500/20"
          : "hover:border-green-500 hover:bg-green-500/10"
      }`}
    >
      <ChartPieIcon
        className={`h-6 w-6 ${isModuleDelegated ? "text-red-500" : "text-green-500"}`}
      />
      {isModuleDelegated ? "Remove" : "Delegate"}
    </button>
  );
}
