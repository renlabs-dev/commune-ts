import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";

import { fetchCustomMetadata } from "@commune-ts/providers/hooks";
import { MarkdownView } from "@commune-ts/ui/markdown-view";
import { smallAddress } from "@commune-ts/utils";

import { api } from "~/trpc/server";

// export const runtime = "edge";

interface Params {
  params: {
    slug: string[];
  };
}

interface CustomMetadata {
  Ok?: {
    title?: string;
    body?: string;
  };
}

export default async function ModulePage({ params }: Params) {
  const { slug } = params;

  if (slug.length !== 1) {
    notFound();
  }

  const id = slug[0];

  if (!/^\d+$/.test(String(id))) {
    notFound();
  }

  const mdl = await api.module.byId({ id: Number(id) });

  if (!mdl) {
    notFound();
  }

  const metadata = (await fetchCustomMetadata(
    "proposal",
    mdl.id,
    mdl.metadataUri ?? "",
  )) as CustomMetadata;

  const title = metadata.Ok?.title ?? "No Metadata";
  // limited to 140 characters
  const description = metadata.Ok?.body ?? "This module has no custom metadata";

  return (
    <div className="container mx-auto p-4 pb-28 text-white">
      <div className="my-16 flex w-full items-center justify-between">
        <Link
          href="/"
          className="absolute z-10 flex animate-fade-left items-center gap-1 border border-white/20 bg-[#898989]/5 p-2 pr-3 text-white backdrop-blur-md transition duration-200 hover:border-green-500 hover:bg-green-500/10"
        >
          <ArrowLeftIcon className="h-5 w-5 text-green-500" />
          Go back to modules list
        </Link>
        <h1 className="flex-grow animate-fade-right text-center text-3xl font-semibold">
          {title}
        </h1>
      </div>
      <div className="flex flex-col-reverse gap-6 md:flex-row">
        <div className="animate-fade-down animate-delay-300 md:w-[60%] xl:w-[70%]">
          <div className="border border-white/20 bg-[#898989]/5 p-8 backdrop-blur-md">
            <h2 className="mb-4 text-xl font-semibold">Description</h2>
            <MarkdownView source={description} />
          </div>
        </div>
        <div className="flex animate-fade-down flex-col gap-6 animate-delay-500 md:w-[40%] xl:w-[30%]">
          <div className="flex justify-between border border-white/20 bg-[#898989]/5 p-8 backdrop-blur-md">
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-gray-400">Publication Date</h2>
                <span>{new Date(mdl.createdAt).toLocaleString()}</span>
              </div>
              <div>
                <h2 className="text-gray-400">Address</h2>
                <span>{smallAddress(String(mdl.moduleKey))}</span>
              </div>
              <div>
                <h2 className="text-gray-400">Emission</h2>
                <span>{mdl.emission ?? 0}</span>
              </div>
              <div>
                <h2 className="text-gray-400">Total Stakers</h2>
                <span>{mdl.totalStakers ?? 0}</span>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-gray-400">Category</h2>
                <span>
                  {mdl.incentive === mdl.dividend ||
                  !mdl.incentive ||
                  !mdl.dividend
                    ? "Inactive"
                    : mdl.incentive > mdl.dividend
                      ? "Miner"
                      : "Validator"}
                </span>
              </div>
              <div>
                <h2 className="text-gray-400">Reading Time</h2>
                <span>{calculateReadingTime(description)}</span>
              </div>
              <div>
                <h2 className="text-gray-400">Incentive</h2>
                <span>{mdl.incentive ?? 0}</span>
              </div>
              <div>
                <h2 className="text-gray-400">Total Staked</h2>
                <span>{mdl.totalStaked ?? 0}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between border border-white/20 bg-[#898989]/5 p-8 backdrop-blur-md">
            <h2 className="mb-4 text-xl font-semibold">Stake to this Module</h2>
            <div className="flex flex-col gap-2">
              <h2 className="text-gray-400">Amount</h2>
              <input
                type="number"
                className="w-full bg-[#898989]/10 p-1 text-white"
                min="0"
                max="100000000000000"
              />
              <button className="w-full animate-fade border border-white/20 bg-[#898989]/5 p-2 text-white backdrop-blur-md transition duration-200 hover:border-green-500 hover:bg-green-500/10">
                Stake
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function calculateReadingTime(text: string): string {
  const wordsPerMinute = 200; // Average reading speed
  const words = text.split(/\s+/).length; // Split text by whitespace and count words
  const minutes = words / wordsPerMinute;

  const minutesRounded = Math.ceil(minutes); // Round up to the nearest minute

  return `${minutesRounded} min read`;
}
