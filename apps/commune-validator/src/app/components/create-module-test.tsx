"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "~/trpc/react";

export function CreateWeight() {
  const router = useRouter();
  const [weight, setWeight] = useState<number>(0);

  const createWeight = api.moduleTest.create.useMutation({
    onSuccess: () => {
      router.refresh();
      setWeight(0);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        createWeight.mutate({ weight });
      }}
      className="flex flex-col gap-2"
    >
      <input
        type="number"
        placeholder="Weight"
        value={weight}
        onChange={(e) => setWeight(Number(e.target.value))}
        className="w-full bg-gray-600/50 px-4 py-2 text-white"
      />
      <button
        type="submit"
        className=" bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
        disabled={createWeight.isPending}
      >
        {createWeight.isPending ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
