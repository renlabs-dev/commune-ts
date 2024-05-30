"use client";

import { cairo } from "@repo/ui/fonts";
import MarkdownPreview from "@uiw/react-markdown-preview";

interface MarkdownViewProps {
  source: string;
  className?: string;
}
export function MarkdownView(props: MarkdownViewProps): JSX.Element {
  const { source, className } = props;
  return (
    <MarkdownPreview
      className={`${cairo.className} ${className ?? ""}`}
      source={source}
      style={{ backgroundColor: "transparent", color: "white" }}
    />
  );
}
