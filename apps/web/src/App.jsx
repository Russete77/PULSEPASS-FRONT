import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useNavegacaoAcessivel, criarResolvedorDeTitulo } from '@pulsepass/shared/navegacao';
import { useAuth } from './context/AuthContext.jsx';
import { onboardingVisto } from './lib/onboarding.js';
import { Loading } from './components/States.jsx';

import Discover from './pages/Discover.jsx';
import Busca from './pages/Busca.jsx';
import EventDetail from './pages/EventDetail.jsx';
import Casa from './pages/Casa.jsx';
import Checkout from './pages/Checkout.jsx';
import PedidoConfirmado from './pages/PedidoConfirmado.jsx';
import MyTickets from './pages/MyTickets.jsx';
import MyOrders from './pages/MyOrders.jsx';
import Wallet from './pages/Wallet.jsx';
import OrderAhead from './pages/OrderAhead.jsx';
import PromoterPortal from './pages/PromoterPortal.jsx';
import CamarotesPublic from './pages/CamarotesPublic.jsx';
import Assentos from './pages/Assentos.jsx';
import TicketView from './pages/TicketView.jsx';
import Perfil from './pages/Perfil.jsx';
import Login from './pages/Login.jsx';
import Bemvindo from './pages/Bemvindo.jsx';
import GuestSignup from './pages/GuestSignup.jsx';
import RedefinirSenha from './pages/RedefinirSenha.jsx';

function Protected({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/entrar" state={{ from: location }} replace />;
  return children;
}

/**
 * Primeiro acesso — só na vitrine.
 *
 * O tour intercepta "/" e mais nada. Quem chega por link de evento, por link
 * de lista de promoter ou já no meio de um checkout entra direto no que veio
 * fazer: tutorial entre a pessoa e a compra é venda perdida. A vitrine é a
 * única URL de quem chegou sem destino — é lá que apresentar o app cabe.
 */
function PrimeiraVisita({ children }) {
  if (!onboardingVisto()) return <Navigate to="/bem-vindo" replace />;
  return children;
}

const TITULOS = criarResolvedorDeTitulo({
  '/': 'Eventos',
  '/bem-vindo': 'Bem-vindo',
  '/busca': 'Busca',
  '/eventos/:slug': 'Evento',
  '/casa/:slug': 'A casa',
  '/eventos/:slug/camarotes': 'Camarotes',
  '/eventos/:slug/assentos': 'Escolha seu lugar',
  '/eventos/:slug/bar': 'Bar',
  '/lista/:code': 'Lista de convidados',
  '/entrar': 'Entrar',
  '/redefinir-senha': 'Redefinir senha',
  '/checkout/:orderId': 'Pagamento',
  '/pedido/:orderId/confirmado': 'Pedido confirmado',
  '/meus-ingressos': 'Meus ingressos',
  '/meus-pedidos': 'Meus pedidos',
  '/carteira': 'Carteira',
  '/perfil': 'Meu perfil',
  '/promoter': 'Promoter',
  '/ingresso/:id': 'Meu ingresso',
});

export default function App() {
  const { pathname } = useLocation();
  useNavegacaoAcessivel(pathname, TITULOS, 'PulsePass');

  return (
    <Routes>
      <Route path="/" element={<PrimeiraVisita><Discover /></PrimeiraVisita>} />
      <Route path="/bem-vindo" element={<Bemvindo />} />
      {/* Pública como a vitrine: o catálogo não exige login, e obrigar a
          entrar para procurar mataria a busca vinda de fora. */}
      <Route path="/busca" element={<Busca />} />
      <Route path="/eventos/:slug" element={<EventDetail />} />
      {/* Pública como a vitrine: a página da casa é justamente o que se
          manda no story do Instagram, e exigir login mataria o link. */}
      <Route path="/casa/:slug" element={<Casa />} />
      <Route path="/eventos/:slug/camarotes" element={<CamarotesPublic />} />
      <Route path="/eventos/:slug/assentos" element={<Assentos />} />
      <Route path="/eventos/:slug/bar" element={<Protected><OrderAhead /></Protected>} />
      <Route path="/lista/:code" element={<GuestSignup />} />
      <Route path="/entrar" element={<Login />} />
      <Route path="/redefinir-senha" element={<RedefinirSenha />} />
      <Route path="/checkout/:orderId" element={<Protected><Checkout /></Protected>} />
      <Route path="/pedido/:orderId/confirmado" element={<Protected><PedidoConfirmado /></Protected>} />
      <Route path="/meus-ingressos" element={<Protected><MyTickets /></Protected>} />
      <Route path="/meus-pedidos" element={<Protected><MyOrders /></Protected>} />
      <Route path="/carteira" element={<Protected><Wallet /></Protected>} />
      <Route path="/perfil" element={<Protected><Perfil /></Protected>} />
      <Route path="/promoter" element={<Protected><PromoterPortal /></Protected>} />
      <Route path="/ingresso/:id" element={<Protected><TicketView /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
