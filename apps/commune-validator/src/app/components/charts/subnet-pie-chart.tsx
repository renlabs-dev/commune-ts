"use client";

import * as React from "react";
import { ArrowTrendingUpIcon } from "@heroicons/react/16/solid";
import { Label, Pie, PieChart } from "recharts";

import type { ChartConfig } from "@commune-ts/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@commune-ts/ui";

export const description = "A donut chart with text";

const chartData_ = [
  { subnetName: "chrome", stakeWeight: 6, fill: "var(--color-subnetName)" },
  { subnetName: "safari", stakeWeight: 7, fill: "var(--color-safari)" },
  { subnetName: "firefox", stakeWeight: 2, fill: "var(--color-firefox)" },
  { subnetName: "edge", stakeWeight: 3, fill: "var(--color-edge)" },
  { subnetName: "other", stakeWeight: 6, fill: "var(--color-other)" },
];

interface SubnetData {
  subnetName: string;
  stakeWeight: number;
  percWeight: number;
}

interface SubnetPieChartProps {
  chartData: SubnetData[];
}
const chartConfig = {
  stakeWeight: {
    label: "stakeWeight",
  },
  subnetName: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
  firefox: {
    label: "Firefox",
    color: "hsl(var(--chart-3))",
  },
  edge: {
    label: "Edge",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export function SubnetPieChart({ chartData }: SubnetPieChartProps) {
  // const totalStakeWeight = React.useMemo(() => {
  //   return chartData_.reduce((acc, curr) => acc + curr.stakeWeight, 0);
  // }, []);
  //console.log(chartData);
  const totalStakeWeight = 100;
  const filledData = chartData.map((data) => ({
    ...data,
    fill: "hsl(var(--chart-1))",
  }));

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Current Subnet Allocation</CardTitle>
        <CardDescription>
          Showing total stakeWeight for the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="stakeWeight"
              nameKey="subnetName"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalStakeWeight.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) + 24}
                          className="fill-muted-foreground"
                        >
                          stakeWeight
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month{" "}
          <ArrowTrendingUpIcon className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total stakeWeight for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}
