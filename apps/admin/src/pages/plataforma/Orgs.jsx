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
          <div className="pp-between" style={{ alignItems: 'flex-end' }}>
            <div>
              <div className="adm-eyebrow" style={{ color: 'var(--pp-violet-hi)' }}>Organizações</div>
              <div className="adm-h1">{orgs.length} orgs · saúde global</div>
            </div>
            <span className="adm-btn-pink" style={{ opacity: 0.5, cursor: 'not-allowed' }}><Icon name="plus" size={15} /> Cadastrar org</span>
          </div>

          <div className="adm-kpis" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="adm-kpi" style={{ '--k': '#00FF85' }}><div className="l">Orgs ativas</div><div className="v">{orgs.length}</div></div>
            <div className="adm-kpi" style={{ '--k': '#A78BFA' }}><div className="l">GMV agregado</div><div className="v">{brl(gmvTotal)}</div></div>
            <div className="adm-kpi" style={{ '--k': '#22D3EE' }}><div className="l">Com vendas</div><div className="v">{orgs.filter((o) => o.gmv_cents > 0).length}</div></div>
          </div>

          <div className="pp-inputwrap" style={{ maxWidth: 420 }}>
            <Icon name="search" size={16} />
            <input className="pp-input" placeholder="Buscar por nome, e-mail ou cidade" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>

          <div className="ck-card" style={{ padding: 0, overflow: 'auto' }}>
            <table className="ck-table">
              <thead><tr><th>Org</th><th>Dono</th><th>Cidade</th><th className="num">Eventos</th><th className="num">GMV</th><th>Desde</th></tr></thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <span className="pp-row">
                        <span className="pp-order__thumb" style={{ width: 30, height: 30, fontSize: 12 }}>{o.name[0]?.toUpperCase()}</span>
                        <b>{o.name}</b>
                      </span>
                    </td>
                    <td className="pp-mono pp-muted" style={{ fontSize: 'var(--pp-fs-12)' }}>{o.owner_email}</td>
                    <td className="pp-mono">{o.city}</td>
                    <td className="num pp-mono">{o.events}</td>
                    <td className="num"><span className="pp-price">{brl(o.gmv_cents)}</span></td>
                    <td className="pp-muted" style={{ fontSize: 'var(--pp-fs-12)' }}>{dateTime(o.created_at)}</td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} className="pp-muted" style={{ padding: 'var(--pp-s-6)' }}>Nenhuma org encontrada.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdmShell>
  );
}
