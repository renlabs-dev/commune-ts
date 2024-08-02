"use client";

import { useCommune } from "@commune-ts/providers/use-commune";

import { ModuleCard } from "~/app/components/module-card";
import { useDelegateStore } from "~/stores/delegateStore";

export default function Page() {
  const { selectedAccount } = useCommune();
  const { delegatedModules } = useDelegateStore();

  if (!selectedAccount?.address)
    return (
      <span className="w-full justify-center pt-12 text-center text-xl">
        Connect Wallet to view your weighted modules.
      </span>
    );

  const weightedModules = delegatedModules.filter(
    (module) => module.percentage > 0,
  );

  return (
    <>
      <div
        key={module.id}
        className="mb-16 grid w-full animate-fade-up grid-cols-1 gap-4 animate-delay-700 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {weightedModules.length ? (
          weightedModules.map((module) => (
            <ModuleCard
              id={module.id}
              key={module.id}
              name={module.name}
              moduleKey={module.address}
              metadata={null} // TODO - metadataUri
            />
          ))
        ) : (
          <span className="absolute w-full justify-center pt-12 text-center text-xl">
            No weighted modules found.
          </span>
        )}
      </div>
    </>
  );
}
