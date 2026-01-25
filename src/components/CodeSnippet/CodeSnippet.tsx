import clsx from "clsx";
import { CodeBlock } from "react-code-block";
import type { CodeSnippetProps } from "./types";

const getCodeSnippet = ({ src, objectPosition }: CodeSnippetProps) => `<img
  src="${src}"
  style="object-fit: cover; object-position: ${objectPosition};"
/>`;

export function CodeSnippet({ ref, src, objectPosition, className }: CodeSnippetProps) {
  const codeSnippet = getCodeSnippet({ src, objectPosition });

  return (
    <CodeBlock code={codeSnippet} language="html">
      <CodeBlock.Code
        ref={ref}
        className={clsx("bg-gray-900 p-6 rounded-xl shadow-lg overflow-auto", className)}
      >
        <div className="table-row">
          <CodeBlock.LineNumber className="table-cell pr-4 text-sm text-gray-500 text-right select-none" />
          <CodeBlock.LineContent className="table-cell">
            <CodeBlock.Token />
          </CodeBlock.LineContent>
        </div>
      </CodeBlock.Code>
    </CodeBlock>
  );
}
