// iPhoneScreens2.jsx — Checkout PIX · Ticket QR · Wallet Cashless

const G2 = '#00FF85', V2 = '#A78BFA', C2 = '#22D3EE', PINK2 = '#FF3D88';

// ─────────────────────────────────────────────────────────
// SCREEN 3 — CHECKOUT PIX
// ─────────────────────────────────────────────────────────
function CheckoutPixScreen() {
  // Simulated QR pattern
  const cells = Array.from({ length: 21 * 21 }, (_, i) => {
    const x = i % 21, y = Math.floor(i / 21);
    // finder patterns
    const isFinder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
    const seed = (x * 73 + y * 31) % 100;
    return isFinder ? 'finder' : (seed > 52 ? 'on' : 'off');
  });

  return (
    <div style={{ position: 'relative', width: 390, height: 844, overflow: 'hidden', color: '#fff', fontFamily: 'var(--pp-font-body)' }}>
      <Aurora intensity={0.6}/>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        <StatusBar/>

        {/* Nav */}
        <div style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.10)', display: 'grid', placeItems: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Pagamento · 3 de 3</div>
          <div style={{ fontSize: 11, fontFamily: 'var(--pp-font-mono)', color: G2, padding: '4px 8px', borderRadius: 8, background: 'rgba(0,255,133,0.12)', border: '1px solid rgba(0,255,133,0.25)' }}>SEGURO</div>
        </div>

        {/* Stepper */}
        <div style={{ padding: '12px 20px 20px', display: 'flex', gap: 6 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              flex: 1, height: 4, borderRadius: 99,
              background: s <= 3 ? G2 : 'rgba(255,255,255,0.1)',
              boxShadow: s <= 3 ? '0 0 12px rgba(0,255,133,0.5)' : 'none',
            }}/>
          ))}
        </div>

        {/* Title */}
        <div style={{ padding: '0 20px' }}>
          <div className="pp-eyebrow" style={{ color: G2 }}>Aguardando pagamento</div>
          <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 30, lineHeight: 1, letterSpacing: '-0.025em', marginTop: 8 }}>
            Pague com Pix<br/>
            <span style={{ fontFamily: 'var(--pp-font-serif)', fontStyle: 'italic', fontWeight: 400, color: G2, fontSize: 26 }}>e seu ingresso é seu.</span>
          </div>
        </div>

        {/* Countdown */}
        <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 999, background: 'rgba(255,184,0,0.10)', border: '1px solid rgba(255,184,0,0.25)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFD15C" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            <span style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 13, fontWeight: 600, color: '#FFD15C' }}>04:38 restantes</span>
          </div>
        </div>

        {/* QR */}
        <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            position: 'relative',
            padding: 18,
            borderRadius: 28,
            background: '#fff',
            boxShadow: '0 20px 60px rgba(0,255,133,0.2), 0 0 0 1px rgba(255,255,255,0.2)',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(21, 1fr)',
              gridTemplateRows: 'repeat(21, 1fr)',
              gap: 1,
              width: 220, height: 220,
            }}>
              {cells.map((c, i) => {
                const x = i % 21, y = Math.floor(i / 21);
                const inFinder =
                  (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
                let fill = 'transparent';
                if (inFinder) {
                  const fx = x < 7 ? x : x - 14;
                  const fy = y < 7 ? y : y - 14;
                  const ring = fx === 0 || fx === 6 || fy === 0 || fy === 6;
                  const center = fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4;
                  if (ring || center) fill = '#06070A';
                } else if (c === 'on') {
                  fill = '#06070A';
                }
                return <div key={i} style={{ background: fill, borderRadius: 1 }}/>;
              })}
            </div>
            {/* Center logo */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: 50, height: 50, borderRadius: 14, background: '#06070A',
              display: 'grid', placeItems: 'center', border: '3px solid #fff',
            }}>
              <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 800, color: G2, fontSize: 11, letterSpacing: '-0.02em' }}>pix</div>
            </div>
          </div>
        </div>

        {/* PIX code */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{
            padding: '12px 14px', borderRadius: 14,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.10)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{ flex: 1, fontFamily: 'var(--pp-font-mono)', fontSize: 12, color: 'rgba(255,255,255,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              00020126580014BR.GOV.BCB.PIX0136pulsepass-87a3e4f2-9c1d-4b8a52040000…
            </div>
            <button style={{
              padding: '8px 12px', borderRadius: 8, border: 'none',
              background: G2, color: '#003C1F', fontWeight: 700, fontSize: 12, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              Copiar
            </button>
          </div>
        </div>

        {/* Order summary */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{
            padding: 16, borderRadius: 18,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, background: `radial-gradient(${G2}, transparent), ${V2}`, flexShrink: 0 }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Festival do Sol · 30 nov</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>1× Pista Premium</div>
              </div>
              <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 16, color: G2 }}>R$ 189,00</div>
            </div>
          </div>
        </div>

        {/* Helper */}
        <div style={{ padding: '14px 20px', textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
          A confirmação chega aqui em <span style={{ color: '#fff', fontWeight: 600 }}>até 30 segundos</span>. Você pode fechar o app.
        </div>

        <div style={{ flex: 1 }}/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SCREEN 4 — MY TICKET (QR rotativo JWT)
// ─────────────────────────────────────────────────────────
function TicketScreen() {
  const cells = Array.from({ length: 19 * 19 }, (_, i) => {
    const x = i % 19, y = Math.floor(i / 19);
    const seed = (x * 41 + y * 73 + 12) % 100;
    return seed > 48 ? 1 : 0;
  });

  return (
    <div style={{ position: 'relative', width: 390, height: 844, overflow: 'hidden', color: '#fff', fontFamily: 'var(--pp-font-body)' }}>
      <Aurora intensity={0.5}/>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        <StatusBar/>

        {/* Header */}
        <div style={{ padding: '8px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 26, letterSpacing: '-0.02em' }}>Ingresso</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.10)', display: 'grid', placeItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
            </div>
          </div>
        </div>

        {/* Tab pills */}
        <div style={{ padding: '14px 20px 0' }}>
          <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {['Próximos · 2', 'Passados', 'Carteira'].map((t, i) => (
              <div key={t} style={{
                flex: 1, padding: '8px 12px', borderRadius: 999, textAlign: 'center', fontSize: 12, fontWeight: 600,
                background: i === 0 ? G2 : 'transparent',
                color: i === 0 ? '#003C1F' : 'rgba(255,255,255,0.65)',
              }}>{t}</div>
            ))}
          </div>
        </div>

        {/* Ticket card — premium glass with rotating border */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{
            position: 'relative',
            borderRadius: 26,
            padding: 2,
            background: `conic-gradient(from 90deg, ${G2}, ${C2}, ${V2}, ${PINK2}, ${G2})`,
            boxShadow: '0 30px 60px -20px rgba(0,255,133,0.4), 0 0 60px rgba(0,255,133,0.25)',
          }}>
            <div style={{
              background: 'rgba(11,13,18,0.9)',
              backdropFilter: 'blur(40px) saturate(180%)',
              borderRadius: 24,
              padding: 20,
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Top */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', color: G2 }}>Sáb · 30 nov · 22h</div>
                  <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 22, lineHeight: 1.05, letterSpacing: '-0.02em', marginTop: 6 }}>Festival do Sol</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>Audio Club · Vila Olímpia</div>
                </div>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: `radial-gradient(${G2}, transparent), ${V2}`, border: '1px solid rgba(255,255,255,0.1)' }}/>
              </div>

              {/* Perforation */}
              <div style={{ position: 'relative', margin: '16px -20px', height: 1 }}>
                <div style={{ position: 'absolute', inset: 0, borderTop: '1.5px dashed rgba(255,255,255,0.15)' }}/>
                <div style={{ position: 'absolute', left: -10, top: -10, width: 20, height: 20, borderRadius: '50%', background: '#06070A' }}/>
                <div style={{ position: 'absolute', right: -10, top: -10, width: 20, height: 20, borderRadius: '50%', background: '#06070A' }}/>
              </div>

              {/* QR */}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
                <div style={{ position: 'relative', padding: 14, borderRadius: 18, background: '#fff' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(19, 1fr)', gap: 1, width: 200, height: 200 }}>
                    {cells.map((c, i) => {
                      const x = i % 19, y = Math.floor(i / 19);
                      const inFinder = (x < 5 && y < 5) || (x > 13 && y < 5) || (x < 5 && y > 13);
                      let fill = 'transparent';
                      if (inFinder) {
                        const fx = x < 5 ? x : x - 14;
                        const fy = y < 5 ? y : y - 14;
                        const ring = fx === 0 || fx === 4 || fy === 0 || fy === 4;
                        const center = fx === 2 && fy === 2;
                        if (ring || center) fill = '#06070A';
                      } else if (c) {
                        fill = '#06070A';
                      }
                      return <div key={i} style={{ background: fill, borderRadius: 1 }}/>;
                    })}
                  </div>
                  {/* Center pulse */}
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                    width: 44, height: 44, borderRadius: 12, background: G2,
                    display: 'grid', placeItems: 'center', border: '3px solid #fff',
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#003C1F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14h3l2-6 3 12 2-8 2 4h4"/></svg>
                  </div>
                </div>
              </div>

              {/* Rotating JWT countdown */}
              <div style={{
                marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '8px 14px', borderRadius: 999,
                background: 'rgba(0,255,133,0.08)', border: '1px solid rgba(0,255,133,0.2)',
                width: 'fit-content', margin: '14px auto 0',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: G2, boxShadow: '0 0 8px rgba(0,255,133,0.8)' }}/>
                <span style={{ fontSize: 11, fontFamily: 'var(--pp-font-mono)', color: G2, fontWeight: 600 }}>Token rotativo · 4:38</span>
              </div>

              {/* Stub details */}
              <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>Setor</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginTop: 3 }}>Pista Premium</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>Código</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginTop: 3, fontFamily: 'var(--pp-font-mono)' }}>PSP-7H29</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>Titular</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginTop: 3 }}>Erick Berberian</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>Cashless</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginTop: 3, color: G2 }}>R$ 50 carregado</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ padding: '20px 20px 0', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={G2} strokeWidth="2"><path d="M12 2v20M2 12h20"/></svg>, label: 'Carregar' },
            { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={V2} strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>, label: 'Transferir' },
            { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C2} strokeWidth="2"><circle cx="12" cy="10" r="3"/><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/></svg>, label: 'Como chegar' },
          ].map(a => (
            <div key={a.label} style={{
              padding: 14, borderRadius: 16,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            }}>
              {a.icon}
              <span style={{ fontSize: 12, fontWeight: 600 }}>{a.label}</span>
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }}/>
      </div>
      <TabBar active="tickets"/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SCREEN 5 — WALLET (Cashless)
// ─────────────────────────────────────────────────────────
function WalletScreen() {
  return (
    <div style={{ position: 'relative', width: 390, height: 844, overflow: 'hidden', color: '#fff', fontFamily: 'var(--pp-font-body)' }}>
      <Aurora intensity={0.7}/>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        <StatusBar/>

        {/* Header */}
        <div style={{ padding: '8px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>Carteira PulsePass</div>
            <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 24, letterSpacing: '-0.02em', marginTop: 2 }}>Cashless</div>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.10)', display: 'grid', placeItems: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
        </div>

        {/* Hero balance card */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{
            position: 'relative',
            borderRadius: 24,
            padding: 22,
            background: `linear-gradient(135deg, rgba(0,255,133,0.18) 0%, rgba(34,211,238,0.12) 50%, rgba(167,139,250,0.18) 100%), rgba(11,13,18,0.7)`,
            backdropFilter: 'blur(30px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.14)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 12px 32px rgba(0,0,0,0.4), 0 0 40px rgba(0,255,133,0.15)',
            overflow: 'hidden',
          }}>
            {/* Decorative glyph */}
            <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${G2}40, transparent 70%)`, filter: 'blur(20px)' }}/>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)' }}>Saldo disponível</div>
              <div style={{ display: 'flex', gap: 4 }}>
                <span style={{ width: 28, height: 18, borderRadius: 4, background: G2 }}/>
                <span style={{ width: 28, height: 18, borderRadius: 4, background: 'rgba(255,255,255,0.2)' }}/>
              </div>
            </div>
            <div style={{ marginTop: 8, fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 42, letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.55)' }}>R$</span>
              <span>187</span>
              <span style={{ fontSize: 28, color: 'rgba(255,255,255,0.6)' }}>,50</span>
            </div>
            <div style={{ marginTop: 6, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>+ R$ 50,00 carregado · Festival do Sol</div>

            <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { icon: '+', label: 'Recarregar', primary: true },
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="m21 16-4 4-4-4M17 20V8M3 8l4-4 4 4M7 4v12"/></svg>, label: 'Transferir' },
                { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, label: 'Sacar' },
              ].map(a => (
                <button key={a.label} style={{
                  height: 44, borderRadius: 14, border: 'none',
                  background: a.primary ? G2 : 'rgba(255,255,255,0.10)',
                  color: a.primary ? '#003C1F' : '#fff',
                  fontWeight: 600, fontSize: 13,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  cursor: 'pointer',
                  border: a.primary ? 'none' : '1px solid rgba(255,255,255,0.14)',
                }}>
                  {typeof a.icon === 'string' ? <span style={{ fontSize: 18, fontWeight: 700 }}>{a.icon}</span> : a.icon}
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active event chip */}
        <div style={{ padding: '16px 20px 0' }}>
          <div style={{
            padding: '14px 16px', borderRadius: 16,
            background: 'rgba(0,255,133,0.06)', border: '1px solid rgba(0,255,133,0.20)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `radial-gradient(${G2}, transparent), ${V2}` }}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Festival do Sol · está rolando</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>Você está em Audio Club</div>
            </div>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: G2, boxShadow: '0 0 10px rgba(0,255,133,0.8)' }}/>
          </div>
        </div>

        {/* Transactions */}
        <div style={{ padding: '20px 20px 0', flex: 1, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.01em' }}>Atividade</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Esta noite</div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: '🍺', name: 'Brahma 600ml', loc: 'Bar Central · PDV 03', t: '23:47', amt: -18, color: PINK2 },
              { icon: '🥤', name: 'Combo Energético', loc: 'Bar VIP · PDV 01', t: '23:12', amt: -32, color: C2 },
              { icon: '↑', name: 'Recarga via Pix', loc: 'Asaas · aprovado', t: '22:38', amt: 50, color: G2 },
              { icon: '🍔', name: 'Burger + fritas', loc: 'Food Truck Norte', t: '22:21', amt: -42.50, color: V2 },
            ].map((tx, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 4px' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${tx.color}20`, border: `1px solid ${tx.color}40`, display: 'grid', placeItems: 'center', fontSize: 18 }}>{tx.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{tx.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{tx.loc} · {tx.t}</div>
                </div>
                <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 14, color: tx.amt > 0 ? G2 : '#fff' }}>
                  {tx.amt > 0 ? '+' : ''}R$ {Math.abs(tx.amt).toFixed(2).replace('.', ',')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <TabBar active="wallet"/>
    </div>
  );
}

Object.assign(window, { CheckoutPixScreen, TicketScreen, WalletScreen });
