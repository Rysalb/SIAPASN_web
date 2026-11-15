import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
  iconOnly?: boolean;
}

export function Logo({
  size = 'md',
  showTagline = true,
  className = '',
  iconOnly = false,
}: LogoProps) {
  const sizeMap = {
    sm: { icon: 28, text: 'text-lg', tagline: 'text-[9px]' },
    md: { icon: 38, text: 'text-xl', tagline: 'text-[11px]' },
    lg: { icon: 48, text: 'text-2xl', tagline: 'text-xs' },
    xl: { icon: 64, text: 'text-4xl', tagline: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Visual Logo Emblem */}
      <div className="relative flex items-center justify-center">
        <svg
          width={currentSize.icon}
          height={currentSize.icon}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-sm transition-transform duration-300 hover:scale-105"
        >
          <defs>
            <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="50%" stopColor="#1E40AF" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="50%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
            <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
          </defs>

          {/* Outer Shield Hexagon */}
          <path
            d="M50 6 L88 24 L88 64 C88 80 50 94 50 94 C50 94 12 80 12 64 L12 24 Z"
            fill="url(#shieldGrad)"
            stroke="url(#cyanGrad)"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Stylized Wings (Garuda / Eagle dynamic feather arcs) */}
          {/* Left Wing */}
          <path
            d="M50 36 C38 28 26 32 20 44 C26 44 34 42 42 47 C30 48 24 56 22 66 C28 62 38 60 46 64"
            fill="none"
            stroke="url(#goldGrad)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Right Wing */}
          <path
            d="M50 36 C62 28 74 32 80 44 C74 44 66 42 58 47 C70 48 76 56 78 66 C72 62 62 60 54 64"
            fill="none"
            stroke="url(#goldGrad)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Central Pillar / Torch & Star */}
          {/* Star on top */}
          <polygon
            points="50,22 53,29 60,30 55,35 56,42 50,38 44,42 45,35 40,30 47,29"
            fill="url(#goldGrad)"
          />

          {/* Core Knowledge Book / Base */}
          <path
            d="M36 72 Q50 67 50 78 Q50 67 64 72 L62 76 Q50 71 50 82 Q50 71 38 76 Z"
            fill="#FFFFFF"
            opacity="0.9"
          />
        </svg>
      </div>

      {/* Brand Name & Tagline */}
      {!iconOnly && (
        <div className="flex flex-col leading-none">
          <div className={`font-black tracking-tight flex items-baseline ${currentSize.text}`}>
            <span className="text-[var(--text-primary)] font-extrabold tracking-tight">SIAP</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 font-black ml-0.5">
              ASN
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--primary)] ml-1"></span>
          </div>
          {showTagline && (
            <span
              className={`font-semibold tracking-wider uppercase text-[var(--text-muted)] mt-1 ${currentSize.tagline}`}
            >
              Simulasi CAT & Akademi ASN
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default Logo;

