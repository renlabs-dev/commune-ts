"use client";

import MarkdownPreview from "@uiw/react-markdown-preview";

import { cairo } from "@commune-ts/ui/fonts";

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
