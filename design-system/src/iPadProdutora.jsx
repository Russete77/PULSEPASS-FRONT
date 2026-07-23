// iPadProdutora.jsx — Multi-event · Financeiro · Marketing · Box Office

const GP = '#00FF85', VP = '#A78BFA', CP = '#22D3EE', PINKP = '#FF3D88', AMBERP = '#FFB800';

// Mini sidebar reusable
function MiniSidebar({ active = 'overview' }) {
  const items = [
    { k: 'overview', i: '◐', l: 'Visão' },
    { k: 'events', i: '▦', l: 'Eventos' },
    { k: 'sales', i: '⤿', l: 'Vendas' },
    { k: 'finance', i: '$', l: 'Financeiro' },
    { k: 'marketing', i: '★', l: 'Marketing' },
    { k: 'boxoffice', i: '⊞', l: 'Box Office' },
    { k: 'guests', i: '☷', l: 'Guests' },
    { k: 'team', i: '◇', l: 'Time' },
  ];
  return (
    <div style={{ width: 72, padding: '20px 12px', borderRight: '1px solid rgba(255,255,255,0.06)', background: 'rgba(11,13,18,0.4)', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
      <svg width="32" height="32" viewBox="0 0 64 64" style={{ marginBottom: 12 }}>
        <circle cx="32" cy="32" r="22" fill="none" stroke={GP} strokeWidth="2"/>
        <path d="M14 32 L22 32 L26 24 L30 40 L34 22 L38 38 L42 32 L50 32" fill="none" stroke={GP} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {items.map(it => {
        const sel = it.k === active;
        return (
          <div key={it.k} title={it.l} style={{
            width: 48, height: 48, borderRadius: 12,
            background: sel ? `rgba(0,255,133,0.10)` : 'transparent',
            border: sel ? `1px solid rgba(0,255,133,0.3)` : '1px solid transparent',
            color: sel ? GP : 'rgba(255,255,255,0.55)',
            fontSize: 18, fontWeight: 600,
            display: 'grid', placeItems: 'center', cursor: 'pointer',
          }}>{it.i}</div>
        );
      })}
    </div>
  );
}

// Org switcher (top bar)
function OrgBadge() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px 6px 6px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${VP}, ${PINKP})`, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700 }}>AC</div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600 }}>Audio Club</div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--pp-font-mono)' }}>SMU Produções</div>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SCREEN AF — MULTI-EVENT (Organization view)
// ─────────────────────────────────────────────────────────
function MultiEventScreen() {
  const events = [
    { name: 'Festival do Sol · equinócio', date: '30/11/26', cap: 2300, sold: 2184, rev: 312500, status: 'live', tone: GP },
    { name: 'Anyma all night', date: '07/12/26', cap: 2300, sold: 1842, rev: 256800, status: 'aberto', tone: VP },
    { name: 'KVSH no Audio', date: '14/12/26', cap: 2300, sold: 980, rev: 84300, status: 'aberto', tone: GP },
    { name: 'Boate Roxa · ed. 8', date: '21/12/26', cap: 800, sold: 412, rev: 28840, status: 'aberto', tone: VP },
    { name: 'Réveillon · Skye Bar', date: '31/12/26', cap: 1500, sold: 1500, rev: 540000, status: 'esgotado', tone: PINKP },
    { name: 'Tropical Heat · férias', date: '15/01/27', cap: 2300, sold: 124, rev: 11880, status: 'aberto', tone: AMBERP },
    { name: 'Carnaval Audio', date: '13/02/27', cap: 2300, sold: 0, rev: 0, status: 'rascunho', tone: 'gray' },
  ];
  const totalRev = events.reduce((a, e) => a + e.rev, 0);
  const totalSold = events.reduce((a, e) => a + e.sold, 0);
  const totalCap = events.reduce((a, e) => a + e.cap, 0);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', color: '#fff', fontFamily: 'var(--pp-font-body)', background: '#06070A', display: 'flex' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(40% 30% at 20% 10%, rgba(0,255,133,0.08), transparent 60%), radial-gradient(40% 30% at 80% 80%, rgba(167,139,250,0.06), transparent 60%), #06070A' }}/>
      <MiniSidebar active="events"/>

      <div style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <OrgBadge/>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ padding: '10px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Importar de Sympla</button>
            <button style={{ padding: '10px 16px', borderRadius: 12, background: `linear-gradient(180deg, #4DFFA8, ${GP})`, color: '#003C1F', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 16px rgba(0,255,133,0.35)' }}>+ Novo evento</button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div className="pp-eyebrow">organização · 7 eventos</div>
          <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 28, letterSpacing: '-0.025em', marginTop: 4 }}>
            Seus eventos da <span style={{ fontFamily: 'var(--pp-font-serif)', fontStyle: 'italic', fontWeight: 400, color: GP }}>temporada</span>
          </div>

          {/* Summary */}
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { l: 'Faturamento agregado', v: `R$ ${(totalRev / 1000).toFixed(0)}k`, c: GP },
              { l: 'Ingressos vendidos', v: totalSold.toLocaleString('pt-BR'), c: VP },
              { l: 'Capacidade ocupada', v: `${((totalSold / totalCap) * 100).toFixed(0)}%`, c: CP },
              { l: 'Eventos ativos', v: `${events.filter(e => e.status !== 'rascunho').length}/7`, c: PINKP },
            ].map(k => (
              <div key={k.l} style={{ padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: k.c, opacity: 0.7 }}/>
                <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>{k.l}</div>
                <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 22, color: '#fff', marginTop: 4 }}>{k.v}</div>
              </div>
            ))}
          </div>

          {/* Filter */}
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            {['Todos · 7', 'Ao vivo · 1', 'Abertos · 4', 'Esgotados · 1', 'Rascunhos · 1'].map((t, i) => (
              <div key={t} style={{
                padding: '8px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                background: i === 0 ? 'rgba(255,255,255,0.10)' : 'transparent',
                color: i === 0 ? '#fff' : 'rgba(255,255,255,0.55)',
                border: i === 0 ? '1px solid rgba(255,255,255,0.14)' : '1px solid transparent',
              }}>{t}</div>
            ))}
          </div>

          {/* Event grid */}
          <div style={{ marginTop: 14, flex: 1, overflow: 'hidden', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {events.map((e, i) => (
              <div key={i} style={{
                position: 'relative',
                borderRadius: 18,
                background: 'rgba(255,255,255,0.03)',
                border: e.status === 'live' ? `1.5px solid ${GP}50` : '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
                boxShadow: e.status === 'live' ? '0 0 24px rgba(0,255,133,0.18)' : 'none',
                opacity: e.status === 'rascunho' ? 0.6 : 1,
              }}>
                {/* Cover */}
                <div style={{ height: 110, background: `radial-gradient(80% 80% at 30% 30%, ${e.tone === 'gray' ? '#444' : e.tone}, transparent 60%), radial-gradient(80% 80% at 80% 80%, ${VP}, transparent 60%), #0a0a0c`, position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.7))' }}/>
                  <div style={{ position: 'absolute', top: 10, left: 10, padding: '4px 10px', borderRadius: 999, background: 'rgba(11,13,18,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {e.status === 'live' && <span className="pp-pulse-dot" style={{ width: 6, height: 6 }}/>}
                    <span style={{ fontSize: 9, fontFamily: 'var(--pp-font-mono)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: e.tone === 'gray' ? 'rgba(255,255,255,0.55)' : e.tone }}>{e.status}</span>
                  </div>
                  <div style={{ position: 'absolute', bottom: 10, left: 12, right: 12 }}>
                    <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em', lineHeight: 1.15 }}>{e.name}</div>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ padding: 14, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.6)' }}>{e.date}</span>
                    <span style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 14, color: e.status === 'rascunho' ? 'rgba(255,255,255,0.4)' : GP }}>R$ {(e.rev / 1000).toFixed(1)}k</span>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.55)' }}>
                      <span>{e.sold}/{e.cap}</span>
                      <span>{((e.sold / e.cap) * 100).toFixed(0)}%</span>
                    </div>
                    <div style={{ marginTop: 4, height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div style={{ width: `${(e.sold / e.cap) * 100}%`, height: '100%', background: e.tone === 'gray' ? 'rgba(255,255,255,0.2)' : e.tone, boxShadow: e.tone === 'gray' ? 'none' : `0 0 6px ${e.tone}80` }}/>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SCREEN AG — FINANCIAL (Produtora payout / saldo)
// ─────────────────────────────────────────────────────────
function FinancialScreen() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', color: '#fff', fontFamily: 'var(--pp-font-body)', background: '#06070A', display: 'flex' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(40% 30% at 80% 10%, rgba(0,255,133,0.08), transparent 60%), radial-gradient(40% 30% at 20% 80%, rgba(34,211,238,0.06), transparent 60%), #06070A' }}/>
      <MiniSidebar active="finance"/>

      <div style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <OrgBadge/>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.06em' }}>Conta Asaas vinculada · 14.512.528/0001-54</div>
        </div>

        <div style={{ flex: 1, padding: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Big balance */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
            <div style={{
              padding: 26, borderRadius: 22,
              background: `linear-gradient(135deg, rgba(0,255,133,0.18), rgba(34,211,238,0.10) 60%, rgba(167,139,250,0.14))`,
              border: '1px solid rgba(0,255,133,0.3)',
              backdropFilter: 'blur(30px) saturate(180%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 16px 32px rgba(0,255,133,0.15)',
              overflow: 'hidden', position: 'relative',
            }}>
              <div style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', background: `radial-gradient(circle, ${GP}40, transparent 70%)`, filter: 'blur(30px)' }}/>
              <div className="pp-eyebrow" style={{ color: GP }}>Saldo disponível para saque</div>
              <div style={{ marginTop: 12, fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 56, letterSpacing: '-0.03em', display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 24, color: 'rgba(255,255,255,0.55)' }}>R$</span>
                <span style={{ textShadow: `0 0 40px ${GP}50` }}>184.320</span>
                <span style={{ fontSize: 26, color: 'rgba(255,255,255,0.6)' }}>,00</span>
              </div>
              <div style={{ marginTop: 6, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>após repasse PulsePass · taxa 4,9% + R$ 1,49</div>

              <div style={{ marginTop: 22, display: 'flex', gap: 10 }}>
                <button style={{
                  padding: '12px 22px', borderRadius: 14, border: 'none',
                  background: '#fff', color: '#003C1F', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m2 12 5-5 5 5-5 5z"/><path d="m12 2 5 5-5 5-5-5z"/><path d="m22 12-5 5-5-5 5-5z"/><path d="m12 22-5-5 5-5 5 5z"/></svg>
                  Sacar via Pix · 5min
                </button>
                <button style={{ padding: '12px 22px', borderRadius: 14, background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid rgba(255,255,255,0.14)', fontWeight: 600, fontSize: 13, cursor: 'pointer', backdropFilter: 'blur(12px)' }}>Antecipar D+30 · taxa 3,2%</button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { l: 'A receber em 30d', v: 'R$ 92.480', sub: 'Anyma + KVSH', c: VP },
                { l: 'Bloqueado (chargeback)', v: 'R$ 1.840', sub: '2 pendências', c: PINKP },
                { l: 'Sacado este mês', v: 'R$ 247.300', sub: '4 saques', c: CP },
              ].map(k => (
                <div key={k.l} style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: k.c }}/>
                  <div style={{ paddingLeft: 8 }}>
                    <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>{k.l}</div>
                    <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 20, color: '#fff', marginTop: 4 }}>{k.v}</div>
                    <div style={{ fontSize: 11, color: k.c, marginTop: 2 }}>{k.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transactions */}
          <div style={{ marginTop: 18, flex: 1, padding: 18, borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 600, fontSize: 18, letterSpacing: '-0.015em' }}>Movimentação · últimos 30 dias</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['Tudo', 'Entradas', 'Saídas', 'Antecipações'].map((t, i) => (
                  <div key={t} style={{ padding: '6px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: i === 0 ? 'rgba(255,255,255,0.08)' : 'transparent', color: i === 0 ? '#fff' : 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.08)' }}>{t}</div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 14, flex: 1, overflow: 'hidden' }}>
              {/* Table head */}
              <div style={{ padding: '8px 14px', display: 'grid', gridTemplateColumns: '90px 1fr 130px 130px 110px', gap: 12, background: 'rgba(255,255,255,0.025)', borderRadius: 10, fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
                <span>Data</span><span>Descrição</span><span>Evento</span><span>Valor</span><span>Status</span>
              </div>
              {[
                { d: '30 nov', desc: 'Vendas Festival do Sol · D+2', ev: 'Festival do Sol', v: '+R$ 184.320', t: 'in', st: 'aprovado' },
                { d: '28 nov', desc: 'Saque via Pix · BB CC 23104', ev: '—', v: '−R$ 92.480', t: 'out', st: 'liquidado' },
                { d: '25 nov', desc: 'Antecipação D+30 · taxa 3.2%', ev: 'Anyma', v: '+R$ 84.300', t: 'in', st: 'aprovado' },
                { d: '22 nov', desc: 'Chargeback · estorno', ev: 'Réveillon', v: '−R$ 1.840', t: 'out', st: 'pendente' },
                { d: '20 nov', desc: 'Comissão promoter Lia · pago', ev: 'Festival', v: '−R$ 2.834', t: 'out', st: 'liquidado' },
                { d: '18 nov', desc: 'Vendas KVSH · D+2', ev: 'KVSH', v: '+R$ 46.200', t: 'in', st: 'aprovado' },
                { d: '15 nov', desc: 'Saque via Pix · BB', ev: '—', v: '−R$ 152.980', t: 'out', st: 'liquidado' },
              ].map((r, i) => (
                <div key={i} style={{
                  padding: '12px 14px', display: 'grid', gridTemplateColumns: '90px 1fr 130px 130px 110px', gap: 12,
                  borderBottom: i < 6 ? '1px solid rgba(255,255,255,0.04)' : 'none', alignItems: 'center', fontSize: 12,
                }}>
                  <span style={{ fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.55)' }}>{r.d}</span>
                  <span style={{ fontWeight: 600 }}>{r.desc}</span>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{r.ev}</span>
                  <span style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 13, color: r.t === 'in' ? GP : '#fff' }}>{r.v}</span>
                  <PBadge tone={r.st === 'aprovado' ? 'pulse' : r.st === 'liquidado' ? 'cyan' : 'amber'}>{r.st}</PBadge>
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
// SCREEN AH — MARKETING / PROMO CODES
// ─────────────────────────────────────────────────────────
function MarketingScreen() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', color: '#fff', fontFamily: 'var(--pp-font-body)', background: '#06070A', display: 'flex' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(40% 30% at 80% 10%, rgba(255,61,136,0.10), transparent 60%), #06070A' }}/>
      <MiniSidebar active="marketing"/>

      <div style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <OrgBadge/>
          <button style={{ padding: '10px 16px', borderRadius: 12, background: PINKP, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 16px rgba(255,61,136,0.35)' }}>
            + Nova campanha
          </button>
        </div>

        <div style={{ flex: 1, padding: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div className="pp-eyebrow" style={{ color: PINKP }}>Marketing</div>
          <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 28, letterSpacing: '-0.025em', marginTop: 4 }}>
            Cupons · campanhas · <span style={{ fontFamily: 'var(--pp-font-serif)', fontStyle: 'italic', fontWeight: 400, color: PINKP }}>conversão</span>
          </div>

          <div style={{ flex: 1, marginTop: 18, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14, minHeight: 0 }}>
            {/* Left: Promo codes */}
            <div style={{ padding: 20, borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 600, fontSize: 18, letterSpacing: '-0.015em' }}>Cupons ativos · 4</div>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Auto-virada por uso</span>
              </div>

              <div style={{ marginTop: 14, flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { code: 'SOL10', desc: 'Festival do Sol · 10% off no 1º lote', uses: 412, max: 500, disc: '10%', exp: 'até 25/11', tone: GP },
                  { code: 'INDIQUE', desc: 'Indicação amigo · R$ 20 cashback', uses: 187, max: '∞', disc: 'R$ 20', exp: 'sem expiração', tone: VP },
                  { code: 'IMPRENSA', desc: 'Cortesia imprensa · 100% off', uses: 14, max: 20, disc: '100%', exp: 'até 30/11', tone: PINKP },
                  { code: 'MULHER22', desc: 'Solo mulheres · meia até 22h', uses: 89, max: 200, disc: '50%', exp: 'evento ativo', tone: AMBERP },
                ].map((c, i) => (
                  <div key={i} style={{
                    padding: 14, borderRadius: 14,
                    background: `${c.tone}08`, border: `1px solid ${c.tone}30`,
                    display: 'flex', alignItems: 'center', gap: 14,
                  }}>
                    <div style={{
                      padding: '10px 14px', borderRadius: 12,
                      background: 'rgba(11,13,18,0.5)', border: '1px dashed rgba(255,255,255,0.2)',
                      fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 16, letterSpacing: '0.1em',
                      color: c.tone, minWidth: 110, textAlign: 'center',
                    }}>{c.code}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{c.desc}</div>
                      <div style={{ marginTop: 6, display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.55)' }}>desconto:</span>
                        <span style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 12, color: c.tone }}>{c.disc}</span>
                        <span style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.45)' }}>· {c.exp}</span>
                      </div>
                    </div>
                    <div style={{ width: 130 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.55)' }}>
                        <span>{c.uses} usos</span>
                        <span>{c.max}</span>
                      </div>
                      <div style={{ marginTop: 4, height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{ width: typeof c.max === 'number' ? `${(c.uses / c.max) * 100}%` : '40%', height: '100%', background: c.tone, boxShadow: `0 0 6px ${c.tone}80` }}/>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Campaign + push */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Active push */}
              <div style={{ padding: 18, borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="pp-eyebrow">Campanha ativa · push</div>
                <div style={{ marginTop: 12, padding: 14, borderRadius: 14, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.06em' }}>PulsePass · agora</div>
                  <div style={{ marginTop: 4, fontWeight: 700, fontSize: 14 }}>🔥 Anyma — abriu venda</div>
                  <div style={{ marginTop: 2, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>2º lote a R$ 90 · termina às 23h59. SOL10 dá 10% off.</div>
                </div>
                <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {[
                    { l: 'Recebida', v: '12.480', c: '#fff' },
                    { l: 'Aberta', v: '4.382', c: VP },
                    { l: 'Converteu', v: '847', c: GP },
                  ].map(k => (
                    <div key={k.l} style={{ padding: 10, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 16, color: k.c }}>{k.v}</div>
                      <div style={{ fontSize: 9, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{k.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 10, padding: 10, borderRadius: 10, background: 'rgba(0,255,133,0.08)', border: '1px solid rgba(0,255,133,0.2)', fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>
                  Taxa de conversão <b style={{ color: GP }}>19,3%</b> · 4,2× a média da plataforma
                </div>
              </div>

              {/* Channels */}
              <div style={{ padding: 18, borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', flex: 1, overflow: 'hidden' }}>
                <div className="pp-eyebrow">Canais conectados</div>
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { ic: '🔔', l: 'Push (12.4k seguidores)', sub: 'iOS + Android · expo-notifications', on: true, c: GP },
                    { ic: '📧', l: 'E-mail (8.2k)', sub: 'Resend · domain audioclub.com', on: true, c: VP },
                    { ic: '💬', l: 'WhatsApp Business', sub: 'meta cloud · template aprovado', on: true, c: GP },
                    { ic: '📷', l: 'Instagram Stories', sub: 'auto-post via integração', on: false, c: PINKP },
                    { ic: 'g', l: 'Google Events Ads', sub: 'reach 28k/semana · CTR 4.2%', on: true, c: CP },
                  ].map((ch, i) => (
                    <div key={i} style={{ padding: 10, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${ch.c}20`, border: `1px solid ${ch.c}40`, display: 'grid', placeItems: 'center', fontSize: 14 }}>{ch.ic}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.l}</div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 1 }}>{ch.sub}</div>
                      </div>
                      <div style={{ width: 32, height: 18, borderRadius: 99, background: ch.on ? GP : 'rgba(255,255,255,0.1)', position: 'relative', boxShadow: ch.on ? `inset 0 1px 2px rgba(0,0,0,0.2), 0 0 8px ${GP}50` : 'none' }}>
                        <div style={{ position: 'absolute', left: ch.on ? 16 : 2, top: 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.3)', transition: 'left 0.2s' }}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SCREEN AI — BOX OFFICE (presencial sales · maquininha)
// ─────────────────────────────────────────────────────────
function BoxOfficeScreen() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', color: '#fff', fontFamily: 'var(--pp-font-body)', background: '#06070A', display: 'flex' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(40% 30% at 50% 10%, rgba(0,255,133,0.10), transparent 60%), #06070A' }}/>
      <MiniSidebar active="boxoffice"/>

      <div style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Selection */}
        <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="pp-eyebrow" style={{ color: GP }}>Bilheteria física · Portaria 1</div>
              <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 26, letterSpacing: '-0.025em', marginTop: 4 }}>Festival do Sol · vendas no balcão</div>
            </div>
            <div style={{ padding: '8px 14px 8px 10px', borderRadius: 999, background: 'rgba(0,255,133,0.10)', border: '1px solid rgba(0,255,133,0.25)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: GP, boxShadow: `0 0 8px ${GP}` }}/>
              <span style={{ fontSize: 11, fontFamily: 'var(--pp-font-mono)', color: GP, fontWeight: 600 }}>OPERADOR · MARIA T.</span>
            </div>
          </div>

          {/* Lote selector */}
          <div style={{ marginTop: 20 }}>
            <div className="pp-label" style={{ marginBottom: 12 }}>Lote selecionado</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { n: 'Pista', p: 110, q: 12, tone: GP },
                { n: 'Premium', p: 200, q: 8, tone: VP, sel: true },
                { n: 'Camarote VIP', p: 400, q: 4, tone: PINKP },
              ].map((l, i) => (
                <div key={i} style={{
                  padding: 18, borderRadius: 18,
                  background: l.sel ? `${l.tone}12` : 'rgba(255,255,255,0.03)',
                  border: l.sel ? `1.5px solid ${l.tone}` : '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer',
                  boxShadow: l.sel ? `0 0 24px ${l.tone}25` : 'none',
                }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: l.sel ? l.tone : '#fff' }}>{l.n} · presencial</div>
                  <div style={{ marginTop: 8, fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 28, letterSpacing: '-0.02em' }}>R$ {l.p}</div>
                  <div style={{ marginTop: 4, fontSize: 11, color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--pp-font-mono)' }}>+ R$ {(l.p * 0.1).toFixed(0)} taxa · restam {l.q}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quantity + customer data */}
          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ padding: 18, borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="pp-label">Quantidade</div>
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button style={{ width: 50, height: 50, borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', color: '#fff', fontSize: 22, cursor: 'pointer' }}>−</button>
                <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 48, letterSpacing: '-0.02em' }}>2</div>
                <button style={{ width: 50, height: 50, borderRadius: 14, background: GP, color: '#003C1F', border: 'none', fontSize: 22, fontWeight: 700, cursor: 'pointer' }}>+</button>
              </div>
            </div>

            <div style={{ padding: 18, borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="pp-label">Cliente (opcional · CPF na nota)</div>
              <div style={{ marginTop: 12, height: 50, padding: '0 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>CPF do cliente</span>
                <button style={{ marginLeft: 'auto', padding: '4px 10px', borderRadius: 8, background: 'rgba(0,255,133,0.12)', border: '1px solid rgba(0,255,133,0.3)', color: GP, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Sem CPF</button>
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div style={{ marginTop: 18 }}>
            <div className="pp-label" style={{ marginBottom: 12 }}>Forma de pagamento</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {[
                { l: 'Cartão · maquininha', sub: '1× s/ ou 4× s/ juros', ic: '💳', c: CP, sel: true },
                { l: 'Pix · QR balcão', sub: 'aprovado em 3s', ic: '◇', c: GP },
                { l: 'Cashless on the spot', sub: 'cliente tem saldo', ic: '◈', c: VP },
                { l: 'Dinheiro', sub: 'troco anotado', ic: '$', c: AMBERP },
              ].map((m, i) => (
                <div key={i} style={{
                  padding: 16, borderRadius: 16,
                  background: m.sel ? `${m.c}10` : 'rgba(255,255,255,0.03)',
                  border: m.sel ? `1.5px solid ${m.c}` : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: m.sel ? `0 0 20px ${m.c}20` : 'none',
                  cursor: 'pointer',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: m.sel ? `${m.c}25` : 'rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center', fontSize: 18, color: m.c }}>{m.ic}</div>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', border: m.sel ? `5px solid ${m.c}` : '1.5px solid rgba(255,255,255,0.25)', background: m.sel ? '#06070A' : 'transparent', boxSizing: 'border-box' }}/>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600 }}>{m.l}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>{m.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: receipt + finalize */}
        <div style={{
          width: 340, borderLeft: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(11,13,18,0.5)', backdropFilter: 'blur(20px)',
          padding: 20, display: 'flex', flexDirection: 'column',
        }}>
          <div className="pp-label" style={{ marginBottom: 14 }}>Comanda atual</div>
          <div style={{ padding: 18, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', flex: 1, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>2× Pista Premium</span>
              <span style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 14 }}>R$ 400,00</span>
            </div>
            <div style={{ paddingTop: 12, borderTop: '1px dashed rgba(255,255,255,0.12)', marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.65)', padding: '3px 0' }}>
                <span>Subtotal</span><span style={{ fontFamily: 'var(--pp-font-mono)' }}>R$ 400,00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.65)', padding: '3px 0' }}>
                <span>Taxa serviço (10%)</span><span style={{ fontFamily: 'var(--pp-font-mono)' }}>R$ 40,00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>Total</span>
                <span style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 26 }}>R$ <span style={{ color: GP }}>440</span>,<span style={{ color: 'rgba(255,255,255,0.55)' }}>00</span></span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 14, padding: 14, borderRadius: 14, background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.2)', display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ fontSize: 24 }}>📟</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>Maquininha · Stone P2</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 2, fontFamily: 'var(--pp-font-mono)' }}>BT conectada · serial 30482</div>
            </div>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: GP }}/>
          </div>

          <button style={{
            marginTop: 14, width: '100%', height: 60, borderRadius: 18, border: 'none',
            background: `linear-gradient(180deg, #4DFFA8, ${GP})`,
            color: '#003C1F', fontWeight: 700, fontSize: 16, cursor: 'pointer',
            boxShadow: '0 12px 32px rgba(0,255,133,0.4), inset 0 1px 0 rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            Cobrar R$ 440,00
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </button>
          <button style={{ marginTop: 8, width: '100%', height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Cancelar comanda</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MultiEventScreen, FinancialScreen, MarketingScreen, BoxOfficeScreen });
