import { Link, NavLink, useNavigate } from 'react-router-dom';
import { BrandWordmark } from '@pulsepass/shared/Logo';
import { useAuth } from '../context/AuthContext.jsx';

export function TopBar() {
  const { user, signOut, authEnabled } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="pp-topbar">
      <Link to="/" className="pp-brand" aria-label="PulsePass — início">
        <BrandWordmark size={30} tag="Pass" />
      </Link>
      <nav className="pp-nav">
        {user ? (
          <>
            <NavLink to="/meus-ingressos" className="pp-navlink">Ingressos</NavLink>
            <NavLink to="/carteira" className="pp-navlink">Carteira</NavLink>
            <NavLink to="/meus-pedidos" className="pp-navlink">Pedidos</NavLink>
            <NavLink to="/promoter" className="pp-navlink">Promoter</NavLink>
            <button
              className="pp-btn pp-btn--glass pp-btn--sm"
              onClick={async () => {
                await signOut();
                navigate('/');
              }}
            >
              Sair
            </button>
          </>
        ) : (
          <Link
            to="/entrar"
            className="pp-btn pp-btn--primary pp-btn--sm"
            style={{ opacity: authEnabled ? 1 : 0.5 }}
          >
            Entrar
          </Link>
        )}
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="pp-footer">
      PulsePass · Fase 1 — web responsivo · ticketeria + guest list + cashless
    </footer>
  );
}

export function Page({ children }) {
  return (
    <>
      <div className="pp-aurora-fixed" aria-hidden="true" />
      <TopBar />
      <main className="pp-page">
        <div className="pp-container">{children}</div>
      </main>
      <Footer />
    </>
  );
}
