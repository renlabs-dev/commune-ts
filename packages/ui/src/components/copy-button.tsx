"use client";

import { useState } from "react";
import Image from "next/image";

import { cn } from "..";
import { copyToClipboard } from "../../../subspace/utils";

interface CodeComponentProps {
  code: string;
}

export function CopyButton(props: CodeComponentProps): JSX.Element {
  const { code } = props;
  const [copied, setCopied] = useState(false);

  async function copyTextToClipboard(text: string): Promise<void> {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
    await copyToClipboard(text);

    return;
  }

  return (
    <button
      className={cn(
        `tw-px-4 flex w-auto max-w-28 items-center justify-center border border-white/20 py-2 text-gray-400 transition duration-200 hover:border-green-600 hover:bg-green-500/20 hover:text-green-600 ${copied && "cursor-not-allowed border-green-500 text-green-500 hover:!border-green-500 hover:!text-green-500"}`,
      )}
      onClick={() => void copyTextToClipboard(code)}
      type="button"
    >
      <span className={cn(`flex items-center ${copied ? "text-green-" : ""}`)}>
        <Image
          alt=""
          className="ml-0.5"
          height={25}
          src="docs-icon.svg"
          width={25}
        />
      </span>
    </button>
  );
}
