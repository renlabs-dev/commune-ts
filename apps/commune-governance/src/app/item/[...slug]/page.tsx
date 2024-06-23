import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";

import { ExpandedView } from "./_components/expanded-view";

export const runtime = "edge";

export default function CardView({
  params,
}: {
  params: { slug: string[] };
}): JSX.Element {
  if (!params.slug[0] || !params.slug[1]) {
    return <div>Not Found</div>;
  }

  const contentType = params.slug[0];
  const id = Number(params.slug[1]);

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
        <ExpandedView contentType={contentType} paramId={id} />
      </div>
    </div>
  );
}
