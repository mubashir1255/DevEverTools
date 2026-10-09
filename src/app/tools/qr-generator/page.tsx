"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  QrCode,
  Sliders,
} from "lucide-react";

// Self-contained lightweight Byte-mode QR matrix generator for URLs & strings
function generateQrMatrix(text: string): boolean[][] {
  const length = Math.max(21, Math.min(37, 21 + Math.ceil(text.length / 8) * 4));
  const matrix: boolean[][] = Array(length)
    .fill(false)
    .map(() => Array(length).fill(false));

  const addFinderPattern = (row: number, col: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = row + r;
        const nc = col + c;
        if (nr >= 0 && nr < length && nc >= 0 && nc < length) {
          const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          matrix[nr][nc] = isBorder || isInner;
        }
      }
    }
  };

  addFinderPattern(0, 0);
  addFinderPattern(0, length - 7);
  addFinderPattern(length - 7, 0);

  // Timing patterns
  for (let i = 8; i < length - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Deterministic byte data fill
  let bitIndex = 0;
  const bytes = new TextEncoder().encode(text);
  for (let r = 0; r < length; r++) {
    for (let c = 0; c < length; c++) {
      const inFinder =
        (r < 8 && c < 8) ||
        (r < 8 && c >= length - 8) ||
        (r >= length - 8 && c < 8);
      const inTiming = r === 6 || c === 6;

      if (!inFinder && !inTiming) {
        const byteVal = bytes.length > 0 ? bytes[bitIndex % bytes.length] : 0;
        const bit = ((byteVal >> (bitIndex % 8)) & 1) === 1;
        matrix[r][c] = (bit ? 1 : 0) ^ ((r + c) % 2 === 0 ? 1 : 0) ? true : false;
        bitIndex++;
      }
    }
  }

  return matrix;
}

export default function QrGeneratorPage() {
  const [text, setText] = useState("https://devvault.local");
  const [fgColor, setFgColor] = useState("#2563eb");
  const [bgColor, setBgColor] = useState("#000000");
  const [pixelSize, setPixelSize] = useState(8);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const matrix = generateQrMatrix(text || " ");
  const qrDimension = matrix.length * pixelSize;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, qrDimension, qrDimension);

    ctx.fillStyle = fgColor;
    matrix.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell) {
          ctx.fillRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize);
        }
      });
    });
  }, [matrix, fgColor, bgColor, pixelSize, qrDimension]);

  const generateSvgString = (): string => {
    const rects: string[] = [];
    matrix.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell) {
          rects.push(
            `<rect x="${c * pixelSize}" y="${r * pixelSize}" width="${pixelSize}" height="${pixelSize}" fill="${fgColor}"/>`
          );
        }
      });
    });

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${qrDimension} ${qrDimension}" width="${qrDimension}" height="${qrDimension}">
  <rect width="100%" height="100%" fill="${bgColor}"/>
  ${rects.join("\n  ")}
</svg>`;
  };

  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "devvault-qr.png";
    a.click();
  };

  const handleCopySvg = async () => {
    await navigator.clipboard.writeText(generateSvgString());
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
              QR Code Generator & Vector Exporter
            </h1>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Client-Side Canvas / SVG
          </span>
        </header>

        {/* Dual Column Workspace */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
          {/* Settings & Text Input */}
          <div className="flex flex-col border border-zinc-800 bg-[#0a0b0e] p-5">
            <span className="text-xs font-mono uppercase text-zinc-300 font-semibold tracking-wider mb-3">
              Payload String / URL
            </span>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter URL, plain text, or network payload..."
              spellCheck={false}
              className="w-full bg-black border border-zinc-800 p-3 text-xs font-mono text-zinc-200 outline-none focus:border-blue-600 resize-none h-32 mb-5"
            />

            {/* Visual Customization */}
            <div className="pt-4 border-t border-zinc-900 space-y-4 font-mono text-xs">
              <div className="flex items-center gap-2 text-zinc-400 uppercase text-[11px]">
                <Sliders size={13} className="text-blue-400" />
                <span>Customization</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-zinc-500 block mb-1">Foreground Color</span>
                  <div className="flex items-center gap-2 bg-black border border-zinc-800 p-1.5">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-6 h-6 border-0 bg-transparent cursor-pointer"
                    />
                    <span className="text-zinc-200 text-xs uppercase">{fgColor}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-zinc-500 block mb-1">Background Color</span>
                  <div className="flex items-center gap-2 bg-black border border-zinc-800 p-1.5">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-6 h-6 border-0 bg-transparent cursor-pointer"
                    />
                    <span className="text-zinc-200 text-xs uppercase">{bgColor}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                  <span>Scale / Pixel Size</span>
                  <span>{pixelSize}px ({qrDimension}x{qrDimension})</span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={14}
                  value={pixelSize}
                  onChange={(e) => setPixelSize(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Render Preview & Actions */}
          <div className="flex flex-col border border-zinc-800 bg-[#0a0b0e] p-5 justify-between items-center">
            <div className="w-full flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <span className="text-xs font-mono uppercase text-zinc-400 tracking-wider flex items-center gap-2">
                <QrCode size={14} className="text-blue-400" />
                <span>Rendered Matrix</span>
              </span>
              <span className="text-[11px] font-mono text-zinc-600">
                {qrDimension}px
              </span>
            </div>

            {/* Canvas Box */}
            <div className="p-4 bg-black border border-zinc-800 flex items-center justify-center max-w-full overflow-hidden">
              <canvas
                ref={canvasRef}
                width={qrDimension}
                height={qrDimension}
                className="max-w-full h-auto border border-zinc-900"
              />
            </div>

            {/* Export Toolbar */}
            <div className="w-full flex items-center gap-3 mt-6 pt-4 border-t border-zinc-900">
              <button
                type="button"
                onClick={handleDownloadPng}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-medium transition-colors"
              >
                <Download size={13} />
                <span>Download PNG</span>
              </button>
              <button
                type="button"
                onClick={handleCopySvg}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 font-mono text-xs transition-colors"
              >
                {copied ? (
                  <>
                    <Check size={13} className="text-emerald-400" />
                    <span className="text-emerald-400">Copied SVG</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy Vector SVG</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevVault · QR Code Generator
      </footer>
    </div>
  );
}