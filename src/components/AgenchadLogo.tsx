import React from 'react';
import { AppTheme } from '../types';

interface AgenchadLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  theme?: AppTheme;
  className?: string;
  subtitle?: string;
}

export const AgenchadLogo: React.FC<AgenchadLogoProps> = ({
  size = 'md',
  showText = true,
  theme,
  className = '',
  subtitle = 'EXECUTIVE & SYNC',
}) => {
  const primaryColor = theme?.primaryColor || '#f59e0b';
  const glowColor = theme?.glowColor || 'rgba(245, 158, 11, 0.45)';

  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-sm', sub: 'text-[9px]', shield: 28 },
    md: { icon: 'w-9 h-9', text: 'text-base', sub: 'text-[10px]', shield: 36 },
    lg: { icon: 'w-12 h-12', text: 'text-xl', sub: 'text-xs', shield: 48 },
    xl: { icon: 'w-16 h-16', text: 'text-2xl', sub: 'text-sm', shield: 64 },
  };

  const dim = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Dynamic Monogram Hex / Diamond Shield */}
      <div
        className={`${dim.icon} rounded-2xl flex items-center justify-center relative overflow-hidden transition-all duration-300 shrink-0 group shadow-lg`}
        style={{
          background: `linear-gradient(135deg, #181b26 0%, #0d0f15 100%)`,
          border: `1.5px solid ${primaryColor}`,
          boxShadow: `0 0 20px ${glowColor}, inset 0 1px 1px rgba(255,255,255,0.15)`,
        }}
      >
        {/* Subtle background ambient pulse */}
        <div
          className="absolute inset-0 opacity-25 group-hover:opacity-40 transition-opacity"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${primaryColor} 0%, transparent 70%)`,
          }}
        />

        {/* Vector Angular Stylized "A" + Shield Apex */}
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4/5 h-4/5 relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
        >
          <defs>
            <linearGradient id="agenchadGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor={primaryColor} />
              <stop offset="100%" stopColor={primaryColor} stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="agenchadCore" x1="20" y1="5" x2="20" y2="35" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor={primaryColor} />
            </linearGradient>
          </defs>

          {/* Left Wing of 'A' */}
          <path
            d="M20 6L7 31H13.5L16.8 24.5H23.2L20 18L18 22H22"
            stroke="url(#agenchadGrad)"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Right Wing & Apex with Sharp Bevel */}
          <path
            d="M20 6L33 31H26.5L23.2 24.5H16.8"
            stroke="url(#agenchadGrad)"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Central Power Diamond Core */}
          <polygon
            points="20,11 23,17 20,20 17,17"
            fill="url(#agenchadCore)"
            opacity="0.95"
          />

          {/* Horizontal Executive Stabilizer Bar */}
          <line
            x1="12"
            y1="25"
            x2="28"
            y2="25"
            stroke={primaryColor}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>

        {/* Top Glint Accent */}
        <div className="absolute -top-3 -left-3 w-6 h-6 bg-white/30 rounded-full blur-[2px] pointer-events-none" />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-wider text-white ${dim.text} uppercase font-sans drop-shadow-sm flex items-center`}
            >
              AGEN<span style={{ color: primaryColor }}>CHAD</span>
            </span>
            <span
              className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold tracking-widest uppercase border"
              style={{
                backgroundColor: `${primaryColor}18`,
                borderColor: `${primaryColor}40`,
                color: primaryColor,
              }}
            >
              AI
            </span>
          </div>
          <span className={`font-mono text-slate-400 font-semibold tracking-wider ${dim.sub}`}>
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
};
