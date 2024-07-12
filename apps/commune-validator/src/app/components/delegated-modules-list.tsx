"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useCommune } from "@commune-ts/providers/use-commune";
import { smallAddress } from "@commune-ts/providers/utils";

import { useDelegateStore } from "~/stores/delegateStore";
import { api } from "~/trpc/react";

export function DelegatedModulesList() {
  const {
    delegatedModules,
    updatePercentage,
    removeModule,
    getTotalPercentage,
  } = useDelegateStore();
  const totalPercentage = getTotalPercentage();
  const { selectedAccount } = useCommune();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePercentageChange = (id: number, percentage: number) => {
    if (percentage >= 0 && percentage <= 100) {
      updatePercentage(id, percentage);
    }
  };

  const createUserModuleData = api.module.createUserModuleData.useMutation({
    onSuccess: () => {
      router.refresh();
      setIsSubmitting(false);
    },
    onError: (error) => {
      console.error("Error submitting data:", error);
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async () => {
    if (!selectedAccount?.address || totalPercentage !== 100) {
      return;
    }

    setIsSubmitting(true);

    try {
      for (const delegatedModule of delegatedModules) {
        await createUserModuleData.mutateAsync({
          userKey: selectedAccount.address,
          moduleKey: delegatedModule.address,
          weight: delegatedModule.percentage,
        });
      }
    } catch (error) {
      console.error("Error submitting data:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {selectedAccount?.address && delegatedModules.length > 0 && (
        <div className="absolute bottom-0 right-0 mb-24 mr-4 mt-8 animate-fade-up border border-white/20 bg-[#898989]/5 p-2 backdrop-blur-md">
          <h2 className="mb-4 text-xl font-semibold text-white">
            Delegated Modules
          </h2>
          {delegatedModules.map((module) => (
            <div
              key={module.id}
              className="mb-2 flex animate-fade-up items-center justify-between gap-12 border border-white/20 bg-[#898989]/5 p-2 animate-delay-100"
            >
              <div className="flex flex-col">
                <span className="font-semibold text-gray-400">
                  {module.title}
                </span>
                <span className="text-white">
                  {smallAddress(module.address)}
                </span>
              </div>
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
          <div className="mt-4 animate-fade-up text-white animate-delay-200">
            Total Percentage: {totalPercentage}%
            {totalPercentage !== 100 && (
              <span className="ml-2 text-red-500">
                {totalPercentage > 100 ? "Exceeds" : "Does not equal"} 100%
              </span>
            )}
          </div>
          <button
            onClick={handleSubmit}
            className="w-full animate-fade border border-white/20 bg-[#898989]/5 p-2 text-white backdrop-blur-md transition duration-200 animate-delay-300 hover:border-green-500 hover:bg-green-500/10"
            disabled={
              isSubmitting ||
              totalPercentage !== 100 ||
              !selectedAccount.address
            }
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      )}
    </>
  );
}
