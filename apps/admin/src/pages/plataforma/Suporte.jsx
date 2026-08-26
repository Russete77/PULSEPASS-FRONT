import { useEffect, useMemo, useRef, useState } from 'react';
import { AdmShell } from '../../components/AdmShell.jsx';
import { Loading, ErrorBox } from '../../components/Shell.jsx';
import { Icon } from '@pulsepass/shared/Icon';
import { api } from '../../lib/api.js';
import { brl, dateTime } from '../../lib/format.js';

/**
 * Consulta de suporte da plataforma.
 *
 * O mockup do design system desenhou um inbox de tickets com SLA e IA. Nada
 * disso existe no backend — não há tabela de ticket, conversa nem SLA. Montar
 * a caixa de entrada aqui significaria inventar seis números por linha, e o
 * time de suporte descobriria na primeira semana que o painel mente.
 *
 * O que o time REALMENTE precisa quando alguém escreve "cadê meu ingresso?" é
 * contexto: qual produtora, qual taxa vale, o repasse é automático, e o que
 * acabou de acontecer de dinheiro na plataforma. Isso a API já entrega de
 * verdade — e é exatamente o que esta tela consulta.
 */

// Mesmo vocabulário visual da trilha (/plataforma/audit): o suporte e a
// auditoria olham o MESMO feed, então o ícone tem que significar a mesma coisa.
const KIND = {
  payment: { icon: 'check', tom: 'pulse', label: 'Pagamento' },
  refund: { icon: 'refresh', tom: 'pink', label: 'Reembolso' },
  event: { icon: 'calendar', tom: 'cyan', label: 'Evento' },
  org: { icon: 'users', tom: 'violet', label: 'Produtora' },
};

const norm = (v) => (v ?? '').toString().toLowerCase().trim();

/**
 * "Cadê meu ingresso?" — a pergunta que o atendimento mais recebe.
 *
 * Dois caminhos porque são os dois que a pessoa do outro lado tem: ela lembra
 * com que e-mail comprou, ou está com o print do QR na mão. O código também
 * resolve o caso em que a compra saiu no e-mail de outra pessoa.
 *
 * O `qr_secret` nunca chega aqui: dá para responder tudo sem o segredo que
 * abre a porta, e um registro de suporte com ele seria uma cópia funcional
 * do ingresso.
 */
function BuscaDoComprador() {
  const [termo, setTermo] = useState('');
  const [modo, setModo] = useState('email');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [res, setRes] = useState(null);

  async function buscar(e) {
    e.preventDefault();
    const v = termo.trim();
    if (v.length < 3) { setErro('Informe ao menos 3 caracteres.'); return; }
    setCarregando(true); setErro(''); setRes(null);
    try {
      setRes(await api.platformBuscarComprador(modo === 'email' ? { email: v } : { code: v }));
    } catch (err) { setErro(err.message); } finally { setCarregando(false); }
  }

  return (
    <section className="ck-panel ck-mt-4" aria-label="Buscar comprador">
      <h2 className="ck-panel__title">Cadê o ingresso do cliente</h2>
      <p className="ck-panel__sub">Busque pelo e-mail da compra ou pelo código do ingresso.</p>

      <form onSubmit={buscar} className="ck-mt-4" role="search">
        <div className="ck-tabs ck-mb-3" role="group" aria-label="Buscar por">
          {[['email', 'E-mail da compra'], ['codigo', 'Código do ingresso']].map(([k, r]) => (
            <button key={k} type="button" className={`ck-tab ${modo === k ? 'is-on' : ''}`}
              aria-pressed={modo === k} onClick={() => { setModo(k); setRes(null); setErro(''); }}>
              {r}
            </button>
          ))}
        </div>

        <div className="ck-row ck-ai-end">
          <div className="ck-field ck-grow ck-m-0">
            <label className="ck-label" htmlFor="sup-comprador">
              {modo === 'email' ? 'E-mail (ou parte dele)' : 'Código do ingresso'}
            </label>
            <input id="sup-comprador" className="ck-input" value={termo}
              onChange={(ev) => setTermo(ev.target.value)}
              placeholder={modo === 'email' ? 'maria@' : 'PP-XXXX-XXXX'}
              autoComplete="off" spellCheck="false" />
          </div>
          <button className={`ck-btn ck-btn--primary ${carregando ? 'is-loading' : ''}`} disabled={carregando}>
            {carregando ? 'Buscando…' : 'Buscar'}
          </button>
        </div>
      </form>

      {erro && <ErrorBox>{erro}</ErrorBox>}

      {res && !res.encontrado && (
        <p className="pp-muted ck-t-support ck-mt-4">
          Nada encontrado. Confira se o e-mail é o mesmo da compra — muita gente
          compra com um endereço e é cobrada em outro.
        </p>
      )}

      {res?.ingresso && (
        <div className="ck-caixa ck-mt-4">
          <div className="ck-label">Ingresso {res.ingresso.code}</div>
          <div className="ck-t-body ck-mt-2">{res.ingresso.evento} · {res.ingresso.produtora}</div>
          <div className="ck-meta">
            {res.ingresso.lote ?? 'lote não informado'}
            {res.ingresso.titular ? ` · ${res.ingresso.titular}` : ''}
            {' · '}
            {res.ingresso.checked_in_at
              ? `entrou em ${dateTime(res.ingresso.checked_in_at)}`
              : 'ainda não entrou'}
          </div>
        </div>
      )}

      {res?.pessoas?.map((f) => (
        <div key={f.pessoa.id} className="ck-mt-4">
          <div className="ck-between ck-ai-start">
            <div>
              <div className="ck-t-section">{f.pessoa.nome ?? 'sem nome no cadastro'}</div>
              <div className="ck-meta">
                {f.pessoa.email}{f.pessoa.telefone ? ` · ${f.pessoa.telefone}` : ''}
              </div>
            </div>
            <span className="ck-t-label">{f.pedidos.length} pedido(s)</span>
          </div>

          {f.pedidos.length === 0 ? (
            <p className="pp-muted ck-t-support ck-mt-3">
              A conta existe, mas nunca comprou. Se a pessoa garante que comprou,
              o pedido está em outro e-mail.
            </p>
          ) : (
            <div className="ck-mt-3">
              {f.pedidos.map((p) => (
                <div key={p.id} className={`ck-linha ${p.revertido_em ? 'ck-item--falha' : ''}`}>
                  <div className="ck-grow">
                    <div className="ck-t-body">
                      {p.evento ?? 'evento removido'}
                      <span className={`ck-badge ck-ml-2 ${p.status === 'paid' ? 'pp-badge--success' : p.status === 'refunded' ? 'pp-badge--red' : 'pp-badge--neutral'}`}>
                        {p.status}
                      </span>
                    </div>
                    <div className="ck-meta">
                      {p.produtora ? `${p.produtora} · ` : ''}
                      {p.pago_em ? `pago em ${dateTime(p.pago_em)}` : `criado em ${dateTime(p.criado_em)}`}
                      {p.cupom ? ` · cupom ${p.cupom}` : ''}
                      {p.revertido_em ? ` · revertido (${p.tipo_reversao ?? 'estorno'})` : ''}
                    </div>

                    {p.ingressos.length > 0 && (
                      <div className="ck-meta ck-mt-2">
                        {p.ingressos.map((i) => (
                          <span key={i.code} className="ck-cod ck-mr-2">
                            {i.code}{i.checked_in_at ? ' ✓' : ''}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* "Não recebi o e-mail" se responde com fato, não com achismo. */}
                    {p.entrega && (
                      <div className="ck-meta">
                        e-mail {p.entrega.status === 'sent' ? 'enviado' : p.entrega.status} para {p.entrega.para}
                        {p.entrega.erro ? ` · ${p.entrega.erro}` : ''}
                      </div>
                    )}

                    {/* A referência que a produtora leva ao provedor na contestação. */}
                    {p.pagamento_externo && (
                      <div className="ck-meta"><span className="ck-cod">{p.pagamento_externo}</span></div>
                    )}
                  </div>
                  <div className="ck-t-money">{brl(p.total_cents)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}

export default function Suporte() {
  const [state, setState] = useState({ status: 'loading' });
  const [q, setQ] = useState('');
  const [selecionada, setSelecionada] = useState(null); // id da org
  const buscaRef = useRef(null);

  useEffect(() => {
    let vivo = true;
    Promise.all([
      api.platformOrgs(),
      api.platformActivity(),
      api.platformBilling(),
      // Divergência de ledger é alerta lateral: se ESSA consulta cair, o
      // suporte ainda precisa conseguir atender. Só ela degrada em silêncio.
      api.platformFraud().catch(() => []),
    ])
      .then(([orgs, feed, billing, drifts]) => {
        if (vivo) setState({ status: 'ok', orgs, feed, billing, drifts });
      })
      .catch((e) => { if (vivo) setState({ status: 'error', message: e.message }); });
    return () => { vivo = false; };
  }, []);

  const dados = state.status === 'ok' ? state : null;

  // Cruza cadastro (orgs) com cobrança (billing): a ficha de suporte precisa
  // dos dois — quem é a produtora E qual taxa/repasse vale pra ela hoje.
  const fichas = useMemo(() => {
    if (!dados) return [];
    const cobranca = new Map((dados.billing.organizations ?? []).map((o) => [o.id, o]));
    return dados.orgs.map((o) => ({ ...o, cobranca: cobranca.get(o.id) ?? null }));
  }, [dados]);

  const termo = norm(q);
  const orgsFiltradas = useMemo(() => (
    !termo ? fichas : fichas.filter((o) => [o.name, o.slug, o.owner_email, o.city].some((c) => norm(c).includes(termo)))
  ), [fichas, termo]);

  const feedFiltrado = useMemo(() => {
    if (!dados) return [];
    return !termo ? dados.feed : dados.feed.filter((i) => norm(i.title).includes(termo) || norm(i.detail).includes(termo));
  }, [dados, termo]);

  const org = fichas.find((o) => o.id === selecionada) ?? null;

  /**
   * Movimentos da produtora selecionada.
   *
   * O feed traz PAGAMENTO com o título do evento e nada mais — o nome da
   * produtora só aparece nos itens de kind 'event' ("Evento · Produtora").
   * Cruzando os dois dá pra ligar o pagamento à produtora sem inventar
   * vínculo: primeiro descobre os eventos dela que estão no feed, depois puxa
   * os pagamentos daqueles eventos.
   */
  const movimentos = useMemo(() => {
    if (!dados || !org) return [];
    const alvo = norm(org.name);
    const titulos = new Set(
      dados.feed
        .filter((i) => i.kind === 'event' && norm(i.detail).includes(alvo))
        .map((i) => norm(i.detail.split('·')[0])),
    );
    return dados.feed.filter((i) => norm(i.detail).includes(alvo) || titulos.has(norm(i.detail)));
  }, [dados, org]);

  // Divergência de ledger é a causa real de "meu saldo sumiu" — se existir uma
  // aberta, o suporte precisa ver ANTES de prometer qualquer coisa ao cliente.
  const driftsFiltrados = useMemo(() => {
    if (!dados) return [];
    return !termo ? dados.drifts : dados.drifts.filter((d) => norm(d.event).includes(termo));
  }, [dados, termo]);

  if (state.status === 'loading') return <AdmShell where="Consulta de suporte"><Loading /></AdmShell>;
  if (state.status === 'error') return <AdmShell where="Consulta de suporte"><ErrorBox>{state.message}</ErrorBox></AdmShell>;

  return (
    <AdmShell where="Consulta de suporte · só dado real da plataforma">
      <div className="pp-stack pp-stack-5 pp-reveal">
        <div>
          <div className="adm-eyebrow ck-c-cyan">Suporte</div>
          <div className="adm-h1">
            Contexto para <span className="accent ck-c-cyan">responder</span>
          </div>
          <p className="pp-muted ck-m-0 ck-mt-1 ck-w-mid">
            Quem é a produtora, qual taxa vale, se o repasse é automático e o que
            acabou de acontecer de dinheiro. Sem inbox e sem SLA — o backend não
            tem ticket, e painel que inventa número é pior que painel que falta.
          </p>
        </div>

        {/* "Cadê meu ingresso?" é a ligação que o atendimento mais recebe, e por
            isso ela vem antes de tudo nesta tela. Dois caminhos porque são os
            dois que a pessoa do outro lado tem: ou lembra o e-mail da compra,
            ou está com o print do QR na mão. */}
        <BuscaDoComprador />

        <form role="search" onSubmit={(e) => e.preventDefault()} className="pp-stack pp-stack-1 ck-w-form">
          <label className="pp-label" htmlFor="busca-suporte">Buscar</label>
          <div className="pp-inputwrap">
            <Icon name="search" size={16} />
            <input
              id="busca-suporte"
              ref={buscaRef}
              className="pp-input"
              type="search"
              autoComplete="off"
              placeholder="Produtora, e-mail do dono, cidade ou evento"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <p className="pp-muted-2 ck-t-support ck-m-0">
            {orgsFiltradas.length} produtora{orgsFiltradas.length === 1 ? '' : 's'} ·{' '}
            {feedFiltrado.length} movimento{feedFiltrado.length === 1 ? '' : 's'} nos últimos 40 registros
          </p>
        </form>

        {/* Divergência aberta é interrupção: aparece antes de qualquer resposta. */}
        {driftsFiltrados.length > 0 && (
          <div className="adm-panel ck-panel--red">
            <div className="pp-row">
              <Icon name="scan" size={16} />
              <strong>
                {driftsFiltrados.length} carteira{driftsFiltrados.length === 1 ? '' : 's'} com saldo divergente do ledger
              </strong>
            </div>
            <p className="pp-muted ck-t-support ck-m-0 ck-mt-1 ck-mb-3">
              Antes de prometer devolução ou recarga ao cliente, confira aqui — o saldo exibido no app pode não bater.
            </p>
            <table className="ck-table">
              <thead>
                <tr>
                  <th scope="col">Evento</th>
                  <th scope="col" className="num">Saldo</th>
                  <th scope="col" className="num">Ledger</th>
                  <th scope="col" className="num">Drift</th>
                </tr>
              </thead>
              <tbody>
                {driftsFiltrados.map((d) => (
                  <tr key={d.wallet_id}>
                    <td>{d.event}</td>
                    <td className="num pp-mono">{brl(d.balance_cents)}</td>
                    <td className="num pp-mono">{brl(d.ledger_cents)}</td>
                    <td className="num"><span className="ck-badge ck-badge--danger">{brl(d.drift_cents)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="ck-duo">
          {/* Coluna de resultados — o "inbox" do mockup, com o que existe. */}
          <div className="adm-panel">
            <div className="pp-between">
              <strong className="ck-display ck-t-body">Produtoras</strong>
              <span className="pp-mono pp-muted-2 ck-t-support">{orgsFiltradas.length}</span>
            </div>

            {orgsFiltradas.length === 0 ? (
              <div className="pp-empty ck-py-6">
                <div className="pp-empty__icon"><Icon name="search" size={26} /></div>
                <div className="pp-empty__title">Nada com “{q}”</div>
                <p>A busca cobre nome, slug, e-mail do dono e cidade.</p>
                <button type="button" className="ck-btn ck-btn--glass ck-btn--sm" onClick={() => { setQ(''); buscaRef.current?.focus(); }}>
                  Limpar busca
                </button>
              </div>
            ) : (
              <ul className="pp-stack pp-stack-1 ck-lista ck-mt-3">
                {orgsFiltradas.map((o) => {
                  const ativa = o.id === selecionada;
                  return (
                    <li key={o.id}>
                      <button
                        type="button"
                        aria-pressed={ativa}
                        onClick={() => setSelecionada(ativa ? null : o.id)}
                        className={`ck-opcao--lista ${ativa ? 'is-on' : ''}`}
                      >
                        <span className="ck-block ck-w-semi ck-t-support">{o.name}</span>
                        <span className="pp-mono pp-muted-2 ck-meta">
                          {o.owner_email}
                        </span>
                        <span className="pp-muted-2 ck-meta">
                          {o.city} · {o.events} evento{o.events === 1 ? '' : 's'} · {brl(o.gmv_cents)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Ficha da produtora — o painel de detalhe do mockup. */}
          <div className="adm-panel">
            {!org ? (
              <div className="pp-empty">
                <div className="pp-empty__icon"><Icon name="users" size={30} /></div>
                <div className="pp-empty__title">Escolha uma produtora</div>
                <p>A ficha mostra dono, taxa vigente, forma de repasse e os movimentos recentes ligados a ela.</p>
                <button type="button" className="ck-btn ck-btn--primary ck-btn--sm" onClick={() => buscaRef.current?.focus()}>
                  <Icon name="search" size={15} /> Buscar produtora
                </button>
              </div>
            ) : (
              <div className="pp-stack pp-stack-3">
                <div className="pp-between ck-ai-start">
                  <div>
                    <div className="ck-display ck-w-bold ck-t-section">{org.name}</div>
                    <div className="pp-mono pp-muted ck-meta">
                      /{org.slug} · desde {dateTime(org.created_at)}
                    </div>
                  </div>
                  <button type="button" className="ck-btn ck-btn--glass ck-btn--sm" onClick={() => setSelecionada(null)}>
                    Fechar ficha
                  </button>
                </div>

                <div className="adm-kpis ck-cols-4">
                  <div className="adm-kpi ck-k--cyan">
                    <div className="l">Eventos</div><div className="v">{org.events}</div>
                  </div>
                  <div className="adm-kpi ck-k--pulse">
                    <div className="l">GMV</div><div className="v">{brl(org.gmv_cents)}</div>
                  </div>
                  <div className="adm-kpi ck-k--amber">
                    <div className="l">Taxa vigente</div>
                    <div className="v">
                      {org.cobranca
                        ? `${org.cobranca.usa_padrao ? state.billing.default_fee_percent : org.cobranca.fee_percent}%`
                        : '—'}
                    </div>
                  </div>
                  <div className="adm-kpi ck-k--violet">
                    <div className="l">Cidade</div><div className="v ck-t-section">{org.city}</div>
                  </div>
                </div>

                <div className="pp-stack pp-stack-1">
                  <div className="pp-row">
                    <span className="ck-badge">contato</span>
                    <span className="pp-mono">{org.owner_email}</span>
                  </div>
                  <div className="pp-row">
                    <span className="ck-badge">taxa</span>
                    <span className="ck-t-support">
                      {org.cobranca?.usa_padrao === false
                        ? `negociada em ${org.cobranca.fee_percent}%`
                        : `padrão da plataforma (${state.billing.default_fee_percent}%)`}
                    </span>
                  </div>
                  {/* Sem carteira Asaas não há split: o dinheiro fica na conta da
                      plataforma e o repasse vira transferência manual. É a
                      primeira coisa a checar quando a produtora reclama que
                      "não caiu". */}
                  <div className="pp-row">
                    <span className="ck-badge">repasse</span>
                    <span className={`ck-t-support ${org.cobranca?.repasse_automatico ? 'ck-c-fg' : 'ck-c-amber'}`}>
                      {org.cobranca?.repasse_automatico
                        ? 'automático — split na carteira Asaas da produtora'
                        : 'manual — sem carteira Asaas, a venda inteira fica na conta da plataforma'}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="pp-between">
                    <strong className="ck-t-support">Movimentos recentes</strong>
                    <span className="pp-mono pp-muted-2 ck-t-support">{movimentos.length}</span>
                  </div>
                  <p className="pp-muted-2 ck-t-support ck-m-0 ck-mt-1 ck-mb-2">
                    Vem da trilha da plataforma, que guarda os últimos 40 registros globais —
                    movimento mais antigo que isso não aparece aqui.
                  </p>
                  {movimentos.length === 0 ? (
                    <p className="pp-muted ck-t-support">
                      Nenhum movimento desta produtora nos últimos 40 registros da plataforma.
                    </p>
                  ) : (
                    <ul className="pp-stack pp-stack-1 ck-lista">
                      {movimentos.map((m, i) => <Movimento key={`${m.at}-${i}`} item={m} />)}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trilha global filtrada: o "paguei e não chegou" começa aqui — dá pra
            ver se o pagamento daquele evento entrou nos últimos minutos. */}
        <div className="adm-panel">
          <div className="pp-between">
            <div>
              <strong className="ck-display ck-t-body">Últimos movimentos da plataforma</strong>
              <p className="pp-muted ck-t-support ck-m-0 ck-mt-1">
                Pagamentos, reembolsos, eventos e produtoras — os 40 mais recentes, filtrados pela busca.
              </p>
            </div>
            <span className="pp-mono pp-muted-2 ck-t-support">{feedFiltrado.length}</span>
          </div>

          {feedFiltrado.length === 0 ? (
            <div className="pp-empty ck-py-6">
              <div className="pp-empty__icon"><Icon name="receipt" size={26} /></div>
              <div className="pp-empty__title">{q ? `Nenhum movimento com “${q}”` : 'Nenhum movimento ainda'}</div>
              <p>{q ? 'O feed guarda só os 40 registros mais recentes da plataforma.' : 'Assim que houver venda, ela aparece aqui.'}</p>
              {q && (
                <button type="button" className="ck-btn ck-btn--glass ck-btn--sm" onClick={() => { setQ(''); buscaRef.current?.focus(); }}>
                  Limpar busca
                </button>
              )}
            </div>
          ) : (
            <ul className="pp-stack pp-stack-1 ck-lista ck-mt-3">
              {feedFiltrado.map((m, i) => <Movimento key={`${m.at}-${i}`} item={m} />)}
            </ul>
          )}
        </div>
      </div>
    </AdmShell>
  );
}

function Movimento({ item }) {
  const k = KIND[item.kind] ?? KIND.event;
  return (
    <li className="ck-feed__row ck-ai-start">
      {/* ck-feed__ic nasce verde (pulse); a cor do tipo entra por variável de
          token, nunca por hex — cada tipo de movimento tem a sua. */}
      <span className={`ck-feed__ic ck-feed__ic--neutro ck-c-${k.tom}`} aria-hidden="true">
        <Icon name={k.icon} size={16} />
      </span>
      <span className="pp-mono ck-hidden ck-sr">{k.label}</span>
      <span className="pp-grow">
        <span className="ck-block ck-w-semi ck-t-support">{item.title}</span>
        <span className="pp-muted ck-meta">{item.detail}</span>
      </span>
      <span className="ck-right ck-shrink0">
        {item.amount_cents != null && (
          <span className={`pp-mono ck-block ck-w-bold ck-t-support ${item.kind === 'refund' ? 'ck-c-pink' : 'ck-c-pulse'}`}>
            {brl(item.amount_cents)}
          </span>
        )}
        <span className="pp-mono pp-muted-2 ck-meta">{dateTime(item.at)}</span>
      </span>
    </li>
  );
}
