"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Trash2,
  Table,
} from "lucide-react";

type MatchResult = {
  index: number;
  match: string;
  groups: string[];
};

const PRESETS = [
  { label: "Email", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}", flags: "g" },
  { label: "URL", pattern: "https?:\\/\\/[\\w\\-\\.]+(?::[0-9]+)?(?:\\/[\\w\\/\\._\\-~%]*)*(?:\\?[\\w=&%\\-]*)?", flags: "g" },
  { label: "IPv4", pattern: "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b", flags: "g" },
  { label: "Hex Color", pattern: "#(?:[a-fA-F0-9]{3}){1,2}\\b", flags: "g" },
];

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
  const [flags, setFlags] = useState("g");
  const [testText, setTestText] = useState(
    "Contact us at dev@devvault.local or support@company.org for assistance. Invalid address: test@invalid"
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleFlag = (flagChar: string) => {
    setFlags((prev) =>
      prev.includes(flagChar) ? prev.replace(flagChar, "") : `${prev}${flagChar}`
    );
  };

  const { matches, error } = useMemo(() => {
    if (!pattern.trim()) {
      return { matches: [], error: null };
    }

    try {
      const regex = new RegExp(pattern, flags);
      const results: MatchResult[] = [];

      if (!flags.includes("g")) {
        const singleMatch = regex.exec(testText);
        if (singleMatch) {
          results.push({
            index: singleMatch.index,
            match: singleMatch[0],
            groups: singleMatch.slice(1),
          });
        }
      } else {
        let match: RegExpExecArray | null;
        let lastIndex = -1;

        while ((match = regex.exec(testText)) !== null) {
          if (match.index === lastIndex) {
            regex.lastIndex++;
            continue;
          }
          lastIndex = match.index;

          results.push({
            index: match.index,
            match: match[0],
            groups: match.slice(1),
          });

          if (results.length >= 250) break; // Guard against catastrophic regex loops
        }
      }

      return { matches: results, error: null };
    } catch (err: unknown) {
      if (err instanceof Error) {
        return { matches: [], error: err.message };
      }
      return { matches: [], error: "Invalid regular expression" };
    }
  }, [pattern, flags, testText]);

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleClear = () => {
    setTestText("");
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
              Regular Expression Tester
            </h1>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            ECMAScript RegExp Engine
          </span>
        </header>

        {/* Regex Input Bar */}
        <div className="bg-[#0a0b0e] border border-zinc-800 p-3.5 mb-4 flex flex-col gap-3 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-sm font-bold">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Enter regular expression pattern..."
              className="flex-1 bg-black border border-zinc-800 px-3 py-1.5 text-xs text-zinc-100 outline-none focus:border-blue-600"
            />
            <span className="text-zinc-500 text-sm font-bold">/</span>

            {/* Flag Toggles */}
            <div className="flex border border-zinc-800 bg-black">
              {["g", "i", "m", "s"].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => toggleFlag(f)}
                  className={`px-2 py-1 text-xs uppercase font-mono transition-colors ${
                    flags.includes(f)
                      ? "bg-blue-600 text-white"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                  title={`Flag /${f}/`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-900 text-xs text-zinc-400">
            <span className="text-[11px] text-zinc-500 uppercase">Presets:</span>
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setPattern(preset.pattern);
                  setFlags(preset.flags);
                }}
                className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-[11px] transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="bg-red-950/20 border border-red-800/80 text-red-400 px-3.5 py-2 text-xs font-mono mb-4 flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-[10px] bg-red-900/40 border border-red-700/60 px-1.5 py-0.5">
              Regex Error
            </span>
            <span>{error}</span>
          </div>
        )}

        {/* Test Textarea */}
        <div className="border border-zinc-800 bg-[#0a0b0e] mb-6 flex flex-col">
          <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400 bg-black/40">
            <span className="font-mono uppercase text-[11px] tracking-wider">
              Test String
            </span>
            <div className="flex items-center gap-4">
              <span className="font-mono text-[11px] text-blue-400">
                {matches.length} {matches.length === 1 ? "match" : "matches"} found
              </span>
              <button
                type="button"
                onClick={handleClear}
                className="text-zinc-500 hover:text-red-400 transition-colors"
                title="Clear test text"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Paste or write text here to test against your pattern..."
            spellCheck={false}
            className="w-full bg-transparent p-4 text-xs font-mono text-zinc-200 outline-none resize-none min-h-[160px]"
          />
        </div>

        {/* Matches Breakdown Table */}
        <div className="border border-zinc-800 bg-[#0a0b0e] flex flex-col flex-1">
          <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-2.5 bg-black/40 text-xs">
            <Table size={14} className="text-blue-400" />
            <span className="font-mono text-zinc-300 font-semibold text-[11px] uppercase tracking-wider">
              Match Details ({matches.length})
            </span>
          </div>

          {matches.length > 0 ? (
            <div className="divide-y divide-zinc-900 overflow-x-auto max-h-[300px]">
              {matches.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-4 py-2.5 text-xs font-mono hover:bg-[#0e1015] gap-4"
                >
                  <span className="text-zinc-500 text-[11px] min-w-[60px]">
                    #{idx + 1} (idx {item.index})
                  </span>
                  <span className="text-blue-400 font-semibold flex-1 truncate select-all">
                    {item.match}
                  </span>

                  {item.groups.length > 0 && (
                    <span className="text-zinc-400 text-[11px] truncate max-w-xs">
                      Groups: [{item.groups.join(", ")}]
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleCopy(item.match, `match-${idx}`)}
                    className="text-[11px] text-zinc-500 hover:text-zinc-200 px-2 py-1 bg-zinc-900 border border-zinc-800 shrink-0"
                  >
                    {copiedKey === `match-${idx}` ? "Copied" : "Copy"}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-zinc-600 font-mono py-8 text-center border border-dashed border-zinc-900 m-4">
              No matches found for the current pattern and flags.
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevVault · Regex Tester
      </footer>
    </div>
  );
}