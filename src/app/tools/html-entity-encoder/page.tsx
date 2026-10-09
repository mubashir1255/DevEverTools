"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRightLeft,
  Check,
  Copy,
  Trash2,
} from "lucide-react";

const SAMPLE_TEXT = `<div class="card" id="profile">
  <h3>Hello & Welcome!</h3>
  <p>Price: 100€ · Copyright © 2026 DevVault™</p>
  <script>alert("XSS Protected");</script>
</div>`;

const SPECIAL_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function encodeHtml(str: string, mode: "special" | "all" | "hex"): string {
  if (mode === "special") {
    return str.replace(/[&<>"']/g, (m) => SPECIAL_ENTITIES[m] || m);
  }

  if (mode === "hex") {
    return Array.from(str)
      .map((ch) => {
        const code = ch.charCodeAt(0);
        if (code > 127 || /[&<>"']/.test(ch)) {
          return `&#x${code.toString(16).toUpperCase()};`;
        }
        return ch;
      })
      .join("");
  }

  // mode === "all": Decimal numeric for non-alphanumeric/special
  return Array.from(str)
    .map((ch) => {
      const code = ch.charCodeAt(0);
      if (code > 127 || /[&<>"']/.test(ch)) {
        return `&#${code};`;
      }
      return ch;
    })
    .join("");
}

function decodeHtml(str: string): string {
  if (typeof window === "undefined") return str;
  const doc = new DOMParser().parseFromString(str, "text/html");
  return doc.documentElement.textContent || "";
}

export default function HtmlEntityEncoderPage() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [encodeLevel, setEncodeLevel] = useState<"special" | "all" | "hex">("special");
  const [input, setInput] = useState(SAMPLE_TEXT);
  const [output, setOutput] = useState(() => encodeHtml(SAMPLE_TEXT, "special"));
  const [copied, setCopied] = useState(false);
  const [, startTransition] = useTransition();

  const processText = (
    text: string,
    currentMode: "encode" | "decode",
    currentLevel: "special" | "all" | "hex"
  ) => {
    if (!text.trim()) {
      setOutput("");
      return;
    }

    if (currentMode === "encode") {
      setOutput(encodeHtml(text, currentLevel));
    } else {
      setOutput(decodeHtml(text));
    }
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    startTransition(() => {
      processText(val, mode, encodeLevel);
    });
  };

  const toggleMode = () => {
    const nextMode = mode === "encode" ? "decode" : "encode";
    setMode(nextMode);
    setInput(output);
    processText(output, nextMode, encodeLevel);
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
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
              HTML Entity Encoder / Decoder
            </h1>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Client-Side DOM Parsing
          </span>
        </header>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a0b0e] border border-zinc-800 p-2.5 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Mode Switcher */}
            <div className="flex border border-zinc-800 bg-black">
              <button
                type="button"
                onClick={() => {
                  setMode("encode");
                  processText(input, "encode", encodeLevel);
                }}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  mode === "encode"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Encode
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("decode");
                  processText(input, "decode", encodeLevel);
                }}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  mode === "decode"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Decode
              </button>
            </div>

            {/* Swap Button */}
            <button
              type="button"
              onClick={toggleMode}
              disabled={!output}
              className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              title="Swap input and output"
            >
              <ArrowRightLeft size={13} />
              <span>Swap</span>
            </button>

            {/* Encoding Scope Options */}
            {mode === "encode" && (
              <div className="flex items-center gap-1 ml-2 text-xs text-zinc-400 font-mono">
                <span className="text-[11px]">Format:</span>
                <select
                  value={encodeLevel}
                  onChange={(e) => {
                    const next = e.target.value as "special" | "all" | "hex";
                    setEncodeLevel(next);
                    processText(input, mode, next);
                  }}
                  className="bg-black border border-zinc-800 text-zinc-300 text-xs px-2 py-1 outline-none"
                >
                  <option value="special">Named (&lt;, &gt;, &amp;, &quot;)</option>
                  <option value="all">Decimal (&#60;, &#62;)</option>
                  <option value="hex">Hex (&#x3C;, &#x3E;)</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setInput(SAMPLE_TEXT);
                processText(SAMPLE_TEXT, mode, encodeLevel);
              }}
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

        {/* Dual Textareas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          {/* Input Panel */}
          <div className="flex flex-col border border-zinc-800 bg-[#0a0b0e]">
            <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400 bg-black/40">
              <span className="font-mono uppercase text-[11px] tracking-wider">
                {mode === "encode" ? "Raw Text / HTML" : "HTML Entities"}
              </span>
              <span className="text-[11px] font-mono text-zinc-600">
                {input.length} chars
              </span>
            </div>
            <textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Paste text or entities here..."
              spellCheck={false}
              className="w-full flex-1 bg-transparent p-4 text-xs font-mono text-zinc-200 resize-none outline-none min-h-[440px]"
            />
          </div>

          {/* Output Panel */}
          <div className="flex flex-col border border-zinc-800 bg-[#0a0b0e]">
            <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400 bg-black/40">
              <span className="font-mono uppercase text-[11px] tracking-wider text-blue-400 font-semibold">
                {mode === "encode" ? "Encoded Entities" : "Decoded Text"}
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
              className="w-full flex-1 bg-transparent p-4 text-xs font-mono text-zinc-300 resize-none outline-none min-h-[440px]"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevVault · HTML Entity Encoder & Decoder
      </footer>
    </div>
  );
}