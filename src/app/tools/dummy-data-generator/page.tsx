"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  RefreshCw,
  Type,
  FileJson,
  Users,
} from "lucide-react";

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
  "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
  "deserunt", "mollit", "anim", "id", "est", "laborum",
];

const FIRST_NAMES = ["Liam", "Olivia", "Noah", "Emma", "Oliver", "Ava", "Elijah", "Sophia", "James", "Isabella", "Mubashir", "Aria", "Zayd", "Mia"];
const LAST_NAMES = ["Khan", "Smith", "Johnson", "Fayyaz", "Brown", "Taylor", "Miller", "Wilson", "Anderson", "Patel", "Ali", "Williams"];
const DOMAINS = ["example.com", "devvault.io", "techcorp.net", "workspace.org", "service.dev"];
const ROLES = ["Engineer", "Designer", "Product Manager", "DevOps Specialist", "Security Analyst", "Architect"];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateLoremParagraphs(count: number): string {
  const paragraphs: string[] = [];
  for (let p = 0; p < count; p++) {
    const sentenceCount = 4 + Math.floor(Math.random() * 4);
    const sentences: string[] = [];
    for (let s = 0; s < sentenceCount; s++) {
      const wordCount = 8 + Math.floor(Math.random() * 8);
      const words: string[] = [];
      for (let w = 0; w < wordCount; w++) {
        words.push(getRandomItem(LOREM_WORDS));
      }
      const sentence = words.join(" ");
      sentences.push(sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".");
    }
    paragraphs.push(sentences.join(" "));
  }
  return paragraphs.join("\n\n");
}

function generateMockUsers(count: number): string {
  const users = [];
  for (let i = 1; i <= count; i++) {
    const first = getRandomItem(FIRST_NAMES);
    const last = getRandomItem(LAST_NAMES);
    users.push({
      id: 1000 + i,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@${getRandomItem(DOMAINS)}`,
      role: getRandomItem(ROLES),
      status: Math.random() > 0.2 ? "active" : "inactive",
    });
  }
  return JSON.stringify(users, null, 2);
}

export default function DummyDataGeneratorPage() {
  const [mode, setMode] = useState<"lorem" | "users">("lorem");
  const [count, setCount] = useState<number>(3);
  const [output, setOutput] = useState<string>(() => generateLoremParagraphs(3));
  const [copied, setCopied] = useState(false);

  const handleGenerate = (currentMode = mode, currentCount = count) => {
    if (currentMode === "lorem") {
      setOutput(generateLoremParagraphs(currentCount));
    } else {
      setOutput(generateMockUsers(currentCount));
    }
  };

  const handleModeChange = (newMode: "lorem" | "users") => {
    setMode(newMode);
    const defaultCount = newMode === "lorem" ? 3 : 5;
    setCount(defaultCount);
    handleGenerate(newMode, defaultCount);
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

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
              Dummy Data & Lorem Generator
            </h1>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Fast In-Browser Mock Data
          </span>
        </header>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a0b0e] border border-zinc-800 p-2.5 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Mode Selector */}
            <div className="flex border border-zinc-800 bg-black">
              <button
                type="button"
                onClick={() => handleModeChange("lorem")}
                className={`px-3 py-1.5 text-xs font-mono flex items-center gap-1.5 transition-colors ${
                  mode === "lorem"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Type size={13} />
                <span>Lorem Ipsum</span>
              </button>
              <button
                type="button"
                onClick={() => handleModeChange("users")}
                className={`px-3 py-1.5 text-xs font-mono flex items-center gap-1.5 transition-colors ${
                  mode === "users"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Users size={13} />
                <span>Mock JSON Users</span>
              </button>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
              <span className="text-[11px]">
                {mode === "lorem" ? "Paragraphs:" : "Entities:"}
              </span>
              <select
                value={count}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCount(val);
                  handleGenerate(mode, val);
                }}
                className="bg-black border border-zinc-800 text-zinc-200 text-xs px-2.5 py-1 outline-none"
              >
                {mode === "lorem" ? (
                  <>
                    <option value={1}>1 Paragraph</option>
                    <option value={3}>3 Paragraphs</option>
                    <option value={5}>5 Paragraphs</option>
                    <option value={10}>10 Paragraphs</option>
                  </>
                ) : (
                  <>
                    <option value={3}>3 Users</option>
                    <option value={5}>5 Users</option>
                    <option value={10}>10 Users</option>
                    <option value={25}>25 Users</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleGenerate()}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw size={13} />
              <span>Regenerate</span>
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="border border-zinc-800 bg-[#0a0b0e] flex flex-col flex-1">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2.5 bg-black/40 text-xs">
            <span className="font-mono text-zinc-400 uppercase text-[11px] tracking-wider flex items-center gap-2">
              {mode === "users" ? <FileJson size={14} className="text-blue-400" /> : <Type size={14} className="text-blue-400" />}
              <span>{mode === "lorem" ? "Generated Text" : "Generated JSON"}</span>
            </span>

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white font-mono text-xs transition-colors"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-emerald-400" />
                  <span className="text-emerald-400 font-mono text-[11px]">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span className="font-mono text-[11px]">Copy All</span>
                </>
              )}
            </button>
          </div>

          <textarea
            readOnly
            value={output}
            spellCheck={false}
            className="w-full flex-1 bg-transparent p-5 text-xs font-mono text-zinc-200 outline-none resize-none min-h-[460px] leading-relaxed"
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevVault · Dummy Data & Lorem Generator
      </footer>
    </div>
  );
}