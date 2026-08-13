import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Shell, Loading, ErrorBox, OpsBack } from '../components/Shell.jsx';
import { Icon } from '@pulsepass/shared/Icon';
import { api } from '../lib/api.js';
import { brl } from '../lib/format.js';

/**
 * Tela do garçom.
 *
 * Layout da WaiterScreen do design system: KPIs do salão no topo, filtro em
 * pílulas e as mesas em LINHAS — o chip da mesa à esquerda, o que ela tem no
 * meio e o valor em aberto à direita, que são as três coisas que fazem o
 * garçom decidir para onde ir. O lançamento de pedido segue a
 * WaiterOrderScreen: categorias em strip, cardápio em linhas com stepper e o
 * resumo da comanda fixo embaixo, com o total da mesa ao lado do que está
 * sendo adicionado.
 *
 * O que o mockup mostra e o backend não tem, ficou de fora:
 *  · "chamando garçom" — não existe chamada de mesa no produto;
 *  · gorjeta e "N pessoas" na mesa — não há esses campos;
 *  · tempo de ocupação — pedidos têm hora, mesa não tem "aberta desde".
 *
 * O dinheiro sai da carteira do cliente, pelo mesmo caminho do PDV — o garçom
 * não recebe nada em mãos. Ele precisa identificar de quem é a comanda antes
 * de lançar, e é isso que a busca por e-mail faz.
 */
export default function Garcom() {
  const { id } = useParams();
  const [mesas, setMesas] = useState([]);
  const [menu, setMenu] = useState([]);
  const [status, setStatus] = useState('loading');
  const [erro, setErro] = useState('');
  const [aba, setAba] = useState('todas');       // todas | ocupadas | prontas
  const [mesaAberta, setMesaAberta] = useState(null);
  const timer = useRef(null);

  const carregar = useCallback(async () => {
    try {
      const [m, c] = await Promise.all([api.waiterBoard(id), api.eventMenu(id)]);
      setMesas(m); setMenu(c); setStatus('done'); setErro('');
    } catch (e) { setErro(e.message); setStatus('error'); }
  }, [id]);

  useEffect(() => {
    carregar();
    timer.current = setInterval(carregar, 10000);
    return () => clearInterval(timer.current);
  }, [carregar]);

  if (status === 'loading') return <Shell><Loading label="Carregando o salão…" /></Shell>;

  const ocupadas = mesas.filter((m) => m.pedidos_abertos > 0);
  const prontas = mesas.filter((m) => m.prontos > 0);
  const visiveis = aba === 'ocupadas' ? ocupadas : aba === 'prontas' ? prontas : mesas;

  const vendido = mesas.reduce((s, m) => s + m.consumo_cents, 0);

  return (
    <Shell>
      <OpsBack to={`/eventos/${id}`} label="Dashboard" />

      <div className="ck-eyebrow">salão · garçom</div>
      <h1 className="ck-h1">Suas mesas · {mesas.length}</h1>

      {/* Os três números da noite, como no mockup (só os que existem):
          o total em aberto é o que precisa ser cobrado antes de alguém ir
          embora; os prontos são a próxima caminhada. */}
      <div className="ck-metrics" style={{ marginTop: 16 }}>
        <div className="ck-card ck-metric">
          <div className="lbl">Em aberto no salão</div>
          <div className="val" style={{ color: 'var(--pp-pulse)' }}>{brl(vendido)}</div>
        </div>
        <div className="ck-card ck-metric">
          <div className="lbl">Mesas ocupadas</div>
          <div className="val">{ocupadas.length}<span style={{ fontSize: 16, color: 'var(--pp-fg-4)' }}>/{mesas.length}</span></div>
        </div>
        <div className="ck-card ck-metric">
          <div className="lbl">Prontos para levar</div>
          <div className="val" style={{ color: prontas.length ? 'var(--pp-violet)' : undefined }}>{prontas.length}</div>
        </div>
      </div>

      {erro && <ErrorBox>{erro}</ErrorBox>}

      <div className="ck-tabs" style={{ marginTop: 20 }}>
        {[
          ['todas', `Todas · ${mesas.length}`],
          ['ocupadas', `Ocupadas · ${ocupadas.length}`],
          ['prontas', `Prontas · ${prontas.length}`],
        ].map(([k, r]) => (
          <button key={k} className={`ck-tab ${aba === k ? 'is-on' : ''}`} onClick={() => setAba(k)}>
            {r}
          </button>
        ))}
      </div>

      {mesas.length === 0 ? (
        <div className="ck-card" style={{ maxWidth: 520, marginTop: 18 }}>
          <strong>Nenhuma mesa cadastrada</strong>
          <p style={{ color: 'var(--pp-fg-3)', fontSize: 14, margin: '6px 0 14px' }}>
            O salão precisa ter mesas para o garçom lançar pedido nelas.
          </p>
          <a href={`/eventos/${id}/camarotes`} className="ck-btn ck-btn--primary">Cadastrar mesas</a>
        </div>
      ) : visiveis.length === 0 ? (
        <p style={{ color: 'var(--pp-fg-3)', marginTop: 18 }}>
          {aba === 'prontas' ? 'Nada pronto para levar agora.' : 'Nenhuma mesa com consumo em aberto.'}
        </p>
      ) : (
        <div className="ck-mesas" style={{ marginTop: 18 }}>
          {visiveis.map((m) => (
            <button key={m.id}
              className={`ck-mesa ${m.prontos ? 'ck-mesa--pronta' : m.pedidos_abertos ? 'ck-mesa--ocupada' : ''}`}
              onClick={() => setMesaAberta(m)}
              aria-label={`Lançar pedido na ${m.nome}`}>
              <span className="ck-mesa__chip" aria-hidden="true">{m.nome}</span>
              <span className="ck-mesa__meio">
                <span className="ck-mesa__nome">
                  {m.nome}
                  {m.area && <span className="ck-mesa__area"> · {m.area}</span>}
                </span>
                {m.itens.length > 0 && (
                  <span className="ck-mesa__itens">
                    {m.pedidos_abertos} pedido{m.pedidos_abertos > 1 ? 's' : ''} · {m.itens.slice(0, 3).join(' · ')}
                    {m.itens.length > 3 ? ` +${m.itens.length - 3}` : ''}
                  </span>
                )}
                {m.prontos > 0 && (
                  <span className="ck-mesa__badge">{m.prontos} pronto{m.prontos > 1 ? 's' : ''} · entregar</span>
                )}
              </span>
              <span className="ck-mesa__fim">
                <span className="ck-mesa__valor">{m.consumo_cents ? brl(m.consumo_cents) : '—'}</span>
                <Icon name="chevronRight" size={18} />
              </span>
            </button>
          ))}
        </div>
      )}

      {mesaAberta && (
        <LancarPedido
          eventId={id} mesa={mesaAberta} menu={menu}
          onFechar={() => setMesaAberta(null)}
          onLancado={() => { setMesaAberta(null); carregar(); }}
        />
      )}

      <p className="ck-live" style={{ marginTop: 16 }}>
        <span className="pp-pulse-dot" /> atualizando a cada 10s
      </p>
    </Shell>
  );
}

/**
 * Lançar pedido numa mesa (estrutura da WaiterOrderScreen).
 *
 * A comanda precisa de dono: o débito sai da carteira de alguém. Sem isso o
 * garçom estaria dando produto sem cobrar — que é exatamente o buraco que o
 * cashless existe para fechar.
 */
function LancarPedido({ eventId, mesa, menu, onFechar, onLancado }) {
  const [email, setEmail] = useState('');
  const [cliente, setCliente] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [categoria, setCategoria] = useState('Tudo');
  const [carrinho, setCarrinho] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  const categorias = useMemo(
    () => ['Tudo', ...new Set(menu.map((i) => i.category).filter(Boolean))],
    [menu],
  );
  const visiveis = categoria === 'Tudo' ? menu : menu.filter((i) => i.category === categoria);

  const total = menu.reduce((s, it) => s + (carrinho[it.id] ?? 0) * it.price_cents, 0);
  const qtd = Object.values(carrinho).reduce((s, n) => s + n, 0);
  const semSaldo = cliente && total > cliente.balance_cents;

  async function buscar(e) {
    e.preventDefault();
    setBuscando(true); setErro('');
    try { setCliente(await api.walletLookup(eventId, email.trim())); }
    catch (err) { setErro(err.message); setCliente(null); }
    finally { setBuscando(false); }
  }

  function passo(item, delta) {
    setCarrinho((c) => {
      const n = Math.max(0, (c[item.id] ?? 0) + delta);
      const novo = { ...c };
      if (n === 0) delete novo[item.id]; else novo[item.id] = n;
      return novo;
    });
  }

  async function lancar() {
    setEnviando(true); setErro('');
    try {
      await api.placeWaiterOrder(eventId, {
        buyer_id: cliente.customer_id,
        table_id: mesa.id,
        items: Object.entries(carrinho).map(([menu_item_id, quantity]) => ({ menu_item_id, quantity })),
      });
      onLancado();
    } catch (e) { setErro(e.message); }
    finally { setEnviando(false); }
  }

  return (
    <div className="pp-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onFechar(); }}>
      <div className="pp-modal pp-modal--lg" role="dialog" aria-modal="true" aria-label={`Pedido na ${mesa.nome}`}>
        <div className="pp-modal__head">
          <div>
            <h2 className="pp-modal__title">{mesa.nome}{mesa.area ? ` · ${mesa.area}` : ''}</h2>
            {mesa.pedidos_abertos > 0 && (
              <div className="pp-mono" style={{ fontSize: 11, color: 'var(--pp-fg-4)', marginTop: 2 }}>
                comanda aberta · {mesa.pedidos_abertos} pedido{mesa.pedidos_abertos > 1 ? 's' : ''}
              </div>
            )}
          </div>
          <button className="pp-modal__close" onClick={onFechar} aria-label="Fechar">
            <Icon name="close" size={16} />
          </button>
        </div>

        <div className="pp-modal__body">
          {!cliente ? (
            <form onSubmit={buscar}>
              <div className="ck-field">
                <label className="ck-label" htmlFor="garcom-email">De quem é a comanda?</label>
                <input id="garcom-email" className="ck-input" type="email" required
                  autoComplete="email" inputMode="email" autoCapitalize="off" autoCorrect="off" spellCheck="false"
                  autoFocus value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="e-mail do cliente" />
              </div>
              {erro && <ErrorBox>{erro}</ErrorBox>}
              <button className="ck-btn ck-btn--primary" disabled={buscando || !email.trim()}>
                {buscando ? 'Procurando…' : 'Buscar carteira'}
              </button>
            </form>
          ) : (
            <>
              <div className="ck-card" style={{ marginBottom: 14, padding: 'var(--pp-s-4)' }}>
                <div className="ck-between">
                  <div>
                    <div className="ck-label" style={{ margin: 0 }}>Comanda de</div>
                    <div style={{ fontWeight: 600 }}>{cliente.full_name ?? cliente.email}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="ck-label" style={{ margin: 0 }}>Saldo</div>
                    <div className="pp-money" style={{ fontSize: 20 }}>{brl(cliente.balance_cents)}</div>
                  </div>
                </div>
              </div>

              {menu.length === 0 ? (
                <p style={{ color: 'var(--pp-fg-3)' }}>Cardápio vazio — nada para lançar.</p>
              ) : (
                <>
                  {/* Strip de categorias, como no mockup — com 40 itens no
                      cardápio, achar "Doses" rolando a lista inteira é lento
                      com a mesa esperando. */}
                  {categorias.length > 1 && (
                    <div className="ck-tabs" style={{ marginBottom: 12 }}>
                      {categorias.map((c) => (
                        <button key={c} type="button" className={`ck-tab ${categoria === c ? 'is-on' : ''}`}
                          onClick={() => setCategoria(c)}>{c}</button>
                      ))}
                    </div>
                  )}

                  {visiveis.map((it) => (
                    <div key={it.id} className={`ck-gcm__item ${carrinho[it.id] ? 'is-on' : ''}`}>
                      <div className="pp-grow">
                        <div style={{ fontWeight: 600 }}>{it.name}</div>
                        <div className="pp-mono" style={{ fontSize: 13, color: 'var(--pp-fg-3)', marginTop: 2 }}>{brl(it.price_cents)}</div>
                      </div>
                      <div className="pp-stepper">
                        <button onClick={() => passo(it, -1)} disabled={!carrinho[it.id]}
                          aria-label={`Tirar um ${it.name}`}>−</button>
                        <span className="qty" aria-live="polite" aria-label={`${carrinho[it.id] ?? 0} ${it.name}`}>
                          {carrinho[it.id] ?? 0}
                        </span>
                        <button className="plus" onClick={() => passo(it, +1)}
                          aria-label={`Adicionar um ${it.name}`}>+</button>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {erro && <ErrorBox>{erro}</ErrorBox>}
              {semSaldo && (
                <p style={{ color: 'var(--pp-amber)', fontSize: 13, marginTop: 12 }}>
                  Faltam {brl(total - cliente.balance_cents)} no saldo. O cliente precisa recarregar.
                </p>
              )}
            </>
          )}
        </div>

        {cliente && (
          <div className="pp-modal__foot" style={{ display: 'block' }}>
            {/* Resumo da comanda (estrutura da WaiterOrderScreen): o que está
                sendo ADICIONADO separado do que a mesa já deve — são decisões
                diferentes ("confirmo o pedido?" vs "cobro a mesa?"). */}
            <div className="ck-between" style={{ marginBottom: 12 }}>
              <div>
                <div className="ck-label" style={{ margin: 0 }}>Adicionando · {qtd} {qtd === 1 ? 'item' : 'itens'}</div>
                <div className="pp-money" style={{ fontSize: 'var(--pp-fs-24)', marginTop: 2 }}>{brl(total)}</div>
              </div>
              {mesa.consumo_cents > 0 && (
                <div style={{ textAlign: 'right' }}>
                  <div className="ck-label" style={{ margin: 0 }}>Comanda da mesa</div>
                  <div className="pp-mono" style={{ fontWeight: 600, marginTop: 2 }}>
                    {brl(mesa.consumo_cents + total)}
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="pp-btn pp-btn--ghost" onClick={onFechar}>Cancelar</button>
              <button className={`pp-btn pp-btn--primary ${enviando ? 'is-loading' : ''}`} style={{ flex: 1 }}
                disabled={enviando || qtd === 0 || semSaldo} onClick={lancar}>
                Enviar pra cozinha & bar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
