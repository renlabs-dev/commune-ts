"use client";

import type { inferProcedureOutput } from "@trpc/server";
import { useState } from "react";
import { ChevronUpIcon } from "@heroicons/react/16/solid";

import type { AppRouter } from "@commune-ts/api";
import { smallAddress } from "@commune-ts/utils";

import { subnetDataList } from "~/utils/subnet-data-list";

type Subnet = NonNullable<inferProcedureOutput<AppRouter["subnet"]["byId"]>>;

export default function SubnetAccordion({ subnet }: { subnet: Subnet }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => setIsOpen(!isOpen);

  return (
    <div className="gap-2 border border-white/20 bg-[#898989]/5 py-4 text-lg text-white backdrop-blur-md transition duration-200 hover:bg-white/5">
      <div className="flex flex-col items-center justify-between gap-3 border-white/20 px-4 md:flex-row">
        <div className="flex gap-6">
          <NameCard label="Name" name={subnet.name} />
          <NameCard label="Subnet NetUID" name={`${subnet.netuid}`} />
          <NameCard label="Founder" name={smallAddress(subnet.founder)} />
        </div>
        <div className="flex gap-3">
          <button className="flex w-fit items-center text-nowrap rounded-full border border-cyan-500 bg-cyan-600/15 px-4 py-1.5 text-sm font-semibold text-cyan-500 transition duration-200 hover:border-cyan-400 hover:bg-cyan-500/15 active:bg-cyan-500/50">
            <span>DELEGATE</span>
          </button>
          <button
            onClick={toggleAccordion}
            className="flex w-fit items-center text-nowrap rounded-full border border-cyan-500 bg-cyan-600/15 py-1.5 pl-3 pr-2 text-sm font-semibold text-cyan-500 transition duration-200 hover:border-cyan-400 hover:bg-cyan-500/15 active:bg-cyan-500/50"
          >
            <span>{isOpen ? "COLLAPSE" : "EXPAND"}</span>
            <span>
              <ChevronUpIcon
                className={`h-5 w-5 transform transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-4 border-t border-white/20 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {subnetDataList.map((field) => (
              <InfoItem
                key={field.key}
                label={field.label}
                value={subnet[field.key]}
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
    <div className="flex gap-2">
      <span className="font-semibold text-cyan-500">{label}:</span>
      <span>
        {value !== null && value !== undefined ? String(value) : "N/A"}
      </span>
    </div>
  );
}

function NameCard({ name, label }: { name: string; label: string }) {
  return (
    <span className="flex gap-2">
      <p className="text-sm text-gray-400">
        <b className="text-lg text-gray-200">{name}</b> / {label}
      </p>
    </span>
  );
}
