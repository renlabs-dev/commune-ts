import SubnetAccordion from "~/app/components/subnet-accordion";
import { api } from "~/trpc/server";

export default async function SubnetsPage() {
  const data = await api.subnet.all();

  return (
    <div className="mb-4 flex w-full flex-col gap-4">
      {data.map((subnet) => (
        <SubnetAccordion
          key={subnet.id}
          founderAddress={subnet.founder}
          id={subnet.id}
          name={subnet.name}
        />
      ))}
    </div>
  );
}
