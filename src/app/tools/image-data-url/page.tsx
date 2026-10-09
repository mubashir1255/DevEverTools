"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Trash2,
  Upload,
} from "lucide-react";

export default function ImageDataUrlPage() {
  const [dataUrl, setDataUrl] = useState<string>("");
  const [fileDetails, setFileDetails] = useState<{
    name: string;
    size: number;
    type: string;
    width: number;
    height: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"dataurl" | "html" | "css" | "raw">("dataurl");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setDataUrl(result);

      // Measure dimensions
      const img = new Image();
      img.onload = () => {
        setFileDetails({
          name: file.name,
          size: file.size,
          type: file.type,
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    setDataUrl("");
    setFileDetails(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const rawBase64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : "";
  const htmlSnippet = `<img src="${dataUrl}" alt="${fileDetails?.name || "image"}" />`;
  const cssSnippet = `background-image: url("${dataUrl}");`;

  const getOutput = () => {
    if (activeTab === "dataurl") return dataUrl;
    if (activeTab === "html") return htmlSnippet;
    if (activeTab === "css") return cssSnippet;
    return rawBase64;
  };

  const handleCopy = async (text: string, keyName: string) => {
    if (!text) return;
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
              Image to Data URL & Base64
            </h1>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Client-Side Asset Inliner
          </span>
        </header>

        {/* Upload & Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed border-zinc-800 hover:border-blue-600 bg-[#0a0b0e] p-8 mb-6 flex flex-col items-center justify-center cursor-pointer transition-colors text-center"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) processFile(e.target.files[0]);
            }}
          />
          <Upload size={24} className="text-zinc-500 mb-2" />
          <p className="text-xs font-mono text-zinc-300">
            Click to upload or drag and drop an image
          </p>
          <p className="text-[10px] text-zinc-600 font-mono mt-1">
            PNG, JPEG, WebP, SVG, GIF, ICO (Max ~5MB recommended)
          </p>
        </div>

        {/* Image Metadata & Preview Section */}
        {dataUrl && fileDetails && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs mb-6">
            <div className="bg-[#0a0b0e] border border-zinc-800 p-4 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={dataUrl}
                alt={fileDetails.name}
                className="max-h-24 max-w-full object-contain border border-zinc-900"
              />
            </div>

            <div className="bg-[#0a0b0e] border border-zinc-800 p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block mb-1">File Info</span>
                <span className="text-zinc-200 font-semibold truncate block">{fileDetails.name}</span>
                <span className="text-zinc-500 text-[11px] block">{fileDetails.type}</span>
              </div>
              <span className="text-blue-400 font-bold mt-2">
                {fileDetails.width} × {fileDetails.height} px
              </span>
            </div>

            <div className="bg-[#0a0b0e] border border-zinc-800 p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block mb-1">Payload Size</span>
                <div className="text-zinc-200">
                  Original: <strong className="text-white">{(fileDetails.size / 1024).toFixed(1)} KB</strong>
                </div>
                <div className="text-zinc-200">
                  Base64: <strong className="text-amber-400">{(rawBase64.length / 1024).toFixed(1)} KB</strong>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 mt-2 self-start"
              >
                <Trash2 size={12} />
                <span>Remove</span>
              </button>
            </div>
          </div>
        )}

        {/* Code Output Panel */}
        <div className="border border-zinc-800 bg-[#0a0b0e] flex flex-col flex-1">
          <div className="flex flex-wrap items-center justify-between border-b border-zinc-800 p-2.5 bg-black/40 gap-3">
            <div className="flex border border-zinc-800 bg-black font-mono text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("dataurl")}
                className={`px-3 py-1.5 transition-colors ${
                  activeTab === "dataurl"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Data URI
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("html")}
                className={`px-3 py-1.5 transition-colors ${
                  activeTab === "html"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                HTML &lt;img&gt;
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("css")}
                className={`px-3 py-1.5 transition-colors ${
                  activeTab === "css"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                CSS background
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("raw")}
                className={`px-3 py-1.5 transition-colors ${
                  activeTab === "raw"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Raw Base64
              </button>
            </div>

            <button
              type="button"
              disabled={!dataUrl}
              onClick={() => handleCopy(getOutput(), activeTab)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 text-xs font-mono transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              {copiedKey === activeTab ? (
                <>
                  <Check size={13} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy Snippet</span>
                </>
              )}
            </button>
          </div>

          <textarea
            readOnly
            value={getOutput()}
            placeholder="Upload an image above to generate Data URI and Base64 embed code..."
            spellCheck={false}
            className="w-full flex-1 bg-transparent p-4 text-xs font-mono text-zinc-200 outline-none resize-none min-h-[300px]"
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevEverTools · Image to Data URL Converter
      </footer>
    </div>
  );
}