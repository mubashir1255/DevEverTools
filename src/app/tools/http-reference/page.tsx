"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Search,
} from "lucide-react";

type StatusCode = {
  code: number;
  phrase: string;
  category: "1xx" | "2xx" | "3xx" | "4xx" | "5xx";
  description: string;
  cacheable: boolean;
};

type HeaderItem = {
  name: string;
  type: "Request" | "Response" | "Security";
  desc: string;
  example: string;
};

const STATUS_CODES: StatusCode[] = [
  { code: 200, phrase: "OK", category: "2xx", description: "Standard successful response for GET, PUT, or POST requests.", cacheable: true },
  { code: 201, phrase: "Created", category: "2xx", description: "Request succeeded and led to the creation of a new resource (usually POST).", cacheable: false },
  { code: 204, phrase: "No Content", category: "2xx", description: "Request succeeded, but client does not need to navigate away (common in DELETE).", cacheable: false },
  { code: 301, phrase: "Moved Permanently", category: "3xx", description: "Target resource has been assigned a new permanent URI. Clients update bookmarks.", cacheable: true },
  { code: 302, phrase: "Found", category: "3xx", description: "Target resource temporarily resides under a different URI. Common for auth redirects.", cacheable: false },
  { code: 304, phrase: "Not Modified", category: "3xx", description: "Client can use cached version; conditional headers (If-None-Match) matched.", cacheable: true },
  { code: 307, phrase: "Temporary Redirect", category: "3xx", description: "Temporary redirect maintaining the original HTTP method used in the request.", cacheable: false },
  { code: 308, phrase: "Permanent Redirect", category: "3xx", description: "Permanent redirect maintaining the original HTTP method (unlike 301).", cacheable: true },
  { code: 400, phrase: "Bad Request", category: "4xx", description: "Malformed syntax, invalid request framing, or deceptive request routing.", cacheable: false },
  { code: 401, phrase: "Unauthorized", category: "4xx", description: "Authentication is required and has failed or has not yet been provided.", cacheable: false },
  { code: 403, phrase: "Forbidden", category: "4xx", description: "Server understood the request, but refuses to authorize it (lacks permissions).", cacheable: false },
  { code: 404, phrase: "Not Found", category: "4xx", description: "The server cannot find the requested resource or URI endpoint.", cacheable: false },
  { code: 405, phrase: "Method Not Allowed", category: "4xx", description: "The request method is known by server but not supported by target resource.", cacheable: false },
  { code: 409, phrase: "Conflict", category: "4xx", description: "Request conflicts with current state of target resource (e.g. duplicate key).", cacheable: false },
  { code: 422, phrase: "Unprocessable Entity", category: "4xx", description: "Semantic validation errors occurred in the payload (common in REST APIs).", cacheable: false },
  { code: 429, phrase: "Too Many Requests", category: "4xx", description: "Rate limit exceeded. Client has sent too many requests in a given time.", cacheable: false },
  { code: 500, phrase: "Internal Server Error", category: "5xx", description: "Generic catch-all error when an unexpected condition occurred on the server.", cacheable: false },
  { code: 502, phrase: "Bad Gateway", category: "5xx", description: "Gateway/proxy received an invalid response from upstream server (e.g. Nginx to Node).", cacheable: false },
  { code: 503, phrase: "Service Unavailable", category: "5xx", description: "Server is currently unavailable due to overload or maintenance downtime.", cacheable: false },
  { code: 504, phrase: "Gateway Timeout", category: "5xx", description: "Gateway/proxy did not receive a timely response from the upstream server.", cacheable: false },
];

const HEADERS: HeaderItem[] = [
  { name: "Authorization", type: "Request", desc: "Contains credentials to authenticate a user agent with a server.", example: "Bearer eyJhbGciOi..." },
  { name: "Content-Type", type: "Request", desc: "Indicates the original media type of the resource before any encoding.", example: "application/json" },
  { name: "Cache-Control", type: "Response", desc: "Directives for caching mechanisms in requests and responses.", example: "public, max-age=31536000, immutable" },
  { name: "ETag", type: "Response", desc: "Identifier for a specific version of a resource; used for cache validation.", example: 'W/"33a64df551425fcc3e"' },
  { name: "Content-Security-Policy", type: "Security", desc: "Restricts resource loading (scripts, images) to mitigate XSS attacks.", example: "default-src 'self'; script-src 'self'" },
  { name: "Strict-Transport-Security", type: "Security", desc: "Informs browsers that site must only be accessed using HTTPS.", example: "max-age=63072000; includeSubDomains; preload" },
  { name: "X-Frame-Options", type: "Security", desc: "Indicates whether a browser can render a page in an iframe (clickjacking defense).", example: "DENY" },
];

export default function HttpReferencePage() {
  const [view, setView] = useState<"status" | "headers">("status");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const filteredStatuses = useMemo(() => {
    const q = search.trim().toLowerCase();
    return STATUS_CODES.filter((s) => {
      const matchesSearch =
        s.code.toString().includes(q) ||
        s.phrase.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q);
      const matchesCategory =
        categoryFilter === "All" || s.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [search, categoryFilter]);

  const filteredHeaders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return HEADERS.filter((h) => {
      return (
        h.name.toLowerCase().includes(q) ||
        h.desc.toLowerCase().includes(q) ||
        h.type.toLowerCase().includes(q)
      );
    });
  }, [search]);

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
              HTTP Status Codes & Headers Reference
            </h1>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            RFC 9110 Specs
          </span>
        </header>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a0b0e] border border-zinc-800 p-3 mb-6">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* View Switch */}
            <div className="flex border border-zinc-800 bg-black font-mono text-xs">
              <button
                type="button"
                onClick={() => setView("status")}
                className={`px-3 py-1.5 transition-colors ${
                  view === "status"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Status Codes
              </button>
              <button
                type="button"
                onClick={() => setView("headers")}
                className={`px-3 py-1.5 transition-colors ${
                  view === "headers"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                HTTP Headers
              </button>
            </div>

            {/* Status Code Filter Chips */}
            {view === "status" && (
              <div className="flex gap-1 font-mono text-xs overflow-x-auto">
                {["All", "2xx", "3xx", "4xx", "5xx"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 text-[11px] border transition-colors ${
                      categoryFilter === cat
                        ? "bg-zinc-800 border-zinc-700 text-white font-bold"
                        : "bg-black border-zinc-900 text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2 border border-zinc-800 bg-black px-2.5 py-1.5 w-full sm:w-64">
            <Search size={14} className="text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${view === "status" ? "status codes" : "headers"}...`}
              className="bg-transparent text-xs text-zinc-200 outline-none w-full font-mono"
            />
          </div>
        </div>

        {/* Content Viewer */}
        <div className="border border-zinc-800 bg-[#0a0b0e] flex flex-col flex-1 overflow-hidden">
          {view === "status" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 text-zinc-500 text-[11px] bg-black/20">
                    <th className="p-3 w-24">Code</th>
                    <th className="p-3 w-48">Phrase</th>
                    <th className="p-3">RFC Meaning & Description</th>
                    <th className="p-3 w-28 text-center">Cacheable</th>
                    <th className="p-3 w-16 text-right">Copy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {filteredStatuses.map((s) => {
                    const color =
                      s.category === "2xx"
                        ? "text-emerald-400"
                        : s.category === "3xx"
                        ? "text-cyan-400"
                        : s.category === "4xx"
                        ? "text-amber-400"
                        : "text-red-400";

                    return (
                      <tr key={s.code} className="hover:bg-white/5 transition-colors">
                        <td className={`p-3 font-bold text-sm ${color}`}>{s.code}</td>
                        <td className="p-3 font-semibold text-zinc-100">{s.phrase}</td>
                        <td className="p-3 text-zinc-400 font-sans text-xs">{s.description}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-1.5 py-0.5 text-[10px] border ${
                              s.cacheable
                                ? "border-emerald-800/80 bg-emerald-950/20 text-emerald-400"
                                : "border-zinc-800 bg-black text-zinc-600"
                            }`}
                          >
                            {s.cacheable ? "YES" : "NO"}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleCopy(`${s.code} ${s.phrase}`, `status-${s.code}`)}
                            className="text-zinc-500 hover:text-white"
                          >
                            {copiedKey === `status-${s.code}` ? (
                              <Check size={13} className="text-emerald-400 inline" />
                            ) : (
                              <Copy size={13} className="inline" />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 text-zinc-500 text-[11px] bg-black/20">
                    <th className="p-3 w-56">Header</th>
                    <th className="p-3 w-28">Type</th>
                    <th className="p-3">Purpose</th>
                    <th className="p-3 w-72">Example Value</th>
                    <th className="p-3 w-16 text-right">Copy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {filteredHeaders.map((h) => (
                    <tr key={h.name} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-bold text-blue-400">{h.name}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 text-[10px] border ${
                            h.type === "Security"
                              ? "border-emerald-800/80 bg-emerald-950/20 text-emerald-400"
                              : "border-zinc-800 bg-black text-zinc-400"
                          }`}
                        >
                          {h.type}
                        </span>
                      </td>
                      <td className="p-3 text-zinc-300 font-sans text-xs">{h.desc}</td>
                      <td className="p-3 text-zinc-500 text-[11px] select-all truncate max-w-xs">{h.example}</td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleCopy(`${h.name}: ${h.example}`, `hdr-${h.name}`)}
                          className="text-zinc-500 hover:text-white"
                        >
                          {copiedKey === `hdr-${h.name}` ? (
                            <Check size={13} className="text-emerald-400 inline" />
                          ) : (
                            <Copy size={13} className="inline" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevEverTools · HTTP Reference
      </footer>
    </div>
  );
}