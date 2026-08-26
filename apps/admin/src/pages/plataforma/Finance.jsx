import { useEffect, useState } from 'react';
import { AdmShell } from '../../components/AdmShell.jsx';
import { Loading, ErrorBox } from '../../components/Shell.jsx';
import { api } from '../../lib/api.js';
import { brl } from '../../lib/format.js';

export default function Finance() {
  const [fin, setFin] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.platformFinance().then(setFin).catch((e) => setError(e.message)); }, []);

  return (
    <AdmShell where="Receita da plataforma · repasses">
      {error ? <ErrorBox>{error}</ErrorBox> : !fin ? <Loading /> : (
        <div className="pp-stack pp-stack-5 pp-reveal">
          <div>
            <div className="adm-eyebrow ck-c-pulse">Financeiro</div>
            <div className="adm-h1">Receita e <span className="accent ck-c-pulse">repasses</span></div>
          </div>

          <div className="adm-kpis ck-cols-4">
            <div className="adm-kpi ck-k--pulse"><div className="l">GMV total</div><div className="v">{brl(fin.gmv_cents)}</div></div>
            <div className="adm-kpi ck-k--pink"><div className="l">Receita plataforma</div><div className="v">{brl(fin.revenue_cents)}</div><div className="d">taxas de serviço</div></div>
            <div className="adm-kpi ck-k--violet"><div className="l">Take rate</div><div className="v">{fin.take_rate_pct}%</div></div>
            <div className="adm-kpi ck-k--cyan"><div className="l">Repasse aos produtores</div><div className="v">{brl(fin.net_to_producers_cents)}</div></div>
          </div>

          <div className="adm-panel">
            <div className="ck-display ck-w-semi ck-t-section">Repasse por organização</div>
            <p className="pp-muted ck-t-support ck-m-0 ck-mt-1 ck-mb-4">GMV menos a taxa da plataforma = líquido a repassar.</p>
            <table className="ck-table">
              <thead><tr><th>Organização</th><th className="num">GMV</th><th className="num">Taxa PulsePass</th><th className="num">A repassar</th></tr></thead>
              <tbody>
                {fin.payouts.length === 0 && <tr><td colSpan={4} className="pp-muted ck-p-5">Sem vendas ainda.</td></tr>}
                {fin.payouts.map((p) => (
                  <tr key={p.id}>
                    <td><b>{p.name}</b></td>
                    <td className="num pp-mono">{brl(p.gmv_cents)}</td>
                    <td className="num pp-mono ck-c-pink">{brl(p.fee_cents)}</td>
                    <td className="num"><span className="pp-price">{brl(p.payout_cents)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdmShell>
  );
}
