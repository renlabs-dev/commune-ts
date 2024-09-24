"use client";

import { useCommune } from "@commune-ts/providers/use-commune";

import { ModuleCard } from "~/app/components/module-card";
import { useDelegateModuleStore } from "~/stores/delegateModuleStore";

export default function Page() {
  const { selectedAccount } = useCommune();
  const { delegatedModules } = useDelegateModuleStore();

  if (!selectedAccount?.address)
    return (
      <span className="min-h-[60vh] w-full justify-center pt-12 text-center text-xl">
        Connect Wallet to view your weighted modules.
      </span>
    );

  const weightedModules = delegatedModules.filter(
    (module) => module.percentage > 0,
  );

  return (
    <>
      {weightedModules.length ? (
        <div
          key={module.id}
          className="mb-16 grid h-full w-full animate-fade-up grid-cols-1 gap-4 animate-delay-700 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {weightedModules.map((module) => (
            <ModuleCard
              id={module.id}
              key={module.id}
              name={module.name}
              moduleKey={module.address}
              metadata={null} // TODO - metadataUri
            />
          ))}
        </div>
      ) : (
        <span className="min-h-[60vh] w-full justify-center pt-12 text-center text-xl">
          No weighted modules found.
        </span>
      )}
    </>
  );
}
