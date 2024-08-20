"use client";

import Link from "next/link";
import { ChevronLeftIcon } from "@heroicons/react/16/solid";

import { useCommune } from "@commune-ts/providers/use-commune";
import { formatToken, smallAddress } from "@commune-ts/providers/utils";

interface ValidatorsListProps {
  listType: "all" | "staked";
  onSelectValidator: (validator: { address: string }) => void;
  onBack: () => void;
  userAddress: string;
}

interface Validator {
  name: string;
  description: string;
  address: string;
}

interface StakedValidator {
  stake: string;
  address: string;
}

export function ValidatorsList(props: ValidatorsListProps) {
  const { userTotalStaked } = useCommune();

  const validatorsList = [
    {
      name: "vali::comsci",
      description: "Validator of Comsci platform. ",
      address: "5EFBeJXnFcSVUDiKdRjo35MqX6hBpuyMnnGV9UaYuAhqRV4Z",
    },
    {
      name: "vali::smart",
      description: "Validator of Comchat platform.",
      address: "5D4o6H19z6ctWjS9HzxBpMxqhuzCCCsgXk49AqXGPUqZEpRt",
    },
    {
      name: "vali::comstats",
      description: "Validator of Comstats platform.",
      address: "5H9YPS9FJX6nbFXkm9zVhoySJBX9RRfWF36abisNz5Ps9YaX",
    },
    {
      name: "vali::Synthia",
      description: "Validator by Synthia subnet founders.",
      address: "5Cih7zYysiFBNv8XcSKxfivegS2o8gZLthoZZTVPzzKpfUJB",
    },
    {
      name: "vali::Openscope",
      description: "Validator by Openscope subnet founders.",
      address: "5GTLWXb5w7436M65D7HEzCLANXC18fqeM1AGkinyuMsPgHUs",
    },
    {
      name: "vali::Eden",
      description: "Validator by Eden subnet founders.",
      address: "5FjyW3vcB8MkDh19JV88dVLGP6wQEftJC6nXUEobQmdZc6PY",
    },
    {
      name: "vali::Mosaic",
      description: "Validator by Mosaic subnet founders.",
      address: "5DofQSnXnWjF1VUzYVzTQV658GeBExrVFEQ5B4k8Tr1LcBzb",
    },
  ];

  function getValidatorsList(): Validator[] {
    if (props.listType === "staked" && userTotalStaked) {
      return (userTotalStaked as StakedValidator[]).map((item) => ({
        name: ``,
        description: `Staked amount: ${formatToken(Number(item.stake))}`,
        address: item.address,
      }));
    }
    return validatorsList;
  }

  const currentList = getValidatorsList();

  return (
    <div className="mt-4 w-full animate-fade-down border-t border-white/20 pt-2">
      <div className="mb-4 border-b border-white/20">
        <h3 className="text-lg font-semibold text-gray-300">
          Select a Validator
        </h3>
        <p className="pb-2 text-gray-300">
          Once you select a validator, it will automatically fill the field with
          their address. View all validators list{" "}
          <Link
            href="https://www.comstats.org/"
            target="_blank"
            rel="noreferrer"
            className="text-green-500 hover:underline"
          >
            here
          </Link>
          .
        </p>
      </div>
      <div className="flex animate-fade-down flex-col gap-y-4 animate-delay-200">
        {currentList.map((item) => (
          <button
            key={item.address}
            onClick={() => props.onSelectValidator({ address: item.address })}
            className="flex w-full items-center justify-center text-nowrap border border-green-500 bg-green-600/5 px-3 py-2.5 font-semibold text-green-500 transition duration-200 hover:border-green-400 hover:bg-green-500/15 active:bg-green-500/50"
          >
            <div className="flex w-full flex-col items-start gap-1">
              <div className="flex w-full flex-row items-start justify-between md:flex-row">
                <span className="flex gap-1">
                  {item.name !== "" && (
                    <p className="text-white">
                      {item.name.toLocaleUpperCase()} /
                    </p>
                  )}
                  <p>{item.description}</p>
                </span>
                <span className="text-gray-300">
                  {smallAddress(item.address)}
                </span>
              </div>
            </div>
          </button>
        ))}
        <div className="animate-fade-down border-t border-white/20 pt-4 animate-delay-300">
          <button
            onClick={props.onBack}
            className="flex w-full items-center justify-center text-nowrap border border-amber-500 bg-amber-600/5 px-4 py-2.5 font-semibold text-amber-500 transition duration-200 hover:border-amber-400 hover:bg-amber-500/15 active:bg-amber-500/50"
          >
            <ChevronLeftIcon className="h-6 w-6" /> Back to Field Options
          </button>
        </div>
      </div>
    </div>
  );
}
