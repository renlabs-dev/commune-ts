"use client"
import { CreateProposal } from "./create-proposal";

export function FooterDivider(): JSX.Element {
  return (
    <div className="w-full mx-auto mb-14">
      <div className="flex flex-col justify-between w-full text-left lg:items-center lg:flex-row">
        <div className="flex flex-col w-full py-6">
          <p className="font-medium text-gray-400">
            Want to change something?
          </p>
          <h2 className="text-3xl font-medium text-white lg:text-5xl">
            Create a new
            <span className="font-thin text-green-500"> proposal</span>
          </h2>
        </div>
        <div className="w-full lg:w-1/4">
          <CreateProposal />
        </div>
      </div>
    </div>
  );
}
