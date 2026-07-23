// iPadScreens.jsx — Producer Dashboard + PDV Cashless (operator side)

const G3 = '#00FF85', V3 = '#A78BFA', C3 = '#22D3EE', PINK3 = '#FF3D88', AMBER = '#FFB800';

// ─────────────────────────────────────────────────────────
// IPAD FRAME (custom, no starter)
// ─────────────────────────────────────────────────────────
function IPadFrame({ children, width = 1180, height = 820 }) {
  return (
    <div style={{
      width: width + 36, height: height + 36,
      borderRadius: 44,
      background: 'linear-gradient(180deg, #1a1a1f 0%, #0a0a0c 100%)',
      padding: 18,
      position: 'relative',
      boxShadow:
        'inset 0 0 0 1.5px rgba(255,255,255,0.08), inset 0 0 0 4px #0a0a0c, inset 0 0 0 5px rgba(255,255,255,0.06), 0 50px 100px -30px rgba(0,0,0,0.8), 0 0 40px rgba(0,255,133,0.08)',
    }}>
      {/* Camera */}
      <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', width: 8, height: 8, background: '#2a2a30', borderRadius: '50%', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)', zIndex: 5 }}/>
      <div style={{
        width: '100%', height: '100%',
        borderRadius: 26, overflow: 'hidden',
        position: 'relative',
        background: '#06070A',
      }}>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// PRODUCER DASHBOARD — Sales overview
// ─────────────────────────────────────────────────────────
function ProducerDashboard() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', color: '#fff', fontFamily: 'var(--pp-font-body)', position: 'relative' }}>
      {/* Aurora bg */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(50% 40% at 20% 10%, rgba(0,255,133,0.10), transparent 60%), radial-gradient(50% 40% at 80% 90%, rgba(167,139,250,0.10), transparent 60%), #06070A', zIndex: 0 }}/>

      {/* Sidebar */}
      <div style={{
        width: 220, padding: '20px 14px', position: 'relative', zIndex: 1,
        borderRight: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(11,13,18,0.4)',
        backdropFilter: 'blur(20px)',
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        <div style={{ padding: '8px 12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="32" height="32" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="29" fill="none" stroke={G3} strokeWidth="2.5" opacity="0.5"/>
            <circle cx="32" cy="32" r="22" fill="none" stroke={G3} strokeWidth="2"/>
            <path d="M14 32 L22 32 L26 24 L30 40 L34 22 L38 38 L42 32 L50 32" fill="none" stroke={G3} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div>
            <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>Pulse<span style={{ color: G3 }}>PASS</span></div>
            <div style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>Produtor</div>
          </div>
        </div>

        <div style={{ marginTop: 6, fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', padding: '6px 12px' }}>Operar</div>
        {[
          { label: 'Visão geral', icon: '◐', active: true },
          { label: 'Eventos', icon: '▦', count: 12 },
          { label: 'Vendas', icon: '⤿' },
          { label: 'Guest List', icon: '☷', count: 1247 },
          { label: 'Check-in', icon: '◉', live: true },
          { label: 'Cashless', icon: '◈' },
          { label: 'Promoters', icon: '◇' },
        ].map(item => (
          <div key={item.label} style={{
            padding: '10px 12px', borderRadius: 12,
            background: item.active ? 'rgba(0,255,133,0.10)' : 'transparent',
            border: item.active ? '1px solid rgba(0,255,133,0.22)' : '1px solid transparent',
            color: item.active ? G3 : 'rgba(255,255,255,0.75)',
            fontSize: 13, fontWeight: item.active ? 600 : 500,
            display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
          }}>
            <span style={{ fontSize: 14, opacity: 0.8 }}>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.count && <span style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{item.count}</span>}
            {item.live && <span style={{ width: 6, height: 6, borderRadius: '50%', background: PINK3, boxShadow: '0 0 8px rgba(255,61,136,0.8)' }}/>}
          </div>
        ))}

        <div style={{ marginTop: 'auto', padding: 12, borderRadius: 14, background: `linear-gradient(135deg, rgba(167,139,250,0.18), rgba(34,211,238,0.10))`, border: '1px solid rgba(167,139,250,0.25)' }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: V3 }}>Upgrade</div>
          <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4, lineHeight: 1.3 }}>Pulse+ libera relatório Excel premium</div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, position: 'relative', zIndex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <div style={{
          padding: '14px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(11,13,18,0.35)',
          backdropFilter: 'blur(20px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              padding: '6px 12px 6px 8px', borderRadius: 999,
              background: 'rgba(0,255,133,0.08)', border: '1px solid rgba(0,255,133,0.2)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: G3, boxShadow: '0 0 8px rgba(0,255,133,0.8)' }}/>
              <span style={{ fontSize: 11, fontWeight: 600, color: G3, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.05em' }}>FESTIVAL DO SOL · AO VIVO</span>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>30 nov 2026 · 22h00</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'grid', placeItems: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: `linear-gradient(135deg, ${V3}, ${PINK3})`, display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700 }}>E</div>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Erick</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Title + KPI row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 11, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase', color: G3 }}>Visão geral</div>
              <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 32, letterSpacing: '-0.025em', marginTop: 4 }}>
                Boa noite, <span style={{ fontFamily: 'var(--pp-font-serif)', fontStyle: 'italic', fontWeight: 400, color: G3 }}>SMU</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['Esta noite', '7 dias', 'Mês', 'Total'].map((p, i) => (
                <div key={p} style={{ padding: '8px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                  background: i === 0 ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: i === 0 ? '#fff' : 'rgba(255,255,255,0.55)',
                  border: i === 0 ? '1px solid rgba(255,255,255,0.14)' : '1px solid transparent',
                }}>{p}</div>
              ))}
            </div>
          </div>

          {/* KPI cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {[
              { label: 'Faturamento', value: 'R$ 184.320', delta: '+18,4%', tone: G3, spark: [3,5,4,6,8,7,9,11,10,13] },
              { label: 'Ingressos vendidos', value: '2.184', delta: '+312 hoje', tone: V3, spark: [2,3,3,4,5,6,7,9,11,12] },
              { label: 'Check-ins', value: '1.872', delta: '85,7% do público', tone: C3, spark: [0,1,2,4,7,11,14,16,18,19] },
              { label: 'Cashless gasto', value: 'R$ 47.890', delta: 'R$ 22 ticket médio', tone: PINK3, spark: [1,2,3,4,5,6,8,10,11,14] },
            ].map(k => (
              <div key={k.label} style={{
                padding: 18, borderRadius: 18,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                position: 'relative', overflow: 'hidden',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: k.tone, opacity: 0.6 }}/>
                <div style={{ fontSize: 11, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>{k.label}</div>
                <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 26, letterSpacing: '-0.02em', marginTop: 8, color: '#fff' }}>{k.value}</div>
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: k.tone, fontWeight: 600 }}>↑ {k.delta}</span>
                  {/* sparkline */}
                  <svg width="60" height="20" viewBox="0 0 60 20">
                    <polyline
                      points={k.spark.map((v, i) => `${i * 6.5},${20 - v * 1.4}`).join(' ')}
                      fill="none" stroke={k.tone} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>

          {/* Chart + side */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 360px', gap: 14, minHeight: 0 }}>
            {/* Big chart */}
            <div style={{
              padding: 22, borderRadius: 18,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>Vendas em tempo real</div>
                  <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 600, fontSize: 22, letterSpacing: '-0.02em', marginTop: 4 }}>
                    R$ 184.320,<span style={{ color: 'rgba(255,255,255,0.45)' }}>00</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  {[
                    { label: 'Pista', color: G3, val: '62%' },
                    { label: 'Premium', color: V3, val: '28%' },
                    { label: 'VIP', color: C3, val: '10%' },
                  ].map(l => (
                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: l.color }}/>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{l.label}</span>
                      <span style={{ fontSize: 11, fontFamily: 'var(--pp-font-mono)', color: '#fff', fontWeight: 600 }}>{l.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart */}
              <div style={{ flex: 1, marginTop: 16, position: 'relative' }}>
                <svg viewBox="0 0 700 200" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor={G3} stopOpacity="0.35"/>
                      <stop offset="1" stopColor={G3} stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  {/* Grid */}
                  {[0, 1, 2, 3].map(i => (
                    <line key={i} x1="0" y1={50 + i * 40} x2="700" y2={50 + i * 40} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
                  ))}
                  {/* Area Pista */}
                  <path d="M0,180 L50,160 L100,150 L150,130 L200,140 L250,110 L300,90 L350,100 L400,70 L450,60 L500,45 L550,55 L600,30 L650,20 L700,25 L700,200 L0,200 Z" fill="url(#chartGrad)"/>
                  <polyline points="0,180 50,160 100,150 150,130 200,140 250,110 300,90 350,100 400,70 450,60 500,45 550,55 600,30 650,20 700,25" fill="none" stroke={G3} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  {/* Premium */}
                  <polyline points="0,190 50,185 100,182 150,178 200,170 250,165 300,160 350,150 400,148 450,140 500,135 550,130 600,120 650,115 700,110" fill="none" stroke={V3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  {/* VIP */}
                  <polyline points="0,195 50,194 100,192 150,190 200,188 250,186 300,185 350,182 400,180 450,178 500,175 550,172 600,170 650,168 700,165" fill="none" stroke={C3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  {/* Live dot */}
                  <circle cx="700" cy="25" r="5" fill={G3}/>
                  <circle cx="700" cy="25" r="10" fill={G3} opacity="0.3"/>
                </svg>
                {/* X axis */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.4)' }}>
                  {['20h', '20h30', '21h', '21h30', '22h', '22h30', '23h', 'agora'].map(t => <span key={t}>{t}</span>)}
                </div>
              </div>
            </div>

            {/* Live ops side */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{
                padding: 18, borderRadius: 18,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 11, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>Ocupação ao vivo</div>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: G3, boxShadow: '0 0 8px rgba(0,255,133,0.8)' }}/>
                </div>
                <div style={{ marginTop: 12 }}>
                  {[
                    { name: 'Pista geral', cap: 1800, now: 1432, color: G3 },
                    { name: 'Premium', cap: 400, now: 312, color: V3 },
                    { name: 'Camarote VIP', cap: 80, now: 76, color: PINK3 },
                  ].map(z => {
                    const pct = (z.now / z.cap) * 100;
                    return (
                      <div key={z.name} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>{z.name}</span>
                          <span style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{z.now}/{z.cap}</span>
                        </div>
                        <div style={{ marginTop: 6, height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: z.color, boxShadow: `0 0 8px ${z.color}80` }}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{
                padding: 16, borderRadius: 18,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)', flex: 1, minHeight: 0,
              }}>
                <div style={{ fontSize: 11, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 10 }}>Eventos recentes</div>
                {[
                  { who: 'Bia C.', what: 'comprou Premium', t: 'agora', amt: 189, tone: G3 },
                  { who: 'João M.', what: 'check-in portaria 2', t: '32s', amt: null, tone: C3 },
                  { who: 'Lia P.', what: 'recarregou cashless', t: '1m', amt: 100, tone: V3 },
                  { who: 'Caio R.', what: 'comprou 2× Pista', t: '2m', amt: 180, tone: G3 },
                  { who: 'Door 1', what: 'fraude bloqueada', t: '3m', amt: null, tone: PINK3 },
                ].map((e, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: `${e.tone}20`, border: `1px solid ${e.tone}50`, display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, color: e.tone }}>{e.who[0]}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: '#fff' }}><b>{e.who}</b> <span style={{ color: 'rgba(255,255,255,0.6)' }}>{e.what}</span></div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--pp-font-mono)' }}>{e.t}</div>
                    </div>
                    {e.amt && <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 600, fontSize: 11, color: G3 }}>+R$ {e.amt}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// PDV CASHLESS — Operator POS
// ─────────────────────────────────────────────────────────
function PDVScreen() {
  const products = [
    { name: 'Brahma 600ml', price: 18, cat: 'Cerveja', color: AMBER, icon: '🍺', stock: 248 },
    { name: 'Heineken Long Neck', price: 15, cat: 'Cerveja', color: G3, icon: '🍺', stock: 120 },
    { name: 'Caipirinha de limão', price: 24, cat: 'Drink', color: G3, icon: '🍸', stock: '∞' },
    { name: 'Moscow Mule', price: 32, cat: 'Drink', color: C3, icon: '🥃', stock: '∞' },
    { name: 'Gin Tônica premium', price: 38, cat: 'Drink', color: V3, icon: '🍸', stock: 'low' },
    { name: 'Energético Red Bull', price: 18, cat: 'Combo', color: PINK3, icon: '⚡', stock: 86 },
    { name: 'Combo Vodka + RedBull', price: 42, cat: 'Combo', color: PINK3, icon: '🥤', stock: 64 },
    { name: 'Água sem gás', price: 8, cat: 'Não-alcoólico', color: C3, icon: '💧', stock: 312 },
    { name: 'Burger artesanal', price: 32, cat: 'Comida', color: AMBER, icon: '🍔', stock: 28 },
    { name: 'Batata frita G', price: 24, cat: 'Comida', color: AMBER, icon: '🍟', stock: 42 },
    { name: 'Hot dog premium', price: 22, cat: 'Comida', color: V3, icon: '🌭', stock: 38 },
    { name: 'Pizza brotinho', price: 28, cat: 'Comida', color: PINK3, icon: '🍕', stock: 18 },
  ];

  const cart = [
    { name: 'Brahma 600ml', qty: 2, price: 18 },
    { name: 'Combo Vodka + RedBull', qty: 1, price: 42 },
    { name: 'Batata frita G', qty: 1, price: 24 },
  ];
  const subtotal = cart.reduce((a, b) => a + b.price * b.qty, 0);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', color: '#fff', fontFamily: 'var(--pp-font-body)', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(50% 40% at 10% 0%, rgba(0,255,133,0.06), transparent 60%), radial-gradient(40% 40% at 100% 100%, rgba(255,61,136,0.06), transparent 60%), #06070A', zIndex: 0 }}/>

      {/* Left — Catalog */}
      <div style={{ flex: 1, position: 'relative', zIndex: 1, padding: 22, display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ padding: '6px 12px 6px 10px', borderRadius: 999, background: 'rgba(0,255,133,0.10)', border: '1px solid rgba(0,255,133,0.25)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: G3, boxShadow: '0 0 8px rgba(0,255,133,0.8)' }}/>
              <span style={{ fontSize: 11, fontFamily: 'var(--pp-font-mono)', color: G3, fontWeight: 600, letterSpacing: '0.05em' }}>PDV 03 · BAR CENTRAL</span>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>Operador: Marcos S. · Caixa #4720</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ padding: '8px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>Modo Offline</span>
              <div style={{ width: 32, height: 18, borderRadius: 99, background: 'rgba(255,255,255,0.1)', position: 'relative' }}>
                <div style={{ position: 'absolute', left: 2, top: 2, width: 14, height: 14, borderRadius: '50%', background: '#fff' }}/>
              </div>
            </div>
            <div style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 16, fontWeight: 700, padding: '8px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>23:47</div>
          </div>
        </div>

        {/* Search + categories */}
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{
            flex: 1, height: 48, borderRadius: 14,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Buscar produto, código de barras…</span>
          </div>
          {['Tudo', 'Cerveja', 'Drink', 'Combo', 'Comida'].map((c, i) => (
            <div key={c} style={{
              padding: '0 18px', height: 48, borderRadius: 14, display: 'flex', alignItems: 'center',
              fontSize: 13, fontWeight: 600,
              background: i === 0 ? G3 : 'rgba(255,255,255,0.05)',
              color: i === 0 ? '#003C1F' : 'rgba(255,255,255,0.85)',
              border: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.1)',
            }}>{c}</div>
          ))}
        </div>

        {/* Product grid */}
        <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridAutoRows: 'minmax(0, 1fr)', gap: 12, overflow: 'hidden' }}>
          {products.map((p, i) => (
            <div key={i} style={{
              padding: 14, borderRadius: 16,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
              position: 'relative',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
              overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: p.color, opacity: 0.7 }}/>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${p.color}20`, border: `1px solid ${p.color}40`, display: 'grid', placeItems: 'center', fontSize: 20 }}>{p.icon}</div>
                {p.stock === 'low' ? (
                  <span style={{ padding: '2px 6px', borderRadius: 6, fontSize: 9, fontFamily: 'var(--pp-font-mono)', textTransform: 'uppercase', background: 'rgba(255,184,0,0.2)', color: AMBER, fontWeight: 600 }}>Baixo</span>
                ) : (
                  <span style={{ fontSize: 9, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.4)' }}>{p.stock}</span>
                )}
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{p.cat}</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 3, lineHeight: 1.2 }}>{p.name}</div>
                <div style={{ marginTop: 6, fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 16, color: '#fff' }}>R$ {p.price.toFixed(2).replace('.', ',')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — Cart */}
      <div style={{
        width: 380, position: 'relative', zIndex: 1,
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(11,13,18,0.5)',
        backdropFilter: 'blur(20px)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Customer */}
        <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>Cliente</div>
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${V3}, ${PINK3})`, display: 'grid', placeItems: 'center', fontSize: 16, fontWeight: 700 }}>B</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Bianca C.</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--pp-font-mono)', marginTop: 2 }}>PSP-9C3K · Premium</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>Saldo</div>
              <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 18, color: G3, marginTop: 2 }}>R$ 187,50</div>
            </div>
          </div>
        </div>

        {/* Cart items */}
        <div style={{ flex: 1, overflow: 'hidden', padding: '14px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>Comanda</div>
            <span style={{ fontSize: 11, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.5)' }}>{cart.length} itens</span>
          </div>
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cart.map((c, i) => (
              <div key={i} style={{
                padding: '12px 14px', borderRadius: 14,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2, fontFamily: 'var(--pp-font-mono)' }}>{c.qty} × R$ {c.price},00</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontSize: 14 }}>−</button>
                  <span style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 600, fontSize: 13, minWidth: 18, textAlign: 'center' }}>{c.qty}</span>
                  <button style={{ width: 26, height: 26, borderRadius: 8, background: G3, color: '#003C1F', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>+</button>
                </div>
                <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 14, marginLeft: 4, minWidth: 60, textAlign: 'right' }}>R$ {(c.qty * c.price).toFixed(2).replace('.', ',')}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals + CTA */}
        <div style={{ padding: '14px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.6)', padding: '4px 0' }}>
            <span>Subtotal</span><span style={{ fontFamily: 'var(--pp-font-mono)' }}>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.6)', padding: '4px 0' }}>
            <span>Taxa de serviço (10%)</span><span style={{ fontFamily: 'var(--pp-font-mono)' }}>R$ {(subtotal * 0.1).toFixed(2).replace('.', ',')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Total</span>
            <span style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 28, color: '#fff' }}>R$ <span style={{ color: G3 }}>{(subtotal * 1.1).toFixed(2).replace('.', ',')}</span></span>
          </div>

          <button style={{
            width: '100%', marginTop: 14, height: 56, borderRadius: 16, border: 'none',
            background: `linear-gradient(180deg, #4DFFA8 0%, ${G3} 100%)`,
            color: '#003C1F', fontWeight: 700, fontSize: 16,
            boxShadow: '0 8px 24px rgba(0,255,133,0.4), inset 0 1px 0 rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            cursor: 'pointer',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h7v7"/></svg>
            Aproximar pulseira NFC
          </button>
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            <button style={{ flex: 1, height: 40, borderRadius: 12, border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>QR do cliente</button>
            <button style={{ flex: 1, height: 40, borderRadius: 12, border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>PIX no balcão</button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { IPadFrame, ProducerDashboard, PDVScreen });
