// iPadScreens4.jsx — Sales Report (Excel multi-tab preview) · Promoter Manager + Leaderboard

const GA = '#00FF85', VA = '#A78BFA', CA = '#22D3EE', PINKA = '#FF3D88', AMBERA = '#FFB800';

// ─────────────────────────────────────────────────────────
// SCREEN V — SALES REPORT (Excel 9-tab preview)
// ─────────────────────────────────────────────────────────
function SalesReportScreen() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', color: '#fff', fontFamily: 'var(--pp-font-body)', background: '#06070A' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(40% 30% at 20% 10%, rgba(34,211,238,0.08), transparent 60%), radial-gradient(40% 30% at 80% 80%, rgba(0,255,133,0.06), transparent 60%), #06070A' }}/>

      <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
        {/* Sidebar: report sections */}
        <div style={{ width: 280, padding: '24px 16px', borderRight: '1px solid rgba(255,255,255,0.06)', position: 'relative', zIndex: 1, background: 'rgba(11,13,18,0.4)', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '0 8px 16px' }}>
            <div className="pp-eyebrow" style={{ color: CA }}>Relatório completo</div>
            <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 20, marginTop: 4, letterSpacing: '-0.02em' }}>Festival do Sol</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--pp-font-mono)', marginTop: 4 }}>30 nov · pós-evento</div>
          </div>

          <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', padding: '8px 8px' }}>9 abas Excel</div>

          {[
            { l: 'Resumo executivo', i: '◐', sel: true },
            { l: 'Vendas por lote', i: '▤' },
            { l: 'Cashless por produto', i: '◈' },
            { l: 'Cashless por PDV', i: '⊞' },
            { l: 'Cashless por hora', i: '⌛' },
            { l: 'Guest list & check-in', i: '☷' },
            { l: 'Comissões promoter', i: '◇' },
            { l: 'Conciliação financeira', i: '$' },
            { l: 'CRM cross-evento', i: '◉' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '10px 12px', borderRadius: 10, marginTop: 2,
              background: s.sel ? 'rgba(34,211,238,0.10)' : 'transparent',
              border: s.sel ? '1px solid rgba(34,211,238,0.25)' : '1px solid transparent',
              color: s.sel ? CA : 'rgba(255,255,255,0.7)',
              fontSize: 13, fontWeight: s.sel ? 600 : 500,
              display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
            }}>
              <span style={{ fontSize: 13, opacity: 0.8, width: 14, textAlign: 'center' }}>{s.i}</span>
              <span>{s.l}</span>
            </div>
          ))}

          <div style={{ marginTop: 'auto', padding: '14px 12px', borderRadius: 14, background: `linear-gradient(135deg, rgba(34,211,238,0.18), rgba(0,255,133,0.10))`, border: '1px solid rgba(34,211,238,0.3)' }}>
            <div style={{ fontSize: 11, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: CA, fontWeight: 600 }}>Pulse Premium</div>
            <div style={{ fontSize: 12, marginTop: 4, lineHeight: 1.4 }}>Excel formatado · gráficos · data bars · color scales</div>
            <button style={{ marginTop: 10, width: '100%', height: 38, borderRadius: 10, border: 'none', background: CA, color: '#06070A', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              Baixar .xlsx
            </button>
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, position: 'relative', zIndex: 1, padding: 24, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Title */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div className="pp-eyebrow" style={{ color: CA }}>01 · Resumo executivo</div>
              <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 28, letterSpacing: '-0.025em', marginTop: 4 }}>
                Festival do Sol fechou em <span style={{ fontFamily: 'var(--pp-font-serif)', fontStyle: 'italic', fontWeight: 400, color: GA }}>R$ 312k.</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                📧 Enviar
              </button>
              <button style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>📄 PDF</button>
            </div>
          </div>

          {/* KPI row */}
          <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
            {[
              { l: 'Faturamento total', v: 'R$ 312k', d: '+R$ 184k vs último', c: GA },
              { l: 'Margem líquida', v: 'R$ 264k', d: '84,6%', c: VA },
              { l: 'Público pagante', v: '2.184', d: '85,7% check-in', c: CA },
              { l: 'Ticket médio', v: 'R$ 142,87', d: 'ingresso + cashless', c: PINKA },
              { l: 'NPS pós-evento', v: '72', d: '👍 4.8★ (212 reviews)', c: AMBERA },
            ].map(k => (
              <div key={k.l} style={{ padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: k.c, opacity: 0.7 }}/>
                <div style={{ fontSize: 9, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>{k.l}</div>
                <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 20, color: '#fff', marginTop: 4, letterSpacing: '-0.02em' }}>{k.v}</div>
                <div style={{ marginTop: 3, fontSize: 10, color: k.c }}>{k.d}</div>
              </div>
            ))}
          </div>

          {/* Excel-like preview */}
          <div style={{ marginTop: 18, flex: 1, borderRadius: 14, background: '#0E1116', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Excel toolbar */}
            <div style={{ padding: '10px 16px', background: '#11151D', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>FestivalDoSol_30nov.xlsx</span>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: PINKA }}/>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: AMBERA }}/>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: GA }}/>
              </div>
            </div>

            {/* Sheet header */}
            <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 4, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Resumo', 'Vendas', 'Cashless', 'PDVs', 'Por hora', 'Guests', 'Promoters', 'Conciliação', 'CRM'].map((t, i) => (
                <div key={t} style={{
                  padding: '6px 12px', borderRadius: '8px 8px 0 0', fontSize: 11,
                  background: i === 0 ? '#0E1116' : 'transparent',
                  color: i === 0 ? '#fff' : 'rgba(255,255,255,0.5)',
                  borderTop: i === 0 ? `2px solid ${CA}` : '2px solid transparent',
                  fontWeight: 600, cursor: 'pointer',
                }}>{t}</div>
              ))}
            </div>

            {/* Table */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* Column headers (Excel-style) */}
              <div style={{ display: 'grid', gridTemplateColumns: '40px 200px 110px 110px 110px 110px 110px 1fr', borderBottom: '1px solid rgba(255,255,255,0.08)', background: '#0A0D12' }}>
                <div style={{ padding: '6px 8px', fontSize: 10, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.45)', textAlign: 'center' }}></div>
                {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(c => (
                  <div key={c} style={{ padding: '6px 12px', fontSize: 10, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.5)', borderLeft: '1px solid rgba(255,255,255,0.04)', textAlign: 'center' }}>{c}</div>
                ))}
              </div>

              {/* Real headers */}
              <div style={{ display: 'grid', gridTemplateColumns: '40px 200px 110px 110px 110px 110px 110px 1fr', borderBottom: '1px solid rgba(255,255,255,0.1)', background: '#12161E' }}>
                <div style={{ padding: '8px 6px', fontSize: 10, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>1</div>
                {['Item', 'Valor', 'Qtd', 'Médio', '% total', 'YoY', 'Visual'].map(h => (
                  <div key={h} style={{ padding: '8px 12px', fontSize: 11, fontWeight: 700, color: '#fff', borderLeft: '1px solid rgba(255,255,255,0.04)' }}>{h}</div>
                ))}
              </div>

              {[
                { label: 'Ingressos Pista 1º lote', v: 'R$ 42.000', q: '600', m: 'R$ 70,00', p: 13.5, yoy: '+8%', bar: 13.5, tone: GA },
                { label: 'Ingressos Pista 2º lote', v: 'R$ 54.000', q: '600', m: 'R$ 90,00', p: 17.3, yoy: '+12%', bar: 17.3, tone: GA },
                { label: 'Pista Premium', v: 'R$ 72.000', q: '400', m: 'R$ 180,00', p: 23.1, yoy: '+22%', bar: 23.1, tone: VA },
                { label: 'Camarote VIP', v: 'R$ 30.400', q: '80', m: 'R$ 380,00', p: 9.7, yoy: '+5%', bar: 9.7, tone: PINKA },
                { label: 'Cashless · bebidas', v: 'R$ 84.300', q: '4.218', m: 'R$ 19,99', p: 27.0, yoy: '+34%', bar: 27.0, tone: CA },
                { label: 'Cashless · comida', v: 'R$ 22.180', q: '786', m: 'R$ 28,22', p: 7.1, yoy: '+18%', bar: 7.1, tone: AMBERA },
                { label: 'Cortesias (não vendido)', v: 'R$ 7.620', q: '80', m: '—', p: 2.4, yoy: '—', bar: 2.4, tone: 'gray' },
              ].map((row, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '40px 200px 110px 110px 110px 110px 110px 1fr',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  background: i % 2 === 1 ? 'rgba(255,255,255,0.015)' : 'transparent',
                  fontSize: 12,
                }}>
                  <div style={{ padding: '8px 6px', fontSize: 10, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.4)', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.04)' }}>{i + 2}</div>
                  <div style={{ padding: '8px 12px', borderLeft: '1px solid rgba(255,255,255,0.04)', color: '#fff' }}>{row.label}</div>
                  <div style={{ padding: '8px 12px', fontFamily: 'var(--pp-font-mono)', fontWeight: 600, color: '#fff', borderLeft: '1px solid rgba(255,255,255,0.04)', textAlign: 'right' }}>{row.v}</div>
                  <div style={{ padding: '8px 12px', fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.7)', borderLeft: '1px solid rgba(255,255,255,0.04)', textAlign: 'right' }}>{row.q}</div>
                  <div style={{ padding: '8px 12px', fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.7)', borderLeft: '1px solid rgba(255,255,255,0.04)', textAlign: 'right' }}>{row.m}</div>
                  <div style={{ padding: '8px 12px', fontFamily: 'var(--pp-font-mono)', color: '#fff', borderLeft: '1px solid rgba(255,255,255,0.04)', textAlign: 'right' }}>{row.p}%</div>
                  <div style={{ padding: '8px 12px', fontFamily: 'var(--pp-font-mono)', color: row.yoy.startsWith('+') ? GA : 'rgba(255,255,255,0.5)', borderLeft: '1px solid rgba(255,255,255,0.04)', textAlign: 'right' }}>{row.yoy}</div>
                  {/* Data bar */}
                  <div style={{ padding: '8px 12px', borderLeft: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center' }}>
                    <div style={{ flex: 1, height: 14, borderRadius: 3, background: 'rgba(255,255,255,0.04)', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ width: `${row.bar * 3.5}%`, height: '100%', background: row.tone === 'gray' ? 'rgba(255,255,255,0.2)' : `linear-gradient(90deg, ${row.tone}80, ${row.tone}40)`, borderRadius: 3 }}/>
                    </div>
                  </div>
                </div>
              ))}

              {/* Total row */}
              <div style={{
                display: 'grid', gridTemplateColumns: '40px 200px 110px 110px 110px 110px 110px 1fr',
                background: 'rgba(0,255,133,0.06)', borderTop: `2px solid ${GA}`,
              }}>
                <div style={{ padding: '10px 6px', fontSize: 10, fontFamily: 'var(--pp-font-mono)', color: GA, textAlign: 'center' }}>9</div>
                <div style={{ padding: '10px 12px', borderLeft: '1px solid rgba(0,255,133,0.2)', fontWeight: 700, color: '#fff' }}>TOTAL FATURAMENTO</div>
                <div style={{ padding: '10px 12px', fontFamily: 'var(--pp-font-mono)', fontWeight: 700, color: GA, borderLeft: '1px solid rgba(0,255,133,0.2)', textAlign: 'right' }}>R$ 312.500</div>
                <div style={{ padding: '10px 12px', borderLeft: '1px solid rgba(0,255,133,0.2)' }}/>
                <div style={{ padding: '10px 12px', fontFamily: 'var(--pp-font-mono)', fontWeight: 700, color: GA, borderLeft: '1px solid rgba(0,255,133,0.2)', textAlign: 'right' }}>R$ 142,87</div>
                <div style={{ padding: '10px 12px', fontFamily: 'var(--pp-font-mono)', fontWeight: 700, color: GA, borderLeft: '1px solid rgba(0,255,133,0.2)', textAlign: 'right' }}>100%</div>
                <div style={{ padding: '10px 12px', fontFamily: 'var(--pp-font-mono)', fontWeight: 700, color: GA, borderLeft: '1px solid rgba(0,255,133,0.2)', textAlign: 'right' }}>+18%</div>
                <div style={{ padding: '10px 12px', borderLeft: '1px solid rgba(0,255,133,0.2)' }}/>
              </div>
            </div>
          </div>

          {/* Bottom hint */}
          <div style={{ marginTop: 12, fontSize: 11, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.05em' }}>
            Geração automática via <span style={{ color: CA }}>ExcelJS</span> · 9 abas formatadas com gráficos embutidos
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SCREEN W — PROMOTER MANAGER + LEADERBOARD
// ─────────────────────────────────────────────────────────
function PromoterManagerScreen() {
  const ranking = [
    { rank: 1, n: 'Lia Coelho', tier: 3, signups: 247, checkin: 189, rev: 22340, comm: 2834, c: VA, av: 'L', delta: '+12%' },
    { rank: 2, n: 'Marcos Silva', tier: 3, signups: 198, checkin: 162, rev: 18200, comm: 2184, c: PINKA, av: 'M', delta: '+8%' },
    { rank: 3, n: 'Júlia Reis', tier: 2, signups: 142, checkin: 102, rev: 12480, comm: 1497, c: CA, av: 'J', delta: '+18%' },
    { rank: 4, n: 'Pedro Almeida', tier: 2, signups: 128, checkin: 98, rev: 11240, comm: 1349, c: GA, av: 'P', delta: '+4%' },
    { rank: 5, n: 'Fernanda Lima', tier: 2, signups: 96, checkin: 81, rev: 8800, comm: 1056, c: AMBERA, av: 'F', delta: '+22%' },
    { rank: 6, n: 'Caio Ramos', tier: 1, signups: 74, checkin: 58, rev: 6440, comm: 644, c: VA, av: 'C', delta: '−2%' },
    { rank: 7, n: 'Maria Tavares', tier: 1, signups: 68, checkin: 51, rev: 5740, comm: 574, c: PINKA, av: 'M', delta: '+6%' },
    { rank: 8, n: 'Tomás Vieira', tier: 1, signups: 42, checkin: 28, rev: 3120, comm: 312, c: CA, av: 'T', delta: '−14%' },
  ];

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', color: '#fff', fontFamily: 'var(--pp-font-body)', background: '#06070A' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(40% 30% at 20% 10%, rgba(167,139,250,0.10), transparent 60%), radial-gradient(40% 30% at 80% 80%, rgba(255,61,136,0.06), transparent 60%), #06070A' }}/>

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="pp-eyebrow" style={{ color: VA }}>Time de promoters</div>
            <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 24, letterSpacing: '-0.025em', marginTop: 2 }}>
              Ranking · <span style={{ fontFamily: 'var(--pp-font-serif)', fontStyle: 'italic', fontWeight: 400, color: VA }}>Festival do Sol</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ padding: '8px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', fontSize: 12, fontWeight: 600 }}>Pago 12% · meta 247+</div>
            <button style={{ padding: '10px 16px', borderRadius: 12, background: `linear-gradient(180deg, #C4B5FD, ${VA})`, color: '#1A0040', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 16px rgba(167,139,250,0.35)' }}>+ Convidar promoter</button>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Left: Stats summary */}
          <div style={{ width: 320, padding: '20px 20px', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Total comm */}
            <div style={{
              padding: 18, borderRadius: 18,
              background: `linear-gradient(135deg, rgba(167,139,250,0.20), rgba(255,61,136,0.10))`,
              border: '1px solid rgba(167,139,250,0.30)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
            }}>
              <div className="pp-eyebrow" style={{ color: VA }}>Comissão total a pagar</div>
              <div style={{ marginTop: 8, fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 32, letterSpacing: '-0.025em' }}>R$ 10.450</div>
              <div style={{ marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>8 promoters · 1.095 inscritos</div>
              <button style={{ marginTop: 12, width: '100%', height: 38, borderRadius: 10, background: 'rgba(11,13,18,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.14)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Pagar via Pix em lote →</button>
            </div>

            {/* Pizza */}
            <div style={{ padding: 18, borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="pp-eyebrow">Distribuição por tier</div>
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 16 }}>
                <svg width="100" height="100" viewBox="0 0 100 100">
                  {/* Donut */}
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14"/>
                  <circle cx="50" cy="50" r="40" fill="none" stroke={VA} strokeWidth="14" strokeDasharray="125 251" strokeDashoffset="0" transform="rotate(-90 50 50)"/>
                  <circle cx="50" cy="50" r="40" fill="none" stroke={PINKA} strokeWidth="14" strokeDasharray="80 251" strokeDashoffset="-125" transform="rotate(-90 50 50)"/>
                  <circle cx="50" cy="50" r="40" fill="none" stroke={CA} strokeWidth="14" strokeDasharray="46 251" strokeDashoffset="-205" transform="rotate(-90 50 50)"/>
                  <text x="50" y="55" textAnchor="middle" fill="#fff" fontFamily="var(--pp-font-mono)" fontSize="16" fontWeight="700">8</text>
                </svg>
                <div style={{ flex: 1 }}>
                  {[
                    { l: 'Tier 3 · gold', v: 2, c: VA },
                    { l: 'Tier 2 · silver', v: 3, c: PINKA },
                    { l: 'Tier 1 · bronze', v: 3, c: CA },
                  ].map(t => (
                    <div key={t.l} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 11 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: t.c }}/>
                      <span style={{ flex: 1, color: 'rgba(255,255,255,0.75)' }}>{t.l}</span>
                      <span style={{ fontFamily: 'var(--pp-font-mono)', color: '#fff', fontWeight: 600 }}>{t.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tier rules */}
            <div style={{ padding: 18, borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="pp-eyebrow">Como sobe de tier</div>
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
                {[
                  { t: 'Tier 1 · bronze', r: '0-49 check-ins', c: CA },
                  { t: 'Tier 2 · silver', r: '50-149 + comissão 10%', c: PINKA },
                  { t: 'Tier 3 · gold', r: '150+ check-ins · comissão 12%', c: VA },
                ].map(r => (
                  <div key={r.t} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: r.c }}/>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{r.t}</span>
                    <span style={{ color: 'rgba(255,255,255,0.55)', marginLeft: 'auto', fontFamily: 'var(--pp-font-mono)', fontSize: 10 }}>{r.r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Leaderboard */}
          <div style={{ flex: 1, padding: '20px 24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 40, padding: '0 14px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Buscar promoter por nome ou @</span>
              </div>
              {['Por check-in', 'Por receita', 'Por crescimento'].map((t, i) => (
                <div key={t} style={{
                  padding: '0 14px', height: 40, borderRadius: 12, display: 'flex', alignItems: 'center',
                  fontSize: 12, fontWeight: 600,
                  background: i === 0 ? 'rgba(167,139,250,0.12)' : 'rgba(255,255,255,0.04)',
                  border: i === 0 ? '1px solid rgba(167,139,250,0.3)' : '1px solid rgba(255,255,255,0.08)',
                  color: i === 0 ? VA : 'rgba(255,255,255,0.7)',
                }}>{t}</div>
              ))}
            </div>

            {/* Top 3 podium */}
            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {ranking.slice(0, 3).map((p, i) => {
                const place = [{ h: 70, c: VA, label: '🥈 2º' }, { h: 90, c: AMBERA, label: '🥇 1º' }, { h: 60, c: PINKA, label: '🥉 3º' }];
                // re-order display: 2nd, 1st, 3rd
                const order = [1, 0, 2];
                const idx = order[i];
                const real = ranking[idx];
                const m = place[i];
                return (
                  <div key={i} style={{
                    padding: 16, borderRadius: 18,
                    background: i === 1 ? `linear-gradient(135deg, rgba(255,184,0,0.18), rgba(167,139,250,0.10))` : 'rgba(255,255,255,0.03)',
                    border: i === 1 ? `1.5px solid ${AMBERA}50` : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: i === 1 ? '0 12px 32px rgba(255,184,0,0.2), inset 0 1px 0 rgba(255,255,255,0.12)' : 'inset 0 1px 0 rgba(255,255,255,0.04)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                  }}>
                    <div style={{ fontSize: 11, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.1em', color: i === 1 ? AMBERA : 'rgba(255,255,255,0.6)', fontWeight: 700 }}>{m.label}</div>
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: `linear-gradient(135deg, ${real.c}, ${real.c}99)`,
                      display: 'grid', placeItems: 'center', fontSize: 22, fontWeight: 700, fontFamily: 'var(--pp-font-display)',
                      border: i === 1 ? `3px solid ${AMBERA}` : '2px solid rgba(255,255,255,0.1)',
                      marginTop: 10,
                      boxShadow: i === 1 ? `0 0 24px ${AMBERA}50` : 'none',
                    }}>{real.av}</div>
                    <div style={{ marginTop: 8, fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em' }}>{real.n}</div>
                    <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>Tier {real.tier}</div>
                    <div style={{ marginTop: 8, display: 'flex', gap: 12, fontSize: 11 }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, color: '#fff', fontSize: 13 }}>{real.checkin}</div>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--pp-font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>check-in</div>
                      </div>
                      <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }}/>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, color: GA, fontSize: 13 }}>R$ {(real.comm / 1000).toFixed(1)}k</div>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--pp-font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>comissão</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Full table */}
            <div style={{ marginTop: 14, flex: 1, overflow: 'hidden', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ padding: '8px 14px', display: 'grid', gridTemplateColumns: '40px 1.5fr 90px 90px 100px 100px 80px', gap: 12, background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)', alignItems: 'center' }}>
                {['#', 'Promoter', 'Inscritos', 'Check', 'Receita', 'Comissão', 'Δ'].map(h => (
                  <div key={h} style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>{h}</div>
                ))}
              </div>
              {ranking.map((p, i) => (
                <div key={i} style={{
                  padding: '10px 14px',
                  display: 'grid', gridTemplateColumns: '40px 1.5fr 90px 90px 100px 100px 80px', gap: 12,
                  borderBottom: i < ranking.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  alignItems: 'center',
                  background: i % 2 === 1 ? 'rgba(255,255,255,0.015)' : 'transparent',
                }}>
                  <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 13, color: p.rank <= 3 ? AMBERA : 'rgba(255,255,255,0.55)' }}>{p.rank}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: `${p.c}30`, border: `1px solid ${p.c}60`, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, color: p.c }}>{p.av}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{p.n}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--pp-font-mono)', marginTop: 1 }}>Tier {p.tier}</div>
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>{p.signups}</div>
                  <div style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 13, color: '#fff', fontWeight: 600 }}>{p.checkin}</div>
                  <div style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>R$ {(p.rev / 1000).toFixed(1)}k</div>
                  <div style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 13, color: GA, fontWeight: 700 }}>R$ {p.comm.toLocaleString('pt-BR')}</div>
                  <div style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 12, color: p.delta.startsWith('+') ? GA : '#FF7A75', fontWeight: 600 }}>{p.delta}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SalesReportScreen, PromoterManagerScreen });
