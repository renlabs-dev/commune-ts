import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

// TODO: Delegation logic
export function DelegateModulePercentage() {
  return (
    <div className="flex items-center gap-2 border border-white/20 bg-[#898989]/5 px-2 backdrop-blur-md">
      <button>
        <ChevronDownIcon className="h-5 w-5 text-red-500" />
      </button>
      <div className="flex items-center justify-center border-x border-white/20 px-2 py-2">
        100%
      </div>
      <ChevronUpIcon className="h-5 w-5 text-green-500" />
    </div>
  );
}
