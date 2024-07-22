import { Suspense } from "react";

import { api } from "~/trpc/server";
import { ModuleCard } from "../components/module-card";
import { PaginationControls } from "../components/pagination-controls";

export default async function Page({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const currentPage = Number(searchParams.page) || 1;
  const { modules, metadata } = await api.module.paginatedAll({
    page: currentPage,
    limit: 24,
  });

  return (
    <>
      <div className="mb-16 grid w-full animate-fade-up grid-cols-1 gap-4 backdrop-blur-md animate-delay-700 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
      <Suspense fallback={<div>Loading...</div>}>
        <PaginationControls totalPages={metadata.totalPages} />
      </Suspense>
    </>
  );
}
