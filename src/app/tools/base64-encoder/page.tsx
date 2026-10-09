"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRightLeft,
  Check,
  Copy,
  Trash2,
  Upload,
} from "lucide-react";

// UTF-8 Safe Base64 Helpers
function utf8ToBase64(str: string, urlSafe = false): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  let b64 = window.btoa(binary);
  if (urlSafe) {
    b64 = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return b64;
}

function base64ToUtf8(b64: string): string {
  let standardB64 = b64.replace(/-/g, "+").replace(/_/g, "/");
  while (standardB64.length % 4 !== 0) {
    standardB64 += "=";
  }
  const binary = window.atob(standardB64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export default function Base64Page() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [urlSafe, setUrlSafe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [, startTransition] = useTransition();

  const processText = (text: string, currentMode: "encode" | "decode", isUrlSafe: boolean) => {
    if (!text.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    try {
      if (currentMode === "encode") {
        setOutput(utf8ToBase64(text, isUrlSafe));
      } else {
        setOutput(base64ToUtf8(text.trim()));
      }
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid Base64 string for decoding");
      }
    }
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    startTransition(() => {
      processText(value, mode, urlSafe);
    });
  };

  const toggleMode = () => {
    const nextMode = mode === "encode" ? "decode" : "encode";
    setMode(nextMode);
    // Swap input and output for quick reversing
    setInput(output);
    processText(output, nextMode, urlSafe);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setInput(`[File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]`);
      setOutput(result);
      setError(null);
    };
    reader.onerror = () => {
      setError("Failed to read file.");
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
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
              Base64 Encoder / Decoder
            </h1>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Pure Client-Side · UTF-8 Safe
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
                  processText(input, "encode", urlSafe);
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
                  processText(input, "decode", urlSafe);
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

            {/* Reverse / Swap Button */}
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

            {/* URL Safe Toggle */}
            {mode === "encode" && (
              <label className="flex items-center gap-2 ml-2 text-xs text-zinc-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={urlSafe}
                  onChange={(e) => {
                    setUrlSafe(e.target.checked);
                    processText(input, mode, e.target.checked);
                  }}
                  className="accent-blue-600"
                />
                <span>URL-safe Base64</span>
              </label>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* File to Data URI */}
            <label className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs flex items-center gap-1.5 cursor-pointer transition-colors">
              <Upload size={13} />
              <span>Upload File to Base64</span>
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>

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
              Decode Error
            </span>
            <span>{error}</span>
          </div>
        )}

        {/* Dual Textareas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          {/* Input Panel */}
          <div className="flex flex-col border border-zinc-800 bg-[#0a0b0e]">
            <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400 bg-black/40">
              <span className="font-mono uppercase text-[11px] tracking-wider">
                {mode === "encode" ? "Plain Text / String" : "Base64 String"}
              </span>
              <span className="text-[11px] font-mono text-zinc-600">
                {input.length} chars
              </span>
            </div>
            <textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={
                mode === "encode"
                  ? "Type or paste text to encode..."
                  : "Paste Base64 string to decode..."
              }
              spellCheck={false}
              className="w-full flex-1 bg-transparent p-4 text-xs font-mono text-zinc-200 resize-none outline-none min-h-[420px]"
            />
          </div>

          {/* Output Panel */}
          <div className="flex flex-col border border-zinc-800 bg-[#0a0b0e]">
            <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400 bg-black/40">
              <span className="font-mono uppercase text-[11px] tracking-wider">
                {mode === "encode" ? "Base64 Output" : "Decoded Text"}
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
              placeholder="Output will appear in real time..."
              spellCheck={false}
              className="w-full flex-1 bg-transparent p-4 text-xs font-mono text-zinc-300 resize-none outline-none min-h-[420px]"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevVault · Base64 Encoder & Decoder
      </footer>
    </div>
  );
}