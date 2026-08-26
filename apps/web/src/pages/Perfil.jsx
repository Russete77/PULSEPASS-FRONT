import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Page } from '../components/Layout.jsx';
import { Loading, ErrorBox } from '../components/States.jsx';
import { Icon } from '../components/Icon.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Perfil (ProfileScreen).
 *
 * Tela de LEITURA. A API não tem endpoint de atualização de perfil: o único
 * lugar que devolve `profiles` para o dono da conta é GET /admin/me, e ele é
 * só leitura. Desenhar um formulário de edição aqui criaria um botão "Salvar"
 * sem para onde mandar — pior que não ter edição é ter uma que perde o que a
 * pessoa digitou.
 *
 * O que o desenho traz e NÃO foi portado, por não existir no backend:
 * - Avatar de imagem. A coluna `profiles.avatar_url` existe no banco, mas
 *   /admin/me não a seleciona (o select é `id, full_name, role, email`) e não
 *   há upload de avatar em lugar nenhum da API. Ficam as iniciais, que são
 *   derivadas do nome real e não fingem ser uma foto que ninguém enviou.
 * - Telefone e CPF. Também existem em `profiles` e também ficaram de fora do
 *   select de /admin/me. Lê-los do user_metadata do Supabase seria mostrar o
 *   que foi digitado no cadastro, não o que está no banco hoje.
 * - Tier/fidelidade ("Pulse Gold · 71%"), conquistas, reputação em estrelas e
 *   os contadores de eventos/cashless. Não existe programa de fidelidade, nem
 *   badges, nem avaliação de usuário no produto — nada disso tem tabela.
 * - Linhas de ajuste (métodos de pagamento, notificações, LGPD, ajuda). Nenhuma
 *   dessas telas existe; link para o vazio é pior que ausência de link.
 *
 * O que sobrou é o que é verdade: quem você é, que papel a conta tem, onde
 * ficam as suas coisas e por onde sair.
 */

const PAPEL = {
  cliente: { rotulo: 'Cliente', cls: 'pp-badge--neutral' },
  promoter: { rotulo: 'Promoter', cls: 'pp-badge--violet' },
  produtora: { rotulo: 'Produtora', cls: 'pp-badge--pulse' },
  adm: { rotulo: 'Administrador', cls: 'pp-badge--amber' },
};

const PAPEL_STAFF = { manager: 'Gerente', door: 'Portaria', bar: 'Bar' };

/** Iniciais para o bloco do avatar — derivadas do nome; sem nome, do e-mail. */
function iniciais(nome, email) {
  const base = (nome ?? '').trim();
  if (base) {
    const partes = base.split(/\s+/).filter(Boolean);
    const primeira = partes[0][0] ?? '';
    const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
    return (primeira + ultima).toUpperCase();
  }
  return (email ?? '?').slice(0, 2).toUpperCase();
}

/** Atalhos para telas que EXISTEM neste app. Os mesmos destinos do topo. */
const ATALHOS = [
  { to: '/meus-ingressos', icone: 'ticket', titulo: 'Meus ingressos', apoio: 'QR de entrada e transferência' },
  { to: '/meus-pedidos', icone: 'receipt', titulo: 'Meus pedidos', apoio: 'histórico de compras e reembolso' },
  { to: '/carteira', icone: 'wallet', titulo: 'Carteira', apoio: 'saldo do bar e recargas' },
  { to: '/promoter', icone: 'users', titulo: 'Portal do promoter', apoio: 'sua lista e comissões' },
];

export default function Perfil() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [dados, setDados] = useState(null);
  const [status, setStatus] = useState('loading');
  const [erro, setErro] = useState('');

  useEffect(() => {
    let vivo = true;
    api.me()
      .then((d) => { if (vivo) { setDados(d); setStatus('done'); } })
      .catch((e) => { if (vivo) { setErro(e.message); setStatus('error'); } });
    return () => { vivo = false; };
  }, []);

  const perfil = dados?.profile ?? null;
  // O e-mail da sessão é o mesmo da conta e chega antes da rede — serve de
  // lastro enquanto /admin/me responde e caso o profile venha nulo.
  const email = perfil?.email ?? user?.email ?? '';
  const nome = perfil?.full_name?.trim() || '';
  const papel = PAPEL[perfil?.role] ?? null;

  const organizacoes = dados?.organizations ?? [];
  const escalacoes = dados?.assignments ?? [];

  async function sair() {
    await signOut();
    navigate('/');
  }

  return (
    <Page>
      <div className="pp-reveal">
        <div className="pp-eyebrow">sua conta</div>
        <h1 className="pp-titulo-sob">
          {nome ? <>Oi, <span className="pp-accent">{nome.split(/\s+/)[0]}</span></> : 'Seu perfil'}
        </h1>
      </div>

      {status === 'loading' && <Loading label="Carregando seu perfil…" />}
      {status === 'error' && <ErrorBox>{erro}</ErrorBox>}

      {status === 'done' && (
        <>
          {/* Identidade. O avatar é decorativo (as iniciais repetem o nome que
              está logo ao lado), por isso sai da árvore de acessibilidade. */}
          {/* Identidade numa linha: retrato, nome, e o papel da conta. Os
              tres degraus de texto sao os do sistema — section, support,
              etiqueta — em vez de tres tamanhos escolhidos aqui. */}
          <section className="pp-card pp-card--pad pp-linha pp-mt-6" aria-labelledby="perfil-identidade">
            <div className="pp-avatar pp-avatar--lg" aria-hidden="true">{iniciais(nome, email)}</div>
            <div className="pp-grow">
              <h2 id="perfil-identidade" className="pp-t-section pp-truncate">
                {nome || 'Sem nome cadastrado'}
              </h2>
              <div className="pp-muted pp-truncate pp-t-support pp-mt-1">{email}</div>
              {papel && (
                <span className={`pp-badge ${papel.cls} pp-mt-2`}>{papel.rotulo}</span>
              )}
            </div>
          </section>

          {/* Nome vazio é o estado mais comum de quem se cadastrou correndo no
              checkout. Sem endpoint de edição, o honesto é explicar por que
              aparece assim em vez de oferecer um campo que não salva. */}
          {!nome && (
            <p className="pp-muted-2 pp-t-support pp-mt-3">
              Seu nome ainda não foi preenchido. A edição de perfil ainda não
              está disponível — por enquanto, fale com o suporte para corrigir.
            </p>
          )}

          <section aria-labelledby="perfil-atalhos" className="pp-mt-8">
            <h2 id="perfil-atalhos" className="pp-t-section pp-mb-3">Suas coisas</h2>
            <div className="pp-stack pp-stack-3">
              {ATALHOS.map((a) => (
                <Link key={a.to} to={a.to} className="pp-card pp-card--interactive pp-card--pad pp-linha">
                  <span className="pp-icontile pp-icontile--sm" aria-hidden="true">
                    <Icon name={a.icone} size={17} />
                  </span>
                  <span className="pp-grow">
                    <span className="pp-linha__titulo pp-block">{a.titulo}</span>
                    <span className="pp-linha__apoio pp-block">{a.apoio}</span>
                  </span>
                  <Icon name="chevronRight" size={18} className="pp-muted-2" />
                </Link>
              ))}
            </div>
          </section>

          {/* Produtora / equipe. Só aparece para quem de fato tem organização ou
              escalação — /admin/me devolve as duas listas. Para o cliente comum
              elas vêm vazias e a seção inteira some, em vez de virar um bloco
              "Você não é produtora" que não serve para nada. */}
          {(organizacoes.length > 0 || escalacoes.length > 0) && (
            <section aria-labelledby="perfil-trabalho" className="pp-mt-8">
              <h2 id="perfil-trabalho" className="pp-t-section pp-mb-3">Trabalho</h2>
              <div className="pp-stack pp-stack-3">
                {organizacoes.map((o) => (
                  <div key={o.id} className="pp-card pp-card--pad pp-between">
                    <span className="pp-truncate pp-linha__titulo">{o.name}</span>
                    <span className="pp-badge pp-badge--pulse">Produtora</span>
                  </div>
                ))}
                {escalacoes.map((e) => (
                  <div key={`${e.role}-${e.event?.id}`} className="pp-card pp-card--pad pp-between">
                    <span className="pp-grow">
                      <span className="pp-truncate pp-linha__titulo pp-block">{e.event?.title}</span>
                      <span className="pp-truncate pp-linha__apoio pp-block">{e.event?.city}/{e.event?.state}</span>
                    </span>
                    <span className="pp-badge pp-badge--violet">{PAPEL_STAFF[e.role] ?? e.role}</span>
                  </div>
                ))}
              </div>
              {/* O cockpit é outro app (apps/admin), em outro endereço. Sem uma
                  URL configurada não há para onde linkar — dizer onde a pessoa
                  encontra é melhor que um link quebrado. */}
              <p className="pp-muted-2 pp-t-support pp-mt-3">
                A gestão de eventos e equipe fica no painel da produtora.
              </p>
            </section>
          )}

          <section aria-labelledby="perfil-acesso" className="pp-mt-8">
            <h2 id="perfil-acesso" className="pp-t-section pp-mb-3">Acesso</h2>
            <div className="pp-stack pp-stack-3">
              {/* Vale para quem já está logado: a tela usa updateUser sobre a
                  sessão corrente, não só sobre o link do e-mail. */}
              <Link to="/redefinir-senha" className="pp-btn pp-btn--glass pp-btn--block">
                Trocar minha senha
              </Link>
              <button className="pp-btn pp-btn--danger-soft pp-btn--block" onClick={sair}>
                Sair da conta
              </button>
            </div>
          </section>
        </>
      )}
    </Page>
  );
}
