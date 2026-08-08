import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Shell, Loading, ErrorBox, OpsBack } from '../components/Shell.jsx';
import { api } from '../lib/api.js';
import { brl } from '../lib/format.js';

/**
 * KDS — a tela da cozinha.
 *
 * Não é uma lista de pedidos: é uma fila com cronômetro. Quem está na chapa
 * não precisa saber quanto cada pedido custou — precisa saber o que entrou
 * primeiro e o que está atrasando. Por isso o tempo de espera é o número
 * maior de cada card, e a ordem é sempre por chegada.
 *
 * Fica em tela cheia, sem barra lateral: essa tela vive num monitor pendurado
 * na cozinha, longe do mouse, e cada pixel gasto com navegação é um pedido a
 * menos visível.
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

const COLUNAS = [
  { status: 'paid', titulo: 'Na fila', acao: 'preparing', rotuloAcao: 'Começar' },
  { status: 'preparing', titulo: 'Preparando', acao: 'ready', rotuloAcao: 'Pronto' },
  { status: 'ready', titulo: 'Pronto — entregar', acao: 'delivered', rotuloAcao: 'Entregue' },
];

export default function Cozinha() {
  const { id } = useParams();
  const [fila, setFila] = useState([]);
  const [status, setStatus] = useState('loading');
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(null);   // id do pedido em transição
  const timer = useRef(null);

  const carregar = useCallback(async () => {
    try {
      setFila(await api.kds(id));
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
    // Otimista: o card muda de coluna na hora. Numa cozinha, esperar a rede
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

  const porColuna = (s) => fila.filter((p) => p.status === s);
  const atrasados = fila.filter((p) => (p.esperando_min ?? 0) >= LIMITE_ATRASO && p.status !== 'ready').length;

  return (
    <Shell>
      <OpsBack to={`/eventos/${id}`} label="Dashboard" />

      <div className="ck-between" style={{ alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="ck-eyebrow">cozinha · ao vivo</div>
          <h1 className="ck-h1">Pedidos</h1>
        </div>
        {/* Um número só, grande: quantos passaram do limite. É a única coisa
            que faz a cozinha mudar de ritmo. */}
        {atrasados > 0 && (
          <div className="ck-card" style={{
            padding: '10px 18px', borderColor: 'rgba(255,59,48,0.42)',
            background: 'rgba(255,59,48,0.10)',
          }}>
            <span style={{ color: '#FF6B61', fontWeight: 700 }}>
              {atrasados} {atrasados === 1 ? 'pedido atrasado' : 'pedidos atrasados'}
            </span>
          </div>
        )}
      </div>

      {erro && <ErrorBox>{erro}</ErrorBox>}

      {fila.length === 0 ? (
        <div className="ck-card" style={{ maxWidth: 520, marginTop: 20 }}>
          <strong>Nenhum pedido em aberto</strong>
          <p style={{ color: 'var(--pp-fg-3)', fontSize: 14, margin: '6px 0 0' }}>
            Assim que alguém pedir no app, no PDV ou pelo garçom, aparece aqui.
            A tela se atualiza sozinha.
          </p>
        </div>
      ) : (
        <div className="ck-kds">
          {COLUNAS.map((col) => {
            const pedidos = porColuna(col.status);
            return (
              <section key={col.status} className="ck-kds__col">
                <div className="ck-kds__head">
                  <span>{col.titulo}</span>
                  <span className="pp-num">{pedidos.length}</span>
                </div>

                {pedidos.length === 0 && (
                  <p className="ck-kds__vazio">nada aqui</p>
                )}

                {pedidos.map((p) => (
                  <article key={p.id} className="ck-kds__card">
                    <header className="ck-between">
                      <div>
                        {/* A origem decide o que fazer com o prato pronto:
                            mesa vai até a pessoa, praça espera retirada. */}
                        <div className={`ck-kds__origem ck-kds__origem--${p.origem.tipo}`}>
                          {p.origem.rotulo}
                        </div>
                        <div className="ck-kds__cliente">{p.cliente}</div>
                      </div>
                      <div className="ck-kds__tempo" style={{ color: corDoTempo(p.esperando_min) }}>
                        {p.esperando_min}<span>min</span>
                      </div>
                    </header>

                    <ul className="ck-kds__itens">
                      {p.itens.map((it, i) => (
                        <li key={i}>
                          <b className="pp-num">{it.qtd}×</b> {it.nome}
                          {it.obs && <em className="ck-kds__obs"> · {it.obs}</em>}
                        </li>
                      ))}
                    </ul>

                    <footer className="ck-between" style={{ marginTop: 10 }}>
                      <span className="pp-mono" style={{ fontSize: 12, color: 'var(--pp-fg-4)' }}>
                        {p.pickup_code} · {brl(p.total_cents)}
                      </span>
                      <button
                        className="ck-btn ck-btn--primary ck-btn--sm"
                        disabled={ocupado === p.id}
                        onClick={() => avancar(p, col.acao)}
                      >
                        {col.rotuloAcao}
                      </button>
                    </footer>
                  </article>
                ))}
              </section>
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
