"use client";

import * as React from "react";
import { ArrowTrendingUpIcon } from "@heroicons/react/16/solid";
import { Cell, Label, Pie, PieChart } from "recharts";

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

const chartColors = [
  "hsl(var(--chart-secondary-1))",
  "hsl(var(--chart-secondary-2))",
  "hsl(var(--chart-secondary-3))",
  "hsl(var(--chart-secondary-4))",
  "hsl(var(--chart-secondary-5))",
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
} satisfies ChartConfig;

export function SubnetPieChart({ chartData }: SubnetPieChartProps) {
  const totalStakeWeight = 100;

  const getFillColor = (index: number) => {
    return chartColors[index % chartColors.length];
  };

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
              dataKey="percWeight"
              nameKey="subnetName"
              innerRadius={60}
              strokeWidth={5}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getFillColor(index)} />
              ))}
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
          Other Subnets: 5.2%
          <ArrowTrendingUpIcon className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total stake allocation for the last block
        </div>
      </CardFooter>
    </Card>
  );
}
