"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { useCommune } from "@commune-ts/providers/use-commune";

import { api } from "~/trpc/react";

const MAX_CHARACTERS = 300;

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
});

export function CreateComment({ proposalId }: { proposalId: number }) {
  const router = useRouter();
  const [content, setContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [remainingChars, setRemainingChars] = useState(MAX_CHARACTERS);

  const { selectedAccount } = useCommune();

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

    try {
      CommentSchema.parse({ content });
      CreateComment.mutate({
        content,
        proposalId,
        userKey: String(selectedAccount?.address),
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        setError(err.errors[0]!.message);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2">
      <div className="mb-4 w-full border-b border-gray-500 border-white/20 pb-2 text-gray-500">
        <h2 className="text-start text-lg font-semibold">Submit a Comment</h2>
      </div>
      <div className="relative">
        <textarea
          placeholder={`Your comment here`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="h-24 w-full resize-none bg-gray-600/10 p-3 text-white"
          maxLength={MAX_CHARACTERS}
        />
        <span className="absolute bottom-2 right-2 text-sm text-gray-400">
          {remainingChars} characters left
        </span>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        className="bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
        disabled={CreateComment.isPending || !selectedAccount?.address}
      >
        {CreateComment.isPending ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
