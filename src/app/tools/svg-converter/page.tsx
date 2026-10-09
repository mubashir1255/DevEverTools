"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Trash2,
  Code2,
} from "lucide-react";

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
</svg>`;

// Convert HTML/SVG attributes to JSX camelCase
function svgToJsx(rawSvg: string, componentName = "IconComponent"): string {
  let cleaned = rawSvg
    .replace(/<\?xml[\s\S]*?\?>/gi, "")
    .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
    .replace(/<!--[\s\S]*?-->/gi, "")
    .trim();

  // Common SVG hyphenated attributes mapped to React camelCase
  const attrMap: Record<string, string> = {
    "stroke-width": "strokeWidth",
    "stroke-linecap": "strokeLinecap",
    "stroke-linejoin": "strokeLinejoin",
    "stroke-miterlimit": "strokeMiterlimit",
    "stroke-dasharray": "strokeDasharray",
    "stroke-dashoffset": "strokeDashoffset",
    "stroke-opacity": "strokeOpacity",
    "fill-rule": "fillRule",
    "fill-opacity": "fillOpacity",
    "clip-rule": "clipRule",
    "clip-path": "clipPath",
    "color-interpolation-filters": "colorInterpolationFilters",
    class: "className",
    "xmlns:xlink": "xmlnsXlink",
    "xlink:href": "xlinkHref",
  };

  Object.entries(attrMap).forEach(([kebab, camel]) => {
    const regex = new RegExp(`\\b${kebab}=`, "gi");
    cleaned = cleaned.replace(regex, `${camel}=`);
  });

  // Inject {...props} into the opening <svg tag
  cleaned = cleaned.replace(/<svg\b([^>]*)>/i, `<svg$1 {...props}>`);

  return `import * as React from "react";

export function ${componentName}(props: React.SVGProps<SVGSVGElement>) {
  return (
    ${cleaned}
  );
}`;
}

// Convert SVG string to CSS Data URI
function svgToCssDataUri(rawSvg: string): string {
  const cleaned = rawSvg
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/"/g, "'")
    .trim();

  const encoded = encodeURIComponent(cleaned)
    .replace(/%20/g, " ")
    .replace(/%3D/g, "=")
    .replace(/%3A/g, ":")
    .replace(/%2F/g, "/")
    .replace(/%27/g, "\\'");

  return `background-image: url("data:image/svg+xml,${encoded}");`;
}

// Clean minified SVG string
function cleanSvg(rawSvg: string): string {
  return rawSvg
    .replace(/<\?xml[\s\S]*?\?>/gi, "")
    .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
    .replace(/<!--[\s\S]*?-->/gi, "")
    .replace(/>\s+</g, "><")
    .trim();
}

export default function SvgConverterPage() {
  const [input, setInput] = useState(SAMPLE_SVG);
  const [activeTab, setActiveTab] = useState<"jsx" | "css" | "min">("jsx");
  const [copied, setCopied] = useState(false);
  const [, startTransition] = useTransition();

  const handleInputChange = (val: string) => {
    setInput(val);
    startTransition(() => {});
  };

  const getActiveOutput = (): string => {
    if (!input.trim()) return "";
    try {
      if (activeTab === "jsx") return svgToJsx(input);
      if (activeTab === "css") return svgToCssDataUri(input);
      return cleanSvg(input);
    } catch {
      return "Error converting SVG markup";
    }
  };

  const output = getActiveOutput();

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
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
              SVG to CSS / JSX Converter
            </h1>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Pure In-Browser Transformation
          </span>
        </header>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a0b0e] border border-zinc-800 p-2.5 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex border border-zinc-800 bg-black">
              <button
                type="button"
                onClick={() => setActiveTab("jsx")}
                className={`px-3 py-1.5 text-xs font-mono transition-colors ${
                  activeTab === "jsx"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                React JSX / TSX
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("css")}
                className={`px-3 py-1.5 text-xs font-mono transition-colors ${
                  activeTab === "css"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                CSS Data URI
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("min")}
                className={`px-3 py-1.5 text-xs font-mono transition-colors ${
                  activeTab === "min"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Minified SVG
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setInput(SAMPLE_SVG)}
              className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs transition-colors"
            >
              Sample
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 bg-zinc-900 border border-zinc-800 hover:bg-red-950/40 hover:border-red-800 hover:text-red-400 text-zinc-400 text-xs transition-colors"
              title="Clear"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Live Visual Preview Bar */}
        <div className="border border-zinc-800 bg-[#0a0b0e] p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Code2 size={16} className="text-blue-400" />
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider text-[11px]">
              Live Visual Preview:
            </span>
          </div>
          <div
            className="w-12 h-12 flex items-center justify-center border border-zinc-800 bg-black text-white p-2"
            dangerouslySetInnerHTML={{ __html: input }}
          />
        </div>

        {/* Dual Input/Output Textareas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          {/* Input Panel */}
          <div className="flex flex-col border border-zinc-800 bg-[#0a0b0e]">
            <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400 bg-black/40">
              <span className="font-mono uppercase text-[11px] tracking-wider">
                Raw SVG Markup
              </span>
              <span className="text-[11px] font-mono text-zinc-600">
                {input.length} chars
              </span>
            </div>
            <textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Paste raw <svg>...</svg> code here..."
              spellCheck={false}
              className="w-full flex-1 bg-transparent p-4 text-xs font-mono text-zinc-200 resize-none outline-none min-h-[420px]"
            />
          </div>

          {/* Output Panel */}
          <div className="flex flex-col border border-zinc-800 bg-[#0a0b0e]">
            <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400 bg-black/40">
              <span className="font-mono uppercase text-[11px] tracking-wider text-blue-400 font-semibold">
                {activeTab === "jsx" && "React Component"}
                {activeTab === "css" && "CSS Background"}
                {activeTab === "min" && "Minified Output"}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!output}
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
                    <span className="font-mono text-[11px]">Copy</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              readOnly
              value={output}
              placeholder="Converted output will appear automatically..."
              spellCheck={false}
              className="w-full flex-1 bg-transparent p-4 text-xs font-mono text-zinc-300 resize-none outline-none min-h-[420px]"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevVault · SVG to CSS / JSX Converter
      </footer>
    </div>
  );
}