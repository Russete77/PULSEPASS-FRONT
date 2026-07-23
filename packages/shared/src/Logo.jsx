// @pulsepass/shared/Logo — marca oficial (spec: design-system/src/Foundation.jsx)
// Anel duplo + waveform de pulso em gradiente verde→cyan. FONTE ÚNICA da marca.
import React from 'react';

export function Logo({ size = 28, mono = false }) {
  const id = React.useId();
  const gid = `ppLogoGrad-${id.replace(/[:]/g, '')}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ display: 'block', flexShrink: 0 }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={mono ? '#fff' : '#00FF85'} />
          <stop offset="0.6" stopColor={mono ? '#fff' : '#4DFFA8'} />
          <stop offset="1" stopColor={mono ? '#fff' : '#22D3EE'} />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="29" fill="none" stroke={`url(#${gid})`} strokeWidth="2.5" opacity="0.5" />
      <circle cx="32" cy="32" r="22" fill="none" stroke={`url(#${gid})`} strokeWidth="2" />
      <path
        d="M14 32 L22 32 L26 24 L30 40 L34 22 L38 38 L42 32 L50 32"
        fill="none" stroke={`url(#${gid})`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Wordmark "Pulse" branco + sufixo verde (spec: BrandLockup).
 * tag: "Pass" (cliente) · "OS" (cockpit produtora) — mantém a marca viva por superfície.
 */
export function BrandWordmark({ size = 28, tag = 'Pass', tagline = null, fontSize = 18 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <Logo size={size} />
      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span
          style={{
            fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize,
            letterSpacing: '-0.03em', color: '#fff', display: 'flex', alignItems: 'baseline',
          }}
        >
          <span>Pulse</span>
          <span style={{ color: '#00FF85' }}>{tag}</span>
        </span>
        {tagline && (
          <span
            style={{
              fontFamily: 'var(--pp-font-mono)', fontSize: 10, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: 'var(--pp-fg-3)', marginTop: 5,
            }}
          >
            {tagline}
          </span>
        )}
      </span>
    </span>
  );
}

export default Logo;
