"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  BookOpen,
  Search,
} from "lucide-react";

type CheatItem = {
  token: string;
  name: string;
  desc: string;
  example: string;
};

const CHEAT_DATA: Record<string, CheatItem[]> = {
  CharacterClasses: [
    { token: "\\d", name: "Digit", desc: "Matches any Arabic numeral character [0-9]", example: "id_\\d+" },
    { token: "\\D", name: "Non-digit", desc: "Matches any character that is not a digit", example: "\\D{3}" },
    { token: "\\w", name: "Word character", desc: "Matches alphanumeric characters and underscore [a-zA-Z0-9_]", example: "\\w+" },
    { token: "\\W", name: "Non-word character", desc: "Matches any non-alphanumeric character", example: "\\W" },
    { token: "\\s", name: "Whitespace", desc: "Matches space, tab, line break, or form feed", example: "\\s+" },
    { token: "\\S", name: "Non-whitespace", desc: "Matches any character other than whitespace", example: "\\S+" },
    { token: ".", name: "Any character", desc: "Matches any character except a line feed (unless /s flag is active)", example: "h.t" },
  ],
  Anchors: [
    { token: "^", name: "Start of string", desc: "Asserts position at the beginning of the line/string", example: "^https" },
    { token: "$", name: "End of string", desc: "Asserts position at the end of the line/string", example: "\\.json$" },
    { token: "\\b", name: "Word boundary", desc: "Matches position between word and non-word characters", example: "\\bcat\\b" },
    { token: "\\B", name: "Non-word boundary", desc: "Matches position where both sides are word or non-word characters", example: "\\Bcat" },
  ],
  Quantifiers: [
    { token: "*", name: "Zero or more", desc: "Matches 0 or more consecutive occurrences", example: "ab*" },
    { token: "+", name: "One or more", desc: "Matches 1 or more consecutive occurrences", example: "a+" },
    { token: "?", name: "Optional", desc: "Matches 0 or 1 occurrence (also makes quantifiers lazy)", example: "https?" },
    { token: "{n}", name: "Exact count", desc: "Matches exactly n consecutive occurrences", example: "\\d{4}" },
    { token: "{n,m}", name: "Range count", desc: "Matches between n and m occurrences", example: "\\w{3,8}" },
    { token: "+?", name: "Lazy match", desc: "Matches as few characters as possible", example: "<.*?>" },
  ],
  GroupsAndLookaround: [
    { token: "(abc)", name: "Capturing group", desc: "Groups expressions and creates a numbered capture group", example: "(\\d{3})-(\\d{4})" },
    { token: "(?:abc)", name: "Non-capturing group", desc: "Groups expressions without storing capture index", example: "(?:https|http)" },
    { token: "(?=abc)", name: "Positive lookahead", desc: "Asserts that following text matches pattern", example: "\\w+(?=@)" },
    { token: "(?!abc)", name: "Negative lookahead", desc: "Asserts that following text does not match pattern", example: "foo(?!bar)" },
    { token: "(?<=abc)", name: "Positive lookbehind", desc: "Asserts that preceding text matches pattern", example: "(?<=\\$)\\d+" },
  ],
};

export default function RegexCheatsheetPage() {
  const [activeCategory, setActiveCategory] = useState("CharacterClasses");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const handleCopy = async (token: string) => {
    await navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 1500);
  };

  const currentItems = CHEAT_DATA[activeCategory] || [];
  const filtered = searchQuery
    ? Object.values(CHEAT_DATA)
        .flat()
        .filter(
          (i) =>
            i.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
            i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            i.desc.toLowerCase().includes(searchQuery.toLowerCase())
        )
    : currentItems;

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
              RegEx Cheat Sheet & Token Inspector
            </h1>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            ECMAScript / PCRE Specs
          </span>
        </header>

        {/* Search & Category Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a0b0e] border border-zinc-800 p-3 mb-6">
          <div className="flex items-center gap-2 border border-zinc-800 bg-black px-2.5 py-1.5 w-full sm:w-72">
            <Search size={14} className="text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search regex syntax..."
              className="bg-transparent text-xs text-zinc-200 outline-none w-full font-mono"
            />
          </div>

          {!searchQuery && (
            <div className="flex flex-wrap gap-1 font-mono text-xs">
              {Object.keys(CHEAT_DATA).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 text-xs transition-colors border ${
                    activeCategory === cat
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-black border-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  {cat.replace(/([A-Z])/g, " $1").trim()}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Token Table */}
        <div className="border border-zinc-800 bg-[#0a0b0e] flex flex-col flex-1 overflow-hidden">
          <div className="border-b border-zinc-800 px-4 py-2.5 bg-black/40 text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <BookOpen size={14} className="text-blue-400" />
            <span>Regular Expression Reference</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 text-zinc-500 text-[11px] bg-black/20">
                  <th className="p-3 w-28">Syntax</th>
                  <th className="p-3 w-44">Name</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 w-40">Sample Expression</th>
                  <th className="p-3 w-16 text-right">Copy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {filtered.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-bold text-blue-400">
                      <span className="bg-black border border-zinc-800 px-2 py-0.5 inline-block">
                        {item.token}
                      </span>
                    </td>
                    <td className="p-3 text-zinc-200">{item.name}</td>
                    <td className="p-3 text-zinc-400 font-sans text-xs">{item.desc}</td>
                    <td className="p-3 text-emerald-400 font-bold">{item.example}</td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleCopy(item.token)}
                        className="text-zinc-500 hover:text-white"
                        title="Copy syntax"
                      >
                        {copiedToken === item.token ? (
                          <Check size={13} className="text-emerald-400 inline" />
                        ) : (
                          <Copy size={13} className="inline" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevEverTools · RegEx Cheat Sheet & Token Inspector
      </footer>
    </div>
  );
}