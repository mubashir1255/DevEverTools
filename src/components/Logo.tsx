interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export default function Logo({ className = "", size = 28, showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brutalist Geometric SVG Emblem */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Outer Vault Frame */}
        <rect
          x="2"
          y="2"
          width="28"
          height="28"
          rx="2"
          className="fill-black stroke-zinc-800"
          strokeWidth="2"
        />

        {/* Diagonal Accent Notch */}
        <path
          d="M2 10L10 2"
          className="stroke-blue-500"
          strokeWidth="2"
        />

        {/* Command Terminal Bracket `>` */}
        <path
          d="M10 11L16 16L10 21"
          className="stroke-white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Active Cursor Pulse / Execution Dash `_` */}
        <line
          x1="18"
          y1="21"
          x2="23"
          y2="21"
          className="stroke-blue-500"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Hardware Status Dot */}
        <circle cx="25" cy="7" r="1.5" className="fill-emerald-400" />
      </svg>

      {/* Brand Wordmark */}
      {showText && (
        <span className="font-mono text-sm font-bold tracking-tight text-white uppercase flex items-center">
          Dev<span className="text-blue-500">Ever</span>
          <span className="text-zinc-500 font-normal ml-1 text-xs">Tools</span>
        </span>
      )}
    </div>
  );
}