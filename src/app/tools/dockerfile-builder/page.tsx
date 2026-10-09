"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Container,
  FileCode,
  Sliders,
} from "lucide-react";

type Stack = "nextjs" | "node" | "python" | "nginx" | "go";
type PackageManager = "pnpm" | "npm" | "yarn" | "bun";

export default function DockerfileBuilderPage() {
  const [stack, setStack] = useState<Stack>("nextjs");
  const [pkgManager, setPkgManager] = useState<PackageManager>("pnpm");
  const [nodeVersion, setNodeVersion] = useState("20");
  const [port, setPort] = useState("3000");
  const [activeTab, setActiveTab] = useState<"dockerfile" | "dockerignore">("dockerfile");
  const [copied, setCopied] = useState(false);

  const generateDockerfile = (): string => {
    if (stack === "nextjs") {
      const pmInstall =
        pkgManager === "pnpm"
          ? "RUN corepack enable && corepack prepare pnpm@latest --activate\nCOPY package.json pnpm-lock.yaml* ./\nRUN pnpm install --frozen-lockfile"
          : pkgManager === "yarn"
          ? "COPY package.json yarn.lock* ./\nRUN yarn install --frozen-lockfile"
          : pkgManager === "bun"
          ? "COPY package.json bun.lockb* ./\nRUN bun install --frozen-lockfile"
          : "COPY package.json package-lock.json* ./\nRUN npm ci";

      const pmBuild =
        pkgManager === "pnpm"
          ? "RUN corepack enable && corepack prepare pnpm@latest --activate && pnpm build"
          : pkgManager === "yarn"
          ? "RUN yarn build"
          : pkgManager === "bun"
          ? "RUN bun run build"
          : "RUN npm run build";

      return `# Stage 1: Dependencies
FROM node:${nodeVersion}-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
${pmInstall}

# Stage 2: Builder
FROM node:${nodeVersion}-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
${pmBuild}

# Stage 3: Production Runner
FROM node:${nodeVersion}-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=${port}
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE ${port}

CMD ["node", "server.js"]`;
    }

    if (stack === "node") {
      return `# Stage 1: Build & Dependencies
FROM node:${nodeVersion}-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build --if-present

# Stage 2: Production Runner
FROM node:${nodeVersion}-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=${port}

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

USER node
EXPOSE ${port}

CMD ["node", "dist/index.js"]`;
    }

    if (stack === "python") {
      return `# Multi-stage Python build
FROM python:3.11-slim AS builder
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Final Runner
FROM python:3.11-slim AS runner
WORKDIR /app

COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
ENV PORT=${port}

COPY . .

RUN useradd -m -u 1001 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE ${port}
CMD ["python", "main.py"]`;
    }

    if (stack === "nginx") {
      return `# Stage 1: Build Single Page App
FROM node:${nodeVersion}-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx Alpine
FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html

# Clean SPA Fallback config
RUN echo 'server { \\
    listen ${port}; \\
    location / { \\
        root /usr/share/nginx/html; \\
        try_files \\$uri \\$uri/ /index.html; \\
    } \\
}' > /etc/nginx/conf.d/default.conf

EXPOSE ${port}
CMD ["nginx", "-g", "daemon off;"]`;
    }

    return `# Stage 1: Golang Binary Build
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o main .

# Stage 2: Minimal Scratch Container
FROM scratch
WORKDIR /app
COPY --from=builder /app/main .
EXPOSE ${port}
ENTRYPOINT ["/app/main"]`;
  };

  const generateDockerignore = (): string => {
    if (stack === "python") {
      return `__pycache__/
*.py[cod]
*$py.class
.venv/
venv/
env/
.git/
.gitignore
.dockerignore
Dockerfile
.env*.local
.env
.pytest_cache/
.coverage`;
    }

    if (stack === "go") {
      return `.git/
.gitignore
.dockerignore
Dockerfile
bin/
*.exe
*.test
.env`;
    }

    return `node_modules/
.next/
dist/
build/
out/
.git/
.gitignore
.dockerignore
Dockerfile
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
.env*.local
.env
.vscode/
.idea/`;
  };

  const output = activeTab === "dockerfile" ? generateDockerfile() : generateDockerignore();

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
              Dockerfile & Dockerignore Builder
            </h1>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Multi-Stage Production Generator
          </span>
        </header>

        {/* Configuration Bar */}
        <div className="border border-zinc-800 bg-[#0a0b0e] p-5 mb-5 space-y-4 font-mono text-xs">
          <div className="flex items-center gap-2 text-zinc-400 uppercase text-[11px]">
            <Sliders size={13} className="text-blue-400" />
            <span>Target Environment Settings</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stack Selection */}
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block mb-1">Architecture / Stack</span>
              <select
                value={stack}
                onChange={(e) => setStack(e.target.value as Stack)}
                className="w-full bg-black border border-zinc-800 text-zinc-200 text-xs px-2.5 py-1.5 outline-none focus:border-blue-600"
              >
                <option value="nextjs">Next.js (App / Pages)</option>
                <option value="node">Node.js / Express API</option>
                <option value="nginx">Static SPA (Nginx)</option>
                <option value="python">Python (FastAPI / Flask)</option>
                <option value="go">Golang Binary (Scratch)</option>
              </select>
            </div>

            {/* Package Manager (for JS/TS) */}
            {(stack === "nextjs" || stack === "node" || stack === "nginx") && (
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block mb-1">Package Manager</span>
                <select
                  value={pkgManager}
                  onChange={(e) => setPkgManager(e.target.value as PackageManager)}
                  className="w-full bg-black border border-zinc-800 text-zinc-200 text-xs px-2.5 py-1.5 outline-none focus:border-blue-600"
                >
                  <option value="pnpm">pnpm</option>
                  <option value="npm">npm</option>
                  <option value="yarn">yarn</option>
                  <option value="bun">bun</option>
                </select>
              </div>
            )}

            {/* Node Version */}
            {(stack === "nextjs" || stack === "node" || stack === "nginx") && (
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block mb-1">Node Version</span>
                <select
                  value={nodeVersion}
                  onChange={(e) => setNodeVersion(e.target.value)}
                  className="w-full bg-black border border-zinc-800 text-zinc-200 text-xs px-2.5 py-1.5 outline-none focus:border-blue-600"
                >
                  <option value="20">Node 20 LTS (Iron)</option>
                  <option value="22">Node 22 LTS (Jod)</option>
                  <option value="18">Node 18 LTS (Hydrogen)</option>
                </select>
              </div>
            )}

            {/* Port */}
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block mb-1">Exposed Port</span>
              <input
                type="text"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                className="w-full bg-black border border-zinc-800 text-zinc-200 text-xs px-2.5 py-1.5 outline-none focus:border-blue-600 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Output Workspaces */}
        <div className="border border-zinc-800 bg-[#0a0b0e] flex flex-col flex-1">
          <div className="flex items-center justify-between border-b border-zinc-800 p-2.5 bg-black/40">
            <div className="flex border border-zinc-800 bg-black font-mono text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("dockerfile")}
                className={`px-3 py-1.5 flex items-center gap-1.5 transition-colors ${
                  activeTab === "dockerfile"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Container size={13} />
                <span>Dockerfile</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("dockerignore")}
                className={`px-3 py-1.5 flex items-center gap-1.5 transition-colors ${
                  activeTab === "dockerignore"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <FileCode size={13} />
                <span>.dockerignore</span>
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
                  <span>Copy Configuration</span>
                </>
              )}
            </button>
          </div>

          <textarea
            readOnly
            value={output}
            spellCheck={false}
            className="w-full flex-1 bg-transparent p-5 text-xs font-mono text-zinc-200 outline-none resize-none min-h-[440px] leading-relaxed"
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-zinc-600 mt-8 pt-4 border-t border-zinc-900">
        DevEverTools · Dockerfile & Dockerignore Builder
      </footer>
    </div>
  );
}