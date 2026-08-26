import { useEffect, useState } from 'react';
import { AdmShell } from '../../components/AdmShell.jsx';
import { Loading, ErrorBox } from '../../components/Shell.jsx';
import { Icon } from '@pulsepass/shared/Icon';
import { api } from '../../lib/api.js';
import { brl, dateTime } from '../../lib/format.js';

/* Tipo do lançamento vira TOM, não hex. Os valores anteriores eram hex cru
   concatenado com sufixo de alfa ("#22D3EE18") — truque que só funciona com
   hex e que já não funcionaria com token. O chip agora é neutro e só o ícone
   recebe a cor: quatro chips coloridos numa coluna viravam semáforo. */
const KIND = {
  payment: { icon: 'check', tom: 'pulse', label: 'Pagamento' },
  refund: { icon: 'refresh', tom: 'pink', label: 'Reembolso' },
  event: { icon: 'calendar', tom: 'cyan', label: 'Evento' },
  org: { icon: 'users', tom: 'violet', label: 'Org' },
};

export default function Audit() {
  const [feed, setFeed] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.platformActivity().then(setFeed).catch((e) => setError(e.message)); }, []);

  return (
    <AdmShell where="Trilha de atividade · tempo real">
      {error ? <ErrorBox>{error}</ErrorBox> : !feed ? <Loading /> : (
        <div className="pp-stack pp-stack-5 pp-reveal ck-w-read">
          <div>
            <div className="adm-eyebrow ck-c-cyan">Audit log</div>
            <div className="adm-h1">A plataforma <span className="accent ck-c-cyan">em tempo real</span></div>
            <p className="pp-muted ck-m-0 ck-mt-1">Trilha real de pagamentos, reembolsos, eventos e orgs — o que aconteceu, quando.</p>
          </div>

          <div className="adm-panel">
            {feed.length === 0 && <p className="pp-muted">Nenhuma atividade ainda.</p>}
            <div className="pp-stack pp-stack-1">
              {feed.map((a, i) => {
                const k = KIND[a.kind] ?? KIND.event;
                return (
                  <div key={i} className="ck-linha ck-ai-start">
                    <span className={`ck-feed__ic ck-feed__ic--neutro ck-c-${k.tom}`} aria-hidden="true"><Icon name={k.icon} size={16} /></span>
                    <div className="pp-grow">
                      <div className="ck-w-semi ck-t-support">{a.title}</div>
                      <div className="pp-muted ck-meta">{a.detail}</div>
                    </div>
                    <div className="ck-right ck-shrink0">
                      {a.amount_cents != null && <div className={`pp-mono ck-w-bold ck-t-support ${a.kind === 'refund' ? 'ck-c-pink' : 'ck-c-pulse'}`}>{brl(a.amount_cents)}</div>}
                      <div className="pp-mono pp-muted-2 ck-meta">{dateTime(a.at)}</div>
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
