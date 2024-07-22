"use client";

import { useCommune } from "@commune-ts/providers/use-commune";

import { ModuleCard } from "~/app/components/module-card";
import { useDelegateStore } from "~/stores/delegateStore";

export default function Page() {
  const { selectedAccount } = useCommune();
  const { delegatedModules } = useDelegateStore();

  if (!selectedAccount?.address) return null;

  const weightedModules = delegatedModules.filter(
    (module) => module.percentage > 0,
  );

  return (
    <div className="mb-16 grid w-full animate-fade-up grid-cols-1 gap-4 animate-delay-700 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {weightedModules.length ? (
        weightedModules.map((module) => (
          <ModuleCard
            id={module.id}
            key={module.id}
            name={module.name}
            moduleKey={module.address}
            metadata={null} // You might need to adjust this if metadata is stored differently
          />
        ))
      ) : (
        <p>No weighted modules found</p>
      )}
    </div>
  );
}
