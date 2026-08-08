import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Page } from '../components/Layout.jsx';
import { Loading, ErrorBox, Empty } from '../components/States.jsx';
import { Icon } from '../components/Icon.jsx';
import { RechargeSheet } from './Wallet.jsx';
import { api } from '../lib/api.js';
import { brl } from '../lib/format.js';

export default function OrderAhead() {
  const { slug } = useParams();
  const [menu, setMenu] = useState(null);
  const [balance, setBalance] = useState(0);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [cart, setCart] = useState({}); // itemId -> qty
  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState(null);
  const [recharge, setRecharge] = useState(false);

  // Carteira ÚNICA (super-app): saldo geral, não por-evento.
  const refreshBalance = useCallback(async () => {
    try { const w = await api.getWallet(); setBalance(w.balance_cents ?? 0); } catch { /* noop */ }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const m = await api.getEventMenu(slug);
        setMenu(m);
        await refreshBalance();
        setStatus('done');
      } catch (e) { setError(e.message); setStatus('error'); }
    })();
  }, [slug, refreshBalance]);

  const items = menu?.items ?? [];
  const byCat = useMemo(() => {
    const g = {};
    for (const it of items) (g[it.category || 'Geral'] ??= []).push(it);
    return g;
  }, [items]);

  const step = (it, d) => setCart((c) => {
    const cur = c[it.id] ?? 0;
    let next = cur + d;
    if (it.stock != null) next = Math.min(next, it.stock);
    next = Math.max(0, next);
    return { ...c, [it.id]: next };
  });

  const total = items.reduce((s, it) => s + (cart[it.id] ?? 0) * it.price_cents, 0);
  const count = Object.values(cart).reduce((a, q) => a + q, 0);
  const insufficient = total > balance;

  async function pay() {
    setPlacing(true); setError('');
    try {
      const body = {
        eventSlug: slug,
        items: items.filter((it) => cart[it.id] > 0).map((it) => ({ menu_item_id: it.id, quantity: cart[it.id] })),
      };
      const res = await api.createBarOrder(body);
      setDone(res); setCart({}); setBalance(res.balance_cents ?? balance);
    } catch (e) { setError(e.message.includes('Saldo') ? 'Saldo insuficiente. Recarregue para continuar.' : e.message); }
    finally { setPlacing(false); }
  }

  if (status === 'loading') return <Page><Loading label="Abrindo o bar…" /></Page>;
  if (status === 'error') return <Page><ErrorBox>{error}</ErrorBox></Page>;

  if (done) {
    return (
      <Page>
        <div className="pp-authwrap">
          <div className="pp-card pp-authcard pp-reveal" style={{ textAlign: 'center' }}>
            <div className="pp-success__icon" style={{ margin: '0 auto var(--pp-s-4)' }}><Icon name="check" size={30} strokeWidth={2.5} /></div>
            <div className="pp-eyebrow">retire no balcão</div>
            <h1 style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 'var(--pp-fs-40)', color: 'var(--pp-pulse)', margin: '8px 0' }}>{done.pickup_code}</h1>
            <p className="pp-muted">Mostre esse código no bar. Debitamos {brl(done.total_cents)} do seu saldo.</p>
            <div className="pp-stack pp-stack-2" style={{ marginTop: 'var(--pp-s-5)' }}>
              <button className="pp-btn pp-btn--primary pp-btn--block" onClick={() => setDone(null)}>Pedir mais</button>
              <Link to="/carteira" className="pp-btn pp-btn--glass pp-btn--block">Ver carteira</Link>
            </div>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="pp-bar pp-reveal">
        <Link to={`/eventos/${slug}`} className="pp-btn pp-btn--glass pp-btn--sm" style={{ marginBottom: 'var(--pp-s-4)' }}>
          <Icon name="arrowLeft" size={16} /> Voltar ao evento
        </Link>
        <div className="pp-eyebrow">bar cashless</div>
        <h1>Pedir no bar</h1>
        <p className="sub" style={{ margin: '4px 0 var(--pp-s-5)' }}>Peça pelo app e retire no balcão com seu código.</p>

        <div className="pp-bar__balance">
          <div><div className="lbl">Saldo da sua carteira</div><div className="val">{brl(balance)}</div></div>
          <button className="pp-btn pp-btn--glass pp-btn--sm" onClick={() => setRecharge(true)}>
            <Icon name="wallet" size={15} /> Recarregar
          </button>
        </div>

        {error && <ErrorBox>{error}</ErrorBox>}
        {items.length === 0 && <Empty><div className="pp-empty__icon"><Icon name="wallet" size={30} /></div><div className="pp-empty__title">Bar sem itens</div><p>Este evento ainda não publicou o cardápio.</p></Empty>}

        {Object.entries(byCat).map(([cat, list]) => (
          <div key={cat}>
            <div className="pp-barcat">{cat}</div>
            {list.map((it) => {
              const out = it.stock != null && it.stock <= 0;
              return (
                <div key={it.id} className="pp-menuitem">
                  <div className="pp-grow">
                    <div className="pp-menuitem__name">{it.name}</div>
                    {it.description && <div className="pp-menuitem__desc">{it.description}</div>}
                    <div className="pp-menuitem__price">{brl(it.price_cents)}</div>
                  </div>
                  {out ? <span className="pp-menuitem__out">Esgotado</span> : (
                    <div className="pp-stepper">
                      <button onClick={() => step(it, -1)} disabled={!cart[it.id]} aria-label="menos">−</button>
                      <span className="qty">{cart[it.id] ?? 0}</span>
                      <button className="plus" onClick={() => step(it, +1)} aria-label="mais">+</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {count > 0 && (
        <div className="pp-barbar">
          <div className="pp-barbar__in">
            <div className="pp-barbar__total pp-grow">
              <div className="lbl">{count} {count === 1 ? 'item' : 'itens'} · saldo {brl(balance)}</div>
              <div className="val">{brl(total)}</div>
            </div>
            {insufficient ? (
              <button className="pp-btn pp-btn--glass" onClick={() => setRecharge(true)}>Recarregar</button>
            ) : (
              <button className={`pp-btn pp-btn--primary pp-btn--lg ${placing ? 'is-loading' : ''}`} disabled={placing} onClick={pay}>
                Pagar com saldo
              </button>
            )}
          </div>
        </div>
      )}

      {recharge && (
        <RechargeSheet
          faltando={Math.max(0, total - balance)}
          onClose={() => setRecharge(false)}
          onPaid={() => { setRecharge(false); refreshBalance(); }}
        />
      )}
    </Page>
  );
}
