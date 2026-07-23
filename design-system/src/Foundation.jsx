// Foundation.jsx — PulsePass Design System foundations
// Brand · Palette · Typography · Spacing · Radii · Shadows · Glass · Motion

const PP_GREEN = '#00FF85';
const PP_VIOLET = '#A78BFA';
const PP_CYAN = '#22D3EE';

// ─────────────────────────────────────────────────────────────
// Brand mark — wordmark + glyph
// ─────────────────────────────────────────────────────────────
function Logo({ size = 64, mono = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="ppLogoGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={mono ? '#fff' : PP_GREEN}/>
          <stop offset="0.6" stopColor={mono ? '#fff' : '#4DFFA8'}/>
          <stop offset="1" stopColor={mono ? '#fff' : PP_CYAN}/>
        </linearGradient>
      </defs>
      {/* outer ring */}
      <circle cx="32" cy="32" r="29" fill="none" stroke="url(#ppLogoGrad)" strokeWidth="2.5" opacity="0.5"/>
      {/* inner ring */}
      <circle cx="32" cy="32" r="22" fill="none" stroke="url(#ppLogoGrad)" strokeWidth="2"/>
      {/* pulse waveform inside */}
      <path d="M14 32 L22 32 L26 24 L30 40 L34 22 L38 38 L42 32 L50 32"
        fill="none" stroke="url(#ppLogoGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function BrandLockup({ tag = 'PASS' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <Logo size={56}/>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 36, letterSpacing: '-0.03em', color: '#fff', display: 'flex', alignItems: 'baseline', gap: 0 }}>
          <span>Pulse</span>
          <span style={{ color: PP_GREEN }}>{tag}</span>
        </div>
        <div style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--pp-fg-3)', marginTop: 6 }}>
          Sistema Operacional de Eventos
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CARD 1 — Brand identity
// ─────────────────────────────────────────────────────────────
function BrandCard() {
  return (
    <div className="pp-card" style={{ width: 760, height: 460 }}>
      <div className="pp-eyebrow">01 · Brand</div>
      <h2 className="pp-h2" style={{ marginTop: 14 }}>
        Sinta o pulso<br/>
        <span style={{ fontFamily: 'var(--pp-font-serif)', fontStyle: 'italic', fontWeight: 400, color: PP_GREEN }}>do evento.</span>
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 36 }}>
        <div>
          <div className="pp-label" style={{ marginBottom: 16 }}>Wordmark</div>
          <BrandLockup/>
        </div>
        <div>
          <div className="pp-label" style={{ marginBottom: 16 }}>Glyph</div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 96, height: 96, borderRadius: 20, background: '#0F1218', display: 'grid', placeItems: 'center', border: '1px solid var(--pp-edge-2)' }}>
              <Logo size={56}/>
            </div>
            <div style={{ width: 96, height: 96, borderRadius: 20, background: PP_GREEN, display: 'grid', placeItems: 'center' }}>
              <Logo size={56} mono/>
            </div>
            <div style={{ width: 96, height: 96, borderRadius: 20, background: '#fff', display: 'grid', placeItems: 'center', border: '1px solid var(--pp-edge-2)' }}>
              <svg width="56" height="56" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="29" fill="none" stroke="#06070A" strokeWidth="2.5" opacity="0.4"/>
                <circle cx="32" cy="32" r="22" fill="none" stroke="#06070A" strokeWidth="2"/>
                <path d="M14 32 L22 32 L26 24 L30 40 L34 22 L38 38 L42 32 L50 32" fill="none" stroke="#06070A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 36, flexWrap: 'wrap' }}>
        {['Imersivo', 'Premium', 'Confiável', 'Brasileiro', 'Cinematográfico', 'Instantâneo'].map(t => (
          <span key={t} style={{
            padding: '8px 14px',
            border: '1px solid var(--pp-edge-2)',
            borderRadius: 999,
            fontSize: 13,
            color: 'var(--pp-fg-2)',
            background: 'var(--pp-glass-2)',
            backdropFilter: 'blur(8px)',
          }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CARD 2 — Palette
// ─────────────────────────────────────────────────────────────
function Swatch({ name, hex, token, contrast = 'light', big = false, glow }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{
        background: hex,
        height: big ? 140 : 84,
        borderRadius: 14,
        display: 'flex', alignItems: 'flex-end', padding: 12,
        color: contrast === 'light' ? '#fff' : '#06070A',
        fontFamily: 'var(--pp-font-mono)',
        fontSize: 11,
        boxShadow: glow ? glow : '0 1px 0 rgba(255,255,255,0.05) inset',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {big && (
          <div style={{ position: 'absolute', top: 12, left: 12, fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 18 }}>{name}</div>
        )}
        <span style={{ opacity: 0.85 }}>{hex}</span>
      </div>
      {!big && <div style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: '#fff' }}>{name}</div>}
      <div style={{ marginTop: big ? 8 : 2, fontFamily: 'var(--pp-font-mono)', fontSize: 11, color: 'var(--pp-fg-3)' }}>{token}</div>
    </div>
  );
}

function PaletteCard() {
  return (
    <div className="pp-card" style={{ width: 760, padding: 32 }}>
      <div className="pp-eyebrow">02 · Color</div>
      <h3 className="pp-h3" style={{ marginTop: 12 }}>Paleta — verde pulse + acentos premium</h3>
      <p className="pp-body" style={{ marginTop: 8, maxWidth: 560 }}>
        Verde neon como cor da ação (CTA, sucesso, pulse). Violeta sinaliza premium e fidelidade. Cyan é dado ao vivo / cashless. Magenta é para estados críticos e alertas.
      </p>

      {/* Primary big swatches */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 28 }}>
        <Swatch name="Pulse" hex="#00FF85" token="--pp-pulse" contrast="dark" big glow="0 0 40px rgba(0,255,133,0.35), inset 0 1px 0 rgba(255,255,255,0.3)"/>
        <Swatch name="Violet" hex="#A78BFA" token="--pp-violet" contrast="dark" big glow="0 0 40px rgba(167,139,250,0.35), inset 0 1px 0 rgba(255,255,255,0.3)"/>
        <Swatch name="Cyan" hex="#22D3EE" token="--pp-cyan" contrast="dark" big glow="0 0 40px rgba(34,211,238,0.35), inset 0 1px 0 rgba(255,255,255,0.3)"/>
      </div>

      {/* Variant rows */}
      <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
        <Swatch name="Pulse Hi" hex="#4DFFA8" token="--pp-pulse-hi" contrast="dark"/>
        <Swatch name="Pulse Lo" hex="#00CC6A" token="--pp-pulse-lo" contrast="dark"/>
        <Swatch name="Pulse Ink" hex="#003C1F" token="--pp-pulse-ink"/>
        <Swatch name="Violet Lo" hex="#7C3AED" token="--pp-violet-lo"/>
        <Swatch name="Cyan Lo" hex="#0891B2" token="--pp-cyan-lo"/>
      </div>

      {/* Semantic */}
      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <Swatch name="Magenta" hex="#FF3D88" token="--pp-pink"/>
        <Swatch name="Amber" hex="#FFB800" token="--pp-amber" contrast="dark"/>
        <Swatch name="Critical" hex="#FF3B30" token="--pp-red"/>
        <Swatch name="Cream" hex="#F5F3EE" token="--pp-cream" contrast="dark"/>
      </div>

      {/* Ink scale */}
      <div style={{ marginTop: 28 }}>
        <div className="pp-label" style={{ marginBottom: 10 }}>Ink scale · superfícies dark</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {[
            ['#06070A', '950'], ['#0B0D12', '900'], ['#11141B', '850'],
            ['#161A23', '800'], ['#1F2430', '700'], ['#2A3140', '600'], ['#3A4254', '500'],
          ].map(([hex, name]) => (
            <div key={name} style={{ background: hex, height: 56, borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'flex-end', padding: 8, color: 'var(--pp-fg-3)', fontFamily: 'var(--pp-font-mono)', fontSize: 10 }}>
              {name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CARD 3 — Typography
// ─────────────────────────────────────────────────────────────
function TypographyCard() {
  return (
    <div className="pp-card" style={{ width: 760 }}>
      <div className="pp-eyebrow">03 · Type</div>
      <h3 className="pp-h3" style={{ marginTop: 12 }}>Tipografia — geometric + editorial</h3>
      <p className="pp-body" style={{ marginTop: 8 }}>
        Space Grotesk em headlines (geométrica, brasileira em espírito) · Inter na UI · Newsreader italic como acento editorial · JetBrains Mono em códigos, preços e PIX.
      </p>

      {/* Stack showcase */}
      <div style={{ marginTop: 28, display: 'grid', gap: 18 }}>
        <div style={{ borderBottom: '1px solid var(--pp-edge-1)', paddingBottom: 16 }}>
          <div className="pp-label">Display · Space Grotesk · 72/.95 · -0.04em</div>
          <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 72, lineHeight: 0.95, letterSpacing: '-0.04em', marginTop: 8 }}>
            Hoje à <span style={{ fontFamily: 'var(--pp-font-serif)', fontStyle: 'italic', fontWeight: 400, color: PP_GREEN }}>noite.</span>
          </div>
        </div>

        <div style={{ borderBottom: '1px solid var(--pp-edge-1)', paddingBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <div className="pp-label">H1 · 48</div>
            <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 48, lineHeight: 1, letterSpacing: '-0.03em', marginTop: 6 }}>Festival do Sol</div>
          </div>
          <div>
            <div className="pp-label">H2 · 32</div>
            <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 32, lineHeight: 1.05, letterSpacing: '-0.025em', marginTop: 6 }}>Selecione seu lote</div>
          </div>
        </div>

        <div style={{ borderBottom: '1px solid var(--pp-edge-1)', paddingBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <div className="pp-label">H3 · 24 · semibold</div>
            <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 600, fontSize: 24, lineHeight: 1.2, letterSpacing: '-0.02em', marginTop: 6 }}>Setor Pista — 3º lote</div>
          </div>
          <div>
            <div className="pp-label">H4 · 18 · semibold</div>
            <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 600, fontSize: 18, lineHeight: 1.25, marginTop: 6 }}>QR rotativo · expira em 4:38</div>
          </div>
        </div>

        <div style={{ borderBottom: '1px solid var(--pp-edge-1)', paddingBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <div className="pp-label">Body · Inter · 15/1.5</div>
            <div style={{ fontFamily: 'var(--pp-font-body)', fontSize: 15, lineHeight: 1.5, color: 'var(--pp-fg-2)', marginTop: 6 }}>
              Recarregue sua carteira via Pix, gaste no PDV. Sem dinheiro físico, sem fila no bar — você só aproveita.
            </div>
          </div>
          <div>
            <div className="pp-label">Mono · JetBrains · prices</div>
            <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 600, fontSize: 28, marginTop: 6, color: '#fff' }}>
              R$ <span style={{ color: PP_GREEN }}>87,50</span>
            </div>
            <div style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 13, color: 'var(--pp-fg-3)', marginTop: 4 }}>PSP-7H29-XJ48-LK02</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <div><div className="pp-label">Eyebrow · mono · 11</div><div className="pp-eyebrow" style={{ marginTop: 6 }}>SOLD OUT 80%</div></div>
          <div><div className="pp-label">Label · 12 · 600</div><div style={{ fontSize: 12, fontWeight: 600, marginTop: 6 }}>NOME COMPLETO</div></div>
          <div><div className="pp-label">Small · 13</div><div style={{ fontSize: 13, color: 'var(--pp-fg-3)', marginTop: 6 }}>Termos aplicáveis</div></div>
          <div><div className="pp-label">Caption · 11</div><div style={{ fontSize: 11, color: 'var(--pp-fg-4)', marginTop: 6 }}>Atualizado 2 min atrás</div></div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CARD 4 — Spacing · Radius · Shadow · Glass
// ─────────────────────────────────────────────────────────────
function SystemCard() {
  return (
    <div className="pp-card" style={{ width: 760 }}>
      <div className="pp-eyebrow">04 · System</div>
      <h3 className="pp-h3" style={{ marginTop: 12 }}>Espaçamento · Raios · Sombras · Glass</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginTop: 28 }}>
        {/* Spacing */}
        <div>
          <div className="pp-label" style={{ marginBottom: 14 }}>Spacing · 4px grid</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
            {[
              [4, '1'], [8, '2'], [12, '3'], [16, '4'], [24, '6'], [32, '8'], [48, '12'], [64, '16'],
            ].map(([px, n]) => (
              <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 20, height: px, background: PP_GREEN, borderRadius: 3, opacity: 0.9 }}/>
                <div style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 10, color: 'var(--pp-fg-3)' }}>{n}</div>
                <div style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 9, color: 'var(--pp-fg-4)' }}>{px}px</div>
              </div>
            ))}
          </div>
        </div>

        {/* Radius */}
        <div>
          <div className="pp-label" style={{ marginBottom: 14 }}>Border radius</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              [6, 'xs'], [10, 'sm'], [14, 'md'], [20, 'lg'], [28, 'xl'], [36, '2xl'],
            ].map(([r, n]) => (
              <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 50, height: 50, background: 'var(--pp-glass-3)', border: '1px solid var(--pp-edge-3)', borderRadius: r }}/>
                <div style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 10, color: 'var(--pp-fg-3)' }}>{n}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shadows + glow */}
      <div style={{ marginTop: 32 }}>
        <div className="pp-label" style={{ marginBottom: 14 }}>Elevation · ambient + glow</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, padding: '12px 0' }}>
          {[
            { name: 'shadow-1', shadow: '0 1px 2px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)' },
            { name: 'shadow-2', shadow: '0 4px 16px rgba(0,0,0,0.5), 0 12px 32px rgba(0,0,0,0.4)' },
            { name: 'shadow-3', shadow: '0 8px 24px rgba(0,0,0,0.55), 0 24px 64px rgba(0,0,0,0.5)' },
            { name: 'glow-pulse', shadow: '0 0 0 1px rgba(0,255,133,0.35), 0 8px 28px rgba(0,255,133,0.5)' },
            { name: 'glow-violet', shadow: '0 0 0 1px rgba(167,139,250,0.35), 0 8px 28px rgba(167,139,250,0.5)' },
          ].map(s => (
            <div key={s.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 80, height: 60, background: 'var(--pp-ink-800)', border: '1px solid var(--pp-edge-2)', borderRadius: 12, boxShadow: s.shadow }}/>
              <div style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 10, color: 'var(--pp-fg-3)' }}>{s.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Glass */}
      <div style={{ marginTop: 32 }}>
        <div className="pp-label" style={{ marginBottom: 14 }}>Glass surfaces · backdrop blur</div>
        <div style={{
          position: 'relative',
          height: 160,
          borderRadius: 16,
          overflow: 'hidden',
          background: `radial-gradient(60% 60% at 30% 50%, ${PP_GREEN}, transparent 70%), radial-gradient(50% 50% at 80% 60%, ${PP_VIOLET}, transparent 70%), #0a0a0c`,
        }}>
          <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, padding: 20 }}>
            {[
              ['Faint', 'rgba(255,255,255,0.03)', 'blur(12px)'],
              ['Medium', 'rgba(255,255,255,0.08)', 'blur(24px)'],
              ['Strong', 'rgba(255,255,255,0.14)', 'blur(40px)'],
            ].map(([name, bg, blur]) => (
              <div key={name} style={{
                background: bg,
                backdropFilter: `${blur} saturate(180%)`,
                WebkitBackdropFilter: `${blur} saturate(180%)`,
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 14,
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
                display: 'flex',
                alignItems: 'flex-end',
                padding: 14,
              }}>
                <div style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 11, color: '#fff' }}>{name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Expose
Object.assign(window, { Logo, BrandLockup, BrandCard, PaletteCard, TypographyCard, SystemCard });
