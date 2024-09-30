"use client";

import { useCommune } from "@commune-ts/providers/use-commune";

import SubnetAccordion from "~/app/components/subnet-accordion";
import { useDelegateSubnetStore } from "~/stores/delegateSubnetStore";

export default function Page() {
  const { selectedAccount } = useCommune();
  const { delegatedSubnets } = useDelegateSubnetStore();

  if (!selectedAccount?.address)
    return (
      <span className="min-h-[60vh] w-full justify-center pt-12 text-center text-xl">
        Connect Wallet to view your weighted subnets.
      </span>
    );

  const weightedSubnets = delegatedSubnets.filter(
    (subnet) => subnet.percentage > 0,
  );

  return (
    <>
      {weightedSubnets.length ? (
        <div className="mb-16 flex h-full w-full grid-cols-1 flex-col gap-4 backdrop-blur-md animate-delay-700">
          {weightedSubnets.map((subnet) => (
            <SubnetAccordion key={subnet.id} subnet={subnet} />
          ))}
        </div>
      ) : (
        <span className="min-h-[60vh] w-full justify-center pt-12 text-center text-xl">
          No weighted subnets found.
        </span>
      )}
    </>
  );
}
