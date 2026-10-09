"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Keyboard,
} from "lucide-react";

type KeyRecord = {
  key: string;
  code: string;
  which: number;
  location: number;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  repeat: boolean;
  timestamp: string;
};

export default function KeycodeInspectorPage() {
  const [currentKey, setCurrentKey] = useState<KeyRecord>({
    key: "Enter",
    code: "Enter",
    which: 13,
    location: 0,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    repeat: false,
    timestamp: "Ready",
  });

  const [history, setHistory] = useState<KeyRecord[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow standard dev shortcuts like F12 or refresh
      if (e.key === "F12" || (e.ctrlKey && e.key.toLowerCase() === "r")) {
        return;
      }

      e.preventDefault();

      const record: KeyRecord = {
        key: e.key,
        code: e.code,
        which: e.which,
        location: e.location,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        metaKey: e.metaKey,
        repeat: e.repeat,
        timestamp: new Date().toLocaleTimeString(),
      };

      setCurrentKey(record);
      setHistory((prev) => [record, ...prev.slice(0, 9)]);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const snippet = `// Event handler guard\nif (e.code === "${currentKey.code}") {\n  // Handle ${currentKey.key}\n}`;

  const handleCopy = async (text: string, keyName: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
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
              KeyCode & Keyboard Event Inspector
            </h1>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Interactive KeyboardEvent Capture
          </span>
        </header>

        {/* Hero Interactive Target Box */}
        <div className="border border-zinc-800 bg-[#0a0b0e] p-8 mb-6 flex flex-col items-center justify-center text-center select-none relative overflow-hidden">
          <div className="absolute top-3 left-4 text-[10px] font-mono text-zinc-600 uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Listening for keypress anywhere on screen</span>
          </div>

          <div className="text-6xl sm:text-7xl font-mono font-bold text-white tracking-tight my-4">
            {currentKey.which}
          </div>

          <div className="text-sm font-mono text-blue-400 flex items-center gap-3">
            <span>key: <strong className="text-white bg-black border border-zinc-800 px-2 py-0.5">{currentKey.key}</strong></span>
            <span className="text-zinc-700">|</span>
            <span>code: <strong className="text-white bg-black border border-zinc-800 px-2 py-0.5">{currentKey.code}</strong></span>
          </div>
        </div>

        {/* Detailed Property Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs mb-6">
          <div className="bg-[#0a0b0e] border border-zinc-800 p-4">
            <span className="text-[10px] text-zinc-500 uppercase block mb-1">e.key</span>
            <span className="text-base font-bold text-zinc-100">{currentKey.key}</span>
          </div>

          <div className="bg-[#0a0b0e] border border-zinc-800 p-4">
            <span className="text-[10px] text-zinc-500 uppercase block mb-1">e.code</span>
            <span className="text-base font-bold text-zinc-100">{currentKey.code}</span>
          </div>

          <div className="bg-[#0a0b0e] border border-zinc-800 p-4">
            <span className="text-[10px] text-zinc-500 uppercase block mb-1">e.which / keyCode</span>
            <span className="text-base font-bold text-blue-400">{currentKey.which}</span>
          </div>

          <div className="bg-[#0a0b0e] border border-zinc-800 p-4">
            <span className="text-[10px] text-zinc-500 uppercase block mb-1">e.location</span>
            <span className="text-base font-bold text-zinc-100">{currentKey.location}</span>
          </div>
        </div>

        {/* Modifiers & Code Snippet Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Active Modifiers */}
          <div className="bg-[#0a0b0e] border border-zinc-800 p-5 font-mono text-xs flex flex-col justify-between">
            <span className="text-[11px] text-zinc-400 uppercase tracking-wider block mb-3">
              Modifier Keys
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { name: "Ctrl", active: currentKey.ctrlKey },
                { name: "Shift", active: currentKey.shiftKey },
                { name: "Alt", active: currentKey.altKey },
                { name: "Meta (Cmd/Win)", active: currentKey.metaKey },
              ].map((mod) => (
                <div
                  key={mod.name}
                  className={`p-3 border flex items-center justify-between ${
                    mod.active
                      ? "border-blue-600 bg-blue-950/20 text-blue-300 font-bold"
                      : "border-zinc-900 bg-black text-zinc-600"
                  }`}
                >
                  <span>{mod.name}</span>
                  <span className="text-[10px] uppercase">
                    {mod.active ? "Active" : "False"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Code Generator */}
          <div className="bg-[#0a0b0e] border border-zinc-800 p-5 font-mono text-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-zinc-400 uppercase tracking-wider">
                JavaScript Guard Snippet
              </span>
              <button
                type="button"
                onClick={() => handleCopy(snippet, "snippet")}
                className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white"
              >
                {copiedKey === "snippet" ? (
                  <>
                    <Check size={12} className="text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <pre className="bg-black border border-zinc-900 p-3 text-xs text-blue-400 select-all overflow-x-auto">
              {snippet}
            </pre>
          </div>
        </div>

        {/* History Trail */}
        <div className="border border-zinc-800 bg-[#0a0b0e] flex flex-col">
          <div className="border-b border-zinc-800 px-4 py-2.5 bg-black/40 text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <Keyboard size={14} className="text-blue-400" />
            <span>Key History (Last 10)</span>
          </div>

          <div className="divide-y divide-zinc-900 font-mono text-xs p-2">
            {history.length > 0 ? (
              history.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 hover:bg-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-600 text-[10px] w-4">#{idx + 1}</span>
                    <span className="px-2 py-0.5 bg-black border border-zinc-800 text-zinc-200 font-bold">
                      {item.key}
                    </span>
                    <span className="text-zinc-500 text-[11px]">code: {item.code}</span>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-500 text-[11px]">
                    <span className="text-blue-400">keyCode: {item.which}</span>
                    <span>{item.timestamp}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-zinc-500 text-xs">
                Press any key on your keyboard to begin capturing events.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevEverTools · KeyCode & Keyboard Event Inspector
      </footer>
    </div>
  );
}