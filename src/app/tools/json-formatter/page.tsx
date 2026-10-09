"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Trash2,
  FileCode,
  Minimize2,
  ArrowUpDown,
} from "lucide-react";

const SAMPLE_JSON = `{
  "name": "DevVault",
  "version": "1.0.0",
  "clientSide": true,
  "telemetry": false,
  "tools": [
    "JSON Formatter",
    "Base64 Encoder",
    "UUID Generator"
  ],
  "author": {
    "role": "Developer",
    "platform": "Linux"
  }
}`;

export default function JsonFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState<number | string>(2);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Formatting logic
  const handleFormat = (customInput?: string, sortKeys = false) => {
    const raw = customInput !== undefined ? customInput : input;
    if (!raw.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    try {
      let parsed = JSON.parse(raw);

      if (sortKeys && typeof parsed === "object" && parsed !== null) {
        parsed = sortObjectKeys(parsed);
      }

      const spacing = indent === "tab" ? "\t" : Number(indent);
      const formatted = JSON.stringify(parsed, null, spacing);
      setOutput(formatted);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid JSON format");
      }
    }
  };

  // Minify JSON
  const handleMinify = () => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  // Recursive key sorting with safe unknown types
  const sortObjectKeys = (value: unknown): unknown => {
    if (Array.isArray(value)) {
      return value.map(sortObjectKeys);
    }
    if (value !== null && typeof value === "object") {
      return Object.keys(value)
        .sort()
        .reduce<Record<string, unknown>>((acc, key) => {
          acc[key] = sortObjectKeys((value as Record<string, unknown>)[key]);
          return acc;
        }, {});
    }
    return value;
  };

  // Load sample
  const handleLoadSample = () => {
    setInput(SAMPLE_JSON);
    handleFormat(SAMPLE_JSON);
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Clear all
  const handleClear = () => {
    setInput("");
    setOutput("");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col justify-between py-8 px-6">
      <div className="w-full max-w-6xl mx-auto flex flex-col flex-1">
        {/* Top bar */}
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
              JSON Formatter & Validator
            </h1>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Client-Side Execution
          </span>
        </header>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a0b0e] border border-zinc-800 p-2.5 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleFormat()}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <FileCode size={14} />
              <span>Format</span>
            </button>
            <button
              onClick={handleMinify}
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 text-xs flex items-center gap-1.5 transition-colors"
            >
              <Minimize2 size={14} />
              <span>Minify</span>
            </button>
            <button
              onClick={() => handleFormat(undefined, true)}
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 text-xs flex items-center gap-1.5 transition-colors"
            >
              <ArrowUpDown size={14} />
              <span>Sort Keys</span>
            </button>

            {/* Indent selector */}
            <div className="flex items-center gap-1 ml-2 text-xs text-zinc-400">
              <span className="text-[11px]">Indent:</span>
              <select
                value={indent}
                onChange={(e) => {
                  setIndent(e.target.value);
                  setTimeout(() => handleFormat(), 0);
                }}
                className="bg-black border border-zinc-800 text-zinc-300 text-xs px-2 py-1 outline-none"
              >
                <option value={2}>2 Spaces</option>
                <option value={4}>4 Spaces</option>
                <option value="tab">Tab</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadSample}
              className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs transition-colors"
            >
              Sample
            </button>
            <button
              onClick={handleClear}
              className="p-1.5 bg-zinc-900 border border-zinc-800 hover:bg-red-950/40 hover:border-red-800 hover:text-red-400 text-zinc-400 text-xs transition-colors"
              title="Clear all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Diagnostic error banner */}
        {error && (
          <div className="bg-red-950/20 border border-red-800/80 text-red-400 px-3.5 py-2 text-xs font-mono mb-4 flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-[10px] bg-red-900/40 border border-red-700/60 px-1.5 py-0.5">
              Parse Error
            </span>
            <span>{error}</span>
          </div>
        )}

        {/* Dual pane editor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          {/* Input Panel */}
          <div className="flex flex-col border border-zinc-800 bg-[#0a0b0e]">
            <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400 bg-black/40">
              <span className="font-mono uppercase text-[11px] tracking-wider">
                Raw Input
              </span>
              <span className="text-[11px] font-mono text-zinc-600">
                {input.length} characters
              </span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste raw JSON here..."
              spellCheck={false}
              className="w-full flex-1 bg-transparent p-4 text-xs font-mono text-zinc-200 resize-none outline-none min-h-[420px]"
            />
          </div>

          {/* Output Panel */}
          <div className="flex flex-col border border-zinc-800 bg-[#0a0b0e]">
            <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400 bg-black/40">
              <span className="font-mono uppercase text-[11px] tracking-wider">
                Formatted Output
              </span>
              <button
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
              placeholder="Formatted output will appear here..."
              spellCheck={false}
              className="w-full flex-1 bg-transparent p-4 text-xs font-mono text-zinc-300 resize-none outline-none min-h-[420px]"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevVault · JSON Formatter
      </footer>
    </div>
  );
}