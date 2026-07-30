import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shell, Loading, ErrorBox, BackLink } from '../components/Shell.jsx';
import { api } from '../lib/api.js';
import { brl } from '../lib/format.js';

export default function Fechamento() {
  const { id } = useParams();
  const [rows, setRows] = useState([]);
  const [ledger, setLedger] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.cashierReport(id), api.ledgerCheck(id)])
      .then(([r, l]) => { setRows(r); setLedger(l); setStatus('done'); })
      .catch((e) => { setError(e.message); setStatus('error'); });
  }, [id]);

  if (status === 'loading') return <Shell><Loading /></Shell>;
  if (status === 'error') return <Shell><ErrorBox>{error}</ErrorBox></Shell>;

  const total = rows.reduce((s, r) => s + r.total_cents, 0);
  const orders = rows.reduce((s, r) => s + r.orders, 0);

  return (
    <Shell>
      <BackLink to={`/eventos/${id}`} label="Dashboard" />
      <div className="ck-eyebrow">bar · fechamento de caixa</div>
      <h1 className="ck-h1">Fechamento por operador</h1>
      <p className="ck-sub">Total processado no PDV por cada operador (débito de saldo — cashless, sem dinheiro em espécie).</p>

      <div className="ck-metrics" style={{ marginTop: 8 }}>
        <div className="ck-card ck-metric"><div className="lbl">Total PDV</div><div className="val" style={{ color: 'var(--pp-pulse)' }}>{brl(total)}</div></div>
        <div className="ck-card ck-metric"><div className="lbl">Pedidos</div><div className="val">{orders}</div></div>
        <div className="ck-card ck-metric"><div className="lbl">Operadores</div><div className="val">{rows.length}</div></div>
      </div>

      {ledger && (
        <p className="ck-sub" style={{ marginTop: 12, color: ledger.ok ? 'var(--pp-pulse)' : 'var(--pp-amber)' }}>
          {ledger.ok
            ? '✓ Integridade do saldo (ledger): sem divergências'
            : `⚠ ${ledger.drifts.length} carteira(s) com saldo divergente da soma das transações — investigar`}
        </p>
      )}

      <div className="ck-card" style={{ padding: 0, overflow: 'hidden', marginTop: 24 }}>
        <table className="ck-table">
          <thead><tr><th>Operador</th><th>Pedidos</th><th>Total</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.operator_id}>
                <td>{r.name || r.email}</td>
                <td>{r.orders}</td>
                <td>{brl(r.total_cents)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={3} style={{ color: 'var(--pp-fg-3)' }}>Nenhuma venda de PDV ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
