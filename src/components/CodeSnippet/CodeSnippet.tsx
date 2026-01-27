import styled from "@emotion/styled";
import { CodeBlock } from "react-code-block";
import type { CodeSnippetProps } from "./types";

const getCodeSnippet = ({ src, objectPosition }: CodeSnippetProps) => `<img
  src="${src}"
  style="object-fit: cover; object-position: ${objectPosition};"
/>`;

const Code = styled(CodeBlock.Code)`
  font-size: 1rem;
  width: 100%;
  margin: 0;
  box-sizing: border-box;
  background-color: #111827;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  overflow: auto;
`;

const Line = styled.div`
  display: table-row;
`;

const LineNumber = styled(CodeBlock.LineNumber)`
  display: table-cell;
  padding-right: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
  text-align: right;
  user-select: none;
`;

const LineContent = styled(CodeBlock.LineContent)`
  display: table-cell;
`;

export function CodeSnippet({ ref, src, objectPosition, ...rest }: CodeSnippetProps) {
  const codeSnippet = getCodeSnippet({ src, objectPosition });

  return (
    <CodeBlock code={codeSnippet} language="html">
      <Code ref={ref} {...rest}>
        <Line>
          <LineNumber />
          <LineContent>
            <CodeBlock.Token />
          </LineContent>
        </Line>
      </Code>
    </CodeBlock>
  );
}
