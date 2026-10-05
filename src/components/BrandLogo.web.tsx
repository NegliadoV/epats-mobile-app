'use client';
import React, { useId } from 'react';

export default function BrandLogo({ size = 34 }: { size?: number }) {
  const rawId = useId();
  const id = rawId ? rawId.replace(/[^a-zA-Z0-9]/g, '') : 'logo';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-label="epats.wiki logo"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={'bl-bg' + id} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2a1650" />
          <stop offset="1" stopColor="#120b1e" />
        </linearGradient>
        <linearGradient id={'bl-sun' + id} x1="20" y1="8" x2="20" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffd27a" />
          <stop offset="0.5" stopColor="#ff6b4a" />
          <stop offset="1" stopColor="#ff9a3c" />
        </linearGradient>
        <clipPath id={'bl-clip' + id}>
          <rect x="1" y="1" width="38" height="38" rx="12" />
        </clipPath>
      </defs>
      <g clipPath={'url(#bl-clip' + id + ')'}>
        <rect x="1" y="1" width="38" height="38" rx="12" fill={'url(#bl-bg' + id + ')'} />
        <circle cx="20" cy="22" r="10" fill={'url(#bl-sun' + id + ')'} />
        <rect x="8" y="19.5" width="24" height="1.6" fill="#1d1038" />
        <rect x="8" y="23" width="24" height="2" fill="#1d1038" />
        <path d="M1 28c4 0 4-2 8-2s4 2 8 2 4-2 8-2 4 2 8 2 4-2 7-2v13H1z" fill="#1fd1c1" />
        <path d="M1 32c4 0 4-2 8-2s4 2 8 2 4-2 8-2 4 2 8 2 4-2 7-2v9H1z" fill="#0fa89a" />
      </g>
      <rect x="1" y="1" width="38" height="38" rx="12" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
    </svg>
  );
}
