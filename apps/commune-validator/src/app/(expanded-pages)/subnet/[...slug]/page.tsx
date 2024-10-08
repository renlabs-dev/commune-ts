import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";

import { MarkdownView } from "@commune-ts/ui/markdown-view";
import { fetchCustomMetadata, smallAddress } from "@commune-ts/utils";

import type { Subnet } from "~/utils/types";
// import { ReportSubnet } from "~/app/components/report-Subnet";
import { api } from "~/trpc/server";

interface Params {
  params: {
    slug: string[];
  };
}

interface CustomMetadata {
  Ok?: {
    title?: string;
    body?: string;
  };
}

export default async function SubnetPage({ params }: Params) {
  const { slug } = params;

  if (slug.length !== 1) {
    notFound();
  }

  const id = slug[0];

  if (!/^\d+$/.test(String(id))) {
    notFound();
  }

  const sbnt = await api.subnet.byId({ id: Number(id) });

  if (!sbnt) {
    notFound();
  }

  const metadata = (await fetchCustomMetadata(
    "proposal",
    sbnt.id,
    sbnt.subnetMetadata ?? "",
  )) as CustomMetadata;

  const title = metadata.Ok?.title ?? "No Metadata";

  const description = metadata.Ok?.body ?? "This Subnet has no custom metadata";

  return (
    <div className="container mx-auto p-4 pb-28 text-white">
      <div className="my-16 flex w-full items-center justify-between">
        <Link
          href="/"
          className="absolute z-10 flex animate-fade-left items-center gap-1 border border-white/20 bg-[#898989]/5 p-2 pr-3 text-white backdrop-blur-md transition duration-200 hover:border-green-500 hover:bg-green-500/10"
        >
          <ArrowLeftIcon className="h-5 w-5 text-green-500" />
          Go back to Subnets list
        </Link>
        <h1 className="flex-grow animate-fade-right text-center text-3xl font-semibold">
          {title}
        </h1>
      </div>
      <div className="flex flex-col-reverse gap-6 md:flex-row">
        <div className="animate-fade-down animate-delay-300 md:w-[60%] xl:w-[70%]">
          <div className="border border-white/20 bg-[#898989]/5 p-8 backdrop-blur-md">
            <h2 className="mb-4 text-xl font-semibold">Description</h2>
            <MarkdownView source={description} />
          </div>
        </div>
        <div className="flex animate-fade-down flex-col gap-6 animate-delay-500 md:w-[40%] xl:w-[30%]">
          <SubnetDataGrid subnet={sbnt} />
        </div>
      </div>
    </div>
  );
}

function SubnetDataGrid({ subnet }: { subnet: Subnet }) {
  const dataGroups = [
    {
      title: "General Information",
      fields: [
        { label: "Subnet ID", value: subnet.id },
        { label: "Netuid", value: subnet.netuid },
        { label: "Name", value: subnet.name },
        { label: "At Block", value: subnet.atBlock },
        { label: "Tempo", value: subnet.tempo },
        { label: "Founder", value: smallAddress(subnet.founder) },
      ],
    },
    {
      title: "Weight Configuration",
      fields: [
        { label: "Min Allowed Weights", value: subnet.minAllowedWeights },
        { label: "Max Allowed Weights", value: subnet.maxAllowedWeights },
        { label: "Max Allowed UIDs", value: subnet.maxAllowedUids },
        { label: "Max Weight Age", value: subnet.maxWeightAge },
        { label: "Trust Ratio", value: subnet.trustRatio },
        {
          label: "Max Set Weight Calls/Epoch",
          value: subnet.maximumSetWeightCallsPerEpoch,
        },
      ],
    },
    {
      title: "Economic Parameters",
      fields: [
        { label: "Founder Share", value: subnet.founderShare },
        { label: "Incentive Ratio", value: subnet.incentiveRatio },
        { label: "Subnet Emission", value: subnet.subnetEmission.toString() },
        { label: "Bonds MA", value: subnet.bondsMa },
        { label: "Immunity Period", value: subnet.immunityPeriod },
      ],
    },
    {
      title: "Governance Configuration",
      fields: [
        { label: "Proposal Cost", value: subnet.proposalCost.toString() },
        { label: "Proposal Expiration", value: subnet.proposalExpiration },
        { label: "Vote Mode", value: subnet.voteMode },
        {
          label: "Proposal Reward Treasury Allocation",
          value: subnet.proposalRewardTreasuryAllocation,
        },
        {
          label: "Max Proposal Reward Treasury Allocation",
          value: subnet.maxProposalRewardTreasuryAllocation.toString(),
        },
        {
          label: "Proposal Reward Interval",
          value: subnet.proposalRewardInterval,
        },
      ],
    },
    {
      title: "Burn Configuration",
      fields: [
        { label: "Min Burn", value: subnet.minBurn.toString() },
        { label: "Max Burn", value: subnet.maxBurn.toString() },
        { label: "Adjustment Alpha", value: subnet.adjustmentAlpha },
        {
          label: "Target Registrations Interval",
          value: subnet.targetRegistrationsInterval,
        },
        {
          label: "Target Registrations Per Interval",
          value: subnet.targetRegistrationsPerInterval,
        },
        {
          label: "Max Registrations Per Interval",
          value: subnet.maxRegistrationsPerInterval,
        },
      ],
    },
    {
      title: "Additional Information",
      fields: [
        {
          label: "Min Validator Stake",
          value: subnet.minValidatorStake?.toString(),
        },
        { label: "Max Allowed Validators", value: subnet.maxAllowedValidators },
        {
          label: "Created At",
          value: new Date(subnet.createdAt).toLocaleString(),
        },
        {
          label: "Deleted At",
          value: subnet.deletedAt
            ? new Date(subnet.deletedAt).toLocaleString()
            : "N/A",
        },
      ],
    },
  ];

  return (
    <div className="grid gap-6">
      {dataGroups.map((group, index) => (
        <div
          key={index}
          className="border border-white/20 bg-[#898989]/5 p-6 backdrop-blur-md"
        >
          <h3 className="mb-4 text-lg font-semibold">{group.title}</h3>
          <div className="grid gap-2">
            {group.fields.map((field, fieldIndex) => (
              <div key={fieldIndex} className="flex justify-between">
                <span className="text-white/70">{field.label}:</span>
                <span className="font-mono">{field.value ?? "N/A"}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
