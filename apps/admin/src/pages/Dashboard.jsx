import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shell, Loading, ErrorBox } from '../components/Shell.jsx';
import { api } from '../lib/api.js';
import { brl, eventDate, dateTime } from '../lib/format.js';

export default function Dashboard() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [dash, setDash] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const pollRef = useRef(null);

  async function refresh() {
    const [ev, d] = await Promise.all([api.getEvent(id), api.dashboard(id)]);
    setEvent(ev);
    setDash(d);
    setStatus('done');
  }

  useEffect(() => {
    refresh().catch((e) => { setError(e.message); setStatus('error'); });
    pollRef.current = setInterval(() => { refresh().catch(() => {}); }, 5000);
    return () => clearInterval(pollRef.current);
  }, [id]);

  async function togglePublish() {
    const next = event.status === 'published' ? 'paused' : 'published';
    try {
      const updated = await api.setStatus(id, next);
      setEvent((e) => ({ ...e, status: updated.status }));
    } catch (e) {
      setError(e.message);
    }
  }

  if (status === 'loading') return <Shell><Loading label="Carregando dashboard..." /></Shell>;
  if (status === 'error') return <Shell><ErrorBox>{error}</ErrorBox></Shell>;

  const m = dash.metrics;

  return (
    <Shell>
      <Link to="/" className="ck-btn ck-btn--glass ck-btn--sm" style={{ marginBottom: "16px" }}>← Eventos</Link>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="ck-eyebrow">
            dashboard ao vivo · <span className={`ck-badge ${event.status === 'published' ? 'ck-badge--published' : 'ck-badge--draft'}`}>{event.status}</span>
          </div>
          <h1 className="ck-h1">{event.title}</h1>
          <p className="ck-sub">{eventDate(event.starts_at)} · {event.city}/{event.state}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to={`/eventos/${id}/porta`} className="ck-btn ck-btn--glass">Porta</Link>
          <Link to={`/eventos/${id}/pdv`} className="ck-btn ck-btn--glass">PDV</Link>
          <Link to={`/eventos/${id}/cardapio`} className="ck-btn ck-btn--glass">Cardápio</Link>
          <Link to={`/eventos/${id}/fechamento`} className="ck-btn ck-btn--glass">Fechamento</Link>
          <Link to={`/eventos/${id}/promoters`} className="ck-btn ck-btn--glass">Promoters</Link>
          <Link to={`/eventos/${id}/cupons`} className="ck-btn ck-btn--glass">Cupons</Link>
          <Link to={`/eventos/${id}/camarotes`} className="ck-btn ck-btn--glass">Camarotes</Link>
          <Link to={`/eventos/${id}/conciliacao`} className="ck-btn ck-btn--glass">Financeiro</Link>
          <Link to={`/eventos/${id}/equipe`} className="ck-btn ck-btn--glass">Equipe</Link>
          <button className="ck-btn ck-btn--primary" onClick={togglePublish}>
            {event.status === 'published' ? 'Pausar vendas' : 'Publicar'}
          </button>
        </div>
      </div>

      <div className="ck-metrics" style={{ marginTop: 8 }}>
        <Metric lbl="Receita total" val={brl(m.total_revenue_cents)} accent />
        <Metric lbl="Ingressos vendidos" val={m.tickets_sold} />
        <Metric lbl="Check-ins" val={m.checked_in} />
        <Metric lbl="Receita bar" val={brl(m.bar_revenue_cents)} />
      </div>

      <h2 style={{ fontSize: 'var(--pp-fs-18)', marginTop: 32, marginBottom: 12 }}>Lotes</h2>
      <div className="ck-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="ck-table">
          <thead>
            <tr><th>Lote</th><th>Preço</th><th>Vendidos</th><th>Disponível</th><th>Status</th></tr>
          </thead>
          <tbody>
            {dash.tiers.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{brl(t.price_cents)}</td>
                <td>{t.quantity_sold}</td>
                <td>{Math.max(0, t.quantity_total - t.quantity_sold)} / {t.quantity_total}</td>
                <td><span className="ck-badge">{t.status}</span></td>
              </tr>
            ))}
            {dash.tiers.length === 0 && (
              <tr><td colSpan={5} style={{ color: 'var(--pp-fg-3)' }}>Sem lotes.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 style={{ fontSize: 'var(--pp-fs-18)', marginTop: 32, marginBottom: 12 }}>Pedidos recentes (pagos)</h2>
      <div className="ck-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="ck-table">
          <thead><tr><th>Pedido</th><th>Valor</th><th>Quando</th></tr></thead>
          <tbody>
            {dash.recent_orders.map((o) => (
              <tr key={o.id}>
                <td style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 12 }}>{o.id.slice(0, 8)}</td>
                <td>{brl(o.total_cents)}</td>
                <td>{dateTime(o.created_at)}</td>
              </tr>
            ))}
            {dash.recent_orders.length === 0 && (
              <tr><td colSpan={3} style={{ color: 'var(--pp-fg-3)' }}>Nenhuma venda paga ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="ck-live" style={{ marginTop: 16 }}>
        <span className="pp-pulse-dot" /> atualizando a cada 5s
      </p>
    </Shell>
  );
}

function Metric({ lbl, val, accent }) {
  return (
    <div className="ck-card ck-metric">
      <div className="lbl">{lbl}</div>
      <div className="val" style={accent ? { color: 'var(--pp-pulse)' } : undefined}>{val}</div>
    </div>
  );
}
