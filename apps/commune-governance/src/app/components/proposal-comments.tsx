import {
  ArrowPathIcon,
  ChevronDoubleDownIcon,
  ChevronDoubleUpIcon,
} from "@heroicons/react/20/solid";

import { smallAddress } from "@commune-ts/providers/utils";

import { api } from "~/trpc/react";

export function ProposalComment({ proposalId }: { proposalId: number }) {
  const {
    data: proposalComments,
    error,
    isLoading,
  } = api.proposalComment.byId.useQuery(
    { proposalId },
    { enabled: !!proposalId },
  );

  if (error) {
    console.error("Error fetching proposal comments:", error);
  }

  if (isLoading)
    return (
      <div className="flex w-full items-center justify-center lg:h-auto">
        <h1 className="text-2xl text-white">Loading...</h1>
        <ArrowPathIcon className="ml-2 animate-spin" color="#FFF" width={20} />
      </div>
    );

  return (
    <div className="flex w-full flex-col">
      <div className="m-2 flex h-full min-h-max animate-fade-down flex-col items-center justify-between border border-white/20 bg-[#898989]/5 p-6 text-white  backdrop-blur-md animate-delay-200">
        <div className="mb-4 w-full border-b border-gray-500 border-white/20 pb-2 text-gray-500">
          <h2 className="text-start text-lg font-semibold">
            Community Comments
          </h2>
        </div>
        {proposalComments?.length ? (
          <div className="flex max-h-[25vh] w-full flex-col gap-3 overflow-auto pb-3 pr-2">
            {proposalComments.map((comment) => (
              <div
                key={comment.id}
                className="flex w-full flex-col gap-2 border border-white/20 bg-white/5"
              >
                <div className="flex justify-between border-b border-white/20 px-2 py-1">
                  <p>{smallAddress(comment.userKey)}</p>
                  <div className="fl flex">
                    <span className="mr-2 flex items-center text-green-500">
                      <ChevronDoubleUpIcon className="h-5 w-5" />{" "}
                      {comment.upvotes}
                    </span>
                    <span className="flex items-center text-red-500">
                      <ChevronDoubleDownIcon className="h-5 w-5" />
                      {comment.downvotes}
                    </span>
                  </div>
                </div>
                <p className="p-2">{comment.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No comments yet</p>
        )}
      </div>
    </div>
  );
}
