import { useEffect, useState } from 'react';
import { Shell, Loading, ErrorBox } from '../components/Shell.jsx';
import { api } from '../lib/api.js';

// Configura a carteira Asaas (walletId) de cada organização da produtora.
// É o destino do repasse (split) das vendas — a plataforma retém a taxa.
export default function Repasse() {
  const [orgs, setOrgs] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [draft, setDraft] = useState({}); // orgId -> walletId
  const [savedId, setSavedId] = useState('');

  async function load() {
    try {
      const me = await api.me();
      setOrgs(me.organizations ?? []);
      const d = {};
      (me.organizations ?? []).forEach((o) => { d[o.id] = o.asaas_wallet_id ?? ''; });
      setDraft(d);
      setStatus('done');
    } catch (e) { setError(e.message); setStatus('error'); }
  }
  useEffect(() => { load(); }, []);

  async function save(orgId) {
    setError(''); setSavedId('');
    try {
      await api.setOrgWallet(orgId, draft[orgId]?.trim() || null);
      setSavedId(orgId);
      setTimeout(() => setSavedId(''), 2000);
    } catch (e) { setError(e.message); }
  }

  if (status === 'loading') return <Shell><Loading /></Shell>;

  return (
    <Shell>
      <div className="ck-eyebrow">financeiro · repasse</div>
      <h1 className="ck-h1">Repasse (carteira Asaas)</h1>
      <p className="ck-sub">
        Informe o walletId da conta Asaas de cada organização. As vendas são repassadas para ela
        automaticamente (split); a plataforma retém a taxa configurada. Sem walletId, a venda funciona
        mas sem repasse automático.
      </p>

      {error && <ErrorBox>{error}</ErrorBox>}

      {orgs.length === 0 ? (
        <div className="ck-card"><p style={{ color: 'var(--pp-fg-3)' }}>Nenhuma organização ainda.</p></div>
      ) : (
        orgs.map((o) => (
          <div key={o.id} className="ck-card" style={{ maxWidth: 560, marginBottom: 12 }}>
            <strong>{o.name}</strong>
            <div className="ck-field" style={{ marginTop: 10 }}>
              <label className="ck-label">walletId Asaas</label>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  className="ck-input"
                  style={{ flex: 1, fontFamily: 'var(--pp-font-mono)' }}
                  value={draft[o.id] ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, [o.id]: e.target.value }))}
                  placeholder="ex: 22e49669-..."
                />
                <button className="ck-btn ck-btn--primary" onClick={() => save(o.id)}>
                  {savedId === o.id ? 'Salvo ✓' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </Shell>
  );
}
