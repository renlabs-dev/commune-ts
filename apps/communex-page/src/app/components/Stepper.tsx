import React, { useState } from "react";
import {
  ChevronDoubleDownIcon,
  ChevronDoubleRightIcon,
  ChevronDoubleUpIcon,
} from "@heroicons/react/20/solid";
import { BackwardIcon, ForwardIcon } from "@heroicons/react/24/outline";

import type { RoadmapDataType } from "~/roadmap-data";
import StepperCard from "./StepperCard";

const Stepper = ({ steps }: { steps: RoadmapDataType }) => {
  const stepTitles = Object.keys(steps);
  const currentQuarterIndex = stepTitles.findIndex(
    (title) => steps[title]?.date === "current",
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(
    currentQuarterIndex !== -1 ? currentQuarterIndex : 0,
  );

  const handlePrevious = () => {
    setCurrentStepIndex((prevIndex) => Math.max(0, prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentStepIndex((prevIndex) =>
      Math.min(stepTitles.length - 1, prevIndex + 1),
    );
  };

  const handleStepClick = (index: number) => {
    setCurrentStepIndex(index);
  };

  const renderStepperCards = (stepCards: string[] = []) => {
    return (
      <div className="mb-24 grid animate-fade-right grid-cols-1 gap-4 animate-delay-300 md:grid-cols-2 lg:grid-cols-3">
        {stepCards.map((card, index) => (
          <StepperCard key={index} description={card} />
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="ml-4 min-h-screen animate-fade-down border-l border-dashed p-4 text-white">
        <div className="my-20 ml-4 flex flex-col gap-3">
          <h3 className="inline-flex w-fit animate-fade-down border border-white/20 bg-[#898989]/5 px-2 py-0.5 animate-delay-200 md:text-xl">
            Welcome to the CommuneX Roadmap
          </h3>
          <h1 className="animate-fade-down text-2xl font-semibold animate-delay-500 md:text-4xl">
            Unveiling our road ahead for the{" "}
            <span className="text-green-600">community</span>.
          </h1>
        </div>
        <div className="mb-12">
          {stepTitles.map((title, index) => {
            const item = steps[title];
            return (
              <div
                key={title}
                className="flex animate-fade-down items-start animate-delay-1000"
              >
                <div className="mr-4 flex flex-col items-center">
                  <button
                    onClick={() => handleStepClick(index)}
                    className={`absolute mr-9 flex h-12 w-12 items-center justify-center rounded-full ${
                      item?.date === "past"
                        ? "shadow-custom-green bg-green-600/10 text-white"
                        : item?.date === "current"
                          ? "shadow-custom-white bg-white/10"
                          : "shadow-custom-gray bg-gray-300/10"
                    }`}
                  >
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full ${
                        item?.date === "past"
                          ? "shadow-custom-green bg-green-600"
                          : item?.date === "current"
                            ? "shadow-custom-white bg-white"
                            : "shadow-custom-gray bg-gray-300"
                      }`}
                    >
                      {item?.date === "past" ? (
                        <ChevronDoubleUpIcon className="h-5 w-5 fill-black" />
                      ) : item?.date === "current" ? (
                        <ChevronDoubleRightIcon className="h-5 w-5 fill-black" />
                      ) : (
                        <ChevronDoubleDownIcon className="h-5 w-5 fill-black" />
                      )}
                    </div>
                  </button>
                  {index < stepTitles.length - 1 && (
                    <div className="my-2 h-full w-1 bg-gray-300" />
                  )}
                </div>
                <div className="flex-1 animate-fade-right">
                  <h2 className="mb-1 animate-fade-right text-xl font-semibold animate-delay-100">
                    {title}
                  </h2>
                  <p className="mb-10 text-gray-400">{item?.description}</p>
                  {index === currentStepIndex &&
                    renderStepperCards(item?.steps)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="fixed bottom-20 right-6 flex gap-3">
        <button
          onClick={handlePrevious}
          disabled={currentStepIndex === 0}
          className="inline-flex animate-fade-up items-center justify-center gap-2 border border-white/20 bg-[#898989]/5 px-3 py-2 text-gray-400 backdrop-blur-md animate-delay-200 hover:border-green-600 hover:bg-green-600/5 hover:text-green-600"
        >
          <BackwardIcon className="h-5 w-5 text-green-500" /> Previous Quarter
        </button>
        <button
          onClick={handleNext}
          disabled={currentStepIndex === stepTitles.length - 1}
          className="animate-fade-in inline-flex items-center justify-center gap-3 border border-white/20 bg-[#898989]/5 px-3 py-2 text-gray-400 backdrop-blur-md animate-delay-200 hover:border-green-600 hover:bg-green-600/5 hover:text-green-600"
        >
          Next Quarter <ForwardIcon className="h-5 w-5 text-green-500" />
        </button>
      </div>
    </>
  );
};

export default Stepper;
