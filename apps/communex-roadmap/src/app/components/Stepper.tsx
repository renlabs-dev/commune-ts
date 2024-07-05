import React, { useState } from "react";
import {
  ChevronDoubleDownIcon,
  ChevronDoubleRightIcon,
  ChevronDoubleUpIcon,
} from "@heroicons/react/20/solid";

import StepperCard from "./StepperCard";

interface Step {
  title: string;
  description: string;
}

interface Quarter {
  current: boolean;
  steps: Step[];
}

interface StepperProps {
  steps: Record<string, Quarter>;
}

const Stepper: React.FC<StepperProps> = ({ steps }) => {
  const stepTitles = Object.keys(steps);
  const currentQuarterIndex = stepTitles.findIndex(
    (title) => steps[title]?.current,
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

  const renderStepperCards = (stepCards: Step[]) => {
    return (
      <div className="animate-fade-right animate-delay-300 mb-16 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stepCards.map((card, index) => (
          <StepperCard
            key={index}
            title={card.title}
            description={card.description}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="animate-fade-down ml-4 border-l border-dashed p-4 text-white">
      <div className="my-20 ml-4 flex flex-col gap-3">
        <h3 className="animate-fade-down animate-delay-200 inline-flex w-fit border border-white/20 bg-[#898989]/5 px-2 py-0.5 md:text-xl">
          Welcome to the CommuneX Roadmap
        </h3>
        <h1 className="animate-fade-down animate-delay-500 text-2xl font-semibold md:text-4xl">
          Unveiling our road ahead for the{" "}
          <span className="text-green-600">community</span>.
        </h1>
      </div>
      <div className="mb-12">
        {stepTitles.map((title, index) => (
          <div
            key={title}
            className="animate-fade-down animate-delay-1000 flex items-start"
          >
            <div className="mr-4 flex flex-col items-center">
              <div
                className={`absolute mr-9 flex h-12 w-12 items-center justify-center rounded-full ${
                  index < currentStepIndex
                    ? "shadow-custom-green bg-green-600/10 text-white"
                    : index === currentStepIndex
                      ? "shadow-custom-white bg-white/10"
                      : "shadow-custom-gray bg-gray-300/10"
                }`}
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full ${
                    index < currentStepIndex
                      ? "shadow-custom-green bg-green-600"
                      : index === currentStepIndex
                        ? "shadow-custom-white bg-white"
                        : "shadow-custom-gray bg-gray-300"
                  }`}
                >
                  {index < currentStepIndex ? (
                    <ChevronDoubleUpIcon className="h-5 w-5 fill-black" />
                  ) : index === currentStepIndex ? (
                    <ChevronDoubleRightIcon className="h-5 w-5 fill-black" />
                  ) : (
                    <ChevronDoubleDownIcon className="h-5 w-5 fill-black" />
                  )}
                </div>
              </div>
              {index < stepTitles.length - 1 && (
                <div className="my-2 h-full w-1 bg-gray-300" />
              )}
            </div>
            <div className="animate-fade-right flex-1">
              <h2 className="animate-fade-right animate-delay-100 mb-6 mt-2.5 text-xl font-semibold">
                {title}
              </h2>
              {index === currentStepIndex &&
                renderStepperCards(steps[title]?.steps ?? [])}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-3">
        <button
          onClick={handlePrevious}
          disabled={currentStepIndex === 0}
          className="inline-flex items-center justify-center gap-3 border border-white/20 bg-[#898989]/5 px-4 py-2 text-gray-400 backdrop-blur-md hover:border-green-600 hover:bg-green-600/5 hover:text-green-600"
        >
          Previous Quarter
        </button>
        <button
          onClick={handleNext}
          disabled={currentStepIndex === stepTitles.length - 1}
          className="inline-flex items-center justify-center gap-3 border border-white/20 bg-[#898989]/5 px-4 py-2 text-gray-400 backdrop-blur-md hover:border-green-600 hover:bg-green-600/5 hover:text-green-600"
        >
          Next Quarter
        </button>
      </div>
    </div>
  );
};

export default Stepper;
