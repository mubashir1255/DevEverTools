"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  RefreshCw,
  ShieldCheck,
  KeyRound,
} from "lucide-react";

const CHAR_SETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  ambiguous: "{}[]()/\\'\"`~,;:.<>",
};

function generateSecureRandomString(
  length: number,
  charset: string,
  excludeAmbiguous = false
): string {
  if (!charset) return "";

  let finalCharset = charset;
  if (excludeAmbiguous) {
    for (const ch of CHAR_SETS.ambiguous) {
      finalCharset = finalCharset.replaceAll(ch, "");
    }
    finalCharset = finalCharset.replace(/[O0Il1]/g, "");
  }

  if (!finalCharset) return "";

  const bytes = new Uint32Array(length);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 0xffffffff);
    }
  }

  let result = "";
  for (let i = 0; i < length; i++) {
    result += finalCharset[bytes[i] % finalCharset.length];
  }
  return result;
}

function calculateEntropy(length: number, charsetSize: number): number {
  if (charsetSize <= 0 || length <= 0) return 0;
  return Math.round(length * Math.log2(charsetSize));
}

export default function PasswordGeneratorPage() {
  const [length, setLength] = useState(20);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [avoidAmbiguous, setAvoidAmbiguous] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const getCharset = useCallback(() => {
    let set = "";
    if (includeUpper) set += CHAR_SETS.uppercase;
    if (includeLower) set += CHAR_SETS.lowercase;
    if (includeNumbers) set += CHAR_SETS.numbers;
    if (includeSymbols) set += CHAR_SETS.symbols;
    return set;
  }, [includeUpper, includeLower, includeNumbers, includeSymbols]);

  const [passwords, setPasswords] = useState<string[]>(() => {
    const initSet =
      CHAR_SETS.uppercase + CHAR_SETS.lowercase + CHAR_SETS.numbers + CHAR_SETS.symbols;
    return [generateSecureRandomString(20, initSet, false)];
  });

  const handleGenerate = (currentLength = length) => {
    const set = getCharset();
    if (!set) {
      setPasswords([""]);
      return;
    }
    const list: string[] = [];
    for (let i = 0; i < 5; i++) {
      list.push(generateSecureRandomString(currentLength, set, avoidAmbiguous));
    }
    setPasswords(list);
  };

  const handleCopy = async (val: string, key: string) => {
    if (!val) return;
    await navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const charsetSize = getCharset().length;
  const entropy = calculateEntropy(length, charsetSize);

  let strengthLabel = "Weak";
  let strengthColor = "text-red-400 border-red-800/80 bg-red-950/20";
  if (entropy >= 80) {
    strengthLabel = "Fortified";
    strengthColor = "text-emerald-400 border-emerald-800/80 bg-emerald-950/20";
  } else if (entropy >= 60) {
    strengthLabel = "Strong";
    strengthColor = "text-blue-400 border-blue-800/80 bg-blue-950/20";
  } else if (entropy >= 40) {
    strengthLabel = "Moderate";
    strengthColor = "text-amber-400 border-amber-800/80 bg-amber-950/20";
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col justify-between py-8 px-6">
      <div className="w-full max-w-5xl mx-auto flex flex-col flex-1">
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
              Password & Token Generator
            </h1>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Cryptographically Secure (Web Crypto)
          </span>
        </header>

        {/* Primary Secret Display Banner */}
        <div className="bg-[#0a0b0e] border border-zinc-800 p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
          <div className="flex items-center gap-3 overflow-hidden">
            <KeyRound size={18} className="text-blue-400 shrink-0" />
            <span className="text-base text-white tracking-wider break-all select-all font-semibold">
              {passwords[0] || "Select options to generate"}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleGenerate(length)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw size={13} />
              <span>Generate</span>
            </button>
            <button
              type="button"
              onClick={() => handleCopy(passwords[0], "main")}
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 text-xs flex items-center gap-1.5 transition-colors"
            >
              {copiedKey === "main" ? (
                <>
                  <Check size={13} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Configuration Controls */}
        <div className="bg-[#0a0b0e] border border-zinc-800 p-5 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-zinc-400 uppercase tracking-wider">
                Length:
              </span>
              <span className="font-mono text-base font-bold text-white min-w-[32px]">
                {length}
              </span>
              <input
                type="range"
                min={8}
                max={64}
                value={length}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setLength(val);
                  handleGenerate(val);
                }}
                className="w-48 accent-blue-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="text-zinc-500">Entropy: {entropy} bits</span>
              <div
                className={`flex items-center gap-1 px-2.5 py-0.5 border text-[11px] font-semibold uppercase tracking-wider ${strengthColor}`}
              >
                <ShieldCheck size={12} />
                <span>{strengthLabel}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono text-zinc-300 pt-4 border-t border-zinc-900 select-none">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeUpper}
                onChange={(e) => setIncludeUpper(e.target.checked)}
                className="accent-blue-600"
              />
              <span>Uppercase (A-Z)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeLower}
                onChange={(e) => setIncludeLower(e.target.checked)}
                className="accent-blue-600"
              />
              <span>Lowercase (a-z)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeNumbers}
                onChange={(e) => setIncludeNumbers(e.target.checked)}
                className="accent-blue-600"
              />
              <span>Numbers (0-9)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSymbols}
                onChange={(e) => setIncludeSymbols(e.target.checked)}
                className="accent-blue-600"
              />
              <span>Symbols (!@#$)</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-zinc-900 text-xs font-mono">
            <span className="text-[11px] text-zinc-500 uppercase mr-2">Presets:</span>
            <button
              type="button"
              onClick={() => {
                setLength(16);
                setIncludeUpper(true);
                setIncludeLower(true);
                setIncludeNumbers(true);
                setIncludeSymbols(true);
                setAvoidAmbiguous(false);
                handleGenerate(16);
              }}
              className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-[11px]"
            >
              16-Char Strong
            </button>
            <button
              type="button"
              onClick={() => {
                setLength(32);
                setIncludeUpper(true);
                setIncludeLower(true);
                setIncludeNumbers(true);
                setIncludeSymbols(false);
                setAvoidAmbiguous(false);
                handleGenerate(32);
              }}
              className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-[11px]"
            >
              32-Char API Secret
            </button>
            <button
              type="button"
              onClick={() => {
                setLength(64);
                setIncludeUpper(true);
                setIncludeLower(true);
                setIncludeNumbers(true);
                setIncludeSymbols(true);
                setAvoidAmbiguous(false);
                handleGenerate(64);
              }}
              className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-[11px]"
            >
              64-Char Auth Token
            </button>
            <button
              type="button"
              onClick={() => {
                setLength(6);
                setIncludeUpper(false);
                setIncludeLower(false);
                setIncludeNumbers(true);
                setIncludeSymbols(false);
                setAvoidAmbiguous(false);
                handleGenerate(6);
              }}
              className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-[11px]"
            >
              6-Digit PIN
            </button>
          </div>
        </div>

        {/* Alternative Batch List */}
        <div className="border border-zinc-800 bg-[#0a0b0e] flex flex-col flex-1">
          <div className="border-b border-zinc-800 px-4 py-2.5 bg-black/40 text-xs font-mono text-zinc-400 uppercase tracking-wider text-[11px]">
            Alternative Generated Keys
          </div>
          <div className="divide-y divide-zinc-900">
            {passwords.slice(1).map((pass, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 hover:bg-[#0e1015] font-mono text-xs transition-colors"
              >
                <span className="text-zinc-300 select-all truncate pr-4">
                  {pass}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(pass, `alt-${idx}`)}
                  className="px-2 py-1 text-[11px] text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 shrink-0"
                >
                  {copiedKey === `alt-${idx}` ? "Copied" : "Copy"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevVault · Password & Token Generator
      </footer>
    </div>
  );
}