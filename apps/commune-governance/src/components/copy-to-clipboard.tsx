"use client";
import { useState } from "react";

type CodeComponentProps = {
  content: string;
  children: React.ReactNode;
  className?: string;
};

// TODO check if this could move to UI due to similarity with copy-button.tsx from commune-page
export function CopyToClipboard(props: CodeComponentProps) {
  const { content, children, className } = props;
  const [copied, setCopied] = useState(false);

  async function copyTextToClipboard(text: string) {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
    if ("clipboard" in navigator) {
      return await navigator.clipboard.writeText(text);
    } else {
      return document.execCommand("copy", true, text);
    }
  }

  return (
    <button className={className} onClick={() => copyTextToClipboard(content)}>
      {!copied ? children : "Copied"}
    </button>
  );
}
