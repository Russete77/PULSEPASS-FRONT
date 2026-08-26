import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Shell, Loading, ErrorBox, OpsBack } from '../components/Shell.jsx';
import { api } from '../lib/api.js';
import { brl } from '../lib/format.js';

/**
 * AO VIVO — o painel de operação da noite.
 *
 * Responde a UMA pergunta: "como está a noite AGORA?". Cada estação já tem a
 * sua tela (porta, cozinha, salão, fechamento), mas quem coordena precisava
 * abrir cinco abas para saber se a casa está cheia, se o bar afundou e se
 * ainda tem caixa aberto. Aqui isso é uma tela só, que se atualiza sozinha.
 *
 * Do LiveMapScreen veio a ESTRUTURA (barra de estado no topo, faixa de
 * números, painéis de zona), não a planta baixa: `event_tables` guarda só
 * `position` (um inteiro de ordenação) — não há coordenada x/y de mesa nem
 * polígono de setor no banco. Desenhar o mapa exigiria campos que não
 * existem, então as mesas se organizam por ÁREA (`event_tables.area`), que é
 * real e é como a casa fala ("camarote", "mezanino").
 *
 * Também ficaram de fora, por falta de dado e não de espaço:
 *   · "tocando agora / próximo artista" — não há tabela de line-up/setlist;
 *     faltaria algo como `event_lineup(artista, inicia_em, palco)`;
 *   · pins de pessoas e "amigos aqui" — não há posição de ninguém dentro da
 *     casa; o gate registra passagem, não localização;
 *   · legenda de zonas (palco/bar/banheiro) — não existe taxonomia de zona
 *     do local, só a `area` das mesas.
 *
 * Permissões: cada seção vem de um endpoint com exigência própria (porta,
 * bar, gerência). Por isso o carregamento é tolerante — a seção que o
 * servidor negar simplesmente não aparece, em vez de derrubar a tela toda.
 */

/** 10s: são cinco consultas por ciclo. Mais rápido que isso não muda decisão
 *  nenhuma da operação e só multiplica carga no banco no pico da noite. */
const INTERVALO_MS = 10_000;

/** Acima disto a fila do bar está afundando — mesmo limite da tela da cozinha. */
const LIMITE_ATENCAO = 8;
const LIMITE_ATRASO = 12;

/** Janela do ritmo de entrada. Mais que isso deixa de descrever "agora". */
const JANELA_RITMO_MS = 15 * 60_000;

/**
 * Espera em linguagem de gente. Minuto serve para a fila da noite, que é a
 * leitura normal desta tela; mas pedido esquecido em aberto vira "7008 min",
 * e ninguém converte isso de cabeça no meio da operação — o número some de
 * tão grande, justo quando ele é o mais gritante da tela.
 */
function espera(min) {
  if (min == null) return '—';
  if (min < 90) return `${min} min`;
  const h = Math.round(min / 60);
  if (h < 36) return `${h}h`;
  return `${Math.round(h / 24)} dias`;
}
/** Abaixo de 1 minuto observado, qualquer taxa por minuto é ruído. */
const RITMO_MINIMO_MS = 60_000;

const relogio = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

/* O tempo de espera vira TOM, não cor escrita à mão. O cockpit tem seis
   tons com significado e um deles é sempre o certo — cor solta numa tela é
   como nasce o sétimo verde que ninguém sabe de onde veio. */
function tomDoTempo(min) {
  if (min == null) return 'dim';
  if (min >= LIMITE_ATRASO) return 'red';
  if (min >= LIMITE_ATENCAO) return 'amber';
  return null;
}

const minutosDesde = (iso) => {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? Math.max(0, Math.round((Date.now() - t) / 60000)) : null;
};

/** "3 h 12 min" — turno aberto há muito tempo é o sinal, não o relógio. */
function duracao(min) {
  if (min == null) return '—';
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')} min`;
}

function Kpi({ label, valor, detalhe, tom }) {
  return (
    <div className={`ck-kpi ${tom ? `ck-k--${tom}` : ''}`}>
      <div className="lbl">{label}</div>
      <div className={`val ${tom ? `ck-c-${tom}` : ''}`}>{valor}</div>
      {detalhe && <div className="d">{detalhe}</div>}
    </div>
  );
}

/** Painel com título, ação opcional no canto e conteúdo. */
function Painel({ titulo, sub, acao, children }) {
  return (
    <section className="ck-panel" aria-label={titulo}>
      <div className="ck-between ck-ai-start">
        <div>
          <h2 className="ck-panel__title">{titulo}</h2>
          {sub && <p className="ck-panel__sub">{sub}</p>}
        </div>
        {acao}
      </div>
      <div className="ck-mt-4">{children}</div>
    </section>
  );
}

function Vazio({ texto, cta }) {
  return (
    <div>
      <p className="pp-muted ck-t-support ck-m-0">{texto}</p>
      {cta && <div className="ck-mt-3">{cta}</div>}
    </div>
  );
}

export default function AoVivo() {
  const { id } = useParams();

  // Cada fatia guarda o próprio dado. `null` = ainda não veio ou foi negada
  // pelo servidor — e nesse caso a seção some, nunca vira zero na tela.
  const [ocupacao, setOcupacao] = useState(null);
  const [fila, setFila] = useState(null);
  const [mesas, setMesas] = useState(null);
  const [turnos, setTurnos] = useState(null);
  const [venda, setVenda] = useState(null);

  const [status, setStatus] = useState('loading');
  const [erro, setErro] = useState('');
  const [hora, setHora] = useState(relogio());

  // Amostras de `total_entries` ao longo da sessão. O RPC de lotação devolve
  // um acumulado, não uma série — então o ritmo de entrada é medido AQUI,
  // comparando leituras. É por isso que ele só aparece depois de um tempo de
  // tela aberta, e o rótulo diz exatamente isso: inventar um "ritmo" antes de
  // ter duas leituras seria número decorativo.
  const amostras = useRef([]);
  const [ritmo, setRitmo] = useState(null);   // { entradas, minutos, porMinuto }

  const timer = useRef(null);

  const carregar = useCallback(async () => {
    const [occ, kds, waiter, trn, dash] = await Promise.allSettled([
      api.occupancy(id),
      api.kds(id),
      api.waiterBoard(id),
      api.listarTurnos(id),
      api.dashboard(id),
    ]);

    const pega = (r) => (r.status === 'fulfilled' ? r.value : null);
    const o = pega(occ);
    setOcupacao(o);
    setFila(pega(kds));
    setMesas(pega(waiter));
    setTurnos(pega(trn));
    setVenda(pega(dash));
    setHora(relogio());

    if (o?.total_entries != null) {
      const agora = Date.now();
      const lista = [...amostras.current, { t: agora, entradas: o.total_entries }]
        .filter((a) => agora - a.t <= JANELA_RITMO_MS);
      amostras.current = lista;
      const base = lista[0];
      const decorrido = agora - base.t;
      if (lista.length >= 2 && decorrido >= RITMO_MINIMO_MS) {
        const entradas = o.total_entries - base.entradas;
        const minutos = decorrido / 60000;
        setRitmo({ entradas, minutos: Math.round(minutos), porMinuto: entradas / minutos });
      }
    }

    // Só é erro de verdade quando NADA respondeu: uma negativa isolada é
    // falta de permissão para aquela estação, e isso é normal.
    if ([occ, kds, waiter, trn, dash].every((r) => r.status === 'rejected')) {
      setErro(occ.reason?.message ?? 'Não foi possível carregar o painel.');
      setStatus('error');
      return;
    }
    setErro('');
    setStatus('done');
  }, [id]);

  useEffect(() => {
    carregar();
    timer.current = setInterval(carregar, INTERVALO_MS);
    return () => clearInterval(timer.current);
  }, [carregar]);

  if (status === 'loading') return <Shell><Loading label="Ligando o painel da noite…" /></Shell>;
  if (status === 'error') return <Shell><OpsBack eventId={id} /><ErrorBox>{erro}</ErrorBox></Shell>;

  // ── Derivações da fila do bar (mesmas regras da tela da cozinha) ──
  const abertos = fila?.filter((p) => p.status !== 'ready') ?? [];
  const prontos = fila?.filter((p) => p.status === 'ready') ?? [];
  const atrasados = abertos.filter((p) => (p.esperando_min ?? 0) >= LIMITE_ATRASO).length;
  const esperaMedia = abertos.length
    ? Math.round(abertos.reduce((s, p) => s + (p.esperando_min ?? 0), 0) / abertos.length)
    : null;
  const esperaMax = abertos.length ? Math.max(...abertos.map((p) => p.esperando_min ?? 0)) : null;
  // De onde vêm os pedidos agora — a "zona" que o bar consegue enxergar.
  const porOrigem = (fila ?? []).reduce((acc, p) => {
    const k = p.origem?.tipo ?? 'app';
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

  // ── Mesas agrupadas por área (o "por zonas" que substitui a planta) ──
  const areas = [];
  if (mesas) {
    const mapa = new Map();
    for (const m of mesas) {
      const chave = m.area || 'Sem área';
      if (!mapa.has(chave)) mapa.set(chave, { area: chave, total: 0, ocupadas: 0, prontas: 0, consumo_cents: 0 });
      const a = mapa.get(chave);
      a.total += 1;
      if (m.pedidos_abertos > 0) a.ocupadas += 1;
      if (m.prontos > 0) a.prontas += 1;
      a.consumo_cents += m.consumo_cents ?? 0;
      mapa.set(chave, a);
    }
    areas.push(...[...mapa.values()].sort((a, b) => b.ocupadas - a.ocupadas || a.area.localeCompare(b.area, 'pt-BR')));
  }
  const mesasOcupadas = mesas?.filter((m) => m.pedidos_abertos > 0) ?? [];
  const consumoAberto = mesasOcupadas.reduce((s, m) => s + (m.consumo_cents ?? 0), 0);

  // ── Caixas ainda abertos ──
  const caixasAbertos = turnos?.filter((t) => !t.fechado_em) ?? [];

  // ── Lotação ──
  const dentro = ocupacao?.inside ?? null;
  const vendidos = ocupacao?.tickets_sold ?? null;
  const pctPresenca = dentro != null && vendidos > 0 ? Math.round((dentro / vendidos) * 100) : null;

  // Renomeado (não `m`) porque `m` já é o parâmetro dos maps de mesa acima —
  // duas coisas diferentes com o mesmo nome no mesmo arquivo é onde o bug mora.
  const metricas = venda?.metrics;

  return (
    <Shell>
      <OpsBack eventId={id} />

      {/* Barra de estado — o cabeçalho do mockup: o que está acontecendo,
          um alerta quando há, e o relógio. */}
      <div className="ck-kds__topo">
        <div className="ck-flex ck-gap-2 pp-wrap ck-ai-center">
          <span className="ck-badge ck-badge--live">
            <span className="pp-pulse-dot" /> ao vivo
          </span>
          {atrasados > 0 && (
            <span className="ck-badge ck-badge--danger">
              bar · {atrasados} {atrasados === 1 ? 'pedido atrasado' : 'pedidos atrasados'} (+{LIMITE_ATRASO} min)
            </span>
          )}
          {caixasAbertos.length > 0 && (
            <span className="ck-badge ck-badge--warning">
              {caixasAbertos.length} {caixasAbertos.length === 1 ? 'caixa aberto' : 'caixas abertos'}
            </span>
          )}
        </div>
        <span className="ck-kds__relogio" aria-label="Hora atual">{hora}</span>
      </div>

      <h1 className="ck-h1 ck-mt-4">Como está a noite</h1>

      {/* Atalhos para a estação que resolve cada problema visto aqui. */}
      <nav aria-label="Estações da operação" className="ck-tabs ck-mt-3">
        <Link to={`/eventos/${id}/porta`} className="ck-tab">Porta</Link>
        <Link to={`/eventos/${id}/cozinha`} className="ck-tab">Cozinha</Link>
        <Link to={`/eventos/${id}/garcom`} className="ck-tab">Salão</Link>
        <Link to={`/eventos/${id}/pdv`} className="ck-tab">PDV</Link>
        <Link to={`/eventos/${id}/fechamento`} className="ck-tab">Fechamento</Link>
      </nav>

      {erro && <ErrorBox>{erro}</ErrorBox>}

      {/* ── LOTAÇÃO ── */}
      {ocupacao ? (
        <>
          <div className="ck-kpis ck-mt-6">
            <Kpi
              label="dentro agora"
              valor={dentro ?? '—'}
              tom="pulse"
              detalhe={pctPresenca != null ? `${pctPresenca}% de quem tem ingresso` : null}
            />
            <Kpi label="já saíram" valor={ocupacao.left ?? 0} tom="violet"
              detalhe="podem voltar (reentrada)" />
            <Kpi label="entradas totais" valor={ocupacao.total_entries ?? 0} tom="cyan"
              detalhe="conta reentrada" />
            <Kpi label="ingressos válidos" valor={vendidos ?? '—'}
              detalhe="teto da lotação" />
          </div>

          {pctPresenca != null && (
            <div className="ck-bar ck-mt-4 ck-w-mid">
              <div className="track">
                {/* A barra é o mesmo número do KPI, desenhado. Passa de 100%
                    só se a casa vender e liberar mais gente do que emitiu —
                    por isso o clamp, para a barra não estourar o trilho. */}
                <i className="fill" style={{ width: `${Math.min(100, pctPresenca)}%` }} />
              </div>
              <span className="pp-mono ck-t-support pp-muted">
                {dentro} de {vendidos}
              </span>
            </div>
          )}

          {ritmo && (
            <p className="pp-mono ck-t-support pp-muted ck-mt-3">
              ritmo de entrada:{' '}
              <b className="ck-c-fg">{ritmo.porMinuto.toFixed(1)}/min</b>
              {' '}· {ritmo.entradas} {ritmo.entradas === 1 ? 'entrada' : 'entradas'} nos últimos {ritmo.minutos} min
              {' '}<span className="pp-muted-2">(medido desde que esta tela abriu)</span>
            </p>
          )}
        </>
      ) : (
        <div className="ck-panel ck-mt-6">
          <Vazio texto="A lotação não está disponível para o seu acesso. Ela vem da porta — peça o papel de porta ou gerência a quem administra o evento." />
        </div>
      )}

      <div className="ck-duo ck-mt-6">
        {/* ── FILA DO BAR ── */}
        {fila && (
          <Painel
            titulo="Fila do bar"
            sub="pedidos em aberto, do mais antigo ao mais novo"
            acao={<Link to={`/eventos/${id}/cozinha`} className="ck-btn ck-btn--glass ck-btn--sm">Abrir cozinha</Link>}
          >
            {fila.length === 0 ? (
              <Vazio
                texto="Nenhum pedido em aberto. Assim que alguém pedir no app, no PDV ou pelo garçom, aparece aqui."
                cta={<Link to={`/eventos/${id}/cardapio`} className="ck-btn ck-btn--glass ck-btn--sm">Conferir o cardápio</Link>}
              />
            ) : (
              <>
                <div className="ck-kpis ck-kpis--painel">
                  <Kpi label="em aberto" valor={abertos.length} tom="pulse" />
                  <Kpi label="espera média" valor={espera(esperaMedia)}
                    tom={tomDoTempo(esperaMedia)} />
                  <Kpi label="prontos p/ retirar" valor={prontos.length} tom="violet" />
                </div>

                {esperaMax != null && (
                  <p className="pp-mono ck-t-support pp-muted ck-mt-3">
                    o mais antigo espera há <b className={`ck-c-${tomDoTempo(esperaMax) ?? 'fg2'}`}>{espera(esperaMax)}</b>
                  </p>
                )}

                {/* De onde vem a pressão: mesa exige entrega, praça e app
                    esperam retirada. Muda quem a casa desloca. */}
                <div className="ck-flex ck-gap-2 pp-wrap ck-mt-4">
                  {porOrigem.mesa > 0 && <span className="ck-badge">mesa · {porOrigem.mesa}</span>}
                  {porOrigem.praca > 0 && <span className="ck-badge">praça de bar · {porOrigem.praca}</span>}
                  {porOrigem.app > 0 && <span className="ck-badge">app · {porOrigem.app}</span>}
                </div>
              </>
            )}
          </Painel>
        )}

        {/* ── CAIXAS ── */}
        {turnos && (
          <Painel
            titulo="Caixas abertos"
            sub="turno aberto é dinheiro sem conferência"
            acao={<Link to={`/eventos/${id}/fechamento`} className="ck-btn ck-btn--glass ck-btn--sm">Fechamento</Link>}
          >
            {caixasAbertos.length === 0 ? (
              <Vazio
                texto={turnos.length === 0
                  ? 'Nenhum turno de caixa foi aberto neste evento.'
                  : 'Todos os turnos já foram fechados e conferidos.'}
                cta={<Link to={`/eventos/${id}/fechamento`} className="ck-btn ck-btn--glass ck-btn--sm">Ver a conferência</Link>}
              />
            ) : (
              <ul className="ck-lista">
                {caixasAbertos.map((t) => {
                  const min = minutosDesde(t.aberto_em);
                  return (
                    <li key={t.id} className="ck-feed__row">
                      <div className="pp-grow ck-min0">
                        <div className="ck-w-semi ck-t-support">{t.operador}</div>
                        <div className="pp-muted-2 ck-t-support">
                          {t.praca ? `${t.praca} · ` : ''}fundo {brl(t.fundo_cents ?? 0)}
                        </div>
                      </div>
                      <span className="pp-mono ck-t-support pp-muted">
                        aberto há {duracao(min)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Painel>
        )}
      </div>

      {/* ── MESAS POR ÁREA ── */}
      {mesas && (
        <div className="ck-mt-6">
          <Painel
            titulo="Salão"
            sub="mesas por área — o banco não guarda a posição no mapa, só a área"
            acao={<Link to={`/eventos/${id}/garcom`} className="ck-btn ck-btn--glass ck-btn--sm">Abrir salão</Link>}
          >
            {mesas.length === 0 ? (
              <Vazio
                texto="Este evento não tem mesa cadastrada."
                cta={<Link to={`/eventos/${id}/camarotes`} className="ck-btn ck-btn--glass ck-btn--sm">Cadastrar camarotes e mesas</Link>}
              />
            ) : (
              <>
                <div className="ck-kpis ck-kpis--painel">
                  <Kpi label="mesas ocupadas" valor={`${mesasOcupadas.length}/${mesas.length}`} tom="pulse" />
                  <Kpi label="consumo em aberto" valor={brl(consumoAberto)} tom="cyan" />
                  <Kpi label="esperando entrega" valor={mesas.filter((x) => x.prontos > 0).length}
                    tom="violet" detalhe="mesa com prato pronto" />
                </div>

                <table className="ck-table ck-mt-4">
                  <caption className="ck-panel__sub ck-caption">
                    Ocupação por área
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Área</th>
                      <th scope="col" className="num">Ocupadas</th>
                      <th scope="col" className="num">Prontas</th>
                      <th scope="col" className="num">Consumo aberto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {areas.map((a) => (
                      <tr key={a.area}>
                        <td>{a.area}</td>
                        <td className="num">{a.ocupadas}/{a.total}</td>
                        <td className="num" style={a.prontas > 0 ? { color: 'var(--pp-violet)', fontWeight: 700 } : undefined}>
                          {a.prontas}
                        </td>
                        <td className="num">{brl(a.consumo_cents)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {mesasOcupadas.length > 0 && (
                  <div className="ck-mesas ck-mt-5">
                    {[...mesasOcupadas]
                      .sort((a, b) => b.prontos - a.prontos || b.consumo_cents - a.consumo_cents)
                      .slice(0, 6)
                      .map((mesa) => (
                        <div key={mesa.id} className={`ck-mesa ${mesa.prontos > 0 ? 'ck-mesa--pronta' : 'ck-mesa--ocupada'}`}>
                          <span className="ck-mesa__chip">{mesa.pedidos_abertos}</span>
                          <div className="ck-mesa__meio">
                            <div className="ck-mesa__nome">
                              {mesa.nome}
                              {mesa.area && <span className="ck-mesa__area"> · {mesa.area}</span>}
                            </div>
                            <div className="ck-mesa__itens">{mesa.itens.slice(0, 4).join(', ')}</div>
                          </div>
                          <div className="ck-mesa__fim">
                            {mesa.prontos > 0 && (
                              <span className="ck-mesa__badge">{mesa.prontos} pronto{mesa.prontos > 1 ? 's' : ''}</span>
                            )}
                            <span className="ck-mesa__valor">{brl(mesa.consumo_cents)}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </>
            )}
          </Painel>
        </div>
      )}

      {/* ── VENDA DA NOITE ── */}
      {metricas && (
        <div className="ck-mt-6">
          <Painel
            titulo="Venda da noite"
            sub="acumulado do evento, ingresso + bar"
            acao={<Link to={`/eventos/${id}/conciliacao`} className="ck-btn ck-btn--glass ck-btn--sm">Financeiro</Link>}
          >
            <div className="ck-kpis">
              <Kpi label="ingressos" valor={brl(metricas.ticket_revenue_cents)} tom="pulse"
                detalhe={`${metricas.orders_paid} ${metricas.orders_paid === 1 ? 'pedido pago' : 'pedidos pagos'}`} />
              <Kpi label="bar" valor={brl(metricas.bar_revenue_cents)} tom="cyan" />
              <Kpi label="total" valor={brl(metricas.total_revenue_cents)} tom="violet" />
              <Kpi label="check-in" valor={`${metricas.checked_in}/${metricas.tickets_sold}`}
                detalhe="ingressos emitidos" />
            </div>
          </Painel>
        </div>
      )}

      <p className="ck-live ck-mt-6">
        <span className="pp-pulse-dot" /> atualizando a cada {INTERVALO_MS / 1000}s
      </p>
    </Shell>
  );
}
