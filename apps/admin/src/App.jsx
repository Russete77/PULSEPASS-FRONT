import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useNavegacaoAcessivel, criarResolvedorDeTitulo } from '@pulsepass/shared/navegacao';
import { useAuth } from './context/AuthContext.jsx';
import { Loading } from './components/Shell.jsx';

import Login from './pages/Login.jsx';
import RedefinirSenha from './pages/RedefinirSenha.jsx';
import Events from './pages/Events.jsx';
import EventWizard from './pages/EventWizard.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AoVivo from './pages/AoVivo.jsx';
import Porta from './pages/Porta.jsx';
import PDV from './pages/PDV.jsx';
import Cozinha from './pages/Cozinha.jsx';
import Garcom from './pages/Garcom.jsx';
import Totem from './pages/Totem.jsx';
import Bilheteria from './pages/Bilheteria.jsx';
import Auditoria from './pages/Auditoria.jsx';
import Fiscal from './pages/Fiscal.jsx';
import FilaEspera from './pages/FilaEspera.jsx';
import Cardapio from './pages/Cardapio.jsx';
import Fechamento from './pages/Fechamento.jsx';
import Camarotes from './pages/Camarotes.jsx';
import Promoters from './pages/Promoters.jsx';
import Cupons from './pages/Cupons.jsx';
import Marketing from './pages/Marketing.jsx';
import Conciliacao from './pages/Conciliacao.jsx';
import Equipe from './pages/Equipe.jsx';
import Repasse from './pages/Repasse.jsx';
import Marca from './pages/Marca.jsx';
import ListaPorta from './pages/ListaPorta.jsx';
import Platform from './pages/plataforma/Platform.jsx';
import PlatformOrgs from './pages/plataforma/Orgs.jsx';
import PlatformFraud from './pages/plataforma/Fraud.jsx';
import PlatformFinance from './pages/plataforma/Finance.jsx';
import PlatformTaxas from './pages/plataforma/Taxas.jsx';
import PlatformAudit from './pages/plataforma/Audit.jsx';
import PlatformSuporte from './pages/plataforma/Suporte.jsx';
import PlatformFlags from './pages/plataforma/Flags.jsx';

function Protected({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/entrar" state={{ from: location }} replace />;
  return children;
}

/**
 * Título por rota. Na operação ao vivo a produtora tem porta, PDV, bilheteria
 * e dashboard abertos ao mesmo tempo — o texto da aba é como ela acha cada um.
 */
const TITULOS = criarResolvedorDeTitulo({
  '/entrar': 'Entrar',
  '/redefinir-senha': 'Redefinir senha',
  '/': 'Meus eventos',
  '/novo': 'Criar evento',
  '/eventos/:id': 'Dashboard',
  '/eventos/:id/ao-vivo': '🟢 Ao vivo',
  '/eventos/:id/porta': '🚪 Porta',
  '/eventos/:id/lista-porta': 'Lista na porta',
  '/eventos/:id/fila-espera': 'Fila de espera',
  '/eventos/:id/fiscal': 'Notas fiscais',
  '/eventos/:id/auditoria': 'Auditoria',
  '/eventos/:id/bilheteria': '🎟 Bilheteria',
  '/eventos/:id/pdv': '🍹 PDV',
  '/eventos/:id/cozinha': '👨‍🍳 Cozinha',
  '/eventos/:id/garcom': '🍽 Salão',
  '/eventos/:id/totem': 'Totem',
  '/eventos/:id/cardapio': 'Cardápio',
  '/eventos/:id/fechamento': 'Fechamento',
  '/eventos/:id/camarotes': 'Camarotes',
  '/eventos/:id/promoters': 'Promoters',
  '/eventos/:id/cupons': 'Cupons',
  '/eventos/:id/marketing': 'Marketing',
  '/eventos/:id/conciliacao': 'Financeiro',
  '/eventos/:id/equipe': 'Equipe',
  '/repasse': 'Repasse',
  '/marca': 'Marca',
  '/plataforma': 'Plataforma',
  '/plataforma/orgs': 'Produtoras',
  '/plataforma/fraude': 'Fraude',
  '/plataforma/taxas': 'Taxas',
  '/plataforma/financeiro': 'Financeiro da plataforma',
  '/plataforma/audit': 'Auditoria da plataforma',
  '/plataforma/suporte': 'Suporte',
  '/plataforma/flags': 'Configuração da plataforma',
});

export default function App() {
  const { pathname } = useLocation();
  useNavegacaoAcessivel(pathname, TITULOS, 'PulsePass Cockpit');

  return (
    <Routes>
      <Route path="/entrar" element={<Login />} />
      <Route path="/redefinir-senha" element={<RedefinirSenha />} />
      <Route path="/" element={<Protected><Events /></Protected>} />
      <Route path="/novo" element={<Protected><EventWizard /></Protected>} />
      <Route path="/eventos/:id" element={<Protected><Dashboard /></Protected>} />
      <Route path="/eventos/:id/ao-vivo" element={<Protected><AoVivo /></Protected>} />
      <Route path="/eventos/:id/porta" element={<Protected><Porta /></Protected>} />
      <Route path="/eventos/:id/lista-porta" element={<Protected><ListaPorta /></Protected>} />
      <Route path="/eventos/:id/fila-espera" element={<Protected><FilaEspera /></Protected>} />
      <Route path="/eventos/:id/fiscal" element={<Protected><Fiscal /></Protected>} />
      <Route path="/eventos/:id/auditoria" element={<Protected><Auditoria /></Protected>} />
      <Route path="/eventos/:id/bilheteria" element={<Protected><Bilheteria /></Protected>} />
      <Route path="/eventos/:id/pdv" element={<Protected><PDV /></Protected>} />
      <Route path="/eventos/:id/cozinha" element={<Protected><Cozinha /></Protected>} />
      <Route path="/eventos/:id/garcom" element={<Protected><Garcom /></Protected>} />
      <Route path="/eventos/:id/totem" element={<Protected><Totem /></Protected>} />
      <Route path="/eventos/:id/cardapio" element={<Protected><Cardapio /></Protected>} />
      <Route path="/eventos/:id/fechamento" element={<Protected><Fechamento /></Protected>} />
      <Route path="/eventos/:id/camarotes" element={<Protected><Camarotes /></Protected>} />
      <Route path="/eventos/:id/promoters" element={<Protected><Promoters /></Protected>} />
      <Route path="/eventos/:id/cupons" element={<Protected><Cupons /></Protected>} />
      <Route path="/eventos/:id/marketing" element={<Protected><Marketing /></Protected>} />
      <Route path="/eventos/:id/conciliacao" element={<Protected><Conciliacao /></Protected>} />
      <Route path="/eventos/:id/equipe" element={<Protected><Equipe /></Protected>} />
      <Route path="/repasse" element={<Protected><Repasse /></Protected>} />
      <Route path="/marca" element={<Protected><Marca /></Protected>} />
      <Route path="/plataforma" element={<Protected><Platform /></Protected>} />
      <Route path="/plataforma/orgs" element={<Protected><PlatformOrgs /></Protected>} />
      <Route path="/plataforma/fraude" element={<Protected><PlatformFraud /></Protected>} />
      <Route path="/plataforma/taxas" element={<Protected><PlatformTaxas /></Protected>} />
      <Route path="/plataforma/financeiro" element={<Protected><PlatformFinance /></Protected>} />
      <Route path="/plataforma/audit" element={<Protected><PlatformAudit /></Protected>} />
      {/* Área da plataforma: além do login (Protected), o AdmShell de cada tela
          checa /platform/whoami e nega quem não é super-admin. */}
      <Route path="/plataforma/suporte" element={<Protected><PlatformSuporte /></Protected>} />
      <Route path="/plataforma/flags" element={<Protected><PlatformFlags /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
