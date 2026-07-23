// iPhoneScreens3.jsx — Onboarding · Search · Promoter (AZList) · Guest Signup public

const G4 = '#00FF85', V4 = '#A78BFA', C4 = '#22D3EE', PINK4 = '#FF3D88', AMBER4 = '#FFB800';

// ─────────────────────────────────────────────────────────
// SCREEN 6 — ONBOARDING / LOGIN
// ─────────────────────────────────────────────────────────
function OnboardingScreen() {
  return (
    <div style={{ position: 'relative', width: 390, height: 844, overflow: 'hidden', color: '#fff', fontFamily: 'var(--pp-font-body)' }}>
      <Aurora intensity={1.2}/>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        <StatusBar/>

        {/* Hero artwork — stacked depth cards */}
        <div style={{ flex: 1, position: 'relative', display: 'grid', placeItems: 'center', padding: '20px 20px 0' }}>
          {[
            { rot: -8, ty: 0, tx: -60, hue: V4, hue2: PINK4, label: 'Festival Sol' },
            { rot: 4, ty: -30, tx: 30, hue: G4, hue2: C4, label: 'Boate Roxa', front: true },
            { rot: 12, ty: 30, tx: 90, hue: PINK4, hue2: AMBER4, label: 'Sunset Bar' },
          ].map((c, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: 180, height: 240,
              borderRadius: 22,
              background: `radial-gradient(80% 80% at 20% 20%, ${c.hue}, transparent 60%), radial-gradient(80% 80% at 80% 80%, ${c.hue2}, transparent 60%), #0a0a0c`,
              border: '1px solid rgba(255,255,255,0.12)',
              transform: `translate(${c.tx}px, ${c.ty}px) rotate(${c.rot}deg)`,
              boxShadow: c.front ? '0 30px 60px -10px rgba(0,255,133,0.5), 0 0 0 1px rgba(255,255,255,0.18)' : '0 20px 40px -10px rgba(0,0,0,0.6)',
              padding: 14, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              overflow: 'hidden',
              isolation: 'isolate',
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.7))', zIndex: -1 }}/>
              <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: G4 }}>SÁB · 22H</div>
              <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em', marginTop: 4, lineHeight: 1.1 }}>{c.label}</div>
            </div>
          ))}
          {/* Pulse rings behind */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: -1 }}>
            <circle cx="50%" cy="50%" r="180" fill="none" stroke={G4} strokeOpacity="0.10" strokeWidth="1"/>
            <circle cx="50%" cy="50%" r="240" fill="none" stroke={G4} strokeOpacity="0.06" strokeWidth="1"/>
          </svg>
        </div>

        {/* Bottom sheet */}
        <div style={{
          padding: '28px 24px 36px',
          background: 'rgba(11,13,18,0.6)',
          backdropFilter: 'blur(40px) saturate(180%)',
          borderTop: '1px solid rgba(255,255,255,0.10)',
          borderRadius: '28px 28px 0 0',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
        }}>
          <div className="pp-eyebrow" style={{ color: G4 }}>Bem-vindo ao PulsePass</div>
          <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 32, lineHeight: 1, letterSpacing: '-0.03em', marginTop: 10 }}>
            Sua noite,<br/>
            <span style={{ fontFamily: 'var(--pp-font-serif)', fontStyle: 'italic', fontWeight: 400, color: G4 }}>do ingresso ao último gole.</span>
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 12, lineHeight: 1.5 }}>
            Ticketeria, lista de convidados e cashless num app só. Sem fila, sem dinheiro, sem complicação.
          </div>

          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button style={{
              height: 54, borderRadius: 16, border: 'none',
              background: `linear-gradient(180deg, #4DFFA8, ${G4})`,
              color: '#003C1F', fontWeight: 700, fontSize: 15,
              boxShadow: '0 8px 24px rgba(0,255,133,0.4), inset 0 1px 0 rgba(255,255,255,0.4)',
              cursor: 'pointer',
            }}>Continuar com Pix · CPF</button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button style={{ height: 48, borderRadius: 14, border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, backdropFilter: 'blur(12px)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M22 12.07c0-5.52-4.48-10-10-10S2 6.55 2 12.07c0 4.95 3.6 9.05 8.32 9.86v-6.98H7.9v-2.88h2.42V9.85c0-2.4 1.42-3.72 3.6-3.72 1.04 0 2.13.19 2.13.19v2.35h-1.2c-1.18 0-1.55.74-1.55 1.5v1.8h2.64l-.42 2.88h-2.22v6.98C18.4 21.12 22 17.02 22 12.07z"/></svg>
                Facebook
              </button>
              <button style={{ height: 48, borderRadius: 14, border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, backdropFilter: 'blur(12px)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                Apple
              </button>
            </div>
            <button style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 13, padding: '8px 0', cursor: 'pointer' }}>Já tenho conta · Entrar</button>
          </div>

          <div style={{ marginTop: 14, textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
            Ao continuar você aceita os <span style={{ color: G4 }}>Termos</span> e a <span style={{ color: G4 }}>Política</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SCREEN 7 — SEARCH RESULTS
// ─────────────────────────────────────────────────────────
function SearchScreen() {
  const results = [
    { title: 'Festival do Sol', tag: 'SÁB 30/11', sub: 'Audio Club · SP', price: 90, hue: G4, hue2: V4, badge: 'pulse', dot: true, badgeText: 'esgotando' },
    { title: 'Tropical Heat', tag: 'SEX 22/11', sub: 'Praia do Forte · BA', price: 120, hue: PINK4, hue2: AMBER4, badge: 'amber', badgeText: 'restam 38' },
    { title: 'KVSH no Audio', tag: 'SÁB 14/12', sub: 'Audio Club · SP', price: 70, hue: V4, hue2: C4, badge: 'violet', badgeText: 'premium' },
    { title: 'Boate Roxa edição 7', tag: 'TODA QUI', sub: 'Roxa Club · SP', price: 50, hue: V4, hue2: PINK4, badge: 'cyan', dot: true, badgeText: 'recorrente' },
    { title: 'Sunset Bar — DJ Mau', tag: 'DOM 24/11', sub: 'Cobertura · RJ', price: 0, hue: AMBER4, hue2: PINK4, badge: 'pulse', badgeText: 'livre' },
  ];
  return (
    <div style={{ position: 'relative', width: 390, height: 844, overflow: 'hidden', color: '#fff', fontFamily: 'var(--pp-font-body)' }}>
      <Aurora intensity={0.4}/>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        <StatusBar/>

        {/* Nav with search */}
        <div style={{ padding: '8px 20px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.10)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </div>
          <div style={{
            flex: 1, height: 44, borderRadius: 999,
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(20px)',
            border: '1.5px solid rgba(0,255,133,0.3)',
            display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px',
            boxShadow: '0 0 16px rgba(0,255,133,0.15)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={G4} strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>Audio Club</span>
            <span style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'grid', placeItems: 'center', fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>×</span>
          </div>
        </div>

        {/* Filter chips */}
        <div style={{ padding: '0 20px', display: 'flex', gap: 8, overflow: 'hidden', marginBottom: 14 }}>
          {[
            { label: 'São Paulo', active: true },
            { label: 'Próx. 7 dias' },
            { label: 'Eletrônica' },
            { label: '$ até 100' },
          ].map((c, i) => (
            <div key={c.label} style={{
              padding: '6px 12px', borderRadius: 999, whiteSpace: 'nowrap', fontSize: 12, fontWeight: 600,
              background: c.active ? 'rgba(0,255,133,0.14)' : 'rgba(255,255,255,0.05)',
              color: c.active ? G4 : 'rgba(255,255,255,0.7)',
              border: c.active ? '1px solid rgba(0,255,133,0.3)' : '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {c.label}
              {c.active && <span style={{ fontSize: 10, opacity: 0.7 }}>×</span>}
            </div>
          ))}
        </div>

        {/* Results count */}
        <div style={{ padding: '0 20px 8px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 11, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>
            <span style={{ color: G4 }}>5 resultados</span> · ordenado por relevância
          </div>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>↕</span>
        </div>

        {/* Result list */}
        <div style={{ flex: 1, overflow: 'hidden', padding: '8px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {results.map((r, i) => (
              <div key={i} style={{
                padding: 12, borderRadius: 18,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                display: 'flex', gap: 12, alignItems: 'center',
              }}>
                <div style={{
                  width: 80, height: 100, borderRadius: 12,
                  background: `radial-gradient(80% 80% at 20% 20%, ${r.hue}, transparent 60%), radial-gradient(80% 80% at 80% 80%, ${r.hue2}, transparent 60%), #0a0a0c`,
                  flexShrink: 0,
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <div style={{ position: 'absolute', top: 6, left: 6, padding: '3px 6px', borderRadius: 4, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', fontSize: 8, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{r.tag}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 600, fontSize: 16, letterSpacing: '-0.01em', lineHeight: 1.15 }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>{r.sub}</div>
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <PBadge tone={r.badge} dot={r.dot}>{r.badgeText}</PBadge>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {r.price === 0 ? (
                    <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 13, color: G4 }}>LIVRE</div>
                  ) : (
                    <>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--pp-font-mono)' }}>desde</div>
                      <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 16, color: '#fff', marginTop: 2 }}>R$ {r.price}</div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 100 }}/>
      </div>
      <TabBar active="home"/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SCREEN 8 — PROMOTER (AZList core)
// ─────────────────────────────────────────────────────────
function PromoterScreen() {
  return (
    <div style={{ position: 'relative', width: 390, height: 844, overflow: 'hidden', color: '#fff', fontFamily: 'var(--pp-font-body)' }}>
      <Aurora intensity={0.5}/>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        <StatusBar/>

        {/* Header */}
        <div style={{ padding: '8px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="pp-eyebrow">Promoter mode</div>
              <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 26, letterSpacing: '-0.02em', marginTop: 4 }}>Sua lista</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px 6px 8px', borderRadius: 999, background: 'rgba(167,139,250,0.14)', border: '1px solid rgba(167,139,250,0.3)' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: `linear-gradient(135deg, ${V4}, ${PINK4})`, fontSize: 10, fontWeight: 700, display: 'grid', placeItems: 'center' }}>L</div>
              <span style={{ fontSize: 11, fontWeight: 600, color: V4, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.04em' }}>LIA · TIER 3</span>
            </div>
          </div>
        </div>

        {/* Event selector */}
        <div style={{ padding: '14px 20px 0' }}>
          <div style={{
            padding: 14, borderRadius: 16,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `radial-gradient(${G4}, transparent), ${V4}` }}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Festival do Sol · 30 nov</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="pp-pulse-dot" style={{ width: 6, height: 6 }}/>
                Lista aberta · vira 23h59
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ padding: '14px 20px 0', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { v: '247', l: 'Inscritos', c: V4 },
            { v: '189', l: 'Confirmados', c: G4 },
            { v: 'R$ 2.834', l: 'Comissão', c: PINK4 },
          ].map(k => (
            <div key={k.l} style={{
              padding: 12, borderRadius: 14,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
            }}>
              <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 18, color: k.c }}>{k.v}</div>
              <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{k.l}</div>
            </div>
          ))}
        </div>

        {/* Share card — the AZList magic: personal link */}
        <div style={{ padding: '16px 20px 0' }}>
          <div style={{
            position: 'relative',
            padding: 18, borderRadius: 20,
            background: `linear-gradient(135deg, rgba(167,139,250,0.22), rgba(255,61,136,0.15) 60%, rgba(34,211,238,0.18))`,
            border: '1px solid rgba(167,139,250,0.35)',
            backdropFilter: 'blur(30px) saturate(180%)',
            overflow: 'hidden',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 8px 32px rgba(167,139,250,0.18)',
          }}>
            <div className="pp-eyebrow" style={{ color: V4 }}>Seu link pessoal</div>
            <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 600, fontSize: 16, marginTop: 8, letterSpacing: '-0.01em' }}>
              pulsepass.app/<span style={{ color: V4 }}>lia</span>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>
              Compartilhe no story · cada inscrito pelo seu link conta na comissão.
            </div>
            <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
              {[
                { l: 'Stories', icon: '📷', c: PINK4 },
                { l: 'WhatsApp', icon: '💬', c: G4 },
                { l: 'Copiar', icon: '⎘', c: '#fff' },
              ].map(a => (
                <button key={a.l} style={{
                  flex: 1, height: 42, borderRadius: 12, border: 'none',
                  background: 'rgba(11,13,18,0.5)', backdropFilter: 'blur(12px)',
                  color: a.c, fontSize: 12, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}>
                  <span style={{ fontSize: 14 }}>{a.icon}</span>
                  {a.l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Guest list (recent) */}
        <div style={{ padding: '20px 20px 0', flex: 1, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.01em' }}>Convidados</div>
            <div style={{ display: 'flex', gap: 4, padding: 3, borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {['Todos · 247', 'Check-in · 12'].map((t, i) => (
                <div key={t} style={{
                  padding: '5px 10px', borderRadius: 999, fontSize: 10, fontFamily: 'var(--pp-font-mono)',
                  background: i === 0 ? G4 : 'transparent',
                  color: i === 0 ? '#003C1F' : 'rgba(255,255,255,0.6)',
                  fontWeight: 600,
                }}>{t}</div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { n: 'Bia Carvalho', s: '@biac · CPF ***.***.892-04', tag: 'Pista', tone: G4, in: false, m: 'agora' },
              { n: 'João Mendonça', s: '+ 1 acompanhante', tag: 'Premium', tone: V4, in: true, m: '23h41' },
              { n: 'Caio Ramos', s: 'Aniversariante 🎂', tag: 'VIP', tone: PINK4, in: true, m: '23h18' },
              { n: 'Marina Lopes', s: '@malo · 23 anos', tag: 'Pista', tone: G4, in: false, m: '22h52' },
              { n: 'Pedro Almeida', s: 'Backstage acesso', tag: 'Staff', tone: AMBER4, in: true, m: '22h12' },
            ].map((g, i) => (
              <div key={i} style={{
                padding: '10px 12px', borderRadius: 14,
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${g.tone}30`, border: `1.5px solid ${g.tone}80`, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, color: g.tone, flexShrink: 0 }}>{g.n[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {g.n}
                    {g.in && <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 999, background: 'rgba(0,255,133,0.12)', color: G4, fontFamily: 'var(--pp-font-mono)', fontWeight: 600, letterSpacing: '0.04em' }}>CHECKED-IN</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.s}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <PBadge tone={g.tag === 'VIP' ? 'pink' : g.tag === 'Premium' ? 'violet' : g.tag === 'Staff' ? 'amber' : 'pulse'}>{g.tag}</PBadge>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 4, fontFamily: 'var(--pp-font-mono)' }}>{g.m}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 90 }}/>
      </div>

      {/* Bottom CTA */}
      <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14 }}>
        <button style={{
          width: '100%', height: 54, borderRadius: 18, border: 'none',
          background: `linear-gradient(180deg, #C4B5FD, ${V4})`,
          color: '#1A0040', fontWeight: 700, fontSize: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(167,139,250,0.4), inset 0 1px 0 rgba(255,255,255,0.4)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Adicionar convidado manualmente
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SCREEN 9 — PUBLIC GUEST SIGNUP (AZList public link)
// ─────────────────────────────────────────────────────────
function GuestSignupScreen() {
  return (
    <div style={{ position: 'relative', width: 390, height: 844, overflow: 'hidden', color: '#fff', fontFamily: 'var(--pp-font-body)' }}>
      {/* Hero artwork bg */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(60% 50% at 30% 20%, ${V4}, transparent 60%), radial-gradient(60% 50% at 80% 80%, ${PINK4}, transparent 60%), #06070A` }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(6,7,10,0.92) 70%)' }}/>
      </div>

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        <StatusBar/>

        {/* Promoter chip floating */}
        <div style={{ padding: '8px 20px 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            padding: '8px 14px 8px 8px', borderRadius: 999,
            background: 'rgba(11,13,18,0.5)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.14)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${V4}, ${PINK4})`, fontSize: 11, fontWeight: 700, display: 'grid', placeItems: 'center' }}>L</div>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.06em' }}>convite de</div>
              <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1, marginTop: 2 }}>Lia Coelho</div>
            </div>
          </div>
        </div>

        {/* Hero title */}
        <div style={{ padding: '40px 24px 0' }}>
          <div className="pp-eyebrow" style={{ color: V4 }}>Sábado · 30 nov · 22h</div>
          <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 44, lineHeight: 0.95, letterSpacing: '-0.03em', marginTop: 14 }}>
            Festival<br/>
            <span style={{ color: V4 }}>do Sol</span><br/>
            <span style={{ fontFamily: 'var(--pp-font-serif)', fontStyle: 'italic', fontWeight: 400, color: '#fff', fontSize: 36 }}>edição equinócio</span>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 12 }}>Audio Club · Vila Olímpia, SP</div>
        </div>

        {/* Form glass card */}
        <div style={{ padding: '32px 20px 0', flex: 1, overflow: 'hidden' }}>
          <div style={{
            padding: 18, borderRadius: 22,
            background: 'rgba(11,13,18,0.55)',
            backdropFilter: 'blur(40px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.14)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 12px 32px rgba(0,0,0,0.4)',
          }}>
            <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 600, fontSize: 18, letterSpacing: '-0.01em' }}>Entre na lista da Lia</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>Gratuito até 23h59. Após esse horário, pista vira R$ 90.</div>

            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { l: 'Nome completo', v: 'Bianca Carvalho', valid: true },
                { l: 'CPF', v: '231.***.***-04', valid: true },
                { l: 'WhatsApp', v: '(11) 9 8412-•••• ', valid: true },
                { l: 'Data de nascimento', v: '14 / 03 / 2002', valid: true },
              ].map(f => (
                <div key={f.l}>
                  <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>{f.l}</div>
                  <div style={{
                    height: 42, padding: '0 14px', borderRadius: 12,
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${f.valid ? 'rgba(0,255,133,0.3)' : 'rgba(255,255,255,0.1)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span style={{ fontSize: 13, color: '#fff' }}>{f.v}</span>
                    {f.valid && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={G4} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 14, padding: 12, borderRadius: 12, background: 'rgba(167,139,250,0.10)', border: '1px solid rgba(167,139,250,0.25)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: V4, display: 'grid', placeItems: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1A0040" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div style={{ flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>Quero +1 acompanhante (gratuito)</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '14px 20px 24px' }}>
          <button style={{
            width: '100%', height: 56, borderRadius: 18, border: 'none',
            background: `linear-gradient(180deg, #4DFFA8, ${G4})`,
            color: '#003C1F', fontWeight: 700, fontSize: 15,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            cursor: 'pointer',
            boxShadow: '0 12px 32px rgba(0,255,133,0.4), inset 0 1px 0 rgba(255,255,255,0.4)',
          }}>
            Confirmar inscrição
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </button>
          <div style={{ marginTop: 10, textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
            Anti-fraude PulsePass · ao confirmar você aceita os termos
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { OnboardingScreen, SearchScreen, PromoterScreen, GuestSignupScreen });
