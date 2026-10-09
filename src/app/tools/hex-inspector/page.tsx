"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Trash2,
  Binary,
} from "lucide-react";

const SAMPLE_TEXT = `DevEverTools v1.0
Zero-telemetry browser toolkit.
Built for high-performance engineers.`;

type DumpRow = {
  offset: string;
  hexBytes: string[];
  ascii: string;
};

function generateHexDump(bytes: Uint8Array): DumpRow[] {
  const rows: DumpRow[] = [];
  const chunkSize = 16;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, i + chunkSize);
    const offset = i.toString(16).padStart(8, "0");
    const hexBytes: string[] = [];
    let ascii = "";

    for (let j = 0; j < chunkSize; j++) {
      if (j < chunk.length) {
        const byte = chunk[j];
        hexBytes.push(byte.toString(16).padStart(2, "0"));
        // Printable ASCII range: 32 (space) to 126 (~)
        ascii += byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : ".";
      } else {
        hexBytes.push("  ");
      }
    }

    rows.push({ offset, hexBytes, ascii });
  }

  return rows;
}

export default function HexInspectorPage() {
  const [input, setInput] = useState(SAMPLE_TEXT);
  const [activeTab, setActiveTab] = useState<"dump" | "binary" | "decimal">("dump");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const bytes = useMemo(() => {
    return new TextEncoder().encode(input);
  }, [input]);

  const hexRows = useMemo(() => generateHexDump(bytes), [bytes]);

  const binaryString = useMemo(() => {
    return Array.from(bytes)
      .map((b) => b.toString(2).padStart(8, "0"))
      .join(" ");
  }, [bytes]);

  const decimalArrayString = useMemo(() => {
    return `[${Array.from(bytes).join(", ")}]`;
  }, [bytes]);

  const fullDumpText = useMemo(() => {
    return hexRows
      .map((row) => `${row.offset}  ${row.hexBytes.join(" ")}  |${row.ascii}|`)
      .join("\n");
  }, [hexRows]);

  const handleCopy = async (text: string, key: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
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
              Hex / Binary / ASCII Inspector
            </h1>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Native TypedArray Engine
          </span>
        </header>

        {/* Input Text Box */}
        <div className="flex flex-col border border-zinc-800 bg-[#0a0b0e] mb-5">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2.5 bg-black/40 text-xs font-mono text-zinc-400">
            <span className="uppercase text-[11px] tracking-wider">Raw Input Text</span>
            <div className="flex items-center gap-3">
              <span className="text-zinc-500 text-[11px]">
                {bytes.length} bytes · {bytes.length * 8} bits
              </span>
              <button
                type="button"
                onClick={() => setInput(SAMPLE_TEXT)}
                className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-[11px]"
              >
                Sample
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-zinc-500 hover:text-red-400"
                title="Clear"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste text to inspect hex, binary, and byte structures..."
            spellCheck={false}
            className="w-full bg-transparent p-4 text-xs font-mono text-zinc-200 resize-none outline-none min-h-[110px]"
          />
        </div>

        {/* Output Inspector Panel */}
        <div className="border border-zinc-800 bg-[#0a0b0e] flex flex-col flex-1">
          {/* Tab Switcher */}
          <div className="flex flex-wrap items-center justify-between border-b border-zinc-800 p-2.5 bg-black/40 gap-3">
            <div className="flex border border-zinc-800 bg-black font-mono text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("dump")}
                className={`px-3 py-1.5 transition-colors ${
                  activeTab === "dump"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Hex Dump (xxd style)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("binary")}
                className={`px-3 py-1.5 transition-colors ${
                  activeTab === "binary"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Raw Binary Stream
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("decimal")}
                className={`px-3 py-1.5 transition-colors ${
                  activeTab === "decimal"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Decimal Bytes Array
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                const text =
                  activeTab === "dump"
                    ? fullDumpText
                    : activeTab === "binary"
                    ? binaryString
                    : decimalArrayString;
                handleCopy(text, activeTab);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 text-xs font-mono transition-colors"
            >
              {copiedKey === activeTab ? (
                <>
                  <Check size={13} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy View</span>
                </>
              )}
            </button>
          </div>

          {/* Active View Display */}
          <div className="p-4 overflow-x-auto flex-1 font-mono text-xs">
            {activeTab === "dump" && (
              <div className="min-w-[650px] space-y-1">
                <div className="flex text-zinc-600 border-b border-zinc-900 pb-1.5 select-none font-bold">
                  <span className="w-24">Offset</span>
                  <span className="flex-1">00 01 02 03 04 05 06 07  08 09 0A 0B 0C 0D 0E 0F</span>
                  <span className="w-40 pl-4">Decoded Text</span>
                </div>

                {hexRows.map((row, idx) => (
                  <div key={idx} className="flex hover:bg-white/5 py-0.5 leading-relaxed">
                    <span className="w-24 text-zinc-500 select-none">{row.offset}</span>
                    <span className="flex-1 text-blue-400 select-all tracking-wide">
                      {row.hexBytes.slice(0, 8).join(" ")} &nbsp;{row.hexBytes.slice(8).join(" ")}
                    </span>
                    <span className="w-40 pl-4 text-zinc-300 border-l border-zinc-900 select-all">
                      {row.ascii}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "binary" && (
              <textarea
                readOnly
                value={binaryString}
                spellCheck={false}
                className="w-full h-full min-h-[360px] bg-transparent text-emerald-400 outline-none resize-none leading-relaxed tracking-wider select-all"
              />
            )}

            {activeTab === "decimal" && (
              <textarea
                readOnly
                value={decimalArrayString}
                spellCheck={false}
                className="w-full h-full min-h-[360px] bg-transparent text-amber-300 outline-none resize-none leading-relaxed select-all"
              />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevEverTools · Hex / Binary / ASCII Inspector
      </footer>
    </div>
  );
}