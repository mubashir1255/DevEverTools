"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  RefreshCw,
} from "lucide-react";

// RFC 9562 compliant UUID v7 generation
function generateUuidV7(): string {
  const now = Date.now();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  // 48-bit timestamp
  bytes[0] = (now / 0x10000000000) & 0xff;
  bytes[1] = (now / 0x100000000) & 0xff;
  bytes[2] = (now / 0x1000000) & 0xff;
  bytes[3] = (now / 0x10000) & 0xff;
  bytes[4] = (now / 0x100) & 0xff;
  bytes[5] = now & 0xff;

  // Version 7
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  // Variant RFC 4122
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// UUID v4 generation using Web Crypto
function generateUuidV4(): string {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function createUuids(version: "v4" | "v7", count: number): string[] {
  const generator = version === "v7" ? generateUuidV7 : generateUuidV4;
  const list: string[] = [];
  for (let i = 0; i < count; i++) {
    list.push(generator());
  }
  return list;
}

export default function UuidGeneratorPage() {
  const [version, setVersion] = useState<"v4" | "v7">("v4");
  const [count, setCount] = useState<number>(5);
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);

  // Lazy initializer: runs once on mount without triggering an effect or re-render cascade
  const [uuids, setUuids] = useState<string[]>(() => createUuids("v4", 5));
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const formatUuid = useCallback(
    (raw: string) => {
      let formatted = raw;
      if (!hyphens) {
        formatted = formatted.replace(/-/g, "");
      }
      return uppercase ? formatted.toUpperCase() : formatted.toLowerCase();
    },
    [hyphens, uppercase]
  );

  const handleGenerate = (nextVersion = version, nextCount = count) => {
    setUuids(createUuids(nextVersion, nextCount));
  };

  const handleVersionChange = (nextVersion: "v4" | "v7") => {
    setVersion(nextVersion);
    handleGenerate(nextVersion, count);
  };

  const handleCountChange = (nextCount: number) => {
    setCount(nextCount);
    handleGenerate(version, nextCount);
  };

  const handleCopyOne = async (id: string, index: number) => {
    await navigator.clipboard.writeText(formatUuid(id));
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleCopyAll = async () => {
    const allFormatted = uuids.map(formatUuid).join("\n");
    await navigator.clipboard.writeText(allFormatted);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col justify-between py-8 px-6">
      <div className="w-full max-w-5xl mx-auto flex flex-col flex-1">
        {/* Top Header */}
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
              UUID Generator
            </h1>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Cryptographically Secure (Web Crypto)
          </span>
        </header>

        {/* Configuration Bar */}
        <div className="bg-[#0a0b0e] border border-zinc-800 p-4 mb-6 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Version Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-mono">Version:</span>
                <div className="flex border border-zinc-800 bg-black">
                  <button
                    type="button"
                    onClick={() => handleVersionChange("v4")}
                    className={`px-3 py-1 text-xs font-mono transition-colors ${
                      version === "v4"
                        ? "bg-blue-600 text-white"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    v4 (Random)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVersionChange("v7")}
                    className={`px-3 py-1 text-xs font-mono transition-colors ${
                      version === "v7"
                        ? "bg-blue-600 text-white"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    v7 (Time-Ordered)
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-mono">Count:</span>
                <select
                  value={count}
                  onChange={(e) => handleCountChange(Number(e.target.value))}
                  className="bg-black border border-zinc-800 text-zinc-200 text-xs px-2.5 py-1 outline-none font-mono"
                >
                  <option value={1}>1</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Regenerate Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleGenerate()}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw size={13} />
                <span>Regenerate</span>
              </button>
            </div>
          </div>

          {/* Format switches */}
          <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-zinc-900 text-xs text-zinc-400 select-none">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hyphens}
                onChange={(e) => setHyphens(e.target.checked)}
                className="accent-blue-600"
              />
              <span>Include Hyphens</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="accent-blue-600"
              />
              <span>Uppercase</span>
            </label>

            <span className="text-[11px] text-zinc-600 ml-auto font-mono">
              {version === "v7" ? "RFC 9562 (timestamped)" : "RFC 4122 (pseudo-random)"}
            </span>
          </div>
        </div>

        {/* Results List */}
        <div className="border border-zinc-800 bg-[#0a0b0e] flex flex-col flex-1">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2.5 bg-black/40 text-xs">
            <span className="font-mono text-zinc-400 uppercase text-[11px] tracking-wider">
              Generated UUIDs ({uuids.length})
            </span>
            <button
              type="button"
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white font-mono text-[11px] transition-colors"
            >
              {copiedAll ? (
                <>
                  <Check size={13} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied All</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy All</span>
                </>
              )}
            </button>
          </div>

          <div className="divide-y divide-zinc-900 overflow-y-auto max-h-[550px]">
            {uuids.map((id, index) => {
              const formatted = formatUuid(id);
              const isCopied = copiedIndex === index;

              return (
                <div
                  key={index}
                  className="flex items-center justify-between px-4 py-3 hover:bg-[#0e1015] transition-colors group"
                >
                  <span className="font-mono text-xs text-zinc-200 select-all tracking-wide">
                    {formatted}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleCopyOne(id, index)}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] font-mono text-zinc-500 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
                  >
                    {isCopied ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevVault · UUID Generator
      </footer>
    </div>
  );
}