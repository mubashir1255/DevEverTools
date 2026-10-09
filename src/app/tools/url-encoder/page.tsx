"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRightLeft,
  Check,
  Copy,
  Trash2,
  Table,
} from "lucide-react";

type ParamItem = {
  key: string;
  value: string;
};

export default function UrlEncoderPage() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [encodeType, setEncodeType] = useState<"component" | "full">("component");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [params, setParams] = useState<ParamItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedParamIndex, setCopiedParamIndex] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  const parseQueryParams = (text: string) => {
    try {
      const queryString = text.includes("?") ? text.split("?")[1] : text;
      const searchParams = new URLSearchParams(queryString);
      const list: ParamItem[] = [];
      searchParams.forEach((value, key) => {
        list.push({ key, value });
      });
      setParams(list);
    } catch {
      setParams([]);
    }
  };

  const processUrl = (
    text: string,
    currentMode: "encode" | "decode",
    currentType: "component" | "full"
  ) => {
    if (!text.trim()) {
      setOutput("");
      setParams([]);
      setError(null);
      return;
    }

    try {
      if (currentMode === "encode") {
        const result =
          currentType === "component"
            ? encodeURIComponent(text)
            : encodeURI(text);
        setOutput(result);
      } else {
        const result =
          currentType === "component"
            ? decodeURIComponent(text)
            : decodeURI(text);
        setOutput(result);
      }
      setError(null);
      parseQueryParams(text);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid URL malformed character sequence");
      }
    }
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    startTransition(() => {
      processUrl(val, mode, encodeType);
    });
  };

  const toggleMode = () => {
    const nextMode = mode === "encode" ? "decode" : "encode";
    setMode(nextMode);
    setInput(output);
    processUrl(output, nextMode, encodeType);
  };

  const handleCopy = async (text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setParams([]);
    setError(null);
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
              URL Encoder / Decoder
            </h1>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            RFC 3986 Standard
          </span>
        </header>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a0b0e] border border-zinc-800 p-2.5 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Mode Switcher */}
            <div className="flex border border-zinc-800 bg-black">
              <button
                type="button"
                onClick={() => {
                  setMode("encode");
                  processUrl(input, "encode", encodeType);
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
                  processUrl(input, "decode", encodeType);
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

            {/* Encoding Scope Selector */}
            <div className="flex items-center gap-1 ml-2 text-xs text-zinc-400">
              <span className="text-[11px]">Scope:</span>
              <select
                value={encodeType}
                onChange={(e) => {
                  const nextType = e.target.value as "component" | "full";
                  setEncodeType(nextType);
                  processUrl(input, mode, nextType);
                }}
                className="bg-black border border-zinc-800 text-zinc-300 text-xs px-2 py-1 outline-none"
              >
                <option value="component">Component (Params & Values)</option>
                <option value="full">Full URI (Preserve :// and /)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const sample = "https://api.devvault.local/v1/search?query=hello world&filter=fast&lang=en#results";
                setInput(sample);
                processUrl(sample, mode, encodeType);
              }}
              className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs transition-colors"
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

        {/* Error notification */}
        {error && (
          <div className="bg-red-950/20 border border-red-800/80 text-red-400 px-3.5 py-2 text-xs font-mono mb-4 flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-[10px] bg-red-900/40 border border-red-700/60 px-1.5 py-0.5">
              Malformed URL
            </span>
            <span>{error}</span>
          </div>
        )}

        {/* Dual Input/Output Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 mb-6">
          {/* Input Panel */}
          <div className="flex flex-col border border-zinc-800 bg-[#0a0b0e]">
            <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400 bg-black/40">
              <span className="font-mono uppercase text-[11px] tracking-wider">
                {mode === "encode" ? "Raw Input" : "Encoded URL"}
              </span>
              <span className="text-[11px] font-mono text-zinc-600">
                {input.length} chars
              </span>
            </div>
            <textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Paste raw string or full URL..."
              spellCheck={false}
              className="w-full flex-1 bg-transparent p-4 text-xs font-mono text-zinc-200 resize-none outline-none min-h-[300px]"
            />
          </div>

          {/* Output Panel */}
          <div className="flex flex-col border border-zinc-800 bg-[#0a0b0e]">
            <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400 bg-black/40">
              <span className="font-mono uppercase text-[11px] tracking-wider">
                {mode === "encode" ? "Encoded Result" : "Decoded Result"}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(output)}
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
              placeholder="Result will appear automatically..."
              spellCheck={false}
              className="w-full flex-1 bg-transparent p-4 text-xs font-mono text-zinc-300 resize-none outline-none min-h-[300px]"
            />
          </div>
        </div>

        {/* Query Parameter Breakdown */}
        {params.length > 0 && (
          <div className="border border-zinc-800 bg-[#0a0b0e] flex flex-col">
            <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-2.5 bg-black/40 text-xs">
              <Table size={14} className="text-blue-400" />
              <span className="font-mono text-zinc-300 font-semibold text-[11px] uppercase tracking-wider">
                Parsed Query Parameters ({params.length})
              </span>
            </div>
            <div className="divide-y divide-zinc-900 overflow-x-auto">
              {params.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-4 py-2.5 text-xs font-mono hover:bg-[#0e1015] gap-4"
                >
                  <span className="text-blue-400 font-semibold min-w-[120px]">
                    {item.key}
                  </span>
                  <span className="text-zinc-300 flex-1 truncate select-all">
                    {item.value}
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(item.value);
                      setCopiedParamIndex(idx);
                      setTimeout(() => setCopiedParamIndex(null), 1200);
                    }}
                    className="text-[11px] text-zinc-500 hover:text-zinc-200 px-2 py-1 bg-zinc-900 border border-zinc-800 shrink-0"
                  >
                    {copiedParamIndex === idx ? "Copied" : "Copy Value"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevVault · URL Encoder & Decoder
      </footer>
    </div>
  );
}