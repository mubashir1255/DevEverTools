"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Trash2,
  Split,
  Plus,
  Minus,
} from "lucide-react";

const SAMPLE_ORIGINAL = `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}`;

const SAMPLE_MODIFIED = `function calculateTotal(items, taxRate = 0.05) {
  const subtotal = items.reduce((acc, item) => acc + item.price, 0);
  const tax = subtotal * taxRate;
  return Number((subtotal + tax).toFixed(2));
}`;

type DiffLine = {
  type: "added" | "removed" | "unchanged";
  text: string;
  originalLineNumber?: number;
  modifiedLineNumber?: number;
};

// Pure Line-based Diffing via dynamic programming LCS
function computeDiff(originalStr: string, modifiedStr: string): DiffLine[] {
  const orig = originalStr.split("\n");
  const mod = modifiedStr.split("\n");

  const matrix: number[][] = Array(orig.length + 1)
    .fill(null)
    .map(() => Array(mod.length + 1).fill(0));

  for (let i = 1; i <= orig.length; i++) {
    for (let j = 1; j <= mod.length; j++) {
      if (orig[i - 1] === mod[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1] + 1;
      } else {
        matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
      }
    }
  }

  const result: DiffLine[] = [];
  let i = orig.length;
  let j = mod.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && orig[i - 1] === mod[j - 1]) {
      result.unshift({
        type: "unchanged",
        text: orig[i - 1],
        originalLineNumber: i,
        modifiedLineNumber: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
      result.unshift({
        type: "added",
        text: mod[j - 1],
        modifiedLineNumber: j,
      });
      j--;
    } else if (i > 0 && (j === 0 || matrix[i][j - 1] < matrix[i - 1][j])) {
      result.unshift({
        type: "removed",
        text: orig[i - 1],
        originalLineNumber: i,
      });
      i--;
    }
  }

  return result;
}

export default function DiffCheckerPage() {
  const [originalText, setOriginalText] = useState(SAMPLE_ORIGINAL);
  const [modifiedText, setModifiedText] = useState(SAMPLE_MODIFIED);
  const [copied, setCopied] = useState(false);

  const diff = useMemo(
    () => computeDiff(originalText, modifiedText),
    [originalText, modifiedText]
  );

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    diff.forEach((d) => {
      if (d.type === "added") added++;
      if (d.type === "removed") removed++;
    });
    return { added, removed };
  }, [diff]);

  const handleCopyUnified = async () => {
    const rawUnified = diff
      .map((d) => {
        const prefix = d.type === "added" ? "+" : d.type === "removed" ? "-" : " ";
        return `${prefix} ${d.text}`;
      })
      .join("\n");

    await navigator.clipboard.writeText(rawUnified);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleClear = () => {
    setOriginalText("");
    setModifiedText("");
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
              Text & Code Diff Checker
            </h1>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Client-Side LCS Engine
          </span>
        </header>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a0b0e] border border-zinc-800 p-2.5 mb-4">
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/20 border border-emerald-800/80 px-2 py-0.5">
              <Plus size={12} /> {stats.added} additions
            </span>
            <span className="flex items-center gap-1 text-red-400 bg-red-950/20 border border-red-800/80 px-2 py-0.5">
              <Minus size={12} /> {stats.removed} deletions
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyUnified}
              className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs flex items-center gap-1.5 font-mono transition-colors"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied Unified</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy Unified Diff</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setOriginalText(SAMPLE_ORIGINAL);
                setModifiedText(SAMPLE_MODIFIED);
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

        {/* Dual Input Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col border border-zinc-800 bg-[#0a0b0e]">
            <div className="border-b border-zinc-800 px-3 py-2 text-xs font-mono uppercase text-zinc-400 bg-black/40">
              Original Version
            </div>
            <textarea
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              placeholder="Paste original source text..."
              spellCheck={false}
              className="w-full bg-transparent p-3 text-xs font-mono text-zinc-200 resize-none outline-none min-h-[160px]"
            />
          </div>

          <div className="flex flex-col border border-zinc-800 bg-[#0a0b0e]">
            <div className="border-b border-zinc-800 px-3 py-2 text-xs font-mono uppercase text-zinc-400 bg-black/40">
              Modified Version
            </div>
            <textarea
              value={modifiedText}
              onChange={(e) => setModifiedText(e.target.value)}
              placeholder="Paste modified source text..."
              spellCheck={false}
              className="w-full bg-transparent p-3 text-xs font-mono text-zinc-200 resize-none outline-none min-h-[160px]"
            />
          </div>
        </div>

        {/* Diff Output Viewer */}
        <div className="border border-zinc-800 bg-[#0a0b0e] flex flex-col flex-1">
          <div className="border-b border-zinc-800 px-4 py-2.5 bg-black/40 text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Split size={14} className="text-blue-400" />
            <span>Unified Diff Inspection</span>
          </div>

          <div className="overflow-x-auto divide-y divide-zinc-900 font-mono text-xs">
            {diff.map((line, idx) => {
              let bg = "bg-transparent text-zinc-300";
              let marker = " ";
              let markerColor = "text-zinc-600";

              if (line.type === "added") {
                bg = "bg-emerald-950/20 text-emerald-300";
                marker = "+";
                markerColor = "text-emerald-400 font-bold";
              } else if (line.type === "removed") {
                bg = "bg-red-950/20 text-red-300";
                marker = "-";
                markerColor = "text-red-400 font-bold";
              }

              return (
                <div key={idx} className={`flex items-center px-4 py-1 hover:bg-white/5 ${bg}`}>
                  <span className="w-10 text-[10px] text-zinc-600 select-none text-right pr-3 shrink-0">
                    {line.originalLineNumber || ""}
                  </span>
                  <span className="w-10 text-[10px] text-zinc-600 select-none text-right pr-3 shrink-0">
                    {line.modifiedLineNumber || ""}
                  </span>
                  <span className={`w-6 text-center select-none shrink-0 ${markerColor}`}>
                    {marker}
                  </span>
                  <pre className="flex-1 whitespace-pre select-all font-mono text-xs">
                    {line.text}
                  </pre>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevVault · Diff Checker
      </footer>
    </div>
  );
}