import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Icon } from '@pulsepass/shared/Icon';
import { api } from '../lib/api.js';

const NAV = [
  { to: '/plataforma', icon: 'chart', label: 'Plataforma', end: true },
  { to: '/plataforma/orgs', icon: 'users', label: 'Orgs' },
  { to: '/plataforma/financeiro', icon: 'dollar', label: 'Financeiro' },
  { to: '/plataforma/taxas', icon: 'tag', label: 'Taxas' },
  { to: '/plataforma/fraude', icon: 'scan', label: 'Antifraude' },
  { to: '/plataforma/audit', icon: 'receipt', label: 'Audit log' },
];
const SOON = ['Suporte', 'Feature flags'];

function AdmLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 64 64" style={{ display: 'block' }}>
      <circle cx="32" cy="32" r="22" fill="none" stroke="#FF3D88" strokeWidth="2.5" />
      <path d="M14 32 L22 32 L26 24 L30 40 L34 22 L38 38 L42 32 L50 32" fill="none" stroke="#FF3D88" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AdmShell({ where = 'Visão geral da plataforma', children }) {
  const [access, setAccess] = useState('checking'); // checking | ok | denied
  const navigate = useNavigate();

  useEffect(() => {
    api.platformWhoami().then(() => setAccess('ok')).catch(() => setAccess('denied'));
  }, []);

  return (
    <div className="ck-shell">
      <aside className="adm-side">
        <div className="adm-brand">
          <AdmLogo />
          <div>
            <div className="wm">Pulse<b>ADM</b></div>
            <div className="sub">SUPER-ADMIN</div>
          </div>
        </div>
        <div className="ck-eyebrow" style={{ padding: '6px 12px', color: 'var(--pp-fg-4)' }}>Operação</div>
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className="adm-navlink">
            <Icon name={n.icon} size={16} /> {n.label}
          </NavLink>
        ))}
        {SOON.map((s) => (
          <span key={s} className="adm-navlink" style={{ opacity: 0.4, cursor: 'default' }}>
            <Icon name="box" size={16} /> {s} <span style={{ marginLeft: 'auto', fontSize: 9, fontFamily: 'var(--pp-font-mono)' }}>em breve</span>
          </span>
        ))}
        <button className="ck-btn ck-btn--glass ck-btn--sm" style={{ marginTop: 'auto' }} onClick={() => navigate('/')}>
          <Icon name="arrowLeft" size={15} /> Voltar ao cockpit
        </button>
      </aside>

      <div className="ck-main">
        <header className="adm-topbar">
          <div className="pp-row">
            <span className="adm-secpill"><Icon name="scan" size={12} /> MODO ADMINISTRATIVO · TUDO É TRILHADO</span>
            <span className="pp-muted" style={{ fontSize: 'var(--pp-fs-12)' }}>{where}</span>
          </div>
          <span className="ck-live"><span className="pp-pulse-dot" /> status OK</span>
        </header>
        <main className="adm-content">
          {access === 'denied'
            ? <div className="pp-empty"><div className="pp-empty__icon"><Icon name="scan" size={30} /></div><div className="pp-empty__title">Acesso restrito</div><p>Esta área é exclusiva do super-admin PulsePass.</p></div>
            : children}
        </main>
      </div>
    </div>
  );
}
