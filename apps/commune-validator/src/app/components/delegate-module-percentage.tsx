"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

// TODO: Delegation submit logic
export function DelegateModulePercentage() {
  const [percentage, setPercentage] = useState(0);

  function handlePercentageChange(change: number) {
    setPercentage((prevPercentage) => {
      const newPercentage = prevPercentage + change;
      if (newPercentage > 100) return 100;
      if (newPercentage < 0) return 0;
      return newPercentage;
    });
  }

  return (
    <>
      <div className="flex w-full items-center gap-2 border border-white/20 bg-[#898989]/5 backdrop-blur-md">
        <button
          className="border-r border-white/20 p-2 hover:bg-red-500/10"
          onClick={() => handlePercentageChange(-10)}
        >
          <ChevronDownIcon className="h-5 w-5 text-red-500" />
        </button>
        <div className="flex w-full items-center justify-center border-white/20 p-2">
          {percentage}%
        </div>
        <button
          className="border-l border-white/20 p-2 hover:bg-green-500/10"
          onClick={() => handlePercentageChange(10)}
        >
          <ChevronUpIcon className="h-5 w-5 text-green-500" />
        </button>
      </div>
    </>
  );
}
