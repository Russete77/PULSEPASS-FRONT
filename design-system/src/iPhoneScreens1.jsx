// iPhoneScreens.jsx — 5 telas mobile do PulsePass
// Home · Evento · Checkout PIX · Meu Ingresso · Wallet Cashless

const G = '#00FF85', V = '#A78BFA', C = '#22D3EE', PINK = '#FF3D88';

// ─── Shared: aurora BG ───
function Aurora({ children, intensity = 1 }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: '#06070A',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: '-15%',
        background: `
          radial-gradient(45% 30% at 18% 12%, rgba(0,255,133,${0.35*intensity}), transparent 65%),
          radial-gradient(40% 30% at 82% 8%, rgba(167,139,250,${0.32*intensity}), transparent 65%),
          radial-gradient(50% 40% at 60% 90%, rgba(34,211,238,${0.22*intensity}), transparent 65%),
          radial-gradient(30% 30% at 8% 75%, rgba(255,61,136,${0.18*intensity}), transparent 65%)
        `,
        filter: 'blur(40px) saturate(160%)',
      }}/>
      {children}
    </div>
  );
}

// ─── Event flyer placeholder (gradient + glyph) ───
function Flyer({ hue = G, hue2 = V, title, tag, h = 200, layout = 'a' }) {
  const layouts = {
    a: `radial-gradient(80% 80% at 20% 20%, ${hue}, transparent 60%), radial-gradient(80% 80% at 80% 80%, ${hue2}, transparent 60%), #0a0a0c`,
    b: `linear-gradient(135deg, ${hue} 0%, ${hue2} 100%)`,
    c: `radial-gradient(circle at 50% 100%, ${hue}, transparent 70%), linear-gradient(180deg, #0a0a0c, ${hue2}40)`,
    d: `radial-gradient(120% 60% at 50% 0%, ${hue}, transparent 60%), #0a0a0c`,
  };
  return (
    <div style={{
      height: h,
      borderRadius: 18,
      background: layouts[layout],
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.08)',
      isolation: 'isolate',
    }}>
      {/* grain overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.7))' }}/>
      {tag && (
        <div style={{ position: 'absolute', top: 10, left: 10, padding: '4px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff' }}>{tag}</div>
      )}
      {title && (
        <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 18, lineHeight: 1.05, letterSpacing: '-0.02em', color: '#fff', textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>{title}</div>
      )}
    </div>
  );
}

// ─── iOS top status bar (dark) ───
function StatusBar() {
  return (
    <div style={{
      height: 44,
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      color: '#fff',
      fontSize: 15,
      fontFamily: '-apple-system, "SF Pro", system-ui',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      position: 'relative',
      zIndex: 10,
    }}>
      <span>9:41</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <svg width="17" height="11" viewBox="0 0 17 11"><rect x="0" y="6" width="3" height="5" rx="0.5" fill="#fff"/><rect x="4.5" y="4" width="3" height="7" rx="0.5" fill="#fff"/><rect x="9" y="2" width="3" height="9" rx="0.5" fill="#fff"/><rect x="13.5" y="0" width="3" height="11" rx="0.5" fill="#fff"/></svg>
        <svg width="25" height="12" viewBox="0 0 25 12"><rect x="0.5" y="0.5" width="21" height="11" rx="3" fill="none" stroke="#fff" strokeOpacity="0.4"/><rect x="2" y="2" width="18" height="8" rx="1.5" fill="#fff"/><rect x="22.5" y="3.5" width="1.5" height="5" rx="0.5" fill="#fff" opacity="0.4"/></svg>
      </div>
    </div>
  );
}

// ─── Floating liquid-glass tab bar ───
function TabBar({ active = 'home' }) {
  const tabs = [
    { id: 'home', label: 'Pulse', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14h3l2-6 3 12 2-8 2 4h4"/></svg>
    )},
    { id: 'tickets', label: 'Ingressos', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 10a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/><path d="M9 8v12"/></svg>
    )},
    { id: 'wallet', label: 'Carteira', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h14a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2Z"/><path d="M16 13h2"/></svg>
    )},
    { id: 'profile', label: 'Você', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
    )},
  ];
  return (
    <div style={{
      position: 'absolute',
      bottom: 14, left: 14, right: 14,
      height: 70,
      borderRadius: 30,
      background: 'rgba(20,22,30,0.55)',
      backdropFilter: 'blur(40px) saturate(180%)',
      WebkitBackdropFilter: 'blur(40px) saturate(180%)',
      border: '1px solid rgba(255,255,255,0.10)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.14), 0 12px 32px rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 10px',
      zIndex: 20,
    }}>
      {tabs.map(t => {
        const a = t.id === active;
        return (
          <div key={t.id} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            color: a ? G : 'rgba(255,255,255,0.55)',
            fontWeight: a ? 600 : 500, fontSize: 10,
          }}>
            <div style={{
              width: 44, height: 32, borderRadius: 14,
              display: 'grid', placeItems: 'center',
              background: a ? 'rgba(0,255,133,0.14)' : 'transparent',
              boxShadow: a ? 'inset 0 0 0 1px rgba(0,255,133,0.3)' : 'none',
            }}>{t.icon}</div>
            {t.label}
          </div>
        );
      })}
      {/* Home indicator */}
      <div style={{ position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)', width: 134, height: 5, borderRadius: 99, background: '#fff' }}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SCREEN 1 — HOME (Discover events)
// ─────────────────────────────────────────────────────────
function HomeScreen() {
  return (
    <div style={{ position: 'relative', width: 390, height: 844, overflow: 'hidden', borderRadius: 0, color: '#fff', fontFamily: 'var(--pp-font-body)' }}>
      <Aurora/>
      <div style={{ position: 'absolute', inset: 0, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <StatusBar/>
        {/* Header */}
        <div style={{ padding: '8px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Sex · 22 nov</div>
            <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 26, letterSpacing: '-0.02em', marginTop: 2 }}>
              Boa noite, <span style={{ fontFamily: 'var(--pp-font-serif)', fontStyle: 'italic', fontWeight: 400, color: G }}>Erick</span>
            </div>
          </div>
          <div style={{
            width: 42, height: 42, borderRadius: '50%',
            background: `linear-gradient(135deg, ${V}, ${PINK})`,
            display: 'grid', placeItems: 'center',
            border: '2px solid rgba(255,255,255,0.16)',
            fontWeight: 700, fontSize: 14,
          }}>E</div>
        </div>

        {/* Search */}
        <div style={{ padding: '16px 20px 0' }}>
          <div style={{
            height: 50, borderRadius: 999,
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.10)',
            display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Buscar evento, artista, casa…</span>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--pp-font-mono)', fontSize: 11 }}>
              <span style={{ padding: '3px 6px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6 }}>⌘K</span>
            </div>
          </div>
        </div>

        {/* Category chips */}
        <div style={{ padding: '16px 20px 0', display: 'flex', gap: 8, overflow: 'hidden' }}>
          {['Tudo', 'Hoje', 'Final de semana', 'Eletrônica', 'Sertanejo', 'Funk'].map((c, i) => (
            <div key={c} style={{
              padding: '8px 14px', borderRadius: 999, whiteSpace: 'nowrap',
              fontSize: 12, fontWeight: 600,
              background: i === 0 ? G : 'rgba(255,255,255,0.06)',
              color: i === 0 ? '#003C1F' : 'rgba(255,255,255,0.85)',
              border: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.1)',
            }}>{c}</div>
          ))}
        </div>

        {/* Featured big card */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{
            position: 'relative',
            borderRadius: 24,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            isolation: 'isolate',
          }}>
            <div style={{ height: 260, background: `radial-gradient(80% 80% at 30% 20%, ${G}, transparent 60%), radial-gradient(80% 80% at 80% 90%, ${V}, transparent 60%), #0a0a0c`, position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.85))' }}/>
              {/* Live badge */}
              <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.16)' }}>
                <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: PINK, animation: 'pp-pulse-ring 1.6s infinite' }}/>
                <span style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fff' }}>Esgotando · 87% vendido</span>
              </div>
              {/* Bottom info */}
              <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', color: G }}>SÁB · 30 NOV · 22H</div>
                <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 28, lineHeight: 1.05, letterSpacing: '-0.025em', marginTop: 6 }}>
                  Festival do Sol<br/>
                  <span style={{ fontFamily: 'var(--pp-font-serif)', fontStyle: 'italic', fontWeight: 400, color: G }}>edição equinócio</span>
                </div>
              </div>
            </div>
            {/* Footer info bar */}
            <div style={{ padding: 14, background: 'rgba(11,13,18,0.6)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>Audio Club · Vila Olímpia</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2, fontFamily: 'var(--pp-font-mono)' }}>desde R$ 90 · 4× sem juros</div>
              </div>
              <button style={{
                height: 40, padding: '0 18px', borderRadius: 999, border: 'none',
                background: `linear-gradient(180deg, #4DFFA8 0%, ${G} 100%)`,
                color: '#003C1F', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(0,255,133,0.4)',
              }}>Comprar →</button>
            </div>
          </div>
        </div>

        {/* Today section */}
        <div style={{ padding: '24px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', color: G }}>Hoje</div>
              <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em', marginTop: 2 }}>Acontece agora</div>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>Ver todos</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
            <Flyer hue={C} hue2={V} title="Boate Roxa" tag="22h" layout="a"/>
            <Flyer hue={PINK} hue2={'#FFB800'} title="Sunset Bar" tag="19h · livre" layout="b"/>
          </div>
        </div>

        <div style={{ height: 110 }}/>
      </div>
      <TabBar active="home"/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SCREEN 2 — EVENT DETAIL
// ─────────────────────────────────────────────────────────
function EventScreen() {
  return (
    <div style={{ position: 'relative', width: 390, height: 844, overflow: 'hidden', color: '#fff', fontFamily: 'var(--pp-font-body)' }}>
      {/* Hero image */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 460, background: `radial-gradient(80% 80% at 30% 20%, ${G}, transparent 60%), radial-gradient(80% 80% at 80% 90%, ${V}, transparent 60%), #0a0a0c` }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, #06070A 95%)' }}/>
      </div>

      <div style={{ position: 'absolute', inset: 0, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <StatusBar/>

        {/* Nav buttons */}
        <div style={{ padding: '8px 20px', display: 'flex', justifyContent: 'space-between' }}>
          {[
            <svg key="b" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>,
            <div key="r" style={{ display: 'flex', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.14)', display: 'grid', placeItems: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </div>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.14)', display: 'grid', placeItems: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
              </div>
            </div>
          ].map((el, i) => i === 0 ? (
            <div key={i} style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.14)', display: 'grid', placeItems: 'center' }}>{el}</div>
          ) : el)}
        </div>

        {/* Title block over hero */}
        <div style={{ padding: '180px 20px 0' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ padding: '5px 10px', borderRadius: 999, background: 'rgba(0,255,133,0.16)', border: '1px solid rgba(0,255,133,0.3)', color: G, fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Eletrônica</span>
            <span style={{ padding: '5px 10px', borderRadius: 999, background: 'rgba(167,139,250,0.16)', border: '1px solid rgba(167,139,250,0.3)', color: V, fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>+18</span>
            <span style={{ padding: '5px 10px', borderRadius: 999, background: 'rgba(34,211,238,0.16)', border: '1px solid rgba(34,211,238,0.3)', color: C, fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Cashless</span>
          </div>
          <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 34, lineHeight: 1, letterSpacing: '-0.03em', marginTop: 14 }}>
            Festival do Sol<br/>
            <span style={{ fontFamily: 'var(--pp-font-serif)', fontStyle: 'italic', fontWeight: 400, color: G, fontSize: 28 }}>edição equinócio</span>
          </div>
        </div>

        {/* Meta grid */}
        <div style={{ padding: '24px 20px 0' }}>
          <div style={{
            padding: 18, borderRadius: 20,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.10)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
            display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 14, rowGap: 12, alignItems: 'center',
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,255,133,0.12)', display: 'grid', placeItems: 'center', border: '1px solid rgba(0,255,133,0.2)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Quando</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>Sábado · 30 de novembro · 22h</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(167,139,250,0.12)', display: 'grid', placeItems: 'center', border: '1px solid rgba(167,139,250,0.2)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={V} strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Onde</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>Audio Club · Vila Olímpia, SP</div>
            </div>
          </div>
        </div>

        {/* Lineup */}
        <div style={{ padding: '18px 20px 0' }}>
          <div className="pp-label">Line-up</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            {['Anyma', 'Vintage Culture', 'Tóqio (b2b)', 'Marina Lima', 'KVSH'].map((a, i) => (
              <span key={a} style={{ padding: '8px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 12, fontWeight: 500 }}>{a}</span>
            ))}
          </div>
        </div>

        {/* Lote selector */}
        <div style={{ padding: '20px 20px 0' }}>
          <div className="pp-label">Selecione o lote</div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { name: 'Pista · 2º lote', price: 'R$ 90,00', sub: '+ R$ 9 taxa', tag: '12 restantes', tagTone: 'amber', sel: false },
              { name: 'Pista Premium', price: 'R$ 180,00', sub: 'área elevada + open bar 1h', tag: 'Premium', tagTone: 'violet', sel: true },
              { name: 'Camarote VIP', price: 'R$ 380,00', sub: 'mesa para 4 + welcome drink', tag: 'Esgotado', tagTone: 'red', sel: false, dis: true },
            ].map(l => (
              <div key={l.name} style={{
                padding: 16, borderRadius: 16,
                background: l.sel ? 'rgba(0,255,133,0.06)' : 'rgba(255,255,255,0.04)',
                border: l.sel ? '1.5px solid rgba(0,255,133,0.5)' : '1px solid rgba(255,255,255,0.08)',
                opacity: l.dis ? 0.5 : 1,
                position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: l.sel ? '0 0 24px rgba(0,255,133,0.2)' : 'none',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{l.name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>{l.sub}</div>
                  <div style={{ marginTop: 8, padding: '3px 8px', borderRadius: 999, fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'inline-block',
                    background: l.tagTone === 'amber' ? 'rgba(255,184,0,0.14)' : l.tagTone === 'violet' ? 'rgba(167,139,250,0.16)' : 'rgba(255,59,48,0.14)',
                    color: l.tagTone === 'amber' ? '#FFD15C' : l.tagTone === 'violet' ? V : '#FF7A75',
                  }}>{l.tag}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 18, color: l.sel ? G : '#fff' }}>{l.price}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--pp-font-mono)' }}>{l.sub.includes('taxa') ? '' : ''}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 120 }}/>
      </div>

      {/* Bottom CTA bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '14px 20px 30px',
        background: 'linear-gradient(180deg, transparent, rgba(6,7,10,0.95) 30%)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>1 ingresso · subtotal</div>
          <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 22, marginTop: 2 }}>R$ <span style={{ color: G }}>180,00</span></div>
        </div>
        <button style={{
          flex: 1, maxWidth: 220, height: 54, borderRadius: 999, border: 'none',
          background: `linear-gradient(180deg, #4DFFA8 0%, ${G} 100%)`,
          color: '#003C1F', fontWeight: 700, fontSize: 15,
          boxShadow: '0 8px 28px rgba(0,255,133,0.4), inset 0 1px 0 rgba(255,255,255,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>Continuar
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen, EventScreen, Flyer, Aurora, StatusBar, TabBar });
