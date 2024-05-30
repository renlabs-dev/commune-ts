import type { MDXComponents } from "mdx/types";
import type { ClassAttributes, HTMLAttributes } from "react";
import { CopyButton } from "./src/app/components/copy-button";

type TMDXProps = ClassAttributes<HTMLPreElement> &
  HTMLAttributes<HTMLPreElement> & { raw?: string };

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    pre: (props: TMDXProps) => (
      <pre
        {...props}
        className="flex"
        style={{
          padding: 0,
          border: "2px solid #fff",
          boxShadow: "3px 3px 0 0 #fff",
        }}
      >
        <div style={{ padding: "0.75rem", overflow: "auto", width: "100%" }}>
          {props.children}
        </div>
        <div style={{ padding: "0.5rem", width: "auto" }}>
          {/* eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style */}
          <CopyButton code={props.raw as string} />
        </div>
      </pre>
    ),
    ...components,
  };
}
