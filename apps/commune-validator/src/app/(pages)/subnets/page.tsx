import SubnetAccordion from "~/app/components/subnet-accordion";
import { api } from "~/trpc/server";

export default async function SubnetsPage() {
  const data = await api.subnet.all();

  return (
    <div className="mb-4 w-full">
      {data.map((subnet) => (
        <SubnetAccordion key={subnet.id} subnet={subnet} />
      ))}
    </div>
  );
}
