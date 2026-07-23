import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { Loading } from './components/Shell.jsx';

import Login from './pages/Login.jsx';
import RedefinirSenha from './pages/RedefinirSenha.jsx';
import Events from './pages/Events.jsx';
import EventWizard from './pages/EventWizard.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Porta from './pages/Porta.jsx';
import PDV from './pages/PDV.jsx';
import Cardapio from './pages/Cardapio.jsx';
import Fechamento from './pages/Fechamento.jsx';
import Camarotes from './pages/Camarotes.jsx';
import Promoters from './pages/Promoters.jsx';
import Cupons from './pages/Cupons.jsx';
import Conciliacao from './pages/Conciliacao.jsx';
import Equipe from './pages/Equipe.jsx';
import Repasse from './pages/Repasse.jsx';
import ListaPorta from './pages/ListaPorta.jsx';
import Platform from './pages/plataforma/Platform.jsx';
import PlatformOrgs from './pages/plataforma/Orgs.jsx';
import PlatformFraud from './pages/plataforma/Fraud.jsx';
import PlatformFinance from './pages/plataforma/Finance.jsx';
import PlatformAudit from './pages/plataforma/Audit.jsx';

function Protected({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/entrar" state={{ from: location }} replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/entrar" element={<Login />} />
      <Route path="/redefinir-senha" element={<RedefinirSenha />} />
      <Route path="/" element={<Protected><Events /></Protected>} />
      <Route path="/novo" element={<Protected><EventWizard /></Protected>} />
      <Route path="/eventos/:id" element={<Protected><Dashboard /></Protected>} />
      <Route path="/eventos/:id/porta" element={<Protected><Porta /></Protected>} />
      <Route path="/eventos/:id/lista-porta" element={<Protected><ListaPorta /></Protected>} />
      <Route path="/eventos/:id/pdv" element={<Protected><PDV /></Protected>} />
      <Route path="/eventos/:id/cardapio" element={<Protected><Cardapio /></Protected>} />
      <Route path="/eventos/:id/fechamento" element={<Protected><Fechamento /></Protected>} />
      <Route path="/eventos/:id/camarotes" element={<Protected><Camarotes /></Protected>} />
      <Route path="/eventos/:id/promoters" element={<Protected><Promoters /></Protected>} />
      <Route path="/eventos/:id/cupons" element={<Protected><Cupons /></Protected>} />
      <Route path="/eventos/:id/conciliacao" element={<Protected><Conciliacao /></Protected>} />
      <Route path="/eventos/:id/equipe" element={<Protected><Equipe /></Protected>} />
      <Route path="/repasse" element={<Protected><Repasse /></Protected>} />
      <Route path="/plataforma" element={<Protected><Platform /></Protected>} />
      <Route path="/plataforma/orgs" element={<Protected><PlatformOrgs /></Protected>} />
      <Route path="/plataforma/fraude" element={<Protected><PlatformFraud /></Protected>} />
      <Route path="/plataforma/financeiro" element={<Protected><PlatformFinance /></Protected>} />
      <Route path="/plataforma/audit" element={<Protected><PlatformAudit /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
