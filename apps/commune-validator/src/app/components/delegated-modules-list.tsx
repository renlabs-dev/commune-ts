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
    clearStorage,
  } = useDelegateStore();
  const totalPercentage = getTotalPercentage();
  const { selectedAccount } = useCommune();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

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

  const deleteUserModuleData = api.module.deleteUserModuleData.useMutation({
    onSuccess: () => {
      console.log("User module data deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting user module data:", error);
    },
  });

  const handleSubmit = async () => {
    if (!selectedAccount?.address || totalPercentage !== 100) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Delete existing user module data
      await deleteUserModuleData.mutateAsync({
        userKey: selectedAccount.address,
      });

      // Submit new user module data
      for (const delegatedModule of delegatedModules) {
        await createUserModuleData.mutateAsync({
          userKey: selectedAccount.address,
          moduleId: delegatedModule.id,
          weight: delegatedModule.percentage,
        });
      }
    } catch (error) {
      console.error("Error submitting data:", error);
    } finally {
      setIsSubmitting(false);
      clearStorage();
    }
  };

  return (
    <>
      {selectedAccount?.address && delegatedModules.length > 0 && (
        <div className="fixed bottom-14 right-0 mr-4 mt-8 w-fit animate-fade-up border border-white/20 bg-[#898989]/5 backdrop-blur-md">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex w-full items-center justify-between p-2 text-xl font-semibold text-white"
          >
            <span>Delegated Modules</span>
            <span>{isOpen ? "▲" : "▼"}</span>
          </button>
          {isOpen && (
            <div className="p-2">
              <div className="mb-2 grid grid-cols-3 gap-6 border-b border-white/20 pb-2 text-sm font-semibold text-gray-400 md:grid-cols-4">
                <div>Module</div>
                <div className="hidden md:block">Name</div>
                <div>Address</div>
                <div>Percentage</div>
              </div>
              {delegatedModules.map((module) => (
                <div
                  key={module.id}
                  className="mb-2 grid animate-fade-up grid-cols-3 items-center gap-6 border-b border-white/20 pb-2 text-sm animate-delay-100 md:grid-cols-4"
                >
                  <div className="text-white">{module.title}</div>
                  <div className="hidden text-white md:block">
                    {module.name}
                  </div>
                  <div className="text-gray-400">
                    {smallAddress(module.address)}
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={module.percentage}
                      onChange={(e) =>
                        handlePercentageChange(
                          module.id,
                          Number(e.target.value),
                        )
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
                      ✕
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
                className={`mt-4 w-full animate-fade border border-white/20 bg-[#898989]/5 p-2 text-white backdrop-blur-md transition duration-200 animate-delay-300 ${
                  isSubmitting ||
                  totalPercentage !== 100 ||
                  (!selectedAccount.address &&
                    `hover:border-green-500 hover:bg-green-500/10`)
                } disabled:opacity-50`}
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
        </div>
      )}
    </>
  );
}
