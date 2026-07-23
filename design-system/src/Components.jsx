// Components.jsx — Buttons, inputs, badges, cards, status

const PP_GREEN_C = '#00FF85';
const PP_VIOLET_C = '#A78BFA';
const PP_CYAN_C = '#22D3EE';

// ─── PrimaryButton ───
function PButton({ children, variant = 'primary', size = 'md', icon, style = {}, full }) {
  const sizes = {
    sm: { h: 36, px: 16, fs: 13, gap: 8 },
    md: { h: 46, px: 22, fs: 14, gap: 10 },
    lg: { h: 56, px: 28, fs: 16, gap: 12 },
  };
  const s = sizes[size];
  const variants = {
    primary: {
      background: `linear-gradient(180deg, #4DFFA8 0%, #00FF85 60%, #00CC6A 100%)`,
      color: '#003C1F',
      boxShadow: '0 1px 0 rgba(255,255,255,0.4) inset, 0 0 0 1px rgba(0,255,133,0.4), 0 8px 24px rgba(0,255,133,0.32), 0 1px 2px rgba(0,0,0,0.4)',
      fontWeight: 700,
    },
    glass: {
      background: 'rgba(255,255,255,0.08)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.16)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.16)',
      fontWeight: 600,
    },
    ghost: {
      background: 'transparent',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.16)',
      fontWeight: 600,
    },
    violet: {
      background: `linear-gradient(180deg, #C4B5FD 0%, #A78BFA 60%, #7C3AED 100%)`,
      color: '#1A0040',
      boxShadow: '0 1px 0 rgba(255,255,255,0.4) inset, 0 0 0 1px rgba(167,139,250,0.4), 0 8px 24px rgba(167,139,250,0.32)',
      fontWeight: 700,
    },
    danger: {
      background: '#FF3B30',
      color: '#fff',
      fontWeight: 600,
    },
  };
  return (
    <button style={{
      height: s.h,
      padding: `0 ${s.px}px`,
      borderRadius: 999,
      fontSize: s.fs,
      fontFamily: 'var(--pp-font-body)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: s.gap,
      cursor: 'pointer',
      letterSpacing: '-0.005em',
      width: full ? '100%' : 'auto',
      justifyContent: 'center',
      border: 'none',
      ...variants[variant],
      ...style,
    }}>
      {icon}
      {children}
    </button>
  );
}

// ─── Glass input ───
function GInput({ placeholder = 'Buscar evento, artista, casa…', icon, value, style = {} }) {
  return (
    <div style={{
      height: 50,
      padding: '0 18px',
      borderRadius: 999,
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.10)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
      ...style,
    }}>
      {icon || (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
      )}
      <div style={{ color: value ? '#fff' : 'rgba(255,255,255,0.45)', fontSize: 14 }}>{value || placeholder}</div>
    </div>
  );
}

// ─── Badge ───
function PBadge({ children, tone = 'pulse', dot, soft }) {
  const tones = {
    pulse:  { bg: 'rgba(0,255,133,0.14)', fg: '#4DFFA8', edge: 'rgba(0,255,133,0.22)' },
    violet: { bg: 'rgba(167,139,250,0.16)', fg: '#C4B5FD', edge: 'rgba(167,139,250,0.28)' },
    cyan:   { bg: 'rgba(34,211,238,0.14)', fg: '#67E8F9', edge: 'rgba(34,211,238,0.24)' },
    pink:   { bg: 'rgba(255,61,136,0.14)', fg: '#FF77AA', edge: 'rgba(255,61,136,0.24)' },
    amber:  { bg: 'rgba(255,184,0,0.14)', fg: '#FFD15C', edge: 'rgba(255,184,0,0.24)' },
    red:    { bg: 'rgba(255,59,48,0.14)', fg: '#FF7A75', edge: 'rgba(255,59,48,0.24)' },
    neutral:{ bg: 'rgba(255,255,255,0.08)', fg: 'rgba(255,255,255,0.85)', edge: 'rgba(255,255,255,0.14)' },
  };
  const t = tones[tone];
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '5px 10px 5px 10px',
      borderRadius: 999,
      background: soft ? t.bg : t.bg,
      color: t.fg,
      border: `1px solid ${t.edge}`,
      fontSize: 11,
      fontFamily: 'var(--pp-font-mono)',
      fontWeight: 500,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>
      {dot && <span className="pp-pulse-dot" style={{ background: t.fg, width: 6, height: 6 }}/>}
      {children}
    </span>
  );
}

// ─── Status chips (ticket states) ───
function StatusRow() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      <PBadge tone="pulse" dot>Vendas abertas</PBadge>
      <PBadge tone="violet">Premium · 4× sem juros</PBadge>
      <PBadge tone="cyan" dot>Ao vivo · 312 viewers</PBadge>
      <PBadge tone="amber">Restam 12</PBadge>
      <PBadge tone="red">Esgotado</PBadge>
      <PBadge tone="pink">Cashless ativo</PBadge>
      <PBadge tone="neutral">Em breve</PBadge>
    </div>
  );
}

// ─── COMPONENTS CARD ───
function ComponentsCard() {
  return (
    <div className="pp-card" style={{ width: 760 }}>
      <div className="pp-eyebrow">05 · Components</div>
      <h3 className="pp-h3" style={{ marginTop: 12 }}>Botões · Inputs · Badges · Glass cards</h3>

      {/* Buttons */}
      <div style={{ marginTop: 28 }}>
        <div className="pp-label" style={{ marginBottom: 14 }}>Buttons · variants × sizes</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <PButton variant="primary" size="lg" icon={<ArrowIcon/>}>Comprar ingresso</PButton>
            <PButton variant="primary">Confirmar</PButton>
            <PButton variant="primary" size="sm">Inscrever-se</PButton>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <PButton variant="glass" size="lg" icon={<ShareIcon/>}>Compartilhar</PButton>
            <PButton variant="glass">Cancelar</PButton>
            <PButton variant="glass" size="sm">Editar</PButton>
            <PButton variant="ghost">Ver detalhes</PButton>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <PButton variant="violet" size="lg">Acessar PulsePass +</PButton>
            <PButton variant="danger" size="md">Remover</PButton>
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div style={{ marginTop: 32 }}>
        <div className="pp-label" style={{ marginBottom: 14 }}>Inputs · glass</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <GInput placeholder="Buscar evento, artista, casa…"/>
          <GInput value="erick@smu.fun" icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="3"/><path d="m22 7-10 6L2 7"/>
            </svg>
          }/>
          <GInput placeholder="CPF · 000.000.000-00"/>
          <GInput value="R$ 87,50" icon={<span style={{ color: PP_GREEN_C, fontWeight: 700 }}>R$</span>}/>
        </div>
      </div>

      {/* Status badges */}
      <div style={{ marginTop: 32 }}>
        <div className="pp-label" style={{ marginBottom: 14 }}>Status & badges</div>
        <StatusRow/>
      </div>

      {/* Tiny components grid */}
      <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        {/* Toggle */}
        <div className="pp-glass" style={{ padding: 16, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Cashless</span>
          <div style={{ width: 44, height: 26, borderRadius: 999, background: PP_GREEN_C, position: 'relative', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2), 0 0 16px rgba(0,255,133,0.4)' }}>
            <div style={{ position: 'absolute', right: 3, top: 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}/>
          </div>
        </div>
        {/* Counter */}
        <div className="pp-glass" style={{ padding: 16, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Quantidade</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', color: '#fff', fontSize: 16, cursor: 'pointer' }}>−</button>
            <span style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 600, fontSize: 16, minWidth: 22, textAlign: 'center' }}>2</span>
            <button style={{ width: 30, height: 30, borderRadius: 8, background: PP_GREEN_C, border: 'none', color: '#003C1F', fontSize: 16, cursor: 'pointer', fontWeight: 700 }}>+</button>
          </div>
        </div>
        {/* Avatar stack */}
        <div className="pp-glass" style={{ padding: 16, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex' }}>
            {['#FF3D88', '#A78BFA', '#22D3EE', '#00FF85'].map((c, i) => (
              <div key={i} style={{ width: 30, height: 30, borderRadius: '50%', background: c, border: '2px solid #0B0D12', marginLeft: i ? -10 : 0 }}/>
            ))}
          </div>
          <span style={{ fontSize: 12, color: 'var(--pp-fg-3)', fontFamily: 'var(--pp-font-mono)' }}>+1.2k</span>
        </div>
      </div>

      {/* Big glass card example */}
      <div style={{ marginTop: 18 }}>
        <div className="pp-label" style={{ marginBottom: 14 }}>Glass card · in context</div>
        <div style={{
          position: 'relative',
          padding: 24,
          borderRadius: 22,
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.14)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 8px 24px rgba(0,0,0,0.4)',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(60% 80% at 0% 0%, ${PP_GREEN_C}40, transparent 70%), radial-gradient(60% 80% at 100% 100%, ${PP_VIOLET_C}40, transparent 70%)`, zIndex: -1 }}/>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <PBadge tone="pulse" dot>Vendas abertas</PBadge>
              <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 26, marginTop: 12, letterSpacing: '-0.02em' }}>Festival do Sol · São Paulo</div>
              <div style={{ fontSize: 13, color: 'var(--pp-fg-3)', marginTop: 4, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>SEX · 22 NOV · 22H</div>
            </div>
            <PButton variant="primary" size="md">Comprar</PButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icons
function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6"/>
    </svg>
  );
}
function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/>
    </svg>
  );
}

// Expose
Object.assign(window, { PButton, GInput, PBadge, StatusRow, ComponentsCard, ArrowIcon, ShareIcon });
