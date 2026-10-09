"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Terminal,
  RotateCcw,
} from "lucide-react";

type Scope = "user" | "group" | "other";
type PermType = "read" | "write" | "execute";

type PermissionsState = {
  user: { read: boolean; write: boolean; execute: boolean };
  group: { read: boolean; write: boolean; execute: boolean };
  other: { read: boolean; write: boolean; execute: boolean };
};

const DEFAULT_PERMS: PermissionsState = {
  user: { read: true, write: true, execute: true },
  group: { read: true, write: false, execute: true },
  other: { read: true, write: false, execute: true },
};

function calculateOctalDigit(p: { read: boolean; write: boolean; execute: boolean }): number {
  let val = 0;
  if (p.read) val += 4;
  if (p.write) val += 2;
  if (p.execute) val += 1;
  return val;
}

function calculateSymbolicPart(p: { read: boolean; write: boolean; execute: boolean }): string {
  return `${p.read ? "r" : "-"}${p.write ? "w" : "-"}${p.execute ? "x" : "-"}`;
}

export default function ChmodCalculatorPage() {
  const [perms, setPerms] = useState<PermissionsState>(DEFAULT_PERMS);
  const [fileName, setFileName] = useState("file.txt");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const userOctal = calculateOctalDigit(perms.user);
  const groupOctal = calculateOctalDigit(perms.group);
  const otherOctal = calculateOctalDigit(perms.other);
  const octalString = `${userOctal}${groupOctal}${otherOctal}`;

  const symbolicString = `-${calculateSymbolicPart(perms.user)}${calculateSymbolicPart(perms.group)}${calculateSymbolicPart(perms.other)}`;
  const chmodCommand = `chmod ${octalString} ${fileName.trim() || "file.txt"}`;

  const togglePerm = (scope: Scope, type: PermType) => {
    setPerms((prev) => ({
      ...prev,
      [scope]: {
        ...prev[scope],
        [type]: !prev[scope][type],
      },
    }));
  };

  const applyOctal = (numeric: string) => {
    if (!/^[0-7]{3}$/.test(numeric)) return;

    const parseDigit = (d: number) => ({
      read: (d & 4) !== 0,
      write: (d & 2) !== 0,
      execute: (d & 1) !== 0,
    });

    setPerms({
      user: parseDigit(Number(numeric[0])),
      group: parseDigit(Number(numeric[1])),
      other: parseDigit(Number(numeric[2])),
    });
  };

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const presets = [
    { label: "755 (Directory/Executable)", octal: "755" },
    { label: "644 (Standard File)", octal: "644" },
    { label: "700 (Private Executable)", octal: "700" },
    { label: "600 (SSH Key/Secrets)", octal: "600" },
    { label: "777 (Full Access)", octal: "777" },
  ];

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
              Chmod Permissions Calculator
            </h1>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            POSIX / Unix Permissions
          </span>
        </header>

        {/* Results Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Octal */}
          <div className="bg-[#0a0b0e] border border-zinc-800 p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-zinc-500 font-mono uppercase block mb-1">
                Octal Notation
              </span>
              <span className="text-2xl font-bold font-mono text-blue-400">
                {octalString}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(octalString, "octal")}
              className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
            >
              {copiedKey === "octal" ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            </button>
          </div>

          {/* Symbolic */}
          <div className="bg-[#0a0b0e] border border-zinc-800 p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-zinc-500 font-mono uppercase block mb-1">
                Symbolic Notation
              </span>
              <span className="text-xl font-bold font-mono text-zinc-200">
                {symbolicString}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(symbolicString, "symbolic")}
              className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
            >
              {copiedKey === "symbolic" ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            </button>
          </div>

          {/* Direct Input */}
          <div className="bg-[#0a0b0e] border border-zinc-800 p-4 flex flex-col justify-between">
            <span className="text-[10px] text-zinc-500 font-mono uppercase block mb-1">
              Direct Octal Input
            </span>
            <input
              type="text"
              maxLength={3}
              value={octalString}
              onChange={(e) => applyOctal(e.target.value)}
              className="bg-black border border-zinc-800 px-3 py-1 font-mono text-sm text-zinc-200 outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* Command Output Banner */}
        <div className="bg-[#0a0b0e] border border-zinc-800 p-3.5 mb-6 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-2 text-zinc-400">
            <Terminal size={14} className="text-blue-400" />
            <span className="text-zinc-200 select-all">{chmodCommand}</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="filename..."
              className="bg-black border border-zinc-800 px-2 py-1 text-xs text-zinc-300 outline-none focus:border-blue-600 w-32"
            />
            <button
              type="button"
              onClick={() => handleCopy(chmodCommand, "cmd")}
              className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              {copiedKey === "cmd" ? "Copied" : "Copy Command"}
            </button>
          </div>
        </div>

        {/* Permission Grid Matrix */}
        <div className="border border-zinc-800 bg-[#0a0b0e] mb-6">
          <div className="grid grid-cols-4 border-b border-zinc-800 bg-black/40 text-xs font-mono text-zinc-400 p-3 text-center">
            <span className="text-left font-semibold">Tier</span>
            <span>Read (4)</span>
            <span>Write (2)</span>
            <span>Execute (1)</span>
          </div>

          {/* Owner / User */}
          <div className="grid grid-cols-4 items-center border-b border-zinc-900 p-3.5 font-mono text-xs hover:bg-[#0e1015]">
            <div>
              <span className="font-semibold text-zinc-200 block">Owner (User)</span>
              <span className="text-[10px] text-zinc-500">Current: {userOctal}</span>
            </div>
            <div className="flex justify-center">
              <input
                type="checkbox"
                checked={perms.user.read}
                onChange={() => togglePerm("user", "read")}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
            </div>
            <div className="flex justify-center">
              <input
                type="checkbox"
                checked={perms.user.write}
                onChange={() => togglePerm("user", "write")}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
            </div>
            <div className="flex justify-center">
              <input
                type="checkbox"
                checked={perms.user.execute}
                onChange={() => togglePerm("user", "execute")}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Group */}
          <div className="grid grid-cols-4 items-center border-b border-zinc-900 p-3.5 font-mono text-xs hover:bg-[#0e1015]">
            <div>
              <span className="font-semibold text-zinc-200 block">Group</span>
              <span className="text-[10px] text-zinc-500">Current: {groupOctal}</span>
            </div>
            <div className="flex justify-center">
              <input
                type="checkbox"
                checked={perms.group.read}
                onChange={() => togglePerm("group", "read")}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
            </div>
            <div className="flex justify-center">
              <input
                type="checkbox"
                checked={perms.group.write}
                onChange={() => togglePerm("group", "write")}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
            </div>
            <div className="flex justify-center">
              <input
                type="checkbox"
                checked={perms.group.execute}
                onChange={() => togglePerm("group", "execute")}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Others / Public */}
          <div className="grid grid-cols-4 items-center p-3.5 font-mono text-xs hover:bg-[#0e1015]">
            <div>
              <span className="font-semibold text-zinc-200 block">Others (Public)</span>
              <span className="text-[10px] text-zinc-500">Current: {otherOctal}</span>
            </div>
            <div className="flex justify-center">
              <input
                type="checkbox"
                checked={perms.other.read}
                onChange={() => togglePerm("other", "read")}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
            </div>
            <div className="flex justify-center">
              <input
                type="checkbox"
                checked={perms.other.write}
                onChange={() => togglePerm("other", "write")}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
            </div>
            <div className="flex justify-center">
              <input
                type="checkbox"
                checked={perms.other.execute}
                onChange={() => togglePerm("other", "execute")}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Common Presets */}
        <div className="border border-zinc-800 bg-[#0a0b0e] p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase text-[11px] tracking-wider text-zinc-400">
              Standard Linux Presets
            </span>
            <button
              type="button"
              onClick={() => setPerms(DEFAULT_PERMS)}
              className="flex items-center gap-1 text-[11px] font-mono text-zinc-500 hover:text-zinc-200"
            >
              <RotateCcw size={12} />
              <span>Reset 755</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.octal}
                type="button"
                onClick={() => applyOctal(preset.octal)}
                className={`px-3 py-1.5 text-xs font-mono border transition-colors ${
                  octalString === preset.octal
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevVault · Chmod Calculator
      </footer>
    </div>
  );
}