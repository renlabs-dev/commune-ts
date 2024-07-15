import React from "react";

interface StepperCardProps {
  description: string;
}

const StepperCard: React.FC<StepperCardProps> = ({ description }) => {
  return (
    <div className="border border-white/20 bg-[#898989]/5 p-8 backdrop-blur-md">
      <p className="text-gray-400">{description}</p>
    </div>
  );
};

export default StepperCard;
