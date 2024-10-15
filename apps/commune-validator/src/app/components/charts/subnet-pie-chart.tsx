"use client";

import * as React from "react";
import { ArrowTrendingUpIcon } from "@heroicons/react/16/solid";
import { Label, Pie, PieChart, Cell } from "recharts";

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
const generateColors = (numColors: number) => {
  const hueRanges = [
    { start: 0, end: 60 }, // Red to Yellow
    { start: 60, end: 120 }, // Yellow to Green
    { start: 120, end: 180 }, // Green to Cyan
    { start: 180, end: 240 }, // Cyan to Blue
    { start: 240, end: 300 }, // Blue to Magenta
    { start: 300, end: 360 }, // Magenta to Red
  ];

  const colors = [];

  for (let i = 0; i < numColors; i++) {
    const hueRange = hueRanges[i % hueRanges.length];
    const hue = Math.floor(
      hueRange.start + ((i / hueRanges.length) % 1) * (hueRange.end - hueRange.start)
    );
    const saturation = 70 + Math.random() * 30; // Random saturation between 70% and 100%
    const lightness = 50 + Math.random() * 20; // Random lightness between 50% and 70%
    const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    colors.push(color);
  }

  return colors;
};


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
  const totalStakeWeight = 100;
  const colors = React.useMemo(() => generateColors(50), []);
  // const colors = generateColors(50);
  const getFillColor = (index: number) => {
    return colors[index % colors.length];
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
