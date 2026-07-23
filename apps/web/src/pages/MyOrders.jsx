import { useEffect, useState } from 'react';
import { Page } from '../components/Layout.jsx';
import { Loading, ErrorBox, Empty } from '../components/States.jsx';
import { api } from '../lib/api.js';
import { brl, dateTime } from '../lib/format.js';
import { Icon } from '../components/Icon.jsx';

const STATUS = {
  paid: { label: 'Pago', cls: 'pp-badge--pulse pp-badge--dot' },
  pending: { label: 'Aguardando pagamento', cls: 'pp-badge--amber' },
  expired: { label: 'Expirado', cls: 'pp-badge--neutral' },
  cancelled: { label: 'Cancelado', cls: 'pp-badge--red' },
  refunded: { label: 'Reembolsado', cls: 'pp-badge--violet' },
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(null);

  async function load() {
    try { setOrders(await api.listOrders()); setStatus('done'); }
    catch (e) { setError(e.message); setStatus('error'); }
  }
  useEffect(() => { load(); }, []);

  async function refund(o) {
    if (!window.confirm('Solicitar reembolso deste pedido? Os ingressos serão cancelados.')) return;
    setBusy(o.id);
    setError('');
    try { await api.refundOrder(o.id); await load(); }
    catch (e) { setError(e.message); }
    finally { setBusy(null); }
  }

  if (status === 'loading') return <Page><Loading /></Page>;
  if (status === 'error') return <Page><ErrorBox>{error}</ErrorBox></Page>;

  return (
    <Page>
      <div className="pp-reveal">
        <div className="pp-eyebrow">histórico</div>
        <h1>Meus pedidos</h1>
        <p className="sub">Acompanhe pagamentos e solicite reembolso.</p>
      </div>
      {error && <ErrorBox>{error}</ErrorBox>}
      {orders.length === 0 && (
        <Empty>
          <div className="pp-empty__icon"><Icon name="receipt" size={30} /></div>
          <div className="pp-empty__title">Nenhum pedido ainda</div>
          <p>Seus pedidos aparecem aqui após a primeira compra.</p>
        </Empty>
      )}
      <div className="pp-orderlist pp-reveal-group">
        {orders.map((o) => {
          const st = STATUS[o.status] ?? { label: o.status, cls: 'pp-badge--neutral' };
          const title = o.events?.title ?? 'Evento';
          return (
            <div key={o.id} className="pp-card pp-order">
              <div className="pp-order__thumb">{title.slice(0, 2).toUpperCase()}</div>
              <div className="pp-grow">
                <div className="pp-order__title">{title}</div>
                <div className="pp-order__date">{dateTime(o.created_at)}</div>
                <span className={`pp-badge ${st.cls}`} style={{ marginTop: 8 }}>{st.label}</span>
              </div>
              <div className="pp-order__right">
                <span className="pp-order__total">{brl(o.total_cents)}</span>
                {o.status === 'paid' && (
                  <button className={`pp-btn pp-btn--glass pp-btn--sm ${busy === o.id ? 'is-loading' : ''}`} disabled={busy === o.id} onClick={() => refund(o)}>
                    Reembolsar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Page>
  );
}
