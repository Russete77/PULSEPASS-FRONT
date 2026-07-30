import { useEffect, useMemo, useState } from 'react';
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

  const [email, setEmail] = useState('');
  const [customer, setCustomer] = useState(null); // { email, balance_cents }
  const [looking, setLooking] = useState(false);
  const [cart, setCart] = useState({});
  const [charging, setCharging] = useState(false);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    api.eventMenu(id)
      .then((m) => { setMenu(m); setStatus('done'); })
      .catch((e) => { setError(e.message); setStatus('error'); });
  }, [id]);

  const total = useMemo(
    () => menu.reduce((s, it) => s + (cart[it.id] ?? 0) * it.price_cents, 0),
    [cart, menu],
  );
  const count = Object.values(cart).reduce((a, b) => a + b, 0);

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
    setCart((p) => ({ ...p, [itemId]: Math.max(0, (p[itemId] ?? 0) + delta) }));
  }

  async function charge() {
    if (!customer || count === 0) return;
    setCharging(true);
    setError('');
    try {
      const items = Object.entries(cart).filter(([, q]) => q > 0).map(([menu_item_id, quantity]) => ({ menu_item_id, quantity }));
      const r = await api.pdvCharge(id, customer.email, items);
      setReceipt(r);
      setCustomer((c) => ({ ...c, balance_cents: r.balance_cents }));
      setCart({});
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
      <h1 className="ck-h1">Bar — lançar pedido</h1>
      <p className="ck-sub">Identifique o cliente, monte o pedido e debite o saldo da carteira.</p>

      {error && <ErrorBox>{error}</ErrorBox>}

      <div className="ck-card" style={{ maxWidth: 520 }}>
        <form onSubmit={lookup} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <div className="ck-field" style={{ flex: 1, margin: 0 }}>
            <label className="ck-label">E-mail do cliente</label>
            <input className="ck-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cliente@email.com" />
          </div>
          <button className="ck-btn ck-btn--glass" disabled={looking || !email.includes('@')}>
            {looking ? '…' : 'Buscar'}
          </button>
        </form>
        {customer && (
          <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--pp-fg-2)' }}>{customer.email}</span>
            <span style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, color: 'var(--pp-pulse)' }}>
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
      <div className="ck-grid" style={{ opacity: customer ? 1 : 0.5, pointerEvents: customer ? 'auto' : 'none' }}>
        {menu.map((it) => (
          <div key={it.id} className="ck-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{it.name}</div>
              <div style={{ color: 'var(--pp-fg-4)', fontSize: 12 }}>{it.category}</div>
              <div style={{ color: 'var(--pp-pulse)', fontFamily: 'var(--pp-font-mono)', marginTop: 4 }}>{brl(it.price_cents)}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button className="ck-iconbtn" onClick={() => setQty(it.id, -1)}>−</button>
              <span style={{ minWidth: 20, textAlign: 'center' }}>{cart[it.id] ?? 0}</span>
              <button className="ck-iconbtn" onClick={() => setQty(it.id, +1)}>+</button>
            </div>
          </div>
        ))}
      </div>
      {!customer && <p style={{ color: 'var(--pp-fg-4)', fontSize: 13, marginTop: 10 }}>Busque um cliente para liberar o cardápio.</p>}

      {customer && count > 0 && (
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
