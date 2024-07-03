import React, { useState } from "react";

import StepperCard from "./StepperCard";

interface Step {
  title: string;
  description: string;
}

interface StepperProps {
  steps: Record<string, Step[]>;
}

const Stepper: React.FC<StepperProps> = ({ steps }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const stepTitles = Object.keys(steps);

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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
    <div className="mx-auto max-w-screen-2xl p-4 text-white">
      <div className="mb-8">
        {stepTitles.map((title, index) => (
          <div key={title} className="mb-8 flex items-start">
            <div className="mr-4 flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  index <= currentStepIndex
                    ? "bg-green-600 text-white"
                    : "bg-gray-300"
                }`}
              >
                {index + 1}
              </div>
              {index < stepTitles.length - 1 && (
                <div className="my-2 h-full w-1 bg-gray-300"></div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="mb-2 text-xl font-semibold">{title}</h2>
              {index === currentStepIndex &&
                renderStepperCards(steps[title] ?? [])}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStepIndex === 0}
          className="inline-flex items-center justify-center gap-3 border border-white/20 bg-[#898989]/5 px-4 py-2 text-gray-400 backdrop-blur-md hover:border-green-600 hover:bg-green-600/5 hover:text-green-600"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentStepIndex === stepTitles.length - 1}
          className="inline-flex items-center justify-center gap-3 border border-white/20 bg-[#898989]/5 px-4 py-2 text-gray-400 backdrop-blur-md hover:border-green-600 hover:bg-green-600/5 hover:text-green-600"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Stepper;
