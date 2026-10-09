"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Sliders,
  Type,
} from "lucide-react";

export default function CssUnitConverterPage() {
  const [rootPx, setRootPx] = useState<number>(16);

  // Unit Converter State
  const [pxVal, setPxVal] = useState<string>("16");
  const [remVal, setRemVal] = useState<string>("1");
  const [emVal, setEmVal] = useState<string>("1");
  const [percentVal, setPercentVal] = useState<string>("100");

  // Clamp Generator State
  const [minVw, setMinVw] = useState<number>(375);
  const [maxVw, setMaxVw] = useState<number>(1280);
  const [minSize, setMinSize] = useState<number>(16);
  const [maxSize, setMaxSize] = useState<number>(32);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const updateFromPx = (val: string, base = rootPx) => {
    setPxVal(val);
    const num = parseFloat(val);
    if (isNaN(num) || base <= 0) {
      setRemVal("");
      setEmVal("");
      setPercentVal("");
      return;
    }
    const rem = num / base;
    setRemVal((Math.round(rem * 1000) / 1000).toString());
    setEmVal((Math.round(rem * 1000) / 1000).toString());
    setPercentVal((Math.round(rem * 10000) / 100).toString());
  };

  const updateFromRem = (val: string, base = rootPx) => {
    setRemVal(val);
    const num = parseFloat(val);
    if (isNaN(num) || base <= 0) {
      setPxVal("");
      setEmVal("");
      setPercentVal("");
      return;
    }
    const px = num * base;
    setPxVal((Math.round(px * 100) / 100).toString());
    setEmVal(val);
    setPercentVal((Math.round(num * 10000) / 100).toString());
  };

  // Fluid clamp calculation: clamp(min, yAxisIntersection + slope * 100vw, max)
  const calculateClamp = (): string => {
    if (maxVw <= minVw || rootPx <= 0) return "/* Invalid Viewport Range */";

    const slope = (maxSize - minSize) / (maxVw - minVw);
    const yAxisIntersection = -minVw * slope + minSize;

    const minRem = (Math.round((minSize / rootPx) * 1000) / 1000).toFixed(3);
    const maxRem = (Math.round((maxSize / rootPx) * 1000) / 1000).toFixed(3);
    const preferredVw = (Math.round(slope * 100 * 1000) / 1000).toFixed(3);
    const preferredRem = (Math.round((yAxisIntersection / rootPx) * 1000) / 1000).toFixed(3);

    return `clamp(${minRem}rem, ${preferredRem}rem + ${preferredVw}vw, ${maxRem}rem)`;
  };

  const clampExpression = calculateClamp();

  const handleCopy = async (text: string, key: string) => {
    if (!text) return;
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
              CSS Unit & Clamp Converter
            </h1>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Fluid Typography & Layout
          </span>
        </header>

        {/* Global Base Setting */}
        <div className="bg-[#0a0b0e] border border-zinc-800 p-3.5 mb-6 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-2">
            <Type size={14} className="text-blue-400" />
            <span className="text-zinc-400">Root Font Size (1rem =):</span>
            <input
              type="number"
              min={1}
              value={rootPx}
              onChange={(e) => {
                const next = parseFloat(e.target.value) || 16;
                setRootPx(next);
                updateFromPx(pxVal, next);
              }}
              className="bg-black border border-zinc-800 px-2 py-1 text-xs text-zinc-100 w-20 outline-none focus:border-blue-600"
            />
            <span className="text-zinc-500">px</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-zinc-500">
            <span>Presets:</span>
            {[16, 14, 10, 12].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setRootPx(preset);
                  updateFromPx(pxVal, preset);
                }}
                className={`px-2 py-0.5 border ${
                  rootPx === preset
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {preset}px
              </button>
            ))}
          </div>
        </div>

        {/* Section 1: Standard Unit Converter */}
        <div className="border border-zinc-800 bg-[#0a0b0e] p-5 mb-6">
          <div className="flex items-center gap-2 mb-4 font-mono text-xs font-semibold uppercase text-zinc-300 tracking-wider">
            <Sliders size={14} className="text-blue-400" />
            <span>Interactive Unit Synchronization</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            {/* PX Input */}
            <div className="bg-black border border-zinc-900 p-3">
              <span className="text-[10px] text-zinc-500 uppercase block mb-1">Pixels (px)</span>
              <input
                type="number"
                value={pxVal}
                onChange={(e) => updateFromPx(e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-white outline-none"
              />
            </div>

            {/* REM Input */}
            <div className="bg-black border border-zinc-900 p-3">
              <span className="text-[10px] text-zinc-500 uppercase block mb-1">Root EM (rem)</span>
              <input
                type="number"
                step="0.05"
                value={remVal}
                onChange={(e) => updateFromRem(e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-blue-400 outline-none"
              />
            </div>

            {/* EM Display */}
            <div className="bg-black border border-zinc-900 p-3 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block mb-1">Element EM (em)</span>
                <span className="text-sm font-bold text-zinc-300">{emVal || "0"}em</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(`${emVal}em`, "em")}
                className="text-zinc-500 hover:text-white"
              >
                {copiedKey === "em" ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              </button>
            </div>

            {/* Percent Display */}
            <div className="bg-black border border-zinc-900 p-3 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block mb-1">Percentage (%)</span>
                <span className="text-sm font-bold text-zinc-300">{percentVal || "0"}%</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(`${percentVal}%`, "pct")}
                className="text-zinc-500 hover:text-white"
              >
                {copiedKey === "pct" ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Fluid clamp() Generator */}
        <div className="border border-zinc-800 bg-[#0a0b0e] p-5 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-4 font-mono text-xs">
            <span className="font-semibold uppercase text-zinc-300 tracking-wider">
              Fluid Responsive clamp() Generator
            </span>
            <span className="text-zinc-500 text-[11px]">
              Linear Scale Viewport Calculation
            </span>
          </div>

          {/* Viewport & Size Parameter Inputs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs mb-5">
            <div className="bg-black border border-zinc-900 p-3">
              <span className="text-[10px] text-zinc-500 uppercase block mb-1">Min Viewport (px)</span>
              <input
                type="number"
                value={minVw}
                onChange={(e) => setMinVw(parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent text-sm font-bold text-zinc-200 outline-none"
              />
            </div>

            <div className="bg-black border border-zinc-900 p-3">
              <span className="text-[10px] text-zinc-500 uppercase block mb-1">Max Viewport (px)</span>
              <input
                type="number"
                value={maxVw}
                onChange={(e) => setMaxVw(parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent text-sm font-bold text-zinc-200 outline-none"
              />
            </div>

            <div className="bg-black border border-zinc-900 p-3">
              <span className="text-[10px] text-zinc-500 uppercase block mb-1">Min Size (px)</span>
              <input
                type="number"
                value={minSize}
                onChange={(e) => setMinSize(parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent text-sm font-bold text-zinc-200 outline-none"
              />
            </div>

            <div className="bg-black border border-zinc-900 p-3">
              <span className="text-[10px] text-zinc-500 uppercase block mb-1">Max Size (px)</span>
              <input
                type="number"
                value={maxSize}
                onChange={(e) => setMaxSize(parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent text-sm font-bold text-zinc-200 outline-none"
              />
            </div>
          </div>

          {/* Clamp Result Box */}
          <div className="bg-black border border-zinc-900 p-4 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="overflow-x-auto">
              <span className="text-[10px] text-zinc-500 uppercase block mb-1">CSS Output</span>
              <code className="text-blue-400 font-bold select-all text-xs tracking-wide">
                font-size: {clampExpression};
              </code>
            </div>

            <button
              type="button"
              onClick={() => handleCopy(`font-size: ${clampExpression};`, "clamp")}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors shrink-0"
            >
              {copiedKey === "clamp" ? (
                <>
                  <Check size={13} className="text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy Declaration</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevVault · CSS Unit & Clamp Converter
      </footer>
    </div>
  );
}