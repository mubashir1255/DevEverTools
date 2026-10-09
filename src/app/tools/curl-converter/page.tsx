"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Trash2,
  Terminal,
} from "lucide-react";

const SAMPLE_CURL = `curl -X POST https://api.devvault.local/v1/projects \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer dev_token_secret_123" \\
  -d '{"name": "DevVault", "visibility": "public"}'`;

type TargetLanguage = "fetch" | "axios" | "python";

type ParsedCurl = {
  url: string;
  method: string;
  headers: Record<string, string>;
  data: string | null;
};

function parseCurl(command: string): ParsedCurl {
  const cleaned = command.replace(/\\\n/g, " ").replace(/\s+/g, " ").trim();
  const tokens = cleaned.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];

  let url = "";
  let method = "GET";
  const headers: Record<string, string> = {};
  let data: string | null = null;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i].replace(/^['"]|['"]$/g, "");

    if (token === "-X" || token === "--request") {
      method = (tokens[++i] || "GET").replace(/^['"]|['"]$/g, "").toUpperCase();
    } else if (token === "-H" || token === "--header") {
      const headerStr = (tokens[++i] || "").replace(/^['"]|['"]$/g, "");
      const colonIdx = headerStr.indexOf(":");
      if (colonIdx > 0) {
        const key = headerStr.substring(0, colonIdx).trim();
        const value = headerStr.substring(colonIdx + 1).trim();
        headers[key] = value;
      }
    } else if (token === "-d" || token === "--data" || token === "--data-raw") {
      data = (tokens[++i] || "").replace(/^['"]|['"]$/g, "");
      if (method === "GET") method = "POST";
    } else if (token === "-u" || token === "--user") {
      const auth = (tokens[++i] || "").replace(/^['"]|['"]$/g, "");
      if (typeof window !== "undefined") {
        headers["Authorization"] = `Basic ${btoa(auth)}`;
      }
    } else if (
      !token.startsWith("-") &&
      token !== "curl" &&
      !url &&
      (token.startsWith("http://") || token.startsWith("https://") || token.includes("."))
    ) {
      url = token;
    }
  }

  return { url: url || "https://api.example.com", method, headers, data };
}

function generateFetch(parsed: ParsedCurl): string {
  const options: Record<string, unknown> = {
    method: parsed.method,
  };

  if (Object.keys(parsed.headers).length > 0) {
    options.headers = parsed.headers;
  }

  if (parsed.data) {
    try {
      options.body = JSON.parse(parsed.data);
    } catch {
      options.body = parsed.data;
    }
  }

  const lines = [
    `const response = await fetch("${parsed.url}", {`,
    `  method: "${parsed.method}",`,
  ];

  if (Object.keys(parsed.headers).length > 0) {
    lines.push(`  headers: ${JSON.stringify(parsed.headers, null, 4).replace(/\n/g, "\n  ")},`);
  }

  if (parsed.data) {
    const isJson = parsed.headers["Content-Type"]?.includes("application/json");
    if (isJson) {
      lines.push(`  body: JSON.stringify(${parsed.data}),`);
    } else {
      lines.push(`  body: "${parsed.data}",`);
    }
  }

  lines.push("});");
  lines.push("const data = await response.json();");
  return lines.join("\n");
}

function generateAxios(parsed: ParsedCurl): string {
  const lines = [
    `import axios from "axios";`,
    ``,
    `const response = await axios({`,
    `  url: "${parsed.url}",`,
    `  method: "${parsed.method.toLowerCase()}",`,
  ];

  if (Object.keys(parsed.headers).length > 0) {
    lines.push(`  headers: ${JSON.stringify(parsed.headers, null, 4).replace(/\n/g, "\n  ")},`);
  }

  if (parsed.data) {
    try {
      const parsedObj = JSON.parse(parsed.data);
      lines.push(`  data: ${JSON.stringify(parsedObj, null, 4).replace(/\n/g, "\n  ")},`);
    } catch {
      lines.push(`  data: "${parsed.data}",`);
    }
  }

  lines.push("});");
  return lines.join("\n");
}

function generatePython(parsed: ParsedCurl): string {
  const lines = [`import requests`, ``];

  if (Object.keys(parsed.headers).length > 0) {
    lines.push(`headers = ${JSON.stringify(parsed.headers, null, 4)}`);
  }

  if (parsed.data) {
    try {
      const parsedObj = JSON.parse(parsed.data);
      lines.push(`payload = ${JSON.stringify(parsedObj, null, 4)}`);
    } catch {
      lines.push(`payload = "${parsed.data}"`);
    }
  }

  const args = [`"${parsed.url}"`];
  if (Object.keys(parsed.headers).length > 0) args.push("headers=headers");
  if (parsed.data) {
    const isJson = parsed.headers["Content-Type"]?.includes("application/json");
    args.push(isJson ? "json=payload" : "data=payload");
  }

  lines.push(``);
  lines.push(`response = requests.${parsed.method.toLowerCase()}(${args.join(", ")})`);
  lines.push(`print(response.json())`);
  return lines.join("\n");
}

export default function CurlConverterPage() {
  const [input, setInput] = useState(SAMPLE_CURL);
  const [target, setTarget] = useState<TargetLanguage>("fetch");
  const [copied, setCopied] = useState(false);

  const parsed = parseCurl(input);

  const getOutput = (): string => {
    if (!input.trim()) return "";
    if (target === "fetch") return generateFetch(parsed);
    if (target === "axios") return generateAxios(parsed);
    return generatePython(parsed);
  };

  const output = getOutput();

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
              cURL Command Converter
            </h1>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Fetch · Axios · Python Requests
          </span>
        </header>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a0b0e] border border-zinc-800 p-2.5 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex border border-zinc-800 bg-black font-mono text-xs">
              <button
                type="button"
                onClick={() => setTarget("fetch")}
                className={`px-3 py-1.5 transition-colors ${
                  target === "fetch"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                JavaScript Fetch
              </button>
              <button
                type="button"
                onClick={() => setTarget("axios")}
                className={`px-3 py-1.5 transition-colors ${
                  target === "axios"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Node Axios
              </button>
              <button
                type="button"
                onClick={() => setTarget("python")}
                className={`px-3 py-1.5 transition-colors ${
                  target === "python"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Python Requests
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setInput(SAMPLE_CURL)}
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

        {/* Dual Input/Output Workspaces */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          {/* Curl Command Input */}
          <div className="flex flex-col border border-zinc-800 bg-[#0a0b0e]">
            <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400 bg-black/40">
              <span className="font-mono uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                <Terminal size={13} className="text-blue-400" />
                <span>cURL Command</span>
              </span>
              <span className="text-[11px] font-mono text-zinc-600">
                {input.length} chars
              </span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste curl command here..."
              spellCheck={false}
              className="w-full flex-1 bg-transparent p-4 text-xs font-mono text-zinc-200 resize-none outline-none min-h-[460px]"
            />
          </div>

          {/* Converted Code Output */}
          <div className="flex flex-col border border-zinc-800 bg-[#0a0b0e]">
            <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400 bg-black/40">
              <span className="font-mono uppercase text-[11px] tracking-wider text-blue-400 font-semibold">
                {target === "fetch" && "Native fetch() Snippet"}
                {target === "axios" && "Axios Request Snippet"}
                {target === "python" && "Python requests Code"}
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
                    <span className="font-mono text-[11px]">Copy Code</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              readOnly
              value={output}
              placeholder="Converted code will appear here automatically..."
              spellCheck={false}
              className="w-full flex-1 bg-transparent p-4 text-xs font-mono text-zinc-300 resize-none outline-none min-h-[460px]"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevVault · cURL Converter
      </footer>
    </div>
  );
}