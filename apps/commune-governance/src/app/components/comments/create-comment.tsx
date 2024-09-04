"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { useCommune } from "@commune-ts/providers/use-commune";
import { toast } from "@commune-ts/providers/use-toast";
import { formatToken } from "@commune-ts/utils";

import { api } from "~/trpc/react";

const MAX_CHARACTERS = 300;
const MAX_NAME_CHARACTERS = 300;
const MIN_STAKE_REQUIRED = 5000;

const CommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(MAX_CHARACTERS, `Comment must be ${MAX_CHARACTERS} characters or less`)
    .refine(
      (value) => !/https?:\/\/\S+/i.test(value),
      "Links are not allowed in comments",
    )
    .refine(
      (value) => !/[<>{}[\]\\/]/g.test(value),
      "Special characters are not allowed",
    ),
  name: z
    .string()
    .max(
      MAX_NAME_CHARACTERS,
      `Name must be ${MAX_NAME_CHARACTERS} characters or less`,
    )
    .optional()
    .refine(
      (value) => !value || !/[<>{}[\]\\/]/g.test(value),
      "Special characters are not allowed in the name",
    ),
});

export function CreateComment({
  proposalId,
  ModeType,
}: {
  proposalId: number;
  ModeType: "PROPOSAL" | "DAO";
}) {
  const router = useRouter();
  const [content, setContent] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [remainingChars, setRemainingChars] = useState(MAX_CHARACTERS);

  let userStakeWeight: bigint | null = null;

  const { selectedAccount, stakeOut } = useCommune();

  const { data: cadreUsers } = api.dao.byCadre.useQuery();

  const CreateComment = api.proposalComment.createComment.useMutation({
    onSuccess: () => {
      router.refresh();
      setContent("");
      setRemainingChars(MAX_CHARACTERS);
    },
  });

  useEffect(() => {
    setRemainingChars(MAX_CHARACTERS - content.length);
  }, [content]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedAccount?.address) {
      setError("Please connect your wallet to submit a comment.");
      return;
    }

    if (ModeType === "PROPOSAL") {
      if (
        !userStakeWeight ||
        Number(formatToken(userStakeWeight)) < MIN_STAKE_REQUIRED
      ) {
        setError(
          `You need to have at least ${MIN_STAKE_REQUIRED} total staked balance to submit a comment.`,
        );
        return;
      }
    } else {
      if (
        !cadreUsers?.some((user) => user.userKey === selectedAccount.address)
      ) {
        setError("Only Cadre members can submit comments in DAO mode.");
        return;
      }
    }

    try {
      CommentSchema.parse({ content, name });
      CreateComment.mutate({
        content,
        proposalId,
        type: ModeType,
        userName: name || undefined,
        userKey: String(selectedAccount.address),
      });
      toast.success("Comment submitted successfully!, Reloading page...");
      setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0]?.message ?? "Invalid input");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  if (stakeOut != null && selectedAccount != null) {
    const userStakeEntry = stakeOut.perAddr[selectedAccount.address];
    userStakeWeight = userStakeEntry ?? 0n;
  }

  const isSubmitDisabled = () => {
    if (CreateComment.isPending || !selectedAccount?.address) return true;

    if (ModeType === "PROPOSAL") {
      return (
        !userStakeWeight ||
        Number(formatToken(userStakeWeight)) < MIN_STAKE_REQUIRED
      );
    }
    {
      return !cadreUsers?.some(
        (user) => user.userKey === selectedAccount.address,
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2">
      <div className="mb-2 w-full border-b border-gray-500 border-white/20 pb-1 text-gray-400">
        <h2 className="text-start font-semibold">Create a Comment</h2>
      </div>
      <div className="relative">
        <textarea
          placeholder="Your comment here"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="h-24 w-full resize-none bg-gray-600/10 p-3 text-white"
          maxLength={MAX_CHARACTERS}
        />
        <span className="absolute bottom-2 right-2 text-sm text-gray-400">
          {remainingChars} characters left
        </span>
      </div>
      <input
        type="text"
        placeholder="Your name here (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mb-2 w-full bg-gray-600/10 p-3 text-white"
        maxLength={MAX_NAME_CHARACTERS}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        className="bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isSubmitDisabled()}
      >
        {CreateComment.isPending ? "Submitting..." : "Submit"}
      </button>
      {isSubmitDisabled() && !error && (
        <p className="text-sm text-yellow-500">
          {!selectedAccount?.address
            ? "Please connect your wallet to submit a comment."
            : ModeType === "PROPOSAL"
              ? `You need to have at least ${MIN_STAKE_REQUIRED} total staked balance to submit a comment.`
              : "Only Cadre members can submit comments in DAO mode."}
        </p>
      )}
    </form>
  );
}
