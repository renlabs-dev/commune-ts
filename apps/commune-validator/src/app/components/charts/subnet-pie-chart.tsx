"use client";

import * as React from "react";
import { Cell, Pie, PieChart } from "recharts";

import type { ChartConfig } from "@commune-ts/ui";
import {
  Card,
  CardContent,
  CardDescription,
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
  percFormat: string;
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
          className="mx-auto aspect-square max-h-[350px]"
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
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
