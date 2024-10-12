"use client";

import type { ChartConfig } from "node_modules/@commune-ts/ui/src/components/chart";
import { ArrowTrendingUpIcon } from "@heroicons/react/24/outline";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

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

export const description = "A bar chart with a custom label";

const chartData = [
  { month: "yama-test", desktop: 186, mobile: 80 },
  { month: "rootnet1", desktop: 305, mobile: 200 },
  { month: "chop", desktop: 237, mobile: 120 },
  { month: "testing", desktop: 73, mobile: 190 },
  { month: "unattentively", desktop: 209, mobile: 130 },
  { month: "magnificos", desktop: 214, mobile: 140 },
  { month: "manqu", desktop: 214, mobile: 120 },
  { month: "global", desktop: 123, mobile: 111 },
  { month: "fratchety", desktop: 144, mobile: 300 },
  { month: "exceptious", desktop: 250, mobile: 23 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
  label: {
    color: "hsl(var(--background))",
  },
} satisfies ChartConfig;

export function BarChartTest() {
  return (
    <Card className="h-full w-full">
      <CardHeader className="items-center">
        <CardTitle>Current Module Allocation</CardTitle>
        <CardDescription>Most Stake percentage allocated</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              right: 16,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="month"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
              tickFormatter={(value) => value.slice(0, 3)}
              hide
            />
            <XAxis dataKey="desktop" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="desktop"
              layout="vertical"
              fill="var(--color-desktop)"
              radius={4}
              barSize={164}
            >
              <LabelList
                dataKey="month"
                position="insideLeft"
                offset={8}
                className="fill-[--color-label]"
                fontSize={12}
              />
              <LabelList
                dataKey="desktop"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          5.2% Other Modules
          <ArrowTrendingUpIcon className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          From 9/24 to Today
        </div>
      </CardFooter>
    </Card>
  );
}
