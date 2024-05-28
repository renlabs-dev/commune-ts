import type { MDXComponents } from "mdx/types";
import { ClassAttributes, HTMLAttributes } from "react";
import { CopyButton } from "./src/components/copy-button";

type TMDXProps = ClassAttributes<HTMLPreElement> &
  HTMLAttributes<HTMLPreElement> & { raw?: string };

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    pre: (props: TMDXProps) => (
      <pre
        {...props}
        style={{
          padding: 0,
          border: "2px solid #fff",
          boxShadow: "3px 3px 0 0 #fff",
        }}
        className="flex"
      >
        <div style={{ padding: "0.75rem", overflow: "auto", width: "100%" }}>
          {props.children}
        </div>
        <div style={{ padding: "0.5rem", width: "auto" }}>
          <CopyButton code={props.raw as string} />
        </div>
      </pre>
    ),
    ...components,
  };
}
