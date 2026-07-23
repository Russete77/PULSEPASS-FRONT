// Roles.jsx — Architecture + Multi-role Login

const GR = '#00FF85', VR = '#A78BFA', CR = '#22D3EE', PINKR = '#FF3D88', AMBERR = '#FFB800';

// ─────────────────────────────────────────────────────────
// ROLES MAP — Architecture diagram
// ─────────────────────────────────────────────────────────
function RolesMap() {
  const roles = [
    {
      key: 'cliente',
      title: 'Cliente',
      sub: 'Participante final',
      ic: '🎟️',
      c: GR,
      who: '~milhões',
      can: ['Descobrir e comprar ingressos', 'Carteira cashless · recarga e gasto', 'Pedido no app · zero fila', 'QR rotativo · transferir', 'Acessar mapa, super app, loyalty'],
      cant: ['Ver vendas de outros', 'Editar eventos', 'Acessar painel admin'],
      auth: 'Pix · CPF · Apple · Google',
      device: 'iPhone · super app',
    },
    {
      key: 'promoter',
      title: 'Promoter',
      sub: 'Vende lista + comissão',
      ic: '◇',
      c: VR,
      who: '~1k+',
      can: ['Link público pessoal', 'Convidar e ver inscritos', 'Acompanhar comissão em tempo real', 'Stories/WhatsApp share', 'Ver ranking dos pares'],
      cant: ['Editar evento ou lotes', 'Ver dados financeiros completos', 'Acessar outras listas'],
      auth: 'CPF + chave de promoter da casa',
      device: 'iPhone (primário) · Web',
    },
    {
      key: 'produtora',
      title: 'Produtora',
      sub: 'Casa / Organização',
      ic: '◐',
      c: CR,
      who: '~100k orgs',
      can: ['Criar e administrar eventos', 'Painel ao vivo · sales/check-in/cashless', 'Gerenciar promoters + comissões', 'Operar PDV, KDS, porta, mesas', 'Sacar via Pix · gerar Excel'],
      cant: ['Ver dados de outras produtoras', 'Bypass de antifraude PulsePass', 'Alterar taxas da plataforma'],
      auth: 'CNPJ + 2FA · contas multi-usuário',
      device: 'iPad (operação) · Web',
    },
    {
      key: 'adm',
      title: 'ADM PulsePass',
      sub: 'Super-admin da plataforma',
      ic: '◉',
      c: PINKR,
      who: '~20 internos',
      can: ['Visão multi-tenant de tudo', 'Aprovação de orgs e eventos', 'Monitor antifraude global', 'Suporte · acesso assistido', 'Ajustar taxas, features e LGPD'],
      cant: ['Ver dados criptografados E2E', 'Sacar saldo de terceiros', 'Burlar audit log (tudo é trilhado)'],
      auth: 'SSO Okta + WebAuthn + IP allowlist',
      device: 'iPad / Web · acesso restrito',
    },
  ];

  return (
    <div style={{ width: '100%', minHeight: '100%', color: '#fff', fontFamily: 'var(--pp-font-body)', padding: 40, position: 'relative', overflow: 'hidden' }}>
      <div className="pp-aurora" style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.5 }}/>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="pp-eyebrow">06 · Arquitetura</div>
        <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 56, letterSpacing: '-0.03em', marginTop: 14, lineHeight: 1 }}>
          Quatro roles,<br/>
          <span style={{ fontFamily: 'var(--pp-font-serif)', fontStyle: 'italic', fontWeight: 400, color: GR }}>uma plataforma.</span>
        </div>
        <div style={{ marginTop: 14, fontSize: 16, color: 'rgba(255,255,255,0.7)', maxWidth: 720, lineHeight: 1.5 }}>
          O PulsePass tem 4 audiências com permissões claramente separadas. Um único login detecta o perfil e roteia para o app/painel certo — cliente em iPhone, operação em iPad, ADM em web restrito.
        </div>

        {/* Role cards */}
        <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
          {roles.map(r => (
            <div key={r.key} style={{
              position: 'relative',
              borderRadius: 22,
              padding: 22,
              background: `linear-gradient(180deg, ${r.c}12, rgba(255,255,255,0.02))`,
              border: `1.5px solid ${r.c}40`,
              backdropFilter: 'blur(20px) saturate(180%)',
              boxShadow: `0 12px 32px ${r.c}15, inset 0 1px 0 rgba(255,255,255,0.12)`,
              overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: r.c, opacity: 0.7 }}/>

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `${r.c}25`, border: `1px solid ${r.c}50`, display: 'grid', placeItems: 'center', fontSize: 22 }}>{r.ic}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em' }}>{r.title}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{r.sub}</div>
                </div>
              </div>
              <div style={{ marginTop: 12, padding: '6px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.3)', display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 9, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>usuários</span>
                <span style={{ fontSize: 11, fontFamily: 'var(--pp-font-mono)', color: r.c, fontWeight: 700 }}>{r.who}</span>
              </div>

              {/* Can */}
              <div style={{ marginTop: 16, padding: 14, borderRadius: 12, background: `${r.c}08`, border: `1px solid ${r.c}25` }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: r.c, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={r.c} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Pode
                </div>
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {r.can.map((c, i) => (
                    <div key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', display: 'flex', gap: 8, lineHeight: 1.4 }}>
                      <span style={{ color: r.c }}>·</span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cannot */}
              <div style={{ marginTop: 10, padding: 14, borderRadius: 12, background: 'rgba(255,59,48,0.04)', border: '1px solid rgba(255,59,48,0.18)' }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#FF7A75', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FF7A75" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  Não pode
                </div>
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {r.cant.map((c, i) => (
                    <div key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', display: 'flex', gap: 8, lineHeight: 1.4 }}>
                      <span style={{ color: '#FF7A75' }}>·</span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Auth + device */}
              <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={r.c} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <span style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em' }}>{r.auth}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={r.c} strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/></svg>
                  <span style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em' }}>{r.device}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Flow diagram */}
        <div style={{ marginTop: 36 }}>
          <div className="pp-label" style={{ marginBottom: 14 }}>Roteamento pós-login · single sign-on inteligente</div>
          <div style={{
            padding: 24, borderRadius: 22,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'stretch', gap: 24 }}>
              {/* Login node */}
              <div style={{
                padding: 18, borderRadius: 16,
                background: `linear-gradient(135deg, ${GR}25, ${CR}15)`,
                border: `1.5px solid ${GR}50`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                width: 180, flexShrink: 0,
                boxShadow: `0 0 24px ${GR}25`,
              }}>
                <div style={{ fontSize: 28 }}>🔐</div>
                <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>Login único</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textAlign: 'center', fontFamily: 'var(--pp-font-mono)' }}>CPF · Pix · biometria</div>
              </div>

              {/* Arrow */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={GR} strokeWidth="1.5" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </div>

              {/* Detect node */}
              <div style={{
                padding: 18, borderRadius: 16,
                background: 'rgba(167,139,250,0.10)',
                border: '1.5px solid rgba(167,139,250,0.4)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                width: 200, flexShrink: 0,
              }}>
                <div style={{ fontSize: 28 }}>⚡</div>
                <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em' }}>Detector de role</div>
                <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 1.4 }}>JWT carries · role · org_id · permissions</div>
              </div>

              {/* Branching arrows + endpoints */}
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '40px 1fr', alignItems: 'stretch' }}>
                <div style={{ position: 'relative' }}>
                  <svg style={{ position: 'absolute', inset: 0 }} viewBox="0 0 40 200" preserveAspectRatio="none">
                    <path d="M0 100 Q 20 100 20 30 L 40 30" fill="none" stroke={GR} strokeWidth="1.5"/>
                    <path d="M0 100 Q 20 100 20 75 L 40 75" fill="none" stroke={VR} strokeWidth="1.5"/>
                    <path d="M0 100 Q 20 100 20 120 L 40 120" fill="none" stroke={CR} strokeWidth="1.5"/>
                    <path d="M0 100 Q 20 100 20 170 L 40 170" fill="none" stroke={PINKR} strokeWidth="1.5"/>
                  </svg>
                </div>
                <div style={{ display: 'grid', gridTemplateRows: 'repeat(4, 1fr)', gap: 4 }}>
                  {[
                    { c: GR, l: 'role: customer →', d: 'iPhone super app · home discover' },
                    { c: VR, l: 'role: promoter →', d: 'iPhone modo promoter · web painel' },
                    { c: CR, l: 'role: organizer →', d: 'iPad operação · web back office' },
                    { c: PINKR, l: 'role: admin →', d: 'Web restrito · multi-tenant overview' },
                  ].map((b, i) => (
                    <div key={i} style={{
                      padding: '6px 14px',
                      borderRadius: 10,
                      background: `${b.c}10`,
                      border: `1px solid ${b.c}30`,
                      display: 'flex', alignItems: 'center', gap: 12,
                    }}>
                      <span style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 11, color: b.c, fontWeight: 600 }}>{b.l}</span>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{b.d}</span>
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
// MULTI-ROLE LOGIN (mobile-first, but works on web)
// ─────────────────────────────────────────────────────────
function MultiRoleLoginScreen() {
  return (
    <div style={{ position: 'relative', width: 390, height: 844, overflow: 'hidden', color: '#fff', fontFamily: 'var(--pp-font-body)' }}>
      <Aurora intensity={1.1}/>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
        <StatusBar/>

        {/* Logo */}
        <div style={{ padding: '40px 20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <svg width="56" height="56" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="29" fill="none" stroke={GR} strokeWidth="2.5" opacity="0.5"/>
            <circle cx="32" cy="32" r="22" fill="none" stroke={GR} strokeWidth="2"/>
            <path d="M14 32 L22 32 L26 24 L30 40 L34 22 L38 38 L42 32 L50 32" fill="none" stroke={GR} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div style={{ marginTop: 14, fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 28, letterSpacing: '-0.03em', display: 'flex', alignItems: 'baseline' }}>
            Pulse<span style={{ color: GR }}>PASS</span>
          </div>
        </div>

        {/* Title */}
        <div style={{ padding: '32px 24px 0', textAlign: 'center' }}>
          <div className="pp-eyebrow">Identificação</div>
          <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 28, lineHeight: 1.05, letterSpacing: '-0.025em', marginTop: 8 }}>
            Quem é você?<br/>
            <span style={{ fontFamily: 'var(--pp-font-serif)', fontStyle: 'italic', fontWeight: 400, color: GR }}>(detectamos automaticamente)</span>
          </div>
        </div>

        {/* CPF input */}
        <div style={{ padding: '24px 24px 0' }}>
          <div className="pp-label" style={{ marginBottom: 8 }}>Seu CPF ou e-mail corporativo</div>
          <div style={{
            height: 56, padding: '0 20px', borderRadius: 16,
            background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(0,255,133,0.3)',
            display: 'flex', alignItems: 'center', gap: 12,
            boxShadow: '0 0 24px rgba(0,255,133,0.15)',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
            <span style={{ fontSize: 16, color: '#fff', flex: 1 }}>231.***.***-04</span>
            <span style={{ fontSize: 11, fontFamily: 'var(--pp-font-mono)', color: GR, fontWeight: 600 }}>✓ válido</span>
          </div>
        </div>

        {/* Detected roles preview */}
        <div style={{ padding: '20px 24px 0', flex: 1 }}>
          <div style={{ fontSize: 11, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 10 }}>Detectamos esses acessos · 2</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              {
                k: 'cliente', title: 'Você (Cliente)', sub: '3 ingressos · R$ 187 cashless',
                c: GR, ic: '🎟️', sel: true,
              },
              {
                k: 'promoter', title: 'Promoter · Audio Club', sub: 'Tier 3 · R$ 2.834 comissão',
                c: VR, ic: '◇', sel: false,
              },
            ].map(r => (
              <div key={r.k} style={{
                padding: 16, borderRadius: 16,
                background: r.sel ? `${r.c}10` : 'rgba(255,255,255,0.04)',
                border: r.sel ? `1.5px solid ${r.c}` : '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', gap: 14,
                boxShadow: r.sel ? `0 0 24px ${r.c}20` : 'none',
              }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${r.c}25`, border: `1px solid ${r.c}50`, display: 'grid', placeItems: 'center', fontSize: 22 }}>{r.ic}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>{r.sub}</div>
                </div>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  border: r.sel ? `7px solid ${r.c}` : '1.5px solid rgba(255,255,255,0.25)',
                  background: r.sel ? '#06070A' : 'transparent', boxSizing: 'border-box',
                }}/>
              </div>
            ))}
          </div>

          {/* More options */}
          <div style={{ marginTop: 14, padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.15)' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', textAlign: 'center' }}>
              Acesso de <b style={{ color: '#fff' }}>Produtora</b> ou <b style={{ color: PINKR }}>ADM</b>?<br/>
              <span style={{ fontSize: 11 }}>Use o portal corporativo · <span style={{ color: GR }}>pulsepass.app/biz</span></span>
            </div>
          </div>
        </div>

        {/* Auth methods + CTA */}
        <div style={{ padding: '20px 24px 24px' }}>
          <div className="pp-label" style={{ marginBottom: 10 }}>Confirme sua identidade</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
            {[
              { ic: 'F', l: 'Face ID', c: GR, sel: true },
              { ic: '⌨', l: 'Senha', c: 'rgba(255,255,255,0.4)' },
              { ic: '📧', l: 'E-mail', c: 'rgba(255,255,255,0.4)' },
            ].map((m, i) => (
              <div key={i} style={{
                padding: '12px 8px', borderRadius: 12,
                background: m.sel ? `${GR}10` : 'rgba(255,255,255,0.04)',
                border: m.sel ? `1.5px solid ${GR}50` : '1px solid rgba(255,255,255,0.08)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              }}>
                <div style={{ fontSize: 22, color: m.sel ? GR : 'rgba(255,255,255,0.55)', fontWeight: 700 }}>{m.ic}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: m.sel ? '#fff' : 'rgba(255,255,255,0.5)' }}>{m.l}</div>
              </div>
            ))}
          </div>

          <button style={{
            width: '100%', height: 54, borderRadius: 18, border: 'none',
            background: `linear-gradient(180deg, #4DFFA8, ${GR})`,
            color: '#003C1F', fontWeight: 700, fontSize: 15,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer',
            boxShadow: '0 12px 32px rgba(0,255,133,0.4), inset 0 1px 0 rgba(255,255,255,0.4)',
          }}>
            Continuar como Cliente
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { RolesMap, MultiRoleLoginScreen });
