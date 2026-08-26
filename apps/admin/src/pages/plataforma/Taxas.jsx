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
          <div className="adm-eyebrow ck-c-amber">Taxas &amp; receita</div>
          <div className="adm-h1">Como a PulsePass <span className="accent ck-c-amber">monetiza</span></div>
          <p className="pp-muted ck-m-0 ck-mt-1 ck-w-mid">
            A taxa incide sobre o valor <strong>líquido</strong> da venda — o provedor
            desconta a taxa dele antes da divisão.
          </p>
        </div>

        {error && <ErrorBox>{error}</ErrorBox>}

        {/* Cards no desenho dos pricing tiers do mockup — mas só com o que
            existe de verdade: o padrão da plataforma e as exceções. */}
        <div className="ck-duo ck-ai-stretch">
          <div className="adm-fee ck-k--amber">
            <div className="pp-between ck-ai-start">
              <div>
                <div className="ck-display ck-w-bold ck-t-section">Taxa padrão</div>
                <div className="pp-muted ck-meta">vale para toda produtora sem taxa negociada</div>
              </div>
            </div>
            <div className="adm-fee__pct">{data.default_fee_percent}%</div>
            {/* Edição inline, como o painel "Editando" do mockup. */}
            <div className="pp-row ck-mt-4 pp-wrap">
              <label htmlFor="taxa-padrao" className="ck-label ck-hidden ck-sr">
                Nova taxa padrão em porcentagem
              </label>
              <input id="taxa-padrao" className="ck-input ck-input--num" type="number" min="0" max="100" step="0.01"
                value={padrao} onChange={(e) => setPadrao(e.target.value)} />
              <span className="pp-mono ck-t-section">%</span>
              <button className="ck-btn ck-btn--primary ck-btn--sm" onClick={salvarPadrao}
                disabled={salvando === 'padrao' || toBps(padrao) === data.default_fee_bps}>
                {salvando === 'padrao' ? 'Salvando…' : 'Aplicar novo padrão'}
              </button>
            </div>
            <div className="adm-fee__foot">
              <span>produtoras no padrão</span>
              <span className="pp-mono ck-w-bold ck-c-fg">{noPadrao}</span>
            </div>
          </div>

          <div className="adm-fee ck-k--violet">
            <div className="ck-display ck-w-bold ck-t-section">Negociadas</div>
            <div className="pp-muted ck-meta">exceções contratuais por produtora</div>
            <div className="adm-fee__pct ck-c-violet">{negociadas}</div>
            <p className="pp-muted ck-t-support ck-m-0 ck-mt-2 ck-lh">
              Vendas já realizadas mantêm a taxa que valia no momento da compra,
              e toda alteração fica registrada na trilha de auditoria.
            </p>
          </div>
        </div>

        {/* Taxa por produtora — o painel de edição do mockup, linha a linha. */}
        <div className="adm-panel">
          <div className="pp-between">
            <div>
              <div className="ck-display ck-w-semi ck-t-section">Taxa por produtora</div>
              <p className="pp-muted ck-t-support ck-m-0 ck-mt-1">
                deixe o campo vazio e aplique para a produtora voltar ao padrão
              </p>
            </div>
            <span className="pp-mono pp-muted ck-t-support">{data.organizations.length} orgs</span>
          </div>

          {data.organizations.length === 0 && (
            <p className="pp-muted ck-mt-4">Nenhuma produtora ainda.</p>
          )}

          <div className="ck-mt-3">
            {data.organizations.map((o) => (
              <div key={o.id} className="adm-orgfee">
                <div className="pp-grow ck-fit">
                  <strong>{o.name}</strong>
                  <div className="pp-muted-2 ck-meta">
                    <span className="ck-badge ck-t-label ck-mr-2">
                      {o.usa_padrao ? 'padrão' : 'negociada'}
                    </span>
                    {o.usa_padrao ? `usa o padrão (${data.default_fee_percent}%)` : `negociada: ${o.fee_percent}%`}
                    {/* Sem carteira não há split: a venda inteira fica na conta da
                        plataforma e o repasse vira transferência manual. */}
                    {!o.repasse_automatico && (
                      <span className="ck-c-amber"> · sem carteira Asaas: repasse manual</span>
                    )}
                  </div>
                </div>
                {/* O número que vale hoje, no peso do mockup. */}
                <span className={`adm-orgfee__pct ${o.usa_padrao ? 'pp-muted' : 'ck-c-amber'}`}>
                  {o.usa_padrao ? data.default_fee_percent : o.fee_percent}%
                </span>
                <label htmlFor={`fee-${o.id}`} className="ck-sr">
                  Nova taxa de {o.name} em porcentagem
                </label>
                <input id={`fee-${o.id}`} className="ck-input ck-input--num" type="number" min="0" max="100" step="0.01"
                  placeholder={data.default_fee_percent}
                  value={rascunho[o.id] ?? toPct(o.fee_bps)}
                  onChange={(e) => setRascunho((r) => ({ ...r, [o.id]: e.target.value }))}
                  />
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
