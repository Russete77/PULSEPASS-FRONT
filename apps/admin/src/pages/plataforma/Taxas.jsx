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
  const noPadrao = data.organizations.filter((o) => o.usa_padrao).length;
  const negociadas = data.organizations.length - noPadrao;

  return (
    <AdmShell where="Taxas e split · alterações valem para as próximas vendas">
      <div className="pp-stack pp-stack-5 pp-reveal">
        <div>
          <div className="adm-eyebrow" style={{ color: 'var(--pp-amber)' }}>Taxas &amp; receita</div>
          <div className="adm-h1">Como a PulsePass <span className="accent" style={{ color: 'var(--pp-amber)' }}>monetiza</span></div>
          <p className="pp-muted" style={{ margin: '4px 0 0', maxWidth: 620 }}>
            A taxa incide sobre o valor <strong>líquido</strong> da venda — o provedor
            desconta a taxa dele antes da divisão.
          </p>
        </div>

        {error && <ErrorBox>{error}</ErrorBox>}

        {/* Cards no desenho dos pricing tiers do mockup — mas só com o que
            existe de verdade: o padrão da plataforma e as exceções. */}
        <div className="pp-cols-2" style={{ gridTemplateColumns: '1.2fr 1fr', alignItems: 'stretch' }}>
          <div className="adm-fee" style={{ '--k': 'var(--pp-amber)' }}>
            <div className="pp-between" style={{ alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 'var(--pp-fs-18)' }}>Taxa padrão</div>
                <div className="pp-muted" style={{ fontSize: 'var(--pp-fs-12)', marginTop: 3 }}>vale para toda produtora sem taxa negociada</div>
              </div>
            </div>
            <div className="adm-fee__pct">{data.default_fee_percent}%</div>
            {/* Edição inline, como o painel "Editando" do mockup. */}
            <div className="pp-row" style={{ marginTop: 14, flexWrap: 'wrap' }}>
              <label htmlFor="taxa-padrao" className="ck-label" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
                Nova taxa padrão em porcentagem
              </label>
              <input id="taxa-padrao" className="ck-input" type="number" min="0" max="100" step="0.01"
                value={padrao} onChange={(e) => setPadrao(e.target.value)} style={{ maxWidth: 120 }} />
              <span className="pp-mono" style={{ fontSize: 'var(--pp-fs-18)' }}>%</span>
              <button className="ck-btn ck-btn--primary ck-btn--sm" onClick={salvarPadrao}
                disabled={salvando === 'padrao' || toBps(padrao) === data.default_fee_bps}>
                {salvando === 'padrao' ? 'Salvando…' : 'Aplicar novo padrão'}
              </button>
            </div>
            <div className="adm-fee__foot">
              <span>produtoras no padrão</span>
              <span className="pp-mono" style={{ fontWeight: 700, color: 'var(--pp-fg)' }}>{noPadrao}</span>
            </div>
          </div>

          <div className="adm-fee" style={{ '--k': 'var(--pp-violet)' }}>
            <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 'var(--pp-fs-18)' }}>Negociadas</div>
            <div className="pp-muted" style={{ fontSize: 'var(--pp-fs-12)', marginTop: 3 }}>exceções contratuais por produtora</div>
            <div className="adm-fee__pct" style={{ color: 'var(--pp-violet)' }}>{negociadas}</div>
            <p className="pp-muted" style={{ fontSize: 'var(--pp-fs-12)', margin: '6px 0 0', lineHeight: 1.5 }}>
              Vendas já realizadas mantêm a taxa que valia no momento da compra,
              e toda alteração fica registrada na trilha de auditoria.
            </p>
          </div>
        </div>

        {/* Taxa por produtora — o painel de edição do mockup, linha a linha. */}
        <div className="adm-panel">
          <div className="pp-between">
            <div>
              <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 600, fontSize: 'var(--pp-fs-18)' }}>Taxa por produtora</div>
              <p className="pp-muted" style={{ fontSize: 'var(--pp-fs-12)', margin: '2px 0 0' }}>
                deixe o campo vazio e aplique para a produtora voltar ao padrão
              </p>
            </div>
            <span className="pp-mono pp-muted" style={{ fontSize: 'var(--pp-fs-12)' }}>{data.organizations.length} orgs</span>
          </div>

          {data.organizations.length === 0 && (
            <p className="pp-muted" style={{ marginTop: 'var(--pp-s-4)' }}>Nenhuma produtora ainda.</p>
          )}

          <div style={{ marginTop: 'var(--pp-s-3)' }}>
            {data.organizations.map((o) => (
              <div key={o.id} className="adm-orgfee">
                <div className="pp-grow" style={{ minWidth: 180 }}>
                  <strong>{o.name}</strong>
                  <div style={{ color: 'var(--pp-fg-4)', fontSize: 12, marginTop: 2 }}>
                    <span className="ck-badge" style={{ fontSize: 9, marginRight: 6 }}>
                      {o.usa_padrao ? 'padrão' : 'negociada'}
                    </span>
                    {o.usa_padrao ? `usa o padrão (${data.default_fee_percent}%)` : `negociada: ${o.fee_percent}%`}
                    {/* Sem carteira não há split: a venda inteira fica na conta da
                        plataforma e o repasse vira transferência manual. */}
                    {!o.repasse_automatico && (
                      <span style={{ color: 'var(--pp-amber)' }}> · sem carteira Asaas: repasse manual</span>
                    )}
                  </div>
                </div>
                {/* O número que vale hoje, no peso do mockup. */}
                <span className="adm-orgfee__pct" style={{ color: o.usa_padrao ? 'var(--pp-fg-3)' : 'var(--pp-amber)' }}>
                  {o.usa_padrao ? data.default_fee_percent : o.fee_percent}%
                </span>
                <label htmlFor={`fee-${o.id}`} style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
                  Nova taxa de {o.name} em porcentagem
                </label>
                <input id={`fee-${o.id}`} className="ck-input" type="number" min="0" max="100" step="0.01"
                  placeholder={data.default_fee_percent}
                  value={rascunho[o.id] ?? toPct(o.fee_bps)}
                  onChange={(e) => setRascunho((r) => ({ ...r, [o.id]: e.target.value }))}
                  style={{ maxWidth: 104 }} />
                <span className="pp-mono">%</span>
                <button className="ck-btn ck-btn--glass ck-btn--sm" onClick={() => salvarOrg(o)}
                  disabled={salvando === o.id || rascunho[o.id] === undefined}>
                  {salvando === o.id ? '…' : 'Aplicar'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdmShell>
  );
}
