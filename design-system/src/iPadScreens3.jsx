// iPadScreens3.jsx — KDS (cozinha) · Cashier Closing · Reservations (mesas)

const G9 = '#00FF85', V9 = '#A78BFA', C9 = '#22D3EE', PINK9 = '#FF3D88', AMBER9 = '#FFB800';

// ─────────────────────────────────────────────────────────
// SCREEN S — KDS (Kitchen Display System)
// ─────────────────────────────────────────────────────────
function KDSScreen() {
  const orders = [
    { id: '#4720', n: 'Bia C.', loc: 'Mesa 04 · Premium', t: '00:42', items: [
      { q: 1, n: 'Burger artesanal', mods: ['+ bacon', 'sem cebola'] },
      { q: 2, n: 'Batata frita G' },
    ], stat: 'new', tone: G9 },
    { id: '#4721', n: 'Caio R.', loc: 'PDV 01 · Bar Central', t: '01:18', items: [
      { q: 2, n: 'Hot dog premium', mods: ['+ catupiry'] },
    ], stat: 'cooking', tone: AMBER9 },
    { id: '#4722', n: 'Marcos S.', loc: 'PDV 03 · Bar VIP', t: '02:34', items: [
      { q: 1, n: 'Pizza brotinho calabresa' },
      { q: 1, n: 'Combo Vodka + RedBull' },
    ], stat: 'cooking', tone: AMBER9 },
    { id: '#4723', n: 'Lia C.', loc: 'Pedido pelo app', t: '03:12', items: [
      { q: 1, n: 'Burger artesanal', mods: ['point ao ponto'] },
      { q: 1, n: 'Batata frita G' },
      { q: 2, n: 'Caipirinha de limão' },
    ], stat: 'ready', tone: V9 },
    { id: '#4724', n: 'Pedro A.', loc: 'Food Truck Norte', t: '04:55', items: [
      { q: 3, n: 'Hot dog premium' },
    ], stat: 'delivered', tone: 'gray' },
  ];

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', color: '#fff', fontFamily: 'var(--pp-font-body)', background: '#06070A' }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(11,13,18,0.5)', backdropFilter: 'blur(20px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ padding: '8px 14px 8px 10px', borderRadius: 999, background: 'rgba(255,184,0,0.12)', border: '1px solid rgba(255,184,0,0.28)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14 }}>🔥</span>
              <span style={{ fontSize: 11, fontFamily: 'var(--pp-font-mono)', color: AMBER9, fontWeight: 600, letterSpacing: '0.05em' }}>COZINHA · ATIVA</span>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Festival do Sol · 5 pedidos em fila</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Tempo médio: <span style={{ color: G9 }}>4m 12s</span></div>
            <div style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 18, fontWeight: 700, padding: '6px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>23:47</div>
          </div>
        </div>

        {/* Filter pills */}
        <div style={{ padding: '14px 24px', display: 'flex', gap: 8 }}>
          {[
            { l: 'Todos · 5', sel: true },
            { l: 'Novos · 1', c: G9 },
            { l: 'Preparando · 2', c: AMBER9 },
            { l: 'Prontos · 1', c: V9 },
            { l: 'Entregues · 1', c: 'gray' },
          ].map((p, i) => (
            <div key={i} style={{
              padding: '8px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
              background: p.sel ? 'rgba(255,255,255,0.08)' : p.c === G9 ? 'rgba(0,255,133,0.08)' : p.c === AMBER9 ? 'rgba(255,184,0,0.08)' : p.c === V9 ? 'rgba(167,139,250,0.08)' : 'rgba(255,255,255,0.04)',
              color: p.sel ? '#fff' : p.c === G9 ? G9 : p.c === AMBER9 ? AMBER9 : p.c === V9 ? V9 : 'rgba(255,255,255,0.5)',
              border: '1px solid ' + (p.sel ? 'rgba(255,255,255,0.14)' : p.c === G9 ? 'rgba(0,255,133,0.25)' : p.c === AMBER9 ? 'rgba(255,184,0,0.25)' : p.c === V9 ? 'rgba(167,139,250,0.25)' : 'rgba(255,255,255,0.08)'),
            }}>{p.l}</div>
          ))}
        </div>

        {/* Cards grid */}
        <div style={{ flex: 1, padding: '0 24px 24px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, overflow: 'hidden' }}>
          {orders.map((o, i) => {
            const isReady = o.stat === 'ready';
            const isDelivered = o.stat === 'delivered';
            const isNew = o.stat === 'new';
            return (
              <div key={i} style={{
                position: 'relative',
                borderRadius: 16,
                background: isReady ? 'rgba(167,139,250,0.10)' : isNew ? 'rgba(0,255,133,0.08)' : isDelivered ? 'rgba(255,255,255,0.025)' : 'rgba(255,184,0,0.06)',
                border: '1.5px solid ' + (isReady ? V9 + '60' : isNew ? G9 + '60' : isDelivered ? 'rgba(255,255,255,0.06)' : AMBER9 + '60'),
                boxShadow: !isDelivered ? `0 0 30px ${isReady ? V9 : isNew ? G9 : AMBER9}20, inset 0 1px 0 rgba(255,255,255,0.08)` : 'none',
                display: 'flex', flexDirection: 'column',
                opacity: isDelivered ? 0.45 : 1,
                overflow: 'hidden',
              }}>
                {/* Top stripe */}
                <div style={{ height: 4, background: isReady ? V9 : isNew ? G9 : isDelivered ? '#444' : AMBER9, boxShadow: !isDelivered ? `0 0 8px ${isReady ? V9 : isNew ? G9 : AMBER9}80` : 'none' }}/>

                <div style={{ padding: 14, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.05em' }}>{o.id}</div>
                      <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 16, marginTop: 2, letterSpacing: '-0.01em' }}>{o.n}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 16, color: isNew ? G9 : isReady ? V9 : isDelivered ? 'rgba(255,255,255,0.4)' : AMBER9 }}>{o.t}</div>
                      <div style={{ fontSize: 9, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 2 }}>em fila</div>
                    </div>
                  </div>

                  <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.5)', marginTop: 6, letterSpacing: '0.04em' }}>{o.loc}</div>

                  {/* Items */}
                  <div style={{ marginTop: 12, flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {o.items.map((it, j) => (
                      <div key={j} style={{ padding: '8px 10px', borderRadius: 10, background: 'rgba(0,0,0,0.3)' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                          <span style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 16, color: G9 }}>{it.q}×</span>
                          <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{it.n}</span>
                        </div>
                        {it.mods && it.mods.map((m, k) => (
                          <div key={k} style={{ marginTop: 3, fontSize: 11, color: AMBER9, fontFamily: 'var(--pp-font-mono)', paddingLeft: 22 }}>· {m}</div>
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Action */}
                  <div style={{ marginTop: 12 }}>
                    {isNew && (
                      <button style={{ width: '100%', height: 40, borderRadius: 10, border: 'none', background: G9, color: '#003C1F', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Iniciar preparo</button>
                    )}
                    {o.stat === 'cooking' && (
                      <button style={{ width: '100%', height: 40, borderRadius: 10, border: 'none', background: V9, color: '#1A0040', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Marcar pronto ★</button>
                    )}
                    {isReady && (
                      <button style={{ width: '100%', height: 40, borderRadius: 10, border: 'none', background: '#fff', color: '#06070A', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Entregar →</button>
                    )}
                    {isDelivered && (
                      <div style={{ width: '100%', height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.04)', display: 'grid', placeItems: 'center', fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--pp-font-mono)' }}>✓ entregue 04:55</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SCREEN T — CASHIER CLOSING (Fechamento de Caixa)
// ─────────────────────────────────────────────────────────
function CashierClosingScreen() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', color: '#fff', fontFamily: 'var(--pp-font-body)', background: '#06070A' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(40% 30% at 80% 10%, rgba(0,255,133,0.08), transparent 60%), radial-gradient(40% 30% at 20% 80%, rgba(34,211,238,0.08), transparent 60%), #06070A' }}/>

      <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
        {/* Main */}
        <div style={{ flex: 1, padding: 24, position: 'relative', zIndex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="pp-eyebrow" style={{ color: G9 }}>Fechamento · em 15 min</div>
              <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 32, letterSpacing: '-0.025em', marginTop: 6 }}>
                Caixa <span style={{ fontFamily: 'var(--pp-font-serif)', fontStyle: 'italic', fontWeight: 400, color: G9 }}>03 · Bar Central</span>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>Marcos Silva · turno aberto às 20h00</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ padding: '10px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                🖨️ Imprimir Z
              </button>
              <button style={{ padding: '10px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>📊 Excel</button>
            </div>
          </div>

          {/* Big totals row */}
          <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {[
              { l: 'Total operado', v: 'R$ 14.872', d: '328 transações', c: G9 },
              { l: 'Cashless', v: 'R$ 11.940', d: '80,3% do total', c: C9 },
              { l: 'Pix balcão', v: 'R$ 2.180', d: '14,7%', c: V9 },
              { l: 'Cartão maquininha', v: 'R$ 752', d: '5,0%', c: PINK9 },
            ].map(s => (
              <div key={s.l} style={{ padding: 18, borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: s.c, opacity: 0.7 }}/>
                <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>{s.l}</div>
                <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 26, color: '#fff', marginTop: 6, letterSpacing: '-0.02em' }}>{s.v}</div>
                <div style={{ marginTop: 4, fontSize: 11, color: s.c }}>{s.d}</div>
              </div>
            ))}
          </div>

          {/* Two cols: top products + reconciliation */}
          <div style={{ marginTop: 18, flex: 1, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14, minHeight: 0 }}>
            {/* Top products */}
            <div style={{ padding: 20, borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 600, fontSize: 18, letterSpacing: '-0.015em' }}>Top produtos do turno</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--pp-font-mono)' }}>Estoque atual</div>
              </div>
              <div style={{ marginTop: 14, flex: 1, overflow: 'hidden' }}>
                {[
                  { n: 'Brahma 600ml', sold: 248, of: 500, rev: 4464, c: AMBER9 },
                  { n: 'Combo Vodka + RedBull', sold: 86, of: 150, rev: 3612, c: PINK9 },
                  { n: 'Caipirinha de limão', sold: 142, of: '∞', rev: 3408, c: G9 },
                  { n: 'Heineken Long Neck', sold: 198, of: 350, rev: 2970, c: G9 },
                  { n: 'Gin Tônica premium', sold: 38, of: 80, rev: 1444, c: V9 },
                  { n: 'Água sem gás', sold: 312, of: 500, rev: 2496, c: C9 },
                ].map((p, i) => (
                  <div key={i} style={{ padding: '10px 0', borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.04)' : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 26, fontFamily: 'var(--pp-font-mono)', fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>{(i + 1).toString().padStart(2, '0')}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{p.n}</div>
                      <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                          <div style={{ width: typeof p.of === 'number' ? `${(p.sold / p.of) * 100}%` : '70%', height: '100%', background: p.c, boxShadow: `0 0 6px ${p.c}80` }}/>
                        </div>
                        <span style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.55)' }}>{p.sold}/{p.of}</span>
                      </div>
                    </div>
                    <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 14, minWidth: 80, textAlign: 'right' }}>R$ {p.rev.toLocaleString('pt-BR')}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reconciliation */}
            <div style={{ padding: 20, borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 600, fontSize: 18, letterSpacing: '-0.015em' }}>Conferência</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>Sistema vs. conferido fisicamente</div>

              <div style={{ marginTop: 14, flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { l: 'Dinheiro físico', sys: 0, real: 0, ok: true, sub: 'sem dinheiro (cashless)' },
                  { l: 'Cartão (adquirência)', sys: 752, real: 752, ok: true },
                  { l: 'Pix balcão', sys: 2180, real: 2180, ok: true },
                  { l: 'Estorno aprovado', sys: 38, real: null, sub: '2 estornos no turno' },
                ].map((r, i) => (
                  <div key={i} style={{
                    padding: 12, borderRadius: 12,
                    background: r.ok ? 'rgba(0,255,133,0.06)' : r.real === null ? 'rgba(255,255,255,0.04)' : 'rgba(255,184,0,0.08)',
                    border: '1px solid ' + (r.ok ? 'rgba(0,255,133,0.2)' : 'rgba(255,255,255,0.08)'),
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{r.l}</span>
                      {r.ok && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={G9} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                    <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{r.sub || 'sistema'}</span>
                      <span style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 14, color: r.ok ? G9 : '#fff' }}>R$ {r.sys.toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 14, padding: 14, borderRadius: 12, background: `linear-gradient(135deg, rgba(0,255,133,0.16), rgba(34,211,238,0.10))`, border: '1px solid rgba(0,255,133,0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>Diferença</span>
                  <span style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 18, color: G9 }}>R$ 0,00</span>
                </div>
                <div style={{ marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: G9, boxShadow: `0 0 6px ${G9}` }}/>
                  Caixa bate · pronto pra fechar
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right action panel */}
        <div style={{
          width: 320, borderLeft: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(11,13,18,0.5)', backdropFilter: 'blur(20px)',
          padding: 20, position: 'relative', zIndex: 1,
          display: 'flex', flexDirection: 'column',
        }}>
          <div className="pp-label" style={{ marginBottom: 14 }}>Pré-visualização do Z</div>
          <div style={{
            padding: 18, borderRadius: 14,
            background: '#F5F3EE', color: '#06070A',
            fontFamily: 'var(--pp-font-mono)', fontSize: 11, lineHeight: 1.6,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}>
            <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 12 }}>PULSEPASS · CUPOM Z</div>
            <div style={{ textAlign: 'center', marginTop: 2, fontSize: 10 }}>CNPJ 14.512.528/0001-54</div>
            <div style={{ marginTop: 10, borderTop: '1px dashed rgba(0,0,0,0.2)', paddingTop: 8 }}>
              <div>Evento: Festival do Sol</div>
              <div>PDV: 03 — Bar Central</div>
              <div>Operador: Marcos Silva</div>
              <div>Abertura: 30/11 20:00</div>
              <div>Fechamento: 30/11 23:47</div>
            </div>
            <div style={{ marginTop: 8, borderTop: '1px dashed rgba(0,0,0,0.2)', paddingTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Cashless</span><span>R$ 11.940,00</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Pix balcão</span><span>R$ 2.180,00</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Cartão</span><span>R$ 752,00</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Estornos</span><span>R$ −38,00</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, paddingTop: 4, borderTop: '1px solid rgba(0,0,0,0.3)', fontWeight: 700 }}><span>TOTAL</span><span>R$ 14.834,00</span></div>
            </div>
            <div style={{ marginTop: 8, borderTop: '1px dashed rgba(0,0,0,0.2)', paddingTop: 8, fontSize: 9, textAlign: 'center' }}>
              328 transações · 6 produtos<br/>
              SAT 19385 · NSU 4720
            </div>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button style={{
              width: '100%', height: 52, borderRadius: 14, border: 'none',
              background: `linear-gradient(180deg, #4DFFA8, ${G9})`,
              color: '#003C1F', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0,255,133,0.35), inset 0 1px 0 rgba(255,255,255,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              Confirmar fechamento
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
            <button style={{ width: '100%', height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Reportar divergência</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SCREEN U — RESERVATIONS / TABLE MANAGEMENT
// ─────────────────────────────────────────────────────────
function ReservationsScreen() {
  // Build a fake floor plan
  const tables = [
    { id: 1, x: 80, y: 100, w: 70, h: 70, st: 'free', cap: 4 },
    { id: 2, x: 180, y: 100, w: 70, h: 70, st: 'occupied', cap: 4, name: 'Caio R.', spend: 287, time: '2h 12m' },
    { id: 3, x: 280, y: 100, w: 70, h: 70, st: 'reserved', cap: 4, name: 'Souza', time: '23h' },
    { id: 4, x: 380, y: 100, w: 70, h: 70, st: 'occupied', cap: 4, name: 'Marina L.', spend: 412, time: '1h 38m', vip: true },
    { id: 5, x: 80, y: 220, w: 70, h: 70, st: 'occupied', cap: 6, name: 'Reis', spend: 624, time: '3h 04m' },
    { id: 6, x: 180, y: 220, w: 70, h: 70, st: 'free', cap: 6 },
    { id: 7, x: 280, y: 220, w: 100, h: 70, st: 'occupied', cap: 8, name: 'Lima x9', spend: 1240, time: '4h 12m' },
    { id: 8, x: 80, y: 340, w: 220, h: 70, st: 'occupied', cap: 12, name: 'Aniversário Bia', spend: 2180, time: '2h 47m', vip: true },
    { id: 9, x: 320, y: 340, w: 130, h: 70, st: 'reserved', cap: 10, name: 'Almeida', time: '00h' },
  ];

  const statusColor = (s) => s === 'free' ? G9 : s === 'occupied' ? AMBER9 : V9;
  const statusBg = (s) => s === 'free' ? 'rgba(0,255,133,0.10)' : s === 'occupied' ? 'rgba(255,184,0,0.15)' : 'rgba(167,139,250,0.15)';

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', color: '#fff', fontFamily: 'var(--pp-font-body)', background: '#06070A', display: 'flex' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(40% 30% at 80% 10%, rgba(0,255,133,0.06), transparent 60%), #06070A' }}/>

      {/* Floor plan */}
      <div style={{ flex: 1, position: 'relative', zIndex: 1, padding: 24, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="pp-eyebrow" style={{ color: AMBER9 }}>Mesas · ao vivo</div>
            <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 28, letterSpacing: '-0.025em', marginTop: 4 }}>Audio Club · planta baixa</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {[{ l: 'Livres', v: 2, c: G9 }, { l: 'Ocupadas', v: 5, c: AMBER9 }, { l: 'Reservadas', v: 2, c: V9 }].map(s => (
              <div key={s.l} style={{ padding: '8px 14px', borderRadius: 12, background: `${s.c}10`, border: `1px solid ${s.c}30` }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>{s.l}</div>
                <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 18, color: s.c }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floor */}
        <div style={{ flex: 1, marginTop: 18, borderRadius: 18, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
          {/* Grid bg */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }}>
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M40 0L0 0L0 40" fill="none" stroke="#fff" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)"/>
          </svg>

          {/* Stage zone */}
          <div style={{ position: 'absolute', top: 16, left: 80, right: 80, height: 50, borderRadius: 8, background: `linear-gradient(180deg, rgba(167,139,250,0.18), rgba(167,139,250,0.05))`, border: '1px solid rgba(167,139,250,0.3)', display: 'grid', placeItems: 'center' }}>
            <span style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 11, letterSpacing: '0.2em', color: V9, fontWeight: 600 }}>STAGE · ANYMA 22h</span>
          </div>

          {/* Tables */}
          {tables.map(t => (
            <div key={t.id} style={{
              position: 'absolute',
              left: t.x, top: t.y, width: t.w, height: t.h,
              borderRadius: 12,
              background: statusBg(t.st),
              border: `1.5px solid ${statusColor(t.st)}`,
              boxShadow: t.st === 'occupied' ? `0 0 20px ${statusColor(t.st)}30` : 'none',
              display: 'flex', flexDirection: 'column',
              padding: 8,
              cursor: 'pointer',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 12, color: statusColor(t.st) }}>M{String(t.id).padStart(2, '0')}</span>
                {t.vip && <span style={{ fontSize: 11 }}>★</span>}
              </div>
              <div style={{ marginTop: 'auto' }}>
                {t.name ? (
                  <>
                    <div style={{ fontSize: 10, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#fff' }}>{t.name}</div>
                    {t.spend && <div style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 9, color: G9, marginTop: 1 }}>R$ {t.spend}</div>}
                    {t.time && <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--pp-font-mono)', marginTop: 1 }}>{t.st === 'reserved' ? '→ ' : ''}{t.time}</div>}
                  </>
                ) : (
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)' }}>livre · {t.cap}p</div>
                )}
              </div>
            </div>
          ))}

          {/* Bar zone label */}
          <div style={{ position: 'absolute', top: 100, right: 16, padding: '6px 10px', borderRadius: 6, background: 'rgba(0,255,133,0.10)', border: '1px solid rgba(0,255,133,0.25)', fontSize: 9, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.15em', color: G9, fontWeight: 600 }}>BAR</div>
          <div style={{ position: 'absolute', bottom: 16, right: 16, padding: '6px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 9, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>SAÍDA</div>
        </div>
      </div>

      {/* Right rail */}
      <div style={{
        width: 340, borderLeft: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(11,13,18,0.5)', backdropFilter: 'blur(20px)',
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Selected table (M02) */}
        <div style={{ padding: 18, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div className="pp-label">Mesa selecionada</div>
              <div style={{ marginTop: 4, fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em' }}>M08 · Aniversário Bia</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>12 pessoas · setor central</div>
            </div>
            <PBadge tone="amber" dot>ocupada · 2h47</PBadge>
          </div>
          <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { l: 'Consumo', v: 'R$ 2.180', c: G9 },
              { l: 'Por pessoa', v: 'R$ 182', c: V9 },
              { l: 'Itens', v: '38', c: C9 },
            ].map(k => (
              <div key={k.l} style={{ padding: 10, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 14, color: k.c }}>{k.v}</div>
                <div style={{ fontSize: 9, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{k.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Next reservations */}
        <div style={{ padding: 18, flex: 1, overflow: 'hidden' }}>
          <div className="pp-label" style={{ marginBottom: 12 }}>Próximas reservas · esta noite</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { h: '23h00', n: 'Souza', m: 'M03', p: 4, t: '15min', st: 'next' },
              { h: '00h00', n: 'Almeida', m: 'M09', p: 10, t: '1h13min' },
              { h: '00h30', n: 'Pereira', m: 'M01 (livre)', p: 4, t: '1h43min' },
              { h: '01h00', n: 'Costa Group', m: 'M06 (livre)', p: 6, t: '2h13min', vip: true },
            ].map((r, i) => (
              <div key={i} style={{
                padding: 12, borderRadius: 12,
                background: r.st === 'next' ? 'rgba(167,139,250,0.10)' : 'rgba(255,255,255,0.03)',
                border: r.st === 'next' ? `1px solid ${V9}50` : '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{ width: 48, textAlign: 'center', padding: '6px 0', borderRadius: 8, background: 'rgba(0,0,0,0.3)', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 13, color: V9 }}>{r.h}</div>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--pp-font-mono)', marginTop: 1 }}>{r.t}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {r.n}
                    {r.vip && <span style={{ color: AMBER9, fontSize: 10 }}>★</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{r.m} · {r.p} pessoas</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action */}
        <div style={{ padding: 18, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button style={{
            width: '100%', height: 48, borderRadius: 14, border: 'none',
            background: `linear-gradient(180deg, #4DFFA8, ${G9})`,
            color: '#003C1F', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 4px 16px rgba(0,255,133,0.35)',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nova reserva
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { KDSScreen, CashierClosingScreen, ReservationsScreen });
