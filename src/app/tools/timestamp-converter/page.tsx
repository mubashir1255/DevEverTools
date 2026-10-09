"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Clock,
} from "lucide-react";

export default function TimestampConverterPage() {
  // Live epoch clock
  const [currentEpoch, setCurrentEpoch] = useState<number | null>(null);
  const [isLive, setIsLive] = useState(true);

  // Conversion state (Timestamp -> Date)
  const [tsInput, setTsInput] = useState("");
  const [dateOutput, setDateOutput] = useState<{
    utc: string;
    local: string;
    iso: string;
    relative: string;
  } | null>(null);

  // Conversion state (Date -> Timestamp)
  const [dateInput, setDateInput] = useState("");
  const [tsOutput, setTsOutput] = useState<{
    seconds: number;
    millis: number;
  } | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live timer without synchronous render-cascade side effects
  useEffect(() => {
    const updateEpoch = () => {
      setCurrentEpoch(Math.floor(Date.now() / 1000));
    };

    const initialTimeout = setTimeout(updateEpoch, 0);

    if (!isLive) {
      return () => clearTimeout(initialTimeout);
    }

    const interval = setInterval(updateEpoch, 1000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [isLive]);

  // Convert Epoch to Date
  const handleTsChange = (val: string) => {
    setTsInput(val);
    const trimmed = val.trim();
    if (!trimmed || isNaN(Number(trimmed))) {
      setDateOutput(null);
      return;
    }

    let num = Number(trimmed);
    // If length <= 11 digits, assume seconds; otherwise assume milliseconds
    if (trimmed.length <= 11) {
      num *= 1000;
    }

    const d = new Date(num);
    if (isNaN(d.getTime())) {
      setDateOutput(null);
      return;
    }

    const diffMs = d.getTime() - Date.now();
    const diffSec = Math.round(diffMs / 1000);
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

    let relStr = "";
    if (Math.abs(diffSec) < 60) {
      relStr = rtf.format(diffSec, "second");
    } else if (Math.abs(diffSec) < 3600) {
      relStr = rtf.format(Math.round(diffSec / 60), "minute");
    } else if (Math.abs(diffSec) < 86400) {
      relStr = rtf.format(Math.round(diffSec / 3600), "hour");
    } else {
      relStr = rtf.format(Math.round(diffSec / 86400), "day");
    }

    setDateOutput({
      utc: d.toUTCString(),
      local: d.toString(),
      iso: d.toISOString(),
      relative: relStr,
    });
  };

  // Convert Date string to Timestamp
  const handleDateChange = (val: string) => {
    setDateInput(val);
    const trimmed = val.trim();
    if (!trimmed) {
      setTsOutput(null);
      return;
    }

    const d = new Date(trimmed);
    if (isNaN(d.getTime())) {
      setTsOutput(null);
      return;
    }

    const ms = d.getTime();
    setTsOutput({
      seconds: Math.floor(ms / 1000),
      millis: ms,
    });
  };

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
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
              Timestamp Converter
            </h1>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Unix Epoch Standard
          </span>
        </header>

        {/* Live Clock Card */}
        <div className="bg-[#0a0b0e] border border-zinc-800 p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Clock size={16} className="text-blue-400" />
            <span className="text-xs text-zinc-400 font-mono">Current Epoch:</span>
            <span className="font-mono text-base font-bold text-white tracking-wider">
              {currentEpoch !== null ? currentEpoch : "..."}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsLive(!isLive)}
              className="px-2.5 py-1 text-xs font-mono bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 transition-colors"
            >
              {isLive ? "Pause" : "Resume"}
            </button>
            <button
              type="button"
              onClick={() => {
                if (currentEpoch !== null) {
                  handleTsChange(String(currentEpoch));
                }
              }}
              className="px-2.5 py-1 text-xs font-mono bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              Convert Current
            </button>
            <button
              type="button"
              onClick={() => {
                if (currentEpoch !== null) {
                  handleCopy(String(currentEpoch), "epoch");
                }
              }}
              className="px-2.5 py-1 text-xs font-mono bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 transition-colors"
            >
              {copiedKey === "epoch" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        {/* Dual Conversion Grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
          {/* Section 1: Timestamp -> Date */}
          <div className="flex flex-col border border-zinc-800 bg-[#0a0b0e] p-5">
            <h2 className="font-mono text-xs font-bold text-zinc-200 uppercase tracking-wider mb-3">
              Timestamp to Date
            </h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={tsInput}
                onChange={(e) => handleTsChange(e.target.value)}
                placeholder="Enter Unix timestamp (e.g. 1772450000)..."
                className="flex-1 bg-black border border-zinc-800 px-3 py-2 text-xs font-mono text-zinc-200 outline-none focus:border-blue-600"
              />
              <button
                type="button"
                onClick={() => handleTsChange(String(Math.floor(Date.now() / 1000)))}
                className="px-3 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-mono text-zinc-300"
              >
                Now
              </button>
            </div>

            {dateOutput ? (
              <div className="space-y-3 font-mono text-xs mt-2">
                <div className="flex justify-between items-center p-2.5 bg-black border border-zinc-900">
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase">UTC</span>
                    <span className="text-zinc-200">{dateOutput.utc}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(dateOutput.utc, "utc")}
                    className="text-zinc-500 hover:text-white"
                  >
                    {copiedKey === "utc" ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                </div>

                <div className="flex justify-between items-center p-2.5 bg-black border border-zinc-900">
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase">Local</span>
                    <span className="text-zinc-200">{dateOutput.local}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(dateOutput.local, "local")}
                    className="text-zinc-500 hover:text-white"
                  >
                    {copiedKey === "local" ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                </div>

                <div className="flex justify-between items-center p-2.5 bg-black border border-zinc-900">
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase">ISO 8601</span>
                    <span className="text-zinc-200">{dateOutput.iso}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(dateOutput.iso, "iso")}
                    className="text-zinc-500 hover:text-white"
                  >
                    {copiedKey === "iso" ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                </div>

                <div className="p-2.5 bg-black border border-zinc-900">
                  <span className="text-[10px] text-zinc-500 block uppercase">Relative</span>
                  <span className="text-blue-400">{dateOutput.relative}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-zinc-600 font-mono py-8 text-center border border-dashed border-zinc-900">
                Enter an epoch timestamp to view formatted dates.
              </div>
            )}
          </div>

          {/* Section 2: Date -> Timestamp */}
          <div className="flex flex-col border border-zinc-800 bg-[#0a0b0e] p-5">
            <h2 className="font-mono text-xs font-bold text-zinc-200 uppercase tracking-wider mb-3">
              Date to Timestamp
            </h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={dateInput}
                onChange={(e) => handleDateChange(e.target.value)}
                placeholder="ISO or RFC date string (e.g. 2026-10-09T16:00:00Z)..."
                className="flex-1 bg-black border border-zinc-800 px-3 py-2 text-xs font-mono text-zinc-200 outline-none focus:border-blue-600"
              />
              <button
                type="button"
                onClick={() => handleDateChange(new Date().toISOString())}
                className="px-3 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-mono text-zinc-300"
              >
                Now
              </button>
            </div>

            {tsOutput ? (
              <div className="space-y-3 font-mono text-xs mt-2">
                <div className="flex justify-between items-center p-3 bg-black border border-zinc-900">
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase">Seconds</span>
                    <span className="text-zinc-200 text-sm font-bold">{tsOutput.seconds}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(String(tsOutput.seconds), "sec")}
                    className="text-zinc-500 hover:text-white"
                  >
                    {copiedKey === "sec" ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                </div>

                <div className="flex justify-between items-center p-3 bg-black border border-zinc-900">
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase">Milliseconds</span>
                    <span className="text-zinc-200 text-sm font-bold">{tsOutput.millis}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(String(tsOutput.millis), "ms")}
                    className="text-zinc-500 hover:text-white"
                  >
                    {copiedKey === "ms" ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-zinc-600 font-mono py-8 text-center border border-dashed border-zinc-900">
                Enter a date string to calculate epoch values.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevVault · Timestamp Converter
      </footer>
    </div>
  );
}