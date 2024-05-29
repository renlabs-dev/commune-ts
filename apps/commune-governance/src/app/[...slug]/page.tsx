export const runtime = "edge";

import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { ExpandedView } from "./_components/expanded-view";

export default function CardView({ params }: { params: { slug: string } }) {
  const paramsInfo = {
    id: Number(params.slug[1]),
    contentType: params.slug[0]?.toLowerCase(),
  };

  return (
    <div className="flex flex-col max-w-6xl px-4 mx-auto ">
      <Link
        href={"/"}
        className="flex items-center justify-center gap-2 px-5 py-3 my-6 text-gray-400 border border-gray-500 w-fit hover:border-green-500 hover:text-green-500 "
      >
        <ArrowLeftIcon className="h-6 text-green-500" />
        Go Back to Proposals List
      </Link>
      <div className="flex flex-col justify-between w-full mb-6 text-white border border-gray-500 divide-gray-500 border-x-none lg:flex-row lg:divide-x xl:border-x ">
        <ExpandedView
          contentType={paramsInfo.contentType ?? ""}
          paramId={paramsInfo.id}
        />
      </div>
    </div>
  );
}
