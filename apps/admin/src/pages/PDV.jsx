import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shell, Loading, ErrorBox, OpsBack } from '../components/Shell.jsx';
import { Icon } from '@pulsepass/shared/Icon';
import { api } from '../lib/api.js';
import { brl } from '../lib/format.js';

export default function PDV() {
  const { id } = useParams();
  const [menu, setMenu] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  // O turno é o que liga cada venda a uma gaveta. Vender sem turno funciona
  // tecnicamente — e é exatamente por isso que era um buraco: a venda entrava
  // no relatório sem pertencer a fechamento nenhum, e a conferência do fim da
  // noite era reconstruída por dedução.
  const [turno, setTurno] = useState(null);
  const [turnoOk, setTurnoOk] = useState(false); // false até a 1ª resposta
  const [fundo, setFundo] = useState('');
  const [praca, setPraca] = useState('');
  const [abrindo, setAbrindo] = useState(false);

  const [email, setEmail] = useState('');
  const [customer, setCustomer] = useState(null); // { name, email, balance_cents }
  const [looking, setLooking] = useState(false);
  const [cart, setCart] = useState({});
  const [charging, setCharging] = useState(false);
  const [receipt, setReceipt] = useState(null);

  // UMA chave por comanda. Renovada quando o carrinho MUDA (comanda nova) e
  // no sucesso; mantida no erro — o retry da mesma comanda tem que chegar ao
  // servidor com a mesma chave, senão a rede caindo na volta cobra em dobro.
  const idemRef = useRef(crypto.randomUUID());

  useEffect(() => {
    Promise.all([api.eventMenu(id), api.turnoAberto(id)])
      .then(([m, t]) => { setMenu(m); setTurno(t); setTurnoOk(true); setStatus('done'); })
      .catch((e) => { setError(e.message); setStatus('error'); });
  }, [id]);

  const total = useMemo(
    () => menu.reduce((s, it) => s + (cart[it.id] ?? 0) * it.price_cents, 0),
    [cart, menu],
  );
  const count = Object.values(cart).reduce((a, b) => a + b, 0);

  async function abrirTurno(e) {
    e.preventDefault();
    setAbrindo(true);
    setError('');
    try {
      const cents = Math.round(Number(String(fundo).replace(',', '.')) * 100) || 0;
      setTurno(await api.abrirTurno(id, {
        fundo_cents: cents, ...(praca.trim() ? { station: praca.trim() } : {}),
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setAbrindo(false);
    }
  }

  async function lookup(e) {
    e.preventDefault();
    setLooking(true);
    setError('');
    setReceipt(null);
    try {
      setCustomer(await api.walletLookup(id, email));
    } catch (err) {
      setCustomer(null);
      setError(err.message);
    } finally {
      setLooking(false);
    }
  }

  function setQty(itemId, delta) {
    // Carrinho mudou = comanda diferente = chave nova. Sem isso, mudar os
    // itens depois de um erro reusaria a chave antiga e o servidor devolveria
    // o pedido ANTIGO como se fosse o novo.
    idemRef.current = crypto.randomUUID();
    setCart((p) => ({ ...p, [itemId]: Math.max(0, (p[itemId] ?? 0) + delta) }));
  }

  async function charge() {
    if (!customer || count === 0 || !turno) return;
    setCharging(true);
    setError('');
    try {
      const items = Object.entries(cart).filter(([, q]) => q > 0).map(([menu_item_id, quantity]) => ({ menu_item_id, quantity }));
      const r = await api.pdvCharge(id, customer.email, items, idemRef.current, turno.station ?? undefined);
      setReceipt(r);
      setCustomer((c) => ({ ...c, balance_cents: r.balance_cents }));
      setCart({});
      idemRef.current = crypto.randomUUID();
      // O estoque local acompanha a venda; o número real é do banco, mas
      // esperar o próximo reload mostraria estoque que já saiu do balcão.
      setMenu((m) => m.map((it) => {
        const vendido = items.find((i) => i.menu_item_id === it.id);
        return vendido && it.stock != null ? { ...it, stock: Math.max(0, it.stock - vendido.quantity) } : it;
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setCharging(false);
    }
  }

  if (status === 'loading') return <Shell><Loading /></Shell>;

  const insufficient = customer && total > customer.balance_cents;

  return (
    <Shell>
      <OpsBack eventId={id} />
      <div className="ck-eyebrow">pdv · cashless</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
        <h1 className="ck-h1">Bar — lançar pedido</h1>
        {turno && (
          <span className="pp-chip pp-chip--active" style={{ fontSize: 12 }}>
            Caixa aberto{turno.station ? ` · ${turno.station}` : ''} · desde{' '}
            {new Date(turno.opened_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
      <p className="ck-sub">Identifique o cliente, monte o pedido e debite o saldo da carteira.</p>

      {error && <ErrorBox>{error}</ErrorBox>}

      {/* Sem turno não se vende: cada cobrança precisa pertencer a uma gaveta,
          senão o fechamento do fim da noite não tem contra o que conferir. */}
      {turnoOk && !turno && (
        <div className="ck-card" style={{ maxWidth: 520 }}>
          <strong>Abra o caixa antes de vender</strong>
          <p style={{ color: 'var(--pp-fg-3)', fontSize: 14, margin: '6px 0 14px' }}>
            O fundo de troco marca o início do turno — é contra ele que a gaveta é conferida no fechamento.
          </p>
          <form onSubmit={abrirTurno} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="ck-field" style={{ flex: 1, minWidth: 130, margin: 0 }}>
              <label htmlFor="pdv-fundo" className="ck-label">Fundo de troco (R$)</label>
              <input id="pdv-fundo" className="ck-input" inputMode="decimal" value={fundo}
                onChange={(e) => setFundo(e.target.value)} placeholder="200,00" />
            </div>
            <div className="ck-field" style={{ flex: 1, minWidth: 130, margin: 0 }}>
              <label htmlFor="pdv-praca" className="ck-label">Praça (opcional)</label>
              <input id="pdv-praca" className="ck-input" value={praca}
                onChange={(e) => setPraca(e.target.value)} placeholder="Bar Central" />
            </div>
            <button className="ck-btn ck-btn--primary" disabled={abrindo}>
              {abrindo ? 'Abrindo…' : 'Abrir caixa'}
            </button>
          </form>
        </div>
      )}

      <div className="ck-card" style={{ maxWidth: 520, marginTop: turnoOk && !turno ? 16 : 0 }}>
        <form onSubmit={lookup} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <div className="ck-field" style={{ flex: 1, margin: 0 }}>
            <label htmlFor="pdv-1" className="ck-label">E-mail do cliente</label>
            <input id="pdv-1" className="ck-input" type="email" autoComplete="email" inputMode="email" autoCapitalize="off" autoCorrect="off" spellCheck="false" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cliente@email.com" />
          </div>
          <button className="ck-btn ck-btn--glass" disabled={looking || !email.includes('@')}>
            {looking ? '…' : 'Buscar'}
          </button>
        </form>
        {customer && (
          <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              {customer.name && <div style={{ fontWeight: 600 }}>{customer.name}</div>}
              <div style={{ color: 'var(--pp-fg-3)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis' }}>{customer.email}</div>
            </div>
            <span style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, color: 'var(--pp-pulse)', whiteSpace: 'nowrap' }}>
              Saldo: {brl(customer.balance_cents)}
            </span>
          </div>
        )}
      </div>

      {receipt && (
        <div className="ck-card" style={{ maxWidth: 520, marginTop: 16, borderColor: 'rgba(0,255,133,0.4)', background: 'rgba(0,255,133,0.08)' }}>
          <strong style={{ color: 'var(--pp-pulse)', display: 'inline-flex', alignItems: 'center', gap: 8 }}><Icon name="check" size={16} /> Cobrado {brl(receipt.total_cents)}</strong>
          <p style={{ marginTop: 6 }}>Retirada: <b className="pp-mono">{receipt.pickup_code}</b> · Novo saldo: {brl(receipt.balance_cents)}</p>
        </div>
      )}

      <h2 style={{ fontSize: 'var(--pp-fs-18)', marginTop: 28, marginBottom: 12 }}>Cardápio</h2>
      <div className="ck-grid" style={{ opacity: customer && turno ? 1 : 0.5, pointerEvents: customer && turno ? 'auto' : 'none' }}>
        {menu.map((it) => {
          const esgotado = it.stock != null && it.stock <= 0;
          const baixo = it.stock != null && it.stock > 0 && it.stock <= 10;
          const noLimite = it.stock != null && (cart[it.id] ?? 0) >= it.stock;
          return (
            <div key={it.id} className="ck-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: esgotado ? 0.55 : 1 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{it.name}</div>
                <div style={{ color: 'var(--pp-fg-4)', fontSize: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span>{it.category}</span>
                  {/* Estoque nulo = a produtora não controla; a tela não inventa número. */}
                  {esgotado && <span style={{ color: 'var(--pp-danger, #ff5470)', fontWeight: 700 }}>Esgotado</span>}
                  {baixo && <span style={{ color: 'var(--pp-warn, #ffb02e)', fontWeight: 700 }}>Restam {it.stock}</span>}
                  {it.stock != null && !esgotado && !baixo && <span>{it.stock} em estoque</span>}
                </div>
                <div style={{ color: 'var(--pp-pulse)', fontFamily: 'var(--pp-font-mono)', marginTop: 4 }}>{brl(it.price_cents)}</div>
              </div>
              {/* "−" e "+" sozinhos não dizem de qual item. O rótulo acessível
                  nomeia o produto e a quantidade é anunciada ao vivo. */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button className="ck-iconbtn" onClick={() => setQty(it.id, -1)}
                  disabled={!cart[it.id]} aria-label={`Tirar um ${it.name}`}>−</button>
                <span style={{ minWidth: 20, textAlign: 'center' }}
                  aria-live="polite" aria-label={`${cart[it.id] ?? 0} ${it.name}`}>{cart[it.id] ?? 0}</span>
                <button className="ck-iconbtn" onClick={() => setQty(it.id, +1)}
                  disabled={esgotado || noLimite}
                  aria-label={`Adicionar um ${it.name}`}>+</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cardápio vazio deixava a tela em branco embaixo do título: no meio do
          evento, o operador não sabe se travou, se não carregou, ou se falta
          cadastrar. Diz o que houve e leva direto para onde se resolve. */}
      {menu.length === 0 && (
        <div className="ck-card" style={{ maxWidth: 520 }}>
          <strong>Nenhum item no cardápio</strong>
          <p style={{ color: 'var(--pp-fg-3)', fontSize: 14, margin: '6px 0 14px' }}>
            O bar não tem produtos cadastrados, então não há o que vender aqui.
          </p>
          <Link to={`/eventos/${id}/cardapio`} className="ck-btn ck-btn--primary">
            Montar o cardápio
          </Link>
        </div>
      )}
      {turno && !customer && <p style={{ color: 'var(--pp-fg-4)', fontSize: 13, marginTop: 10 }}>Busque um cliente para liberar o cardápio.</p>}

      {customer && turno && count > 0 && (
        <div className="ck-card" style={{ maxWidth: 520, marginTop: 20, position: 'sticky', bottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 'var(--pp-fs-18)' }}>
            <span>Total ({count})</span><span>{brl(total)}</span>
          </div>
          {insufficient && <ErrorBox>Saldo insuficiente do cliente.</ErrorBox>}
          <button className="ck-btn ck-btn--primary" style={{ width: '100%', marginTop: 12 }} disabled={charging || insufficient} onClick={charge}>
            {charging ? 'Cobrando…' : `Cobrar ${brl(total)} do saldo`}
          </button>
        </div>
      )}
    </Shell>
  );
}
