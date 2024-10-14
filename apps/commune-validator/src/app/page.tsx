"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartPieIcon,
  CircleStackIcon,
  Squares2X2Icon,
  SquaresPlusIcon,
} from "@heroicons/react/24/outline";

import { useCommune } from "@commune-ts/providers/use-commune";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Container,
} from "@commune-ts/ui";
import { fromNano } from "@commune-ts/utils";

import { useDelegateModuleStore } from "~/stores/delegateModuleStore";
import { useDelegateSubnetStore } from "~/stores/delegateSubnetStore";
import { api } from "~/trpc/react";
import { separateTopNModules } from "./components/charts/_common";
import { CombinedAreaChart } from "./components/charts/combined-area-chart";
import { ModuleBarChart } from "./components/charts/module-bar-chart";
import { SubnetPieChart } from "./components/charts/subnet-pie-chart";
import { DelegatedScroll } from "./components/delegated-scroll";
import { StatsCard } from "./components/stats-card";

function _repeatUntil<T>(total: number, xs: T[]) {
  const result: T[] = [];
  for (let i = 0; i < total; i++) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    result.push(xs[i % xs.length]!);
  }
  return result;
}

export default function Page() {
  const pathname = usePathname();
  const { selectedAccount } = useCommune();

  // Modules Logic
  const { delegatedModules } = useDelegateModuleStore();

  const { data: modules } = api.module.all.useQuery();
  const { data: computedWeightedModules } =
    api.module.allComputedModuleWeightsLastBlock.useQuery();

  const moduleStakeData = computedWeightedModules
    ? separateTopNModules(8)(computedWeightedModules)
        // .sort((a, b) => Number(b.stakeWeight - a.stakeWeight))
        .map((module) => {
          return {
            moduleName: module.moduleName ?? "",
            stakeWeight: String(module.stakeWeight),
            percWeight: module.percWeight * 100,
          };
        })
    : null;

  const delegatedModulesData = delegatedModules.map((module) => ({
    name: module.name,
    percentage: module.percentage,
  }));

  // Subnets Logic
  const { delegatedSubnets } = useDelegateSubnetStore();

  const { data: subnets } = api.subnet.all.useQuery();

  const { data: computedWeightedSubnets } =
    api.subnet.allComputedSubnetWeightsLastBlock.useQuery();
  console.log(computedWeightedSubnets);
  const subnetData = computedWeightedSubnets?.map((s) => ({
    stakeWeight: parseInt(fromNano(s.stakeWeight)),
    subnetName: s.subnetName,
    percWeight: s.percWeight,
  }));

  console.log("subnetStakeData", subnetData);

  const delegatedSubnetsData = delegatedSubnets.map((subnet) => ({
    name: subnet.name,
    percentage: subnet.percentage,
  }));

  return (
    <Container>
      <div className="my-20 flex w-full flex-col gap-3 pb-4 text-gray-100">
        <h3 className="inline-flex w-fit animate-fade-down border border-white/20 bg-[#898989]/5 px-2 py-0.5 animate-delay-100 md:text-xl">
          Welcome to the Community Validator
        </h3>
        <h1 className="animate-fade-down text-2xl font-semibold animate-delay-500 md:text-4xl">
          Interact with modules, validators and subnets created by the{" "}
          <span
            className={`${pathname === "/subnets" || pathname === "/weighted-subnets" ? "text-cyan-500" : "text-green-500"}`}
          >
            community
          </span>
          .
        </h1>
      </div>
      <div className="mb-4 flex w-full flex-col border-b border-white/20 text-center md:flex-row md:gap-3">
        <div className="flex w-full animate-fade-down flex-col gap-4 pb-4 animate-delay-300 md:flex-row">
          <Button size="xl" className="w-full" asChild>
            <Link href="/modules">Modules</Link>
          </Button>
          <Button size="xl" className="w-full" asChild>
            <Link href="/weighted-modules">Weighted Modules</Link>
          </Button>
        </div>
        <div className="mb-4 hidden border-l border-white/20 md:block" />
        <div className="flex w-full animate-fade-down flex-col gap-4 pb-4 animate-delay-300 md:flex-row">
          <Button
            asChild
            size="xl"
            className="w-full hover:border-cyan-500 hover:bg-background-cyan hover:text-cyan-500 active:bg-cyan-500/30"
          >
            <Link href="/subnets">Subnets</Link>
          </Button>
          <Button
            asChild
            size="xl"
            className="w-full hover:border-cyan-500 hover:bg-background-cyan hover:text-cyan-500 active:bg-cyan-500/30"
          >
            <Link href="/weighted-subnets">Weighted Subnets</Link>
          </Button>
        </div>
      </div>
      <div className="mb-4 flex w-full flex-col border-b border-white/20 md:flex-row md:gap-3">
        <div className="flex w-full animate-fade-down flex-col gap-4 pb-4 animate-delay-500 md:flex-row">
          <StatsCard
            Icon={Squares2X2Icon}
            text="Total Modules"
            value={`${modules?.length ? modules.length : 0}`}
            color="green"
          />
          <StatsCard
            Icon={SquaresPlusIcon}
            text="Your Modules"
            value={`${delegatedModules.length}`}
            color="green"
          />
        </div>
        <div className="mb-4 hidden border-l border-white/20 md:block" />
        <div className="flex w-full animate-fade-down flex-col gap-4 pb-4 animate-delay-500 md:flex-row">
          <StatsCard
            Icon={CircleStackIcon}
            text="Total Subnets"
            value={`${subnets?.length ? subnets.length : 0}`}
            color="cyan"
          />
          <StatsCard
            Icon={ChartPieIcon}
            text="Your Subnets"
            value={`${delegatedSubnets.length}`}
            color="cyan"
          />
        </div>
      </div>
      <div className="gird-cols-1 grid w-full gap-3 pb-3 md:grid-cols-3">
        {moduleStakeData ? (
          <ModuleBarChart chartData={moduleStakeData} />
        ) : (
          <></>
        )}
        {subnetData ? <SubnetPieChart chartData={subnetData} /> : <></>}
        <CombinedAreaChart />
      </div>
      <div className="p flex w-full flex-col gap-3 pb-4 md:flex-row">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Your Selected Modules</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {selectedAccount && delegatedModulesData.length ? (
              <DelegatedScroll data={delegatedModulesData} />
            ) : (
              <p>
                {delegatedModulesData.length
                  ? "Connect your wallet to view your modules."
                  : "You have not selected any modules."}
              </p>
            )}
            <Button size="xl" className="w-full" asChild>
              <Link href="/modules">Edit Your Module List</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Your Selected Subnets</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {selectedAccount && delegatedSubnetsData.length ? (
              <DelegatedScroll data={delegatedSubnetsData} />
            ) : (
              <p>
                {delegatedSubnetsData.length
                  ? "Connect your wallet to view your subnets."
                  : "You have not selected any subnets."}
              </p>
            )}
            <Button
              size="xl"
              className="w-full hover:border-cyan-500 hover:bg-background-cyan hover:text-cyan-500"
              asChild
            >
              <Link href="/subnets">Edit Your Subnet List</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
