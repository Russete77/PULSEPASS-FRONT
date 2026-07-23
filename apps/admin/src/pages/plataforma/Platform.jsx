import { useEffect, useState } from 'react';
import { AdmShell } from '../../components/AdmShell.jsx';
import { Loading, ErrorBox } from '../../components/Shell.jsx';
import { api } from '../../lib/api.js';
import { brl } from '../../lib/format.js';

const CITY_COLORS = ['#00FF85', '#A78BFA', '#22D3EE', '#FF3D88', '#FFB800', 'rgba(255,255,255,0.3)'];

export default function Platform() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.platformStats().then(setStats).catch((e) => setError(e.message));
  }, []);

  return (
    <AdmShell where="Multi-tenant · todas as orgs · tempo real">
      {error ? <ErrorBox>{error}</ErrorBox> : !stats ? <Loading /> : (
        <div className="pp-stack pp-stack-5 pp-reveal">
          <div>
            <div className="adm-eyebrow">ADM PulsePass</div>
            <div className="adm-h1">A plataforma <span className="accent">respira.</span></div>
          </div>

          <div className="adm-kpis">
            <Kpi l="GMV total" v={brl(stats.gmv_total_cents)} d={`${stats.orders_count} transações`} c="#00FF85" />
            <Kpi l="GMV 24h" v={brl(stats.gmv_24h_cents)} d="ingressos + bar" c="#FF3D88" />
            <Kpi l="Organizações" v={stats.orgs_count} d="ativas na plataforma" c="#A78BFA" />
            <Kpi l="Eventos ao vivo" v={stats.events_live} d={`de ${stats.events_total} totais`} c="#22D3EE" />
            <Kpi l="Ingressos emitidos" v={stats.tickets_count} d={stats.drift_count === 0 ? 'ledger íntegro' : `${stats.drift_count} divergências`} c={stats.drift_count === 0 ? '#00FF85' : '#FFB800'} />
          </div>

          <div className="pp-cols-2" style={{ gridTemplateColumns: '1.4fr 1fr', alignItems: 'start' }}>
            <div className="adm-panel">
              <div className="pp-between">
                <div>
                  <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 600, fontSize: 'var(--pp-fs-18)' }}>GMV por cidade</div>
                  <div className="pp-muted" style={{ fontSize: 'var(--pp-fs-12)', marginTop: 2 }}>distribuição em todas as orgs</div>
                </div>
                <div className="pp-price" style={{ fontSize: 'var(--pp-fs-20)' }}>{brl(stats.gmv_total_cents)}</div>
              </div>
              <div className="pp-stack pp-stack-2" style={{ marginTop: 'var(--pp-s-4)' }}>
                {stats.by_city.length === 0 && <p className="pp-muted">Sem vendas ainda.</p>}
                {stats.by_city.map((row, i) => {
                  const max = stats.by_city[0].gmv_cents || 1;
                  return (
                    <div key={row.city} className="adm-bar">
                      <span style={{ width: 120, fontSize: 'var(--pp-fs-13)' }} className="pp-truncate">{row.city}</span>
                      <div className="track"><div className="fill" style={{ width: `${Math.max(4, (row.gmv_cents / max) * 100)}%`, background: CITY_COLORS[i % CITY_COLORS.length] }} /></div>
                      <span className="pp-mono pp-num" style={{ width: 90, textAlign: 'right', fontSize: 'var(--pp-fs-13)', fontWeight: 600 }}>{brl(row.gmv_cents)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="adm-panel">
              <div className="pp-eyebrow" style={{ color: 'var(--pp-violet-hi)' }}>Top orgs · GMV</div>
              <div className="pp-stack pp-stack-1" style={{ marginTop: 'var(--pp-s-4)' }}>
                {stats.top_orgs.length === 0 && <p className="pp-muted">Sem orgs com vendas.</p>}
                {stats.top_orgs.map((o, i) => (
                  <div key={o.id} className="pp-between" style={{ padding: '8px 0', borderBottom: i < stats.top_orgs.length - 1 ? '1px solid var(--pp-edge-1)' : 'none' }}>
                    <span className="pp-row">
                      <span className="pp-mono pp-muted-2" style={{ width: 18 }}>{i + 1}</span>
                      <span style={{ fontWeight: 600 }}>{o.name}</span>
                    </span>
                    <span className="pp-row">
                      <span className="pp-mono pp-muted" style={{ fontSize: 'var(--pp-fs-12)' }}>{o.events} ev</span>
                      <span className="pp-price">{brl(o.gmv_cents)}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdmShell>
  );
}

function Kpi({ l, v, d, c }) {
  return (
    <div className="adm-kpi" style={{ '--k': c }}>
      <div className="l">{l}</div>
      <div className="v">{v}</div>
      <div className="d">{d}</div>
    </div>
  );
}
