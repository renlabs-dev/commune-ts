import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { DaoExpandedView } from "./_components/dao-expanded-view";

export const runtime = "edge";

export default function CardView({
  params,
}: {
  params: { id: string };
}): JSX.Element {
  if (!params.id) {
    return <div>Not Found</div>;
  }

  return (
    <div className="mx-auto flex max-w-screen-2xl flex-col px-4">
      <Link
        className="my-6 flex w-fit items-center justify-center gap-2 border border-gray-500 px-5 py-3 text-gray-400 hover:border-green-500 hover:text-green-500"
        href="/"
      >
        <ArrowLeftIcon className="h-6 text-green-500" />
        Go Back to Proposals List
      </Link>
      <div className="border-x-none mb-6 flex w-full flex-col justify-between divide-gray-500 border border-gray-500 text-white lg:flex-row lg:divide-x xl:border-x">
        <DaoExpandedView paramId={Number(params.id)} />
      </div>
    </div>
  );
}
