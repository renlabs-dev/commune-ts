import React from "react";

interface StepperCardProps {
  item: number;
  description: string;
}

const StepperCard: React.FC<StepperCardProps> = ({ description, item }) => {
  return (
    <div>
      <p className="mb-2 text-gray-400">
        <b className="text-white">{item + 1}.</b> {description}
      </p>
    </div>
  );
};

export default StepperCard;
