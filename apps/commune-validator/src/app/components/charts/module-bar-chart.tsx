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

interface ModuleData {
  moduleName: string;
  stakeWeight: string;
  percWeight: number;
  percFormat: string;
}

interface ModuleBarChartProps {
  chartData: ModuleData[];
}

const chartConfig = {
  percWeight: {
    label: "Stake",
    color: "hsl(var(--chart-1))",
  },
  label: {
    color: "hsl(var(--background))",
  },
} satisfies ChartConfig;

export function ModuleBarChart({ chartData }: ModuleBarChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Module Allocation</CardTitle>
        <CardDescription>
          Showing aggregated module allocation from user inputs.
        </CardDescription>
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
              dataKey="moduleName"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
              tickFormatter={(value) => value.slice(0, 3)}
              hide
            />
            <XAxis dataKey="percWeight" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="percWeight"
              layout="vertical"
              fill="var(--color-percWeight)"
              radius={4}
            >
              <LabelList
                dataKey="moduleName"
                position="insideLeft"
                offset={8}
                className="fill-[--color-label]"
                fontSize={12}
              />
              <LabelList
                dataKey="percFormat"
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
          Trending up by 5.2% this month{" "}
          <ArrowTrendingUpIcon className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}
