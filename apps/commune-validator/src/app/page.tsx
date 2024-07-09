import { api } from "~/trpc/server";
import { ModuleCard } from "./components/module-card";

export default function Page(): JSX.Element {
  return <CrudShowcase />;
}

async function CrudShowcase() {
  const modules = await api.module.all();

  return (
    <main className="mx-auto flex max-w-screen-2xl flex-col items-start justify-center px-4 text-white">
      <div className="my-20 flex flex-col gap-3">
        <h3 className="inline-flex w-fit animate-fade-down border border-white/20 bg-[#898989]/5 px-2 py-0.5 animate-delay-100 md:text-xl">
          Welcome to the Community Validator
        </h3>
        <h1 className="animate-fade-down text-2xl font-semibold animate-delay-500 md:text-4xl">
          Interact with modules created by the{" "}
          <span className="text-green-600">community</span>.
        </h1>
      </div>
      <div className="mb-16 grid w-full animate-fade-up grid-cols-1 gap-4 animate-delay-700 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {modules.length ? (
          modules.map((module) => (
            <ModuleCard
              key={module.uid}
              address={module.key}
              id={module.uid}
              metadata={module.metadataUri}
            />
          ))
        ) : (
          <p>No modules found</p>
        )}
      </div>
    </main>
  );
}
