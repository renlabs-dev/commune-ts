"use client";

import { useState } from "react";
import { ChevronUpIcon } from "@heroicons/react/16/solid";

import { smallAddress } from "@commune-ts/utils";

import { useDelegateSubnetStore } from "~/stores/delegateSubnetStore";
import { DelegateSubnetWeight } from "./delegate-subnet-weight";

interface SubnetAccordionWeightProps {
  id: number;
  name: string;
  founderAddress: string;
  percentage?: number;
}

export default function SubnetAccordion({
  id,
  name,
  founderAddress,
  percentage,
}: SubnetAccordionWeightProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => setIsOpen(!isOpen);

  const { delegatedSubnets } = useDelegateSubnetStore();
  const isSubnetDelegated = delegatedSubnets.some((s) => s.id === id);

  return (
    <div
      className={`duration-20 animate-fade-up gap-2 border py-4 text-lg text-white backdrop-blur-md transition ${isSubnetDelegated ? "border-cyan-500 bg-cyan-500/5 hover:bg-cyan-500/10" : "border-white/20 bg-[#898989]/5 hover:bg-white/5"}`}
    >
      <div className="flex flex-col items-center justify-between gap-3 border-white/20 px-4 md:flex-row">
        <div className="flex gap-6">
          <NameCard label="Name" name={name} />
          <NameCard label="Subnet id" name={`${id}`} />
          <NameCard label="Founder" name={smallAddress(founderAddress)} />
          {percentage && <NameCard label="Allocated" name={`${percentage}%`} />}
        </div>
        <div className="flex gap-3">
          <DelegateSubnetWeight
            id={id}
            name={name}
            founderAddress={founderAddress}
          />
          <button
            onClick={toggleAccordion}
            className="flex w-fit items-center text-nowrap border border-cyan-500 bg-cyan-600/15 py-1.5 pl-3 pr-1 text-sm font-semibold text-cyan-500 transition duration-200 hover:border-cyan-400 hover:bg-cyan-500/15 active:bg-cyan-500/50"
          >
            <span>{isOpen ? "Collapse" : "Expand"}</span>
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
