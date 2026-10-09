"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Trash2,
  FileText,
  Eye,
  Code2,
} from "lucide-react";

const SAMPLE_MD = `# DevVault

DevVault is a **zero-telemetry**, client-side toolkit for engineers.

## Key Principles
* Pure In-Browser Processing
* Sharp Brutalist Aesthetics
* High-Performance Static Delivery

> "Simplicity and local-first execution eliminate needless network roundtrips."

### Code Example
\`\`\`bash
pnpm install
pnpm dev
\`\`\`

Here is a [link to dashboard](/) and an inline \`crypto.randomUUID()\` example.
`;

function parseMarkdownToHtml(md: string): string {
  let html = md
    // Escape HTML raw brackets first
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code blocks: ```code```
  html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_match, _lang, code) => {
    return `<pre class="bg-black border border-zinc-800 p-3 my-3 overflow-x-auto text-xs font-mono text-zinc-300"><code>${code.trim()}</code></pre>`;
  });

  // Headers
  html = html
    .replace(/^#### (.*$)/gim, '<h4 class="text-sm font-bold text-zinc-200 mt-4 mb-2">$1</h4>')
    .replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-zinc-100 mt-5 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-white mt-6 mb-3 border-b border-zinc-800 pb-1">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold text-white mt-4 mb-4 border-b border-zinc-800 pb-2">$1</h1>');

  // Blockquotes
  html = html.replace(
    /^\&gt;\s?(.*$)/gim,
    '<blockquote class="border-l-2 border-blue-500 pl-4 py-1 my-3 text-zinc-400 italic text-xs bg-zinc-900/30">$1</blockquote>'
  );

  // Bold & Italic
  html = html
    .replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-zinc-300">$1</em>');

  // Inline code: `code`
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-blue-400 font-mono text-[11px]">$1</code>'
  );

  // Links: [text](url)
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-blue-400 underline underline-offset-2 hover:text-blue-300" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Unordered Lists
  html = html.replace(/^\*\s(.*$)/gim, '<li class="ml-4 list-disc text-zinc-300 text-xs my-1">$1</li>');

  // Paragraphs (lines separated by blank lines)
  html = html
    .split(/\n\s*\n/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<pre") ||
        trimmed.startsWith("<blockquote") ||
        trimmed.startsWith("<li")
      ) {
        return trimmed;
      }
      return `<p class="my-2 text-xs text-zinc-300 leading-relaxed">${trimmed.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("\n");

  return html;
}

export default function MarkdownPreviewPage() {
  const [input, setInput] = useState(SAMPLE_MD);
  const [activeTab, setActiveTab] = useState<"visual" | "html">("visual");
  const [copied, setCopied] = useState(false);

  const htmlOutput = parseMarkdownToHtml(input);

  const handleCopy = async () => {
    const textToCopy = activeTab === "html" ? htmlOutput : input;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleClear = () => {
    setInput("");
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col justify-between py-8 px-6">
      <div className="w-full max-w-6xl mx-auto flex flex-col flex-1">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white px-2.5 py-1.5 bg-[#0a0b0e] border border-zinc-800 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Vault</span>
            </Link>
            <h1 className="text-sm font-bold text-white tracking-wide uppercase">
              Markdown Preview & HTML Generator
            </h1>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Pure In-Browser Parser
          </span>
        </header>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a0b0e] border border-zinc-800 p-2.5 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex border border-zinc-800 bg-black">
              <button
                type="button"
                onClick={() => setActiveTab("visual")}
                className={`px-3 py-1.5 text-xs font-mono flex items-center gap-1.5 transition-colors ${
                  activeTab === "visual"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Eye size={13} />
                <span>Rendered View</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("html")}
                className={`px-3 py-1.5 text-xs font-mono flex items-center gap-1.5 transition-colors ${
                  activeTab === "html"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Code2 size={13} />
                <span>HTML Code</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setInput(SAMPLE_MD)}
              className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs transition-colors"
            >
              Sample
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 bg-zinc-900 border border-zinc-800 hover:bg-red-950/40 hover:border-red-800 hover:text-red-400 text-zinc-400 text-xs transition-colors"
              title="Clear all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Dual Editor & Preview Panes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          {/* Markdown Input Panel */}
          <div className="flex flex-col border border-zinc-800 bg-[#0a0b0e]">
            <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400 bg-black/40">
              <span className="font-mono uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                <FileText size={13} className="text-blue-400" />
                <span>Markdown Input</span>
              </span>
              <span className="text-[11px] font-mono text-zinc-600">
                {input.length} chars
              </span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Write or paste Markdown here..."
              spellCheck={false}
              className="w-full flex-1 bg-transparent p-4 text-xs font-mono text-zinc-200 resize-none outline-none min-h-[460px]"
            />
          </div>

          {/* Output Panel */}
          <div className="flex flex-col border border-zinc-800 bg-[#0a0b0e]">
            <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400 bg-black/40">
              <span className="font-mono uppercase text-[11px] tracking-wider text-blue-400 font-semibold">
                {activeTab === "visual" ? "Visual Preview" : "Generated HTML"}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!input}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                {copied ? (
                  <>
                    <Check size={13} className="text-emerald-400" />
                    <span className="text-emerald-400 font-mono text-[11px]">
                      Copied
                    </span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span className="font-mono text-[11px]">
                      {activeTab === "html" ? "Copy HTML" : "Copy Markdown"}
                    </span>
                  </>
                )}
              </button>
            </div>

            {activeTab === "visual" ? (
              <div
                className="w-full flex-1 p-5 overflow-y-auto min-h-[460px] text-zinc-200"
                dangerouslySetInnerHTML={{ __html: htmlOutput }}
              />
            ) : (
              <textarea
                readOnly
                value={htmlOutput}
                placeholder="Compiled HTML will appear here..."
                spellCheck={false}
                className="w-full flex-1 bg-transparent p-4 text-xs font-mono text-zinc-300 resize-none outline-none min-h-[460px]"
              />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevVault · Markdown Preview & HTML Generator
      </footer>
    </div>
  );
}