import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shell, Loading, ErrorBox } from '../components/Shell.jsx';
import { api } from '../lib/api.js';
import { brl } from '../lib/format.js';

function Row({ label, value, sub, strong, accent }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', padding: '10px 0',
      borderBottom: '1px solid var(--pp-edge-2)', fontWeight: strong ? 700 : 400,
    }}>
      <span style={{ color: sub ? 'var(--pp-fg-3)' : 'var(--pp-fg)', fontSize: sub ? 13 : undefined }}>{label}</span>
      <span style={{ fontFamily: 'var(--pp-font-mono)', color: accent ? 'var(--pp-pulse)' : undefined }}>{value}</span>
    </div>
  );
}

export default function Conciliacao() {
  const { id } = useParams();
  const [r, setR] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    api.reconciliation(id)
      .then((d) => { setR(d); setStatus('done'); })
      .catch((e) => { setError(e.message); setStatus('error'); });
  }, [id]);

  if (status === 'loading') return <Shell><Loading /></Shell>;
  if (status === 'error') return <Shell><ErrorBox>{error}</ErrorBox></Shell>;

  return (
    <Shell>
      <Link to={`/eventos/${id}`} className="ck-btn ck-btn--glass ck-btn--sm" style={{ marginBottom: "16px" }}>← Dashboard</Link>
      <div className="ck-eyebrow">financeiro · conciliação</div>
      <h1 className="ck-h1">Conciliação do evento</h1>
      <p className="ck-sub">{r.orders_paid} pedidos pagos · taxa da plataforma {r.platform_fee_percent}%</p>

      <div className="ck-card" style={{ maxWidth: 560 }}>
        <Row label="Receita bruta de ingressos" value={brl(r.tickets_gross_cents)} />
        <Row label="↳ taxa de serviço inclusa" value={brl(r.service_fees_cents)} sub />
        <Row label="↳ descontos (cupons) aplicados" value={`− ${brl(r.discounts_cents)}`} sub />
        <Row label={`Reembolsos (${r.refunds_count})`} value={`− ${brl(r.refunds_cents)}`} />
        <Row label="Vendas líquidas" value={brl(r.net_sales_cents)} strong />
        <Row label={`Taxa da plataforma (${r.platform_fee_percent}%)`} value={`− ${brl(r.platform_fee_cents)}`} />
        <Row label="Repasse líquido ao produtor" value={brl(r.producer_net_cents)} strong accent />
      </div>

      <div className="ck-card" style={{ maxWidth: 560, marginTop: 16 }}>
        <Row label="Receita de bar (cashless)" value={brl(r.bar_gross_cents)} sub />
        <p className="ck-sub" style={{ marginTop: 8 }}>
          O acerto do cashless (recargas e consumo) é separado do repasse de ingressos.
        </p>
      </div>
    </Shell>
  );
}
