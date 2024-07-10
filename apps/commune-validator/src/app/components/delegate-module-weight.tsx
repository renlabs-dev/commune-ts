"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

type Change = "up" | "down";

// TODO: Delegation submit logic
export function DelegateModuleWeight() {
  const [weight, setWeight] = useState<number | null>(null);

  const BASE_WEIGHT = 100;

  function handleWeightChange(change: Change) {
    if (weight === null) {
      if (change === "up") {
        setWeight(BASE_WEIGHT);
      } else {
        setWeight(0);
      }
      return;
    }

    if (change === "up") {
      setWeight(weight + 10);
    } else {
      setWeight(Math.max(weight - 10, 0));
    }
  }

  return (
    <>
      <div className="flex w-full items-center gap-2 border border-white/20 bg-[#898989]/5 backdrop-blur-md">
        <button
          className="border-r border-white/20 p-2 hover:bg-red-500/10"
          onClick={() => handleWeightChange("down")}
        >
          <ChevronDownIcon className="h-5 w-5 text-red-500" />
        </button>
        <div className="flex w-full items-center justify-center border-white/20 p-2">
          {weight}
        </div>
        <button
          className="border-l border-white/20 p-2 hover:bg-green-500/10"
          onClick={() => handleWeightChange("up")}
        >
          <ChevronUpIcon className="h-5 w-5 text-green-500" />
        </button>
      </div>
    </>
  );
}
