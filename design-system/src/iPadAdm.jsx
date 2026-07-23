// iPadAdm.jsx — ADM PulsePass · Super-admin platform views

const GD = '#00FF85', VD = '#A78BFA', CD = '#22D3EE', PINKD = '#FF3D88', AMBERD = '#FFB800', RED = '#FF3B30';

// ADM sidebar
function AdmSidebar({ active = 'platform' }) {
  const items = [
    { k: 'platform', i: '◐', l: 'Plataforma' },
    { k: 'orgs', i: '◇', l: 'Orgs' },
    { k: 'fraud', i: '⚠', l: 'Antifraude' },
    { k: 'finance', i: '$', l: 'Financeiro' },
    { k: 'support', i: '◔', l: 'Suporte' },
    { k: 'audit', i: '◉', l: 'Audit log' },
    { k: 'fees', i: '%', l: 'Taxas' },
    { k: 'flags', i: '⚑', l: 'Feature flags' },
  ];
  return (
    <div style={{ width: 220, padding: '20px 12px', borderRight: '1px solid rgba(255,255,255,0.06)', background: 'rgba(11,13,18,0.5)', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
      <div style={{ padding: '4px 8px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg width="28" height="28" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="22" fill="none" stroke={PINKD} strokeWidth="2.5"/>
          <path d="M14 32 L22 32 L26 24 L30 40 L34 22 L38 38 L42 32 L50 32" fill="none" stroke={PINKD} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div>
          <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>Pulse<span style={{ color: PINKD }}>ADM</span></div>
          <div style={{ fontSize: 9, fontFamily: 'var(--pp-font-mono)', color: PINKD, letterSpacing: '0.12em' }}>SUPER-ADMIN</div>
        </div>
      </div>

      <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', padding: '6px 12px' }}>Operação</div>
      {items.map(it => {
        const sel = it.k === active;
        return (
          <div key={it.k} style={{
            padding: '10px 12px', borderRadius: 10,
            background: sel ? `rgba(255,61,136,0.10)` : 'transparent',
            border: sel ? `1px solid rgba(255,61,136,0.25)` : '1px solid transparent',
            color: sel ? PINKD : 'rgba(255,255,255,0.7)',
            fontSize: 13, fontWeight: sel ? 600 : 500,
            display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
          }}>
            <span style={{ fontSize: 14, opacity: 0.85, width: 14, textAlign: 'center' }}>{it.i}</span>
            <span>{it.l}</span>
          </div>
        );
      })}

      <div style={{ marginTop: 'auto', padding: 12, borderRadius: 12, background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: RED, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700 }}>EB</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600 }}>Erick B.</div>
          <div style={{ fontSize: 9, fontFamily: 'var(--pp-font-mono)', color: '#FF7A75', letterSpacing: '0.06em' }}>SSO · ADM-7</div>
        </div>
      </div>
    </div>
  );
}

// Top bar with security pill
function AdmTopBar({ where = 'Visão geral da plataforma' }) {
  return (
    <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ padding: '6px 12px 6px 8px', borderRadius: 999, background: 'rgba(255,59,48,0.10)', border: '1px solid rgba(255,59,48,0.28)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', color: '#FF7A75', fontWeight: 600, letterSpacing: '0.08em' }}>MODO ADMINISTRATIVO · TUDO É TRILHADO</span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{where}</div>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'var(--pp-font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>p99 · 142ms</div>
        <div style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(0,255,133,0.08)', border: '1px solid rgba(0,255,133,0.2)', fontFamily: 'var(--pp-font-mono)', fontSize: 11, color: GD, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: GD, boxShadow: `0 0 6px ${GD}` }}/>
          status OK
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SCREEN AJ — ADM PLATFORM DASHBOARD
// ─────────────────────────────────────────────────────────
function AdmPlatformScreen() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', color: '#fff', fontFamily: 'var(--pp-font-body)', background: '#06070A', display: 'flex' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(40% 30% at 80% 10%, rgba(255,61,136,0.10), transparent 60%), radial-gradient(40% 30% at 20% 80%, rgba(167,139,250,0.06), transparent 60%), #06070A' }}/>
      <AdmSidebar active="platform"/>

      <div style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AdmTopBar where="Multi-tenant · todas as orgs · tempo real"/>

        <div style={{ flex: 1, padding: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div className="pp-eyebrow" style={{ color: PINKD }}>ADM PulsePass</div>
            <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 30, letterSpacing: '-0.025em', marginTop: 4 }}>
              A plataforma <span style={{ fontFamily: 'var(--pp-font-serif)', fontStyle: 'italic', fontWeight: 400, color: PINKD }}>respira.</span>
            </div>
          </div>

          {/* Platform KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            {[
              { l: 'GMV 24h', v: 'R$ 4,2M', d: '+18% vs ontem', c: GD },
              { l: 'Take rate', v: '4,9%', d: 'R$ 207k receita', c: PINKD },
              { l: 'Eventos ao vivo', v: '47', d: 'em 12 cidades', c: VD },
              { l: 'Transações/s', v: '184', d: 'pico 612 às 21h', c: CD },
              { l: 'Fraude bloqueada', v: 'R$ 8,4k', d: '32 tentativas', c: AMBERD },
            ].map(k => (
              <div key={k.l} style={{ padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: k.c, opacity: 0.7 }}/>
                <div style={{ fontSize: 9, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>{k.l}</div>
                <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 22, color: '#fff', marginTop: 4, letterSpacing: '-0.02em' }}>{k.v}</div>
                <div style={{ marginTop: 3, fontSize: 10, color: k.c }}>{k.d}</div>
              </div>
            ))}
          </div>

          {/* Two col main */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14, minHeight: 0 }}>
            {/* Big chart + map */}
            <div style={{ padding: 20, borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 600, fontSize: 18, letterSpacing: '-0.015em' }}>GMV hoje</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>histórico de 24h em todas as orgs</div>
                </div>
                <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 22, color: GD }}>R$ 4.184.320</div>
              </div>

              <div style={{ flex: 1, marginTop: 14, position: 'relative', display: 'flex' }}>
                <svg viewBox="0 0 700 220" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                  <defs>
                    <linearGradient id="admGmv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor={PINKD} stopOpacity="0.4"/>
                      <stop offset="1" stopColor={PINKD} stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  {[0, 1, 2, 3].map(i => (
                    <line key={i} x1="0" y1={50 + i * 50} x2="700" y2={50 + i * 50} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
                  ))}
                  <path d="M0,180 L70,170 L140,150 L210,140 L280,120 L350,100 L420,80 L490,60 L560,40 L630,32 L700,28 L700,220 L0,220 Z" fill="url(#admGmv)"/>
                  <polyline points="0,180 70,170 140,150 210,140 280,120 350,100 420,80 490,60 560,40 630,32 700,28" fill="none" stroke={PINKD} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="700" cy="28" r="5" fill={PINKD}/>
                  <circle cx="700" cy="28" r="10" fill={PINKD} opacity="0.3"/>
                </svg>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.4)' }}>
                {['00h', '04h', '08h', '12h', '16h', '20h', 'agora'].map(t => <span key={t}>{t}</span>)}
              </div>

              {/* By city */}
              <div style={{ marginTop: 20 }}>
                <div className="pp-label" style={{ marginBottom: 10 }}>Distribuição por cidade · top 6</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { c: 'São Paulo', v: 1840, p: 44, color: GD },
                    { c: 'Rio de Janeiro', v: 720, p: 17, color: VD },
                    { c: 'Belo Horizonte', v: 480, p: 11, color: CD },
                    { c: 'Brasília', v: 320, p: 8, color: PINKD },
                    { c: 'Salvador', v: 260, p: 6, color: AMBERD },
                    { c: 'Outras (8)', v: 564, p: 14, color: 'rgba(255,255,255,0.3)' },
                  ].map((row, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 110, fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>{row.c}</span>
                      <div style={{ flex: 1, height: 8, borderRadius: 99, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                        <div style={{ width: `${row.p * 2}%`, height: '100%', background: row.color, boxShadow: typeof row.color === 'string' && row.color.includes('rgba') ? 'none' : `0 0 6px ${row.color}80` }}/>
                      </div>
                      <span style={{ width: 80, textAlign: 'right', fontFamily: 'var(--pp-font-mono)', fontSize: 11, color: '#fff', fontWeight: 600 }}>R$ {row.v}k</span>
                      <span style={{ width: 36, textAlign: 'right', fontFamily: 'var(--pp-font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{row.p}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Side: alerts + top orgs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
              {/* Live alerts */}
              <div style={{ padding: 18, borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="pp-label" style={{ color: AMBERD }}>Alertas ao vivo · 4</div>
                  <span className="pp-pulse-dot" style={{ width: 7, height: 7, background: AMBERD }}/>
                </div>
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { sev: 'high', m: 'Audio Club · cap. 95% Pista', t: '2min', c: AMBERD },
                    { sev: 'crit', m: '12 chargebacks · Bar Cocó', t: '8min', c: RED },
                    { sev: 'info', m: 'Webhook Asaas atraso 480ms', t: '14min', c: CD },
                    { sev: 'high', m: 'Promoter banido auto-detect', t: '32min', c: PINKD },
                  ].map((a, i) => (
                    <div key={i} style={{ padding: '8px 10px', borderRadius: 10, background: `${a.c}08`, border: `1px solid ${a.c}25`, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: a.c }}/>
                      <span style={{ flex: 1, fontSize: 12 }}>{a.m}</span>
                      <span style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.4)' }}>{a.t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top orgs */}
              <div style={{ padding: 18, borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', flex: 1, overflow: 'hidden' }}>
                <div className="pp-label">Top orgs · GMV 24h</div>
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { r: 1, n: 'Audio Club', gmv: 312, c: VD, ev: 1 },
                    { r: 2, n: 'Boate Roxa', gmv: 247, c: PINKD, ev: 2 },
                    { r: 3, n: 'Cervejaria Aurora', gmv: 184, c: GD, ev: 1 },
                    { r: 4, n: 'Skye Bar', gmv: 142, c: CD, ev: 1 },
                    { r: 5, n: 'Festival Pampulha', gmv: 98, c: AMBERD, ev: 1 },
                    { r: 6, n: 'Outras 248 orgs', gmv: 3201, c: 'rgba(255,255,255,0.3)', ev: '—' },
                  ].map((o, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 4px', borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                      <span style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.45)', width: 18, fontWeight: 600 }}>{o.r}</span>
                      <span style={{ flex: 1, fontSize: 12, fontWeight: 600 }}>{o.n}</span>
                      <span style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{o.ev} ev</span>
                      <span style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 12, color: typeof o.c === 'string' && o.c.includes('rgba') ? 'rgba(255,255,255,0.6)' : o.c }}>R$ {o.gmv}k</span>
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
// SCREEN AK — ADM ORGANIZATIONS (multi-tenant list with health)
// ─────────────────────────────────────────────────────────
function AdmOrgsScreen() {
  const orgs = [
    { n: 'Audio Club', cnpj: '14.512.528', city: 'SP', ev: 24, gmv: 4.8, risk: 'low', tier: 'enterprise', c: VD, kyc: 'verified', age: '3a' },
    { n: 'Boate Roxa', cnpj: '08.421.118', city: 'SP', ev: 14, gmv: 2.4, risk: 'low', tier: 'pro', c: PINKD, kyc: 'verified', age: '2a' },
    { n: 'Cervejaria Aurora', cnpj: '22.918.402', city: 'BH', ev: 8, gmv: 1.2, risk: 'low', tier: 'pro', c: GD, kyc: 'verified', age: '1a' },
    { n: 'Skye Bar RJ', cnpj: '31.840.272', city: 'RJ', ev: 6, gmv: 0.98, risk: 'medium', tier: 'pro', c: CD, kyc: 'pending', age: '8m', flags: ['chargeback rate 2.1%'] },
    { n: 'Festival Pampulha', cnpj: '47.291.301', city: 'BH', ev: 1, gmv: 0.78, risk: 'low', tier: 'event', c: AMBERD, kyc: 'verified', age: '3m' },
    { n: 'Bar Cocó', cnpj: '99.482.118', city: 'FOR', ev: 4, gmv: 0.21, risk: 'high', tier: 'pro', c: RED, kyc: 'review', age: '2m', flags: ['12 chargebacks', 'cap. inflada'] },
    { n: 'Mar Aberto Floripa', cnpj: '13.482.918', city: 'FLN', ev: 3, gmv: 0.18, risk: 'low', tier: 'starter', c: GD, kyc: 'verified', age: '1m' },
    { n: 'Studio Bar Goiânia', cnpj: '52.918.341', city: 'GYN', ev: 2, gmv: 0.12, risk: 'medium', tier: 'starter', c: AMBERD, kyc: 'pending', age: '2sem', flags: ['CNPJ < 90 dias'] },
  ];

  const riskColor = (r) => r === 'high' ? RED : r === 'medium' ? AMBERD : GD;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', color: '#fff', fontFamily: 'var(--pp-font-body)', background: '#06070A', display: 'flex' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(40% 30% at 80% 10%, rgba(167,139,250,0.06), transparent 60%), #06070A' }}/>
      <AdmSidebar active="orgs"/>

      <div style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AdmTopBar where="248 organizações ativas · 12 em revisão"/>

        <div style={{ flex: 1, padding: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <div className="pp-eyebrow" style={{ color: VD }}>Organizações</div>
              <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 26, letterSpacing: '-0.025em', marginTop: 4 }}>248 orgs · saúde global</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ padding: '10px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>📥 Exportar</button>
              <button style={{ padding: '10px 16px', borderRadius: 12, background: PINKD, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', boxShadow: '0 4px 16px rgba(255,61,136,0.35)' }}>+ Cadastrar org</button>
            </div>
          </div>

          {/* Health summary */}
          <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              { l: 'Saudáveis', v: 224, p: 90, c: GD },
              { l: 'Em observação', v: 12, p: 5, c: AMBERD },
              { l: 'Alto risco', v: 8, p: 3, c: PINKD },
              { l: 'Suspensas', v: 4, p: 2, c: RED },
            ].map(k => (
              <div key={k.l} style={{ padding: 14, borderRadius: 14, background: `${k.c}08`, border: `1px solid ${k.c}25` }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>{k.l}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
                  <span style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 22, color: k.c }}>{k.v}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{k.p}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, height: 40, padding: '0 14px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Buscar org por nome, CNPJ ou cidade</span>
            </div>
            {['Risco ↓', 'GMV ↓', 'KYC pendente', 'Recém-criadas'].map((t, i) => (
              <div key={t} style={{
                padding: '0 14px', height: 40, borderRadius: 12, display: 'flex', alignItems: 'center',
                fontSize: 12, fontWeight: 600,
                background: i === 0 ? 'rgba(255,61,136,0.12)' : 'rgba(255,255,255,0.04)',
                border: i === 0 ? '1px solid rgba(255,61,136,0.3)' : '1px solid rgba(255,255,255,0.08)',
                color: i === 0 ? PINKD : 'rgba(255,255,255,0.7)',
              }}>{t}</div>
            ))}
          </div>

          {/* Table */}
          <div style={{ marginTop: 14, flex: 1, overflow: 'hidden', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ padding: '10px 16px', display: 'grid', gridTemplateColumns: '2fr 120px 70px 70px 90px 110px 100px 100px', gap: 10, background: 'rgba(255,255,255,0.025)', borderBottom: '1px solid rgba(255,255,255,0.06)', alignItems: 'center' }}>
              {['Org', 'CNPJ', 'Cidade', 'Ev', 'GMV/mês', 'KYC', 'Plano', 'Risco'].map(h => (
                <div key={h} style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>{h}</div>
              ))}
            </div>
            {orgs.map((o, i) => (
              <div key={i} style={{
                padding: '12px 16px',
                display: 'grid', gridTemplateColumns: '2fr 120px 70px 70px 90px 110px 100px 100px', gap: 10,
                borderBottom: i < orgs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                alignItems: 'center',
                background: i % 2 === 1 ? 'rgba(255,255,255,0.015)' : 'transparent',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${o.c}30`, border: `1px solid ${o.c}50`, display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700, color: o.c }}>{o.n[0]}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{o.n}</div>
                    {o.flags && <div style={{ fontSize: 9, color: '#FF7A75', marginTop: 2, fontFamily: 'var(--pp-font-mono)' }}>⚠ {o.flags.join(' · ')}</div>}
                    {!o.flags && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 1, fontFamily: 'var(--pp-font-mono)' }}>desde {o.age}</div>}
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>{o.cnpj}</div>
                <div style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{o.city}</div>
                <div style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 12 }}>{o.ev}</div>
                <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 12 }}>R$ {o.gmv}M</div>
                <PBadge tone={o.kyc === 'verified' ? 'pulse' : o.kyc === 'pending' ? 'amber' : 'red'}>{o.kyc}</PBadge>
                <PBadge tone={o.tier === 'enterprise' ? 'violet' : o.tier === 'pro' ? 'cyan' : o.tier === 'event' ? 'pink' : 'neutral'}>{o.tier}</PBadge>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: riskColor(o.risk), boxShadow: `0 0 6px ${riskColor(o.risk)}80` }}/>
                  <span style={{ fontSize: 12, fontWeight: 600, color: riskColor(o.risk), textTransform: 'capitalize' }}>{o.risk}</span>
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
// SCREEN AL — ADM FRAUD MONITOR
// ─────────────────────────────────────────────────────────
function AdmFraudScreen() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', color: '#fff', fontFamily: 'var(--pp-font-body)', background: '#06070A', display: 'flex' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(50% 40% at 80% 20%, rgba(255,59,48,0.10), transparent 60%), radial-gradient(40% 40% at 20% 80%, rgba(255,184,0,0.08), transparent 60%), #06070A' }}/>
      <AdmSidebar active="fraud"/>

      <div style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AdmTopBar where="Engine antifraude · ML em tempo real"/>

        <div style={{ flex: 1, padding: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <div className="pp-eyebrow" style={{ color: RED }}>Antifraude · ao vivo</div>
              <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 26, letterSpacing: '-0.025em', marginTop: 4 }}>
                Engine bloqueou <span style={{ fontFamily: 'var(--pp-font-serif)', fontStyle: 'italic', fontWeight: 400, color: RED }}>R$ 8.420</span> em 24h
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 12, background: 'rgba(0,255,133,0.10)', border: '1px solid rgba(0,255,133,0.25)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: GD, boxShadow: `0 0 6px ${GD}` }}/>
              <span style={{ fontSize: 11, fontFamily: 'var(--pp-font-mono)', color: GD, fontWeight: 600 }}>ML model · v7.2 · 99.4% precision</span>
            </div>
          </div>

          {/* KPIs */}
          <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { l: 'Bloqueado 24h', v: 'R$ 8.420', d: '32 tentativas', c: RED },
              { l: 'Falsos positivos', v: '1,2%', d: '4 disputas', c: AMBERD },
              { l: 'Latência scoring', v: '78ms', d: 'p99 142ms', c: GD },
              { l: 'Modelos ativos', v: '7', d: 'PIX/CC/AZ/QR/Door', c: VD },
            ].map(k => (
              <div key={k.l} style={{ padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: k.c, opacity: 0.7 }}/>
                <div style={{ fontSize: 9, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>{k.l}</div>
                <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 22, color: '#fff', marginTop: 4 }}>{k.v}</div>
                <div style={{ marginTop: 3, fontSize: 10, color: k.c }}>{k.d}</div>
              </div>
            ))}
          </div>

          {/* Two col: incidents + heatmap */}
          <div style={{ flex: 1, marginTop: 14, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14, minHeight: 0 }}>
            {/* Live incidents */}
            <div style={{ padding: 18, borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 600, fontSize: 18, letterSpacing: '-0.015em' }}>Incidentes recentes</div>
                <span style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.5)' }}>auto-refresh 1s</span>
              </div>

              <div style={{ marginTop: 12, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { sev: 'crit', t: 'agora', kind: 'PIX duplicado', detail: 'CPF 348.***.***-22 · 4× em 90s', amt: 'R$ 760', score: 98, action: 'bloqueado', c: RED },
                  { sev: 'crit', t: '42s', kind: 'QR replay attack', detail: 'PSP-3K2L · token expirado reusado', amt: '—', score: 96, action: 'bloqueado', c: RED },
                  { sev: 'high', t: '2min', kind: 'Velocidade compra', detail: 'IP 187.180.* · 11 compras em 2min', amt: 'R$ 1.840', score: 84, action: 'review', c: AMBERD },
                  { sev: 'high', t: '8min', kind: 'Chargeback cluster', detail: 'Bar Cocó · 12 disputas Visa', amt: 'R$ 3.240', score: 88, action: 'org-flag', c: AMBERD },
                  { sev: 'med', t: '14min', kind: 'CPF inválido', detail: 'Inscrição lista AZ · dígitos errados', amt: '—', score: 72, action: 'rejeitado', c: PINKD },
                  { sev: 'med', t: '22min', kind: 'Geo mismatch', detail: 'Compra SP · QR scan Manaus', amt: 'R$ 420', score: 68, action: 'review', c: AMBERD },
                  { sev: 'low', t: '34min', kind: 'Promoter auto-banido', detail: 'Lia C.² · 14 contas duplicadas', amt: '—', score: 91, action: 'banido', c: VD },
                ].map((inc, i) => (
                  <div key={i} style={{
                    padding: 12, borderRadius: 12,
                    background: `${inc.c}08`, border: `1px solid ${inc.c}25`,
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <div style={{ width: 6, alignSelf: 'stretch', borderRadius: 3, background: inc.c }}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{inc.kind}</span>
                        <span style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.5)' }}>{inc.t}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2, fontFamily: 'var(--pp-font-mono)' }}>{inc.detail}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 12, color: '#fff' }}>{inc.amt}</div>
                      <div style={{ marginTop: 4, padding: '2px 8px', borderRadius: 999, background: `${inc.c}20`, color: inc.c, fontSize: 9, fontFamily: 'var(--pp-font-mono)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        score {inc.score} · {inc.action}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Type breakdown + rules */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
              {/* Type breakdown */}
              <div style={{ padding: 18, borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="pp-label">Tipos de fraude · 7 dias</div>
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { l: 'QR replay attack', v: 84, p: 36, c: RED },
                    { l: 'PIX duplicado', v: 52, p: 22, c: PINKD },
                    { l: 'Chargeback cluster', v: 38, p: 16, c: AMBERD },
                    { l: 'Velocidade compra', v: 28, p: 12, c: CD },
                    { l: 'Geo mismatch', v: 18, p: 8, c: VD },
                    { l: 'Outras', v: 14, p: 6, c: 'rgba(255,255,255,0.3)' },
                  ].map(r => (
                    <div key={r.l} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 90, fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>{r.l}</span>
                      <div style={{ flex: 1, height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                        <div style={{ width: `${r.p * 2.5}%`, height: '100%', background: r.c }}/>
                      </div>
                      <span style={{ width: 40, textAlign: 'right', fontFamily: 'var(--pp-font-mono)', fontSize: 11, fontWeight: 600 }}>{r.v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active rules */}
              <div style={{ padding: 18, borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', flex: 1, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <div className="pp-label">Regras ativas · 14</div>
                  <span style={{ fontSize: 10, color: GD, fontFamily: 'var(--pp-font-mono)' }}>+ regra</span>
                </div>
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { l: 'JWT QR exp ≤ 5min', cat: 'auth', on: true, c: GD },
                    { l: 'Velocity ≥ 6 compras/2min', cat: 'velocity', on: true, c: CD },
                    { l: 'Chargeback rate org > 1%', cat: 'org', on: true, c: AMBERD },
                    { l: 'Geo IP vs QR scan ≠', cat: 'qr', on: true, c: VD },
                    { l: 'CPF blacklist Receita', cat: 'kyc', on: true, c: RED },
                    { l: 'Promoter contas dupl ≥ 3', cat: 'azlist', on: true, c: PINKD },
                  ].map((r, i) => (
                    <div key={i} style={{ padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ padding: '2px 6px', borderRadius: 4, background: `${r.c}20`, color: r.c, fontSize: 8, fontFamily: 'var(--pp-font-mono)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{r.cat}</span>
                      <span style={{ flex: 1, fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>{r.l}</span>
                      <div style={{ width: 26, height: 14, borderRadius: 99, background: r.on ? GD : 'rgba(255,255,255,0.1)', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: r.on ? 13 : 2, top: 2, width: 10, height: 10, borderRadius: '50%', background: '#fff' }}/>
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
// SCREEN AM — ADM SUPPORT INBOX
// ─────────────────────────────────────────────────────────
function AdmSupportScreen() {
  const tickets = [
    { id: '#PP-7401', sub: 'Não recebi meu QR após pagar via Pix', role: 'cliente', who: 'Beatriz S.', org: '—', t: '2min', prio: 'high', sla: '28min', sla_pct: 90, c: PINKD, unread: true, msg: 'Paguei às 22h12 e não chegou no app...' },
    { id: '#PP-7400', sub: 'Como configurar webhook do Asaas?', role: 'produtora', who: 'Audio Club', org: 'Audio Club', t: '8min', prio: 'medium', sla: '3h12m', sla_pct: 40, c: VD, msg: 'Tô integrando o split de pagamento mas...' },
    { id: '#PP-7399', sub: 'Saque travado · CNPJ pendente KYC', role: 'produtora', who: 'Skye Bar RJ', org: 'Skye Bar RJ', t: '14min', prio: 'high', sla: '1h22m', sla_pct: 70, c: AMBERD, msg: 'Recebi notificação que o saque está aguardando...' },
    { id: '#PP-7398', sub: 'Comissão de promoter não bateu', role: 'promoter', who: 'Lia Coelho', org: 'Audio Club', t: '22min', prio: 'medium', sla: '5h12m', sla_pct: 30, c: VD, msg: 'Festival do Sol fechei 247 check-ins...' },
    { id: '#PP-7397', sub: 'Maquininha Stone não conecta no BoxOffice', role: 'produtora', who: 'Boate Roxa', org: 'Boate Roxa', t: '38min', prio: 'low', sla: '11h45m', sla_pct: 15, c: GD, msg: 'A maquininha pareou mas dá erro no PDV...' },
    { id: '#PP-7396', sub: 'Quero cancelar compra de ingresso', role: 'cliente', who: 'Júlia R.', org: '—', t: '1h', prio: 'low', sla: 'fora SLA', sla_pct: 5, c: GD, msg: 'Comprei errado um ingresso pra...' },
  ];

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', color: '#fff', fontFamily: 'var(--pp-font-body)', background: '#06070A', display: 'flex' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(40% 30% at 20% 10%, rgba(34,211,238,0.06), transparent 60%), #06070A' }}/>
      <AdmSidebar active="support"/>

      <div style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AdmTopBar where="Inbox · 24 abertos · 184 resolvidos hoje"/>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Inbox column */}
          <div style={{ width: 420, padding: '20px 0 0', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '0 20px 14px' }}>
              <div className="pp-eyebrow" style={{ color: CD }}>Inbox de suporte</div>
              <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em', marginTop: 4 }}>24 abertos</div>
              <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
                {[{ l: 'Tudo · 24', sel: true }, { l: 'Alta · 8' }, { l: 'SLA risco · 3' }, { l: 'Meus' }].map((t, i) => (
                  <div key={i} style={{ padding: '5px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: t.sel ? 'rgba(34,211,238,0.12)' : 'rgba(255,255,255,0.04)', color: t.sel ? CD : 'rgba(255,255,255,0.6)', border: `1px solid ${t.sel ? 'rgba(34,211,238,0.3)' : 'rgba(255,255,255,0.08)'}` }}>{t.l}</div>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, overflow: 'hidden' }}>
              {tickets.map((tk, i) => (
                <div key={i} style={{
                  padding: '14px 20px', cursor: 'pointer',
                  background: i === 0 ? 'rgba(34,211,238,0.06)' : 'transparent',
                  borderLeft: i === 0 ? `3px solid ${CD}` : '3px solid transparent',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {tk.unread && <span style={{ width: 6, height: 6, borderRadius: '50%', background: CD, boxShadow: `0 0 6px ${CD}` }}/>}
                    <span style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em' }}>{tk.id}</span>
                    <PBadge tone={tk.role === 'cliente' ? 'pulse' : tk.role === 'produtora' ? 'cyan' : 'violet'}>{tk.role}</PBadge>
                    <span style={{ marginLeft: 'auto', fontSize: 10, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.45)' }}>{tk.t}</span>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{tk.sub}</div>
                  <div style={{ marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{tk.who}{tk.org !== '—' && ` · ${tk.org}`}</div>
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div style={{ width: `${tk.sla_pct}%`, height: '100%', background: tk.sla_pct > 80 ? RED : tk.sla_pct > 50 ? AMBERD : GD }}/>
                    </div>
                    <span style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', color: tk.sla_pct > 80 ? RED : tk.sla_pct > 50 ? AMBERD : 'rgba(255,255,255,0.55)' }}>SLA · {tk.sla}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detail */}
          <div style={{ flex: 1, padding: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <PBadge tone="pink" dot>SLA risco</PBadge>
                  <PBadge tone="pulse">cliente</PBadge>
                  <span style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>#PP-7401 · há 2min</span>
                </div>
                <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em', marginTop: 10 }}>Não recebi meu QR após pagar via Pix</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>Beatriz Souza · @biasouza · CPF 231.***.***-04</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Assumir</button>
                <button style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Escalar</button>
              </div>
            </div>

            {/* Customer context cards */}
            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {[
                { l: 'Pedido', v: '#PSP-7H29', c: CD },
                { l: 'Pix status', v: 'aprovado', c: GD },
                { l: 'Tempo desde pag.', v: '2:18 min', c: AMBERD },
                { l: 'Eventos no perfil', v: '4', c: VD },
              ].map(s => (
                <div key={s.l} style={{ padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: 9, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>{s.l}</div>
                  <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 13, color: s.c, marginTop: 4 }}>{s.v}</div>
                </div>
              ))}
            </div>

            {/* Conversation */}
            <div style={{ flex: 1, marginTop: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div className="pp-label" style={{ marginBottom: 12 }}>Conversa</div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
                {/* User message */}
                <div style={{ alignSelf: 'flex-start', maxWidth: '70%' }}>
                  <div style={{ padding: 14, borderRadius: '16px 16px 16px 4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: 13, lineHeight: 1.5 }}>Oi! Paguei o Pix do Festival do Sol às 22:12 (R$ 189) e a tela falou que ia chegar em até 30s. Já se passaram 2 minutos e nada apareceu em "Meus Ingressos". Vocês conseguem ver o que aconteceu?</div>
                  </div>
                  <div style={{ marginTop: 4, fontSize: 10, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--pp-font-mono)' }}>Beatriz · 22:14</div>
                </div>

                {/* AI suggestion */}
                <div style={{ padding: 12, borderRadius: 12, background: `linear-gradient(135deg, rgba(167,139,250,0.10), rgba(34,211,238,0.06))`, border: '1px solid rgba(167,139,250,0.25)' }}>
                  <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: VD, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13 }}>✦</span>
                    Pulse AI · sugere
                  </div>
                  <div style={{ marginTop: 6, fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>
                    Detectei: webhook Asaas levou 4.2s pra processar (normal &lt;500ms). O ingresso já foi emitido — vou reenviar o push e e-mail agora. Mensagem sugerida:
                  </div>
                  <div style={{ marginTop: 8, padding: 10, borderRadius: 8, background: 'rgba(0,0,0,0.3)', fontSize: 12, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.75)' }}>
                    "Oi Bia! Já localizei. Atrasou no nosso lado por uma fila do gateway — seu QR PSP-7H29 acabou de ser reemitido. Confere no app! 🎟️"
                  </div>
                  <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                    <button style={{ padding: '6px 12px', borderRadius: 8, background: VD, color: '#1A0040', border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Aceitar e enviar</button>
                    <button style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Editar</button>
                  </div>
                </div>
              </div>

              {/* Reply box */}
              <div style={{ marginTop: 14, padding: 14, borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(34,211,238,0.25)' }}>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', minHeight: 36 }}>Sua resposta…</div>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>+ Anexo</button>
                  <button style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>📋 Snippet</button>
                  <button style={{ padding: '6px 10px', borderRadius: 8, background: `${VD}15`, border: `1px solid ${VD}30`, color: VD, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>✦ AI</button>
                  <button style={{ marginLeft: 'auto', padding: '8px 18px', borderRadius: 10, background: `linear-gradient(180deg, ${CD}, #0891B2)`, color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: `0 4px 12px ${CD}30` }}>Responder · resolver ticket</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AdmPlatformScreen, AdmOrgsScreen, AdmFraudScreen, AdmSupportScreen });
