import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Shell, Loading, ErrorBox, OpsBack } from '../components/Shell.jsx';
import { api } from '../lib/api.js';
import { brl } from '../lib/format.js';

/**
 * KDS — a tela da cozinha.
 *
 * Layout da KDSScreen do design system: barra de status no topo (fila, tempo
 * médio e relógio), pílulas de filtro por etapa e UMA grade de cards ordenada
 * por chegada — o card inteiro é tingido pelo estado, com o tempo como o
 * número maior e uma única ação embaixo. Não é uma lista de pedidos: é uma
 * fila com cronômetro.
 *
 * O mockup tem a pílula "Entregues"; ficou de fora porque o backend devolve
 * só o que está em aberto (paid/preparing/ready) — pedido entregue sai da
 * fila, que é exatamente o que a cozinha espera dele.
 *
 * Fica sem barra lateral de conteúdo extra: essa tela vive num monitor
 * pendurado na cozinha, e cada pixel gasto com navegação é um pedido a menos
 * visível.
 */

/** Acima de 12 minutos o card vira vermelho. É o limite que a casa aceita. */
const LIMITE_ATENCAO = 8;
const LIMITE_ATRASO = 12;

function corDoTempo(min) {
  if (min == null) return 'var(--pp-fg-3)';
  if (min >= LIMITE_ATRASO) return '#FF6B61';
  if (min >= LIMITE_ATENCAO) return 'var(--pp-amber)';
  return 'var(--pp-fg-2)';
}

/** O tempo e o rótulo que importam mudam com a etapa do pedido. */
const ETAPA = {
  paid: { titulo: 'Na fila', rotulo: 'em fila', tempo: (p) => p.esperando_min, acao: 'preparing', rotuloAcao: 'Iniciar preparo', tom: 'fila' },
  preparing: { titulo: 'Preparando', rotulo: 'no preparo', tempo: (p) => p.em_preparo_min ?? p.esperando_min, acao: 'ready', rotuloAcao: 'Marcar pronto', tom: 'preparo' },
  ready: { titulo: 'Prontos', rotulo: 'pronto há', tempo: (p) => p.pronto_ha_min ?? 0, acao: 'delivered', rotuloAcao: 'Entregar', tom: 'pronto' },
};

const FILTROS = [
  { key: 'todos', titulo: 'Todos' },
  { key: 'paid', titulo: 'Na fila' },
  { key: 'preparing', titulo: 'Preparando' },
  { key: 'ready', titulo: 'Prontos' },
];

const relogio = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

export default function Cozinha() {
  const { id } = useParams();
  const [fila, setFila] = useState([]);
  const [status, setStatus] = useState('loading');
  const [erro, setErro] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [ocupado, setOcupado] = useState(null);   // id do pedido em transição
  const [hora, setHora] = useState(relogio());
  const timer = useRef(null);

  const carregar = useCallback(async () => {
    try {
      setFila(await api.kds(id));
      setHora(relogio());
      setStatus('done');
      setErro('');
    } catch (e) { setErro(e.message); setStatus('error'); }
  }, [id]);

  useEffect(() => {
    carregar();
    // 8 segundos: a cozinha precisa ver o pedido novo quase na hora, e o
    // custo é uma consulta indexada com no máximo 120 linhas.
    timer.current = setInterval(carregar, 8000);
    return () => clearInterval(timer.current);
  }, [carregar]);

  async function avancar(pedido, para) {
    setOcupado(pedido.id);
    // Otimista: o card muda de cor na hora. Numa cozinha, esperar a rede
    // para ver o toque responder é o que faz a pessoa tocar de novo.
    setFila((f) => f.map((p) => (p.id === pedido.id ? { ...p, status: para } : p)));
    try {
      await api.advanceBarOrder(pedido.id, para);
      await carregar();
    } catch (e) {
      setErro(e.message);
      await carregar();      // desfaz o otimismo com a verdade do servidor
    } finally { setOcupado(null); }
  }

  if (status === 'loading') return <Shell><Loading label="Abrindo a cozinha…" /></Shell>;

  const contagem = (s) => fila.filter((p) => p.status === s).length;
  const atrasados = fila.filter((p) => (p.esperando_min ?? 0) >= LIMITE_ATRASO && p.status !== 'ready').length;
  // Tempo médio de espera da fila em aberto — derivado do que o backend
  // devolve, não inventado: é o número que diz se o turno está afundando.
  const abertos = fila.filter((p) => p.status !== 'ready');
  const tempoMedio = abertos.length
    ? Math.round(abertos.reduce((s, p) => s + (p.esperando_min ?? 0), 0) / abertos.length)
    : null;

  // A ordem é SEMPRE por chegada: o que entrou primeiro aparece primeiro.
  const visiveis = (filtro === 'todos' ? fila : fila.filter((p) => p.status === filtro))
    .slice()
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  return (
    <Shell>
      <OpsBack eventId={id} />

      {/* ── Barra de status (top bar do mockup) ── */}
      <div className="ck-kds__topo">
        <div className="ck-row" style={{ flexWrap: 'wrap' }}>
          <span className={`ck-badge ${atrasados > 0 ? 'ck-badge--danger' : 'ck-badge--warning'}`}>
            cozinha · {fila.length === 0 ? 'sem fila' : `${fila.length} pedido${fila.length > 1 ? 's' : ''} em aberto`}
          </span>
          {atrasados > 0 && (
            <span style={{ color: '#FF6B61', fontWeight: 700, fontSize: 'var(--pp-fs-14)' }}>
              {atrasados} {atrasados === 1 ? 'atrasado' : 'atrasados'} (+{LIMITE_ATRASO} min)
            </span>
          )}
        </div>
        <div className="ck-row">
          {tempoMedio != null && (
            <span className="pp-mono" style={{ fontSize: 'var(--pp-fs-14)', color: 'var(--pp-fg-3)' }}>
              espera média: <b style={{ color: corDoTempo(tempoMedio) }}>{tempoMedio} min</b>
            </span>
          )}
          <span className="ck-kds__relogio" aria-label="Hora atual">{hora}</span>
        </div>
      </div>

      {erro && <ErrorBox>{erro}</ErrorBox>}

      {/* ── Pílulas de filtro por etapa ── */}
      <div className="ck-tabs" style={{ marginTop: 14 }}>
        {FILTROS.map((f) => (
          <button key={f.key} className={`ck-tab ${filtro === f.key ? 'is-on' : ''}`}
            onClick={() => setFiltro(f.key)}>
            {f.titulo} · {f.key === 'todos' ? fila.length : contagem(f.key)}
          </button>
        ))}
      </div>

      {fila.length === 0 ? (
        <div className="ck-card" style={{ maxWidth: 520, marginTop: 20 }}>
          <strong>Nenhum pedido em aberto</strong>
          <p style={{ color: 'var(--pp-fg-3)', fontSize: 14, margin: '6px 0 0' }}>
            Assim que alguém pedir no app, no PDV ou pelo garçom, aparece aqui.
            A tela se atualiza sozinha.
          </p>
        </div>
      ) : visiveis.length === 0 ? (
        <p style={{ color: 'var(--pp-fg-3)', marginTop: 18 }}>Nada nesta etapa agora.</p>
      ) : (
        <div className="ck-kds">
          {visiveis.map((p) => {
            const et = ETAPA[p.status] ?? ETAPA.paid;
            const min = et.tempo(p);
            return (
              <article key={p.id} className={`ck-kds__card ck-kds__card--${et.tom}`}>
                <div className="ck-kds__stripe" aria-hidden="true" />
                <header className="ck-between" style={{ alignItems: 'flex-start' }}>
                  <div>
                    <div className="pp-mono" style={{ fontSize: 11, color: 'var(--pp-fg-4)', letterSpacing: '0.05em' }}>
                      {p.pickup_code}
                    </div>
                    <div className="ck-kds__cliente">{p.cliente}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="ck-kds__tempo" style={{ color: p.status === 'ready' ? 'var(--pp-violet)' : corDoTempo(min) }}>
                      {min}<span>min</span>
                    </div>
                    <div className="ck-kds__etapa">{et.rotulo}</div>
                  </div>
                </header>

                {/* A origem decide o que fazer com o prato pronto:
                    mesa vai até a pessoa, praça espera retirada. */}
                <div className={`ck-kds__origem ck-kds__origem--${p.origem.tipo}`}>
                  {p.origem.rotulo}
                </div>

                <ul className="ck-kds__itens">
                  {p.itens.map((it, i) => (
                    <li key={i}>
                      <div>
                        <b className="pp-num">{it.qtd}×</b> {it.nome}
                      </div>
                      {it.obs && <em className="ck-kds__obs">· {it.obs}</em>}
                    </li>
                  ))}
                </ul>

                <footer style={{ marginTop: 'auto' }}>
                  <div className="pp-mono" style={{ fontSize: 12, color: 'var(--pp-fg-4)', margin: '8px 0' }}>
                    {brl(p.total_cents)}
                  </div>
                  <button
                    className={`ck-btn ck-btn--sm ck-kds__acao ${p.status === 'ready' ? 'ck-btn--glass' : 'ck-btn--primary'}`}
                    disabled={ocupado === p.id}
                    onClick={() => avancar(p, et.acao)}
                  >
                    {et.rotuloAcao}
                  </button>
                </footer>
              </article>
            );
          })}
        </div>
      )}

      <p className="ck-live" style={{ marginTop: 16 }}>
        <span className="pp-pulse-dot" /> atualizando a cada 8s
      </p>
    </Shell>
  );
}
