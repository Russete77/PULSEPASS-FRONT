import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Shell, Loading, ErrorBox, OpsBack } from '../components/Shell.jsx';
import { Icon } from '@pulsepass/shared/Icon';
import { api } from '../lib/api.js';
import { brl } from '../lib/format.js';

/**
 * Tela do garçom.
 *
 * Trabalha por MESA, não por pedido: quem está no salão pensa "a quatro pediu
 * mais duas", nunca "o pedido 8f2c precisa avançar". Por isso a lista é de
 * mesas, e o que cada uma tem em aberto aparece dentro dela.
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
      <h1 className="ck-h1">Mesas</h1>

      {/* O total do salão em aberto: é o que o garçom precisa saber para
          cobrar antes de alguém ir embora. */}
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
          <div className="val" style={{ color: prontas.length ? 'var(--pp-amber)' : undefined }}>{prontas.length}</div>
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
        <div className="ck-grid" style={{ marginTop: 18 }}>
          {visiveis.map((m) => (
            <button key={m.id} className={`ck-mesa ${m.prontos ? 'ck-mesa--pronta' : ''}`}
              onClick={() => setMesaAberta(m)}>
              <div className="ck-between">
                <span className="ck-mesa__nome">{m.nome}</span>
                {m.prontos > 0 && <span className="ck-mesa__badge">{m.prontos} pronto{m.prontos > 1 ? 's' : ''}</span>}
              </div>
              {m.area && <div className="ck-mesa__area">{m.area}</div>}
              <div className="ck-mesa__valor">{m.consumo_cents ? brl(m.consumo_cents) : '—'}</div>
              {m.itens.length > 0 && (
                <div className="ck-mesa__itens">{m.itens.slice(0, 3).join(' · ')}{m.itens.length > 3 ? ` +${m.itens.length - 3}` : ''}</div>
              )}
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
 * Lançar pedido numa mesa.
 *
 * A comanda precisa de dono: o débito sai da carteira de alguém. Sem isso o
 * garçom estaria dando produto sem cobrar — que é exatamente o buraco que o
 * cashless existe para fechar.
 */
function LancarPedido({ eventId, mesa, menu, onFechar, onLancado }) {
  const [email, setEmail] = useState('');
  const [cliente, setCliente] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [carrinho, setCarrinho] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

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
          <h2 className="pp-modal__title">{mesa.nome}{mesa.area ? ` · ${mesa.area}` : ''}</h2>
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
              <div className="ck-card" style={{ marginBottom: 14 }}>
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
              ) : menu.map((it) => (
                <div key={it.id} className="ck-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--pp-edge-1)' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{it.name}</div>
                    <div className="pp-mono" style={{ fontSize: 13, color: 'var(--pp-fg-3)' }}>{brl(it.price_cents)}</div>
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
          <div className="pp-modal__foot">
            <button className="pp-btn pp-btn--ghost" onClick={onFechar}>Cancelar</button>
            <button className={`pp-btn pp-btn--primary ${enviando ? 'is-loading' : ''}`}
              disabled={enviando || qtd === 0 || semSaldo} onClick={lancar}>
              Lançar {qtd > 0 ? `${qtd} · ${brl(total)}` : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
