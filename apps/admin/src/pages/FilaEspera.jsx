import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Shell, Loading, ErrorBox, BackLink } from '../components/Shell.jsx';
import { Icon } from '@pulsepass/shared/Icon';
import { api } from '../lib/api.js';
import { dateTime } from '../lib/format.js';

/**
 * Fila de espera do evento.
 *
 * Serve pra produtora enxergar demanda reprimida: quantas pessoas quiseram
 * comprar depois do lote esgotar. É a informação que decide se vale abrir um
 * lote extra ou trocar de casa no próximo evento.
 *
 * Layout do design system (painel + coluna): a lista é o corpo, e ao lado
 * fica a leitura que a produtora realmente usa — QUAL lote tem gente esperando.
 * Essa quebra por lote sai dos próprios registros da fila, não é estimativa.
 */
const ESTADO = {
  waiting: { label: 'aguardando', cor: 'var(--pp-fg-3)', badge: 'ck-badge' },
  invited: { label: 'convidado', cor: 'var(--pp-cyan)', badge: 'ck-badge ck-badge--published' },
  converted: { label: 'comprou', cor: 'var(--pp-pulse)', badge: 'ck-badge ck-badge--published' },
  expired: { label: 'convite venceu', cor: 'var(--pp-amber)', badge: 'ck-badge ck-badge--draft' },
  cancelled: { label: 'cancelado', cor: 'var(--pp-fg-4)', badge: 'ck-badge' },
};

/** Filtros: só o que o backend devolve em `status`. */
const FILTROS = [
  { chave: 'todos', label: 'Todos' },
  { chave: 'waiting', label: 'Aguardando' },
  { chave: 'invited', label: 'Convidados' },
  { chave: 'converted', label: 'Compraram' },
];

const TONS = ['var(--pp-pulse)', 'var(--pp-violet)', 'var(--pp-cyan)', 'var(--pp-amber)', 'var(--pp-pink)'];

export default function FilaEspera() {
  const { id } = useParams();
  const [state, setState] = useState({ status: 'loading' });
  const [filtro, setFiltro] = useState('todos');

  const load = useCallback(async () => {
    try { setState({ status: 'ok', data: await api.eventWaitlist(id) }); }
    catch (e) { setState({ status: 'error', message: e.message }); }
  }, [id]);
  useEffect(() => { load(); }, [load]);

  const entries = state.data?.entries ?? [];

  // Demanda por lote: quem ainda espera, agrupado pelo lote que esgotou.
  // Sai de `ticket_tiers(name)` que vem junto de cada registro — nada é
  // inventado aqui, é contagem dos mesmos dados da lista.
  const porLote = useMemo(() => {
    const mapa = new Map();
    for (const e of entries) {
      if (e.status !== 'waiting') continue;
      const nome = e.ticket_tiers?.name ?? 'lote removido';
      const atual = mapa.get(nome) ?? { pessoas: 0, ingressos: 0 };
      atual.pessoas += 1;
      atual.ingressos += e.quantity ?? 1;
      mapa.set(nome, atual);
    }
    return [...mapa.entries()]
      .map(([nome, v]) => ({ nome, ...v }))
      .sort((a, b) => b.ingressos - a.ingressos);
  }, [entries]);

  if (state.status === 'loading') return <Shell><Loading /></Shell>;
  if (state.status === 'error') {
    return <Shell><BackLink to={`/eventos/${id}`} label="Dashboard" /><ErrorBox>{state.message}</ErrorBox></Shell>;
  }

  const { data } = state;
  const agora = Date.now();
  // Vencidos/cancelados não vêm somados do backend, mas estão na lista —
  // contar aqui é ler o mesmo dado, não estimar.
  const vencidos = entries.filter((e) => e.status === 'expired').length;
  const ingressosNaFila = entries
    .filter((e) => e.status === 'waiting')
    .reduce((s, e) => s + (e.quantity ?? 1), 0);

  const visiveis = filtro === 'todos' ? entries : entries.filter((e) => e.status === filtro);
  const maiorLote = porLote[0]?.ingressos || 1;

  return (
    <Shell>
      <BackLink to={`/eventos/${id}`} label="Dashboard" />
      <div className="ck-eyebrow">vendas · demanda reprimida</div>
      <h1 className="ck-h1">Fila de espera · <span className="pp-accent">quem ficou de fora.</span></h1>
      <p className="ck-sub">
        Quem tentou comprar depois do lote esgotar. Quando um pedido é reembolsado
        ou expira, os primeiros da fila são convidados automaticamente — com prazo,
        pra vaga não travar em quem não vai comprar.
      </p>

      {/* Fio de cor no topo de cada KPI: mesma leitura do painel do design
          system. Todos os números saem do endpoint da fila. */}
      <div className={`ck-kpis ${vencidos > 0 ? 'ck-cols-4' : 'ck-cols-3'}`}>
        <div className="ck-kpi ck-k--amber">
          <div className="lbl">Aguardando</div>
          <div className="val">{data.waiting}</div>
          <div className="d">{ingressosNaFila} ingresso{ingressosNaFila === 1 ? '' : 's'} pedidos</div>
        </div>
        <div className="ck-kpi ck-k--cyan">
          <div className="lbl">Convidados</div>
          <div className="val">{data.invited}</div>
          <div className="d">convite com prazo de 1h</div>
        </div>
        <div className="ck-kpi ck-k--pulse">
          <div className="lbl">Compraram</div>
          <div className={`val ${data.converted > 0 ? 'ck-c-pulse' : ''}`}>{data.converted}</div>
          <div className="d">vieram da fila</div>
        </div>
        {vencidos > 0 && (
          <div className="ck-kpi ck-k--dim">
            <div className="lbl">Convite venceu</div>
            <div className="val">{vencidos}</div>
            <div className="d">a vez passou pro próximo</div>
          </div>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="pp-empty ck-w-mid">
          <div className="pp-empty__icon"><Icon name="users" size={28} /></div>
          <div className="pp-empty__title">Ninguém na fila ainda</div>
          <p className="ck-m-0 ck-mb-4">
            A opção de entrar na fila só aparece pro cliente quando um lote esgota.
            Se ainda há ingresso à venda, é sinal de que a demanda está sendo atendida.
          </p>
          <Link to={`/eventos/${id}`} className="ck-btn ck-btn--glass ck-btn--sm">
            <Icon name="ticket" size={15} /> Ver lotes do evento
          </Link>
        </div>
      ) : (
        <div className="ck-duo ck-mt-5">
          <section className="ck-panel ck-p-0 ck-hidden" aria-label="Pessoas na fila de espera">
            <div className="pp-between pp-wrap ck-cabeca">
              <div>
                <div className="ck-panel__title">Na fila · {entries.length}</div>
                <p className="ck-panel__sub">ordem de chegada — o primeiro é o primeiro a ser convidado</p>
              </div>
              {/* Filtro por estado: com fila grande, "quem já foi convidado"
                  é a pergunta que a produtora faz o dia inteiro. */}
              <div className="ck-tabs" role="group" aria-label="Filtrar por situação">
                {FILTROS.map((f) => (
                  <button
                    key={f.chave}
                    type="button"
                    className={`ck-tab ${filtro === f.chave ? 'is-on' : ''}`}
                    aria-pressed={filtro === f.chave}
                    onClick={() => setFiltro(f.chave)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {visiveis.length === 0 ? (
              <p className="ck-empty">
                Ninguém nesta situação agora.
              </p>
            ) : visiveis.map((e, i) => {
              const st = ESTADO[e.status] ?? { label: e.status, cor: 'var(--pp-fg-3)', badge: 'ck-badge' };
              // Convite tem prazo: passado o prazo, a vez passa pro próximo.
              const restaMs = e.status === 'invited' && e.invite_expires_at
                ? new Date(e.invite_expires_at).getTime() - agora
                : null;
              const vencendo = restaMs != null && restaMs > 0 && restaMs < 15 * 60_000;
              return (
                <div
                  key={e.id}
                  className={`pp-row pp-wrap ck-fila__linha ${vencendo ? 'ck-fila__linha--vencendo' : ''}`}
                >
                  {/* A posição vem do banco (position), não do índice da tela:
                      filtro aplicado não pode renumerar a fila de ninguém. */}
                  <span className="pp-mono pp-num pp-muted-2 ck-fit--xs" aria-label={`Posição ${e.position ?? i + 1}`}>
                    {e.position ?? i + 1}º
                  </span>
                  <div className="ck-flex1 ck-fit">
                    <div className="ck-w-semi ck-t-support">{e.name || e.email}</div>
                    <div className="pp-muted-2 ck-meta">
                      {e.ticket_tiers?.name ?? 'lote'}
                      {e.quantity > 1 && ` · ${e.quantity} ingressos`}
                      {' · entrou em '}{dateTime(e.created_at)}
                    </div>
                  </div>
                  <span className={st.badge} style={{ color: st.cor }}>{st.label}</span>
                  {vencendo && (
                    <span className="pp-row pp-mono ck-gap-1 ck-c-amber ck-t-support">
                      <Icon name="clock" size={12} /> vence em {Math.max(1, Math.round(restaMs / 60_000))} min
                    </span>
                  )}
                </div>
              );
            })}
          </section>

          {/* Coluna de leitura: qual lote tem gente esperando. É o que responde
              "vale abrir lote extra?" — e só aparece se houver quem esperando. */}
          {porLote.length > 0 && (
            <aside className="ck-panel" aria-label="Demanda reprimida por lote">
              <div className="ck-eyebrow">Demanda por lote</div>
              <p className="ck-panel__sub ck-mb-4">
                ingressos pedidos por quem ainda aguarda
              </p>
              <div className="pp-stack pp-stack-3">
                {porLote.map((l, i) => {
                  const tom = TONS[i % TONS.length];
                  const pct = Math.max(4, (l.ingressos / maiorLote) * 100);
                  return (
                    <div key={l.nome}>
                      <div className="pp-between ck-mb-2">
                        <span className="pp-truncate ck-t-support ck-w-semi">{l.nome}</span>
                        <span className="pp-mono pp-num pp-muted ck-t-support">
                          {l.ingressos} ing · {l.pessoas} pess
                        </span>
                      </div>
                      <div className="ck-bar" style={{ '--k': tom }}>
                        <div className="track"><div className="fill" style={{ width: `${pct}%` }} /></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="pp-muted-2 ck-t-support ck-mt-4">
                Lote com fila cheia é lote que podia ter vendido mais. Abrir um lote
                extra dispara convite automático pra quem está esperando nele.
              </p>
            </aside>
          )}
        </div>
      )}
    </Shell>
  );
}
