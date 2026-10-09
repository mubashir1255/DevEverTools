"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Palette,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";

type Rgb = { r: number; g: number; b: number };
type Hsl = { h: number; s: number; l: number };

function hexToRgb(hex: string): Rgb | null {
  const clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  return null;
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${clamp(r).toString(16).padStart(2, "0")}${clamp(g).toString(16).padStart(2, "0")}${clamp(b).toString(16).padStart(2, "0")}`;
}

function rgbToHsl(r: number, g: number, b: number): Hsl {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// WCAG Relative Luminance
function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// WCAG Contrast Ratio
function getContrastRatio(lum1: number, lum2: number): number {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Generate stepped shade variation
function generateShades(hex: string): { label: string; hex: string }[] {
  const rgb = hexToRgb(hex);
  if (!rgb) return [];

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const stops = [
    { label: "50", lightness: 95 },
    { label: "100", lightness: 90 },
    { label: "200", lightness: 80 },
    { label: "300", lightness: 70 },
    { label: "400", lightness: 60 },
    { label: "500", lightness: hsl.l },
    { label: "600", lightness: Math.max(10, hsl.l - 12) },
    { label: "700", lightness: Math.max(8, hsl.l - 22) },
    { label: "800", lightness: Math.max(6, hsl.l - 32) },
    { label: "900", lightness: Math.max(4, hsl.l - 42) },
  ];

  return stops.map((stop) => {
    // HSL to RGB conversion for stops
    const h = hsl.h / 360;
    const s = hsl.s / 100;
    const l = stop.lightness / 100;

    let r: number, g: number, b: number;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      label: stop.label,
      hex: rgbToHex(r * 255, g * 255, b * 255),
    };
  });
}

const PRESET_COLORS = [
  { name: "Vault Blue", hex: "#2563eb" },
  { name: "Cyan", hex: "#06b6d4" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Crimson", hex: "#ef4444" },
  { name: "Violet", hex: "#8b5cf6" },
];

export default function ColorPalettePage() {
  const [hexInput, setHexInput] = useState("#2563eb");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const rgb = hexToRgb(hexInput) || { r: 37, g: 99, b: 235 };
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslString = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  const colorLum = getLuminance(rgb.r, rgb.g, rgb.b);
  const contrastAgainstWhite = getContrastRatio(colorLum, 1.0);
  const contrastAgainstBlack = getContrastRatio(colorLum, 0.0);

  const shades = generateShades(hexInput);

  const handleCopy = async (val: string, key: string) => {
    await navigator.clipboard.writeText(val);
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
              Color Palette & Contrast Checker
            </h1>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            WCAG 2.1 Compliant Engine
          </span>
        </header>

        {/* Primary Color Editor & Presets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Main Color Swatch & Native Picker */}
          <div className="bg-[#0a0b0e] border border-zinc-800 p-5 flex flex-col justify-between">
            <span className="text-xs font-mono uppercase text-zinc-400 tracking-wider mb-3">
              Active Color
            </span>

            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-16 h-16 border border-zinc-700 shrink-0 relative overflow-hidden"
                style={{ backgroundColor: hexInput }}
              >
                <input
                  type="color"
                  value={hexInput}
                  onChange={(e) => setHexInput(e.target.value)}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                />
              </div>

              <div className="flex-1 font-mono">
                <span className="text-[10px] text-zinc-500 uppercase block">Hex Value</span>
                <input
                  type="text"
                  value={hexInput}
                  onChange={(e) => setHexInput(e.target.value)}
                  className="bg-black border border-zinc-800 text-sm font-bold text-white px-2 py-1 outline-none w-full uppercase focus:border-blue-600"
                />
              </div>
            </div>

            {/* Presets */}
            <div className="pt-3 border-t border-zinc-900">
              <span className="text-[10px] text-zinc-500 font-mono uppercase block mb-2">
                Quick Palettes
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COLORS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setHexInput(p.hex)}
                    className="w-6 h-6 border border-zinc-800 hover:scale-110 transition-transform"
                    style={{ backgroundColor: p.hex }}
                    title={p.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Formats Copy Matrix */}
          <div className="bg-[#0a0b0e] border border-zinc-800 p-5 flex flex-col justify-between font-mono text-xs">
            <span className="uppercase text-zinc-400 tracking-wider text-[11px] mb-3">
              Color Formats
            </span>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2 bg-black border border-zinc-900">
                <span className="text-zinc-400">HEX: <strong className="text-white">{hexInput.toUpperCase()}</strong></span>
                <button
                  type="button"
                  onClick={() => handleCopy(hexInput.toUpperCase(), "hex")}
                  className="text-zinc-500 hover:text-white"
                >
                  {copiedKey === "hex" ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                </button>
              </div>

              <div className="flex items-center justify-between p-2 bg-black border border-zinc-900">
                <span className="text-zinc-400">RGB: <strong className="text-white">{rgbString}</strong></span>
                <button
                  type="button"
                  onClick={() => handleCopy(rgbString, "rgb")}
                  className="text-zinc-500 hover:text-white"
                >
                  {copiedKey === "rgb" ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                </button>
              </div>

              <div className="flex items-center justify-between p-2 bg-black border border-zinc-900">
                <span className="text-zinc-400">HSL: <strong className="text-white">{hslString}</strong></span>
                <button
                  type="button"
                  onClick={() => handleCopy(hslString, "hsl")}
                  className="text-zinc-500 hover:text-white"
                >
                  {copiedKey === "hsl" ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                </button>
              </div>
            </div>
          </div>

          {/* WCAG Contrast Scorecard */}
          <div className="bg-[#0a0b0e] border border-zinc-800 p-5 flex flex-col justify-between font-mono text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="uppercase text-zinc-400 tracking-wider text-[11px] flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-blue-400" />
                <span>WCAG Contrast</span>
              </span>
            </div>

            <div className="space-y-3">
              {/* On White */}
              <div className="p-2.5 bg-black border border-zinc-900">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] text-zinc-400">Against White (#FFF)</span>
                  <span className="font-bold text-white">{contrastAgainstWhite.toFixed(2)}:1</span>
                </div>
                <div className="flex gap-2 text-[10px]">
                  <span className={`flex items-center gap-0.5 ${contrastAgainstWhite >= 4.5 ? "text-emerald-400" : "text-red-400"}`}>
                    {contrastAgainstWhite >= 4.5 ? <CheckCircle2 size={11} /> : <XCircle size={11} />} AA (4.5:1)
                  </span>
                  <span className={`flex items-center gap-0.5 ${contrastAgainstWhite >= 7.0 ? "text-emerald-400" : "text-red-400"}`}>
                    {contrastAgainstWhite >= 7.0 ? <CheckCircle2 size={11} /> : <XCircle size={11} />} AAA (7.0:1)
                  </span>
                </div>
              </div>

              {/* On Black */}
              <div className="p-2.5 bg-black border border-zinc-900">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] text-zinc-400">Against Black (#000)</span>
                  <span className="font-bold text-white">{contrastAgainstBlack.toFixed(2)}:1</span>
                </div>
                <div className="flex gap-2 text-[10px]">
                  <span className={`flex items-center gap-0.5 ${contrastAgainstBlack >= 4.5 ? "text-emerald-400" : "text-red-400"}`}>
                    {contrastAgainstBlack >= 4.5 ? <CheckCircle2 size={11} /> : <XCircle size={11} />} AA (4.5:1)
                  </span>
                  <span className={`flex items-center gap-0.5 ${contrastAgainstBlack >= 7.0 ? "text-emerald-400" : "text-red-400"}`}>
                    {contrastAgainstBlack >= 7.0 ? <CheckCircle2 size={11} /> : <XCircle size={11} />} AAA (7.0:1)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 10-Step Luminance Scale */}
        <div className="border border-zinc-800 bg-[#0a0b0e] p-5 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-4 font-mono text-xs">
            <span className="uppercase text-zinc-300 font-semibold tracking-wider flex items-center gap-2">
              <Palette size={14} className="text-blue-400" />
              <span>Generated Luminance Scale (Tailwind Compatible)</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
            {shades.map((shade) => {
              const shadeRgb = hexToRgb(shade.hex) || { r: 0, g: 0, b: 0 };
              const isDark = getLuminance(shadeRgb.r, shadeRgb.g, shadeRgb.b) < 0.35;
              const isCopied = copiedKey === `shade-${shade.label}`;

              return (
                <div
                  key={shade.label}
                  onClick={() => handleCopy(shade.hex, `shade-${shade.label}`)}
                  className="h-28 p-2.5 flex flex-col justify-between border border-zinc-800 cursor-pointer hover:scale-[1.03] transition-transform select-none"
                  style={{ backgroundColor: shade.hex }}
                >
                  <span
                    className={`font-mono text-xs font-bold ${
                      isDark ? "text-white" : "text-black"
                    }`}
                  >
                    {shade.label}
                  </span>

                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-[10px] uppercase ${
                        isDark ? "text-zinc-300" : "text-zinc-800"
                      }`}
                    >
                      {shade.hex}
                    </span>
                    {isCopied && (
                      <Check
                        size={12}
                        className={isDark ? "text-emerald-400" : "text-emerald-800"}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevVault · Color Palette & Contrast Checker
      </footer>
    </div>
  );
}