import { useEffect, useState } from 'react';
import { AdmShell } from '../../components/AdmShell.jsx';
import { Loading, ErrorBox } from '../../components/Shell.jsx';
import { Icon } from '@pulsepass/shared/Icon';
import { api } from '../../lib/api.js';
import { brl, dateTime } from '../../lib/format.js';

const KIND = {
  payment: { icon: 'check', color: '#00FF85', label: 'Pagamento' },
  refund: { icon: 'refresh', color: '#FF3D88', label: 'Reembolso' },
  event: { icon: 'calendar', color: '#22D3EE', label: 'Evento' },
  org: { icon: 'users', color: '#A78BFA', label: 'Org' },
};

export default function Audit() {
  const [feed, setFeed] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.platformActivity().then(setFeed).catch((e) => setError(e.message)); }, []);

  return (
    <AdmShell where="Trilha de atividade · tempo real">
      {error ? <ErrorBox>{error}</ErrorBox> : !feed ? <Loading /> : (
        <div className="pp-stack pp-stack-5 pp-reveal" style={{ maxWidth: 760 }}>
          <div>
            <div className="adm-eyebrow" style={{ color: '#67E8F9' }}>Audit log</div>
            <div className="adm-h1">A plataforma <span className="accent" style={{ color: '#67E8F9' }}>em tempo real</span></div>
            <p className="pp-muted" style={{ margin: '4px 0 0' }}>Trilha real de pagamentos, reembolsos, eventos e orgs — o que aconteceu, quando.</p>
          </div>

          <div className="adm-panel">
            {feed.length === 0 && <p className="pp-muted">Nenhuma atividade ainda.</p>}
            <div className="pp-stack pp-stack-1">
              {feed.map((a, i) => {
                const k = KIND[a.kind] ?? KIND.event;
                return (
                  <div key={i} className="pp-row" style={{ padding: '10px 0', borderBottom: i < feed.length - 1 ? '1px solid var(--pp-edge-1)' : 'none', alignItems: 'flex-start' }}>
                    <span className="pp-tx__icon" style={{ background: `${k.color}18`, borderColor: `${k.color}40`, color: k.color }}><Icon name={k.icon} size={16} /></span>
                    <div className="pp-grow">
                      <div style={{ fontWeight: 600, fontSize: 'var(--pp-fs-14)' }}>{a.title}</div>
                      <div className="pp-muted" style={{ fontSize: 'var(--pp-fs-12)', marginTop: 2 }}>{a.detail}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {a.amount_cents != null && <div className="pp-mono" style={{ fontWeight: 700, fontSize: 'var(--pp-fs-13)', color: a.kind === 'refund' ? 'var(--pp-pink)' : 'var(--pp-pulse)' }}>{brl(a.amount_cents)}</div>}
                      <div className="pp-mono pp-muted-2" style={{ fontSize: 'var(--pp-fs-12)', marginTop: 2 }}>{dateTime(a.at)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </AdmShell>
  );
}
