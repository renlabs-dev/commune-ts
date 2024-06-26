"use client";

import { useState } from "react";
import Image from "next/image";
import { copyToClipboard } from '../../../subspace/utils'
import { cn } from "..";

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
    await copyToClipboard(text)

    return
  }

  return (
    <button
      className={cn(`text-gray-400 border-gray-500 border w-full flex items-center justify-center max-w-28 py-2 hover:border-green-600 hover:text-green-600 ${copied && "border-green-500 text-green-500 hover:!border-green-500 hover:!text-green-500 cursor-not-allowed"}`)}
      onClick={() => void copyTextToClipboard(code)}
      type="button"
    >
      <span className={cn(`flex items-center ${copied ? 'text-green-' : ''}`)}>{!copied ? 'Copy' : 'Copied'} <Image alt="" className="ml-1" height={20} src="docs-icon.svg" width={20} /></span>
    </button>
  );
}
