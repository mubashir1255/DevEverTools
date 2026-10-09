"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Copy,
  Info,
} from "lucide-react";

const PRESETS = [
  { label: "Every 5 mins", expr: "*/5 * * * *" },
  { label: "Every hour", expr: "0 * * * *" },
  { label: "Every day at midnight", expr: "0 0 * * *" },
  { label: "Weekdays at 9 AM", expr: "0 9 * * 1-5" },
  { label: "Every Sunday at 3 AM", expr: "0 3 * * 0" },
  { label: "1st of every month", expr: "0 0 1 * *" },
];

function parseFieldValues(field: string, min: number, max: number): number[] {
  const result = new Set<number>();
  const parts = field.split(",");

  for (const part of parts) {
    if (part === "*") {
      for (let i = min; i <= max; i++) result.add(i);
    } else if (part.startsWith("*/")) {
      const step = parseInt(part.slice(2), 10);
      if (!isNaN(step) && step > 0) {
        for (let i = min; i <= max; i += step) result.add(i);
      }
    } else if (part.includes("-")) {
      const [startStr, endStr] = part.split("-");
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          if (i >= min && i <= max) result.add(i);
        }
      }
    } else {
      const val = parseInt(part, 10);
      if (!isNaN(val) && val >= min && val <= max) {
        result.add(val);
      }
    }
  }

  return Array.from(result).sort((a, b) => a - b);
}

function explainField(field: string, unit: string): string {
  if (field === "*") return `every ${unit}`;
  if (field.startsWith("*/")) return `every ${field.slice(2)} ${unit}s`;
  if (field.includes("-")) return `${unit}s ${field}`;
  return `${unit} ${field}`;
}

function getNextRuns(expr: string, count = 5): Date[] {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return [];

  const [minP, hourP, domP, monP, dowP] = parts;
  const minutes = parseFieldValues(minP, 0, 59);
  const hours = parseFieldValues(hourP, 0, 23);
  const doms = parseFieldValues(domP, 1, 31);
  const months = parseFieldValues(monP, 1, 12);
  const dows = parseFieldValues(dowP, 0, 6);

  if (!minutes.length || !hours.length || !doms.length || !months.length || !dows.length) {
    return [];
  }

  const results: Date[] = [];
  const current = new Date();
  current.setSeconds(0, 0);
  current.setMinutes(current.getMinutes() + 1);

  let iterations = 0;
  while (results.length < count && iterations < 100000) {
    iterations++;
    const mon = current.getMonth() + 1;
    if (!months.includes(mon)) {
      current.setMonth(current.getMonth() + 1, 1);
      current.setHours(0, 0, 0, 0);
      continue;
    }

    const dom = current.getDate();
    const dow = current.getDay();
    const domMatch = doms.includes(dom);
    const dowMatch = dows.includes(dow);

    // If neither matches, advance day
    if ((domP !== "*" && dowP !== "*" && !(domMatch && dowMatch)) ||
        (domP !== "*" && dowP === "*" && !domMatch) ||
        (domP === "*" && dowP !== "*" && !dowMatch) ||
        (domP === "*" && dowP === "*" && (!domMatch || !dowMatch))) {
      current.setDate(current.getDate() + 1);
      current.setHours(0, 0, 0, 0);
      continue;
    }

    const hour = current.getHours();
    if (!hours.includes(hour)) {
      current.setHours(current.getHours() + 1, 0, 0, 0);
      continue;
    }

    const minute = current.getMinutes();
    if (!minutes.includes(minute)) {
      current.setMinutes(current.getMinutes() + 1);
      continue;
    }

    results.push(new Date(current));
    current.setMinutes(current.getMinutes() + 1);
  }

  return results;
}

export default function CronParserPage() {
  const [expr, setExpr] = useState("*/15 * * * *");
  const [copied, setCopied] = useState(false);

  const parts = expr.trim().split(/\s+/);
  const isValid = parts.length === 5;

  const explanation = useMemo(() => {
    if (!isValid) return "Invalid cron syntax. Standard cron expects exactly 5 space-separated fields.";
    const [m, h, dom, mon, dow] = parts;
    const minDesc = explainField(m, "minute");
    const hourDesc = explainField(h, "hour");
    const domDesc = explainField(dom, "day of month");
    const monDesc = explainField(mon, "month");
    const dowDesc = explainField(dow, "day of week");

    return `Runs ${minDesc}, on ${hourDesc}, on ${domDesc}, in ${monDesc}, and on ${dowDesc}.`;
  }, [parts, isValid]);

  const upcomingRuns = useMemo(() => {
    if (!isValid) return [];
    try {
      return getNextRuns(expr);
    } catch {
      return [];
    }
  }, [expr, isValid]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(expr);
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
              Cron Expression Parser
            </h1>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Standard 5-Field Syntax
          </span>
        </header>

        {/* Input Bar */}
        <div className="bg-[#0a0b0e] border border-zinc-800 p-5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
          <div className="flex-1 flex items-center gap-3">
            <Clock size={18} className="text-blue-400 shrink-0" />
            <input
              type="text"
              value={expr}
              onChange={(e) => setExpr(e.target.value)}
              placeholder="* * * * *"
              className="bg-black border border-zinc-800 text-lg font-bold text-white px-3 py-1.5 w-full outline-none focus:border-blue-600 tracking-widest"
            />
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 text-xs flex items-center gap-1.5 transition-colors shrink-0"
          >
            {copied ? (
              <>
                <Check size={13} className="text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy Expression</span>
              </>
            )}
          </button>
        </div>

        {/* Field Breakdown Columns */}
        {isValid && (
          <div className="grid grid-cols-5 gap-2 font-mono text-center mb-5">
            {[
              { name: "Minute", val: parts[0], range: "0-59" },
              { name: "Hour", val: parts[1], range: "0-23" },
              { name: "Day (Month)", val: parts[2], range: "1-31" },
              { name: "Month", val: parts[3], range: "1-12" },
              { name: "Day (Week)", val: parts[4], range: "0-6 (Sun-Sat)" },
            ].map((col, idx) => (
              <div key={idx} className="bg-[#0a0b0e] border border-zinc-800 p-3">
                <span className="text-[10px] text-zinc-500 uppercase block mb-1">
                  {col.name}
                </span>
                <span className="text-base font-bold text-blue-400 block mb-0.5">
                  {col.val}
                </span>
                <span className="text-[9px] text-zinc-600 block">{col.range}</span>
              </div>
            ))}
          </div>
        )}

        {/* Presets */}
        <div className="bg-[#0a0b0e] border border-zinc-800 p-3.5 mb-5 flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="text-[11px] text-zinc-500 uppercase mr-1">Presets:</span>
          {PRESETS.map((p) => (
            <button
              key={p.expr}
              type="button"
              onClick={() => setExpr(p.expr)}
              className={`px-2.5 py-1 border text-[11px] transition-colors ${
                expr === p.expr
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Human Translation Summary */}
        <div className="border border-zinc-800 bg-[#0a0b0e] p-4 mb-5 flex items-start gap-3">
          <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-mono uppercase text-zinc-400 tracking-wider block mb-1">
              Human Readable Schedule
            </span>
            <p className="text-sm text-zinc-200 leading-relaxed font-sans">
              {explanation}
            </p>
          </div>
        </div>

        {/* Next Scheduled Runs */}
        <div className="border border-zinc-800 bg-[#0a0b0e] flex flex-col flex-1">
          <div className="border-b border-zinc-800 px-4 py-2.5 bg-black/40 text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Calendar size={14} className="text-blue-400" />
            <span>Next 5 Upcoming Execution Times</span>
          </div>

          <div className="divide-y divide-zinc-900 font-mono text-xs p-2">
            {upcomingRuns.length > 0 ? (
              upcomingRuns.map((run, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 hover:bg-[#0e1015]">
                  <span className="text-zinc-500 text-[11px]">#{idx + 1}</span>
                  <span className="text-zinc-200 font-semibold">
                    {run.toLocaleString(undefined, {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                  <span className="text-[11px] text-zinc-600">Local Time</span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-zinc-500 text-xs">
                No matching execution dates found for this expression.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevEverTools · Cron Expression Parser
      </footer>
    </div>
  );
}