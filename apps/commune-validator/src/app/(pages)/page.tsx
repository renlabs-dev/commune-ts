import {
  ChartPieIcon,
  CircleStackIcon,
  Squares2X2Icon,
  SquaresPlusIcon,
} from "@heroicons/react/24/outline";

import { AreaChartGradient } from "../components/charts/area-chart";
import { BarChartTest } from "../components/charts/bar-chart";
import { PieChard } from "../components/charts/pie-chart";
import { StatsCard } from "../components/stats-card";

export default function Page() {
  return (
    <>
      <div className="grid w-full grid-cols-4 gap-3 pb-3">
        <StatsCard
          Icon={Squares2X2Icon}
          text="Total Modules"
          value="400"
          color="green"
        />
        <StatsCard
          Icon={SquaresPlusIcon}
          text="Your Modules"
          value="24"
          color="green"
        />
        <StatsCard
          Icon={CircleStackIcon}
          text="Total Subnets"
          value="12"
          color="cyan"
        />
        <StatsCard
          Icon={ChartPieIcon}
          text="Your Subnets"
          value="24"
          color="cyan"
        />
      </div>
      <div className="grid w-full grid-cols-3 gap-3 pb-6">
        <BarChartTest />
        <PieChard />
        <AreaChartGradient />
      </div>
    </>
  );
}
