import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loading, ErrorBox } from '../components/Shell.jsx';
import { Icon } from '@pulsepass/shared/Icon';
import { api } from '../lib/api.js';
import { brl } from '../lib/format.js';

/**
 * Totem de autoatendimento.
 *
 * Layout da TotemScreen do design system: o cardápio em cards grandes de um
 * lado e o carrinho ("Seu pedido") fixo do outro, com o total e o botão de
 * pagar sempre à vista. O fluxo inteiro acontece no carrinho — escolher,
 * identificar, confirmar — porque quem opera está de pé, sozinho, e não pode
 * "trocar de tela" pra descobrir quanto deu.
 *
 * O que o mockup tem e ficou de fora, com motivo:
 *  · emoji/foto por produto — o cardápio não tem imagem cadastrada; a cor da
 *    categoria no fio do card é o que distingue sem inventar ícone;
 *  · "Pagar · aproxime pulseira" e botões QR/Pix/Cartão — não existe NFC nem
 *    pagamento direto no totem: o débito é do saldo da conta, identificada
 *    por e-mail, e é isso que a lateral pede;
 *  · selo "ONLINE" — não há telemetria de totem no backend.
 *
 * Regras que continuam do totem antigo:
 *  · sem barra lateral de navegação e sem link pra lugar nenhum;
 *  · volta ao início SOZINHO (ociosidade e recibo com contagem).
 */

/** Segundos de inatividade até limpar tudo e voltar ao início. */
const OCIOSO_S = 45;
/** Depois de concluir, mostra o código por este tempo e reinicia. */
const RECIBO_S = 20;

/** Fio de cor por categoria — tokens de acento, atribuídos por ordem. */
const CORES_CAT = ['var(--pp-pulse)', 'var(--pp-cyan)', 'var(--pp-violet)', 'var(--pp-amber)', 'var(--pp-pink)'];

export default function Totem() {
  const { id } = useParams();
  const [menu, setMenu] = useState([]);
  const [status, setStatus] = useState('loading');
  const [erro, setErro] = useState('');

  const [etapa, setEtapa] = useState('carrinho');   // carrinho | identificar | recibo
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
    setRecibo(null); setErro(''); setEtapa('carrinho'); setCategoria('Tudo');
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
  const corDaCategoria = (cat) => {
    const i = categorias.indexOf(cat);
    return CORES_CAT[(i > 0 ? i - 1 : 0) % CORES_CAT.length];
  };
  const visiveis = categoria === 'Tudo' ? menu : menu.filter((i) => i.category === categoria);

  const total = menu.reduce((s, it) => s + (carrinho[it.id] ?? 0) * it.price_cents, 0);
  const qtd = Object.values(carrinho).reduce((s, n) => s + n, 0);
  const escolhidos = menu.filter((it) => carrinho[it.id]);
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

  // ── Recibo em tela cheia: o código é a única coisa a levar daqui. ──
  if (etapa === 'recibo') {
    return (
      <div className="ck-totem">
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
      </div>
    );
  }

  return (
    <div className="ck-totem ck-totem--split">
      {/* ══ Produtos ══ */}
      <div className="ck-totem__produtos">
        <header className="ck-totem__topo">
          <div>
            <div className="ck-eyebrow">bar · autoatendimento</div>
            <h1>Toque para pedir</h1>
          </div>
        </header>

        {erro && etapa === 'carrinho' && <ErrorBox>{erro}</ErrorBox>}

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
                    <div className="ck-totem__fio" style={{ background: corDaCategoria(it.category) }} aria-hidden="true" />
                    <div className="ck-between" style={{ alignItems: 'flex-start' }}>
                      <div className="ck-totem__nome">{it.name}</div>
                      {/* Um botão só no card, como no mockup: tirar e ajustar
                          acontece no carrinho, onde a pessoa está olhando. */}
                      {fora ? (
                        <span className="ck-totem__esgotado">Esgotado</span>
                      ) : (
                        <button className="ck-totem__mais" onClick={() => passo(it, +1)}
                          aria-label={`Adicionar um ${it.name}`}>+</button>
                      )}
                    </div>
                    <div className="ck-totem__preco">
                      {brl(it.price_cents)}
                      {n > 0 && <span className="ck-totem__badgeqtd" aria-label={`${n} no pedido`}>{n}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ══ Seu pedido (carrinho lateral do mockup) ══ */}
      <aside className="ck-totem__carrinho" aria-label="Seu pedido">
        <h2 className="ck-totem__cartitulo">Seu pedido</h2>

        {etapa === 'carrinho' && (
          <>
            <div className="ck-totem__caritens">
              {escolhidos.length === 0 && (
                <p className="ck-totem__vazio" style={{ fontSize: 'var(--pp-fs-15)' }}>
                  Nada aqui ainda — toque no “+” de um item pra começar.
                </p>
              )}
              {escolhidos.map((it) => (
                <div key={it.id} className="ck-totem__caritem">
                  <div className="pp-grow">
                    <div style={{ fontWeight: 600 }}>{it.name}</div>
                    <div className="pp-mono" style={{ fontSize: 13, color: 'var(--pp-fg-3)', marginTop: 2 }}>
                      {brl(it.price_cents)}
                    </div>
                  </div>
                  <div className="ck-totem__passo">
                    <button onClick={() => passo(it, -1)} aria-label={`Tirar um ${it.name}`}>−</button>
                    <span aria-live="polite" aria-label={`${carrinho[it.id]} ${it.name}`}>{carrinho[it.id]}</span>
                    <button onClick={() => passo(it, +1)} aria-label={`Adicionar um ${it.name}`}>+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="ck-totem__carpe">
              <div className="ck-between">
                <span style={{ fontSize: 'var(--pp-fs-16)', fontWeight: 600 }}>Total</span>
                <span className="ck-totem__barra-val">{brl(total)}</span>
              </div>
              <button className="ck-btn ck-btn--primary ck-totem__acao"
                disabled={qtd === 0} onClick={() => setEtapa('identificar')}>
                Continuar <Icon name="arrowRight" size={18} />
              </button>
              {qtd > 0 && (
                <button className="ck-btn ck-btn--ghost" style={{ width: '100%', marginTop: 8 }} onClick={reiniciar}>
                  Recomeçar
                </button>
              )}
            </div>
          </>
        )}

        {etapa === 'identificar' && (
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
                {erro && <ErrorBox>{erro}</ErrorBox>}
                <button className="ck-btn ck-btn--primary ck-totem__acao" disabled={ocupado || !email.trim()}>
                  {ocupado ? 'Procurando…' : 'Continuar'}
                </button>
              </form>
            ) : (
              <>
                <p className="ck-totem__sub">Olá, {cliente.full_name ?? cliente.email}</p>
                <div className="ck-totem__codigo" style={{ fontSize: 40 }}>{brl(cliente.balance_cents)}</div>
                <p className="ck-totem__sub">é o seu saldo</p>
                {semSaldo && (
                  <p style={{ color: 'var(--pp-amber)', marginTop: 12 }}>
                    Faltam {brl(total - cliente.balance_cents)}. Recarregue pelo app e volte aqui.
                  </p>
                )}
                {erro && <ErrorBox>{erro}</ErrorBox>}
                <button className="ck-btn ck-btn--primary ck-totem__acao"
                  disabled={ocupado || semSaldo} onClick={confirmar}>
                  {ocupado ? 'Confirmando…' : `Confirmar ${brl(total)}`}
                </button>
              </>
            )}
            <button className="ck-btn ck-btn--ghost" style={{ width: '100%', marginTop: 8 }}
              onClick={() => { setEtapa('carrinho'); setErro(''); }}>
              Voltar ao pedido
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
