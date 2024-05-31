export function FooterDivider(): JSX.Element {
  return (
    <div className="space-y-4 border-y border-gray-500 bg-black/50 p-4 px-4 xl:px-0">
      <div className="mx-auto max-w-screen-2xl">
        <div className="flex w-full items-center justify-between text-left">
          <div className="flex w-full flex-col py-6">
            <p className="font-medium text-gray-400">
              Want to change something?
            </p>
            <h2 className="text-3xl font-medium text-white lg:text-5xl">
              Create a new
              <span className="text-green-500 font-thin"> proposal</span>
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
