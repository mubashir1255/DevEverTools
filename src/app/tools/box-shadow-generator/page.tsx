"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Layers,
  Plus,
  Trash2,
} from "lucide-react";

type ShadowLayer = {
  id: string;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
};

const PRESETS: { name: string; layers: ShadowLayer[] }[] = [
  {
    name: "Soft Subtle (md)",
    layers: [
      { id: "1", x: 0, y: 4, blur: 6, spread: -1, color: "#000000", opacity: 40, inset: false },
      { id: "2", x: 0, y: 2, blur: 4, spread: -2, color: "#000000", opacity: 30, inset: false },
    ],
  },
  {
    name: "High Elevation (2xl)",
    layers: [
      { id: "1", x: 0, y: 25, blur: 50, spread: -12, color: "#000000", opacity: 70, inset: false },
    ],
  },
  {
    name: "Neon Blue Glow",
    layers: [
      { id: "1", x: 0, y: 0, blur: 20, spread: 2, color: "#2563eb", opacity: 80, inset: false },
      { id: "2", x: 0, y: 0, blur: 45, spread: 10, color: "#3b82f6", opacity: 40, inset: false },
    ],
  },
  {
    name: "Inner Dark Rim",
    layers: [
      { id: "1", x: 0, y: 4, blur: 12, spread: 0, color: "#000000", opacity: 80, inset: true },
    ],
  },
];

function hexToRgba(hex: string, opacityPercent: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  const a = (opacityPercent / 100).toFixed(2);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export default function BoxShadowGeneratorPage() {
  const [layers, setLayers] = useState<ShadowLayer[]>([
    { id: "1", x: 0, y: 12, blur: 30, spread: -4, color: "#2563eb", opacity: 35, inset: false },
  ]);
  const [boxColor, setBoxColor] = useState("#0f131a");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const shadowCssValue = layers
    .map(
      (l) =>
        `${l.inset ? "inset " : ""}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${hexToRgba(
          l.color,
          l.opacity
        )}`
    )
    .join(", ");

  const rawCssRule = `box-shadow: ${shadowCssValue};`;
  const tailwindClass = `shadow-[${shadowCssValue.replace(/\s+/g, "_")}]`;

  const handleAddLayer = () => {
    const newLayer: ShadowLayer = {
      id: Math.random().toString(36).substring(2, 9),
      x: 0,
      y: 6,
      blur: 16,
      spread: 0,
      color: "#000000",
      opacity: 40,
      inset: false,
    };
    setLayers([...layers, newLayer]);
  };

  const handleRemoveLayer = (id: string) => {
    if (layers.length <= 1) return;
    setLayers(layers.filter((l) => l.id !== id));
  };

  const updateLayer = (id: string, field: keyof ShadowLayer, value: number | string | boolean) => {
    setLayers(
      layers.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
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
              CSS Box Shadow & Glow Generator
            </h1>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Multi-Layer Engine
          </span>
        </header>

        {/* Presets Bar */}
        <div className="bg-[#0a0b0e] border border-zinc-800 p-3 mb-6 flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="text-[11px] text-zinc-500 uppercase mr-1">Presets:</span>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => setLayers(p.layers)}
              className="px-2.5 py-1 border border-zinc-800 bg-black text-zinc-400 hover:text-white hover:border-zinc-700 text-[11px] transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Main Grid: Controls + Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 mb-6">
          {/* Controls Panel */}
          <div className="flex flex-col border border-zinc-800 bg-[#0a0b0e] p-5 space-y-5 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <span className="text-zinc-400 uppercase text-[11px] font-semibold flex items-center gap-1.5">
                <Layers size={13} className="text-blue-400" />
                <span>Layers ({layers.length})</span>
              </span>
              <button
                type="button"
                onClick={handleAddLayer}
                className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs flex items-center gap-1 transition-colors"
              >
                <Plus size={12} />
                <span>Add Layer</span>
              </button>
            </div>

            <div className="space-y-6 max-h-[460px] overflow-y-auto pr-1">
              {layers.map((l, index) => (
                <div key={l.id} className="p-3 bg-black border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <span className="font-bold text-zinc-300">Layer #{index + 1}</span>
                    {layers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLayer(l.id)}
                        className="text-red-400 hover:text-red-300"
                        title="Remove layer"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-[10px] text-zinc-400 mb-0.5">
                        <span>X Offset</span>
                        <span>{l.x}px</span>
                      </div>
                      <input
                        type="range"
                        min={-50}
                        max={50}
                        value={l.x}
                        onChange={(e) => updateLayer(l.id, "x", Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-zinc-400 mb-0.5">
                        <span>Y Offset</span>
                        <span>{l.y}px</span>
                      </div>
                      <input
                        type="range"
                        min={-50}
                        max={50}
                        value={l.y}
                        onChange={(e) => updateLayer(l.id, "y", Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-[10px] text-zinc-400 mb-0.5">
                        <span>Blur</span>
                        <span>{l.blur}px</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={l.blur}
                        onChange={(e) => updateLayer(l.id, "blur", Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-zinc-400 mb-0.5">
                        <span>Spread</span>
                        <span>{l.spread}px</span>
                      </div>
                      <input
                        type="range"
                        min={-30}
                        max={50}
                        value={l.spread}
                        onChange={(e) => updateLayer(l.id, "spread", Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 items-center pt-1">
                    <div>
                      <span className="text-[10px] text-zinc-500 block mb-1">Color</span>
                      <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 p-1">
                        <input
                          type="color"
                          value={l.color}
                          onChange={(e) => updateLayer(l.id, "color", e.target.value)}
                          className="w-5 h-5 border-0 bg-transparent cursor-pointer"
                        />
                        <span className="text-[10px] uppercase text-zinc-300">{l.color}</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                        <span>Opacity</span>
                        <span>{l.opacity}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={l.opacity}
                        onChange={(e) => updateLayer(l.id, "opacity", Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-zinc-500 mb-1">Inset</span>
                      <button
                        type="button"
                        onClick={() => updateLayer(l.id, "inset", !l.inset)}
                        className={`px-3 py-1 text-[10px] border transition-colors ${
                          l.inset
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "bg-zinc-900 border-zinc-800 text-zinc-500"
                        }`}
                      >
                        {l.inset ? "Active" : "Off"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Preview Canvas */}
          <div className="flex flex-col border border-zinc-800 bg-[#0a0b0e] p-6 justify-between items-center min-h-[380px]">
            <div className="w-full flex items-center justify-between border-b border-zinc-800 pb-3 text-xs font-mono text-zinc-400">
              <span className="uppercase text-[11px]">Real-Time Canvas</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-500">Box Tint:</span>
                <input
                  type="color"
                  value={boxColor}
                  onChange={(e) => setBoxColor(e.target.value)}
                  className="w-5 h-5 border-0 bg-transparent cursor-pointer"
                />
              </div>
            </div>

            <div className="my-auto p-12 flex items-center justify-center">
              <div
                style={{
                  boxShadow: shadowCssValue,
                  backgroundColor: boxColor,
                }}
                className="w-48 h-48 border border-zinc-700/60 rounded-md transition-all flex items-center justify-center text-center p-4"
              >
                <span className="font-mono text-xs text-zinc-400 select-none">
                  Box Preview
                </span>
              </div>
            </div>

            <div className="w-full text-center text-[10px] font-mono text-zinc-600">
              Interactive target rendering live CSS box-shadow
            </div>
          </div>
        </div>

        {/* Export Snippets */}
        <div className="border border-zinc-800 bg-[#0a0b0e] p-5 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 uppercase text-[11px] font-semibold">
              CSS Code Snippet
            </span>
            <button
              type="button"
              onClick={() => handleCopy(rawCssRule, "css")}
              className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 transition-colors"
            >
              {copiedKey === "css" ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copiedKey === "css" ? "Copied" : "Copy CSS"}</span>
            </button>
          </div>

          <div className="p-3 bg-black border border-zinc-800 text-blue-400 break-all select-all">
            <code>{rawCssRule}</code>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-zinc-400 uppercase text-[11px] font-semibold">
              Tailwind Arbitrary Class
            </span>
            <button
              type="button"
              onClick={() => handleCopy(tailwindClass, "tw")}
              className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 transition-colors"
            >
              {copiedKey === "tw" ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copiedKey === "tw" ? "Copied" : "Copy Tailwind"}</span>
            </button>
          </div>

          <div className="p-3 bg-black border border-zinc-800 text-emerald-400 break-all select-all">
            <code>{tailwindClass}</code>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevEverTools · CSS Box Shadow Generator
      </footer>
    </div>
  );
}