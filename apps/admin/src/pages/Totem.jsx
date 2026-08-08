import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loading, ErrorBox } from '../components/Shell.jsx';
import { Icon } from '@pulsepass/shared/Icon';
import { api } from '../lib/api.js';
import { brl } from '../lib/format.js';

/**
 * Totem de autoatendimento.
 *
 * A pessoa opera sozinha, de pé, sem ninguém para explicar. Isso muda três
 * coisas em relação ao PDV:
 *
 *  · Sem barra lateral, sem menu, sem link para lugar nenhum. Um totem que
 *    permite navegar é um totem que alguém deixa numa tela qualquer.
 *  · Tudo maior — alvos de 64px, preço em corpo grande.
 *  · Volta ao início SOZINHO. Quem termina o pedido vai embora sem tocar em
 *    "novo pedido", e o próximo da fila encontraria a comanda do anterior
 *    aberta na tela.
 */

/** Segundos de inatividade até limpar tudo e voltar ao início. */
const OCIOSO_S = 45;
/** Depois de concluir, mostra o código por este tempo e reinicia. */
const RECIBO_S = 20;

export default function Totem() {
  const { id } = useParams();
  const [menu, setMenu] = useState([]);
  const [status, setStatus] = useState('loading');
  const [erro, setErro] = useState('');

  const [etapa, setEtapa] = useState('cardapio');   // cardapio | identificar | recibo
  const [categoria, setCategoria] = useState('Tudo');
  const [carrinho, setCarrinho] = useState({});
  const [email, setEmail] = useState('');
  const [cliente, setCliente] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [recibo, setRecibo] = useState(null);
  const [restam, setRestam] = useState(RECIBO_S);

  const ocioso = useRef(null);

  useEffect(() => {
    api.eventMenu(id)
      .then((m) => { setMenu(m); setStatus('done'); })
      .catch((e) => { setErro(e.message); setStatus('error'); });
  }, [id]);

  function reiniciar() {
    setCarrinho({}); setEmail(''); setCliente(null);
    setRecibo(null); setErro(''); setEtapa('cardapio'); setCategoria('Tudo');
  }

  // Relógio de inatividade. Qualquer toque na tela o reinicia; o silêncio o
  // deixa correr até o fim e limpa a comanda de quem foi embora.
  useEffect(() => {
    if (etapa === 'recibo') return undefined;
    const reset = () => {
      clearTimeout(ocioso.current);
      const temAlgo = Object.keys(carrinho).length > 0 || email || cliente;
      if (temAlgo) ocioso.current = setTimeout(reiniciar, OCIOSO_S * 1000);
    };
    reset();
    window.addEventListener('pointerdown', reset);
    window.addEventListener('keydown', reset);
    return () => {
      clearTimeout(ocioso.current);
      window.removeEventListener('pointerdown', reset);
      window.removeEventListener('keydown', reset);
    };
  }, [carrinho, email, cliente, etapa]);

  // Contagem do recibo: some sozinho para liberar a tela ao próximo da fila.
  useEffect(() => {
    if (etapa !== 'recibo') return undefined;
    setRestam(RECIBO_S);
    const t = setInterval(() => {
      setRestam((s) => {
        if (s <= 1) { clearInterval(t); reiniciar(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [etapa]);

  const categorias = useMemo(
    () => ['Tudo', ...new Set(menu.map((i) => i.category).filter(Boolean))],
    [menu],
  );
  const visiveis = categoria === 'Tudo' ? menu : menu.filter((i) => i.category === categoria);

  const total = menu.reduce((s, it) => s + (carrinho[it.id] ?? 0) * it.price_cents, 0);
  const qtd = Object.values(carrinho).reduce((s, n) => s + n, 0);
  const semSaldo = cliente && total > cliente.balance_cents;

  function passo(item, delta) {
    setCarrinho((c) => {
      const n = Math.max(0, (c[item.id] ?? 0) + delta);
      const novo = { ...c };
      if (n === 0) delete novo[item.id]; else novo[item.id] = n;
      return novo;
    });
  }

  async function identificar(e) {
    e.preventDefault();
    setOcupado(true); setErro('');
    try { setCliente(await api.walletLookup(id, email.trim())); }
    catch (err) { setErro(err.message); }
    finally { setOcupado(false); }
  }

  async function confirmar() {
    setOcupado(true); setErro('');
    try {
      const r = await api.placeWaiterOrder(id, {
        buyer_id: cliente.customer_id,
        station: 'Totem',
        items: Object.entries(carrinho).map(([menu_item_id, quantity]) => ({ menu_item_id, quantity })),
      });
      setRecibo(r); setEtapa('recibo');
    } catch (err) { setErro(err.message); }
    finally { setOcupado(false); }
  }

  if (status === 'loading') return <div className="ck-totem"><Loading label="Abrindo o totem…" /></div>;

  return (
    <div className="ck-totem">
      {etapa === 'recibo' ? (
        <div className="ck-totem__recibo">
          <div className="ck-totem__ok"><Icon name="check" size={44} /></div>
          <h1>Pedido confirmado</h1>
          <p className="ck-totem__sub">Retire no balcão com este código</p>
          <div className="ck-totem__codigo">{recibo?.pickup_code}</div>
          <p className="ck-totem__saldo">
            Cobrado {brl(recibo?.total_cents ?? 0)} · saldo agora {brl(recibo?.balance_cents ?? 0)}
          </p>
          <button className="ck-btn ck-btn--glass" onClick={reiniciar}>
            Novo pedido ({restam}s)
          </button>
        </div>
      ) : (
        <>
          <header className="ck-totem__topo">
            <div>
              <div className="ck-eyebrow">bar · autoatendimento</div>
              <h1>{etapa === 'cardapio' ? 'Escolha o que quer' : 'Quase lá'}</h1>
            </div>
            {qtd > 0 && (
              <button className="ck-btn ck-btn--ghost" onClick={reiniciar}>Recomeçar</button>
            )}
          </header>

          {erro && <ErrorBox>{erro}</ErrorBox>}

          {etapa === 'cardapio' ? (
            <>
              {menu.length === 0 ? (
                <p className="ck-totem__vazio">O cardápio deste evento ainda não foi publicado.</p>
              ) : (
                <>
                  <div className="ck-tabs ck-totem__cats">
                    {categorias.map((c) => (
                      <button key={c} className={`ck-tab ${categoria === c ? 'is-on' : ''}`}
                        onClick={() => setCategoria(c)}>{c}</button>
                    ))}
                  </div>

                  <div className="ck-totem__grade">
                    {visiveis.map((it) => {
                      const fora = it.stock != null && it.stock <= 0;
                      const n = carrinho[it.id] ?? 0;
                      return (
                        <div key={it.id} className={`ck-totem__item ${n ? 'is-on' : ''} ${fora ? 'is-off' : ''}`}>
                          <div className="ck-totem__nome">{it.name}</div>
                          <div className="ck-totem__preco">{brl(it.price_cents)}</div>
                          {fora ? (
                            <span className="ck-totem__esgotado">Esgotado</span>
                          ) : (
                            <div className="ck-totem__passo">
                              <button onClick={() => passo(it, -1)} disabled={!n}
                                aria-label={`Tirar um ${it.name}`}>−</button>
                              <span aria-live="polite" aria-label={`${n} ${it.name}`}>{n}</span>
                              <button onClick={() => passo(it, +1)}
                                aria-label={`Adicionar um ${it.name}`}>+</button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="ck-totem__identificar">
              {!cliente ? (
                <form onSubmit={identificar}>
                  <label className="ck-label" htmlFor="totem-email">
                    Digite o e-mail da sua conta PulsePass
                  </label>
                  <input id="totem-email" className="ck-input ck-totem__campo" type="email" required
                    autoComplete="email" inputMode="email" autoCapitalize="off" autoCorrect="off"
                    spellCheck="false" autoFocus value={email}
                    onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />
                  <button className="ck-btn ck-btn--primary ck-totem__acao" disabled={ocupado || !email.trim()}>
                    {ocupado ? 'Procurando…' : 'Continuar'}
                  </button>
                </form>
              ) : (
                <>
                  <p className="ck-totem__sub">Olá, {cliente.full_name ?? cliente.email}</p>
                  <div className="ck-totem__codigo" style={{ fontSize: 42 }}>{brl(cliente.balance_cents)}</div>
                  <p className="ck-totem__sub">é o seu saldo</p>
                  {semSaldo && (
                    <p style={{ color: 'var(--pp-amber)', marginTop: 12 }}>
                      Faltam {brl(total - cliente.balance_cents)}. Recarregue pelo app e volte aqui.
                    </p>
                  )}
                  <button className="ck-btn ck-btn--primary ck-totem__acao"
                    disabled={ocupado || semSaldo} onClick={confirmar}>
                    {ocupado ? 'Confirmando…' : `Confirmar ${brl(total)}`}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Barra fixa: o total nunca sai de vista, porque decidir "já chega"
              é a pergunta que a pessoa se faz o tempo todo no totem. */}
          {qtd > 0 && (
            <footer className="ck-totem__barra">
              <div>
                <div className="ck-totem__barra-lbl">{qtd} {qtd === 1 ? 'item' : 'itens'}</div>
                <div className="ck-totem__barra-val">{brl(total)}</div>
              </div>
              {etapa === 'cardapio' ? (
                <button className="ck-btn ck-btn--primary ck-btn--lg" onClick={() => setEtapa('identificar')}>
                  Continuar <Icon name="arrowRight" size={18} />
                </button>
              ) : (
                <button className="ck-btn ck-btn--glass ck-btn--lg" onClick={() => setEtapa('cardapio')}>
                  Voltar ao cardápio
                </button>
              )}
            </footer>
          )}
        </>
      )}
    </div>
  );
}
