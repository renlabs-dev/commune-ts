import { Card } from "./card";

export function CardSkeleton(): JSX.Element {
  return (
    <Card.Root>
      <Card.Header className="flex-col-reverse">
        <span className="w-3/5 animate-pulse bg-gray-700 py-3" />
        <div className="mb-2 flex w-2/12 flex-row-reverse justify-end gap-2 md:mb-0 md:ml-auto md:flex-row lg:w-2/12 lg:justify-end">
          <span className="w-full animate-pulse bg-gray-700 py-3.5" />
        </div>
      </Card.Header>
      <Card.Body>
        <div className="space-y-1 pb-2 md:pb-6">
          <span className="flex w-full animate-pulse bg-gray-700 py-2.5" />
          <span className="flex w-full animate-pulse bg-gray-700 py-2.5" />
          <span className="flex w-full animate-pulse bg-gray-700 py-2.5" />
          <span className="flex w-2/4 animate-pulse bg-gray-700 py-2.5" />
        </div>

        <div className="flex w-full flex-col items-start justify-between md:flex-row md:items-center">
          <div className="mt-2 flex w-full space-x-2 pb-4 text-gray-500 md:pb-0">
            <span className="flex w-6/12 animate-pulse bg-gray-700 py-2.5" />
          </div>

          <div className="mt-4 flex w-full flex-col-reverse justify-center gap-2 md:mt-0 md:flex-row md:justify-end">
            <span className="flex w-full animate-pulse bg-gray-700 py-3.5 md:w-3/12" />

            <div className="w-7/12 text-center font-medium">
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
}
