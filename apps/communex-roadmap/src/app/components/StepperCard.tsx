import React from "react";

interface StepperCardProps {
  title: string;
  description: string;
}

const StepperCard: React.FC<StepperCardProps> = ({ title, description }) => {
  return (
    <div className="border border-white/20 bg-[#898989]/5 p-8 backdrop-blur-md">
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
};

export default StepperCard;
