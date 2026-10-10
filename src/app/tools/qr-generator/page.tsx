"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  QrCode,
  RefreshCw,
  Sliders,
} from "lucide-react";

export default function QrGeneratorPage() {
  const [text, setText] = useState("https://github.com/mubashir1255/DevEverTools");
  const [size, setSize] = useState(280);
  const [fgColor, setFgColor] = useState("#000000"); // Standard dark foreground
  const [bgColor, setBgColor] = useState("#ffffff"); // Standard light background
  const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Synchronous pure QR calculation (No async setState cascading warnings)
  const { qrData, error } = useMemo(() => {
    if (!text.trim()) return { qrData: null, error: null };
    try {
      const code = QRCode.create(text.trim(), {
        errorCorrectionLevel: errorLevel,
      });
      return { qrData: code, error: null };
    } catch (err: unknown) {
      return {
        qrData: null,
        error: err instanceof Error ? err.message : "Failed to generate QR code.",
      };
    }
  }, [text, errorLevel]);

  // Synchronous SVG markup calculation
  const svgMarkup = useMemo(() => {
    if (!qrData) return "";
    const moduleCount = qrData.modules.size;
    const margin = 4; // ISO quiet zone
    const totalSize = moduleCount + margin * 2;
    let path = "";

    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (qrData.modules.get(r, c)) {
          path += `M${c + margin},${r + margin}h1v1h-1z `;
        }
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="${size}" height="${size}"><rect width="100%" height="100%" fill="${bgColor}"/><path d="${path}" fill="${fgColor}"/></svg>`;
  }, [qrData, size, fgColor, bgColor]);

  // Paint to canvas whenever the matrix or styles change
  useEffect(() => {
    if (!qrData || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const moduleCount = qrData.modules.size;
    const margin = 4;
    const totalModules = moduleCount + margin * 2;
    const cellSize = Math.floor(size / totalModules) || 1;
    const actualCanvasSize = cellSize * totalModules;

    canvas.width = actualCanvasSize;
    canvas.height = actualCanvasSize;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, actualCanvasSize, actualCanvasSize);

    ctx.fillStyle = fgColor;
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (qrData.modules.get(r, c)) {
          ctx.fillRect(
            (c + margin) * cellSize,
            (r + margin) * cellSize,
            cellSize,
            cellSize
          );
        }
      }
    }
  }, [qrData, size, fgColor, bgColor]);
  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `qrcode-${Date.now()}.png`;
    a.click();
  };

  const handleDownloadSvg = () => {
    if (!svgMarkup) return;
    const blob = new Blob([svgMarkup], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qrcode-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySvg = async () => {
    if (!svgMarkup) return;
    await navigator.clipboard.writeText(svgMarkup);
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
              QR Code Generator
            </h1>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            High Reliability Engine
          </span>
        </header>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 mb-6">
          {/* Controls & Text Input */}
          <div className="border border-zinc-800 bg-[#0a0b0e] p-5 flex flex-col justify-between space-y-5 font-mono text-xs">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-zinc-400 uppercase text-[11px]">
                <span className="flex items-center gap-1.5 font-bold">
                  <QrCode size={13} className="text-blue-400" />
                  <span>Payload Content</span>
                </span>
                <span className="text-zinc-600">{text.length} chars</span>
              </div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter URL, Wi-Fi configuration, or text..."
                rows={4}
                className="w-full bg-black border border-zinc-800 p-3 text-xs font-mono text-zinc-200 outline-none focus:border-blue-600 resize-none"
              />

              {error && (
                <div className="p-3 bg-red-950/20 border border-red-800 text-red-400 text-xs">
                  {error}
                </div>
              )}

              {/* Formatting & Colors */}
              <div className="border-t border-zinc-900 pt-4 space-y-4">
                <div className="flex items-center gap-1.5 text-zinc-400 uppercase text-[11px] font-semibold">
                  <Sliders size={13} className="text-blue-400" />
                  <span>Options</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block mb-1">
                      Foreground (Dark)
                    </span>
                    <div className="flex items-center gap-2 bg-black border border-zinc-800 p-1.5">
                      <input
                        type="color"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="w-5 h-5 border-0 bg-transparent cursor-pointer"
                      />
                      <span className="text-[11px] text-zinc-300 uppercase">
                        {fgColor}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block mb-1">
                      Background (Light)
                    </span>
                    <div className="flex items-center gap-2 bg-black border border-zinc-800 p-1.5">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-5 h-5 border-0 bg-transparent cursor-pointer"
                      />
                      <span className="text-[11px] text-zinc-300 uppercase">
                        {bgColor}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block mb-1">
                      Error Correction
                    </span>
                    <div className="grid grid-cols-4 gap-1">
                      {(["L", "M", "Q", "H"] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setErrorLevel(lvl)}
                          className={`py-1 text-center border text-[11px] transition-colors ${
                            errorLevel === lvl
                              ? "bg-blue-600 border-blue-600 text-white font-bold"
                              : "bg-black border-zinc-800 text-zinc-400 hover:text-white"
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                      <span>Size</span>
                      <span>{size}px</span>
                    </div>
                    <input
                      type="range"
                      min={180}
                      max={500}
                      step={20}
                      value={size}
                      onChange={(e) => setSize(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="pt-3 border-t border-zinc-900 flex flex-wrap gap-1.5">
              <span className="text-[10px] text-zinc-600 uppercase mr-1 self-center">
                Presets:
              </span>
              {[
                { label: "Standard (Black/White)", fg: "#000000", bg: "#ffffff" },
                { label: "Dark High-Contrast", fg: "#0f172a", bg: "#f8fafc" },
                { label: "Dev Vault Blue", fg: "#1e3a8a", bg: "#f0f9ff" },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setFgColor(p.fg);
                    setBgColor(p.bg);
                  }}
                  className="px-2 py-0.5 border border-zinc-800 bg-black text-zinc-400 hover:text-white text-[10px] transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview Canvas & Export Actions */}
          <div className="border border-zinc-800 bg-[#0a0b0e] p-6 flex flex-col justify-between items-center text-center">
            <div className="w-full flex items-center justify-between border-b border-zinc-800 pb-3 text-xs font-mono text-zinc-400">
              <span className="uppercase text-[11px]">Instant Camera Scan Target</span>
              <button
                type="button"
                onClick={() => {
                  setFgColor("#000000");
                  setBgColor("#ffffff");
                  setErrorLevel("M");
                }}
                className="text-zinc-500 hover:text-white flex items-center gap-1 text-[11px]"
                title="Reset defaults"
              >
                <RefreshCw size={11} />
                <span>Reset</span>
              </button>
            </div>

            {/* The QR Target Box */}
            <div className="my-auto p-4 bg-white/5 border border-zinc-800 flex items-center justify-center rounded">
              <canvas
                ref={canvasRef}
                style={{ width: "240px", height: "240px" }}
                className="rounded-sm shadow-2xl"
              />
            </div>

            {/* Export Buttons */}
            <div className="w-full grid grid-cols-3 gap-2 font-mono text-xs pt-4 border-t border-zinc-900">
              <button
                type="button"
                onClick={handleDownloadPng}
                disabled={!text.trim()}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
              >
                <Download size={13} />
                <span>PNG</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadSvg}
                disabled={!text.trim() || !svgMarkup}
                className="px-3 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
              >
                <Download size={13} />
                <span>SVG</span>
              </button>

              <button
                type="button"
                onClick={handleCopySvg}
                disabled={!text.trim() || !svgMarkup}
                className="px-3 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
              >
                {copied ? (
                  <>
                    <Check size={13} className="text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy SVG</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevEverTools · QR Code Generator
      </footer>
    </div>
  );
}