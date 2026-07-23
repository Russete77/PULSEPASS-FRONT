// Gaps2.jsx — App do Garçom (waiter mobile, table service)

const GW = '#00FF85', VW = '#A78BFA', CW = '#22D3EE', PINKW = '#FF3D88', AMBERW = '#FFB800', REDW = '#FF3B30';

// ─────────────────────────────────────────────────────────
// WAITER APP — comanda na mesa (mobile)
// ─────────────────────────────────────────────────────────
function WaiterScreen() {
  return (
    <div style={{ position: 'relative', width: 390, height: 844, overflow: 'hidden', color: '#fff', fontFamily: 'var(--pp-font-body)' }}>
      <Aurora intensity={0.5}/>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        <StatusBar/>

        {/* Header */}
        <div style={{ padding: '8px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="pp-eyebrow" style={{ color: AMBERW }}>Garçom · turno ativo</div>
            <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 24, letterSpacing: '-0.02em', marginTop: 2 }}>Suas mesas · 5</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px 6px 8px', borderRadius: 999, background: 'rgba(255,184,0,0.14)', border: '1px solid rgba(255,184,0,0.3)' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: `linear-gradient(135deg, ${AMBERW}, ${PINKW})`, fontSize: 11, fontWeight: 700, display: 'grid', placeItems: 'center' }}>R</div>
            <span style={{ fontSize: 11, fontWeight: 600, color: AMBERW, fontFamily: 'var(--pp-font-mono)' }}>RAFA · 10% gorjeta</span>
          </div>
        </div>

        {/* Tonight stats */}
        <div style={{ padding: '14px 20px 0', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { v: 'R$ 3.840', l: 'Vendido', c: GW },
            { v: 'R$ 384', l: 'Gorjeta', c: AMBERW },
            { v: '5/8', l: 'Mesas', c: VW },
          ].map(k => (
            <div key={k.l} style={{ padding: 12, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 16, color: k.c }}>{k.v}</div>
              <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{k.l}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div style={{ padding: '16px 20px 0', display: 'flex', gap: 8 }}>
          {['Minhas · 5', 'Chamados · 2', 'Prontas · 1'].map((t, i) => (
            <div key={t} style={{
              padding: '8px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
              background: i === 0 ? AMBERW : i === 1 ? 'rgba(255,61,136,0.14)' : 'rgba(255,255,255,0.05)',
              color: i === 0 ? '#06070A' : i === 1 ? PINKW : 'rgba(255,255,255,0.7)',
              border: i === 0 ? 'none' : `1px solid ${i === 1 ? 'rgba(255,61,136,0.3)' : 'rgba(255,255,255,0.1)'}`,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {i === 1 && <span className="pp-pulse-dot" style={{ width: 6, height: 6, background: PINKW }}/>}
              {t}
            </div>
          ))}
        </div>

        {/* Table cards */}
        <div style={{ padding: '16px 20px 0', flex: 1, overflow: 'hidden' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { m: 'M08', name: 'Aniversário Bia', ppl: 12, total: 2180, time: '2h47', status: 'calling', items: 38, c: PINKW, vip: true },
              { m: 'M02', name: 'Caio R.', ppl: 4, total: 287, time: '2h12', status: 'ready', items: 6, c: VW },
              { m: 'M05', name: 'Reis', ppl: 6, total: 624, time: '3h04', status: 'open', items: 14, c: GW },
              { m: 'M07', name: 'Lima x9', ppl: 8, total: 1240, time: '4h12', status: 'open', items: 22, c: GW },
              { m: 'M04', name: 'Marina L.', ppl: 4, total: 412, time: '1h38', status: 'calling', items: 9, c: AMBERW, vip: true },
            ].map((t, i) => (
              <div key={i} style={{
                padding: 14, borderRadius: 18,
                background: t.status === 'calling' ? 'rgba(255,61,136,0.08)' : t.status === 'ready' ? 'rgba(167,139,250,0.08)' : 'rgba(255,255,255,0.03)',
                border: t.status === 'calling' ? `1.5px solid ${PINKW}50` : t.status === 'ready' ? `1.5px solid ${VW}50` : '1px solid rgba(255,255,255,0.08)',
                boxShadow: t.status === 'calling' ? `0 0 20px ${PINKW}20` : 'none',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{ width: 54, height: 54, borderRadius: 14, background: `${t.c}25`, border: `1px solid ${t.c}50`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 16, color: t.c }}>{t.m}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{t.name}</span>
                    {t.vip && <span style={{ fontSize: 11 }}>★</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 3, fontFamily: 'var(--pp-font-mono)' }}>{t.ppl} pessoas · {t.items} itens · {t.time}</div>
                  {t.status === 'calling' && <div style={{ marginTop: 6 }}><PBadge tone="pink" dot>chamando garçom</PBadge></div>}
                  {t.status === 'ready' && <div style={{ marginTop: 6 }}><PBadge tone="violet">pedido pronto · entregar</PBadge></div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 16, color: GW }}>R$ {t.total}</div>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" style={{ marginTop: 6, marginLeft: 'auto' }}><path d="m9 18 6-6-6-6"/></svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 90 }}/>

        {/* Bottom action */}
        <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14, display: 'flex', gap: 10 }}>
          <button style={{
            flex: 1, height: 54, borderRadius: 18, border: 'none',
            background: `linear-gradient(180deg, ${AMBERW}, #E6A600)`,
            color: '#06070A', fontWeight: 700, fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(255,184,0,0.35)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Novo pedido na mesa
          </button>
          <button style={{ width: 54, height: 54, borderRadius: 18, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h7v7"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// WAITER — order detail (taking order at table)
// ─────────────────────────────────────────────────────────
function WaiterOrderScreen() {
  return (
    <div style={{ position: 'relative', width: 390, height: 844, overflow: 'hidden', color: '#fff', fontFamily: 'var(--pp-font-body)' }}>
      <Aurora intensity={0.4}/>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        <StatusBar/>

        {/* Nav */}
        <div style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.10)', display: 'grid', placeItems: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Mesa M08 · Aniversário Bia</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--pp-font-mono)' }}>12 pessoas · comanda aberta</div>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(167,139,250,0.14)', border: '1px solid rgba(167,139,250,0.3)', display: 'grid', placeItems: 'center', fontSize: 14 }}>★</div>
        </div>

        {/* Category strip */}
        <div style={{ padding: '14px 20px 0', display: 'flex', gap: 8, overflow: 'hidden' }}>
          {['Drinks', 'Cervejas', 'Combos', 'Comidas', 'Doses'].map((c, i) => (
            <div key={c} style={{
              padding: '8px 14px', borderRadius: 999, whiteSpace: 'nowrap', fontSize: 12, fontWeight: 600,
              background: i === 0 ? GW : 'rgba(255,255,255,0.05)',
              color: i === 0 ? '#003C1F' : 'rgba(255,255,255,0.8)',
              border: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.1)',
            }}>{c}</div>
          ))}
        </div>

        {/* Menu */}
        <div style={{ padding: '16px 20px 0', flex: 1, overflow: 'hidden' }}>
          <div className="pp-label" style={{ marginBottom: 10 }}>Drinks · toque pra adicionar</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { n: 'Caipirinha de limão', p: 24, ic: '🍹', q: 4 },
              { n: 'Moscow Mule', p: 32, ic: '🥃', q: 2 },
              { n: 'Gin Tônica premium', p: 38, ic: '🍸', q: 0 },
              { n: 'Aperol Spritz', p: 36, ic: '🥂', q: 0 },
              { n: 'Negroni', p: 34, ic: '🍸', q: 1 },
            ].map((it, i) => (
              <div key={i} style={{
                padding: 12, borderRadius: 14,
                background: it.q > 0 ? 'rgba(0,255,133,0.06)' : 'rgba(255,255,255,0.03)',
                border: it.q > 0 ? '1px solid rgba(0,255,133,0.25)' : '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center', fontSize: 22 }}>{it.ic}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{it.n}</div>
                  <div style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 13, color: GW, fontWeight: 600, marginTop: 2 }}>R$ {it.p},00</div>
                </div>
                {it.q > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', color: '#fff', fontSize: 16, cursor: 'pointer' }}>−</button>
                    <span style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 16, minWidth: 20, textAlign: 'center' }}>{it.q}</span>
                    <button style={{ width: 30, height: 30, borderRadius: 8, background: GW, color: '#003C1F', border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>+</button>
                  </div>
                ) : (
                  <button style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,255,133,0.12)', border: '1px solid rgba(0,255,133,0.3)', color: GW, fontSize: 18, fontWeight: 700, cursor: 'pointer' }}>+</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom comanda summary */}
        <div style={{
          margin: '10px 14px 14px', padding: 16, borderRadius: 22,
          background: 'rgba(11,13,18,0.7)', backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 12px 32px rgba(0,0,0,0.5)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 11, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>Adicionando · 7 novos itens</div>
              <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 22, marginTop: 4 }}>R$ <span style={{ color: GW }}>248</span>,00</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--pp-font-mono)' }}>comanda total</span>
              <span style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 600, fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>R$ 2.428</span>
            </div>
          </div>
          <button style={{
            width: '100%', marginTop: 14, height: 52, borderRadius: 16, border: 'none',
            background: `linear-gradient(180deg, #4DFFA8, ${GW})`,
            color: '#003C1F', fontWeight: 700, fontSize: 15, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 8px 24px rgba(0,255,133,0.4), inset 0 1px 0 rgba(255,255,255,0.4)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m5 12 5 5L20 7"/></svg>
            Enviar p/ cozinha & bar
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { WaiterScreen, WaiterOrderScreen });
