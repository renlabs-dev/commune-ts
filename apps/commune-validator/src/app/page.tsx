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

import { useDelegateModuleStore } from "~/stores/delegateModuleStore";
import { useDelegateSubnetStore } from "~/stores/delegateSubnetStore";
import { api } from "~/trpc/react";
import { AreaChartGradient } from "./components/charts/area-chart";
import { BarChartTest } from "./components/charts/bar-chart";
import { PieChard } from "./components/charts/pie-chart";
import { DelegatedScroll } from "./components/delegated-scroll";
import { StatsCard } from "./components/stats-card";

const j = [
  {
    name: "string",
    staked: 456456456456,
    percentage: 30,
  },
  {
    name: "test",
    staked: 1231264564,
    percentage: 90,
  },
  {
    name: "test2",
    staked: 456456456456,
    percentage: 30,
  },
  {
    name: "test3",
    staked: 456456456456,
    percentage: 30,
  },
];

export default function Page() {
  const pathname = usePathname();
  const { selectedAccount } = useCommune();
  const { delegatedSubnets } = useDelegateSubnetStore();
  const { delegatedModules } = useDelegateModuleStore();

  const { data: modules } = api.module.all.useQuery();
  const { data: subnets } = api.subnet.all.useQuery();

  return (
    <>
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
        <div className="mb-4 flex w-full gap-3 border-b border-white/20 text-center">
          <div className="flex w-full animate-fade-down flex-col gap-4 pb-4 animate-delay-300 md:flex-row">
            <Button size="xl" className="w-full" asChild>
              <Link href="/modules">Modules</Link>
            </Button>
            <Button size="xl" className="w-full" asChild>
              <Link href="/weighted-modules">Weighted Modules</Link>
            </Button>
          </div>
          <div className="mb-4 border-l border-white/20" />
          <div className="flex w-full animate-fade-down flex-col gap-4 pb-4 animate-delay-300 md:flex-row">
            <Button
              asChild
              size="xl"
              className="w-full hover:border-cyan-500 hover:bg-background-cyan hover:text-cyan-500"
            >
              <Link href="/subnets">Subnets</Link>
            </Button>
            <Button
              asChild
              size="xl"
              className="w-full hover:border-cyan-500 hover:bg-background-cyan hover:text-cyan-500"
            >
              <Link href="/weighted-subnets">Weighted Subnets</Link>
            </Button>
          </div>
        </div>
        <div className="mb-4 flex w-full gap-3 border-b border-white/20">
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
          <div className="mb-4 border-l border-white/20" />
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
        <div className="grid w-full grid-cols-3 gap-3 pb-3">
          <BarChartTest />
          <PieChard />
          <AreaChartGradient />
        </div>
        <div className="p flex w-full gap-3 pb-4">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Your Selected Modules</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <DelegatedScroll data={j} />
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
              <DelegatedScroll data={j} />
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
    </>
  );
}
