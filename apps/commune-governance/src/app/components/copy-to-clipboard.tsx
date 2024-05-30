"use client";
import { useState } from "react";

interface CodeComponentProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}

// TODO check if this could move to UI due to similarity with copy-button.tsx from commune-page
export function CopyToClipboard(props: CodeComponentProps): JSX.Element {
  const { content, children, className } = props;
  const [copied, setCopied] = useState(false);

  async function copyTextToClipboard(text: string): Promise<boolean> {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
    if ("clipboard" in navigator) {
      await navigator.clipboard.writeText(text);
    }
    return document.execCommand("copy", true, text);
  }

  return (
    <button
      className={className}
      onClick={() => void copyTextToClipboard(content)}
      type="button"
    >
      {!copied ? children : "Copied"}
    </button>
  );
}
