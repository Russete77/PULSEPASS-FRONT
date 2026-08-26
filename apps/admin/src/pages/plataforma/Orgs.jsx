import { useEffect, useState } from 'react';
import { AdmShell } from '../../components/AdmShell.jsx';
import { Loading, ErrorBox } from '../../components/Shell.jsx';
import { Icon } from '@pulsepass/shared/Icon';
import { api } from '../../lib/api.js';
import { brl, dateTime } from '../../lib/format.js';

export default function Orgs() {
  const [orgs, setOrgs] = useState(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => { api.platformOrgs().then(setOrgs).catch((e) => setError(e.message)); }, []);

  const filtered = (orgs ?? []).filter((o) =>
    !q || o.name.toLowerCase().includes(q.toLowerCase()) || (o.owner_email ?? '').includes(q) || (o.city ?? '').toLowerCase().includes(q.toLowerCase()));
  const gmvTotal = (orgs ?? []).reduce((s, o) => s + o.gmv_cents, 0);

  return (
    <AdmShell where={`${orgs?.length ?? 0} organizações`}>
      {error ? <ErrorBox>{error}</ErrorBox> : !orgs ? <Loading /> : (
        <div className="pp-stack pp-stack-5 pp-reveal">
          <div className="pp-between ck-ai-end">
            <div>
              <div className="adm-eyebrow ck-c-violet">Organizações</div>
              <div className="adm-h1">{orgs.length} orgs · saúde global</div>
            </div>
            <span className="adm-btn-pink ck-off"><Icon name="plus" size={15} /> Cadastrar org</span>
          </div>

          <div className="adm-kpis ck-cols-3">
            <div className="adm-kpi ck-k--pulse"><div className="l">Orgs ativas</div><div className="v">{orgs.length}</div></div>
            <div className="adm-kpi ck-k--violet"><div className="l">GMV agregado</div><div className="v">{brl(gmvTotal)}</div></div>
            <div className="adm-kpi ck-k--cyan"><div className="l">Com vendas</div><div className="v">{orgs.filter((o) => o.gmv_cents > 0).length}</div></div>
          </div>

          <div className="pp-inputwrap ck-w-form">
            <Icon name="search" size={16} />
            <input className="pp-input" placeholder="Buscar por nome, e-mail ou cidade" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>

          <div className="ck-card ck-p-0 ck-scroll">
            <table className="ck-table">
              <thead><tr><th>Org</th><th>Dono</th><th>Cidade</th><th className="num">Eventos</th><th className="num">GMV</th><th>Desde</th></tr></thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <span className="pp-row">
                        <span className="pp-order__thumb ck-t-support ck-thumb--sm">{o.name[0]?.toUpperCase()}</span>
                        <b>{o.name}</b>
                      </span>
                    </td>
                    <td className="pp-mono pp-muted ck-t-support">{o.owner_email}</td>
                    <td className="pp-mono">{o.city}</td>
                    <td className="num pp-mono">{o.events}</td>
                    <td className="num"><span className="pp-price">{brl(o.gmv_cents)}</span></td>
                    <td className="pp-muted ck-t-support">{dateTime(o.created_at)}</td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} className="pp-muted ck-p-6">Nenhuma org encontrada.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdmShell>
  );
}
