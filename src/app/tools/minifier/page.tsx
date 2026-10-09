"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Trash2,
  Minimize2,
  TrendingDown,
} from "lucide-react";

type Language = "json" | "css" | "html";

const SAMPLES: Record<Language, string> = {
  json: `{\n  "name": "DevVault",\n  "version": "1.0.0",\n  "description": "Zero-telemetry tools",\n  "features": [\n    "json-formatter",\n    "jwt-decoder",\n    "hash-generator"\n  ]\n}`,
  css: `/* Global Reset Styles */\n.header-container {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 16px 24px;\n  background-color: #0a0b0e;\n}\n\n.nav-link {\n  color: #a1a1aa;\n  font-size: 14px;\n  text-decoration: none;\n}`,
  html: `<!-- Navigation Bar -->\n<nav class="navbar">\n  <div class="logo">\n    <a href="/">DevVault</a>\n  </div>\n  <ul class="nav-links">\n    <li><a href="/tools">Tools</a></li>\n    <li><a href="/about">About</a></li>\n  </ul>\n</nav>`,
};

function minifyJson(raw: string): string {
  const parsed = JSON.parse(raw);
  return JSON.stringify(parsed);
}

function minifyCss(raw: string): string {
  return raw
    .replace(/\/\*[\s\S]*?\*\//g, "") // Remove comments
    .replace(/\s+/g, " ") // Collapse whitespace
    .replace(/\s*([{}:;,])\s*/g, "$1") // Remove spaces around delimiters
    .replace(/;}/g, "}") // Remove trailing semicolons
    .trim();
}

function minifyHtml(raw: string): string {
  return raw
    .replace(/<!--[\s\S]*?-->/g, "") // Remove HTML comments
    .replace(/>\s+</g, "><") // Remove whitespace between tags
    .replace(/\s+/g, " ") // Collapse internal whitespace
    .trim();
}

export default function MinifierPage() {
  const [lang, setLang] = useState<Language>("json");
  const [input, setInput] = useState<string>(SAMPLES.json);
  const [output, setOutput] = useState<string>(() => minifyJson(SAMPLES.json));
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const processMinify = (code: string, currentLang: Language) => {
    if (!code.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    try {
      if (currentLang === "json") {
        setOutput(minifyJson(code));
      } else if (currentLang === "css") {
        setOutput(minifyCss(code));
      } else {
        setOutput(minifyHtml(code));
      }
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Minification error: ${err.message}`);
      } else {
        setError("Invalid syntax for selected language");
      }
    }
  };

  const handleLangChange = (nextLang: Language) => {
    setLang(nextLang);
    setInput(SAMPLES[nextLang]);
    processMinify(SAMPLES[nextLang], nextLang);
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    processMinify(val, lang);
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

  const originalSize = new Blob([input]).size;
  const minifiedSize = new Blob([output]).size;
  const savings =
    originalSize > 0 && minifiedSize > 0 && originalSize >= minifiedSize
      ? Math.round(((originalSize - minifiedSize) / originalSize) * 100)
      : 0;

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
              Code Minifier
            </h1>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            JSON · CSS · HTML
          </span>
        </header>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a0b0e] border border-zinc-800 p-2.5 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Language Switcher */}
            <div className="flex border border-zinc-800 bg-black">
              {(["json", "css", "html"] as Language[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleLangChange(t)}
                  className={`px-3 py-1.5 text-xs font-mono uppercase transition-colors ${
                    lang === t
                      ? "bg-blue-600 text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Savings Stat */}
            {savings > 0 && (
              <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/20 border border-emerald-800/80 px-2.5 py-1">
                <TrendingDown size={13} />
                <span>{savings}% reduced</span>
                <span className="text-zinc-500 text-[10px]">
                  ({originalSize}B → {minifiedSize}B)
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setInput(SAMPLES[lang]);
                processMinify(SAMPLES[lang], lang);
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

        {/* Error notification */}
        {error && (
          <div className="bg-red-950/20 border border-red-800/80 text-red-400 px-3.5 py-2 text-xs font-mono mb-4 flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-[10px] bg-red-900/40 border border-red-700/60 px-1.5 py-0.5">
              Error
            </span>
            <span>{error}</span>
          </div>
        )}

        {/* Dual Input/Output Panes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          {/* Input Panel */}
          <div className="flex flex-col border border-zinc-800 bg-[#0a0b0e]">
            <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400 bg-black/40">
              <span className="font-mono uppercase text-[11px] tracking-wider">
                Raw Input ({lang.toUpperCase()})
              </span>
              <span className="text-[11px] font-mono text-zinc-600">
                {originalSize} bytes
              </span>
            </div>
            <textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={`Paste raw ${lang.toUpperCase()} code here...`}
              spellCheck={false}
              className="w-full flex-1 bg-transparent p-4 text-xs font-mono text-zinc-200 resize-none outline-none min-h-[460px]"
            />
          </div>

          {/* Minified Output Panel */}
          <div className="flex flex-col border border-zinc-800 bg-[#0a0b0e]">
            <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400 bg-black/40">
              <span className="font-mono uppercase text-[11px] tracking-wider text-blue-400 font-semibold flex items-center gap-1.5">
                <Minimize2 size={13} />
                <span>Minified Output</span>
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
                    <span className="font-mono text-[11px]">Copy Minified</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              readOnly
              value={output}
              placeholder="Minified output will appear here automatically..."
              spellCheck={false}
              className="w-full flex-1 bg-transparent p-4 text-xs font-mono text-zinc-300 resize-none outline-none min-h-[460px]"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevVault · Code Minifier
      </footer>
    </div>
  );
}