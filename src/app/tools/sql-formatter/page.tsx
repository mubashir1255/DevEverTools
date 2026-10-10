"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Trash2,
  FileCode,
  Sparkles,
  Minimize2,
} from "lucide-react";

const SAMPLE_SQL = `select u.id,u.email,count(o.id) as order_count,coalesce(sum(o.total_amount),0) as total_spent from users u left join orders o on u.id=o.user_id where u.status='active' and u.created_at>='2025-01-01' group by u.id,u.email having count(o.id)>5 order by total_spent desc limit 50;`;

function formatSql(
  sql: string,
  uppercase: boolean = true,
  indentSpaces: number = 2
): string {
  if (!sql.trim()) return "";

  const indent = " ".repeat(indentSpaces);

  const majorClauses = [
    "SELECT",
    "FROM",
    "WHERE",
    "GROUP BY",
    "HAVING",
    "ORDER BY",
    "LIMIT",
    "OFFSET",
    "UNION ALL",
    "UNION",
    "VALUES",
    "SET",
    "INSERT INTO",
    "UPDATE",
    "DELETE FROM",
  ];

  const joinClauses = [
    "LEFT OUTER JOIN",
    "RIGHT OUTER JOIN",
    "FULL OUTER JOIN",
    "LEFT JOIN",
    "RIGHT JOIN",
    "INNER JOIN",
    "CROSS JOIN",
    "JOIN",
  ];

  const secondaryKeywords = [
    "AND",
    "OR",
    "ON",
    "AS",
    "IN",
    "NOT IN",
    "IS NULL",
    "IS NOT NULL",
    "BETWEEN",
    "LIKE",
    "ASC",
    "DESC",
    "CASE",
    "WHEN",
    "THEN",
    "ELSE",
    "END",
    "DISTINCT",
    "EXISTS",
    "COALESCE",
    "COUNT",
    "SUM",
    "AVG",
    "MIN",
    "MAX",
  ];

  let cleaned = sql
    .replace(/\s+/g, " ")
    .replace(/\s*([,;])\s*/g, "$1 ")
    .replace(/\(\s+/g, "(")     .replace(/\s+\)/g, ")")
    .trim();

  // 1. Protect literal string constants from modification
  const strings: string[] = [];
  cleaned = cleaned.replace(/'(?:''|[^'])*'/g, (m) => {
    strings.push(m);
    return `__SQL_STR_${strings.length - 1}__`;
  });

  // 2. Adjust keyword casing across all known SQL keywords
  const allKeywords = [...majorClauses, ...joinClauses, ...secondaryKeywords];
  allKeywords.forEach((kw) => {
    const regex = new RegExp(`\\b${kw.replace(/ /g, "\\s+")}\\b`, "gi");
    cleaned = cleaned.replace(regex, uppercase ? kw.toUpperCase() : kw.toLowerCase());
  });

  // 3. Insert line breaks before major clauses
  majorClauses.forEach((clause) => {
    const target = uppercase ? clause.toUpperCase() : clause.toLowerCase();
    const regex = new RegExp(`\\s*\\b(${target})\\b\\s*`, "gi");
    cleaned = cleaned.replace(regex, `\n$1 `);
  });

  // 4. Insert line breaks before joins with indent
  joinClauses.forEach((join) => {
    const target = uppercase ? join.toUpperCase() : join.toLowerCase();
    const regex = new RegExp(`\\s*\\b(${target})\\b\\s*`, "gi");
    cleaned = cleaned.replace(regex, `\n${indent}$1 `);
  });

  // 5. Structure comma-separated SELECT columns
  const lines = cleaned
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const formattedLines: string[] = [];

  for (const line of lines) {
    const isSelect = /^select\b/i.test(line);

    if (isSelect) {
      const selectKw = uppercase ? "SELECT" : "select";
      const rest = line.replace(/^select\s+/i, "").trim();

      const cols: string[] = [];
      let depth = 0;
      let cur = "";

      for (let i = 0; i < rest.length; i++) {
        const char = rest[i];
        if (char === "(") depth++;
        else if (char === ")") depth--;

        if (char === "," && depth === 0) {
          cols.push(cur.trim());
          cur = "";
        } else {
          cur += char;
        }
      }
      if (cur.trim()) cols.push(cur.trim());

      formattedLines.push(selectKw);
      cols.forEach((col, idx) => {
        const comma = idx < cols.length - 1 ? "," : "";
        formattedLines.push(`${indent}${col}${comma}`);
      });
    } else {
      formattedLines.push(line);
    }
  }

  // 6. Restore original strings
  let result = formattedLines.join("\n");
  strings.forEach((str, idx) => {
    result = result.replace(`__SQL_STR_${idx}__`, str);
  });

  return result.trim();
}

function minifySql(sql: string): string {
  return sql
    .replace(/\s+/g, " ")
    .replace(/\s*([(),;=><])\s*/g, "$1")
    .trim();
}

export default function SqlFormatterPage() {
  const [input, setInput] = useState(SAMPLE_SQL);
  const [output, setOutput] = useState("");
  const [indentOption, setIndentOption] = useState<number>(2);
  const [uppercaseKw, setUppercaseKw] = useState<boolean>(true);
  const [copied, setCopied] = useState(false);

  const handleBeautify = () => {
    setOutput(formatSql(input, uppercaseKw, indentOption));
  };

  const handleMinify = () => {
    setOutput(minifySql(input));
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
              onClick={handleBeautify}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <Sparkles size={13} />
              <span>Beautify</span>
            </button>
            <button
              type="button"
              onClick={handleMinify}
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <Minimize2 size={13} />
              <span>Minify</span>
            </button>

            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-zinc-800">
              <span className="text-[11px] font-mono text-zinc-500">Indent:</span>
              <select
                value={indentOption}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setIndentOption(val);
                  if (output) setOutput(formatSql(input, uppercaseKw, val));
                }}
                className="bg-black border border-zinc-800 text-xs font-mono text-zinc-300 px-2 py-1 outline-none"
              >
                <option value={2}>2 Spaces</option>
                <option value={4}>4 Spaces</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-xs font-mono text-zinc-400 cursor-pointer ml-2">
              <input
                type="checkbox"
                checked={uppercaseKw}
                onChange={(e) => {
                  const val = e.target.checked;
                  setUppercaseKw(val);
                  if (output) setOutput(formatSql(input, val, indentOption));
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
                setOutput("");
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

        {/* Dual Editor & Preview Panes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          {/* Input Panel */}
          <div className="flex flex-col border border-zinc-800 bg-[#0a0b0e]">
            <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400 bg-black/40">
              <span className="font-mono uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                <FileCode size={13} className="text-blue-400" />
                <span>Raw SQL Query</span>
              </span>
              <span className="text-[11px] font-mono text-zinc-600">
                {input.length} characters
              </span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste SQL query here..."
              spellCheck={false}
              className="w-full flex-1 bg-transparent p-4 text-xs font-mono text-zinc-200 resize-none outline-none min-h-[460px]"
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
              placeholder="Click 'Beautify' or 'Minify' to generate output..."
              spellCheck={false}
              className="w-full flex-1 bg-transparent p-4 text-xs font-mono text-zinc-200 resize-none outline-none min-h-[460px]"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevEverTools · SQL Formatter & Beautifier
      </footer>
    </div>
  );
}