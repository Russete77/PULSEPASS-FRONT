// iPhoneScreens6.jsx — Catalog · Transfer Ticket · Casa Profile · Loyalty

const G8 = '#00FF85', V8 = '#A78BFA', C8 = '#22D3EE', PINK8 = '#FF3D88', AMBER8 = '#FFB800';

// ─────────────────────────────────────────────────────────
// SCREEN 18 — CATALOG (Cidade + Categoria, estilo Sympla discover)
// ─────────────────────────────────────────────────────────
function CatalogScreen() {
  const categories = [
    { l: 'Festas', i: '🪩', c: PINK8 },
    { l: 'Shows', i: '🎤', c: V8 },
    { l: 'Stand-up', i: '🎙️', c: AMBER8 },
    { l: 'Teatro', i: '🎭', c: C8 },
    { l: 'Esporte', i: '⚽', c: G8 },
    { l: 'Gastronomia', i: '🍽️', c: AMBER8 },
    { l: 'Workshop', i: '✦', c: V8 },
    { l: 'Grátis', i: '★', c: G8 },
  ];

  return (
    <div style={{ position: 'relative', width: 390, height: 844, overflow: 'hidden', color: '#fff', fontFamily: 'var(--pp-font-body)' }}>
      <Aurora intensity={0.5}/>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        <StatusBar/>

        {/* Header */}
        <div style={{ padding: '8px 20px 0' }}>
          <div className="pp-eyebrow">Explore</div>
          <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 28, letterSpacing: '-0.025em', marginTop: 2, display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontFamily: 'var(--pp-font-serif)', fontStyle: 'italic', fontWeight: 400, color: G8 }}>São Paulo</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>

        {/* Categories grid */}
        <div style={{ padding: '16px 20px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {categories.map((c, i) => (
              <div key={i} style={{
                aspectRatio: '1', borderRadius: 14,
                background: `radial-gradient(80% 80% at 30% 30%, ${c.c}30, transparent 60%), rgba(255,255,255,0.04)`,
                border: `1px solid ${c.c}30`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
              }}>
                <div style={{ fontSize: 22 }}>{c.i}</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{c.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending strip */}
        <div style={{ padding: '20px 0 0', flex: 1, overflow: 'hidden' }}>
          {/* Section: bombando em SP */}
          <div style={{ padding: '0 20px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', color: PINK8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="pp-pulse-dot" style={{ width: 6, height: 6, background: PINK8 }}/>
                Bombando em SP · 24h
              </div>
              <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.015em', marginTop: 4 }}>+ comprados agora</div>
            </div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 10, overflowX: 'hidden', padding: '0 20px' }}>
            {[
              { t: 'Festival do Sol', n: '#1', hue: G8, hue2: V8, p: 90 },
              { t: 'KVSH no Audio', n: '#2', hue: V8, hue2: C8, p: 70 },
              { t: 'Tropical Heat', n: '#3', hue: PINK8, hue2: AMBER8, p: 120 },
            ].map((e, i) => (
              <div key={i} style={{ width: 160, flexShrink: 0 }}>
                <div style={{
                  position: 'relative', aspectRatio: '4/5', borderRadius: 14,
                  background: `radial-gradient(80% 80% at 30% 30%, ${e.hue}, transparent 60%), radial-gradient(80% 80% at 80% 80%, ${e.hue2}, transparent 60%), #0a0a0c`,
                  overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.85))' }}/>
                  <div style={{ position: 'absolute', top: 8, left: 8, padding: '3px 8px', borderRadius: 999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', fontSize: 10, fontFamily: 'var(--pp-font-mono)', fontWeight: 700, color: PINK8 }}>{e.n}</div>
                  <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10 }}>
                    <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '-0.015em' }}>{e.t}</div>
                    <div style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 11, color: G8, marginTop: 2 }}>R$ {e.p}+</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Final de semana */}
          <div style={{ padding: '20px 20px 0' }}>
            <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', color: G8 }}>Final de semana</div>
            <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.015em', marginTop: 4 }}>Programa pra sábado</div>
          </div>
          <div style={{ padding: '12px 20px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { t: 'Boate Roxa edição 7', d: 'SÁB 23h · Roxa Club', tag: 'eletrônica', tone: V8, hue: V8, hue2: PINK8, p: 50 },
              { t: 'Sunset Bar — DJ Mau', d: 'DOM 19h · Cobertura', tag: 'livre', tone: G8, hue: AMBER8, hue2: PINK8, p: 0 },
            ].map((e, i) => (
              <div key={i} style={{
                padding: 10, borderRadius: 14,
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', gap: 12, alignItems: 'center',
              }}>
                <div style={{ width: 56, height: 70, borderRadius: 10, background: `radial-gradient(80% 80% at 30% 30%, ${e.hue}, transparent 60%), radial-gradient(80% 80% at 80% 80%, ${e.hue2}, transparent 60%), #0a0a0c`, flexShrink: 0 }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{e.t}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>{e.d}</div>
                  <div style={{ marginTop: 6 }}><PBadge tone={e.tone === V8 ? 'violet' : 'pulse'}>{e.tag}</PBadge></div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {e.p === 0 ? <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 13, color: G8 }}>LIVRE</div> : <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 14 }}>R$ {e.p}</div>}
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
// SCREEN 19 — TRANSFER TICKET TO FRIEND
// ─────────────────────────────────────────────────────────
function TransferTicketScreen() {
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
          <div style={{ fontSize: 13, fontWeight: 600 }}>Transferir titularidade</div>
          <div style={{ width: 38, height: 38 }}/>
        </div>

        {/* Ticket preview */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{
            padding: 16, borderRadius: 18,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 56, height: 70, borderRadius: 10, background: `radial-gradient(${G8}, transparent), ${V8}`, flexShrink: 0 }}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>Festival do Sol · 30 nov</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>Pista Premium · PSP-7H29</div>
              <div style={{ marginTop: 6 }}><PBadge tone="violet">Premium</PBadge></div>
            </div>
          </div>
        </div>

        {/* Transfer arrow visual */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px' }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: `linear-gradient(135deg, ${V8}, ${PINK8})`, display: 'grid', placeItems: 'center', fontSize: 24, fontWeight: 700, margin: '0 auto' }}>E</div>
              <div style={{ marginTop: 8, fontSize: 11, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Você</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>Erick</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i === 1 ? G8 : 'rgba(255,255,255,0.2)', boxShadow: i === 1 ? `0 0 8px ${G8}` : 'none' }}/>
              ))}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={G8} strokeWidth="2.5" style={{ marginLeft: 6 }}><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '2px dashed rgba(255,255,255,0.25)', display: 'grid', placeItems: 'center', fontSize: 22, color: 'rgba(255,255,255,0.45)', margin: '0 auto' }}>?</div>
              <div style={{ marginTop: 8, fontSize: 11, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Para</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>Selecionar</div>
            </div>
          </div>
        </div>

        {/* Recipient input */}
        <div style={{ padding: '20px 20px 0' }}>
          <div className="pp-label" style={{ marginBottom: 10 }}>Quem vai receber?</div>
          <div style={{
            height: 50, padding: '0 16px', borderRadius: 14,
            background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(0,255,133,0.3)',
            display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: '0 0 20px rgba(0,255,133,0.12)',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
            <span style={{ fontSize: 14, color: '#fff' }}>+55 11 9 8412-9203</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, fontFamily: 'var(--pp-font-mono)', color: G8 }}>achou ✓</span>
          </div>
          <div style={{ marginTop: 8, padding: 12, borderRadius: 12, background: 'rgba(0,255,133,0.06)', border: '1px solid rgba(0,255,133,0.18)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${C8}, ${G8})`, display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 700 }}>B</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Bianca Carvalho</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--pp-font-mono)' }}>@biac · PulsePass desde 2024</div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={G8} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        </div>

        {/* Frequent contacts */}
        <div style={{ padding: '20px 20px 0' }}>
          <div className="pp-label" style={{ marginBottom: 10 }}>Frequentes</div>
          <div style={{ display: 'flex', gap: 10, overflow: 'hidden' }}>
            {[
              { n: 'Caio', a: 'C', c: PINK8 },
              { n: 'Lia', a: 'L', c: V8 },
              { n: 'Marina', a: 'M', c: AMBER8 },
              { n: 'Pedro', a: 'P', c: C8 },
              { n: 'Júlia', a: 'J', c: G8 },
            ].map(c => (
              <div key={c.n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 56 }}>
                <div style={{ width: 50, height: 50, borderRadius: '50%', background: `linear-gradient(135deg, ${c.c}, ${c.c}99)`, display: 'grid', placeItems: 'center', fontSize: 18, fontWeight: 700, border: '2px solid rgba(255,255,255,0.08)' }}>{c.a}</div>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{c.n}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Note */}
        <div style={{ padding: '20px 20px 0' }}>
          <div className="pp-label" style={{ marginBottom: 8 }}>Recado (opcional)</div>
          <div style={{ padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 13, color: 'rgba(255,255,255,0.7)', minHeight: 64 }}>
            <span style={{ fontFamily: 'var(--pp-font-serif)', fontStyle: 'italic', color: G8 }}>"Bia, esse é o ingresso que combinamos. Te vejo lá!"</span>
          </div>
        </div>

        {/* Security note */}
        <div style={{ padding: '14px 20px 0' }}>
          <div style={{ padding: 12, borderRadius: 12, background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.2)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={AMBER8} strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><path d="m12 1 9 4v6c0 5.5-3.8 10.7-9 12-5.2-1.3-9-6.5-9-12V5z"/></svg>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
              Transferência <b style={{ color: '#fff' }}>irreversível</b> em 24h. Após confirmação dela, o QR sai do seu app e vai pro dela.
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }}/>

        {/* CTA */}
        <div style={{ padding: '14px 20px 28px' }}>
          <button style={{
            width: '100%', height: 54, borderRadius: 18, border: 'none',
            background: `linear-gradient(180deg, #4DFFA8, ${G8})`,
            color: '#003C1F', fontWeight: 700, fontSize: 15,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            cursor: 'pointer',
            boxShadow: '0 12px 32px rgba(0,255,133,0.4), inset 0 1px 0 rgba(255,255,255,0.4)',
          }}>
            Enviar para Bianca
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SCREEN 20 — CASA / PRODUCER PROFILE (follow venue)
// ─────────────────────────────────────────────────────────
function CasaProfileScreen() {
  return (
    <div style={{ position: 'relative', width: 390, height: 844, overflow: 'hidden', color: '#fff', fontFamily: 'var(--pp-font-body)' }}>
      {/* Hero artwork bg */}
      <div style={{ position: 'absolute', inset: 0, top: 0, height: 380, background: `radial-gradient(60% 50% at 50% 30%, ${V8}, transparent 60%), radial-gradient(60% 50% at 20% 90%, ${PINK8}, transparent 60%), #06070A` }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, #06070A 95%)' }}/>
      </div>

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <StatusBar/>

        {/* Nav */}
        <div style={{ padding: '8px 20px', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.14)', display: 'grid', placeItems: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.14)', display: 'grid', placeItems: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
          </div>
        </div>

        {/* Logo + name */}
        <div style={{ padding: '60px 20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: 100, height: 100, borderRadius: 24,
            background: `linear-gradient(135deg, ${V8}, ${PINK8})`,
            display: 'grid', placeItems: 'center',
            border: '4px solid rgba(255,255,255,0.14)',
            boxShadow: '0 20px 40px rgba(167,139,250,0.4)',
          }}>
            <span style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 42, letterSpacing: '-0.04em' }}>AC</span>
          </div>
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 26, letterSpacing: '-0.025em' }}>Audio Club</div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill={G8}><path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" fill={G8} stroke="#06070A" strokeWidth="1.5"/></svg>
          </div>
          <div style={{ marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--pp-font-mono)' }}>@audioclub · Vila Olímpia, SP</div>
        </div>

        {/* Stats */}
        <div style={{ padding: '20px 20px 0', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { v: '247', l: 'eventos', c: G8 },
            { v: '128k', l: 'seguidores', c: V8 },
            { v: '4.9★', l: 'reputação', c: AMBER8 },
          ].map(s => (
            <div key={s.l} style={{ padding: 12, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 18, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Follow CTA */}
        <div style={{ padding: '16px 20px 0', display: 'flex', gap: 8 }}>
          <button style={{
            flex: 1, height: 46, borderRadius: 14, border: 'none',
            background: `linear-gradient(180deg, #4DFFA8, ${G8})`,
            color: '#003C1F', fontWeight: 700, fontSize: 14,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 4px 16px rgba(0,255,133,0.3)',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Seguindo
          </button>
          <button style={{
            flex: 1, height: 46, borderRadius: 14, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)',
            color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer',
            backdropFilter: 'blur(20px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="10" r="3"/><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/></svg>
            Como chegar
          </button>
        </div>

        {/* Bio */}
        <div style={{ padding: '18px 20px 0' }}>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
            <span style={{ fontFamily: 'var(--pp-font-serif)', fontStyle: 'italic', color: G8 }}>"A casa de techno melódico mais querida de SP."</span>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
            Operando desde 2018 · Cap. 2.300 · Cashless 100%
          </div>
        </div>

        {/* Upcoming events */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div className="pp-label">Próximos eventos · 5</div>
            <div style={{ fontSize: 11, color: G8 }}>Ver agenda →</div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { d: '30', m: 'NOV', t: 'Festival do Sol · equinócio', tag: 'pulse', tagText: 'esgotando', p: 90 },
              { d: '07', m: 'DEZ', t: 'Anyma all night long', tag: 'violet', tagText: 'premium', p: 240 },
              { d: '14', m: 'DEZ', t: 'KVSH no Audio', tag: 'pulse', tagText: 'abriu venda', p: 70 },
            ].map((e, i) => (
              <div key={i} style={{ padding: 12, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 50, padding: '6px 0', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 18, lineHeight: 1 }}>{e.d}</div>
                  <div style={{ fontSize: 8, fontFamily: 'var(--pp-font-mono)', color: G8, marginTop: 2, fontWeight: 600, letterSpacing: '0.08em' }}>{e.m}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.t}</div>
                  <div style={{ marginTop: 5 }}><PBadge tone={e.tag}>{e.tagText}</PBadge></div>
                </div>
                <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 13 }}>R$ {e.p}+</div>
              </div>
            ))}
          </div>
        </div>

        {/* Galeria (memórias) */}
        <div style={{ padding: '20px 20px 0' }}>
          <div className="pp-label" style={{ marginBottom: 10 }}>Suas memórias na casa · 11×</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {[V8, PINK8, G8, C8, AMBER8, V8, PINK8, G8].map((c, i) => (
              <div key={i} style={{
                aspectRatio: '1', borderRadius: 8,
                background: `radial-gradient(80% 80% at 30% 30%, ${c}, transparent 60%), #0a0a0c`,
                border: '1px solid rgba(255,255,255,0.06)',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', bottom: 4, right: 4, padding: '2px 4px', borderRadius: 4, background: 'rgba(0,0,0,0.5)', fontSize: 8, fontFamily: 'var(--pp-font-mono)', color: '#fff' }}>{i + 1}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: 90 }}/>
      </div>
      <TabBar active="home"/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SCREEN 21 — LOYALTY / FIDELIDADE
// ─────────────────────────────────────────────────────────
function LoyaltyScreen() {
  return (
    <div style={{ position: 'relative', width: 390, height: 844, overflow: 'hidden', color: '#fff', fontFamily: 'var(--pp-font-body)' }}>
      <Aurora intensity={0.7}/>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        <StatusBar/>

        {/* Header */}
        <div style={{ padding: '8px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="pp-eyebrow" style={{ color: AMBER8 }}>Pulse+ Loyalty</div>
            <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 26, letterSpacing: '-0.02em', marginTop: 2 }}>Recompensas</div>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.10)', display: 'grid', placeItems: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          </div>
        </div>

        {/* Points hero */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{
            position: 'relative',
            padding: 22, borderRadius: 24,
            background: `linear-gradient(135deg, rgba(255,184,0,0.22) 0%, rgba(255,61,136,0.18) 50%, rgba(167,139,250,0.22) 100%), rgba(11,13,18,0.6)`,
            backdropFilter: 'blur(30px) saturate(180%)',
            border: '1px solid rgba(255,184,0,0.3)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 20px 40px rgba(255,184,0,0.15)',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${AMBER8}40, transparent 70%)`, filter: 'blur(20px)' }}/>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="pp-eyebrow" style={{ color: AMBER8 }}>seus pulse points</div>
              <div style={{ fontSize: 18 }}>★</div>
            </div>
            <div style={{ marginTop: 8, fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 48, letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span>1.847</span>
              <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.55)' }}>pts</span>
            </div>
            <div style={{ marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>= R$ 92,35 em créditos</div>

            <div style={{ marginTop: 18, padding: '10px 14px', borderRadius: 12, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Próx. recompensa em 153pts</span>
              <div style={{ width: 100, height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                <div style={{ width: '78%', height: '100%', background: AMBER8, boxShadow: `0 0 8px ${AMBER8}` }}/>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ padding: '16px 20px 0', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { ic: '⚡', l: 'Como ganhar', c: G8 },
            { ic: '↻', l: 'Histórico', c: V8 },
            { ic: '★', l: 'Resgatar', c: AMBER8 },
          ].map((a, i) => (
            <div key={i} style={{
              padding: 12, borderRadius: 14,
              background: `${a.c}10`, border: `1px solid ${a.c}30`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}>
              <div style={{ fontSize: 18, color: a.c }}>{a.ic}</div>
              <span style={{ fontSize: 11, fontWeight: 600 }}>{a.l}</span>
            </div>
          ))}
        </div>

        {/* Rewards available */}
        <div style={{ padding: '24px 20px 0', flex: 1, overflow: 'hidden' }}>
          <div className="pp-label" style={{ marginBottom: 12 }}>Resgate agora</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { t: 'R$ 50 no cashless', s: 'créditos no próximo evento', pts: 1000, ic: '💰', c: G8, av: true },
              { t: 'Upgrade VIP grátis', s: 'na próxima compra', pts: 2500, ic: '★', c: AMBER8, av: false, lock: '653 pts faltam' },
              { t: 'Camisa PulsePass', s: 'edição limitada', pts: 5000, ic: '👕', c: V8, av: false, lock: '3.153 pts faltam' },
              { t: 'Frete grátis na loja', s: 'merchandise', pts: 800, ic: '📦', c: C8, av: true },
            ].map((r, i) => (
              <div key={i} style={{
                padding: 14, borderRadius: 16,
                background: 'rgba(255,255,255,0.03)',
                border: r.av ? `1.5px solid ${r.c}50` : '1px solid rgba(255,255,255,0.08)',
                opacity: r.av ? 1 : 0.65,
                display: 'flex', alignItems: 'center', gap: 12,
                boxShadow: r.av ? `0 0 20px ${r.c}15` : 'none',
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${r.c}25`, border: `1px solid ${r.c}50`, display: 'grid', placeItems: 'center', fontSize: 20 }}>{r.ic}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{r.t}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{r.s}</div>
                </div>
                {r.av ? (
                  <button style={{ padding: '8px 14px', borderRadius: 12, background: r.c, color: r.c === AMBER8 || r.c === G8 || r.c === C8 ? '#06070A' : '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--pp-font-mono)' }}>{r.pts} pts</button>
                ) : (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, fontFamily: 'var(--pp-font-mono)', fontWeight: 700, color: 'rgba(255,255,255,0.55)' }}>{r.pts}pts</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{r.lock}</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* How to earn */}
          <div style={{ marginTop: 16, padding: 14, borderRadius: 16, background: `linear-gradient(135deg, rgba(0,255,133,0.10), rgba(34,211,238,0.06))`, border: '1px solid rgba(0,255,133,0.2)' }}>
            <div className="pp-label" style={{ color: G8 }}>Como ganhar pontos</div>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { l: 'A cada R$ 1 em ingresso', v: '+5 pts' },
                { l: 'A cada R$ 1 cashless', v: '+3 pts' },
                { l: 'Check-in confirmado', v: '+50 pts' },
                { l: 'Indicar amigo', v: '+200 pts' },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none', fontSize: 12 }}>
                  <span style={{ color: 'rgba(255,255,255,0.75)' }}>{r.l}</span>
                  <span style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, color: G8 }}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ height: 100 }}/>
      </div>
      <TabBar active="wallet"/>
    </div>
  );
}

Object.assign(window, { CatalogScreen, TransferTicketScreen, CasaProfileScreen, LoyaltyScreen });
