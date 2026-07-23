import { useEffect, useState } from 'react';
import { AdmShell } from '../../components/AdmShell.jsx';
import { Loading, ErrorBox } from '../../components/Shell.jsx';
import { Icon } from '@pulsepass/shared/Icon';
import { api } from '../../lib/api.js';
import { brl } from '../../lib/format.js';

// Regras ativas de integridade — as que o sistema JÁ aplica de verdade.
const RULES = [
  { cat: 'auth', l: 'QR de entrada rotativo (token expira ≤30s)', on: true },
  { cat: 'money', l: 'Idempotency-Key por usuário (anti cobrança dupla)', on: true },
  { cat: 'money', l: 'place_order/place_bar_order atômicos (sem oversell)', on: true },
  { cat: 'money', l: 'Reconciliação de valor no webhook Asaas', on: true },
  { cat: 'ledger', l: 'Invariante: saldo = soma das transações', on: true },
  { cat: 'auth', l: 'Webhook fail-closed (asaas-access-token)', on: true },
];

export default function Fraud() {
  const [drifts, setDrifts] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { api.platformFraud().then(setDrifts).catch((e) => setError(e.message)); }, []);
  const clean = drifts && drifts.length === 0;

  return (
    <AdmShell where="Integridade de ledger · tempo real">
      {error ? <ErrorBox>{error}</ErrorBox> : !drifts ? <Loading /> : (
        <div className="pp-stack pp-stack-5 pp-reveal">
          <div>
            <div className="adm-eyebrow" style={{ color: '#FF7A75' }}>Antifraude · integridade</div>
            <div className="adm-h1">
              {clean ? <>Ledger <span className="accent" style={{ color: 'var(--pp-pulse)' }}>íntegro</span></> : <>{drifts.length} <span className="accent">divergência{drifts.length > 1 ? 's' : ''}</span></>}
            </div>
          </div>

          <div className="pp-cols-2" style={{ gridTemplateColumns: '1.3fr 1fr', alignItems: 'start' }}>
            <div className="adm-panel">
              <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 600, fontSize: 'var(--pp-fs-18)' }}>Divergências de saldo</div>
              <p className="pp-muted" style={{ fontSize: 'var(--pp-fs-12)', margin: '2px 0 var(--pp-s-4)' }}>Carteiras cujo saldo ≠ soma do ledger (sinal real de fraude/bug).</p>
              {clean ? (
                <div className="pp-note pp-note--pulse pp-row" style={{ color: 'var(--pp-pulse)' }}>
                  <Icon name="check" size={18} /> Nenhuma divergência. Todo saldo bate com o histórico de transações.
                </div>
              ) : (
                <table className="ck-table">
                  <thead><tr><th>Carteira</th><th className="num">Saldo</th><th className="num">Ledger</th><th className="num">Drift</th></tr></thead>
                  <tbody>
                    {drifts.map((d) => (
                      <tr key={d.wallet_id}>
                        <td>{d.event}</td>
                        <td className="num pp-mono">{brl(d.balance_cents)}</td>
                        <td className="num pp-mono">{brl(d.ledger_cents)}</td>
                        <td className="num"><span className="ck-badge ck-badge--danger">{brl(d.drift_cents)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="adm-panel">
              <div className="pp-eyebrow" style={{ color: 'var(--pp-pulse)' }}>Regras ativas · {RULES.length}</div>
              <div className="pp-stack pp-stack-2" style={{ marginTop: 'var(--pp-s-4)' }}>
                {RULES.map((r, i) => (
                  <div key={i} className="pp-row" style={{ padding: '8px 10px', borderRadius: 10, background: 'var(--pp-glass-1)', border: '1px solid var(--pp-edge-1)' }}>
                    <span className="ck-badge" style={{ fontSize: 9 }}>{r.cat}</span>
                    <span className="pp-grow" style={{ fontSize: 'var(--pp-fs-13)' }}>{r.l}</span>
                    <span className="pp-toggle on" aria-checked="true" style={{ pointerEvents: 'none' }} />
                  </div>
                ))}
              </div>
              <p className="pp-muted-2" style={{ fontSize: 'var(--pp-fs-12)', marginTop: 'var(--pp-s-3)' }}>
                Engine de ML (scoring PIX/CC/QR) é o próximo passo — hoje a defesa é determinística e já ativa.
              </p>
            </div>
          </div>
        </div>
      )}
    </AdmShell>
  );
}
