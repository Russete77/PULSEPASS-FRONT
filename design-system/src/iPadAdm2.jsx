// iPadAdm2.jsx — Audit log · Feature flags · Taxes · Platform Financial

const GE = '#00FF85', VE = '#A78BFA', CE = '#22D3EE', PINKE = '#FF3D88', AMBERE = '#FFB800', REDE = '#FF3B30';

// Reuse AdmSidebar & AdmTopBar shape inline (small variant)
function AdmSide({ active }) {
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
          <circle cx="32" cy="32" r="22" fill="none" stroke={PINKE} strokeWidth="2.5"/>
          <path d="M14 32 L22 32 L26 24 L30 40 L34 22 L38 38 L42 32 L50 32" fill="none" stroke={PINKE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div>
          <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 15 }}>Pulse<span style={{ color: PINKE }}>ADM</span></div>
          <div style={{ fontSize: 9, fontFamily: 'var(--pp-font-mono)', color: PINKE, letterSpacing: '0.12em' }}>SUPER-ADMIN</div>
        </div>
      </div>
      <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', padding: '6px 12px' }}>Operação</div>
      {items.map(it => {
        const sel = it.k === active;
        return (
          <div key={it.k} style={{
            padding: '10px 12px', borderRadius: 10,
            background: sel ? 'rgba(255,61,136,0.10)' : 'transparent',
            border: sel ? '1px solid rgba(255,61,136,0.25)' : '1px solid transparent',
            color: sel ? PINKE : 'rgba(255,255,255,0.7)',
            fontSize: 13, fontWeight: sel ? 600 : 500,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 14, opacity: 0.85, width: 14, textAlign: 'center' }}>{it.i}</span>
            <span>{it.l}</span>
          </div>
        );
      })}
      <div style={{ marginTop: 'auto', padding: 12, borderRadius: 12, background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: REDE, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700 }}>EB</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600 }}>Erick B.</div>
          <div style={{ fontSize: 9, fontFamily: 'var(--pp-font-mono)', color: '#FF7A75', letterSpacing: '0.06em' }}>SSO · ADM-7</div>
        </div>
      </div>
    </div>
  );
}

function AdmTop({ where }) {
  return (
    <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ padding: '6px 12px 6px 8px', borderRadius: 999, background: 'rgba(255,59,48,0.10)', border: '1px solid rgba(255,59,48,0.28)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={REDE} strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', color: '#FF7A75', fontWeight: 600, letterSpacing: '0.08em' }}>MODO ADMINISTRATIVO · TUDO É TRILHADO</span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{where}</div>
      </div>
      <div style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(0,255,133,0.08)', border: '1px solid rgba(0,255,133,0.2)', fontFamily: 'var(--pp-font-mono)', fontSize: 11, color: GE, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: GE, boxShadow: `0 0 6px ${GE}` }}/>
        status OK
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// AN — AUDIT LOG (full replay)
// ─────────────────────────────────────────────────────────
function AdmAuditScreen() {
  const events = [
    { t: '23:47:12', actor: 'Marcos Silva', role: 'pdv', org: 'Audio Club', action: 'sale.complete', target: 'order #4720', amt: 'R$ 84,00', ip: '187.18.42.108', ok: true, c: GE, hash: 'sha256:7a3b…' },
    { t: '23:47:08', actor: 'Erick B.', role: 'adm', org: '—', action: 'org.suspend.attempted', target: 'Bar Cocó CE', amt: '—', ip: '10.0.4.32', ok: false, reason: 'aguarda 2nd approval', c: AMBERE, hash: 'sha256:b8c1…' },
    { t: '23:46:51', actor: 'Sistema', role: 'engine', org: 'Audio Club', action: 'qr.scan.ok', target: 'PSP-7H29', amt: '—', ip: 'door-1.audioclub', ok: true, c: GE, hash: 'sha256:f12e…' },
    { t: '23:46:28', actor: 'Sistema', role: 'engine', org: 'Bar Cocó', action: 'fraud.block', target: 'PIX duplicado · CPF 348…22', amt: 'R$ 760', ip: 'engine.fraud', ok: true, c: PINKE, hash: 'sha256:a04d…' },
    { t: '23:46:02', actor: 'Lia Coelho', role: 'promoter', org: 'Audio Club', action: 'guest.add', target: '+5 inscritos manuais', amt: '—', ip: '177.42.18.99', ok: true, c: VE, hash: 'sha256:3e9f…' },
    { t: '23:45:38', actor: 'Erick B.', role: 'adm', org: '—', action: 'support.message.send', target: '#PP-7401 Beatriz S.', amt: '—', ip: '10.0.4.32', ok: true, c: CE, hash: 'sha256:c721…' },
    { t: '23:45:14', actor: 'Audio Club', role: 'org', org: 'Audio Club', action: 'webhook.fired', target: 'Asaas → checkout.success', amt: 'R$ 189,00', ip: 'webhook.asaas', ok: true, c: GE, hash: 'sha256:88a2…' },
    { t: '23:44:58', actor: 'Beatriz S.', role: 'cliente', org: '—', action: 'wallet.recharge', target: 'Pix · R$ 100,00 + R$ 10 bônus', amt: 'R$ 100,00', ip: '177.42.180.4', ok: true, c: GE, hash: 'sha256:6b03…' },
    { t: '23:44:31', actor: 'Sistema', role: 'engine', org: '—', action: 'feature.flag.update', target: 'pulse_ai.support → 100%', amt: '—', ip: 'cron.flags', ok: true, c: VE, hash: 'sha256:0d18…' },
    { t: '23:44:09', actor: 'João T.', role: 'adm', org: '—', action: 'org.kyc.approve', target: 'Mar Aberto Floripa', amt: '—', ip: '10.0.4.12', ok: true, c: GE, hash: 'sha256:4f76…' },
  ];

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', color: '#fff', fontFamily: 'var(--pp-font-body)', background: '#06070A', display: 'flex' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(50% 40% at 20% 10%, rgba(167,139,250,0.06), transparent 60%), #06070A' }}/>
      <AdmSide active="audit"/>

      <div style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AdmTop where="Audit log · imutável · WORM storage · retenção 7 anos LGPD"/>

        <div style={{ flex: 1, padding: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <div className="pp-eyebrow" style={{ color: VE }}>Audit log</div>
              <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 28, letterSpacing: '-0.025em', marginTop: 4 }}>
                Tudo que <span style={{ fontFamily: 'var(--pp-font-serif)', fontStyle: 'italic', fontWeight: 400, color: VE }}>aconteceu</span> · imutável
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ padding: '10px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                🔗 Exportar (.jsonl + assinatura)
              </button>
            </div>
          </div>

          {/* Filters */}
          <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, height: 40, padding: '0 14px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>actor:erick action:org.* org:audio</span>
              <span style={{ marginLeft: 'auto', padding: '3px 8px', borderRadius: 6, background: 'rgba(167,139,250,0.14)', border: '1px solid rgba(167,139,250,0.3)', fontSize: 10, fontFamily: 'var(--pp-font-mono)', color: VE }}>4.2M eventos · 30d</span>
            </div>
            {['Todos', 'Críticos · 3', 'ADM only', 'Engine'].map((t, i) => (
              <div key={t} style={{
                padding: '0 14px', height: 40, borderRadius: 12, display: 'flex', alignItems: 'center',
                fontSize: 12, fontWeight: 600,
                background: i === 0 ? 'rgba(167,139,250,0.12)' : 'rgba(255,255,255,0.04)',
                border: i === 0 ? '1px solid rgba(167,139,250,0.3)' : '1px solid rgba(255,255,255,0.08)',
                color: i === 0 ? VE : 'rgba(255,255,255,0.7)',
              }}>{t}</div>
            ))}
          </div>

          {/* Log stream */}
          <div style={{ marginTop: 14, flex: 1, overflow: 'hidden', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', background: '#0A0D14', fontFamily: 'var(--pp-font-mono)' }}>
            {/* Header */}
            <div style={{ padding: '10px 16px', display: 'grid', gridTemplateColumns: '90px 1.4fr 100px 1.2fr 1.4fr 110px 130px 90px 40px', gap: 10, background: 'rgba(255,255,255,0.025)', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em' }}>
              {['Timestamp', 'Actor', 'Role', 'Action', 'Target', 'Amount', 'IP/source', 'Hash', ''].map(h => <span key={h}>{h}</span>)}
            </div>
            {events.map((e, i) => (
              <div key={i} style={{
                padding: '10px 16px',
                display: 'grid', gridTemplateColumns: '90px 1.4fr 100px 1.2fr 1.4fr 110px 130px 90px 40px', gap: 10,
                borderBottom: i < events.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                background: e.ok ? (i % 2 === 1 ? 'rgba(255,255,255,0.012)' : 'transparent') : 'rgba(255,184,0,0.04)',
                alignItems: 'center',
                fontSize: 11,
              }}>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>{e.t}</span>
                <span style={{ color: '#fff', fontWeight: 600, fontFamily: 'var(--pp-font-body)' }}>{e.actor}</span>
                <span style={{ padding: '2px 6px', borderRadius: 4, background: `${e.c}15`, color: e.c, fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', justifySelf: 'flex-start' }}>{e.role}</span>
                <span style={{ color: '#fff' }}>{e.action}</span>
                <span style={{ color: 'rgba(255,255,255,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.target}</span>
                <span style={{ color: e.amt === '—' ? 'rgba(255,255,255,0.3)' : GE, fontWeight: e.amt === '—' ? 400 : 600 }}>{e.amt}</span>
                <span style={{ color: 'rgba(255,255,255,0.55)' }}>{e.ip}</span>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>{e.hash}</span>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {e.ok ? <span style={{ width: 6, height: 6, borderRadius: '50%', background: GE }}/> : <span style={{ width: 6, height: 6, borderRadius: '50%', background: AMBERE, boxShadow: `0 0 6px ${AMBERE}` }}/>}
                </span>
              </div>
            ))}

            {/* Pending approval row expanded */}
            <div style={{ padding: 16, background: 'rgba(255,184,0,0.06)', borderTop: '1px solid rgba(255,184,0,0.2)', display: 'flex', alignItems: 'center', gap: 14 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={AMBERE} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
              <div style={{ flex: 1, fontFamily: 'var(--pp-font-body)' }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Ação crítica aguardando 2nd approval</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>Erick B. solicitou suspender <b>Bar Cocó CE</b> · 12 chargebacks detectados · requer 2 ADMs Senior</div>
              </div>
              <button style={{ padding: '8px 14px', borderRadius: 10, background: AMBERE, color: '#06070A', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--pp-font-body)' }}>Aprovar como 2º ADM</button>
              <button style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--pp-font-body)' }}>Recusar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// AO — FEATURE FLAGS
// ─────────────────────────────────────────────────────────
function AdmFlagsScreen() {
  const flags = [
    { k: 'pulse_ai.support', desc: 'Pulse AI sugere respostas no suporte', pct: 100, status: 'GA', users: '248 orgs', c: GE, since: 'há 2 dias' },
    { k: 'cashless.nfc_v2', desc: 'NFC wristband v2 (chip MIFARE Ultralight)', pct: 35, status: 'rollout', users: '87 orgs', c: VE, since: 'há 4h' },
    { k: 'event.split_payment', desc: 'Split de pagamento entre parceiros (3 partes)', pct: 12, status: 'canary', users: '8 orgs · whitelist', c: CE, since: 'há 1 dia' },
    { k: 'door.face_recognition', desc: 'Reconhecimento facial opt-in no check-in', pct: 0, status: 'dark', users: 'staff PulsePass', c: AMBERE, since: 'há 3 sem · em revisão LGPD' },
    { k: 'wallet.crypto_pix', desc: 'Recarga via stablecoin (USDC → Real)', pct: 0, status: 'killed', users: '—', c: REDE, since: 'há 6m · regulatório' },
    { k: 'sympla.import', desc: 'Importar evento direto do Sympla (oneshot)', pct: 100, status: 'GA', users: '248 orgs', c: GE, since: 'há 8 dias' },
    { k: 'kds.kitchen_v3', desc: 'KDS com IA pra prever tempo de preparo', pct: 8, status: 'canary', users: '5 orgs · convite', c: CE, since: 'há 12h' },
    { k: 'promoter.ai_score', desc: 'Score automático de qualidade de promoter', pct: 50, status: 'A/B', users: '124 orgs · grupo B', c: VE, since: 'há 3 dias' },
  ];

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', color: '#fff', fontFamily: 'var(--pp-font-body)', background: '#06070A', display: 'flex' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(50% 40% at 80% 10%, rgba(0,255,133,0.06), transparent 60%), #06070A' }}/>
      <AdmSide active="flags"/>

      <div style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AdmTop where="Feature flags · LaunchDarkly OSS · rollout gradual e seguro"/>

        <div style={{ flex: 1, padding: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <div className="pp-eyebrow" style={{ color: GE }}>Feature flags</div>
              <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 28, letterSpacing: '-0.025em', marginTop: 4 }}>
                14 flags ativas · <span style={{ fontFamily: 'var(--pp-font-serif)', fontStyle: 'italic', fontWeight: 400, color: GE }}>rollout controlado</span>
              </div>
            </div>
            <button style={{ padding: '10px 16px', borderRadius: 12, background: GE, color: '#003C1F', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,255,133,0.35)' }}>+ Nova flag</button>
          </div>

          {/* Status summary */}
          <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
            {[
              { l: 'GA · 100%', v: 5, c: GE },
              { l: 'Rollout', v: 3, c: VE },
              { l: 'Canary', v: 4, c: CE },
              { l: 'Dark · 0%', v: 2, c: AMBERE },
              { l: 'A/B test', v: 1, c: PINKE },
            ].map(k => (
              <div key={k.l} style={{ padding: 14, borderRadius: 14, background: `${k.c}08`, border: `1px solid ${k.c}25`, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: k.c, boxShadow: `0 0 8px ${k.c}` }}/>
                <div>
                  <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>{k.l}</div>
                  <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 18, color: k.c, marginTop: 2 }}>{k.v}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Flags grid */}
          <div style={{ marginTop: 16, flex: 1, overflow: 'hidden', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {flags.map((f, i) => (
              <div key={i} style={{
                padding: 16, borderRadius: 16,
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: f.c }}/>
                <div style={{ paddingLeft: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 13, color: '#fff' }}>{f.k}</div>
                    <div style={{ padding: '3px 8px', borderRadius: 999, background: `${f.c}20`, color: f.c, fontSize: 9, fontFamily: 'var(--pp-font-mono)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{f.status}</div>
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 6, lineHeight: 1.4 }}>{f.desc}</div>

                  {/* Rollout bar */}
                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>rollout</span>
                      <span style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 14, color: f.c }}>{f.pct}%</span>
                    </div>
                    <div style={{ marginTop: 4, height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div style={{ width: `${f.pct}%`, height: '100%', background: f.c, boxShadow: f.pct > 0 ? `0 0 8px ${f.c}80` : 'none' }}/>
                    </div>
                  </div>

                  <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10, fontFamily: 'var(--pp-font-mono)' }}>
                    <span style={{ color: 'rgba(255,255,255,0.55)' }}>{f.users}</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>{f.since}</span>
                  </div>

                  <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
                    <button style={{ padding: '5px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Editar</button>
                    {f.pct < 100 && f.status !== 'killed' && (
                      <button style={{ padding: '5px 10px', borderRadius: 8, background: `${f.c}15`, border: `1px solid ${f.c}40`, color: f.c, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>+10% rollout</button>
                    )}
                    {f.status !== 'killed' && (
                      <button style={{ padding: '5px 10px', borderRadius: 8, background: 'rgba(255,59,48,0.10)', border: '1px solid rgba(255,59,48,0.25)', color: '#FF7A75', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Kill switch</button>
                    )}
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
// AP — TAXES / PRICING (plans configurables)
// ─────────────────────────────────────────────────────────
function AdmTaxesScreen() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', color: '#fff', fontFamily: 'var(--pp-font-body)', background: '#06070A', display: 'flex' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(50% 40% at 20% 10%, rgba(255,184,0,0.08), transparent 60%), radial-gradient(50% 40% at 80% 80%, rgba(34,211,238,0.06), transparent 60%), #06070A' }}/>
      <AdmSide active="fees"/>

      <div style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AdmTop where="Taxas, planos e split · alterações entram em vigor no próximo evento"/>

        <div style={{ flex: 1, padding: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div className="pp-eyebrow" style={{ color: AMBERE }}>Taxas & planos</div>
            <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 28, letterSpacing: '-0.025em', marginTop: 4 }}>Como a PulsePass <span style={{ fontFamily: 'var(--pp-font-serif)', fontStyle: 'italic', fontWeight: 400, color: AMBERE }}>monetiza</span></div>
          </div>

          {/* Pricing tiers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {[
              { name: 'Starter', desc: 'Eventos pequenos · <500 ingressos', fee: '7,9%', card: '+ R$ 1,49 por ingresso', orgs: 124, c: 'rgba(255,255,255,0.4)', sel: false },
              { name: 'Pro', desc: 'Casas e produtoras ativas', fee: '5,9%', card: '+ R$ 0,99', orgs: 92, c: CE, sel: false },
              { name: 'Enterprise', desc: 'Negociação custom · split', fee: '4,9%', card: '+ R$ 0,49', orgs: 28, c: VE, sel: true },
              { name: 'Single Event', desc: 'Festival 1× · sem mensalidade', fee: '8,9%', card: '+ R$ 1,99', orgs: 4, c: PINKE, sel: false },
            ].map((p, i) => (
              <div key={i} style={{
                padding: 18, borderRadius: 18,
                background: p.sel ? `${p.c}10` : 'rgba(255,255,255,0.03)',
                border: p.sel ? `1.5px solid ${p.c}` : '1px solid rgba(255,255,255,0.08)',
                position: 'relative', overflow: 'hidden',
                boxShadow: p.sel ? `0 0 28px ${p.c}25` : 'none',
              }}>
                {p.sel && <div style={{ position: 'absolute', top: 10, right: 10, padding: '2px 8px', borderRadius: 999, background: p.c, color: '#06070A', fontSize: 9, fontWeight: 700, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em' }}>EDITANDO</div>}
                <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.01em' }}>{p.name}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>{p.desc}</div>
                <div style={{ marginTop: 14, fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 36, letterSpacing: '-0.03em', color: p.c }}>{p.fee}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--pp-font-mono)' }}>{p.card}</div>
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                  <span style={{ color: 'rgba(255,255,255,0.55)' }}>orgs ativas</span>
                  <span style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, color: '#fff' }}>{p.orgs}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Editing Enterprise */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14, minHeight: 0 }}>
            <div style={{ padding: 20, borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 600, fontSize: 18, letterSpacing: '-0.015em' }}>Editando · Enterprise</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>28 orgs nesse plano · alterações entram no próximo ciclo</div>

              <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { l: 'Taxa percentual', v: '4,9', sub: '% sobre GMV' },
                  { l: 'Taxa fixa', v: 'R$ 0,49', sub: 'por ingresso' },
                  { l: 'Antecipação D+30', v: '3,2', sub: '% sobre valor' },
                  { l: 'Cashless take', v: '1,8', sub: '% sobre consumo' },
                  { l: 'Webhook custom', v: 'R$ 0,00', sub: 'incluso' },
                  { l: 'White label', v: 'R$ 0,00', sub: 'incluso' },
                ].map((f, i) => (
                  <div key={i} style={{ padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>{f.l}</div>
                    <div style={{ marginTop: 6, padding: '8px 12px', borderRadius: 10, background: 'rgba(0,0,0,0.3)', border: `1px solid ${VE}40`, fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 18, color: '#fff', display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      {f.v}
                      <span style={{ fontSize: 10, fontWeight: 400, color: 'rgba(255,255,255,0.45)' }}>{f.sub}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 16, padding: 14, borderRadius: 12, background: 'rgba(0,255,133,0.06)', border: '1px solid rgba(0,255,133,0.2)' }}>
                <div style={{ fontSize: 11, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.06em', color: GE, fontWeight: 600 }}>Simulação · MRR projetado</div>
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>Take rate efetivo Enterprise hoje:</span>
                  <span style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 18, color: '#fff' }}>4,9%</span>
                </div>
                <div style={{ marginTop: 4, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>Receita MRR estimada (28 orgs):</span>
                  <span style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 22, color: GE }}>R$ 184k/mês</span>
                </div>
              </div>

              <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
                <button style={{ flex: 1, padding: '12px 16px', borderRadius: 12, background: `linear-gradient(180deg, ${AMBERE}, #E6A600)`, color: '#06070A', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Aplicar mudanças (próximo ciclo)</button>
                <button style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Descartar</button>
              </div>
            </div>

            {/* Split rules */}
            <div style={{ padding: 18, borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column' }}>
              <div className="pp-label">Split de pagamento · regras Enterprise</div>
              <div style={{ marginTop: 14, flex: 1 }}>
                <div style={{ padding: 16, borderRadius: 14, background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.25)' }}>
                  <div style={{ fontSize: 11, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: VE, fontWeight: 600 }}>Exemplo · Festival do Sol</div>
                  <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { l: 'Audio Club (org)', pct: 88, v: 'R$ 274.000', c: VE },
                      { l: 'PulsePass (taxa)', pct: 4.9, v: 'R$ 15.312', c: PINKE },
                      { l: 'Promoters (comissão)', pct: 3.3, v: 'R$ 10.450', c: GE },
                      { l: 'Asaas (gateway)', pct: 2.3, v: 'R$ 7.187', c: CE },
                      { l: 'Imposto retido (ISS)', pct: 1.5, v: 'R$ 4.687', c: AMBERE },
                    ].map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: s.c }}/>
                        <span style={{ flex: 1, fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>{s.l}</span>
                        <span style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{s.pct}%</span>
                        <span style={{ width: 90, textAlign: 'right', fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 11, color: '#fff' }}>{s.v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px dashed rgba(255,255,255,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>GMV total</span>
                    <span style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 18, color: '#fff' }}>R$ 311.636</span>
                  </div>
                </div>

                <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.2)', fontSize: 11, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                  Split executado em <b style={{ color: CE }}>tempo real</b> via Asaas split · cada parte vai direto pra conta certa, sem intermediário.
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
// AQ — PLATFORM FINANCIAL (ADM money view)
// ─────────────────────────────────────────────────────────
function AdmFinanceScreen() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', color: '#fff', fontFamily: 'var(--pp-font-body)', background: '#06070A', display: 'flex' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(50% 40% at 20% 10%, rgba(0,255,133,0.10), transparent 60%), radial-gradient(50% 40% at 80% 80%, rgba(167,139,250,0.06), transparent 60%), #06070A' }}/>
      <AdmSide active="finance"/>

      <div style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AdmTop where="Financeiro da plataforma · MRR + GMV + cohort"/>

        <div style={{ flex: 1, padding: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <div className="pp-eyebrow" style={{ color: GE }}>Financeiro da plataforma</div>
              <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 30, letterSpacing: '-0.025em', marginTop: 4 }}>
                A PulsePass fechou <span style={{ fontFamily: 'var(--pp-font-serif)', fontStyle: 'italic', fontWeight: 400, color: GE }}>R$ 4,2M MRR.</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['MRR', 'GMV', 'Cohort'].map((t, i) => (
                <div key={t} style={{ padding: '8px 14px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: i === 0 ? 'rgba(0,255,133,0.12)' : 'rgba(255,255,255,0.04)', border: i === 0 ? '1px solid rgba(0,255,133,0.3)' : '1px solid rgba(255,255,255,0.08)', color: i === 0 ? GE : 'rgba(255,255,255,0.7)' }}>{t}</div>
              ))}
            </div>
          </div>

          {/* Mega KPI */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
            <div style={{
              padding: 26, borderRadius: 22,
              background: `linear-gradient(135deg, rgba(0,255,133,0.20), rgba(167,139,250,0.10))`,
              border: '1px solid rgba(0,255,133,0.3)',
              backdropFilter: 'blur(30px)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 16px 40px rgba(0,255,133,0.15)',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: `radial-gradient(circle, ${GE}40, transparent 70%)`, filter: 'blur(40px)' }}/>
              <div className="pp-eyebrow" style={{ color: GE }}>MRR · mensal recorrente</div>
              <div style={{ marginTop: 10, fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 64, letterSpacing: '-0.035em', display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 26, color: 'rgba(255,255,255,0.55)' }}>R$</span>
                <span style={{ textShadow: `0 0 50px ${GE}50` }}>4,2M</span>
              </div>
              <div style={{ marginTop: 4, fontSize: 14, color: GE }}>+R$ 638k vs mês passado · +18%</div>

              {/* Mini chart */}
              <div style={{ marginTop: 16 }}>
                <svg viewBox="0 0 400 80" preserveAspectRatio="none" style={{ width: '100%', height: 80 }}>
                  <defs>
                    <linearGradient id="mrrGr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor={GE} stopOpacity="0.5"/>
                      <stop offset="1" stopColor={GE} stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <path d="M0,70 L40,68 L80,62 L120,58 L160,52 L200,42 L240,38 L280,30 L320,22 L360,15 L400,8 L400,80 L0,80 Z" fill="url(#mrrGr)"/>
                  <polyline points="0,70 40,68 80,62 120,58 160,52 200,42 240,38 280,30 320,22 360,15 400,8" fill="none" stroke={GE} strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <div style={{ marginTop: 4, display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.45)' }}>
                  {['jun', 'jul', 'ago', 'set', 'out', 'nov'].map(m => <span key={m}>{m}</span>)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { l: 'GMV mês', v: 'R$ 87,4M', d: 'transactional volume', c: VE },
                { l: 'Net take rate', v: '4,8%', d: 'após gateway+impostos', c: CE },
                { l: 'Churn (orgs)', v: '1,8%', d: '4 saídas mês', c: AMBERE },
                { l: 'LTV/CAC ratio', v: '6,4×', d: 'pay-back 4,2m', c: PINKE },
              ].map(k => (
                <div key={k.l} style={{ padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: k.c }}/>
                  <div style={{ paddingLeft: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>{k.l}</div>
                      <div style={{ fontSize: 11, color: k.c, marginTop: 2 }}>{k.d}</div>
                    </div>
                    <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 22, color: '#fff' }}>{k.v}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cohort + breakdown */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14, minHeight: 0 }}>
            <div style={{ padding: 20, borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 600, fontSize: 18, letterSpacing: '-0.015em' }}>Cohort · retenção mês a mês</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>% de orgs que continuam ativas após X meses</div>

              <div style={{ marginTop: 16, flex: 1, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '70px repeat(7, 1fr)', gap: 4 }}>
                  <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.5)' }}></div>
                  {['M0', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6'].map(h => (
                    <div key={h} style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>{h}</div>
                  ))}
                </div>
                {[
                  { m: 'mai', n: 48, ret: [100, 92, 88, 85, 82, 81, 80] },
                  { m: 'jun', n: 52, ret: [100, 94, 91, 88, 86, 84] },
                  { m: 'jul', n: 64, ret: [100, 92, 90, 88, 87] },
                  { m: 'ago', n: 71, ret: [100, 95, 92, 90] },
                  { m: 'set', n: 89, ret: [100, 96, 94] },
                  { m: 'out', n: 102, ret: [100, 97] },
                  { m: 'nov', n: 118, ret: [100] },
                ].map(c => (
                  <div key={c.m} style={{ display: 'grid', gridTemplateColumns: '70px repeat(7, 1fr)', gap: 4, marginTop: 4, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>{c.m}</span>
                      <span style={{ fontSize: 9, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.4)' }}>n={c.n}</span>
                    </div>
                    {c.ret.map((v, i) => {
                      const intensity = v / 100;
                      return (
                        <div key={i} style={{
                          padding: '8px 0', borderRadius: 6, textAlign: 'center',
                          background: `rgba(0, 255, 133, ${intensity * 0.45})`,
                          border: `1px solid rgba(0, 255, 133, ${intensity * 0.5})`,
                          fontFamily: 'var(--pp-font-mono)', fontSize: 10, color: v > 50 ? '#06070A' : '#fff', fontWeight: 700,
                        }}>{v}%</div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue by tier */}
            <div style={{ padding: 20, borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column' }}>
              <div className="pp-label">Receita por plano</div>
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { p: 'Enterprise', v: 'R$ 2,4M', pct: 57, orgs: 28, c: VE },
                  { p: 'Pro', v: 'R$ 1,2M', pct: 29, orgs: 92, c: CE },
                  { p: 'Starter', v: 'R$ 380k', pct: 9, orgs: 124, c: GE },
                  { p: 'Single Event', v: 'R$ 220k', pct: 5, orgs: 4, c: PINKE },
                ].map(r => (
                  <div key={r.p} style={{ padding: 12, borderRadius: 12, background: `${r.c}08`, border: `1px solid ${r.c}25` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{r.p}</div>
                        <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{r.orgs} orgs</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 16, color: r.c }}>{r.v}</div>
                        <div style={{ fontSize: 10, fontFamily: 'var(--pp-font-mono)', color: 'rgba(255,255,255,0.5)' }}>{r.pct}%</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 8, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                      <div style={{ width: `${r.pct}%`, height: '100%', background: r.c }}/>
                    </div>
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

Object.assign(window, { AdmAuditScreen, AdmFlagsScreen, AdmTaxesScreen, AdmFinanceScreen });
