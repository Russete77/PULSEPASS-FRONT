// Gaps1.jsx — Seat Map (Sympla) · Totem self-checkout (Zig) · Estoque/CMV (produtora)

const GG = '#00FF85', VG = '#A78BFA', CG = '#22D3EE', PINKG = '#FF3D88', AMBERG = '#FFB800', REDG = '#FF3B30';

function PSideG({ active }) {
  const items = [
    { k: 'overview', i: '◐' }, { k: 'events', i: '▦' }, { k: 'sales', i: '⤿' },
    { k: 'finance', i: '$' }, { k: 'marketing', i: '★' }, { k: 'boxoffice', i: '⊞' },
    { k: 'stock', i: '◰' }, { k: 'guests', i: '☷' }, { k: 'team', i: '◇' },
  ];
  return (
    <div style={{ width: 72, padding: '20px 12px', borderRight: '1px solid rgba(255,255,255,0.06)', background: 'rgba(11,13,18,0.4)', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
      <svg width="32" height="32" viewBox="0 0 64 64" style={{ marginBottom: 12 }}>
        <circle cx="32" cy="32" r="22" fill="none" stroke={GG} strokeWidth="2"/>
        <path d="M14 32 L22 32 L26 24 L30 40 L34 22 L38 38 L42 32 L50 32" fill="none" stroke={GG} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {items.map(it => {
        const sel = it.k === active;
        return (
          <div key={it.k} style={{
            width: 48, height: 48, borderRadius: 12,
            background: sel ? 'rgba(0,255,133,0.10)' : 'transparent',
            border: sel ? '1px solid rgba(0,255,133,0.3)' : '1px solid transparent',
            color: sel ? GG : 'rgba(255,255,255,0.55)',
            fontSize: 16, fontWeight: 600, display: 'grid', placeItems: 'center',
          }}>{it.i}</div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SEAT MAP — Reserved seating (Sympla/teatro)
// ─────────────────────────────────────────────────────────
function SeatMapScreen() {
  // Generate seat sections
  const renderSection = (rows, cols, startRow, prefix, soldSeed, tone) => {
    const seats = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const seed = (idx * 37 + soldSeed) % 100;
        const state = seed > 62 ? 'sold' : seed > 56 ? 'selected' : 'free';
        seats.push({ id: `${prefix}${String.fromCharCode(65 + startRow + r)}${c + 1}`, r, c, state });
      }
    }
    return seats;
  };

  const Seat = ({ s, tone }) => {
    const colors = {
      free: { bg: `${tone}20`, br: `${tone}50` },
      sold: { bg: 'rgba(255,255,255,0.04)', br: 'rgba(255,255,255,0.06)' },
      selected: { bg: GG, br: GG },
    };
    const c = colors[s.state];
    return (
      <div style={{
        width: 16, height: 16, borderRadius: 4,
        background: c.bg, border: `1px solid ${c.br}`,
        boxShadow: s.state === 'selected' ? `0 0 8px ${GG}` : 'none',
      }}/>
    );
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', color: '#fff', fontFamily: 'var(--pp-font-body)', background: '#06070A', display: 'flex' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(50% 40% at 50% 0%, rgba(167,139,250,0.10), transparent 60%), #06070A' }}/>

      {/* Map area */}
      <div style={{ flex: 1, position: 'relative', zIndex: 1, padding: 24, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="pp-eyebrow" style={{ color: VG }}>Ingresso numerado · Sympla mode</div>
            <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 26, letterSpacing: '-0.025em', marginTop: 4 }}>Escolha seu lugar · <span style={{ fontFamily: 'var(--pp-font-serif)', fontStyle: 'italic', fontWeight: 400, color: VG }}>Teatro Bradesco</span></div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { l: 'Disponível', c: VG, fill: false },
              { l: 'Selecionado', c: GG, fill: true },
              { l: 'Vendido', c: 'rgba(255,255,255,0.25)', fill: true },
            ].map(le => (
              <div key={le.l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: le.fill ? le.c : `${le.c}20`, border: `1px solid ${le.c}${le.fill ? '' : '60'}` }}/>
                {le.l}
              </div>
            ))}
          </div>
        </div>

        {/* Stage */}
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '60%', height: 36, borderRadius: '0 0 40px 40px', background: `linear-gradient(180deg, ${VG}40, ${VG}10)`, border: `1px solid ${VG}40`, borderTop: 'none', display: 'grid', placeItems: 'center' }}>
            <span style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 12, letterSpacing: '0.3em', color: VG, fontWeight: 600 }}>PALCO</span>
          </div>
        </div>

        {/* Seat sections */}
        <div style={{ flex: 1, marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, overflow: 'hidden' }}>
          {/* Plateia A (premium) */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', color: CG, marginBottom: 8 }}>Plateia Premium · R$ 280</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
              {Array.from({ length: 4 }).map((_, r) => (
                <div key={r} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <span style={{ width: 16, fontSize: 9, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>{String.fromCharCode(65 + r)}</span>
                  {Array.from({ length: 20 }).map((_, c) => {
                    const seed = (r * 20 + c) * 31 % 100;
                    const state = seed > 70 ? 'sold' : (r === 1 && (c === 9 || c === 10)) ? 'selected' : 'free';
                    return <Seat key={c} s={{ state }} tone={CG}/>;
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Plateia B */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', color: VG, marginBottom: 8 }}>Plateia · R$ 180</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
              {Array.from({ length: 6 }).map((_, r) => (
                <div key={r} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <span style={{ width: 16, fontSize: 9, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>{String.fromCharCode(69 + r)}</span>
                  {Array.from({ length: 24 }).map((_, c) => {
                    const seed = (r * 24 + c) * 37 % 100;
                    const state = seed > 64 ? 'sold' : 'free';
                    return <Seat key={c} s={{ state }} tone={VG}/>;
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Balcão */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', color: GG, marginBottom: 8 }}>Balcão · R$ 90</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
              {Array.from({ length: 3 }).map((_, r) => (
                <div key={r} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <span style={{ width: 16, fontSize: 9, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>{String.fromCharCode(75 + r)}</span>
                  {Array.from({ length: 28 }).map((_, c) => {
                    const seed = (r * 28 + c) * 41 % 100;
                    const state = seed > 58 ? 'sold' : 'free';
                    return <Seat key={c} s={{ state }} tone={GG}/>;
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right: selection */}
      <div style={{ width: 340, borderLeft: '1px solid rgba(255,255,255,0.06)', background: 'rgba(11,13,18,0.5)', backdropFilter: 'blur(20px)', padding: 20, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="pp-label" style={{ marginBottom: 14 }}>Seus assentos · 2</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { seat: 'Premium · B10', price: 280 },
            { seat: 'Premium · B11', price: 280 },
          ].map((s, i) => (
            <div key={i} style={{ padding: 14, borderRadius: 14, background: 'rgba(0,255,133,0.06)', border: '1px solid rgba(0,255,133,0.25)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: GG, display: 'grid', placeItems: 'center', color: '#003C1F', fontWeight: 700, fontSize: 13, fontFamily: 'var(--pp-font-mono)' }}>{s.seat.split('· ')[1]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{s.seat}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--pp-font-mono)' }}>R$ {s.price},00</div>
              </div>
              <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>×</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16, padding: 14, borderRadius: 14, background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.2)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={CG} strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>Assentos reservados por <b style={{ color: '#fff' }}>8 minutos</b>. Lugares juntos garantidos.</div>
        </div>

        <div style={{ flex: 1 }}/>

        <div style={{ paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Total · 2 assentos</span>
            <span style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 24 }}>R$ <span style={{ color: GG }}>560</span></span>
          </div>
          <button style={{
            width: '100%', height: 54, borderRadius: 16, border: 'none',
            background: `linear-gradient(180deg, #4DFFA8, ${GG})`,
            color: '#003C1F', fontWeight: 700, fontSize: 15, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 8px 24px rgba(0,255,133,0.4), inset 0 1px 0 rgba(255,255,255,0.4)',
          }}>
            Continuar · checkout
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// TOTEM — Self-checkout (Zig)
// ─────────────────────────────────────────────────────────
function TotemScreen() {
  const products = [
    { n: 'Brahma 600ml', p: 18, ic: '🍺', c: AMBERG },
    { n: 'Heineken LN', p: 15, ic: '🍺', c: GG },
    { n: 'Caipirinha', p: 24, ic: '🍹', c: GG },
    { n: 'Gin Tônica', p: 38, ic: '🍸', c: VG },
    { n: 'Combo Vodka', p: 42, ic: '🥤', c: PINKG },
    { n: 'Red Bull', p: 18, ic: '⚡', c: PINKG },
    { n: 'Água', p: 8, ic: '💧', c: CG },
    { n: 'Burger', p: 32, ic: '🍔', c: AMBERG },
    { n: 'Batata G', p: 24, ic: '🍟', c: AMBERG },
  ];
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', color: '#fff', fontFamily: 'var(--pp-font-body)', overflow: 'hidden' }}>
      {/* Big aurora — totem is full-attention */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(50% 40% at 25% 15%, rgba(0,255,133,0.20), transparent 60%), radial-gradient(50% 40% at 80% 85%, rgba(167,139,250,0.18), transparent 60%), #06070A` }}/>

      <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
        {/* Products */}
        <div style={{ flex: 1, position: 'relative', zIndex: 1, padding: 32, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <svg width="44" height="44" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="22" fill="none" stroke={GG} strokeWidth="2.5"/>
                <path d="M14 32 L22 32 L26 24 L30 40 L34 22 L38 38 L42 32 L50 32" fill="none" stroke={GG} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>
                <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 28, letterSpacing: '-0.02em' }}>Autoatendimento</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--pp-font-mono)' }}>Totem 02 · Bar Central · toque para pedir</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 999, background: 'rgba(0,255,133,0.10)', border: '1px solid rgba(0,255,133,0.25)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: GG, boxShadow: `0 0 8px ${GG}` }}/>
              <span style={{ fontSize: 13, fontFamily: 'var(--pp-font-mono)', color: GG, fontWeight: 600 }}>ONLINE</span>
            </div>
          </div>

          {/* Category tabs */}
          <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
            {['Tudo', 'Cervejas', 'Drinks', 'Combos', 'Comidas'].map((c, i) => (
              <div key={c} style={{
                padding: '14px 24px', borderRadius: 16, fontSize: 16, fontWeight: 600,
                background: i === 0 ? GG : 'rgba(255,255,255,0.05)',
                color: i === 0 ? '#003C1F' : 'rgba(255,255,255,0.85)',
                border: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.1)',
              }}>{c}</div>
            ))}
          </div>

          {/* Big product grid */}
          <div style={{ flex: 1, marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridAutoRows: '1fr', gap: 18, overflow: 'hidden' }}>
            {products.map((p, i) => (
              <div key={i} style={{
                borderRadius: 22, padding: 20,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, background: p.c, opacity: 0.6 }}/>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: `${p.c}20`, border: `1px solid ${p.c}40`, display: 'grid', placeItems: 'center', fontSize: 34 }}>{p.ic}</div>
                  <button style={{ width: 48, height: 48, borderRadius: 14, background: GG, color: '#003C1F', border: 'none', fontSize: 26, fontWeight: 700, cursor: 'pointer', boxShadow: `0 4px 16px ${GG}50` }}>+</button>
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 600, marginTop: 14 }}>{p.n}</div>
                  <div style={{ marginTop: 4, fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 24, color: '#fff' }}>R$ {p.p},00</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart side */}
        <div style={{ width: 380, borderLeft: '1px solid rgba(255,255,255,0.06)', background: 'rgba(11,13,18,0.6)', backdropFilter: 'blur(30px)', padding: 28, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 24, letterSpacing: '-0.02em' }}>Seu pedido</div>

          <div style={{ marginTop: 20, flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { n: 'Brahma 600ml', q: 2, p: 18, ic: '🍺' },
              { n: 'Combo Vodka', q: 1, p: 42, ic: '🥤' },
            ].map((c, i) => (
              <div key={i} style={{ padding: 14, borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center', fontSize: 24 }}>{c.ic}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{c.n}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--pp-font-mono)', marginTop: 2 }}>R$ {c.p},00</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', color: '#fff', fontSize: 18, cursor: 'pointer' }}>−</button>
                  <span style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 18, minWidth: 24, textAlign: 'center' }}>{c.q}</span>
                  <button style={{ width: 36, height: 36, borderRadius: 10, background: GG, color: '#003C1F', border: 'none', fontSize: 18, fontWeight: 700, cursor: 'pointer' }}>+</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
              <span style={{ fontSize: 16, fontWeight: 600 }}>Total</span>
              <span style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 32 }}>R$ <span style={{ color: GG }}>78</span>,00</span>
            </div>
            <button style={{
              width: '100%', height: 72, borderRadius: 20, border: 'none',
              background: `linear-gradient(180deg, #4DFFA8, ${GG})`,
              color: '#003C1F', fontWeight: 700, fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              boxShadow: '0 12px 32px rgba(0,255,133,0.4), inset 0 1px 0 rgba(255,255,255,0.4)',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h7v7"/></svg>
              Pagar · aproxime pulseira
            </button>
            <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
              <button style={{ flex: 1, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>QR / Pix</button>
              <button style={{ flex: 1, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Cartão</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// ESTOQUE / CMV (produtora)
// ─────────────────────────────────────────────────────────
function StockScreen() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', color: '#fff', fontFamily: 'var(--pp-font-body)', background: '#06070A', display: 'flex' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(40% 30% at 80% 10%, rgba(255,184,0,0.08), transparent 60%), radial-gradient(40% 30% at 20% 90%, rgba(0,255,133,0.06), transparent 60%), #06070A' }}/>
      <PSideG active="stock"/>

      <div style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px 6px 6px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${VG}, ${PINKG})`, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700 }}>AC</div>
            <div><div style={{ fontSize: 12, fontWeight: 600 }}>Audio Club</div><div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--pp-font-mono)' }}>Festival do Sol</div></div>
          </div>
          <button style={{ padding: '10px 16px', borderRadius: 12, background: `linear-gradient(180deg, ${AMBERG}, #E6A600)`, color: '#06070A', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', boxShadow: '0 4px 16px rgba(255,184,0,0.35)' }}>+ Entrada de estoque</button>
        </div>

        <div style={{ flex: 1, padding: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div className="pp-eyebrow" style={{ color: AMBERG }}>Estoque & CMV</div>
            <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 28, letterSpacing: '-0.025em', marginTop: 4 }}>Onde o lucro <span style={{ fontFamily: 'var(--pp-font-serif)', fontStyle: 'italic', fontWeight: 400, color: AMBERG }}>realmente mora</span></div>
          </div>

          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { l: 'CMV médio', v: '31,2%', d: 'meta < 35%', c: GG },
              { l: 'Margem bruta', v: '68,8%', d: 'R$ 32.940 lucro', c: GG },
              { l: 'Rupturas hoje', v: '2', d: 'Gin · Pizza', c: REDG },
              { l: 'Valor em estoque', v: 'R$ 84.200', d: '1.842 itens', c: VG },
            ].map(k => (
              <div key={k.l} style={{ padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: k.c, opacity: 0.7 }}/>
                <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>{k.l}</div>
                <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 22, color: '#fff', marginTop: 4 }}>{k.v}</div>
                <div style={{ marginTop: 3, fontSize: 10, color: k.c }}>{k.d}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div style={{ flex: 1, overflow: 'hidden', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 16px', display: 'grid', gridTemplateColumns: '2fr 100px 100px 110px 110px 90px 1fr', gap: 12, background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)', alignItems: 'center' }}>
              {['Produto', 'Custo un.', 'Venda un.', 'Margem', 'Vendidos', 'Estoque', 'Nível'].map(h => (
                <div key={h} style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>{h}</div>
              ))}
            </div>
            {[
              { n: 'Brahma 600ml', ic: '🍺', cost: 6.2, sell: 18, sold: 248, stock: 252, max: 500, c: GG },
              { n: 'Heineken Long Neck', ic: '🍺', cost: 5.8, sell: 15, sold: 198, stock: 152, max: 350, c: GG },
              { n: 'Caipirinha de limão', ic: '🍹', cost: 4.5, sell: 24, sold: 142, stock: '∞', max: null, c: GG },
              { n: 'Gin Tônica premium', ic: '🍸', cost: 14.2, sell: 38, sold: 38, stock: 2, max: 80, c: REDG, low: true },
              { n: 'Combo Vodka + RedBull', ic: '🥤', cost: 18.4, sell: 42, sold: 86, stock: 64, max: 150, c: GG },
              { n: 'Burger artesanal', ic: '🍔', cost: 12.8, sell: 32, sold: 124, stock: 28, max: 200, c: AMBERG, mid: true },
              { n: 'Pizza brotinho', ic: '🍕', cost: 9.5, sell: 28, sold: 82, stock: 0, max: 100, c: REDG, out: true },
            ].map((p, i) => {
              const margin = ((p.sell - p.cost) / p.sell * 100).toFixed(0);
              const stockPct = p.max ? (typeof p.stock === 'number' ? p.stock / p.max * 100 : 100) : 100;
              return (
                <div key={i} style={{
                  padding: '12px 16px', display: 'grid', gridTemplateColumns: '2fr 100px 100px 110px 110px 90px 1fr', gap: 12,
                  borderBottom: i < 6 ? '1px solid rgba(255,255,255,0.04)' : 'none', alignItems: 'center',
                  background: p.out ? 'rgba(255,59,48,0.04)' : i % 2 === 1 ? 'rgba(255,255,255,0.012)' : 'transparent',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center', fontSize: 16 }}>{p.ic}</div>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{p.n}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>R$ {p.cost.toFixed(2).replace('.', ',')}</span>
                  <span style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 12, color: '#fff', fontWeight: 600 }}>R$ {p.sell},00</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 13, fontWeight: 700, color: margin > 60 ? GG : margin > 45 ? AMBERG : REDG }}>{margin}%</span>
                  </div>
                  <span style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{p.sold}</span>
                  <span style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 12, fontWeight: 600, color: p.out ? REDG : p.low ? REDG : p.mid ? AMBERG : '#fff' }}>{p.stock}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {p.out ? (
                      <PBadge tone="red">ruptura</PBadge>
                    ) : p.low ? (
                      <PBadge tone="red" dot>crítico</PBadge>
                    ) : p.mid ? (
                      <PBadge tone="amber">repor</PBadge>
                    ) : (
                      <div style={{ flex: 1, height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{ width: `${stockPct}%`, height: '100%', background: p.c, boxShadow: `0 0 6px ${p.c}80` }}/>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Alert footer */}
          <div style={{ padding: 14, borderRadius: 14, background: 'rgba(255,59,48,0.06)', border: '1px solid rgba(255,59,48,0.2)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={REDG} strokeWidth="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>2 produtos em ruptura · Pulse AI sugere reposição</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>Pizza brotinho zerou às 23h12 (perdeu ~R$ 540 em vendas). Gin Premium acaba em ~18min no ritmo atual.</div>
            </div>
            <button style={{ padding: '10px 16px', borderRadius: 10, background: REDG, color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Pedir reposição</button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SeatMapScreen, TotemScreen, StockScreen });
