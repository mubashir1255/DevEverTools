"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Binary,
  Braces,
  Clock3,
  Code2,
  FileCode,
  FileJson,
  TableIcon,
  FileText,
  Fingerprint,
  Hash,
  Database,
  Calendar,
  Keyboard,
  Globe,
  Image as ImageIcon,
  KeyRound,
  Layers,
  Link2,
  Terminal,
  BookOpen,
  Globe2,
  GitBranch,
  Container,
  Minimize2,
  Palette,
  Regex,
  Search,
  ShieldCheck,
  Sliders,
  Split,
  Type,
  Check,
  X,
  QrCode,
} from "lucide-react";

type Tool = {
  name: string;
  description: string;
  category: string;
  icon: typeof Braces;
  slug?: string;
};

const tools: Tool[] = [
  // --- Formatters & Converters ---
  {
    name: "JSON Formatter",
    description: "Format, validate, and beautify JSON data.",
    category: "Formatters",
    icon: Braces,
    slug: "json-formatter",
  },
  {
    name: "JSON to TypeScript",
    description: "Convert JSON objects into clean TypeScript interfaces.",
    category: "Formatters",
    icon: FileJson,
    slug: "json-to-typescript",
  },
  {
    name: "SQL Formatter",
    description: "Beautify, indent, and format SQL database queries.",
    category: "Formatters",
    icon: FileCode,
    slug: "sql-formatter",
  },
  {
    name: "Markdown Preview",
    description: "Render markdown in real-time and export formatted HTML.",
    category: "Formatters",
    icon: FileText,
    slug: "markdown-preview",
  },
  {
    name: "Schema Generator",
    description: "Generate Zod runtime schemas and TypeScript interfaces directly from JSON.",
    category: "Formatters",
    icon: ShieldCheck,
    slug: "schema-generator",
  },
  {
    name: "Markdown Table Generator",
    description: "Build clean, auto-padded markdown tables visually or convert CSV/TSV spreadsheets.",
    category: "Formatters",
    icon: TableIcon,
    slug: "markdown-table",
  },
  {
    name: "Minifier",
    description: "Strip whitespace and comments from JSON, CSS, and HTML strings.",
    category: "Formatters",
    icon: Minimize2,
    slug: "minifier",
  },
  {
    name: "SVG to CSS / JSX",
    description: "Convert raw SVG markup into CSS backgrounds or React components.",
    category: "Converters",
    icon: Code2,
    slug: "svg-converter",
  },
  {
    name: "Timestamp Converter",
    description: "Convert Unix epoch timestamps to UTC and human-readable dates.",
    category: "Converters",
    icon: Clock3,
    slug: "timestamp-converter",
  },
  {
    name: "CSS Unit Converter",
    description: "Convert px, rem, em, %, and generate fluid clamp() typography.",
    category: "Converters",
    icon: Sliders,
    slug: "css-unit-converter",
  },
  {
    name: "cURL Converter",
    description: "Convert cURL commands to JavaScript Fetch, Axios, or Python requests.",
    category: "Converters",
    icon: Terminal,
    slug: "curl-converter",
  },
  {
    name: "Hex & Binary Inspector",
    description: "Inspect raw text as hexdump (xxd), binary bits, and decimal byte arrays.",
    category: "Converters",
    icon: Binary,
    slug: "hex-inspector",
  },
  {
    name: "Image to Data URL",
    description: "Convert images to Base64 data URIs, HTML img tags, and CSS backgrounds.",
    category: "Converters",
    icon: ImageIcon,
    slug: "image-data-url",
  },
  {
    name: "SQL to Prisma / TypeScript",
    description: "Transpile SQL CREATE TABLE statements directly into Prisma models and TypeScript types.",
    category: "Converters",
    icon: Database,
    slug: "sql-to-prisma",
  },

  // --- Encoders & Generators ---
  {
    name: "Base64 Encoder",
    description: "Encode and decode text, tokens, or images to Base64 strings.",
    category: "Encoders",
    icon: Binary,
    slug: "base64-encoder",
  },
  {
    name: "URL Encoder",
    description: "Safely encode or decode special characters in URI query strings.",
    category: "Encoders",
    icon: Link2,
    slug: "url-encoder",
  },
  {
    name: "HTML Entity Encoder",
    description: "Convert special characters to HTML entities and back safely.",
    category: "Encoders",
    icon: Code2,
    slug: "html-entity-encoder",
  },
  {
    name: "UUID Generator",
    description: "Generate cryptographically secure v4 and timestamped v7 UUIDs.",
    category: "Generators",
    icon: Fingerprint,
    slug: "uuid-generator",
  },
  {
    name: "Password & Token Generator",
    description: "Create customizable, cryptographically strong random secrets.",
    category: "Generators",
    icon: KeyRound,
    slug: "password-generator",
  },
  {
    name: "Dummy Data / Lorem Generator",
    description: "Generate dummy paragraphs, JSON arrays, and placeholder emails.",
    category: "Generators",
    icon: Type,
    slug: "dummy-data-generator",
  },
  {
    name: "QR Code Generator",
    description: "Generate customizable QR codes with instant PNG and SVG vector export.",
    category: "Generators",
    icon: QrCode,
    slug: "qr-generator",
  },

  // --- Security & Web Utilities ---
  {
    name: "JWT Decoder",
    description: "Inspect claims, issued-at, and expiration in token payloads locally.",
    category: "Security",
    icon: ShieldCheck,
    slug: "jwt-decoder",
  },
  {
    name: "Hash Generator",
    description: "Generate SHA-256, SHA-512, and MD5 hashes using Web Crypto.",
    category: "Security",
    icon: Hash,
    slug: "hash-generator",
  },
  {
    name: "Chmod Permissions Calculator",
    description: "Visual Linux/Unix numeric and symbolic file permission builder.",
    category: "DevOps",
    icon: Layers,
    slug: "chmod-calculator",
  },
  {
    name: "Regex Tester",
    description: "Test regular expressions with real-time match groups and flags.",
    category: "DevOps",
    icon: Regex,
    slug: "regex-tester",
  },
  {
    name: "Diff Checker",
    description: "Compare two blocks of code or text with unified and split diff views.",
    category: "DevOps",
    icon: Split,
    slug: "diff-checker",
  },
  {
    name: "Cron Expression Parser",
    description: "Translate cron expressions into human readable schedules with upcoming runs.",
    category: "DevOps",
    icon: Calendar,
    slug: "cron-parser",
  },
  {
    name: "Meta Tag Generator",
    description: "Generate SEO meta tags, Open Graph, Twitter cards, and Next.js metadata.",
    category: "DevOps",
    icon: Globe,
    slug: "meta-tag-generator",
  },
  {
    name: "KeyCode Inspector",
    description: "Inspect JavaScript keyboard events, key codes, and modifier combinations in real-time.",
    category: "DevOps",
    icon: Keyboard,
    slug: "keycode-inspector",
  },
  {
    name: "Dockerfile Builder",
    description: "Generate multi-stage, security-hardened Dockerfiles and .dockerignore files.",
    category: "DevOps",
    icon: Container,
    slug: "dockerfile-builder",
  },
  {
    name: "RegEx Cheat Sheet",
    description: "Interactive regex syntax reference, character classes, anchors, and lookarounds.",
    category: "DevOps",
    icon: BookOpen,
    slug: "regex-cheatsheet",
  },
  {
    name: "HTTP Reference",
    description: "Searchable RFC HTTP status codes, security headers, and caching directives.",
    category: "DevOps",
    icon: Globe2,
    slug: "http-reference",
  },
  {
    name: "Git Cheatsheet",
    description: "Curated reference of high-frequency Git commands, undo recipes, and workflows.",
    category: "DevOps",
    icon: GitBranch,
    slug: "git-cheatsheet",
  },

  // --- Design & Layout ---
  {
    name: "Color Palette",
    description: "Explore color scales, tweak contrast, and copy hex/rgb/hsl values.",
    category: "Design",
    icon: Palette,
    slug: "color-palette",
  },
  {
    name: "Box Shadow Generator",
    description: "Design multi-layer CSS box shadows, glow effects, and Tailwind elevation classes.",
    category: "Design",
    icon: Layers,
    slug: "box-shadow-generator",
  },
  
];

const categories = [
  "All",
  "Formatters",
  "Encoders",
  "Generators",
  "Converters",
  "Security",
  "DevOps",
  "Design",
];

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [notice, setNotice] = useState("");

  const filteredTools = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return tools.filter((tool) => {
      const matchesQuery =
        tool.name.toLowerCase().includes(normalizedQuery) ||
        tool.description.toLowerCase().includes(normalizedQuery) ||
        tool.category.toLowerCase().includes(normalizedQuery);

      const matchesCategory =
        category === "All" || tool.category === category;

      return matchesQuery && matchesCategory;
    });
  }, [query, category]);

  function handleToolClick(tool: Tool) {
    if (tool.slug) {
      router.push(`/tools/${tool.slug}`);
    } else {
      setNotice(`${tool.name} module is queued for the next milestone.`);
      window.setTimeout(() => setNotice(""), 3000);
    }
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col justify-between py-12 px-6">
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
        {/* Header */}
        <header className="text-center mb-8 flex flex-col items-center w-full">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
            DevEverTools
          </h1>
          <p className="text-sm text-zinc-400 mb-1">
            Free browser tools for developers and designers
          </p>
          <p className="text-xs text-zinc-500 mb-6">
            No signup. No tracking. Pure client-side execution.
          </p>

          {/* Clean Search Input */}
          <div className="relative w-full max-w-lg mb-5">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
            />
            <input
              type="search"
              placeholder="Search tools..."
              className="w-full bg-[#0a0b0e] border border-zinc-800 text-zinc-200 text-xs pl-10 pr-4 py-2.5 outline-none focus:border-blue-600 transition-colors"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
            {categories.map((cat) => {
              const count =
                cat === "All"
                  ? tools.length
                  : tools.filter((t) => t.category === cat).length;
              const isActive = category === cat;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1 text-xs border transition-colors ${
                    isActive
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-[#0d0f14] border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </header>

        {/* Content Section */}
        <main className="w-full">
          <div className="text-xs font-semibold text-blue-400 mb-4 tracking-wide uppercase">
            {category === "All" ? "All Tools" : category}
          </div>

          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredTools.map((tool) => {
                const Icon = tool.icon;

                return (
                  <article
                    key={tool.name}
                    onClick={() => handleToolClick(tool)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleToolClick(tool);
                      }
                    }}
                    className="bg-[#0a0b0e] border border-zinc-800/80 p-5 flex flex-col justify-between hover:border-blue-600 hover:bg-[#0e1015] cursor-pointer outline-none transition-all group min-h-[140px]"
                  >
                    <div>
                      <div className="text-zinc-300 mb-3 group-hover:text-blue-400 transition-colors">
                        <Icon size={22} strokeWidth={1.75} />
                      </div>
                      <h2 className="text-sm font-semibold text-zinc-100 mb-1">
                        {tool.name}
                      </h2>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>

                    <div className="text-[10px] text-zinc-600 uppercase tracking-wider mt-4">
                      {tool.category}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="border border-dashed border-zinc-800 p-12 text-center text-zinc-400">
              <p className="text-xs mb-3">
                No tools found matching &quot;{query}&quot;
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategory("All");
                }}
                className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 hover:bg-zinc-800"
              >
                Reset filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-12 pt-6 border-t border-zinc-900">
        DevEverTools · Local client-side tools
      </footer>

      {/* Toast Notification */}
      {notice && (
        <div className="fixed bottom-6 right-6 bg-[#0e1015] border border-blue-600 px-4 py-2.5 flex items-center gap-3 text-xs shadow-xl text-zinc-200 z-50">
          <Check size={14} className="text-blue-400" />
          <span>{notice}</span>
          <button
            type="button"
            className="text-zinc-500 hover:text-zinc-300 ml-2"
            onClick={() => setNotice("")}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}