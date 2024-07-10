"use client";

import { roadmapData } from "~/roadmap-data";
import Stepper from "./components/Stepper";

export default function HomePage(): JSX.Element {
  return (
    <div className="mx-auto max-w-screen-2xl px-4">
      <Stepper steps={roadmapData} />
    </div>
  );
}
