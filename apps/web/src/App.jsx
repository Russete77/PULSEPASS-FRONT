import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useNavegacaoAcessivel, criarResolvedorDeTitulo } from '@pulsepass/shared/navegacao';
import { useAuth } from './context/AuthContext.jsx';
import { Loading } from './components/States.jsx';

import Discover from './pages/Discover.jsx';
import EventDetail from './pages/EventDetail.jsx';
import Checkout from './pages/Checkout.jsx';
import MyTickets from './pages/MyTickets.jsx';
import MyOrders from './pages/MyOrders.jsx';
import Wallet from './pages/Wallet.jsx';
import OrderAhead from './pages/OrderAhead.jsx';
import PromoterPortal from './pages/PromoterPortal.jsx';
import CamarotesPublic from './pages/CamarotesPublic.jsx';
import Assentos from './pages/Assentos.jsx';
import TicketView from './pages/TicketView.jsx';
import Login from './pages/Login.jsx';
import GuestSignup from './pages/GuestSignup.jsx';
import RedefinirSenha from './pages/RedefinirSenha.jsx';

function Protected({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/entrar" state={{ from: location }} replace />;
  return children;
}

const TITULOS = criarResolvedorDeTitulo({
  '/': 'Eventos',
  '/eventos/:slug': 'Evento',
  '/eventos/:slug/camarotes': 'Camarotes',
  '/eventos/:slug/assentos': 'Escolha seu lugar',
  '/eventos/:slug/bar': 'Bar',
  '/lista/:code': 'Lista de convidados',
  '/entrar': 'Entrar',
  '/redefinir-senha': 'Redefinir senha',
  '/checkout/:orderId': 'Pagamento',
  '/meus-ingressos': 'Meus ingressos',
  '/meus-pedidos': 'Meus pedidos',
  '/carteira': 'Carteira',
  '/promoter': 'Promoter',
  '/ingresso/:id': 'Meu ingresso',
});

export default function App() {
  const { pathname } = useLocation();
  useNavegacaoAcessivel(pathname, TITULOS, 'PulsePass');

  return (
    <Routes>
      <Route path="/" element={<Discover />} />
      <Route path="/eventos/:slug" element={<EventDetail />} />
      <Route path="/eventos/:slug/camarotes" element={<CamarotesPublic />} />
      <Route path="/eventos/:slug/assentos" element={<Assentos />} />
      <Route path="/eventos/:slug/bar" element={<Protected><OrderAhead /></Protected>} />
      <Route path="/lista/:code" element={<GuestSignup />} />
      <Route path="/entrar" element={<Login />} />
      <Route path="/redefinir-senha" element={<RedefinirSenha />} />
      <Route path="/checkout/:orderId" element={<Protected><Checkout /></Protected>} />
      <Route path="/meus-ingressos" element={<Protected><MyTickets /></Protected>} />
      <Route path="/meus-pedidos" element={<Protected><MyOrders /></Protected>} />
      <Route path="/carteira" element={<Protected><Wallet /></Protected>} />
      <Route path="/promoter" element={<Protected><PromoterPortal /></Protected>} />
      <Route path="/ingresso/:id" element={<Protected><TicketView /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
