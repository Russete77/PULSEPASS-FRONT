import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { BrandWordmark } from '@pulsepass/shared/Logo';
import { useAuth } from '../context/AuthContext.jsx';

export function TopBar() {
  const { user, signOut, authEnabled } = useAuth();
  const navigate = useNavigate();
  // "Entrar" no topo enquanto a pessoa já está na tela de entrar é um botão
  // que não leva a lugar nenhum — e ainda compete com o "Entrar" do formulário.
  const naTelaDeEntrar = ['/entrar', '/redefinir-senha'].includes(useLocation().pathname);

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
        ) : !naTelaDeEntrar && (
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
      <a href="#conteudo" className="pp-skip">Pular para o conteúdo</a>
      <TopBar />
      <main className="pp-page" id="conteudo">
        <div className="pp-container">{children}</div>
      </main>
      <Footer />
    </>
  );
}
