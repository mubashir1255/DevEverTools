"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Table as TableIcon,
  Plus,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

type Alignment = "left" | "center" | "right";

const DEFAULT_HEADERS = ["ID", "Tool Name", "Category", "Status"];
const DEFAULT_ROWS = [
  ["01", "JSON Formatter", "Formatters", "Active"],
  ["02", "JWT Decoder", "Security", "Active"],
  ["03", "cURL Converter", "Converters", "Active"],
  ["04", "Docker Builder", "DevOps", "Active"],
];

function generateMarkdownTable(
  headers: string[],
  rows: string[][],
  alignments: Alignment[]
): string {
  const colCount = headers.length;
  const colWidths = headers.map((h, i) => {
    let max = h.length;
    for (const r of rows) {
      if (r[i] && r[i].length > max) max = r[i].length;
    }
    return Math.max(max, 3);
  });

  // Header row
  const headerLine =
    "| " +
    headers.map((h, i) => h.padEnd(colWidths[i], " ")).join(" | ") +
    " |";

  // Separator row
  const separatorLine =
    "| " +
    alignments
      .map((align, i) => {
        const width = colWidths[i];
        if (align === "center") {
          return ":" + "-".repeat(Math.max(width - 2, 1)) + ":";
        }
        if (align === "right") {
          return "-".repeat(Math.max(width - 1, 2)) + ":";
        }
        return ":" + "-".repeat(Math.max(width - 1, 2));
      })
      .join(" | ") +
    " |";

  // Data rows
  const dataLines = rows.map(
    (row) =>
      "| " +
      row
        .map((cell, i) => {
          const content = cell || "";
          const width = colWidths[i] || 3;
          const align = alignments[i] || "left";
          if (align === "right") return content.padStart(width, " ");
          if (align === "center") {
            const leftPad = Math.floor((width - content.length) / 2);
            const rightPad = width - content.length - leftPad;
            return " ".repeat(leftPad) + content + " ".repeat(rightPad);
          }
          return content.padEnd(width, " ");
        })
        .join(" | ") +
      " |"
  );

  return [headerLine, separatorLine, ...dataLines].join("\n");
}

function parseCsvToMatrix(csvText: string): { headers: string[]; rows: string[][] } {
  const lines = csvText.trim().split("\n").filter(Boolean);
  if (lines.length === 0) return { headers: [], rows: [] };

  const parsed = lines.map((l) =>
    l.split(l.includes("\t") ? "\t" : ",").map((c) => c.trim().replace(/^['"]|['"]$/g, ""))
  );

  const headers = parsed[0] || [];
  const rows = parsed.slice(1);
  return { headers, rows };
}

export default function MarkdownTablePage() {
  const [headers, setHeaders] = useState<string[]>(DEFAULT_HEADERS);
  const [rows, setRows] = useState<string[][]>(DEFAULT_ROWS);
  const [alignments, setAlignments] = useState<Alignment[]>(["left", "left", "left", "center"]);
  const [csvInput, setCsvInput] = useState("");
  const [mode, setMode] = useState<"grid" | "csv">("grid");
  const [copied, setCopied] = useState(false);

  const markdownOutput = useMemo(
    () => generateMarkdownTable(headers, rows, alignments),
    [headers, rows, alignments]
  );

  const addColumn = () => {
    setHeaders([...headers, `Col ${headers.length + 1}`]);
    setAlignments([...alignments, "left"]);
    setRows(rows.map((r) => [...r, ""]));
  };

  const removeColumn = (colIdx: number) => {
    if (headers.length <= 1) return;
    setHeaders(headers.filter((_, i) => i !== colIdx));
    setAlignments(alignments.filter((_, i) => i !== colIdx));
    setRows(rows.map((r) => r.filter((_, i) => i !== colIdx)));
  };

  const addRow = () => {
    setRows([...rows, new Array(headers.length).fill("")]);
  };

  const removeRow = (rowIdx: number) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((_, i) => i !== rowIdx));
  };

  const updateHeader = (colIdx: number, val: string) => {
    const updated = [...headers];
    updated[colIdx] = val;
    setHeaders(updated);
  };

  const updateCell = (rowIdx: number, colIdx: number, val: string) => {
    const updated = rows.map((r, ri) =>
      ri === rowIdx ? r.map((c, ci) => (ci === colIdx ? val : c)) : r
    );
    setRows(updated);
  };

  const cycleAlignment = (colIdx: number) => {
    const current = alignments[colIdx] || "left";
    const next: Alignment =
      current === "left" ? "center" : current === "center" ? "right" : "left";
    const updated = [...alignments];
    updated[colIdx] = next;
    setAlignments(updated);
  };

  const handleImportCsv = () => {
    if (!csvInput.trim()) return;
    const { headers: newHeaders, rows: newRows } = parseCsvToMatrix(csvInput);
    if (newHeaders.length > 0) {
      setHeaders(newHeaders);
      setRows(newRows);
      setAlignments(new Array(newHeaders.length).fill("left"));
      setMode("grid");
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdownOutput);
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
              Markdown Table Generator & CSV Converter
            </h1>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Padded Column Alignment
          </span>
        </header>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a0b0e] border border-zinc-800 p-2.5 mb-5 font-mono text-xs">
          <div className="flex items-center gap-2">
            <div className="flex border border-zinc-800 bg-black">
              <button
                type="button"
                onClick={() => setMode("grid")}
                className={`px-3 py-1.5 flex items-center gap-1.5 transition-colors ${
                  mode === "grid"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <TableIcon size={13} />
                <span>Visual Editor</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("csv")}
                className={`px-3 py-1.5 transition-colors ${
                  mode === "csv"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Import CSV / TSV
              </button>
            </div>

            {mode === "grid" && (
              <>
                <button
                  type="button"
                  onClick={addColumn}
                  className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 text-xs flex items-center gap-1 transition-colors"
                >
                  <Plus size={12} />
                  <span>Column</span>
                </button>
                <button
                  type="button"
                  onClick={addRow}
                  className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 text-xs flex items-center gap-1 transition-colors"
                >
                  <Plus size={12} />
                  <span>Row</span>
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 text-xs transition-colors"
          >
            {copied ? (
              <>
                <Check size={13} className="text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy Markdown</span>
              </>
            )}
          </button>
        </div>

        {/* Workspaces */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 flex-1 mb-6">
          {/* Left: Input Mode */}
          {mode === "grid" ? (
            <div className="border border-zinc-800 bg-[#0a0b0e] p-4 overflow-x-auto flex flex-col justify-between">
              <div>
                <table className="w-full border-collapse font-mono text-xs">
                  <thead>
                    <tr>
                      <th className="w-8"></th>
                      {headers.map((h, ci) => (
                        <th key={ci} className="p-1 min-w-[120px]">
                          <div className="flex items-center gap-1 bg-black border border-zinc-800 p-1">
                            <input
                              type="text"
                              value={h}
                              onChange={(e) => updateHeader(ci, e.target.value)}
                              className="bg-transparent text-xs text-white outline-none w-full font-bold"
                            />
                            <button
                              type="button"
                              onClick={() => cycleAlignment(ci)}
                              className="text-zinc-500 hover:text-blue-400 p-1"
                              title={`Alignment: ${alignments[ci]}`}
                            >
                              {alignments[ci] === "left" && <AlignLeft size={12} />}
                              {alignments[ci] === "center" && <AlignCenter size={12} />}
                              {alignments[ci] === "right" && <AlignRight size={12} />}
                            </button>
                            {headers.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeColumn(ci)}
                                className="text-zinc-600 hover:text-red-400 p-1"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, ri) => (
                      <tr key={ri}>
                        <td className="p-1 text-center">
                          {rows.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRow(ri)}
                              className="text-zinc-600 hover:text-red-400"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </td>
                        {row.map((cell, ci) => (
                          <td key={ci} className="p-1">
                            <input
                              type="text"
                              value={cell}
                              onChange={(e) => updateCell(ri, ci, e.target.value)}
                              className="w-full bg-black/60 border border-zinc-900 p-1.5 text-xs text-zinc-200 outline-none focus:border-blue-600"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-[10px] text-zinc-600 font-mono mt-4 pt-3 border-t border-zinc-900">
                Click alignment icons in headers to toggle Left / Center / Right alignment markers.
              </div>
            </div>
          ) : (
            <div className="border border-zinc-800 bg-[#0a0b0e] flex flex-col p-4">
              <span className="text-xs font-mono uppercase text-zinc-400 mb-2">
                Paste CSV or TSV data
              </span>
              <textarea
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                placeholder={"ID,Name,Category\n1,JSON,Formatters\n2,JWT,Security"}
                spellCheck={false}
                className="w-full flex-1 bg-black border border-zinc-800 p-3 text-xs font-mono text-zinc-200 outline-none resize-none min-h-[300px]"
              />
              <button
                type="button"
                onClick={handleImportCsv}
                className="mt-3 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono transition-colors self-end"
              >
                Transpile into Table
              </button>
            </div>
          )}

          {/* Right: Markdown Output Preview */}
          <div className="border border-zinc-800 bg-[#0a0b0e] flex flex-col">
            <div className="border-b border-zinc-800 px-3.5 py-2.5 bg-black/40 text-xs font-mono text-blue-400 uppercase tracking-wider flex items-center justify-between">
              <span>Formatted Markdown Output</span>
              <span className="text-zinc-600 text-[11px]">Auto-Padded Pipes</span>
            </div>
            <textarea
              readOnly
              value={markdownOutput}
              spellCheck={false}
              className="w-full flex-1 bg-transparent p-4 text-xs font-mono text-zinc-200 outline-none resize-none min-h-[380px] select-all leading-relaxed whitespace-pre overflow-x-auto"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevEverTools · Markdown Table Generator
      </footer>
    </div>
  );
}