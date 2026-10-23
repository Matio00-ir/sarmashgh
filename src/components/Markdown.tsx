import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { isolateDisplayMath } from "@/lib/math-text";

// هر خط جدید در متن درس، در نمایش هم خط جدید است (remark-breaks)
export function Markdown({ text, className = "" }: { text: string; className?: string }) {
  return (
    <div className={`prose-fa ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
      >
        {isolateDisplayMath(text)}
      </ReactMarkdown>
    </div>
  );
}
