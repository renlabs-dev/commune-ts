import { api } from "~/trpc/server";

export default function Page(): JSX.Element {
  return <CrudShowcase />;
}

async function CrudShowcase() {
  const latestModule = await api.moduleTest.getLatest();

  return (
    <div className="w-full max-w-xs">
      {latestModule ? (
        <p className="truncate">Most recent module id: {latestModule.id}</p>
      ) : (
        <p>No modules found</p>
      )}
    </div>
  );
}
