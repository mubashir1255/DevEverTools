"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Globe,
  Share2,
  FileCode,
} from "lucide-react";

export default function MetaTagGeneratorPage() {
  const [title, setTitle] = useState("DevEverTools - High-Performance Developer Utilities");
  const [description, setDescription] = useState("Free browser tools for developers and designers. Pure client-side execution, no tracking.");
  const [url, setUrl] = useState("https://devevertools.dev");
  const [image, setImage] = useState("https://devevertools.dev/og-image.png");
  const [siteName, setSiteName] = useState("DevEverTools");
  const [twitterHandle, setTwitterHandle] = useState("@devevertools");
  const [themeColor, setThemeColor] = useState("#2563eb");
  const [activeTab, setActiveTab] = useState<"html" | "nextjs">("html");
  const [copied, setCopied] = useState(false);

  // Generate HTML <meta> tags
  const generateHtmlTags = (): string => {
    return `<!-- Primary Meta Tags -->
<title>${title}</title>
<meta name="title" content="${title}" />
<meta name="description" content="${description}" />
<meta name="theme-color" content="${themeColor}" />
<link rel="canonical" href="${url}" />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${url}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${image}" />
<meta property="og:site_name" content="${siteName}" />

<!-- Twitter / X -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content="${url}" />
<meta property="twitter:title" content="${title}" />
<meta property="twitter:description" content="${description}" />
<meta property="twitter:image" content="${image}" />
<meta name="twitter:creator" content="${twitterHandle}" />`;
  };

  // Generate Next.js App Router metadata object
  const generateNextJsMetadata = (): string => {
    return `import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "${title}",
  description: "${description}",
  metadataBase: new URL("${url}"),
  alternates: {
    canonical: "${url}",
  },
  themeColor: "${themeColor}",
  openGraph: {
    title: "${title}",
    description: "${description}",
    url: "${url}",
    siteName: "${siteName}",
    images: [
      {
        url: "${image}",
        width: 1200,
        height: 630,
        alt: "${title}",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "${title}",
    description: "${description}",
    creator: "${twitterHandle}",
    images: ["${image}"],
  },
};`;
  };

  const output = activeTab === "html" ? generateHtmlTags() : generateNextJsMetadata();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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
              Meta Tag & Open Graph Generator
            </h1>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            HTML & Next.js App Router
          </span>
        </header>

        {/* Main Grid: Form Inputs + Live Preview & Code */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
          {/* Inputs Section */}
          <div className="flex flex-col border border-zinc-800 bg-[#0a0b0e] p-5 space-y-4 font-mono text-xs">
            <span className="uppercase text-zinc-400 font-semibold tracking-wider text-[11px] flex items-center gap-2">
              <Globe size={13} className="text-blue-400" />
              <span>Metadata Properties</span>
            </span>

            <div>
              <span className="text-[10px] text-zinc-500 uppercase block mb-1">Page Title</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-black border border-zinc-800 p-2 text-xs text-zinc-200 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <span className="text-[10px] text-zinc-500 uppercase block mb-1">Meta Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-black border border-zinc-800 p-2 text-xs text-zinc-200 outline-none focus:border-blue-600 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block mb-1">Canonical URL</span>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-black border border-zinc-800 p-2 text-xs text-zinc-200 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 uppercase block mb-1">OG Image URL</span>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full bg-black border border-zinc-800 p-2 text-xs text-zinc-200 outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block mb-1">Site Name</span>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full bg-black border border-zinc-800 p-2 text-xs text-zinc-200 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 uppercase block mb-1">Twitter / X</span>
                <input
                  type="text"
                  value={twitterHandle}
                  onChange={(e) => setTwitterHandle(e.target.value)}
                  className="w-full bg-black border border-zinc-800 p-2 text-xs text-zinc-200 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 uppercase block mb-1">Theme Color</span>
                <div className="flex items-center gap-2 bg-black border border-zinc-800 p-1">
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-6 h-6 border-0 bg-transparent cursor-pointer"
                  />
                  <span className="text-zinc-200 text-xs">{themeColor}</span>
                </div>
              </div>
            </div>

            {/* Social Card Mock Preview */}
            <div className="pt-3 border-t border-zinc-900">
              <span className="text-[10px] text-zinc-500 uppercase block mb-2 flex items-center gap-1.5">
                <Share2 size={12} className="text-blue-400" />
                <span>Card Preview</span>
              </span>

              <div className="border border-zinc-800 bg-black overflow-hidden font-sans">
                <div className="h-28 bg-zinc-900 border-b border-zinc-800 flex items-center justify-center text-zinc-600 text-xs font-mono">
                  {image ? (
                    <span className="truncate px-4">{image}</span>
                  ) : (
                    "1200 x 630 Preview Image"
                  )}
                </div>
                <div className="p-3">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-mono">
                    {siteName || "example.com"}
                  </span>
                  <h4 className="text-xs font-bold text-zinc-100 truncate mt-0.5">
                    {title || "Page Title"}
                  </h4>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">
                    {description || "Meta description will appear here."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Code Output Panel */}
          <div className="flex flex-col border border-zinc-800 bg-[#0a0b0e]">
            {/* Tab switch header */}
            <div className="flex items-center justify-between border-b border-zinc-800 p-2.5 bg-black/40">
              <div className="flex border border-zinc-800 bg-black font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("html")}
                  className={`px-3 py-1.5 transition-colors ${
                    activeTab === "html"
                      ? "bg-blue-600 text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  HTML Tags
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("nextjs")}
                  className={`px-3 py-1.5 transition-colors ${
                    activeTab === "nextjs"
                      ? "bg-blue-600 text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Next.js Metadata
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 text-xs font-mono transition-colors"
              >
                {copied ? (
                  <>
                    <Check size={13} className="text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              readOnly
              value={output}
              spellCheck={false}
              className="w-full flex-1 bg-transparent p-4 text-xs font-mono text-zinc-200 outline-none resize-none min-h-[460px]"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevEverTools · Meta Tag & Open Graph Generator
      </footer>
    </div>
  );
}