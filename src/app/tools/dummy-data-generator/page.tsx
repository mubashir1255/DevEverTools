"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  FileText,
  RefreshCw,
  Users,
} from "lucide-react";

// Culturally coherent name pools to prevent cross-locale mismatches
const NAME_POOLS = [
  {
    locale: "Western / Anglo",
    first: ["Liam", "Emma", "James", "Ava", "Noah", "Olivia", "Lucas", "Sophia", "Ethan", "Mia"],
    last: ["Anderson", "Miller", "Brown", "Wilson", "Taylor", "Smith", "Johnson", "Davis", "Clark", "White"],
  },
  {
    locale: "South Asian",
    first: ["Hamza", "Zain", "Bilal", "Usman", "Ayesha", "Fatima", "Zahra", "Omar", "Ali", "Hassan"],
    last: ["Khan", "Ahmed", "Malik", "Rehman", "Tariq", "Iqbal", "Siddiqui", "Farooq", "Chaudhry", "Qureshi"],
  },
  {
    locale: "Hispanic / Latino",
    first: ["Mateo", "Santiago", "Sofia", "Valentina", "Diego", "Camila", "Elena", "Lucas", "Sebastian", "Isabella"],
    last: ["Garcia", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Perez", "Sanchez", "Ramirez", "Torres"],
  },
  {
    locale: "Middle Eastern",
    first: ["Tariq", "Zayd", "Layla", "Noor", "Kareem", "Yusuf", "Samir", "Rania", "Salim", "Dina"],
    last: ["Al-Mansoor", "Hassan", "Khoury", "Najjar", "Hadid", "Salameh", "Barakat", "Darwish", "Masri", "Nasser"],
  },
];

const DOMAINS = ["devvault.io", "workspace.org", "service.dev", "corp.internal"];
const ROLES = [
  "Software Engineer",
  "Product Manager",
  "Designer",
  "Security Analyst",
  "DevOps Engineer",
  "Frontend Architect",
  "Database Admin",
];

// Deterministic initial seed data to prevent SSR/CSR hydration mismatch
const STATIC_INITIAL_USERS = [
  { id: 1001, name: "Liam Anderson", email: "liam.anderson@devvault.io", role: "Software Engineer", status: "active" },
  { id: 1002, name: "Emma Miller", email: "emma.miller@workspace.org", role: "Product Manager", status: "active" },
  { id: 1003, name: "Hamza Khan", email: "hamza.khan@service.dev", role: "Security Analyst", status: "active" },
  { id: 1004, name: "Ayesha Ahmed", email: "ayesha.ahmed@corp.internal", role: "Designer", status: "active" },
  { id: 1005, name: "Mateo Garcia", email: "mateo.garcia@devvault.io", role: "DevOps Engineer", status: "inactive" },
  { id: 1006, name: "Sofia Rodriguez", email: "sofia.rodriguez@workspace.org", role: "Frontend Architect", status: "active" },
  { id: 1007, name: "Tariq Al-Mansoor", email: "tariq.almansoor@service.dev", role: "Database Admin", status: "active" },
  { id: 1008, name: "Noor Hassan", email: "noor.hassan@corp.internal", role: "Software Engineer", status: "active" },
  { id: 1009, name: "James Brown", email: "james.brown@devvault.io", role: "Designer", status: "active" },
  { id: 1010, name: "Zain Malik", email: "zain.malik@workspace.org", role: "Security Analyst", status: "inactive" },
];

function getRandomUser(id: number) {
  const pool = NAME_POOLS[Math.floor(Math.random() * NAME_POOLS.length)];
  const first = pool.first[Math.floor(Math.random() * pool.first.length)];
  const last = pool.last[Math.floor(Math.random() * pool.last.length)];

  const cleanLast = last.toLowerCase().replace(/[^a-z0-9]/g, "");
  const emailDomain = DOMAINS[Math.floor(Math.random() * DOMAINS.length)];
  const email = `${first.toLowerCase()}.${cleanLast}@${emailDomain}`;

  return {
    id,
    name: `${first} ${last}`,
    email,
    role: ROLES[Math.floor(Math.random() * ROLES.length)],
    status: Math.random() > 0.25 ? "active" : "inactive",
  };
}

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud", "exercitation",
  "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo", "consequat", "duis",
  "aute", "irure", "in", "reprehenderit", "voluptate", "velit", "esse", "cillum",
  "fugiat", "nulla", "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non",
  "proident", "sunt", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum"
];

function generateLoremParagraphs(count: number): string {
  const paragraphs: string[] = [];
  for (let p = 0; p < count; p++) {
    const sentenceCount = 4 + Math.floor(Math.random() * 3);
    const sentences: string[] = [];
    for (let s = 0; s < sentenceCount; s++) {
      const wordCount = 8 + Math.floor(Math.random() * 8);
      const words: string[] = [];
      for (let w = 0; w < wordCount; w++) {
        words.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
      }
      const raw = words.join(" ");
      sentences.push(raw.charAt(0).toUpperCase() + raw.slice(1) + ".");
    }
    paragraphs.push(sentences.join(" "));
  }
  return paragraphs.join("\n\n");
}

export default function DummyDataGeneratorPage() {
  const [mode, setMode] = useState<"users" | "lorem">("users");
  const [entityCount, setEntityCount] = useState<number>(10);
  const [output, setOutput] = useState<string>(() =>
    JSON.stringify(STATIC_INITIAL_USERS, null, 2)
  );
  const [copied, setCopied] = useState<boolean>(false);

  const handleRegenerate = (nextMode = mode, count = entityCount) => {
    if (nextMode === "users") {
      const users = Array.from({ length: count }, (_, i) => getRandomUser(1001 + i));
      setOutput(JSON.stringify(users, null, 2));
    } else {
      setOutput(generateLoremParagraphs(count));
    }
  };

  const handleCopy = async () => {
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
              Dummy Data & Lorem Generator
            </h1>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Fast In-Browser Mock Data
          </span>
        </header>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a0b0e] border border-zinc-800 p-2.5 mb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setMode("lorem");
                handleRegenerate("lorem", entityCount);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors border ${
                mode === "lorem"
                  ? "bg-blue-600 border-blue-500 text-white font-medium"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              <FileText size={13} />
              <span>Lorem Ipsum</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("users");
                handleRegenerate("users", entityCount);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors border ${
                mode === "users"
                  ? "bg-blue-600 border-blue-500 text-white font-medium"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              <Users size={13} />
              <span>Mock JSON Users</span>
            </button>

            <div className="flex items-center gap-2 ml-4">
              <span className="text-xs text-zinc-400 font-mono">
                {mode === "users" ? "Entities:" : "Paragraphs:"}
              </span>
              <select
                value={entityCount}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setEntityCount(val);
                  handleRegenerate(mode, val);
                }}
                className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs px-2.5 py-1.5 outline-none cursor-pointer"
              >
                <option value={5}>5 {mode === "users" ? "Users" : "Paragraphs"}</option>
                <option value={10}>10 {mode === "users" ? "Users" : "Paragraphs"}</option>
                <option value={25}>25 {mode === "users" ? "Users" : "Paragraphs"}</option>
                <option value={50}>50 {mode === "users" ? "Users" : "Paragraphs"}</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleRegenerate()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs transition-colors border border-blue-500"
          >
            <RefreshCw size={13} />
            <span>Regenerate</span>
          </button>
        </div>

        {/* Output Panel */}
        <div className="border border-zinc-800 bg-[#0a0b0e] flex flex-col flex-1">
          <div className="flex items-center justify-between border-b border-zinc-800 px-3.5 py-2 text-xs text-zinc-400 bg-black/40">
            <span className="font-mono uppercase text-[11px] tracking-wider">
              {mode === "users" ? "Generated JSON" : "Generated Text"}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-white transition-colors"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy All</span>
                </>
              )}
            </button>
          </div>

          <pre
            suppressHydrationWarning
            className="p-4 text-xs font-mono text-zinc-200 overflow-auto flex-1 leading-relaxed selection:bg-blue-600 selection:text-white"
          >
            {output}
          </pre>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevVault · Dummy Data & Lorem Generator
      </footer>
    </div>
  );
}