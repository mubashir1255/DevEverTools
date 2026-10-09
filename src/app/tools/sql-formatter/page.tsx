"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Trash2,
  FileCode,
  Minimize2,
} from "lucide-react";

const SAMPLE_SQL = `select u.id, u.username, u.email, count(o.id) as total_orders, sum(o.amount) as total_spent from users u left join orders o on u.id = o.user_id where u.is_active = true and o.status in ('completed', 'shipped') group by u.id, u.username, u.email having count(o.id) > 2 order by total_spent desc limit 50;`;

const SQL_KEYWORDS = [
  "SELECT",
  "FROM",
  "WHERE",
  "GROUP BY",
  "HAVING",
  "ORDER BY",
  "LIMIT",
  "OFFSET",
  "LEFT JOIN",
  "RIGHT JOIN",
  "INNER JOIN",
  "OUTER JOIN",
  "CROSS JOIN",
  "JOIN",
  "ON",
  "INSERT INTO",
  "VALUES",
  "UPDATE",
  "SET",
  "DELETE FROM",
  "UNION ALL",
  "UNION",
  "CREATE TABLE",
  "ALTER TABLE",
  "DROP TABLE",
  "AND",
  "OR",
  "IN",
  "AS",
  "NOT",
  "NULL",
  "IS",
  "LIKE",
  "EXISTS",
  "DISTINCT",
  "CASE",
  "WHEN",
  "THEN",
  "ELSE",
  "END",
  "DESC",
  "ASC",
  "BETWEEN",
];

function formatSqlCode(
  sql: string,
  uppercase: boolean,
  indentStr: string
): string {
  let cleaned = sql
    .replace(/\s+/g, " ")
    .replace(/\s*([,;()])\s*/g, "$1 ")
    .trim();

  // Keyword highlighting & line breaks for major clauses
  const majorClauses = [
    "SELECT",
    "FROM",
    "WHERE",
    "GROUP BY",
    "HAVING",
    "ORDER BY",
    "LIMIT",
    "OFFSET",
    "LEFT JOIN",
    "RIGHT JOIN",
    "INNER JOIN",
    "OUTER JOIN",
    "CROSS JOIN",
    "JOIN",
    "INSERT INTO",
    "VALUES",
    "UPDATE",
    "SET",
    "DELETE FROM",
    "UNION ALL",
    "UNION",
  ];

  // Regex replacement for major clauses to put on newline
  majorClauses.forEach((kw) => {
    const regex = new RegExp(`\\b${kw}\\b`, "gi");
    cleaned = cleaned.replace(regex, (match) => `\n${match.toUpperCase()}`);
  });

  const lines = cleaned.split("\n").filter((l) => l.trim().length > 0);
  const formattedLines: string[] = [];

  for (let line of lines) {
    line = line.trim();

    // Uppercase all known SQL keywords
    if (uppercase) {
      SQL_KEYWORDS.forEach((kw) => {
        const kwRegex = new RegExp(`\\b${kw}\\b`, "gi");
        line = line.replace(kwRegex, (m) => m.toUpperCase());
      });
    } else {
      SQL_KEYWORDS.forEach((kw) => {
        const kwRegex = new RegExp(`\\b${kw}\\b`, "gi");
        line = line.replace(kwRegex, (m) => m.toLowerCase());
      });
    }

    // Format commas in SELECT clause for clean multi-line display
    if (line.toUpperCase().startsWith("SELECT") && line.includes(",")) {
      const parts = line.split(",");
      const firstPart = parts[0];
      const rest = parts.slice(1).map((p) => `${indentStr}${p.trim()}`);
      formattedLines.push(firstPart + ",");
      formattedLines.push(rest.join(",\n"));
      continue;
    }

    // Indent sub-clauses like AND, OR, ON
    if (/^(AND|OR|ON)\b/i.test(line)) {
      formattedLines.push(`${indentStr}${line}`);
    } else {
      formattedLines.push(line);
    }
  }

  return formattedLines.join("\n");
}

function minifySqlCode(sql: string): string {
  return sql
    .replace(/\s+/g, " ")
    .replace(/\s*([,;()])\s*/g, "$1")
    .trim();
}

export default function SqlFormatterPage() {
  const [input, setInput] = useState(SAMPLE_SQL);
  const [output, setOutput] = useState("");
  const [uppercase, setUppercase] = useState(true);
  const [indent, setIndent] = useState<number | string>(2);
  const [copied, setCopied] = useState(false);

  const handleFormat = (
    raw = input,
    isUpper = uppercase,
    currentIndent = indent
  ) => {
    if (!raw.trim()) {
      setOutput("");
      return;
    }
    const indentStr = currentIndent === "tab" ? "\t" : " ".repeat(Number(currentIndent));
    setOutput(formatSqlCode(raw, isUpper, indentStr));
  };

  const handleMinify = () => {
    if (!input.trim()) return;
    setOutput(minifySqlCode(input));
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
              SQL Formatter & Beautifier
            </h1>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Client-Side Formatting
          </span>
        </header>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a0b0e] border border-zinc-800 p-2.5 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleFormat()}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <FileCode size={14} />
              <span>Beautify</span>
            </button>
            <button
              type="button"
              onClick={handleMinify}
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 text-xs flex items-center gap-1.5 transition-colors"
            >
              <Minimize2 size={14} />
              <span>Minify</span>
            </button>

            {/* Indent Selector */}
            <div className="flex items-center gap-1 ml-2 text-xs text-zinc-400 font-mono">
              <span className="text-[11px]">Indent:</span>
              <select
                value={indent}
                onChange={(e) => {
                  setIndent(e.target.value);
                  handleFormat(input, uppercase, e.target.value);
                }}
                className="bg-black border border-zinc-800 text-zinc-300 text-xs px-2 py-1 outline-none"
              >
                <option value={2}>2 Spaces</option>
                <option value={4}>4 Spaces</option>
                <option value="tab">Tab</option>
              </select>
            </div>

            {/* Uppercase Toggle */}
            <label className="flex items-center gap-1.5 ml-2 text-xs text-zinc-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => {
                  setUppercase(e.target.checked);
                  handleFormat(input, e.target.checked, indent);
                }}
                className="accent-blue-600"
              />
              <span>Uppercase Keywords</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setInput(SAMPLE_SQL);
                handleFormat(SAMPLE_SQL);
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

        {/* Dual Editor Panes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          {/* Input Panel */}
          <div className="flex flex-col border border-zinc-800 bg-[#0a0b0e]">
            <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400 bg-black/40">
              <span className="font-mono uppercase text-[11px] tracking-wider">
                Raw SQL Query
              </span>
              <span className="text-[11px] font-mono text-zinc-600">
                {input.length} characters
              </span>
            </div>
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                handleFormat(e.target.value);
              }}
              placeholder="Paste raw SQL query here..."
              spellCheck={false}
              className="w-full flex-1 bg-transparent p-4 text-xs font-mono text-zinc-200 resize-none outline-none min-h-[440px]"
            />
          </div>

          {/* Output Panel */}
          <div className="flex flex-col border border-zinc-800 bg-[#0a0b0e]">
            <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400 bg-black/40">
              <span className="font-mono uppercase text-[11px] tracking-wider text-blue-400 font-semibold">
                Formatted SQL
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
              placeholder="Formatted SQL output will appear here..."
              spellCheck={false}
              className="w-full flex-1 bg-transparent p-4 text-xs font-mono text-zinc-300 resize-none outline-none min-h-[440px]"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevVault · SQL Formatter
      </footer>
    </div>
  );
}