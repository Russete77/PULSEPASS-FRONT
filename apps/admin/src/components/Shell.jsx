import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BrandWordmark } from '@pulsepass/shared/Logo';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';

export function Shell({ children }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let alive = true;
    api.platformWhoami().then(() => alive && setIsAdmin(true)).catch(() => {});
    return () => { alive = false; };
  }, []);

  return (
    <div className="ck-shell">
      <aside className="ck-side">
        <div className="ck-brand">
          <BrandWordmark size={30} tag="OS" tagline="cockpit produtora" />
        </div>
        <nav className="ck-nav">
          <NavLink to="/" end className="ck-navlink">Eventos</NavLink>
          <NavLink to="/novo" className="ck-navlink">Criar evento</NavLink>
          <NavLink to="/repasse" className="ck-navlink">Repasse</NavLink>
          {isAdmin && (
            <NavLink to="/plataforma" className="ck-navlink" style={{ color: 'var(--pp-pink)', marginTop: 'var(--pp-s-4)' }}>
              ◆ PulseADM
            </NavLink>
          )}
        </nav>
        <div className="ck-side-foot">Cockpit · Produtora</div>
      </aside>

      <div className="ck-main">
        <header className="ck-topbar">
          <span className="ck-live">
            <span className="pp-pulse-dot" /> ao vivo
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: 'var(--pp-fg-3)', fontSize: 13 }}>{user?.email}</span>
            <button
              className="ck-btn ck-btn--glass"
              onClick={async () => { await signOut(); navigate('/entrar'); }}
            >
              Sair
            </button>
          </div>
        </header>
        <main className="ck-content">{children}</main>
      </div>
    </div>
  );
}

export function Loading({ label = 'Carregando…' }) {
  return <div className="ck-loading"><div className="ck-spinner" /><p style={{ marginTop: 14 }}>{label}</p></div>;
}
export function ErrorBox({ children }) { return <div className="ck-error">{children}</div>; }
