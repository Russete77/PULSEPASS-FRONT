// iPhoneScreens4.jsx — Recharge · Order Ahead · Live Map · Notifications

const G5 = '#00FF85', V5 = '#A78BFA', C5 = '#22D3EE', PINK5 = '#FF3D88', AMBER5 = '#FFB800';

// ─────────────────────────────────────────────────────────
// SCREEN 10 — RECHARGE CASHLESS
// ─────────────────────────────────────────────────────────
function RechargeScreen() {
  const amounts = [30, 50, 100, 150, 200, 300];
  const selected = 100;

  return (
    <div style={{ position: 'relative', width: 390, height: 844, overflow: 'hidden', color: '#fff', fontFamily: 'var(--pp-font-body)' }}>
      <Aurora intensity={0.7}/>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        <StatusBar/>

        {/* Nav */}
        <div style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.10)', display: 'grid', placeItems: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Recarregar carteira</div>
          <div style={{ width: 38, height: 38 }}/>
        </div>

        {/* Current balance pill */}
        <div style={{ padding: '14px 20px 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            padding: '8px 16px', borderRadius: 999,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.6)' }}>Saldo atual</span>
            <span style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 14, color: G5 }}>R$ 187,50</span>
          </div>
        </div>

        {/* Big amount display */}
        <div style={{ padding: '24px 20px 0', textAlign: 'center' }}>
          <div className="pp-eyebrow" style={{ color: G5 }}>Quanto carregar?</div>
          <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 72, letterSpacing: '-0.04em', marginTop: 8, display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8, color: '#fff' }}>
            <span style={{ fontSize: 32, color: 'rgba(255,255,255,0.55)' }}>R$</span>
            <span style={{ textShadow: `0 0 40px ${G5}60` }}>{selected}</span>
            <span style={{ fontSize: 32, color: 'rgba(255,255,255,0.55)' }}>,00</span>
          </div>
          <div style={{ marginTop: 6, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
            Novo saldo: <span style={{ color: G5, fontWeight: 600 }}>R$ 287,50</span>
          </div>
        </div>

        {/* Amount chips grid */}
        <div style={{ padding: '24px 20px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {amounts.map(a => {
              const sel = a === selected;
              return (
                <button key={a} style={{
                  height: 60, borderRadius: 16,
                  background: sel ? 'rgba(0,255,133,0.10)' : 'rgba(255,255,255,0.04)',
                  border: sel ? '1.5px solid rgba(0,255,133,0.6)' : '1px solid rgba(255,255,255,0.10)',
                  fontFamily: 'var(--pp-font-mono)', fontSize: 18, fontWeight: 700,
                  color: sel ? G5 : '#fff',
                  cursor: 'pointer',
                  boxShadow: sel ? '0 0 24px rgba(0,255,133,0.2), inset 0 1px 0 rgba(255,255,255,0.08)' : 'inset 0 1px 0 rgba(255,255,255,0.04)',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  R$ {a}
                  {a === 100 && (
                    <span style={{ position: 'absolute', top: 4, right: 4, fontSize: 8, padding: '2px 5px', borderRadius: 999, background: V5, color: '#1A0040', fontWeight: 700, letterSpacing: '0.05em' }}>+ R$ 10</span>
                  )}
                </button>
              );
            })}
          </div>
          {/* Custom amount */}
          <div style={{
            marginTop: 10, height: 50, borderRadius: 14,
            background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Valor customizado
          </div>
        </div>

        {/* Method */}
        <div style={{ padding: '20px 20px 0' }}>
          <div className="pp-label">Forma de pagamento</div>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { name: 'Pix · instantâneo', tag: 'Recomendado', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={G5} strokeWidth="2.5"><path d="m2 12 5-5 5 5-5 5z"/><path d="m12 2 5 5-5 5-5-5z"/><path d="m22 12-5 5-5-5 5-5z"/><path d="m12 22-5-5 5-5 5 5z"/></svg>, sel: true, tone: G5 },
              { name: 'Cartão · 1× R$ 100', tag: '4× s/ juros disp.', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>, sel: false },
            ].map(m => (
              <div key={m.name} style={{
                padding: 14, borderRadius: 14,
                background: m.sel ? `rgba(${m.tone === G5 ? '0,255,133' : '255,255,255'},${m.sel ? 0.08 : 0.04})` : 'rgba(255,255,255,0.04)',
                border: m.sel ? `1.5px solid ${m.tone}` : '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', gap: 12,
                boxShadow: m.sel ? `0 0 20px ${m.tone}30` : 'none',
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: m.sel ? `${m.tone}20` : 'rgba(255,255,255,0.06)', display: 'grid', placeItems: 'center' }}>
                  {m.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{m.tag}</div>
                </div>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  border: m.sel ? `6px solid ${m.tone}` : '1.5px solid rgba(255,255,255,0.25)',
                  background: m.sel ? '#06070A' : 'transparent',
                  boxSizing: 'border-box',
                }}/>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1 }}/>

        {/* CTA */}
        <div style={{ padding: '14px 20px 30px' }}>
          <button style={{
            width: '100%', height: 56, borderRadius: 18, border: 'none',
            background: `linear-gradient(180deg, #4DFFA8, ${G5})`,
            color: '#003C1F', fontWeight: 700, fontSize: 15,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 22px', cursor: 'pointer',
            boxShadow: '0 12px 32px rgba(0,255,133,0.4), inset 0 1px 0 rgba(255,255,255,0.4)',
          }}>
            <span>Gerar Pix R$ 100,00</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SCREEN 11 — ORDER AHEAD (Super app innovation)
// ─────────────────────────────────────────────────────────
function OrderAheadScreen() {
  return (
    <div style={{ position: 'relative', width: 390, height: 844, overflow: 'hidden', color: '#fff', fontFamily: 'var(--pp-font-body)' }}>
      <Aurora intensity={0.5}/>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        <StatusBar/>

        {/* Header */}
        <div style={{ padding: '8px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="pp-eyebrow">Pedido pelo app</div>
            <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 26, letterSpacing: '-0.02em', marginTop: 2 }}>
              Zero fila <span style={{ fontFamily: 'var(--pp-font-serif)', fontStyle: 'italic', fontWeight: 400, color: G5 }}>no bar.</span>
            </div>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.10)', display: 'grid', placeItems: 'center' }}>
            <span style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 11, color: G5 }}>R$187</span>
          </div>
        </div>

        {/* Bar selector */}
        <div style={{ padding: '16px 20px 0', display: 'flex', gap: 8, overflow: 'hidden' }}>
          {[
            { l: 'Bar Central', q: '4 min', active: true },
            { l: 'Bar VIP', q: '1 min', vip: true },
            { l: 'Food Truck', q: '8 min' },
            { l: 'Bar Norte', q: 'fechado' },
          ].map((b, i) => (
            <div key={b.l} style={{
              padding: '10px 14px', borderRadius: 14, whiteSpace: 'nowrap',
              background: b.active ? 'rgba(0,255,133,0.10)' : 'rgba(255,255,255,0.04)',
              border: b.active ? '1.5px solid rgba(0,255,133,0.4)' : '1px solid rgba(255,255,255,0.08)',
              display: 'flex', flexDirection: 'column', gap: 2,
              minWidth: 100,
              opacity: b.q === 'fechado' ? 0.4 : 1,
            }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{b.l}</div>
              <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', color: b.active ? G5 : 'rgba(255,255,255,0.55)' }}>
                {b.vip && '★ '}{b.q}
              </div>
            </div>
          ))}
        </div>

        {/* Hot now */}
        <div style={{ padding: '16px 20px 0' }}>
          <div style={{ fontSize: 11, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: PINK5, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="pp-pulse-dot" style={{ width: 6, height: 6, background: PINK5 }}/>
            Bombando agora
          </div>
          <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {[
              { n: 'Combo Vodka + RedBull', p: 42, hue: PINK5, hue2: AMBER5, icon: '🥤', tag: '+ vendido' },
              { n: 'Caipirinha de limão', p: 24, hue: G5, hue2: C5, icon: '🍹', tag: 'clássico' },
            ].map(it => (
              <div key={it.n} style={{
                padding: 12, borderRadius: 18,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  height: 80, borderRadius: 12,
                  background: `radial-gradient(80% 80% at 30% 30%, ${it.hue}, transparent 60%), radial-gradient(80% 80% at 70% 70%, ${it.hue2}, transparent 60%), #0a0a0c`,
                  display: 'grid', placeItems: 'center', fontSize: 40,
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>{it.icon}</div>
                <div style={{ marginTop: 10, fontSize: 13, fontWeight: 600 }}>{it.n}</div>
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 15 }}>R$ {it.p}</div>
                  <button style={{ width: 32, height: 32, borderRadius: 10, background: G5, color: '#003C1F', border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>+</button>
                </div>
                <div style={{ position: 'absolute', top: 16, left: 16, padding: '3px 8px', borderRadius: 6, background: 'rgba(11,13,18,0.7)', backdropFilter: 'blur(8px)', fontSize: 9, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fff' }}>{it.tag}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Menu list */}
        <div style={{ padding: '20px 20px 0', flex: 1, overflow: 'hidden' }}>
          <div className="pp-label">Cardápio · Bar Central</div>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { n: 'Brahma 600ml', d: 'Cerveja · gelada', p: 18, icon: '🍺' },
              { n: 'Heineken Long Neck', d: 'Cerveja premium', p: 15, icon: '🍺' },
              { n: 'Gin Tônica premium', d: 'Beefeater · limão siciliano', p: 38, icon: '🍸' },
              { n: 'Hot dog premium', d: 'Pão brioche + queijo + cebola', p: 22, icon: '🌭' },
            ].map(it => (
              <div key={it.n} style={{
                padding: '10px 4px', borderRadius: 12,
                display: 'flex', alignItems: 'center', gap: 12,
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center', fontSize: 20, border: '1px solid rgba(255,255,255,0.08)' }}>{it.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{it.n}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{it.d}</div>
                </div>
                <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 14, marginRight: 8 }}>R$ {it.p}</div>
                <button style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(0,255,133,0.14)', border: '1px solid rgba(0,255,133,0.3)', color: G5, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>+</button>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom cart bar */}
        <div style={{
          margin: '10px 14px 14px',
          padding: '12px 14px 12px 18px',
          borderRadius: 22,
          background: `linear-gradient(180deg, rgba(0,255,133,0.16), rgba(0,255,133,0.10))`,
          backdropFilter: 'blur(30px) saturate(180%)',
          border: '1px solid rgba(0,255,133,0.35)',
          boxShadow: '0 8px 24px rgba(0,255,133,0.25), inset 0 1px 0 rgba(255,255,255,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: G5, color: '#003C1F', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 18 }}>3</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>3 itens · R$ 84,00</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Pronto em ~4 min</div>
            </div>
          </div>
          <button style={{
            height: 44, padding: '0 18px', borderRadius: 14, border: 'none',
            background: '#003C1F', color: G5, fontWeight: 700, fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>Continuar
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </button>
        </div>

        <div style={{ height: 80 }}/>
      </div>
      <TabBar active="wallet"/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SCREEN 12 — LIVE EVENT MAP (Super app)
// ─────────────────────────────────────────────────────────
function LiveMapScreen() {
  return (
    <div style={{ position: 'relative', width: 390, height: 844, overflow: 'hidden', color: '#fff', fontFamily: 'var(--pp-font-body)' }}>
      {/* Map background — abstract venue */}
      <div style={{ position: 'absolute', inset: 0, background: '#0a0d14' }}>
        {/* Grid map */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.4 }} viewBox="0 0 390 844">
          {/* Outer venue boundary */}
          <path d="M40 100 L350 100 L370 200 L370 700 L300 760 L80 760 L20 700 L20 200 Z" fill="rgba(34,211,238,0.06)" stroke={C5} strokeWidth="1.5" strokeOpacity="0.3"/>
          {/* Stage */}
          <rect x="100" y="120" width="190" height="60" rx="6" fill={V5} fillOpacity="0.2" stroke={V5} strokeOpacity="0.5"/>
          {/* Bars */}
          <rect x="40" y="400" width="60" height="40" rx="6" fill={G5} fillOpacity="0.2" stroke={G5} strokeOpacity="0.5"/>
          <rect x="290" y="400" width="60" height="40" rx="6" fill={G5} fillOpacity="0.2" stroke={G5} strokeOpacity="0.5"/>
          {/* Food */}
          <rect x="40" y="560" width="60" height="40" rx="6" fill={AMBER5} fillOpacity="0.2" stroke={AMBER5} strokeOpacity="0.5"/>
          {/* Pista */}
          <ellipse cx="195" cy="500" rx="160" ry="180" fill="rgba(0,255,133,0.04)" stroke={G5} strokeOpacity="0.15" strokeWidth="1" strokeDasharray="4 4"/>
          {/* Camarote */}
          <rect x="280" y="640" width="80" height="100" rx="6" fill={PINK5} fillOpacity="0.2" stroke={PINK5} strokeOpacity="0.5"/>
          {/* Door */}
          <rect x="170" y="730" width="50" height="20" rx="6" fill="#fff" fillOpacity="0.15" stroke="#fff" strokeOpacity="0.4"/>
          {/* Heat dots — crowd */}
          {Array.from({ length: 40 }).map((_, i) => {
            const cx = 100 + (i * 73) % 200;
            const cy = 380 + Math.floor((i * 53) % 250);
            return <circle key={i} cx={cx} cy={cy} r="2" fill={G5} fillOpacity={0.3 + (i % 3) * 0.2}/>;
          })}
        </svg>
        {/* Vignette */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(70% 70% at 50% 50%, transparent 50%, rgba(6,7,10,0.7))' }}/>
      </div>

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        <StatusBar/>

        {/* Top bar */}
        <div style={{ padding: '8px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ padding: '8px 14px 8px 10px', borderRadius: 999, background: 'rgba(11,13,18,0.65)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="pp-pulse-dot" style={{ width: 8, height: 8 }}/>
            <span style={{ fontSize: 12, fontWeight: 600, color: G5 }}>Festival do Sol</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--pp-font-mono)' }}>22:38</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(11,13,18,0.65)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.14)', display: 'grid', placeItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
          </div>
        </div>

        {/* Legend chips */}
        <div style={{ padding: '14px 20px 0', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { l: 'Stage', c: V5 },
            { l: 'Bar', c: G5 },
            { l: 'Comida', c: AMBER5 },
            { l: 'Camarote', c: PINK5 },
            { l: 'Banheiro', c: '#fff' },
          ].map(le => (
            <div key={le.l} style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(11,13,18,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontFamily: 'var(--pp-font-mono)' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: le.c }}/>
              {le.l}
            </div>
          ))}
        </div>

        {/* You-are-here pin */}
        <div style={{ position: 'absolute', top: 470, left: 195, transform: 'translate(-50%, -50%)' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 60, height: 60, borderRadius: '50%', background: G5, opacity: 0.2, filter: 'blur(8px)', animation: 'pp-pulse-ring 2s infinite' }}/>
          <div style={{ position: 'relative', width: 26, height: 26, borderRadius: '50%', background: G5, border: '3px solid #fff', boxShadow: '0 0 0 4px rgba(0,255,133,0.3), 0 4px 12px rgba(0,0,0,0.4)' }}/>
        </div>

        {/* Active marker — friend */}
        <div style={{ position: 'absolute', top: 540, left: 250, padding: '4px 10px 4px 6px', borderRadius: 999, background: V5, color: '#1A0040', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(167,139,250,0.5)' }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#1A0040', color: V5, display: 'grid', placeItems: 'center', fontSize: 9 }}>L</div>
          Lia
        </div>
        <div style={{ position: 'absolute', top: 600, left: 130, padding: '4px 10px 4px 6px', borderRadius: 999, background: PINK5, color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', color: PINK5, display: 'grid', placeItems: 'center', fontSize: 9 }}>C</div>
          Caio
        </div>

        <div style={{ flex: 1 }}/>

        {/* Bottom sheet */}
        <div style={{
          margin: '0 14px 90px',
          padding: 16,
          borderRadius: 22,
          background: 'rgba(11,13,18,0.65)',
          backdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.14)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 12px 32px rgba(0,0,0,0.5)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="pp-eyebrow" style={{ color: V5 }}>Tocando agora · main stage</div>
              <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em', marginTop: 6 }}>Vintage Culture</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>até 23:30 · próx: <span style={{ color: V5, fontWeight: 600 }}>Anyma</span></div>
            </div>
            <div style={{ width: 70, height: 70, borderRadius: 16, background: `radial-gradient(${V5}, transparent), ${PINK5}`, border: '1px solid rgba(255,255,255,0.14)' }}/>
          </div>

          <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { l: 'Ocupação', v: '85%', c: G5 },
              { l: 'Fila bar', v: '4 min', c: AMBER5 },
              { l: 'Amigos aqui', v: '2', c: V5 },
            ].map(s => (
              <div key={s.l} style={{ padding: 10, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 16, color: s.c }}>{s.v}</div>
                <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <TabBar active="home"/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SCREEN 13 — NOTIFICATIONS / ACTIVITY
// ─────────────────────────────────────────────────────────
function NotificationsScreen() {
  return (
    <div style={{ position: 'relative', width: 390, height: 844, overflow: 'hidden', color: '#fff', fontFamily: 'var(--pp-font-body)' }}>
      <Aurora intensity={0.4}/>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        <StatusBar/>

        {/* Header */}
        <div style={{ padding: '8px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="pp-eyebrow">Atividade</div>
            <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 28, letterSpacing: '-0.025em', marginTop: 2 }}>Notificações</div>
          </div>
          <div style={{ padding: '6px 12px', borderRadius: 999, background: 'rgba(0,255,133,0.10)', border: '1px solid rgba(0,255,133,0.25)', fontSize: 11, fontFamily: 'var(--pp-font-mono)', color: G5, fontWeight: 600 }}>4 novas</div>
        </div>

        {/* Filter pills */}
        <div style={{ padding: '14px 20px 0', display: 'flex', gap: 6, overflow: 'hidden' }}>
          {['Tudo', 'Eventos', 'Cashless', 'Amigos', 'Sistema'].map((c, i) => (
            <div key={c} style={{
              padding: '6px 12px', borderRadius: 999, whiteSpace: 'nowrap', fontSize: 12, fontWeight: 600,
              background: i === 0 ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.04)',
              color: i === 0 ? '#fff' : 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>{c}</div>
          ))}
        </div>

        {/* Group: Hoje */}
        <div style={{ padding: '20px 20px 0', flex: 1, overflow: 'hidden' }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 10 }}>Hoje</div>

          {/* Featured notification — pulse */}
          <div style={{
            padding: 16, borderRadius: 18,
            background: `linear-gradient(135deg, rgba(0,255,133,0.16), rgba(34,211,238,0.10))`,
            border: '1px solid rgba(0,255,133,0.35)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 4px 16px rgba(0,255,133,0.15), inset 0 1px 0 rgba(255,255,255,0.12)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 12, right: 12 }}>
              <span className="pp-pulse-dot" style={{ width: 8, height: 8 }}/>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: G5, color: '#003C1F', display: 'grid', placeItems: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 14h3l2-6 3 12 2-8 2 4h4"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Festival do Sol abriu portões 🟢</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>Audio Club · Vila Olímpia · seu QR está pronto</div>
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button style={{ flex: 1, height: 36, borderRadius: 10, border: 'none', background: G5, color: '#003C1F', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Mostrar ingresso</button>
              <button style={{ flex: 1, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Ver mapa</button>
            </div>
          </div>

          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { ic: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={G5} strokeWidth="2.5"><path d="M12 2v20M2 12h20"/></svg>, t: 'Recarga de R$ 100 confirmada', s: 'Pix aprovado em 3s · novo saldo R$ 287,50', m: '32min', c: G5, ring: true },
              { ic: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={V5} strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>, t: 'Lia te marcou na lista do Festival', s: 'Bem-vinda à edição equinócio ✨', m: '1h', c: V5, ring: true },
              { ic: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C5} strokeWidth="2"><path d="M2 10a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/></svg>, t: 'Seu ingresso Premium chegou', s: 'PSP-7H29 · Pista Premium', m: '2h', c: C5, ring: false },
              { ic: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={PINK5} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>, t: 'Você desbloqueou Tier Gold', s: '5 eventos PulsePass · 3% cashback', m: '4h', c: AMBER5, ring: false },
            ].map((n, i) => (
              <div key={i} style={{ padding: '12px 4px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${n.c}18`, border: `1px solid ${n.c}40`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{n.ic}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{n.t}</span>
                    {n.ring && <span style={{ width: 6, height: 6, borderRadius: '50%', background: G5, flexShrink: 0 }}/>}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>{n.s}</div>
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--pp-font-mono)', flexShrink: 0 }}>{n.m}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 18, fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>Esta semana</div>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { ic: '🎂', t: 'Caio fez aniversário no PulsePass', s: 'Mande os parabéns', m: 'Ter', c: PINK5 },
              { ic: '🎟️', t: 'Boate Roxa abriu vendas', s: 'Convite especial · você foi 3× lá', m: 'Seg', c: V5 },
            ].map((n, i) => (
              <div key={i} style={{ padding: '12px 4px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${n.c}18`, border: `1px solid ${n.c}40`, display: 'grid', placeItems: 'center', fontSize: 16, flexShrink: 0 }}>{n.ic}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{n.t}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>{n.s}</div>
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--pp-font-mono)' }}>{n.m}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 100 }}/>
      </div>
      <TabBar active="profile"/>
    </div>
  );
}

Object.assign(window, { RechargeScreen, OrderAheadScreen, LiveMapScreen, NotificationsScreen });
