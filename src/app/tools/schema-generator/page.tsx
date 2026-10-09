"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  FileCode,
  Shield,
  Trash2,
} from "lucide-react";

const SAMPLE_JSON = `{
  "id": 101,
  "name": "Jane Developer",
  "email": "jane@example.com",
  "isActive": true,
  "roles": ["admin", "editor"],
  "profile": {
    "bio": "Full-stack engineer",
    "avatarUrl": "https://example.com/avatar.png"
  }
}`;

function generateZodSchema(obj: unknown, indent = 2): string {
  const pad = " ".repeat(indent);

  if (obj === null || obj === undefined) return "z.unknown()";
  if (typeof obj === "string") return "z.string()";
  if (typeof obj === "number") return Number.isInteger(obj) ? "z.number().int()" : "z.number()";
  if (typeof obj === "boolean") return "z.boolean()";

  if (Array.isArray(obj)) {
    if (obj.length === 0) return "z.array(z.unknown())";
    const itemSchema = generateZodSchema(obj[0], indent);
    return `z.array(${itemSchema})`;
  }

  if (typeof obj === "object") {
    const keys = Object.keys(obj as Record<string, unknown>);
    if (keys.length === 0) return "z.record(z.unknown())";

    const fields = keys.map((key) => {
      const val = (obj as Record<string, unknown>)[key];
      return `${pad}  ${key}: ${generateZodSchema(val, indent + 2)},`;
    });

    return `z.object({\n${fields.join("\n")}\n${pad}})`;
  }

  return "z.unknown()";
}

function generateTsInterface(obj: unknown, name = "RootObject", indent = 2): string {
  const pad = " ".repeat(indent);

  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
    return `export type ${name} = ${getTypeString(obj)};`;
  }

  const keys = Object.keys(obj as Record<string, unknown>);
  const fields = keys.map((key) => {
    const val = (obj as Record<string, unknown>)[key];
    return `${pad}${key}: ${getTypeString(val, indent + 2)};`;
  });

  return `export interface ${name} {\n${fields.join("\n")}\n}`;
}

function getTypeString(val: unknown, indent = 2): string {
  if (val === null || val === undefined) return "unknown";
  if (typeof val === "string") return "string";
  if (typeof val === "number") return "number";
  if (typeof val === "boolean") return "boolean";

  if (Array.isArray(val)) {
    if (val.length === 0) return "unknown[]";
    return `${getTypeString(val[0], indent)}[]`;
  }

  if (typeof val === "object") {
    const pad = " ".repeat(indent);
    const keys = Object.keys(val as Record<string, unknown>);
    const fields = keys.map((k) => {
      return `${pad}${k}: ${getTypeString((val as Record<string, unknown>)[k], indent + 2)};`;
    });
    return `{\n${fields.join("\n")}\n${" ".repeat(indent - 2)}}`;
  }

  return "unknown";
}

export default function SchemaGeneratorPage() {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [target, setTarget] = useState<"zod" | "ts">("zod");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getGeneratedCode = (): string => {
    if (!input.trim()) return "";
    try {
      const parsed = JSON.parse(input);
      if (target === "zod") {
        return `import { z } from "zod";\n\nexport const RootSchema = ${generateZodSchema(parsed, 0)};\n\nexport type Root = z.infer<typeof RootSchema>;`;
      }
      return generateTsInterface(parsed, "RootData", 2);
    } catch (err: unknown) {
      if (err instanceof Error) {
        return `// Error parsing JSON: ${err.message}`;
      }
      return "// Invalid JSON syntax";
    }
  };

  const output = getGeneratedCode();

  const handleInputChange = (val: string) => {
    setInput(val);
    try {
      JSON.parse(val);
      setError(null);
    } catch {
      setError("Invalid JSON format");
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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
              Schema & Validator Generator
            </h1>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Zod 3 & TypeScript
          </span>
        </header>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a0b0e] border border-zinc-800 p-2.5 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex border border-zinc-800 bg-black font-mono text-xs">
              <button
                type="button"
                onClick={() => setTarget("zod")}
                className={`px-3 py-1.5 flex items-center gap-1.5 transition-colors ${
                  target === "zod"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Shield size={13} />
                <span>Zod Validator</span>
              </button>
              <button
                type="button"
                onClick={() => setTarget("ts")}
                className={`px-3 py-1.5 flex items-center gap-1.5 transition-colors ${
                  target === "ts"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <FileCode size={13} />
                <span>TypeScript Interfaces</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleInputChange(SAMPLE_JSON)}
              className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs transition-colors"
            >
              Sample
            </button>
            <button
              type="button"
              onClick={() => handleInputChange("")}
              className="p-1.5 bg-zinc-900 border border-zinc-800 hover:bg-red-950/40 hover:border-red-800 hover:text-red-400 text-zinc-400 text-xs transition-colors"
              title="Clear"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/20 border border-red-800/80 text-red-400 px-3.5 py-1.5 text-xs font-mono mb-4">
            {error}
          </div>
        )}

        {/* Dual Input/Output Workspaces */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          {/* Input Panel */}
          <div className="flex flex-col border border-zinc-800 bg-[#0a0b0e]">
            <div className="border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400 bg-black/40 font-mono uppercase text-[11px]">
              Raw JSON Data
            </div>
            <textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Paste valid JSON object here..."
              spellCheck={false}
              className="w-full flex-1 bg-transparent p-4 text-xs font-mono text-zinc-200 resize-none outline-none min-h-[460px]"
            />
          </div>

          {/* Generated Code Output */}
          <div className="flex flex-col border border-zinc-800 bg-[#0a0b0e]">
            <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400 bg-black/40">
              <span className="font-mono uppercase text-[11px] tracking-wider text-blue-400 font-semibold">
                Generated {target === "zod" ? "Zod Schema" : "TypeScript Interface"}
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
                    <span className="text-emerald-400 font-mono text-[11px]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span className="font-mono text-[11px]">Copy Code</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              readOnly
              value={output}
              spellCheck={false}
              className="w-full flex-1 bg-transparent p-4 text-xs font-mono text-zinc-200 resize-none outline-none min-h-[460px]"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevEverTools · Schema & Validator Generator
      </footer>
    </div>
  );
}