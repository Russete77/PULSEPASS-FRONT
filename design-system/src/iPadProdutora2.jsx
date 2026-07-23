// iPadProdutora2.jsx — Team & Staff · Branding white-label · API/Webhooks

const GQ = '#00FF85', VQ = '#A78BFA', CQ = '#22D3EE', PINKQ = '#FF3D88', AMBERQ = '#FFB800', REDQ = '#FF3B30';

function PSide({ active }) {
  const items = [
    { k: 'overview', i: '◐', l: 'Visão' }, { k: 'events', i: '▦', l: 'Eventos' },
    { k: 'sales', i: '⤿', l: 'Vendas' }, { k: 'finance', i: '$', l: 'Financeiro' },
    { k: 'marketing', i: '★', l: 'Marketing' }, { k: 'boxoffice', i: '⊞', l: 'Box Office' },
    { k: 'guests', i: '☷', l: 'Guests' }, { k: 'team', i: '◇', l: 'Time' },
    { k: 'brand', i: '◑', l: 'Branding' }, { k: 'api', i: '{}', l: 'API' },
  ];
  return (
    <div style={{ width: 72, padding: '20px 12px', borderRight: '1px solid rgba(255,255,255,0.06)', background: 'rgba(11,13,18,0.4)', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
      <svg width="32" height="32" viewBox="0 0 64 64" style={{ marginBottom: 12 }}>
        <circle cx="32" cy="32" r="22" fill="none" stroke={GQ} strokeWidth="2"/>
        <path d="M14 32 L22 32 L26 24 L30 40 L34 22 L38 38 L42 32 L50 32" fill="none" stroke={GQ} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {items.map(it => {
        const sel = it.k === active;
        return (
          <div key={it.k} title={it.l} style={{
            width: 48, height: 48, borderRadius: 12,
            background: sel ? 'rgba(0,255,133,0.10)' : 'transparent',
            border: sel ? '1px solid rgba(0,255,133,0.3)' : '1px solid transparent',
            color: sel ? GQ : 'rgba(255,255,255,0.55)',
            fontSize: 16, fontWeight: 600,
            display: 'grid', placeItems: 'center',
          }}>{it.i}</div>
        );
      })}
    </div>
  );
}

function POrgBadge() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px 6px 6px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${VQ}, ${PINKQ})`, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700 }}>AC</div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600 }}>Audio Club</div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--pp-font-mono)' }}>SMU Produções</div>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// AR — TEAM & STAFF (permissions matrix)
// ─────────────────────────────────────────────────────────
function TeamStaffScreen() {
  const team = [
    { n: 'Erick Berberian', r: 'Owner', email: 'erick@smu.fun', last: 'agora', perms: ['all'], c: GQ, sel: false, av: 'E' },
    { n: 'Júlia Pereira', r: 'Admin', email: 'julia@smu.fun', last: '2min', perms: ['events', 'finance', 'team'], c: VQ, sel: true, av: 'J' },
    { n: 'Marcos Silva', r: 'PDV Operator', email: 'marcos@audio', last: 'há 1h', perms: ['pdv', 'pdv:close'], c: GQ, av: 'M' },
    { n: 'Maria Tavares', r: 'Box Office', email: 'maria@audio', last: 'há 1h', perms: ['boxoffice', 'guests:read'], c: AMBERQ, av: 'M' },
    { n: 'João Tonon', r: 'Door Police', email: 'jt@audio', last: 'agora', perms: ['door:scan'], c: CQ, av: 'J', live: true },
    { n: 'Lia Coelho', r: 'Promoter Tier 3', email: 'lia@external', last: '15min', perms: ['promoter:own'], c: VQ, av: 'L', external: true },
    { n: 'Pedro Almeida', r: 'Marketing', email: 'pedro@smu.fun', last: 'ontem', perms: ['marketing', 'events:read'], c: PINKQ, av: 'P' },
    { n: 'Beatriz Costa', r: 'Financial', email: 'bia@smu.fun', last: '3 dias', perms: ['finance', 'finance:withdraw'], c: GQ, av: 'B' },
  ];

  const allPerms = [
    { k: 'events', l: 'Eventos · CRUD' },
    { k: 'sales', l: 'Vendas · leitura' },
    { k: 'finance', l: 'Financeiro · ver' },
    { k: 'finance:withdraw', l: 'Sacar · 2FA' },
    { k: 'pdv', l: 'PDV · operar' },
    { k: 'pdv:close', l: 'PDV · fechar caixa' },
    { k: 'boxoffice', l: 'Box Office presencial' },
    { k: 'door:scan', l: 'Porta · check-in' },
    { k: 'guests', l: 'Guest list · gerenciar' },
    { k: 'guests:read', l: 'Guest list · ver' },
    { k: 'marketing', l: 'Marketing · campanhas' },
    { k: 'team', l: 'Time · convidar' },
    { k: 'promoter:own', l: 'Promoter · própria lista' },
  ];

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', color: '#fff', fontFamily: 'var(--pp-font-body)', background: '#06070A', display: 'flex' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(40% 30% at 20% 10%, rgba(167,139,250,0.08), transparent 60%), #06070A' }}/>
      <PSide active="team"/>

      <div style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <POrgBadge/>
          <button style={{ padding: '10px 16px', borderRadius: 12, background: `linear-gradient(180deg, #C4B5FD, ${VQ})`, color: '#1A0040', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 16px rgba(167,139,250,0.35)' }}>+ Convidar pessoa</button>
        </div>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Team list */}
          <div style={{ width: 380, borderRight: '1px solid rgba(255,255,255,0.06)', padding: '20px 0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '0 20px' }}>
              <div className="pp-eyebrow" style={{ color: VQ }}>Time · 8 pessoas</div>
              <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em', marginTop: 4 }}>Quem opera <span style={{ fontFamily: 'var(--pp-font-serif)', fontStyle: 'italic', fontWeight: 400, color: VQ }}>com você</span></div>
              <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
                {['Todos · 8', 'Internos · 7', 'Externos · 1'].map((t, i) => (
                  <div key={t} style={{ padding: '5px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: i === 0 ? 'rgba(167,139,250,0.12)' : 'rgba(255,255,255,0.04)', color: i === 0 ? VQ : 'rgba(255,255,255,0.6)', border: `1px solid ${i === 0 ? 'rgba(167,139,250,0.3)' : 'rgba(255,255,255,0.08)'}` }}>{t}</div>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, marginTop: 12, overflow: 'hidden' }}>
              {team.map((p, i) => (
                <div key={i} style={{
                  padding: '12px 20px',
                  background: p.sel ? 'rgba(167,139,250,0.06)' : 'transparent',
                  borderLeft: p.sel ? `3px solid ${VQ}` : '3px solid transparent',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg, ${p.c}, ${p.c}99)`, display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 700, border: '1.5px solid rgba(255,255,255,0.08)' }}>{p.av}</div>
                    {p.live && <span style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderRadius: '50%', background: GQ, border: '2px solid #06070A', boxShadow: `0 0 6px ${GQ}` }}/>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{p.n}</span>
                      {p.external && <span style={{ padding: '1px 6px', borderRadius: 4, background: 'rgba(255,184,0,0.15)', color: AMBERQ, fontSize: 8, fontFamily: 'var(--pp-font-mono)', fontWeight: 700, letterSpacing: '0.06em' }}>EXT</span>}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{p.r}</div>
                  </div>
                  <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.4)' }}>{p.last}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Detail · Júlia */}
          <div style={{ flex: 1, padding: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Profile */}
            <div style={{ padding: 18, borderRadius: 18, background: `linear-gradient(135deg, rgba(167,139,250,0.14), rgba(255,255,255,0.02))`, border: '1px solid rgba(167,139,250,0.25)', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg, ${VQ}, ${VQ}80)`, display: 'grid', placeItems: 'center', fontSize: 28, fontWeight: 700, fontFamily: 'var(--pp-font-display)' }}>J</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em' }}>Júlia Pereira</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 3, fontFamily: 'var(--pp-font-mono)' }}>julia@smu.fun · Admin · 2FA ativo</div>
                <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                  <PBadge tone="violet">Admin</PBadge>
                  <PBadge tone="pulse" dot>online</PBadge>
                  <PBadge tone="cyan">SSO Google</PBadge>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Forçar logout</button>
                <button style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(255,59,48,0.10)', border: '1px solid rgba(255,59,48,0.25)', color: '#FF7A75', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Remover</button>
              </div>
            </div>

            {/* Permissions matrix */}
            <div style={{ marginTop: 16, flex: 1, padding: 18, borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 600, fontSize: 16, letterSpacing: '-0.015em' }}>Permissões · matriz granular</div>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--pp-font-mono)' }}>3 das 13 ativas</span>
              </div>

              <div style={{ marginTop: 14, flex: 1, overflow: 'hidden', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {allPerms.map(p => {
                  const on = ['events', 'finance', 'team'].includes(p.k);
                  return (
                    <div key={p.k} style={{
                      padding: '10px 14px', borderRadius: 12,
                      background: on ? `${VQ}10` : 'rgba(255,255,255,0.03)',
                      border: on ? `1px solid ${VQ}30` : '1px solid rgba(255,255,255,0.06)',
                      display: 'flex', alignItems: 'center', gap: 12,
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 10, color: on ? VQ : 'rgba(255,255,255,0.45)', fontWeight: 600, letterSpacing: '0.05em' }}>{p.k}</div>
                        <div style={{ fontSize: 12, marginTop: 2, color: on ? '#fff' : 'rgba(255,255,255,0.65)' }}>{p.l}</div>
                      </div>
                      <div style={{ width: 32, height: 18, borderRadius: 99, background: on ? VQ : 'rgba(255,255,255,0.1)', position: 'relative', boxShadow: on ? 'inset 0 1px 2px rgba(0,0,0,0.2)' : 'none' }}>
                        <div style={{ position: 'absolute', left: on ? 16 : 2, top: 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.3)' }}/>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 14, padding: 12, borderRadius: 12, background: 'rgba(255,184,0,0.06)', border: '1px solid rgba(255,184,0,0.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={AMBERQ} strokeWidth="2"><path d="m12 1 9 4v6c0 5.5-3.8 10.7-9 12-5.2-1.3-9-6.5-9-12V5z"/></svg>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', flex: 1, lineHeight: 1.4 }}>
                  Permissão <b style={{ color: AMBERQ }}>finance:withdraw</b> requer aprovação do Owner + 2FA WebAuthn.
                </div>
                <button style={{ padding: '6px 12px', borderRadius: 8, background: AMBERQ, color: '#06070A', border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Solicitar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// AS — BRANDING WHITE-LABEL
// ─────────────────────────────────────────────────────────
function BrandingScreen() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', color: '#fff', fontFamily: 'var(--pp-font-body)', background: '#06070A', display: 'flex' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(50% 40% at 80% 10%, rgba(255,61,136,0.10), transparent 60%), radial-gradient(50% 40% at 20% 90%, rgba(167,139,250,0.10), transparent 60%), #06070A' }}/>
      <PSide active="brand"/>

      <div style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <POrgBadge/>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ padding: '10px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Reverter</button>
            <button style={{ padding: '10px 16px', borderRadius: 12, background: `linear-gradient(180deg, #4DFFA8, ${GQ})`, color: '#003C1F', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', boxShadow: '0 4px 16px rgba(0,255,133,0.35)' }}>Publicar branding</button>
          </div>
        </div>

        <div style={{ flex: 1, padding: 24, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          {/* Left: controls */}
          <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div className="pp-eyebrow" style={{ color: PINKQ }}>Branding · white-label</div>
              <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 26, letterSpacing: '-0.025em', marginTop: 4 }}>Sua casa, <span style={{ fontFamily: 'var(--pp-font-serif)', fontStyle: 'italic', fontWeight: 400, color: PINKQ }}>sua cara.</span></div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>Domínio próprio · paleta · logo · até remover "powered by PulsePass" (Enterprise)</div>
            </div>

            {/* Domain */}
            <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="pp-label">Domínio customizado</div>
              <div style={{ marginTop: 10, height: 46, padding: '0 14px', borderRadius: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,255,133,0.3)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>https://</span>
                <span style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 14, color: '#fff', fontWeight: 600 }}>ingressos.audioclub.com.br</span>
                <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontFamily: 'var(--pp-font-mono)', color: GQ, fontWeight: 600 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: GQ, boxShadow: `0 0 6px ${GQ}` }}/>
                  SSL · A+
                </span>
              </div>
            </div>

            {/* Logo + Palette */}
            <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="pp-label">Logo + paleta da casa</div>
              <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '120px 1fr', gap: 14 }}>
                <div style={{
                  width: 120, height: 120, borderRadius: 16,
                  background: `linear-gradient(135deg, ${VQ}, ${PINKQ})`,
                  display: 'grid', placeItems: 'center',
                  fontFamily: 'var(--pp-font-display)', fontWeight: 800, fontSize: 36, letterSpacing: '-0.04em',
                  border: '2px solid rgba(255,255,255,0.14)',
                  boxShadow: `0 12px 32px ${VQ}30`,
                }}>AC</div>
                <div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Paleta</div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                    {[
                      { c: VQ, l: 'primary' },
                      { c: PINKQ, l: 'accent' },
                      { c: '#0A0510', l: 'dark' },
                      { c: '#F8F5FF', l: 'light' },
                    ].map(s => (
                      <div key={s.l} style={{ flex: 1 }}>
                        <div style={{ aspectRatio: '1', borderRadius: 10, background: s.c, border: '1px solid rgba(255,255,255,0.1)', boxShadow: `0 0 16px ${s.c}40` }}/>
                        <div style={{ marginTop: 4, fontSize: 9, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.55)', textAlign: 'center' }}>{s.l}</div>
                        <div style={{ fontSize: 9, fontFamily: 'var(--pp-font-mono)', color: '#fff', textAlign: 'center' }}>{s.c.toUpperCase()}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 11, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Display font</div>
                    <div style={{ marginTop: 4, padding: '8px 12px', borderRadius: 10, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'var(--pp-font-display)', fontSize: 16, fontWeight: 700 }}>Space Grotesk</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Toggles */}
            <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', flex: 1, overflow: 'hidden' }}>
              <div className="pp-label">Personalização avançada</div>
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { l: 'Remover "powered by PulsePass"', sub: 'apenas em Enterprise', on: true, locked: false },
                  { l: 'E-mails com domínio próprio', sub: 'noreply@audioclub.com.br · DKIM ✓', on: true },
                  { l: 'PWA instalável (ícone na home)', sub: 'manifest.json gerado automaticamente', on: true },
                  { l: 'Background music ao abrir', sub: 'autoplay com mute · respeita user pref', on: false },
                  { l: 'Dark mode personalizado', sub: '6 esquemas pré-prontos', on: true },
                ].map((t, i) => (
                  <div key={i} style={{ padding: 10, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{t.l}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{t.sub}</div>
                    </div>
                    <div style={{ width: 32, height: 18, borderRadius: 99, background: t.on ? GQ : 'rgba(255,255,255,0.1)', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: t.on ? 16 : 2, top: 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.3)' }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: live preview */}
          <div style={{ padding: 20, borderRadius: 18, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="pp-label">Preview ao vivo</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['📱', '💻'].map((t, i) => (
                  <div key={i} style={{ padding: '6px 10px', borderRadius: 8, background: i === 1 ? 'rgba(255,255,255,0.1)' : 'transparent', border: '1px solid rgba(255,255,255,0.08)', fontSize: 13, cursor: 'pointer' }}>{t}</div>
                ))}
              </div>
            </div>

            {/* Browser frame */}
            <div style={{ marginTop: 12, flex: 1, borderRadius: 14, overflow: 'hidden', background: '#0A0510', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column' }}>
              {/* Address bar */}
              <div style={{ padding: '10px 14px', background: '#15081B', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57' }}/>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFBD2E' }}/>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840' }}/>
                </div>
                <div style={{ flex: 1, padding: '4px 12px', borderRadius: 6, background: 'rgba(0,0,0,0.4)', fontFamily: 'var(--pp-font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: GQ }}>●</span> ingressos.audioclub.com.br
                </div>
              </div>

              {/* Mock site */}
              <div style={{ flex: 1, padding: 18, background: `linear-gradient(180deg, ${VQ}25, ${PINKQ}15)`, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: `linear-gradient(135deg, ${VQ}, ${PINKQ})`, display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 800 }}>AC</div>
                    <span style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '-0.01em' }}>Audio Club</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>
                    <span>eventos</span><span>fotos</span><span>contato</span>
                  </div>
                </div>

                <div style={{ marginTop: 18, fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 28, lineHeight: 1.05, letterSpacing: '-0.025em' }}>
                  Audio Club<br/>
                  <span style={{ fontFamily: 'var(--pp-font-serif)', fontStyle: 'italic', fontWeight: 400, color: PINKQ }}>essa semana</span>
                </div>

                <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {[
                    { c1: VQ, c2: PINKQ, t: 'Festival do Sol', d: '30 NOV', p: 'R$ 90' },
                    { c1: GQ, c2: CQ, t: 'Anyma', d: '07 DEZ', p: 'R$ 240' },
                    { c1: PINKQ, c2: AMBERQ, t: 'KVSH', d: '14 DEZ', p: 'R$ 70' },
                  ].map((e, i) => (
                    <div key={i} style={{ borderRadius: 8, overflow: 'hidden', background: `radial-gradient(${e.c1}, transparent), ${e.c2}`, aspectRatio: '3/4', position: 'relative', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.7))' }}/>
                      <div style={{ position: 'absolute', bottom: 6, left: 6, right: 6 }}>
                        <div style={{ fontSize: 8, fontFamily: 'var(--pp-font-mono)', color: PINKQ, letterSpacing: '0.08em' }}>{e.d}</div>
                        <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 10, marginTop: 2 }}>{e.t}</div>
                        <div style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 9, color: GQ, marginTop: 2 }}>{e.p}+</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 14, padding: '6px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 9, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.55)' }}>
                  <span>powered by · <span style={{ color: GQ }}>removido (Enterprise)</span></span>
                  <span>SSL ✓</span>
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
// AT — API & WEBHOOKS
// ─────────────────────────────────────────────────────────
function ApiWebhooksScreen() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', color: '#fff', fontFamily: 'var(--pp-font-body)', background: '#06070A', display: 'flex' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(50% 40% at 20% 10%, rgba(34,211,238,0.08), transparent 60%), #06070A' }}/>
      <PSide active="api"/>

      <div style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <POrgBadge/>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>API v2.4 · docs.pulsepass.app</span>
            <button style={{ padding: '10px 16px', borderRadius: 12, background: `linear-gradient(180deg, ${CQ}, #0891B2)`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', boxShadow: '0 4px 16px rgba(34,211,238,0.35)' }}>+ Nova API key</button>
          </div>
        </div>

        <div style={{ flex: 1, padding: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <div className="pp-eyebrow" style={{ color: CQ }}>Integrações</div>
              <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 26, letterSpacing: '-0.025em', marginTop: 4 }}>API keys · webhooks · <span style={{ fontFamily: 'var(--pp-font-serif)', fontStyle: 'italic', fontWeight: 400, color: CQ }}>conexões</span></div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { l: 'Requests 24h', v: '184k', d: '99.97% success', c: GQ },
              { l: 'p99 latency', v: '142ms', d: 'SLA 500ms', c: CQ },
              { l: 'Webhooks ativos', v: '8', d: '2 com falha', c: AMBERQ },
              { l: 'Rate limit', v: '60%', d: '600/1000 req/min', c: VQ },
            ].map(k => (
              <div key={k.l} style={{ padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: k.c, opacity: 0.7 }}/>
                <div style={{ fontSize: 9, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>{k.l}</div>
                <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 22, color: '#fff', marginTop: 4 }}>{k.v}</div>
                <div style={{ marginTop: 3, fontSize: 10, color: k.c }}>{k.d}</div>
              </div>
            ))}
          </div>

          {/* Two col */}
          <div style={{ flex: 1, marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, minHeight: 0 }}>
            {/* API keys */}
            <div style={{ padding: 18, borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 600, fontSize: 18, letterSpacing: '-0.015em' }}>API keys · 4</div>

              <div style={{ marginTop: 12, flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { n: 'production · server', k: 'pp_live_sk_***...4j2k', scope: 'all', last: 'agora · 142 req/min', c: REDQ },
                  { n: 'production · readonly', k: 'pp_live_ro_***...9d8a', scope: 'read', last: '12s · 18 req/min', c: VQ },
                  { n: 'staging', k: 'pp_test_sk_***...0c14', scope: 'all', last: '8m', c: AMBERQ },
                  { n: 'mobile app · public', k: 'pp_pub_***...ab38', scope: 'mobile', last: 'agora · 2.4k req/min', c: CQ },
                ].map((k, i) => (
                  <div key={i} style={{ padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{k.n}</span>
                      <PBadge tone={k.c === REDQ ? 'red' : k.c === VQ ? 'violet' : k.c === AMBERQ ? 'amber' : 'cyan'}>{k.scope}</PBadge>
                    </div>
                    <div style={{ marginTop: 6, padding: '6px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.4)', fontFamily: 'var(--pp-font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>{k.k}</div>
                    <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10, fontFamily: 'var(--pp-font-mono)' }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>{k.last}</span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <span style={{ color: GQ, cursor: 'pointer' }}>copiar</span>
                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>·</span>
                        <span style={{ color: '#FF7A75', cursor: 'pointer' }}>revogar</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Webhooks */}
            <div style={{ padding: 18, borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 600, fontSize: 18, letterSpacing: '-0.015em' }}>Webhooks</div>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>HMAC SHA-256 · retry 5×</span>
              </div>

              <div style={{ marginTop: 12, flex: 1, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
                {[
                  { url: 'https://audioclub.com.br/wh/sale', ev: ['order.paid', 'order.refund'], st: 'ok', stats: '8.4k · 100%', c: GQ },
                  { url: 'https://crm.audioclub.com.br/leads', ev: ['user.signup', 'guest.checkin'], st: 'ok', stats: '12.1k · 99.8%', c: GQ },
                  { url: 'https://erp.smu.fun/api/v1/finance', ev: ['payout.completed'], st: 'fail', stats: '14 · 4× retry', c: REDQ },
                  { url: 'https://make.com/webhook/abc123', ev: ['*'], st: 'ok', stats: '24k · zapier', c: VQ },
                  { url: 'https://discord.com/api/webhooks/...', ev: ['sale.live', 'checkin.live'], st: 'slow', stats: '480ms avg', c: AMBERQ },
                ].map((w, i) => (
                  <div key={i} style={{ padding: 10, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: `1px solid ${w.c === REDQ ? 'rgba(255,59,48,0.25)' : 'rgba(255,255,255,0.06)'}`, position: 'relative' }}>
                    {w.c === REDQ && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: REDQ, borderRadius: '12px 0 0 12px' }}/>}
                    <div style={{ paddingLeft: w.c === REDQ ? 6 : 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: w.c, boxShadow: `0 0 6px ${w.c}` }}/>
                      <span style={{ flex: 1, fontFamily: 'var(--pp-font-mono)', fontSize: 11, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.url}</span>
                      <span style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.5)' }}>{w.stats}</span>
                    </div>
                    <div style={{ marginTop: 6, paddingLeft: w.c === REDQ ? 6 : 0, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {w.ev.map((e, j) => (
                        <span key={j} style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 9, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.7)' }}>{e}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom: integrations */}
          <div style={{ marginTop: 14, padding: 16, borderRadius: 14, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="pp-label" style={{ color: CQ }}>Integrações nativas · 1-click</div>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>5 de 18 conectadas</span>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { l: 'Asaas', ic: '💰', on: true },
                { l: 'Sympla import', ic: '🎟️', on: true },
                { l: 'Resend', ic: '📧', on: true },
                { l: 'Cloudflare R2', ic: '☁️', on: true },
                { l: 'Sentry', ic: '🐛', on: true },
                { l: 'Meta Pixel', ic: 'f', on: false },
                { l: 'Google Analytics', ic: 'G', on: false },
                { l: 'Zapier', ic: '⚡', on: false },
                { l: 'Make.com', ic: '⚙', on: false },
                { l: 'Spotify (lineup)', ic: '🎵', on: false },
                { l: 'Stripe (intl)', ic: 'S', on: false },
              ].map((it, i) => (
                <div key={i} style={{
                  padding: '8px 14px', borderRadius: 999,
                  background: it.on ? `${GQ}10` : 'rgba(255,255,255,0.04)',
                  border: it.on ? `1px solid ${GQ}40` : '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 12, fontWeight: 600,
                  color: it.on ? GQ : 'rgba(255,255,255,0.65)',
                }}>
                  <span style={{ fontSize: 13 }}>{it.ic}</span>
                  {it.l}
                  {it.on && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={GQ} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TeamStaffScreen, BrandingScreen, ApiWebhooksScreen });
