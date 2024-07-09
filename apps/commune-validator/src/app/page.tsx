import { api } from "~/trpc/server";
import { CreateWeight } from "./components/create-module-test";

export default function Page(): JSX.Element {
  return <CrudShowcase />;
}

async function CrudShowcase() {
  const latestModule = await api.moduleTest.getLatest();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center text-white">
      {latestModule ? (
        <>
          <p className="truncate">Most recent module:</p>
          <p className="truncate">ID: {latestModule.id}</p>
          <p className="truncate">WEIGHT: {latestModule.weight}</p>
        </>
      ) : (
        <p>No modules found</p>
      )}

      <CreateWeight />
    </main>
  );
}
