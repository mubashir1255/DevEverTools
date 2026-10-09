"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Trash2,
  Upload,
} from "lucide-react";

// Minimal zero-dependency MD5 implementation
function md5(input: string | Uint8Array): string {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  const k = [
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
  ];
  const s = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];

  const n = bytes.length;
  const bitLen = n * 8;
  const paddedLen = (((n + 8) >>> 6) + 1) * 64;
  const padded = new Uint8Array(paddedLen);
  padded.set(bytes);
  padded[n] = 0x80;

  for (let i = 0; i < 8; i++) {
    padded[paddedLen - 8 + i] = (bitLen >>> (i * 8)) & 0xff;
  }

  let [a0, b0, c0, d0] = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476];

  for (let offset = 0; offset < paddedLen; offset += 64) {
    const chunk = new Uint32Array(16);
    for (let i = 0; i < 16; i++) {
      chunk[i] =
        padded[offset + i * 4] |
        (padded[offset + i * 4 + 1] << 8) |
        (padded[offset + i * 4 + 2] << 16) |
        (padded[offset + i * 4 + 3] << 24);
    }

    let [a, b, c, d] = [a0, b0, c0, d0];

    for (let i = 0; i < 64; i++) {
      let f = 0;
      let g = 0;
      if (i < 16) {
        f = (b & c) | (~b & d);
        g = i;
      } else if (i < 32) {
        f = (d & b) | (~d & c);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * i) % 16;
      }

      const temp = d;
      d = c;
      c = b;
      const sum = (a + f + k[i] + chunk[g]) | 0;
      b = (b + ((sum << s[i]) | (sum >>> (32 - s[i])))) | 0;
      a = temp;
    }

    a0 = (a0 + a) | 0;
    b0 = (b0 + b) | 0;
    c0 = (c0 + c) | 0;
    d0 = (d0 + d) | 0;
  }

  const out = new Uint8Array(16);
  for (let i = 0; i < 4; i++) {
    out[i] = (a0 >>> (i * 8)) & 0xff;
    out[4 + i] = (b0 >>> (i * 8)) & 0xff;
    out[8 + i] = (c0 >>> (i * 8)) & 0xff;
    out[12 + i] = (d0 >>> (i * 8)) & 0xff;
  }

  return Array.from(out, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function subtleHash(algo: string, data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest(algo, data as unknown as ArrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

type HashResults = {
  md5: string;
  sha1: string;
  sha256: string;
  sha384: string;
  sha512: string;
};

export default function HashGeneratorPage() {
  const [input, setInput] = useState("");
  const [uppercase, setUppercase] = useState(false);
  const [hashes, setHashes] = useState<HashResults | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const computeHashes = async (data: Uint8Array) => {
    if (data.length === 0) {
      setHashes(null);
      return;
    }

    try {
      const [md5Hash, sha1Hash, sha256Hash, sha384Hash, sha512Hash] = await Promise.all([
        Promise.resolve(md5(data)),
        subtleHash("SHA-1", data),
        subtleHash("SHA-256", data),
        subtleHash("SHA-384", data),
        subtleHash("SHA-512", data),
      ]);

      setHashes({
        md5: md5Hash,
        sha1: sha1Hash,
        sha256: sha256Hash,
        sha384: sha384Hash,
        sha512: sha512Hash,
      });
    } catch {
      setHashes(null);
    }
  };

  const handleTextChange = (text: string) => {
    setInput(text);
    startTransition(() => {
      const encoded = new TextEncoder().encode(text);
      computeHashes(encoded);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setInput(`[File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]`);
    const reader = new FileReader();
    reader.onload = () => {
      const buffer = reader.result as ArrayBuffer;
      computeHashes(new Uint8Array(buffer));
    };
    reader.readAsArrayBuffer(file);
  };

  const handleCopy = async (val: string, key: string) => {
    const text = uppercase ? val.toUpperCase() : val.toLowerCase();
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleClear = () => {
    setInput("");
    setHashes(null);
  };

  const formatHash = (str: string) => (uppercase ? str.toUpperCase() : str.toLowerCase());

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
              Hash Generator
            </h1>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Native Web Crypto API · In-Memory
          </span>
        </header>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a0b0e] border border-zinc-800 p-2.5 mb-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="accent-blue-600"
              />
              <span>Uppercase Hex</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <label className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs flex items-center gap-1.5 cursor-pointer transition-colors">
              <Upload size={13} />
              <span>File Checksum</span>
              <input type="file" className="hidden" onChange={handleFileUpload} />
            </label>
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 bg-zinc-900 border border-zinc-800 hover:bg-red-950/40 hover:border-red-800 hover:text-red-400 text-zinc-400 text-xs transition-colors"
              title="Clear"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Input Panel */}
        <div className="border border-zinc-800 bg-[#0a0b0e] mb-6">
          <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400 bg-black/40">
            <span className="font-mono uppercase text-[11px] tracking-wider">
              Input String / Text
            </span>
            <span className="text-[11px] font-mono text-zinc-600">
              {input.length} characters
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Type or paste text to compute hashes in real time..."
            spellCheck={false}
            className="w-full bg-transparent p-4 text-xs font-mono text-zinc-200 outline-none resize-none h-[120px]"
          />
        </div>

        {/* Hash Results Grid */}
        <div className="border border-zinc-800 bg-[#0a0b0e] flex flex-col flex-1">
          <div className="border-b border-zinc-800 px-4 py-2.5 bg-black/40 text-xs font-mono text-zinc-400 uppercase tracking-wider text-[11px]">
            Computed Checksums
          </div>

          {hashes ? (
            <div className="divide-y divide-zinc-900">
              {[
                { label: "MD5", value: hashes.md5, key: "md5" },
                { label: "SHA-1", value: hashes.sha1, key: "sha1" },
                { label: "SHA-256", value: hashes.sha256, key: "sha256" },
                { label: "SHA-384", value: hashes.sha384, key: "sha384" },
                { label: "SHA-512", value: hashes.sha512, key: "sha512" },
              ].map(({ label, value, key }) => (
                <div
                  key={key}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 hover:bg-[#0e1015] gap-2 transition-colors font-mono text-xs"
                >
                  <span className="text-blue-400 font-semibold min-w-[90px] text-[11px]">
                    {label}
                  </span>
                  <span className="text-zinc-300 break-all flex-1 select-all text-xs">
                    {formatHash(value)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(value, key)}
                    className="flex items-center justify-center gap-1 px-2.5 py-1 text-[11px] text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 shrink-0 self-start sm:self-auto transition-colors"
                  >
                    {copiedKey === key ? (
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
              ))}
            </div>
          ) : (
            <div className="text-xs text-zinc-600 font-mono py-12 text-center border border-dashed border-zinc-900 m-4">
              Enter text above or upload a file to calculate cryptographic hashes.
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevVault · Hash Generator
      </footer>
    </div>
  );
}