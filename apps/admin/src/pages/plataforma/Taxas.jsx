import { useCallback, useEffect, useState } from 'react';
import { AdmShell } from '../../components/AdmShell.jsx';
import { Loading, ErrorBox } from '../../components/Shell.jsx';
import { api } from '../../lib/api.js';

// Taxa é receita da plataforma: a tela mostra o padrão e cada exceção
// negociada, sempre com o valor em % (bps é detalhe interno, ninguém negocia
// contrato em pontos-base).
const toPct = (bps) => (bps == null ? '' : String(bps / 100));
const toBps = (pct) => Math.round(Number(String(pct).replace(',', '.')) * 100);

export default function PlatformTaxas() {
  const [state, setState] = useState({ status: 'loading' });
  const [error, setError] = useState('');
  const [padrao, setPadrao] = useState('');
  const [rascunho, setRascunho] = useState({});   // { orgId: '7' }
  const [salvando, setSalvando] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await api.platformBilling();
      setState({ status: 'ok', data });
      setPadrao(toPct(data.default_fee_bps));
    } catch (e) { setState({ status: 'error', message: e.message }); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function salvarPadrao() {
    setSalvando('padrao'); setError('');
    try {
      await api.setDefaultFee(toBps(padrao));
      await load();
    } catch (e) { setError(e.message); } finally { setSalvando(null); }
  }

  async function salvarOrg(org) {
    setSalvando(org.id); setError('');
    try {
      const v = rascunho[org.id];
      // Campo vazio devolve a produtora ao padrão da plataforma.
      await api.setOrgFee(org.id, v === '' || v == null ? null : toBps(v));
      setRascunho((r) => { const c = { ...r }; delete c[org.id]; return c; });
      await load();
    } catch (e) { setError(e.message); } finally { setSalvando(null); }
  }

  if (state.status === 'loading') return <AdmShell><Loading /></AdmShell>;
  if (state.status === 'error') return <AdmShell><ErrorBox>{state.message}</ErrorBox></AdmShell>;

  const { data } = state;

  return (
    <AdmShell>
      <div className="ck-eyebrow">plataforma · receita</div>
      <h1 className="ck-h1">Taxas</h1>
      <p className="ck-sub">
        A taxa incide sobre o valor <strong>líquido</strong> da venda — o provedor
        desconta a taxa dele antes da divisão.
      </p>

      {error && <ErrorBox>{error}</ErrorBox>}

      <div className="ck-card" style={{ maxWidth: 560 }}>
        <div className="ck-label">Taxa padrão da plataforma</div>
        <p style={{ color: 'var(--pp-fg-4)', fontSize: 12, marginBottom: 12 }}>
          Vale para toda produtora sem taxa negociada.
        </p>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input className="ck-input" type="number" min="0" max="100" step="0.01"
            value={padrao} onChange={(e) => setPadrao(e.target.value)} style={{ maxWidth: 130 }} />
          <span style={{ fontSize: 20, fontFamily: 'var(--pp-font-mono)' }}>%</span>
          <button className="ck-btn ck-btn--primary" onClick={salvarPadrao}
            disabled={salvando === 'padrao' || toBps(padrao) === data.default_fee_bps}>
            {salvando === 'padrao' ? 'Salvando…' : 'Salvar padrão'}
          </button>
        </div>
      </div>

      <div className="ck-card" style={{ maxWidth: 760, marginTop: 16, padding: 0, overflow: 'hidden' }}>
        <div className="ck-label" style={{ padding: '16px 18px 8px' }}>Taxa por produtora</div>
        {data.organizations.length === 0 && <div className="ck-empty">Nenhuma produtora ainda.</div>}
        {data.organizations.map((o, i) => (
          <div key={o.id} style={{
            display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
            padding: '14px 18px',
            borderBottom: i < data.organizations.length - 1 ? '1px solid var(--pp-edge-1)' : 'none',
          }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <strong>{o.name}</strong>
              <div style={{ color: 'var(--pp-fg-4)', fontSize: 12, marginTop: 2 }}>
                {o.usa_padrao ? `usa o padrão (${data.default_fee_percent}%)` : `negociada: ${o.fee_percent}%`}
                {/* Sem carteira não há split: a venda inteira fica na conta da
                    plataforma e o repasse vira transferência manual. */}
                {!o.repasse_automatico && (
                  <span style={{ color: 'var(--pp-amber)' }}> · sem carteira Asaas: repasse manual</span>
                )}
              </div>
            </div>
            <input className="ck-input" type="number" min="0" max="100" step="0.01"
              placeholder={data.default_fee_percent}
              value={rascunho[o.id] ?? toPct(o.fee_bps)}
              onChange={(e) => setRascunho((r) => ({ ...r, [o.id]: e.target.value }))}
              style={{ maxWidth: 110 }} />
            <span style={{ fontFamily: 'var(--pp-font-mono)' }}>%</span>
            <button className="ck-btn ck-btn--glass ck-btn--sm" onClick={() => salvarOrg(o)}
              disabled={salvando === o.id || rascunho[o.id] === undefined}>
              {salvando === o.id ? '…' : 'Aplicar'}
            </button>
          </div>
        ))}
        <p style={{ color: 'var(--pp-fg-4)', fontSize: 12, padding: '12px 18px' }}>
          Deixe o campo vazio e aplique para a produtora voltar ao padrão.
          Toda alteração fica registrada na trilha de auditoria, e vendas já
          realizadas mantêm a taxa que valia no momento da compra.
        </p>
      </div>
    </AdmShell>
  );
}
