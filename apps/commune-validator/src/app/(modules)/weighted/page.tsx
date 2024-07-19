"use client";

import { useEffect } from "react";

import { useCommune } from "@commune-ts/providers/use-commune";

import { ModuleCard } from "~/app/components/module-card";
import { api } from "~/trpc/react";

export default function Page() {
  const { selectedAccount } = useCommune();

  const { data: userModuleData, error } = api.module.byUserModuleData.useQuery(
    { userKey: selectedAccount?.address ?? "" },
    { enabled: !!selectedAccount?.address },
  );

  useEffect(() => {
    if (error) {
      console.error("Error fetching user module data:", error);
    }
  }, [error]);

  if (!userModuleData) return null;

  console.log(userModuleData, "userModuleData");

  const modules = userModuleData.map((modules) => modules.module_data);

  console.log(modules, "module data");

  return (
    <div className="mb-16 grid w-full animate-fade-up grid-cols-1 gap-4 animate-delay-700 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {modules.length ? (
        modules.map((module) => (
          <ModuleCard
            id={module.id}
            key={module.id}
            name={module.name ?? ""}
            moduleKey={module.moduleKey}
            metadata={module.metadataUri}
          />
        ))
      ) : (
        <p>No modules found</p>
      )}
    </div>
  );
}
