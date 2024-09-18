"use client";

import type { inferProcedureOutput } from "@trpc/server";
import { useState } from "react";

import type { AppRouter } from "@commune-ts/api";

type SubnetNullable = inferProcedureOutput<AppRouter["subnet"]["byId"]>;
type Subnet = NonNullable<SubnetNullable>;

// Helper function to generate label from key
function generateLabel(key: string): string {
  return key
    .split(/(?=[A-Z])/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Generate subnet fields dynamically
const subnetFields: (keyof Subnet)[] = Object.keys(
  {} as Subnet,
) as (keyof Subnet)[];

export default function SubnetAccordion({
  subnet,
}: {
  subnet: SubnetNullable;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => setIsOpen(!isOpen);

  if (!subnet) return null;

  return (
    <div className="mb-4 rounded-lg border border-gray-200">
      <button
        className="flex w-full items-center justify-between bg-gray-100 p-5 text-left font-medium text-gray-500 hover:bg-gray-200 focus:outline-none"
        onClick={toggleAccordion}
      >
        <span>
          {subnet.name} (ID: {subnet.id})
        </span>
        <span>{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="p-5">
          <div className="grid grid-cols-2 gap-4">
            {subnetFields.map((field) => (
              <InfoItem
                key={field}
                label={generateLabel(field)}
                value={subnet[field]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="flex flex-col">
      <span className="font-semibold">{label}:</span>
      <span>
        {value !== null && value !== undefined ? String(value) : "N/A"}
      </span>
    </div>
  );
}
