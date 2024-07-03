"use client";

import React from "react";

import Stepper from "./components/Stepper";

const steps = {
  "Q3 2024": [
    {
      title: "Step 1",
      description: "Step 1 description",
    },
    {
      title: "Step 2",
      description: "Step 2 description",
    },
    {
      title: "Step 3",
      description: "Step 3 description",
    },
    {
      title: "Step 4",
      description: "Step 4 description",
    },
    {
      title: "Step 5",
      description: "Step 5 description",
    },
  ],
  "Q4 2024": [
    {
      title: "X 1",
      description: "Step 1 description",
    },
    {
      title: "Y 2",
      description: "Step 2 description",
    },
    {
      title: "Z 3",
      description: "Step 3 description",
    },
  ],
};
export default function HomePage(): JSX.Element {
  return (
    <div className="App">
      <Stepper steps={steps} />
    </div>
  );
}
