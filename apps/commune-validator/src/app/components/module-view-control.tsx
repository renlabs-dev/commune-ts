export default function ModuleViewControl() {
  return (
    <div className="flex w-full animate-fade-down flex-col gap-4 border-b border-white/20 pb-4 animate-delay-300 md:flex-row">
      <button className="w-full gap-2 border border-white/20 bg-[#898989]/5 p-3 text-center text-lg text-white transition duration-200 hover:border-green-500 hover:bg-green-500/10">
        All
      </button>
      <button className="w-full gap-2 border border-white/20 bg-[#898989]/5 p-3 text-center text-lg text-white transition duration-200 hover:border-green-500 hover:bg-green-500/10">
        Popular
      </button>
      <button className="w-full gap-2 border border-white/20 bg-[#898989]/5 p-3 text-center text-lg text-white transition duration-200 hover:border-green-500 hover:bg-green-500/10">
        Weighted
      </button>
    </div>
  );
}
