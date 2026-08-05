import { useCallback, useEffect, useState } from 'react';
import { Shell, Loading, ErrorBox } from '../components/Shell.jsx';
import { Icon } from '@pulsepass/shared/Icon';
import { api } from '../lib/api.js';
import { brl } from '../lib/format.js';

/**
 * Repasse — a produtora precisa CONFERIR a conta, não confiar nela.
 *
 * Repasse que a casa não consegue reproduzir com papel e caneta vira
 * desconfiança, e desconfiança sobre dinheiro encerra parceria. Por isso, além
 * de configurar a carteira, a tela mostra a mecânica e um exemplo com números —
 * incluindo os dois pontos que mais geram discussão: a taxa incide sobre o
 * LÍQUIDO (o provedor desconta a dele antes) e estorno reverte o repasse.
 */
export default function Repasse() {
  const [status, setStatus] = useState('loading');
  const [orgs, setOrgs] = useState([]);        // [{ org, repasse }]
  const [draft, setDraft] = useState({});
  const [savedId, setSavedId] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const me = await api.me();
      const lista = me.organizations ?? [];
      const comRepasse = await Promise.all(lista.map(async (org) => ({
        org,
        // Falha aqui não derruba a tela: a configuração da carteira continua útil.
        repasse: await api.repasse(org.id).catch(() => null),
      })));
      setOrgs(comRepasse);
      setDraft(Object.fromEntries(lista.map((o) => [o.id, o.asaas_wallet_id ?? ''])));
      setStatus('done');
    } catch (e) { setError(e.message); setStatus('error'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function save(orgId) {
    setError(''); setSavedId('');
    try {
      await api.setOrgWallet(orgId, draft[orgId]?.trim() || null);
      setSavedId(orgId);
      setTimeout(() => setSavedId(''), 2000);
      load();
    } catch (e) { setError(e.message); }
  }

  if (status === 'loading') return <Shell><Loading /></Shell>;

  return (
    <Shell>
      <div className="ck-eyebrow">financeiro · repasse</div>
      <h1 className="ck-h1">Como você recebe</h1>
      <p className="ck-sub">
        As vendas online são repassadas automaticamente para a carteira Asaas da sua
        produtora. Abaixo, a conta exata.
      </p>

      {error && <ErrorBox>{error}</ErrorBox>}

      {orgs.length === 0 && (
        <div className="ck-card"><p style={{ color: 'var(--pp-fg-3)' }}>Nenhuma organização ainda.</p></div>
      )}

      {orgs.map(({ org, repasse }) => (
        <div key={org.id} style={{ maxWidth: 640, marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--pp-font-display)', fontSize: 'var(--pp-fs-18)', marginBottom: 10 }}>
            {org.name}
            {repasse && (
              <span style={{ color: 'var(--pp-fg-3)', fontWeight: 400, fontSize: 14 }}>
                {' '}· taxa {repasse.fee_percent}% ({repasse.fee_origem})
              </span>
            )}
          </h2>

          {(repasse?.avisos ?? []).map((a) => (
            <div key={a} className="ck-card" style={{
              borderColor: 'rgba(255,184,0,0.45)', background: 'rgba(255,184,0,0.08)', marginBottom: 12,
            }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <Icon name="clock" size={18} /><span>{a}</span>
              </div>
            </div>
          ))}

          {/* Exemplo com números explica melhor que qualquer fórmula. */}
          {repasse?.exemplo && (
            <div className="ck-card" style={{ marginBottom: 12 }}>
              <div className="ck-label">{repasse.exemplo.descricao}</div>
              <table style={{ width: '100%', marginTop: 12, borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    ['Cliente paga', repasse.exemplo.bruto_cents, false],
                    ['− taxa do provedor (Asaas)', repasse.exemplo.taxa_provedor_cents, true],
                    ['= valor líquido', repasse.exemplo.liquido_cents, false],
                    [`− plataforma (${repasse.fee_percent}% do líquido)`, repasse.exemplo.plataforma_cents, true],
                  ].map(([label, valor, fraco]) => (
                    <tr key={label}>
                      <td style={{ padding: '8px 0', color: fraco ? 'var(--pp-fg-3)' : 'inherit' }}>{label}</td>
                      <td style={{
                        padding: '8px 0', textAlign: 'right', fontFamily: 'var(--pp-font-mono)',
                        color: fraco ? 'var(--pp-fg-3)' : 'inherit',
                      }}>{brl(valor)}</td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: '1px solid var(--pp-edge-2)' }}>
                    <td style={{ padding: '12px 0', fontWeight: 700 }}>Você recebe</td>
                    <td style={{
                      padding: '12px 0', textAlign: 'right', fontFamily: 'var(--pp-font-mono)',
                      fontWeight: 700, fontSize: 20, color: 'var(--pp-pulse)',
                    }}>{brl(repasse.exemplo.produtora_cents)}</td>
                  </tr>
                </tbody>
              </table>
              <p style={{ color: 'var(--pp-fg-4)', fontSize: 11, marginTop: 8 }}>
                A taxa do provedor varia conforme a forma de pagamento; o valor acima é aproximado.
              </p>
            </div>
          )}

          {repasse?.como_funciona && (
            <div className="ck-card" style={{ marginBottom: 12 }}>
              <div className="ck-label">Regras do repasse</div>
              <ul style={{ margin: '10px 0 0', paddingLeft: 18, lineHeight: 1.7 }}>
                {repasse.como_funciona.map((linha) => <li key={linha}>{linha}</li>)}
              </ul>
            </div>
          )}

          <div className="ck-card">
            <div className="ck-field">
              <label className="ck-label">Carteira Asaas (walletId) — destino do repasse</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <input
                  className="ck-input"
                  style={{ flex: 1, minWidth: 240, fontFamily: 'var(--pp-font-mono)' }}
                  value={draft[org.id] ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, [org.id]: e.target.value }))}
                  placeholder="ex: 22e49669-..."
                />
                <button className="ck-btn ck-btn--primary" onClick={() => save(org.id)}>
                  {savedId === org.id ? <><Icon name="check" size={15} /> Salvo</> : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </Shell>
  );
}
