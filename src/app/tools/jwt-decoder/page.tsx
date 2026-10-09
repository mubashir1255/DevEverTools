"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Trash2,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

// Sample JWT token for testing
const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkRldlZhdWx0IERldmVsb3BlciIsImlhdCI6MTc3MjQ1MDAwMCwiZXhwIjoxODAzOTg2MDAwLCJyb2xlIjoiYWRtaW4ifQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

function base64UrlDecode(str: string): string {
  let output = str.replace(/-/g, "+").replace(/_/g, "/");
  while (output.length % 4) {
    output += "=";
  }
  const binary = window.atob(output);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export default function JwtDecoderPage() {
  const [token, setToken] = useState("");
  const [headerJson, setHeaderJson] = useState("");
  const [payloadJson, setPayloadJson] = useState("");
  const [signature, setSignature] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [expDate, setExpDate] = useState<Date | null>(null);
  const [iatDate, setIatDate] = useState<Date | null>(null);
  const [isExpired, setIsExpired] = useState<boolean | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const decodeJwt = (jwtString: string) => {
    const raw = jwtString.trim();
    if (!raw) {
      setHeaderJson("");
      setPayloadJson("");
      setSignature("");
      setError(null);
      setExpDate(null);
      setIatDate(null);
      setIsExpired(null);
      return;
    }

    const parts = raw.split(".");
    if (parts.length !== 3) {
      setError("Invalid JWT structure: A valid JWT must have 3 dot-separated parts (header.payload.signature).");
      setHeaderJson("");
      setPayloadJson("");
      setSignature("");
      setIsExpired(null);
      return;
    }

    try {
      // Decode Header
      const decodedHeader = JSON.parse(base64UrlDecode(parts[0]));
      setHeaderJson(JSON.stringify(decodedHeader, null, 2));

      // Decode Payload
      const decodedPayload = JSON.parse(base64UrlDecode(parts[1]));
      setPayloadJson(JSON.stringify(decodedPayload, null, 2));

      // Signature part
      setSignature(parts[2]);
      setError(null);

      // Check standard timestamps
      if (typeof decodedPayload.exp === "number") {
        const expiration = new Date(decodedPayload.exp * 1000);
        setExpDate(expiration);
        setIsExpired(expiration.getTime() < Date.now());
      } else {
        setExpDate(null);
        setIsExpired(null);
      }

      if (typeof decodedPayload.iat === "number") {
        setIatDate(new Date(decodedPayload.iat * 1000));
      } else {
        setIatDate(null);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Failed to decode payload: ${err.message}`);
      } else {
        setError("Invalid token encoding");
      }
      setHeaderJson("");
      setPayloadJson("");
      setSignature("");
      setIsExpired(null);
    }
  };

  const handleInputChange = (val: string) => {
    setToken(val);
    decodeJwt(val);
  };

  const handleLoadSample = () => {
    setToken(SAMPLE_JWT);
    decodeJwt(SAMPLE_JWT);
  };

  const handleCopy = async (text: string, section: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 1500);
  };

  const handleClear = () => {
    setToken("");
    setHeaderJson("");
    setPayloadJson("");
    setSignature("");
    setError(null);
    setExpDate(null);
    setIatDate(null);
    setIsExpired(null);
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
              JWT Decoder
            </h1>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Client-Side Only · Never Leaves Browser
          </span>
        </header>

        {/* Security Warning Callout */}
        <div className="bg-[#0e0c06] border border-amber-900/60 text-amber-300/90 px-4 py-2.5 text-xs font-mono mb-4 flex items-center gap-3">
          <ShieldAlert size={16} className="text-amber-400 shrink-0" />
          <span>
            <strong>Security Notice:</strong> Decoding checks payload readability only. It does <em>not</em> verify secret or public key cryptographic signatures.
          </span>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between bg-[#0a0b0e] border border-zinc-800 p-2.5 mb-4">
          <span className="text-xs text-zinc-400 font-mono uppercase text-[11px] tracking-wider pl-1">
            Raw Encoded Token
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSample}
              className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs transition-colors"
            >
              Load Sample
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-1 bg-zinc-900 border border-zinc-800 hover:bg-red-950/40 hover:border-red-800 hover:text-red-400 text-zinc-400 transition-colors"
              title="Clear"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Input Textarea */}
        <div className="border border-zinc-800 bg-[#0a0b0e] mb-4">
          <textarea
            value={token}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Paste JWT here (header.payload.signature)..."
            spellCheck={false}
            className="w-full bg-transparent p-3 text-xs font-mono text-zinc-200 outline-none resize-none h-[110px]"
          />
        </div>

        {/* Error notification */}
        {error && (
          <div className="bg-red-950/20 border border-red-800/80 text-red-400 px-3.5 py-2 text-xs font-mono mb-4">
            {error}
          </div>
        )}

        {/* Claim Status Bar */}
        {(expDate || iatDate) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {expDate && (
              <div className="flex items-center justify-between bg-[#0a0b0e] border border-zinc-800 px-4 py-2.5 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-zinc-500" />
                  <span className="text-zinc-400">Expires:</span>
                  <span className="text-zinc-200">
                    {expDate.toUTCString()}
                  </span>
                </div>
                {isExpired ? (
                  <span className="flex items-center gap-1 text-[11px] text-red-400 border border-red-800/60 bg-red-950/30 px-2 py-0.5">
                    <XCircle size={12} /> Expired
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 border border-emerald-800/60 bg-emerald-950/30 px-2 py-0.5">
                    <CheckCircle2 size={12} /> Active
                  </span>
                )}
              </div>
            )}

            {iatDate && (
              <div className="flex items-center justify-between bg-[#0a0b0e] border border-zinc-800 px-4 py-2.5 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-zinc-500" />
                  <span className="text-zinc-400">Issued at:</span>
                  <span className="text-zinc-200">
                    {iatDate.toUTCString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Decoded Dual Pane (Header & Payload) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 mb-4">
          {/* Header Panel */}
          <div className="flex flex-col border border-zinc-800 bg-[#0a0b0e]">
            <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400 bg-black/40">
              <span className="font-mono text-red-400 font-semibold text-[11px] uppercase tracking-wider">
                Header (Algorithm & Type)
              </span>
              <button
                type="button"
                onClick={() => handleCopy(headerJson, "header")}
                disabled={!headerJson}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                {copiedSection === "header" ? (
                  <>
                    <Check size={12} className="text-emerald-400" />
                    <span className="text-emerald-400 font-mono text-[11px]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span className="font-mono text-[11px]">Copy</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              readOnly
              value={headerJson}
              placeholder="Header claims will appear here..."
              spellCheck={false}
              className="w-full flex-1 bg-transparent p-4 text-xs font-mono text-red-300/90 resize-none outline-none min-h-[260px]"
            />
          </div>

          {/* Payload Panel */}
          <div className="flex flex-col border border-zinc-800 bg-[#0a0b0e]">
            <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400 bg-black/40">
              <span className="font-mono text-purple-400 font-semibold text-[11px] uppercase tracking-wider">
                Payload (Claims & Data)
              </span>
              <button
                type="button"
                onClick={() => handleCopy(payloadJson, "payload")}
                disabled={!payloadJson}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                {copiedSection === "payload" ? (
                  <>
                    <Check size={12} className="text-emerald-400" />
                    <span className="text-emerald-400 font-mono text-[11px]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span className="font-mono text-[11px]">Copy</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              readOnly
              value={payloadJson}
              placeholder="Payload claims will appear here..."
              spellCheck={false}
              className="w-full flex-1 bg-transparent p-4 text-xs font-mono text-purple-300/90 resize-none outline-none min-h-[260px]"
            />
          </div>
        </div>

        {/* Signature View */}
        {signature && (
          <div className="border border-zinc-800 bg-[#0a0b0e] p-3 text-xs font-mono flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 truncate">
              <span className="text-cyan-400 font-semibold uppercase text-[11px] tracking-wider shrink-0">
                Signature:
              </span>
              <span className="text-cyan-300/70 truncate select-all">
                {signature}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(signature, "sig")}
              className="text-[11px] text-zinc-500 hover:text-zinc-200 px-2 py-1 bg-zinc-900 border border-zinc-800 shrink-0"
            >
              {copiedSection === "sig" ? "Copied" : "Copy"}
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevVault · JWT Decoder
      </footer>
    </div>
  );
}