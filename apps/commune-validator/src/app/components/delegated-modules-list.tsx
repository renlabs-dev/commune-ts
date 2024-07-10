"use client";

import { useDelegateStore } from "~/stores/delegateStore";

export function DelegatedModulesList() {
  const {
    delegatedModules,
    updatePercentage,
    removeModule,
    getTotalPercentage,
  } = useDelegateStore();
  const totalPercentage = getTotalPercentage();

  const handlePercentageChange = (id: number, percentage: number) => {
    if (percentage >= 0 && percentage <= 100) {
      updatePercentage(id, percentage);
    }
  };

  return (
    <div className="absolute bottom-0 right-0 mb-24 mr-4 mt-8 border border-white/20 bg-[#898989]/5 p-2 backdrop-blur-md">
      <h2 className="mb-4 text-xl font-semibold text-white">
        Delegated Modules
      </h2>
      {delegatedModules.map((module) => (
        <div
          key={module.id}
          className="mb-2 flex items-center justify-between border border-white/20 bg-[#898989]/5 p-2"
        >
          <span className="text-white">{module.title}</span>
          <div className="flex items-center">
            <input
              type="number"
              value={module.percentage}
              onChange={(e) =>
                handlePercentageChange(module.id, Number(e.target.value))
              }
              className="mr-2 w-16 bg-[#898989]/10 p-1 text-white"
              min="0"
              max="100"
            />
            <span className="mr-2 text-white">%</span>
            <button
              onClick={() => removeModule(module.id)}
              className="text-red-500 hover:text-red-400"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <div className="mt-4 text-white">
        Total Percentage: {totalPercentage}%
        {totalPercentage > 100 && (
          <span className="ml-2 text-red-500">Exceeds 100%</span>
        )}
      </div>
    </div>
  );
}
