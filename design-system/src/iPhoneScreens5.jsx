// iPhoneScreens5.jsx — Order Success · My Tickets · Profile/Tier · Withdraw

const G7 = '#00FF85', V7 = '#A78BFA', C7 = '#22D3EE', PINK7 = '#FF3D88', AMBER7 = '#FFB800';

// ─────────────────────────────────────────────────────────
// SCREEN 14 — ORDER SUCCESS (PIX confirmed → ticket delivered)
// ─────────────────────────────────────────────────────────
function OrderSuccessScreen() {
  return (
    <div style={{ position: 'relative', width: 390, height: 844, overflow: 'hidden', color: '#fff', fontFamily: 'var(--pp-font-body)' }}>
      {/* Green-tinted aurora */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(60% 50% at 50% 20%, ${G7}, transparent 60%), radial-gradient(50% 50% at 80% 80%, ${C7}, transparent 60%), radial-gradient(40% 40% at 20% 90%, ${V7}, transparent 60%), #06070A` }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(50% 50% at 50% 30%, transparent, rgba(6,7,10,0.5))' }}/>
      </div>

      {/* Confetti dots */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 390 844">
        {Array.from({ length: 22 }).map((_, i) => {
          const cx = 30 + (i * 73) % 330;
          const cy = 60 + (i * 37) % 350;
          const colors = [G7, V7, C7, PINK7, AMBER7];
          const c = colors[i % 5];
          const r = 3 + (i % 3);
          return <circle key={i} cx={cx} cy={cy} r={r} fill={c} opacity={0.7}/>;
        })}
        {Array.from({ length: 12 }).map((_, i) => {
          const cx = 50 + (i * 91) % 290;
          const cy = 80 + (i * 53) % 320;
          return <rect key={i} x={cx} y={cy} width="6" height="10" fill={[G7, V7, PINK7][i % 3]} opacity="0.5" transform={`rotate(${i * 35} ${cx + 3} ${cy + 5})`} rx="1"/>;
        })}
      </svg>

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        <StatusBar/>

        {/* Big success check */}
        <div style={{ padding: '40px 20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 120, height: 120 }}>
            {/* Rings */}
            <div style={{ position: 'absolute', inset: -16, borderRadius: '50%', background: G7, opacity: 0.12, filter: 'blur(12px)' }}/>
            <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', background: G7, opacity: 0.2, filter: 'blur(8px)' }}/>
            <div style={{
              position: 'absolute', inset: 0,
              borderRadius: '50%',
              background: `linear-gradient(135deg, #4DFFA8, ${G7})`,
              display: 'grid', placeItems: 'center',
              boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.4), 0 20px 40px rgba(0,255,133,0.5)',
            }}>
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#003C1F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </div>

          <div className="pp-eyebrow" style={{ color: G7, marginTop: 28 }}>Pagamento aprovado · agora</div>
          <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 38, lineHeight: 1, letterSpacing: '-0.03em', marginTop: 12, textAlign: 'center' }}>
            Seu ingresso<br/>
            <span style={{ fontFamily: 'var(--pp-font-serif)', fontStyle: 'italic', fontWeight: 400, color: G7 }}>chegou.</span>
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 10, textAlign: 'center', maxWidth: 280 }}>
            Salvamos um lugar pra você no Festival do Sol. Apresente o QR na entrada.
          </div>
        </div>

        {/* Ticket preview card */}
        <div style={{ padding: '32px 20px 0', flex: 1 }}>
          <div style={{
            padding: 20, borderRadius: 24,
            background: 'rgba(11,13,18,0.55)',
            backdropFilter: 'blur(40px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.14)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 20px 40px rgba(0,0,0,0.4)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 60, background: `linear-gradient(180deg, rgba(0,255,133,0.18), transparent)` }}/>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
              <div style={{ width: 64, height: 64, borderRadius: 14, background: `radial-gradient(${G7}, transparent), ${V7}`, border: '1px solid rgba(255,255,255,0.14)' }}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: G7 }}>SÁB · 30 NOV · 22H</div>
                <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em', marginTop: 4, lineHeight: 1.1 }}>Festival do Sol</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>Audio Club · Vila Olímpia</div>
              </div>
            </div>

            <div style={{ marginTop: 16, padding: '12px 0', borderTop: '1px dashed rgba(255,255,255,0.15)', borderBottom: '1px dashed rgba(255,255,255,0.15)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <div>
                <div style={{ fontSize: 9, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>Setor</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 3 }}>Pista Premium</div>
              </div>
              <div>
                <div style={{ fontSize: 9, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>Código</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 3, fontFamily: 'var(--pp-font-mono)' }}>PSP-7H29</div>
              </div>
              <div>
                <div style={{ fontSize: 9, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>Valor</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 3, fontFamily: 'var(--pp-font-mono)', color: G7 }}>R$ 189,00</div>
              </div>
            </div>

            <div style={{ marginTop: 14, fontSize: 11, color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--pp-font-mono)' }}>
              Comprovante enviado por e-mail · erick@smu.fun
            </div>
          </div>

          {/* Add to calendar / Apple Wallet */}
          <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
            <button style={{ flex: 1, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Agenda
            </button>
            <button style={{ flex: 1, height: 44, borderRadius: 12, background: '#000', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13z"/></svg>
              Wallet
            </button>
            <button style={{ flex: 1, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
              Share
            </button>
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '14px 20px 24px' }}>
          <button style={{
            width: '100%', height: 54, borderRadius: 18, border: 'none',
            background: '#fff', color: '#06070A', fontWeight: 700, fontSize: 14,
            cursor: 'pointer', boxShadow: '0 8px 24px rgba(255,255,255,0.15)',
          }}>Ver ingresso completo →</button>
          <button style={{ width: '100%', marginTop: 8, height: 44, borderRadius: 14, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Carregar R$ 50 no cashless · ganhe +R$ 5</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SCREEN 15 — MY TICKETS (multi-event list)
// ─────────────────────────────────────────────────────────
function MyTicketsScreen() {
  return (
    <div style={{ position: 'relative', width: 390, height: 844, overflow: 'hidden', color: '#fff', fontFamily: 'var(--pp-font-body)' }}>
      <Aurora intensity={0.4}/>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        <StatusBar/>

        {/* Header */}
        <div style={{ padding: '8px 20px 0' }}>
          <div className="pp-eyebrow">Sua carteira</div>
          <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 28, letterSpacing: '-0.025em', marginTop: 2 }}>
            <span style={{ fontFamily: 'var(--pp-font-serif)', fontStyle: 'italic', fontWeight: 400, color: G7 }}>3 noites</span> à frente
          </div>
        </div>

        {/* Tab pills */}
        <div style={{ padding: '14px 20px 0' }}>
          <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {['Próximos · 3', 'Hoje · 1', 'Histórico'].map((t, i) => (
              <div key={t} style={{
                flex: 1, padding: '8px 12px', borderRadius: 999, textAlign: 'center', fontSize: 12, fontWeight: 600,
                background: i === 1 ? G7 : 'transparent',
                color: i === 1 ? '#003C1F' : 'rgba(255,255,255,0.65)',
              }}>{t}</div>
            ))}
          </div>
        </div>

        {/* Featured today */}
        <div style={{ padding: '18px 20px 0' }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', color: G7, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <span className="pp-pulse-dot" style={{ width: 6, height: 6 }}/>
            Hoje · começa em 3h22
          </div>
          <div style={{
            position: 'relative', borderRadius: 22, padding: 2,
            background: `conic-gradient(from 90deg, ${G7}, ${C7}, ${V7}, ${PINK7}, ${G7})`,
            boxShadow: `0 20px 40px -10px rgba(0,255,133,0.35), 0 0 40px rgba(0,255,133,0.18)`,
          }}>
            <div style={{
              borderRadius: 20, padding: 16,
              background: 'rgba(11,13,18,0.9)', backdropFilter: 'blur(40px)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ width: 60, height: 80, borderRadius: 10, background: `radial-gradient(80% 80% at 30% 30%, ${G7}, transparent 60%), radial-gradient(80% 80% at 80% 80%, ${V7}, transparent 60%), #0a0a0c`, border: '1px solid rgba(255,255,255,0.08)' }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 17, letterSpacing: '-0.01em' }}>Festival do Sol</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>Audio Club · Pista Premium</div>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <PBadge tone="pulse" dot>Ao vivo · QR pronto</PBadge>
                </div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
            </div>
          </div>
        </div>

        {/* Upcoming list */}
        <div style={{ padding: '20px 20px 0', flex: 1, overflow: 'hidden' }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>Próximas noites</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { d: '14', m: 'DEZ', t: 'KVSH no Audio', loc: 'Audio Club · Pista', tag: 'Pista', tone: G7, c: V7, c2: C7 },
              { d: '21', m: 'DEZ', t: 'Tropical Heat', loc: 'Praia do Forte · BA', tag: 'Premium', tone: V7, c: PINK7, c2: AMBER7 },
              { d: '31', m: 'DEZ', t: 'Réveillon Cobertura', loc: 'Skye Bar · SP', tag: 'VIP · open bar', tone: PINK7, c: G7, c2: PINK7 },
            ].map((t, i) => (
              <div key={i} style={{
                padding: 14, borderRadius: 16,
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                {/* Date block */}
                <div style={{ width: 54, padding: '8px 0', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em', lineHeight: 1, color: '#fff' }}>{t.d}</div>
                  <div style={{ fontSize: 9, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.1em', color: t.tone, marginTop: 3, fontWeight: 600 }}>{t.m}</div>
                </div>
                <div style={{ width: 48, height: 60, borderRadius: 10, background: `radial-gradient(80% 80% at 30% 30%, ${t.c}, transparent 60%), radial-gradient(80% 80% at 80% 80%, ${t.c2}, transparent 60%), #0a0a0c`, flexShrink: 0 }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{t.t}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>{t.loc}</div>
                  <div style={{ marginTop: 6 }}>
                    <PBadge tone={t.tag.includes('VIP') ? 'pink' : t.tag.includes('Premium') ? 'violet' : 'pulse'}>{t.tag}</PBadge>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tier strip */}
          <div style={{
            marginTop: 16, padding: 14, borderRadius: 16,
            background: `linear-gradient(135deg, rgba(255,184,0,0.14), rgba(255,61,136,0.10))`,
            border: '1px solid rgba(255,184,0,0.3)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${AMBER7}, ${PINK7})`, display: 'grid', placeItems: 'center', fontSize: 20 }}>★</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Pulse Gold · 5 eventos</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>Faltam 3 pra Platinum · cashback 5%</div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
          </div>
        </div>

        <div style={{ height: 100 }}/>
      </div>
      <TabBar active="tickets"/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SCREEN 16 — PROFILE / TIER / ACHIEVEMENTS
// ─────────────────────────────────────────────────────────
function ProfileScreen() {
  return (
    <div style={{ position: 'relative', width: 390, height: 844, overflow: 'hidden', color: '#fff', fontFamily: 'var(--pp-font-body)' }}>
      <Aurora intensity={0.5}/>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <StatusBar/>

        {/* Top right settings */}
        <div style={{ padding: '8px 20px', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', display: 'grid', placeItems: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </div>
        </div>

        {/* Hero — avatar + tier */}
        <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <svg viewBox="0 0 100 100" width="120" height="120" style={{ position: 'absolute', inset: 0 }}>
              <defs>
                <linearGradient id="tierRing" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor={AMBER7}/>
                  <stop offset="0.5" stopColor={PINK7}/>
                  <stop offset="1" stopColor={V7}/>
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3"/>
              <circle cx="50" cy="50" r="46" fill="none" stroke="url(#tierRing)" strokeWidth="3" strokeLinecap="round" strokeDasharray="289" strokeDashoffset="86" transform="rotate(-90 50 50)"/>
            </svg>
            <div style={{ width: 120, height: 120, borderRadius: '50%', background: `linear-gradient(135deg, ${V7}, ${PINK7})`, display: 'grid', placeItems: 'center', fontSize: 42, fontWeight: 700, fontFamily: 'var(--pp-font-display)', boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.3)' }}>E</div>
          </div>
          <div style={{ marginTop: 16, fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 24, letterSpacing: '-0.02em' }}>Erick Berberian</div>
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px 6px 8px', borderRadius: 999, background: `linear-gradient(135deg, rgba(255,184,0,0.18), rgba(255,61,136,0.12))`, border: '1px solid rgba(255,184,0,0.3)' }}>
            <span style={{ fontSize: 14 }}>★</span>
            <span style={{ fontSize: 11, fontFamily: 'var(--pp-font-mono)', fontWeight: 600, letterSpacing: '0.06em', color: AMBER7 }}>PULSE GOLD · 71%</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ padding: '20px 20px 0', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { v: '23', l: 'Eventos', c: G7 },
            { v: '4,8★', l: 'Reputação', c: AMBER7 },
            { v: 'R$ 3,2k', l: 'Cashless', c: C7 },
          ].map(s => (
            <div key={s.l} style={{ padding: 12, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 18, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Tier progression */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{
            padding: 16, borderRadius: 18,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="pp-eyebrow">Próx. tier</div>
              <span style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>3 / 10 eventos</span>
            </div>
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
              {['Silver', 'Gold', 'Platinum', 'Diamond'].map((t, i) => (
                <React.Fragment key={t}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: i < 2 ? G7 : 'rgba(255,255,255,0.06)', border: i < 2 ? 'none' : '1px solid rgba(255,255,255,0.12)', display: 'grid', placeItems: 'center', color: i < 2 ? '#003C1F' : 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: 13 }}>
                      {i < 2 ? '✓' : i + 1}
                    </div>
                    <span style={{ fontSize: 9, fontFamily: 'var(--pp-font-mono)', color: i < 2 ? G7 : 'rgba(255,255,255,0.5)', letterSpacing: '0.06em' }}>{t}</span>
                  </div>
                  {i < 3 && <div style={{ flex: 1, height: 2, background: i < 1 ? G7 : 'rgba(255,255,255,0.08)' }}/>}
                </React.Fragment>
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>
              <b style={{ color: '#fff' }}>+3% cashback</b> liberado em Platinum
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div style={{ padding: '20px 20px 0' }}>
          <div className="pp-label" style={{ marginBottom: 10 }}>Conquistas · 8 de 24</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[
              { i: '🎟️', t: 'Primeira', c: G7, on: true },
              { i: '🌙', t: '5 noites', c: V7, on: true },
              { i: '⚡', t: 'Pix < 30s', c: AMBER7, on: true },
              { i: '👯', t: '+5 amigos', c: PINK7, on: true },
              { i: '🏆', t: '10 eventos', c: C7, on: false },
              { i: '💰', t: 'R$ 5k cashless', c: G7, on: false },
              { i: '🌟', t: 'VIP 3×', c: V7, on: false },
              { i: '🎂', t: 'Aniversário', c: PINK7, on: false },
            ].map((a, i) => (
              <div key={i} style={{
                aspectRatio: '1', borderRadius: 14,
                background: a.on ? `${a.c}18` : 'rgba(255,255,255,0.03)',
                border: a.on ? `1px solid ${a.c}50` : '1px solid rgba(255,255,255,0.06)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                opacity: a.on ? 1 : 0.4,
                position: 'relative',
              }}>
                <div style={{ fontSize: 22, filter: a.on ? 'none' : 'grayscale(1)' }}>{a.i}</div>
                <div style={{ fontSize: 9, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.55)', textAlign: 'center', lineHeight: 1.1 }}>{a.t}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Settings rows */}
        <div style={{ padding: '20px 20px 0' }}>
          <div className="pp-label" style={{ marginBottom: 8 }}>Conta</div>
          <div style={{ borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            {[
              { l: 'Métodos de pagamento', s: '3 cadastrados', icon: '⊞' },
              { l: 'Notificações', s: 'push, e-mail', icon: '◔' },
              { l: 'Privacidade & LGPD', s: 'preferências', icon: '◇' },
              { l: 'Ajuda', s: '24/7 via chat', icon: '?' },
            ].map((r, i) => (
              <div key={i} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none', cursor: 'pointer' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)', display: 'grid', placeItems: 'center', fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{r.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{r.l}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{r.s}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 110 }}/>
      </div>
      <TabBar active="profile"/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SCREEN 17 — WITHDRAW (Saque do saldo residual via Pix)
// ─────────────────────────────────────────────────────────
function WithdrawScreen() {
  return (
    <div style={{ position: 'relative', width: 390, height: 844, overflow: 'hidden', color: '#fff', fontFamily: 'var(--pp-font-body)' }}>
      <Aurora intensity={0.5}/>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        <StatusBar/>

        {/* Nav */}
        <div style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.10)', display: 'grid', placeItems: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Sacar saldo</div>
          <div style={{ width: 38, height: 38 }}/>
        </div>

        {/* Hero — residual amount */}
        <div style={{ padding: '20px 20px 0', textAlign: 'center' }}>
          <div className="pp-eyebrow" style={{ color: G7 }}>Sobra após Festival do Sol</div>
          <div style={{ marginTop: 12, fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 56, letterSpacing: '-0.03em', display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6 }}>
            <span style={{ fontSize: 24, color: 'rgba(255,255,255,0.55)' }}>R$</span>
            <span style={{ textShadow: `0 0 32px ${G7}80` }}>52</span>
            <span style={{ fontSize: 24, color: 'rgba(255,255,255,0.6)' }}>,40</span>
          </div>
          <div style={{ marginTop: 6, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>Cai na sua conta em até 5 minutos via Pix</div>
        </div>

        {/* Breakdown */}
        <div style={{ padding: '24px 20px 0' }}>
          <div style={{ padding: 16, borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
            <div className="pp-label" style={{ marginBottom: 12 }}>Resumo do evento</div>
            {[
              { l: 'Recargas', v: '+R$ 150,00', c: G7 },
              { l: 'Bônus carga R$ 100', v: '+R$ 10,00', c: V7 },
              { l: 'Gasto no PDV (6 itens)', v: '−R$ 107,60', c: '#fff' },
              { l: 'Taxa de serviço', v: '−R$ 0,00', c: '#fff', muted: true },
            ].map((r, i) => (
              <div key={i} style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <span style={{ fontSize: 13, color: r.muted ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.75)' }}>{r.l}</span>
                <span style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 13, fontWeight: 600, color: r.c }}>{r.v}</span>
              </div>
            ))}
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed rgba(255,255,255,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Saldo a sacar</span>
              <span style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 20, color: G7 }}>R$ 52,40</span>
            </div>
          </div>
        </div>

        {/* Pix key */}
        <div style={{ padding: '20px 20px 0' }}>
          <div className="pp-label" style={{ marginBottom: 10 }}>Sacar para chave Pix</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { l: 'CPF · 348.***.***-22', sub: 'Banco do Brasil · em sua conta', sel: true },
              { l: 'erick@smu.fun', sub: 'Nubank', sel: false },
              { l: '+ Adicionar nova chave', sub: '', add: true },
            ].map((k, i) => (
              <div key={i} style={{
                padding: 14, borderRadius: 14,
                background: k.sel ? 'rgba(0,255,133,0.08)' : 'rgba(255,255,255,0.04)',
                border: k.sel ? `1.5px solid ${G7}` : k.add ? '1px dashed rgba(255,255,255,0.18)' : '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', gap: 12,
                boxShadow: k.sel ? `0 0 20px rgba(0,255,133,0.18)` : 'none',
              }}>
                {k.add ? (
                  <>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center', fontSize: 16, color: 'rgba(255,255,255,0.6)' }}>+</div>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>{k.l}</span>
                  </>
                ) : (
                  <>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: k.sel ? 'rgba(0,255,133,0.18)' : 'rgba(255,255,255,0.06)', display: 'grid', placeItems: 'center' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={k.sel ? G7 : '#fff'} strokeWidth="2"><path d="m2 12 5-5 5 5-5 5z"/><path d="m12 2 5 5-5 5-5-5z"/><path d="m22 12-5 5-5-5 5-5z"/><path d="m12 22-5-5 5-5 5 5z"/></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{k.l}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{k.sub}</div>
                    </div>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: k.sel ? `6px solid ${G7}` : '1.5px solid rgba(255,255,255,0.25)', background: k.sel ? '#06070A' : 'transparent', boxSizing: 'border-box' }}/>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Info note */}
        <div style={{ padding: '16px 20px 0' }}>
          <div style={{ padding: 12, borderRadius: 12, background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C7} strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
              Saque gratuito até <b style={{ color: '#fff' }}>30 dias após o evento</b>. Após esse prazo, R$ 2,50 de taxa.
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }}/>

        {/* CTA */}
        <div style={{ padding: '14px 20px 28px' }}>
          <button style={{
            width: '100%', height: 56, borderRadius: 18, border: 'none',
            background: `linear-gradient(180deg, #4DFFA8, ${G7})`,
            color: '#003C1F', fontWeight: 700, fontSize: 15,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 22px', cursor: 'pointer',
            boxShadow: '0 12px 32px rgba(0,255,133,0.4), inset 0 1px 0 rgba(255,255,255,0.4)',
          }}>
            <span>Sacar R$ 52,40 via Pix</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { OrderSuccessScreen, MyTicketsScreen, ProfileScreen, WithdrawScreen });
