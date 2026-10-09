"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Trash2,
  FileJson,
} from "lucide-react";

const SAMPLE_JSON = `{
  "id": 101,
  "username": "mubashir",
  "email": "mubashir@example.com",
  "isActive": true,
  "roles": ["admin", "developer"],
  "profile": {
    "bio": "Building DevVault utilities",
    "reputation": 450,
    "socialLinks": [
      { "platform": "github", "url": "https://github.com" },
      { "platform": "twitter", "url": "https://twitter.com" }
    ]
  },
  "metadata": null
}`;

function toPascalCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter) => letter.toUpperCase())
    .replace(/[\s\-_]+/g, "");
}

function generateTypeScript(
  rawJson: string,
  rootName: string,
  useTypeAlias: boolean,
  exportKeyword: boolean,
  optionalProps: boolean
): string {
  const parsed: unknown = JSON.parse(rawJson);
  const interfaces: Map<string, string> = new Map();

  function inferType(val: unknown, keyHint: string): string {
    if (val === null) return "null";
    if (val === undefined) return "undefined";

    const type = typeof val;
    if (type === "string") return "string";
    if (type === "number") return "number";
    if (type === "boolean") return "boolean";

    if (Array.isArray(val)) {
      if (val.length === 0) return "unknown[]";
      const itemTypes = Array.from(
        new Set(val.map((item, idx) => inferType(item, `${keyHint}Item${idx}`)))
      );
      if (itemTypes.length === 1) {
        const singleType = itemTypes[0];
        return singleType.includes(" ") ? `(${singleType})[]` : `${singleType}[]`;
      }
      return `(${itemTypes.join(" | ")})[]`;
    }

    if (typeof val === "object") {
      const typeName = toPascalCase(keyHint);
      parseObject(val as Record<string, unknown>, typeName);
      return typeName;
    }

    return "unknown";
  }

  function parseObject(obj: Record<string, unknown>, name: string) {
    const lines: string[] = [];
    const opt = optionalProps ? "?" : "";

    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)
        ? key
        : JSON.stringify(key);
      const childTypeName = inferType(value, key);
      lines.push(`  ${sanitizedKey}${opt}: ${childTypeName};`);
    }

    const prefix = exportKeyword ? "export " : "";
    if (useTypeAlias) {
      interfaces.set(
        name,
        `${prefix}type ${name} = {\n${lines.join("\n")}\n};`
      );
    } else {
      interfaces.set(
        name,
        `${prefix}interface ${name} {\n${lines.join("\n")}\n}`
      );
    }
  }

  if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
    parseObject(parsed as Record<string, unknown>, toPascalCase(rootName) || "RootObject");
  } else if (Array.isArray(parsed)) {
    const childType = inferType(parsed, rootName);
    const prefix = exportKeyword ? "export " : "";
    return `${prefix}type ${toPascalCase(rootName) || "RootList"} = ${childType};`;
  } else {
    const prefix = exportKeyword ? "export " : "";
    return `${prefix}type ${toPascalCase(rootName) || "PrimitiveType"} = ${typeof parsed};`;
  }

  return Array.from(interfaces.values()).reverse().join("\n\n");
}

export default function JsonToTypescriptPage() {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [output, setOutput] = useState("");
  const [rootName, setRootName] = useState("RootObject");
  const [useTypeAlias, setUseTypeAlias] = useState(false);
  const [exportKeyword, setExportKeyword] = useState(true);
  const [optionalProps, setOptionalProps] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleConvert = (
    raw = input,
    name = rootName,
    isType = useTypeAlias,
    isExport = exportKeyword,
    isOpt = optionalProps
  ) => {
    if (!raw.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    try {
      const result = generateTypeScript(raw, name, isType, isExport, isOpt);
      setOutput(result);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Invalid JSON: ${err.message}`);
      } else {
        setError("Invalid JSON format");
      }
    }
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
              JSON to TypeScript Generator
            </h1>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Static Type Inference
          </span>
        </header>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a0b0e] border border-zinc-800 p-2.5 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => handleConvert()}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <FileJson size={14} />
              <span>Generate Types</span>
            </button>

            {/* Root Name Input */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
              <span className="text-[11px]">Root:</span>
              <input
                type="text"
                value={rootName}
                onChange={(e) => {
                  setRootName(e.target.value);
                  handleConvert(input, e.target.value);
                }}
                className="bg-black border border-zinc-800 px-2 py-1 text-xs text-zinc-200 outline-none w-28 focus:border-blue-600"
              />
            </div>

            {/* Toggles */}
            <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={exportKeyword}
                onChange={(e) => {
                  setExportKeyword(e.target.checked);
                  handleConvert(input, rootName, useTypeAlias, e.target.checked);
                }}
                className="accent-blue-600"
              />
              <span>Export</span>
            </label>

            <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={useTypeAlias}
                onChange={(e) => {
                  setUseTypeAlias(e.target.checked);
                  handleConvert(input, rootName, e.target.checked);
                }}
                className="accent-blue-600"
              />
              <span>Type Alias</span>
            </label>

            <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={optionalProps}
                onChange={(e) => {
                  setOptionalProps(e.target.checked);
                  handleConvert(input, rootName, useTypeAlias, exportKeyword, e.target.checked);
                }}
                className="accent-blue-600"
              />
              <span>Optional (?)</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setInput(SAMPLE_JSON);
                handleConvert(SAMPLE_JSON);
              }}
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

        {/* Error notification */}
        {error && (
          <div className="bg-red-950/20 border border-red-800/80 text-red-400 px-3.5 py-2 text-xs font-mono mb-4 flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-[10px] bg-red-900/40 border border-red-700/60 px-1.5 py-0.5">
              Parse Error
            </span>
            <span>{error}</span>
          </div>
        )}

        {/* Dual Pane Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          {/* Input JSON Panel */}
          <div className="flex flex-col border border-zinc-800 bg-[#0a0b0e]">
            <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400 bg-black/40">
              <span className="font-mono uppercase text-[11px] tracking-wider">
                Raw JSON
              </span>
              <span className="text-[11px] font-mono text-zinc-600">
                {input.length} characters
              </span>
            </div>
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                handleConvert(e.target.value);
              }}
              placeholder="Paste raw JSON here..."
              spellCheck={false}
              className="w-full flex-1 bg-transparent p-4 text-xs font-mono text-zinc-200 resize-none outline-none min-h-[440px]"
            />
          </div>

          {/* Output TypeScript Panel */}
          <div className="flex flex-col border border-zinc-800 bg-[#0a0b0e]">
            <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400 bg-black/40">
              <span className="font-mono text-blue-400 uppercase text-[11px] tracking-wider font-semibold">
                TypeScript Definitions
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
                    <span className="font-mono text-[11px]">Copy TS</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              readOnly
              value={output}
              placeholder="TypeScript interfaces will generate automatically..."
              spellCheck={false}
              className="w-full flex-1 bg-transparent p-4 text-xs font-mono text-blue-200/90 resize-none outline-none min-h-[440px]"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevVault · JSON to TypeScript Generator
      </footer>
    </div>
  );
}