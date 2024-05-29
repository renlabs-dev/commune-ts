"use client";

import { cairo } from "@repo/ui/fonts";
import MarkdownPreview from "@uiw/react-markdown-preview";

type MarkdownView = {
  source: string;
  className?: string;
};
export function MarkdownView(props: MarkdownView) {
  const { source, className } = props;
  return (
    <MarkdownPreview
      source={source}
      style={{ backgroundColor: "transparent", color: "white" }}
      className={`${cairo.className} ${className ?? ""}`}
    />
  );
}
