"use client";

import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: number;
}

export function Logo({
  className = "",
  showText = true,
  size = 32,
}: LogoProps) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 group transition-opacity hover:opacity-90 ${className}`}
    >
      <div
        style={{ width: size, height: size }}
        className="relative rounded-lg overflow-hidden border border-zinc-800 bg-black flex items-center justify-center shrink-0 shadow-sm transition-colors group-hover:border-zinc-700"
      >
        <Image
          src="/logo.png"
          alt="DevEverTools Logo"
          width={size}
          height={size}
          priority
          className="object-contain p-0.5"
        />
      </div>

      {showText && (
        <span className="font-mono font-bold tracking-tight text-white text-base select-none">
          Dev<span className="text-blue-500">Ever</span>
          <span className="text-zinc-400">Tools</span>
        </span>
      )}
    </Link>
  );
}

export default Logo;