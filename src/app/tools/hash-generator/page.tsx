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

// Standard RFC 1321 MD5 zero-dependency implementation
function md5(input: string | Uint8Array): string {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  const len = bytes.length;

  // Pre-processing: calculate padded length to be congruent to 56 mod 64 (or 14 words mod 16)
  const nWords = (((len + 8) >> 6) + 1) * 16;
  const words = new Int32Array(nWords);

  for (let i = 0; i < len; i++) {
    words[i >> 2] |= (bytes[i] & 0xff) << ((i % 4) * 8);
  }

  // Append single 1 bit (0x80)
  words[len >> 2] |= 0x80 << ((len % 4) * 8);

  // Append length in bits as 64-bit integer (little endian)
  const bitLen = len * 8;
  words[nWords - 2] = bitLen & 0xffffffff;
  words[nWords - 1] = Math.floor(bitLen / 0x100000000);

  const rotateLeft = (val: number, bits: number) => (val << bits) | (val >>> (32 - bits));

  const cmn = (q: number, a: number, b: number, x: number, s: number, t: number) => {
    return (rotateLeft((a + q + x + t) | 0, s) + b) | 0;
  };

  const ff = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) =>
    cmn((b & c) | (~b & d), a, b, x, s, t);

  const gg = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) =>
    cmn((b & d) | (c & ~d), a, b, x, s, t);

  const hh = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) =>
    cmn(b ^ c ^ d, a, b, x, s, t);

  const ii = (a: number, b: number, c: number, d: number, x: number, s: number, t: number) =>
    cmn(c ^ (b | ~d), a, b, x, s, t);

  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  for (let i = 0; i < nWords; i += 16) {
    const oldA = a;
    const oldB = b;
    const oldC = c;
    const oldD = d;

    // Round 1
    a = ff(a, b, c, d, words[i + 0], 7, 0xd76aa478);
    d = ff(d, a, b, c, words[i + 1], 12, 0xe8c7b756);
    c = ff(c, d, a, b, words[i + 2], 17, 0x242070db);
    b = ff(b, c, d, a, words[i + 3], 22, 0xc1bdceee);
    a = ff(a, b, c, d, words[i + 4], 7, 0xf57c0faf);
    d = ff(d, a, b, c, words[i + 5], 12, 0x4787c62a);
    c = ff(c, d, a, b, words[i + 6], 17, 0xa8304613);
    b = ff(b, c, d, a, words[i + 7], 22, 0xfd469501);
    a = ff(a, b, c, d, words[i + 8], 7, 0x698098d8);
    d = ff(d, a, b, c, words[i + 9], 12, 0x8b44f7af);
    c = ff(c, d, a, b, words[i + 10], 17, 0xffff5bb1);
    b = ff(b, c, d, a, words[i + 11], 22, 0x895cd7be);
    a = ff(a, b, c, d, words[i + 12], 7, 0x6b901122);
    d = ff(d, a, b, c, words[i + 13], 12, 0xfd987193);
    c = ff(c, d, a, b, words[i + 14], 17, 0xa679438e);
    b = ff(b, c, d, a, words[i + 15], 22, 0x49b40821);

    // Round 2
    a = gg(a, b, c, d, words[i + 1], 5, 0xf61e2562);
    d = gg(d, a, b, c, words[i + 6], 9, 0xc040b340);
    c = gg(c, d, a, b, words[i + 11], 14, 0x265e5a51);
    b = gg(b, c, d, a, words[i + 0], 20, 0xe9b6c7aa);
    a = gg(a, b, c, d, words[i + 5], 5, 0xd62f105d);
    d = gg(d, a, b, c, words[i + 10], 9, 0x02441453);
    c = gg(c, d, a, b, words[i + 15], 14, 0xd8a1e681);
    b = gg(b, c, d, a, words[i + 4], 20, 0xe7d3fbc8);
    a = gg(a, b, c, d, words[i + 9], 5, 0x21e1cde6);
    d = gg(d, a, b, c, words[i + 14], 9, 0xc33707d6);
    c = gg(c, d, a, b, words[i + 3], 14, 0xf4d50d87);
    b = gg(b, c, d, a, words[i + 8], 20, 0x455a14ed);
    a = gg(a, b, c, d, words[i + 13], 5, 0xa9e3e905);
    d = gg(d, a, b, c, words[i + 2], 9, 0xfcefa3f8);
    c = gg(c, d, a, b, words[i + 7], 14, 0x676f02d9);
    b = gg(b, c, d, a, words[i + 12], 20, 0x8d2a4c8a);

    // Round 3
    a = hh(a, b, c, d, words[i + 5], 4, 0xfffa3942);
    d = hh(d, a, b, c, words[i + 8], 11, 0x8771f681);
    c = hh(c, d, a, b, words[i + 11], 16, 0x6d9d6122);
    b = hh(b, c, d, a, words[i + 14], 23, 0xfde5380c);
    a = hh(a, b, c, d, words[i + 1], 4, 0xa4beea44);
    d = hh(d, a, b, c, words[i + 4], 11, 0x4bdecfa9);
    c = hh(c, d, a, b, words[i + 7], 16, 0xf6bb4b60);
    b = hh(b, c, d, a, words[i + 10], 23, 0xbebfbc70);
    a = hh(a, b, c, d, words[i + 13], 4, 0x289b7ec6);
    d = hh(d, a, b, c, words[i + 0], 11, 0xeaa127fa);
    c = hh(c, d, a, b, words[i + 3], 16, 0xd4ef3085);
    b = hh(b, c, d, a, words[i + 6], 23, 0x04881d05);
    a = hh(a, b, c, d, words[i + 9], 4, 0xd9d4d039);
    d = hh(d, a, b, c, words[i + 12], 11, 0xe6db99e5);
    c = hh(c, d, a, b, words[i + 15], 16, 0x1fa27cf8);
    b = hh(b, c, d, a, words[i + 2], 23, 0xc4ac5665);

    // Round 4
    a = ii(a, b, c, d, words[i + 0], 6, 0xf4292244);
    d = ii(d, a, b, c, words[i + 7], 10, 0x432aff97);
    c = ii(c, d, a, b, words[i + 14], 15, 0xab9423a7);
    b = ii(b, c, d, a, words[i + 5], 21, 0xfc93a039);
    a = ii(a, b, c, d, words[i + 12], 6, 0x655b59c3);
    d = ii(d, a, b, c, words[i + 3], 10, 0x8f0ccc92);
    c = ii(c, d, a, b, words[i + 10], 15, 0xffeff47d);
    b = ii(b, c, d, a, words[i + 1], 21, 0x85845dd1);
    a = ii(a, b, c, d, words[i + 8], 6, 0x6fa87e4f);
    d = ii(d, a, b, c, words[i + 15], 10, 0xfe2ce6e0);
    c = ii(c, d, a, b, words[i + 6], 15, 0xa3014314);
    b = ii(b, c, d, a, words[i + 13], 21, 0x4e0811a1);
    a = ii(a, b, c, d, words[i + 4], 6, 0xf7537e82);
    d = ii(d, a, b, c, words[i + 11], 10, 0xbd3af235);
    c = ii(c, d, a, b, words[i + 2], 15, 0x2ad7d2bb);
    b = ii(b, c, d, a, words[i + 9], 21, 0xeb86d391);

    a = (a + oldA) | 0;
    b = (b + oldB) | 0;
    c = (c + oldC) | 0;
    d = (d + oldD) | 0;
  }

  const hexVals = [a, b, c, d];
  let result = "";
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const byte = (hexVals[i] >>> (j * 8)) & 0xff;
      result += byte.toString(16).padStart(2, "0");
    }
  }

  return result;
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