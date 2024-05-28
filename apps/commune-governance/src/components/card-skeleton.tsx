import { Card } from "./card";

export const CardSkeleton = () => {
  return (
    <Card.Root>
      <Card.Header className="flex-col-reverse">
        <span className="w-3/5 py-3 bg-gray-700 animate-pulse" />
        <div className="flex flex-row-reverse justify-end w-2/12 gap-2 mb-2 md:mb-0 md:ml-auto md:flex-row lg:w-2/12 lg:justify-end">
          <span className="w-full animate-pulse bg-gray-700 py-3.5" />
        </div>
      </Card.Header>
      <Card.Body>
        <div className="pb-2 space-y-1 md:pb-6">
          <span className="flex w-full animate-pulse bg-gray-700 py-2.5" />
          <span className="flex w-full animate-pulse bg-gray-700 py-2.5" />
          <span className="flex w-full animate-pulse bg-gray-700 py-2.5" />
          <span className="flex w-2/4 animate-pulse bg-gray-700 py-2.5" />
        </div>

        <div className="flex flex-col items-start justify-between w-full md:flex-row md:items-center">
          <div className="flex w-full pb-4 mt-2 space-x-2 text-gray-500 md:pb-0">
            <span className="flex w-6/12 animate-pulse bg-gray-700 py-2.5" />
          </div>

          <div className="flex flex-col-reverse justify-center w-full gap-2 mt-4 md:mt-0 md:flex-row md:justify-end">
            <span className="flex w-full animate-pulse bg-gray-700 py-3.5 md:w-3/12" />

            <div className="w-7/12 font-medium text-center">
              <span className="flex animate-pulse bg-gray-700 py-3.5 lg:w-full" />
            </div>
          </div>
        </div>
        <div className="flex justify-center pt-4 md:justify-start md:pt-2">
          <span className="flex w-4/12 animate-pulse bg-gray-700 py-2.5" />
        </div>
      </Card.Body>
    </Card.Root>
  );
};
