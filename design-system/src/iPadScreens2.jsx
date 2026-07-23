// iPadScreens2.jsx — Door Scanner (AZList) · Guest List Manager · Event Wizard

const G6 = '#00FF85', V6 = '#A78BFA', C6 = '#22D3EE', PINK6 = '#FF3D88', AMBER6 = '#FFB800';

// ─────────────────────────────────────────────────────────
// SCREEN H — DOOR POLICE / CHECK-IN SCANNER (AZList core)
// ─────────────────────────────────────────────────────────
function DoorScannerScreen() {
  const recent = [
    { n: 'Caio Ramos', t: '23:47:12', s: 'ok', sector: 'Premium', list: 'Lia (promoter)' },
    { n: 'Bia Carvalho', t: '23:46:51', s: 'ok', sector: 'Pista', list: 'Lia (promoter)' },
    { n: 'João Mendonça', t: '23:46:28', s: 'warn', warning: 'aniversariante', sector: 'VIP', list: 'Cortesia' },
    { n: 'Token expirado', t: '23:45:09', s: 'fail', sector: '—', list: 'PSP-3K2L · rejeitado' },
    { n: 'Lia Coelho', t: '23:44:55', s: 'ok', sector: 'Staff', list: 'Equipe' },
    { n: 'Marina Lopes', t: '23:44:31', s: 'ok', sector: 'Pista', list: 'Self-buy' },
    { n: 'Pedro Almeida', t: '23:43:18', s: 'ok', sector: 'Staff', list: 'Equipe' },
  ];
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', color: '#fff', fontFamily: 'var(--pp-font-body)', background: '#06070A' }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>

        {/* Left: Scanner */}
        <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ padding: '8px 14px 8px 10px', borderRadius: 999, background: 'rgba(0,255,133,0.10)', border: '1px solid rgba(0,255,133,0.25)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: G6, boxShadow: '0 0 8px rgba(0,255,133,0.8)' }}/>
              <span style={{ fontSize: 11, fontFamily: 'var(--pp-font-mono)', color: G6, fontWeight: 600, letterSpacing: '0.05em' }}>PORTARIA 1 · OPERANDO</span>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ padding: '6px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.6)' }}>Offline</span>
                <div style={{ width: 28, height: 16, borderRadius: 99, background: G6, position: 'relative' }}>
                  <div style={{ position: 'absolute', right: 2, top: 2, width: 12, height: 12, borderRadius: '50%', background: '#fff' }}/>
                </div>
              </div>
              <div style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 16, fontWeight: 700, padding: '8px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>23:47</div>
            </div>
          </div>

          {/* Scanner viewport */}
          <div style={{ flex: 1, position: 'relative', borderRadius: 24, overflow: 'hidden', background: '#0a0a0c', border: '1px solid rgba(255,255,255,0.08)' }}>
            {/* Simulated camera view — dark night gradient with QR floating */}
            <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(40% 40% at 50% 40%, rgba(167,139,250,0.15), transparent 70%), radial-gradient(50% 60% at 50% 100%, rgba(0,255,133,0.10), transparent 70%), #08080a` }}/>

            {/* Simulated blurry phone with QR */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-3deg)', width: 220, height: 220, borderRadius: 24, background: '#fff', padding: 16, boxShadow: '0 30px 60px rgba(0,0,0,0.6)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(17, 1fr)', gap: 1.5, width: '100%', height: '100%' }}>
                {Array.from({ length: 17 * 17 }).map((_, i) => {
                  const x = i % 17, y = Math.floor(i / 17);
                  const inFinder = (x < 5 && y < 5) || (x > 11 && y < 5) || (x < 5 && y > 11);
                  let fill = 'transparent';
                  if (inFinder) {
                    const fx = x < 5 ? x : x - 12;
                    const fy = y < 5 ? y : y - 12;
                    const ring = fx === 0 || fx === 4 || fy === 0 || fy === 4;
                    const center = fx === 2 && fy === 2;
                    if (ring || center) fill = '#06070A';
                  } else if ((x * 41 + y * 23 + 7) % 100 > 50) {
                    fill = '#06070A';
                  }
                  return <div key={i} style={{ background: fill }}/>;
                })}
              </div>
            </div>

            {/* Scanner overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }}/>
            {/* Cutout */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: 280, height: 280,
              borderRadius: 24,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.55), inset 0 0 0 2px rgba(0,255,133,0.5)',
            }}>
              {/* Corner brackets */}
              {[
                { top: -2, left: -2, br: '24px 0 0 0' },
                { top: -2, right: -2, br: '0 24px 0 0' },
                { bottom: -2, left: -2, br: '0 0 0 24px' },
                { bottom: -2, right: -2, br: '0 0 24px 0' },
              ].map((p, i) => (
                <div key={i} style={{
                  position: 'absolute', ...p, width: 40, height: 40,
                  border: `4px solid ${G6}`,
                  borderRadius: p.br,
                  boxShadow: `0 0 24px ${G6}80`,
                  ...(p.top !== undefined ? { borderBottom: 'none' } : { borderTop: 'none' }),
                  ...(p.left !== undefined ? { borderRight: 'none' } : { borderLeft: 'none' }),
                }}/>
              ))}
              {/* Scan line */}
              <div style={{
                position: 'absolute', left: 12, right: 12, top: '40%',
                height: 2, background: `linear-gradient(90deg, transparent, ${G6}, transparent)`,
                boxShadow: `0 0 24px ${G6}`,
              }}/>
            </div>

            {/* Top instruction */}
            <div style={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', padding: '10px 20px', borderRadius: 999, background: 'rgba(11,13,18,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.14)' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Aponte para o QR do ingresso</span>
            </div>

            {/* Manual entry */}
            <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 10 }}>
              <button style={{ padding: '12px 22px', borderRadius: 14, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                Buscar por nome / CPF
              </button>
              <button style={{ padding: '12px 22px', borderRadius: 14, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(20px)' }}>
                Modo lote
              </button>
            </div>
          </div>

          {/* KPI strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { l: 'Check-ins', v: '1.872', d: '85,7%', c: G6 },
              { l: 'Pendentes', v: '312', d: 'ainda fora', c: AMBER6 },
              { l: 'Rejeitados', v: '14', d: 'fraude/expirado', c: PINK6 },
              { l: 'Por minuto', v: '24', d: 'tx média', c: C6 },
            ].map(k => (
              <div key={k.l} style={{ padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>{k.l}</div>
                <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 22, color: k.c, marginTop: 4 }}>{k.v}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{k.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — last check-in detail + log */}
        <div style={{
          width: 380, borderLeft: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(11,13,18,0.5)', backdropFilter: 'blur(20px)',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Last check-in (big card) */}
          <div style={{ padding: 20, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: G6 }}>✓ Aprovado · agora</div>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 72, height: 72, borderRadius: 22, background: `linear-gradient(135deg, ${G6}, ${C6})`,
                display: 'grid', placeItems: 'center', fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 28, color: '#003C1F',
                boxShadow: '0 0 30px rgba(0,255,133,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
              }}>C</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em' }}>Caio Ramos</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2, fontFamily: 'var(--pp-font-mono)' }}>CPF 348.***.***-22 · 27 anos</div>
              </div>
            </div>

            <div style={{ marginTop: 14, padding: 12, borderRadius: 12, background: 'rgba(0,255,133,0.06)', border: '1px solid rgba(0,255,133,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <span style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.06em' }}>SETOR</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>Premium · mesa 04</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 8 }}>
                <span style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.06em' }}>LISTA</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>Lia (promoter)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 8 }}>
                <span style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.06em' }}>TOKEN</span>
                <span style={{ color: G6, fontFamily: 'var(--pp-font-mono)', fontWeight: 600 }}>PSP-9C3K · válido</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 8 }}>
                <span style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.06em' }}>HISTÓRICO</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>11º evento PulsePass</span>
              </div>
            </div>

            <div style={{ marginTop: 12, padding: 10, borderRadius: 10, background: 'rgba(255,184,0,0.10)', border: '1px solid rgba(255,184,0,0.3)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={AMBER6} strokeWidth="2.5"><path d="M8.5 14.5c1 .9 2 1.5 3.5 1.5s2.5-.6 3.5-1.5"/><path d="M9 9h.01M15 9h.01"/><circle cx="12" cy="12" r="10"/></svg>
              <span style={{ fontSize: 11, color: AMBER6, fontWeight: 600 }}>Aniversariante · ofereça shot da casa</span>
            </div>
          </div>

          {/* Log */}
          <div style={{ flex: 1, padding: '14px 20px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>Últimos 7 check-ins</div>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--pp-font-mono)' }}>auto-refresh</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {recent.map((r, i) => (
                <div key={i} style={{ padding: '10px 0', borderBottom: i < recent.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: 8,
                    background: r.s === 'ok' ? `rgba(0,255,133,0.14)` : r.s === 'warn' ? `rgba(255,184,0,0.14)` : `rgba(255,59,48,0.14)`,
                    border: `1px solid ${r.s === 'ok' ? 'rgba(0,255,133,0.35)' : r.s === 'warn' ? 'rgba(255,184,0,0.35)' : 'rgba(255,59,48,0.35)'}`,
                    display: 'grid', placeItems: 'center', flexShrink: 0,
                  }}>
                    {r.s === 'ok' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={G6} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    {r.s === 'warn' && <span style={{ fontSize: 14, color: AMBER6 }}>!</span>}
                    {r.s === 'fail' && <span style={{ fontSize: 12, color: PINK6 }}>×</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: r.s === 'fail' ? PINK6 : '#fff' }}>{r.n}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--pp-font-mono)', marginTop: 2 }}>{r.list} · {r.sector}</div>
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--pp-font-mono)' }}>{r.t}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SCREEN I — GUEST LIST MANAGER (Producer view of AZList)
// ─────────────────────────────────────────────────────────
function GuestListManagerScreen() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', color: '#fff', fontFamily: 'var(--pp-font-body)', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(50% 40% at 20% 10%, rgba(167,139,250,0.08), transparent 60%), #06070A', zIndex: 0 }}/>

      {/* Mini sidebar (collapsed) */}
      <div style={{ width: 72, padding: '20px 12px', borderRight: '1px solid rgba(255,255,255,0.06)', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <svg width="36" height="36" viewBox="0 0 64 64" style={{ marginBottom: 8 }}>
          <circle cx="32" cy="32" r="22" fill="none" stroke={G6} strokeWidth="2"/>
          <path d="M14 32 L22 32 L26 24 L30 40 L34 22 L38 38 L42 32 L50 32" fill="none" stroke={G6} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {[
          { i: '◐' }, { i: '▦' }, { i: '⤿' }, { i: '☷', active: true }, { i: '◉' }, { i: '◈' },
        ].map((it, i) => (
          <div key={i} style={{
            width: 44, height: 44, borderRadius: 12,
            display: 'grid', placeItems: 'center',
            background: it.active ? 'rgba(167,139,250,0.14)' : 'transparent',
            border: it.active ? '1px solid rgba(167,139,250,0.3)' : '1px solid transparent',
            color: it.active ? V6 : 'rgba(255,255,255,0.55)',
            fontSize: 18, fontWeight: 600, cursor: 'pointer',
          }}>{it.i}</div>
        ))}
      </div>

      <div style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: V6 }}>Guest List</div>
            <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em', marginTop: 2 }}>Festival do Sol · 30 nov</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ padding: '10px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              Excel
            </button>
            <button style={{ padding: '10px 16px', borderRadius: 12, background: `linear-gradient(180deg, #C4B5FD, ${V6})`, color: '#1A0040', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 16px rgba(167,139,250,0.4)' }}>
              + Adicionar convidados
            </button>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Lists column */}
          <div style={{ width: 280, padding: '18px 16px', borderRight: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 10 }}>Listas · 8</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { n: 'Todas', c: 1247, p: 89, all: true },
                { n: 'Lia Coelho', c: 247, p: 47, tone: V6, active: true, kind: 'promoter' },
                { n: 'Marcos S.', c: 189, p: 52, tone: PINK6, kind: 'promoter' },
                { n: 'Júlia Reis', c: 124, p: 38, tone: C6, kind: 'promoter' },
                { n: 'Cortesia', c: 80, p: 12, tone: AMBER6, kind: 'system' },
                { n: 'Equipe', c: 24, p: 100, tone: G6, kind: 'system' },
                { n: 'Imprensa', c: 14, p: 14, tone: '#fff', kind: 'system' },
                { n: 'Aniversariantes', c: 6, p: 100, tone: PINK6, kind: 'special' },
              ].map((l, i) => (
                <div key={i} style={{
                  padding: '10px 12px', borderRadius: 12,
                  background: l.active ? 'rgba(167,139,250,0.12)' : 'transparent',
                  border: l.active ? '1px solid rgba(167,139,250,0.3)' : '1px solid transparent',
                  display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                }}>
                  {l.tone ? (
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: `${l.tone}25`, border: `1px solid ${l.tone}50`, display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, color: l.tone }}>
                      {l.kind === 'promoter' ? l.n[0] : l.kind === 'system' ? '#' : '★'}
                    </div>
                  ) : (
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.06)', display: 'grid', placeItems: 'center', fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>☷</div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: l.active ? 600 : 500, color: l.active ? V6 : '#fff' }}>{l.n}</div>
                    <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{l.c} conv · {l.p}% check</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detail */}
          <div style={{ flex: 1, padding: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Promoter header */}
            <div style={{
              padding: 18, borderRadius: 18,
              background: `linear-gradient(135deg, rgba(167,139,250,0.18), rgba(255,61,136,0.10))`,
              border: '1px solid rgba(167,139,250,0.3)',
              backdropFilter: 'blur(20px)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.14)',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${V6}, ${PINK6})`, display: 'grid', placeItems: 'center', fontSize: 22, fontWeight: 700 }}>L</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: V6 }}>Promoter · Tier 3</div>
                <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em', marginTop: 2 }}>Lia Coelho</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 4, fontFamily: 'var(--pp-font-mono)' }}>pulsepass.app/lia · comissão 12%</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, textAlign: 'center' }}>
                {[
                  { l: 'Inscritos', v: '247', c: V6 },
                  { l: 'Check', v: '47', c: G6 },
                  { l: 'R$ comissão', v: 'R$ 2.8k', c: PINK6 },
                ].map(s => (
                  <div key={s.l}>
                    <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 18, color: s.c }}>{s.v}</div>
                    <div style={{ fontSize: 9, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Toolbar */}
            <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{
                flex: 1, height: 40, padding: '0 14px', borderRadius: 12,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Buscar nome, CPF, telefone…</span>
              </div>
              {['Todos · 247', 'Check-in · 47', 'No-show · 0'].map((t, i) => (
                <div key={t} style={{
                  padding: '0 14px', height: 40, borderRadius: 12, display: 'flex', alignItems: 'center',
                  fontSize: 12, fontWeight: 600,
                  background: i === 0 ? 'rgba(167,139,250,0.14)' : 'rgba(255,255,255,0.04)',
                  border: i === 0 ? '1px solid rgba(167,139,250,0.3)' : '1px solid rgba(255,255,255,0.08)',
                  color: i === 0 ? V6 : 'rgba(255,255,255,0.7)',
                }}>{t}</div>
              ))}
            </div>

            {/* Table */}
            <div style={{ flex: 1, marginTop: 14, overflow: 'hidden', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
              {/* Header row */}
              <div style={{ padding: '10px 16px', display: 'grid', gridTemplateColumns: '24px 1.5fr 1fr 0.8fr 0.8fr 0.6fr', gap: 10, alignItems: 'center', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, border: '1.5px solid rgba(255,255,255,0.3)' }}/>
                {['Nome', 'Contato', 'Setor', 'Inscrito', 'Status'].map(h => (
                  <div key={h} style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>{h}</div>
                ))}
              </div>
              {[
                { n: 'Bianca Carvalho', e: '+55 11 9 8412-•••', cpf: '231.***.***-04', s: 'Pista', d: '23h12', st: 'ok' },
                { n: 'João Mendonça (+1)', e: '+55 11 9 7283-•••', cpf: '188.***.***-91', s: 'Premium', d: '22h47', st: 'in' },
                { n: 'Caio Ramos 🎂', e: '+55 21 9 9182-•••', cpf: '348.***.***-22', s: 'VIP', d: '22h18', st: 'in' },
                { n: 'Marina Lopes', e: '+55 11 9 8841-•••', cpf: '417.***.***-65', s: 'Pista', d: '21h52', st: 'ok' },
                { n: 'Pedro Almeida', e: '+55 11 9 4127-•••', cpf: '529.***.***-08', s: 'Staff', d: '20h12', st: 'in' },
                { n: 'Júlia Reis', e: '+55 11 9 9018-•••', cpf: '671.***.***-44', s: 'Pista', d: '19h38', st: 'ok' },
                { n: 'Tomás Vieira', e: '+55 21 9 7702-•••', cpf: '893.***.***-12', s: 'Premium', d: '19h05', st: 'ok' },
                { n: 'Fernanda Lima', e: '+55 31 9 8413-•••', cpf: '102.***.***-77', s: 'Pista', d: '18h21', st: 'no' },
              ].map((g, i) => (
                <div key={i} style={{ padding: '12px 16px', display: 'grid', gridTemplateColumns: '24px 1.5fr 1fr 0.8fr 0.8fr 0.6fr', gap: 10, alignItems: 'center', borderBottom: i < 7 ? '1px solid rgba(255,255,255,0.04)' : 'none', background: i % 2 === 1 ? 'rgba(255,255,255,0.015)' : 'transparent' }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, border: '1.5px solid rgba(255,255,255,0.2)' }}/>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{g.n}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--pp-font-mono)', marginTop: 2 }}>{g.cpf}</div>
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--pp-font-mono)' }}>{g.e}</div>
                  <div>
                    <PBadge tone={g.s === 'VIP' ? 'pink' : g.s === 'Premium' ? 'violet' : g.s === 'Staff' ? 'amber' : 'pulse'}>{g.s}</PBadge>
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--pp-font-mono)' }}>{g.d}</div>
                  <div>
                    {g.st === 'in' && <PBadge tone="pulse" dot>checked-in</PBadge>}
                    {g.st === 'ok' && <PBadge tone="neutral">aguarda</PBadge>}
                    {g.st === 'no' && <PBadge tone="red">no-show</PBadge>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SCREEN J — EVENT WIZARD (creation flow)
// ─────────────────────────────────────────────────────────
function EventWizardScreen() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', color: '#fff', fontFamily: 'var(--pp-font-body)', background: '#06070A' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(40% 30% at 80% 10%, rgba(34,211,238,0.10), transparent 60%), radial-gradient(40% 30% at 20% 80%, rgba(0,255,133,0.10), transparent 60%), #06070A' }}/>

      <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
        {/* Sidebar progress */}
        <div style={{ width: 320, padding: '24px 24px', borderRight: '1px solid rgba(255,255,255,0.06)', position: 'relative', zIndex: 1, background: 'rgba(11,13,18,0.4)', backdropFilter: 'blur(20px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <svg width="32" height="32" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="22" fill="none" stroke={G6} strokeWidth="2.5"/>
              <path d="M14 32 L22 32 L26 24 L30 40 L34 22 L38 38 L42 32 L50 32" fill="none" stroke={G6} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 16 }}>Novo evento</div>
              <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>passo 3 de 6</div>
            </div>
          </div>

          <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 22 }}>
            <div style={{ width: '50%', height: '100%', background: `linear-gradient(90deg, ${G6}, ${C6})`, boxShadow: `0 0 12px ${G6}80` }}/>
          </div>

          {[
            { n: 'Básicos', d: 'Nome, data, local', done: true },
            { n: 'Identidade', d: 'Banner, descrição, lineup', done: true },
            { n: 'Ingressos', d: 'Lotes, preços, capacidades', active: true },
            { n: 'Guest list', d: 'Promoters, comissões, listas' },
            { n: 'Cashless', d: 'PDVs, produtos, NFC' },
            { n: 'Revisar & publicar', d: 'Pré-visualização' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', position: 'relative' }}>
              {i < 5 && <div style={{ position: 'absolute', left: 13, top: 36, bottom: -4, width: 1.5, background: s.done ? G6 : 'rgba(255,255,255,0.08)' }}/>}
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: s.done ? G6 : s.active ? 'rgba(0,255,133,0.14)' : 'rgba(255,255,255,0.05)',
                border: s.done ? 'none' : s.active ? `1.5px solid ${G6}` : '1px solid rgba(255,255,255,0.1)',
                display: 'grid', placeItems: 'center',
                boxShadow: s.active ? `0 0 16px ${G6}60` : 'none',
                color: s.done ? '#003C1F' : s.active ? G6 : 'rgba(255,255,255,0.4)',
                fontSize: 11, fontWeight: 700,
              }}>
                {s.done ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> : i + 1}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: s.active ? G6 : s.done ? '#fff' : 'rgba(255,255,255,0.5)' }}>{s.n}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{s.d}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main form */}
        <div style={{ flex: 1, padding: '32px 40px', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
          <div className="pp-eyebrow" style={{ color: G6 }}>03 · Ingressos</div>
          <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 32, letterSpacing: '-0.025em', marginTop: 8 }}>
            Como você vai <span style={{ fontFamily: 'var(--pp-font-serif)', fontStyle: 'italic', fontWeight: 400, color: G6 }}>vender?</span>
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 8, maxWidth: 560 }}>
            Crie lotes com regras automáticas. PulsePass faz a virada de lote sozinho quando o anterior esgota ou a data chega.
          </div>

          {/* Lots */}
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { n: '1º lote · Pista', price: 70, qty: 600, sold: 600, status: 'esgotado', tone: G6, done: true },
              { n: '2º lote · Pista', price: 90, qty: 600, sold: 312, status: 'ativo', tone: G6, active: true },
              { n: 'Pista Premium', price: 180, qty: 400, sold: 89, status: 'ativo', tone: V6, active: true },
              { n: 'Camarote VIP', price: 380, qty: 80, sold: 76, status: 'restam 4', tone: PINK6 },
            ].map(l => (
              <div key={l.n} style={{
                padding: 18, borderRadius: 18,
                background: l.active ? `${l.tone}10` : 'rgba(255,255,255,0.03)',
                border: l.active ? `1.5px solid ${l.tone}50` : '1px solid rgba(255,255,255,0.08)',
                opacity: l.done ? 0.6 : 1,
                display: 'flex', alignItems: 'center', gap: 18,
              }}>
                <div style={{ width: 6, height: 56, borderRadius: 3, background: l.tone, opacity: 0.8 }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 16, fontWeight: 700 }}>{l.n}</span>
                    {l.done && <PBadge tone="neutral">finalizado</PBadge>}
                    {l.active && <PBadge tone={l.tone === V6 ? 'violet' : l.tone === PINK6 ? 'pink' : 'pulse'} dot>{l.status}</PBadge>}
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div>
                      <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>Preço</div>
                      <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 16 }}>R$ {l.price}</div>
                    </div>
                    <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)' }}/>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>Vendidos · {l.sold}/{l.qty}</div>
                      <div style={{ marginTop: 4, height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', maxWidth: 280 }}>
                        <div style={{ width: `${(l.sold / l.qty) * 100}%`, height: '100%', background: l.tone, boxShadow: `0 0 8px ${l.tone}80` }}/>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  </button>
                </div>
              </div>
            ))}
            {/* Add lot */}
            <div style={{ height: 56, borderRadius: 18, border: '1px dashed rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Adicionar lote · auto-virada por capacidade ou data
            </div>
          </div>

          {/* Suggestions card */}
          <div style={{ marginTop: 18, padding: 16, borderRadius: 16, background: `linear-gradient(135deg, rgba(34,211,238,0.10), rgba(167,139,250,0.06))`, border: '1px solid rgba(34,211,238,0.25)', display: 'flex', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.3)', display: 'grid', placeItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C6} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Sugestão Pulse AI</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4, lineHeight: 1.4 }}>
                Eventos similares da Audio Club venderam <b>+34%</b> com lote "Solo Mulheres" a R$ 60 nos 7 dias antes. <span style={{ color: C6, fontWeight: 600 }}>Criar?</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom action bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 320, right: 0, padding: '14px 40px', background: 'linear-gradient(180deg, transparent, rgba(6,7,10,0.95) 30%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button style={{ padding: '12px 22px', borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>← Identidade</button>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ padding: '12px 22px', borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Salvar rascunho</button>
            <button style={{
              padding: '12px 28px', borderRadius: 14, border: 'none',
              background: `linear-gradient(180deg, #4DFFA8, ${G6})`,
              color: '#003C1F', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 8px 24px rgba(0,255,133,0.35), inset 0 1px 0 rgba(255,255,255,0.4)',
            }}>
              Próximo · Guest list
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DoorScannerScreen, GuestListManagerScreen, EventWizardScreen });
