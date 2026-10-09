"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Laptop,
  Monitor,
  RefreshCw,
  Search,
  Smartphone,
  Trash2,
} from "lucide-react";

type UAPreset = {
  label: string;
  ua: string;
};

const PRESETS: UAPreset[] = [
  {
    label: "Chrome (Win 11)",
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  },
  {
    label: "Safari (macOS)",
    ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
  },
  {
    label: "Firefox (Linux)",
    ua: "Mozilla/5.0 (X11; Linux x86_64; rv:132.0) Gecko/20100101 Firefox/132.0",
  },
  {
    label: "iPhone (iOS Safari)",
    ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  },
  {
    label: "Android (Chrome)",
    ua: "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.102 Mobile Safari/537.36",
  },
  {
    label: "Googlebot",
    ua: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  },
];

type ParsedUA = {
  browser: { name: string; version: string; engine: string };
  os: { name: string; version: string; platform: string };
  device: { type: "Desktop" | "Mobile" | "Tablet" | "Bot"; vendor: string; model: string };
};

function parseUserAgentString(ua: string): ParsedUA {
  let deviceType: "Desktop" | "Mobile" | "Tablet" | "Bot" = "Desktop";
  if (/bot|crawler|spider|crawling/i.test(ua)) {
    deviceType = "Bot";
  } else if (/tablet|ipad|playbook|silk/i.test(ua)) {
    deviceType = "Tablet";
  } else if (/mobi|iphone|android|touch/i.test(ua)) {
    deviceType = "Mobile";
  }

  let engine = "Unknown";
  if (/Gecko\//.test(ua) && !/like Gecko/i.test(ua)) engine = "Gecko (Firefox)";
  else if (/AppleWebKit/i.test(ua)) {
    engine = /Chrome/i.test(ua) || /Chromium/i.test(ua) ? "Blink (Chromium)" : "WebKit (Apple)";
  } else if (/Trident|MSIE/i.test(ua)) {
    engine = "Trident (IE)";
  }

  let browserName = "Unknown Browser";
  let browserVer = "Unknown";

  if (/Edg\/([\d.]+)/.test(ua)) {
    browserName = "Microsoft Edge";
    browserVer = ua.match(/Edg\/([\d.]+)/)?.[1] || "Unknown";
  } else if (/OPR\/([\d.]+)/.test(ua) || /Opera\/([\d.]+)/.test(ua)) {
    browserName = "Opera";
    browserVer = ua.match(/(?:OPR|Opera)\/([\d.]+)/)?.[1] || "Unknown";
  } else if (/Chrome\/([\d.]+)/.test(ua)) {
    browserName = "Google Chrome";
    browserVer = ua.match(/Chrome\/([\d.]+)/)?.[1] || "Unknown";
  } else if (/Firefox\/([\d.]+)/.test(ua)) {
    browserName = "Mozilla Firefox";
    browserVer = ua.match(/Firefox\/([\d.]+)/)?.[1] || "Unknown";
  } else if (/Version\/([\d.]+).*Safari/.test(ua)) {
    browserName = "Apple Safari";
    browserVer = ua.match(/Version\/([\d.]+)/)?.[1] || "Unknown";
  } else if (/Googlebot\/([\d.]+)/.test(ua)) {
    browserName = "Googlebot";
    browserVer = ua.match(/Googlebot\/([\d.]+)/)?.[1] || "Unknown";
  }

  let osName = "Unknown OS";
  let osVer = "";
  let platform = "x86_64";

  if (/Windows NT 10.0/.test(ua)) {
    osName = "Windows";
    osVer = "10 / 11";
  } else if (/Windows NT 6.3/.test(ua)) {
    osName = "Windows";
    osVer = "8.1";
  } else if (/Windows NT 6.1/.test(ua)) {
    osName = "Windows";
    osVer = "7";
  } else if (/Android ([\d.]+)/.test(ua)) {
    osName = "Android";
    osVer = ua.match(/Android ([\d.]+)/)?.[1] || "";
  } else if (/iPhone OS ([\d_]+)/.test(ua)) {
    osName = "iOS";
    osVer = (ua.match(/iPhone OS ([\d_]+)/)?.[1] || "").replace(/_/g, ".");
  } else if (/Mac OS X ([\d_]+)/.test(ua)) {
    osName = "macOS";
    osVer = (ua.match(/Mac OS X ([\d_]+)/)?.[1] || "").replace(/_/g, ".");
  } else if (/Linux/.test(ua)) {
    osName = "Linux";
  }

  if (/arm64|aarch64/i.test(ua)) platform = "ARM64";
  else if (/x86_64|win64|wow64/i.test(ua)) platform = "x86_64";
  else if (/armv|iphone|ipad/i.test(ua)) platform = "ARM";

  let vendor = "Generic";
  let model = "Device";

  if (/iPhone/.test(ua)) {
    vendor = "Apple";
    model = "iPhone";
  } else if (/iPad/.test(ua)) {
    vendor = "Apple";
    model = "iPad";
  } else if (/Macintosh/.test(ua)) {
    vendor = "Apple";
    model = "Mac";
  } else if (/Pixel ([\w\s]+)/.test(ua)) {
    vendor = "Google";
    model = `Pixel ${ua.match(/Pixel ([\w\s]+)/)?.[1] || ""}`.trim();
  } else if (/Windows/.test(ua)) {
    vendor = "PC";
    model = "Windows PC";
  }

  return {
    browser: { name: browserName, version: browserVer, engine },
    os: { name: osName, version: osVer, platform },
    device: { type: deviceType, vendor, model },
  };
}

export default function UserAgentParserPage() {
  const [uaInput, setUaInput] = useState<string>(() =>
    typeof window !== "undefined" ? navigator.userAgent : ""
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [clientHints] = useState<{
    cores?: number;
    screen?: string;
    language?: string;
  }>(() => {
    if (typeof window === "undefined") return {};
    return {
      cores: navigator.hardwareConcurrency,
      screen: `${window.screen.width} x ${window.screen.height} (${window.screen.colorDepth}-bit)`,
      language: navigator.language,
    };
  });

  const parsed = useMemo(() => parseUserAgentString(uaInput), [uaInput]);

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleUseCurrent = () => {
    if (typeof window !== "undefined") {
      setUaInput(navigator.userAgent);
    }
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
              User Agent & Client Hint Parser
            </h1>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Pure Client-Side Inspection
          </span>
        </header>

        {/* Input Bar */}
        <div className="border border-zinc-800 bg-[#0a0b0e] p-4 mb-6 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
              <Search size={13} className="text-blue-400" />
              <span>User Agent String</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUseCurrent}
                className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw size={12} />
                <span>My Browser</span>
              </button>
              <button
                type="button"
                onClick={() => setUaInput("")}
                className="p-1.5 bg-zinc-900 border border-zinc-800 hover:bg-red-950/40 hover:border-red-800 hover:text-red-400 text-zinc-400 text-xs transition-colors"
                title="Clear"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          <textarea
            value={uaInput}
            onChange={(e) => setUaInput(e.target.value)}
            rows={3}
            placeholder="Paste any User-Agent string..."
            spellCheck={false}
            className="w-full bg-black border border-zinc-800 p-3 text-xs font-mono text-zinc-200 outline-none focus:border-blue-600 resize-none"
          />

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 font-mono text-xs">
            <span className="text-[10px] text-zinc-500 uppercase mr-1">Presets:</span>
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setUaInput(p.ua)}
                className={`px-2 py-0.5 border text-[11px] transition-colors ${
                  uaInput === p.ua
                    ? "bg-blue-600 border-blue-600 text-white font-bold"
                    : "bg-black border-zinc-900 text-zinc-400 hover:text-zinc-200 hover:border-zinc-800"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Identification Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 font-mono text-xs">
          <div className="bg-[#0a0b0e] border border-zinc-800 p-4 flex flex-col justify-between">
            <span className="text-[10px] text-zinc-500 uppercase block mb-1">Browser</span>
            <div className="text-base font-bold text-white truncate">
              {parsed.browser.name}
            </div>
            <div className="text-zinc-400 text-[11px] mt-1">
              Version: <span className="text-blue-400">{parsed.browser.version}</span>
            </div>
          </div>

          <div className="bg-[#0a0b0e] border border-zinc-800 p-4 flex flex-col justify-between">
            <span className="text-[10px] text-zinc-500 uppercase block mb-1">Operating System</span>
            <div className="text-base font-bold text-white truncate">
              {parsed.os.name} {parsed.os.version}
            </div>
            <div className="text-zinc-400 text-[11px] mt-1">
              Platform: <span className="text-emerald-400">{parsed.os.platform}</span>
            </div>
          </div>

          <div className="bg-[#0a0b0e] border border-zinc-800 p-4 flex flex-col justify-between">
            <span className="text-[10px] text-zinc-500 uppercase block mb-1">Device Category</span>
            <div className="text-base font-bold text-white flex items-center gap-2">
              {parsed.device.type === "Desktop" && <Monitor size={16} className="text-blue-400" />}
              {parsed.device.type === "Mobile" && <Smartphone size={16} className="text-emerald-400" />}
              {parsed.device.type === "Tablet" && <Laptop size={16} className="text-amber-400" />}
              <span>{parsed.device.type}</span>
            </div>
            <div className="text-zinc-400 text-[11px] mt-1">
              Engine: <span className="text-zinc-300">{parsed.browser.engine}</span>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Table */}
        <div className="border border-zinc-800 bg-[#0a0b0e] flex flex-col flex-1 overflow-hidden mb-6">
          <div className="border-b border-zinc-800 px-4 py-2.5 bg-black/40 text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Parsed Property Matrix</span>
            <button
              type="button"
              onClick={() => handleCopy(JSON.stringify(parsed, null, 2), "all-json")}
              className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 font-mono transition-colors"
            >
              {copiedKey === "all-json" ? (
                <>
                  <Check size={12} className="text-emerald-400" />
                  <span className="text-emerald-400">JSON Copied</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
          </div>

          <div className="divide-y divide-zinc-900 font-mono text-xs">
            {[
              { label: "Browser Name", value: parsed.browser.name },
              { label: "Browser Version", value: parsed.browser.version },
              { label: "Rendering Engine", value: parsed.browser.engine },
              { label: "Operating System", value: `${parsed.os.name} ${parsed.os.version}`.trim() },
              { label: "CPU Architecture", value: parsed.os.platform },
              { label: "Device Form Factor", value: parsed.device.type },
              { label: "Hardware Concurrency (Local)", value: clientHints.cores ? `${clientHints.cores} logical cores` : "N/A (Pasted UA)" },
              { label: "Screen Resolution (Local)", value: clientHints.screen || "N/A" },
              { label: "Preferred Language", value: clientHints.language || "N/A" },
            ].map((row, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors">
                <span className="text-zinc-500 w-52 shrink-0">{row.label}</span>
                <span className="text-zinc-200 font-semibold select-all text-right flex-1 truncate pl-4">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevEverTools · User Agent & Client Hint Parser
      </footer>
    </div>
  );
}