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
  const [abrindo, setAbrindo] = useState(null);   // orgId com o formulário aberto
  const [atualizando, setAtualizando] = useState(''); // orgId consultando o Asaas
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

  // A aprovação acontece do lado do Asaas, sem webhook para nos avisar: quem
  // enviou documento ontem abre esta tela hoje para saber se já pode receber.
  // Sem o botão, a resposta só chegava recarregando a página em fé.
  async function atualizarSubconta(orgId) {
    setError(''); setAtualizando(orgId);
    try {
      await api.refreshAsaasSubaccount(orgId);
      await load();
    } catch (e) { setError(e.message); } finally { setAtualizando(''); }
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

          {/* Subconta já criada por aqui: mostra o estado e o que falta. */}
          {repasse?.subconta && (
            <div className="ck-card" style={{ marginBottom: 12 }}>
              <div className="ck-label">Conta Asaas da produtora</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
                <span className={`ck-badge ${repasse.subconta.status === 'approved' ? 'ck-badge--success' : ''}`}>
                  {repasse.subconta.status}
                </span>
                <span style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 12, color: 'var(--pp-fg-3)' }}>
                  {repasse.subconta.account_id}
                </span>
                <button className="ck-btn ck-btn--glass" style={{ padding: '6px 12px', fontSize: 12 }}
                  onClick={() => atualizarSubconta(org.id)} disabled={atualizando === org.id}>
                  {atualizando === org.id ? 'Consultando…' : <><Icon name="clock" size={13} /> Atualizar status</>}
                </button>
              </div>
              {repasse.subconta.pendente_documentos && (
                <p style={{ color: 'var(--pp-amber)', fontSize: 13, marginTop: 10 }}>
                  Faltam documentos. Sem aprovação a conta não recebe —{' '}
                  <a href={repasse.subconta.onboarding_url} target="_blank" rel="noreferrer"
                    style={{ color: 'var(--pp-pulse)', textDecoration: 'underline' }}>
                    enviar agora
                  </a>.
                </p>
              )}
            </div>
          )}

          <div className="ck-card">
            {!repasse?.subconta && (
              <>
                <div className="ck-label">Ainda não tem conta Asaas?</div>
                <p style={{ color: 'var(--pp-fg-4)', fontSize: 12, margin: '6px 0 12px' }}>
                  Abrimos a conta para você aqui mesmo — o destino do repasse fica
                  configurado na hora, sem precisar procurar código em outro painel.
                </p>
                <button className="ck-btn ck-btn--primary" style={{ marginBottom: 20 }}
                  onClick={() => setAbrindo(org.id)}>
                  <Icon name="plus" size={15} /> Criar conta Asaas
                </button>
              </>
            )}

            <div className="ck-field">
              <label htmlFor={`wallet-${org.id}`} className="ck-label">
                {repasse?.subconta ? 'Carteira (walletId)' : 'Ou informe o walletId de uma conta que você já tem'}
              </label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <input
                  id={`wallet-${org.id}`}
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

          {abrindo === org.id && (
            <NovaContaAsaas
              orgName={org.name}
              onCancel={() => setAbrindo(null)}
              onDone={() => { setAbrindo(null); load(); }}
              onError={setError}
              orgId={org.id}
            />
          )}
        </div>
      ))}
    </Shell>
  );
}

/**
 * Abertura da conta Asaas da produtora.
 *
 * Os campos são exatamente os que o provedor exige em POST /accounts — pedir
 * menos gera erro só no envio, e pedir mais é fricção à toa. O aviso sobre
 * documentos aparece antes: conta criada sem documento aprovado NÃO recebe, e
 * descobrir isso na véspera do evento é tarde.
 */
function NovaContaAsaas({ orgId, orgName, onCancel, onDone, onError }) {
  const [f, setF] = useState({
    name: orgName ?? '', email: '', cpfCnpj: '', mobilePhone: '', incomeValue: '',
    postalCode: '', address: '', addressNumber: '', province: '', complement: '',
    companyType: 'LIMITED',
  });
  const [enviando, setEnviando] = useState(false);
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));

  async function enviar(e) {
    e.preventDefault();
    setEnviando(true); onError('');
    try {
      await api.createAsaasSubaccount(orgId, {
        ...f,
        incomeValue: Number(String(f.incomeValue).replace(',', '.')),
        complement: f.complement || undefined,
      });
      onDone();
    } catch (err) { onError(err.message); } finally { setEnviando(false); }
  }

  return (
    <form className="ck-card" style={{ marginTop: 12 }} onSubmit={enviar}>
      <div className="ck-label">Abrir conta Asaas · {orgName}</div>
      <p style={{ color: 'var(--pp-fg-4)', fontSize: 12, margin: '6px 0 14px' }}>
        A conta é aberta em nome da sua produtora e o repasse passa a ser automático.
        Depois de criada, o Asaas pode pedir documentos — sem essa aprovação a conta
        não recebe.
      </p>

      <div className="ck-row">
        <div className="ck-field" style={{ margin: 0 }}>
          <label htmlFor="repasse-1" className="ck-label">Razão social / nome</label>
          <input id="repasse-1" className="ck-input" name="organization" autoComplete="organization" value={f.name} onChange={set('name')} required minLength={2} />
        </div>
        <div className="ck-field" style={{ margin: 0 }}>
          <label htmlFor="repasse-2" className="ck-label">CNPJ ou CPF</label>
          <input id="repasse-2" className="ck-input" inputMode="numeric" value={f.cpfCnpj} onChange={set('cpfCnpj')} required
            placeholder="somente números" />
        </div>
      </div>

      <div className="ck-row">
        <div className="ck-field" style={{ margin: 0 }}>
          <label htmlFor="repasse-3" className="ck-label">E-mail da conta</label>
          <input id="repasse-3" className="ck-input" type="email" autoComplete="email" inputMode="email" autoCapitalize="off" autoCorrect="off" spellCheck="false" value={f.email} onChange={set('email')} required />
        </div>
        <div className="ck-field" style={{ margin: 0 }}>
          <label htmlFor="repasse-4" className="ck-label">Celular</label>
          <input id="repasse-4" className="ck-input" type="tel" autoComplete="tel" inputMode="tel" value={f.mobilePhone} onChange={set('mobilePhone')} required
            placeholder="11999998888" />
        </div>
      </div>

      <div className="ck-row">
        <div className="ck-field" style={{ margin: 0 }}>
          <label htmlFor="repasse-5" className="ck-label">Faturamento mensal (R$)</label>
          <input id="repasse-5" className="ck-input" type="number" min="1" step="0.01"
            value={f.incomeValue} onChange={set('incomeValue')} required />
        </div>
        <div className="ck-field" style={{ margin: 0 }}>
          <label htmlFor="repasse-6" className="ck-label">Tipo</label>
          <select id="repasse-6" className="ck-select" value={f.companyType} onChange={set('companyType')}>
            <option value="MEI">MEI</option>
            <option value="LIMITED">LTDA</option>
            <option value="INDIVIDUAL">Individual</option>
            <option value="ASSOCIATION">Associação</option>
          </select>
        </div>
      </div>

      <div className="ck-row">
        <div className="ck-field" style={{ margin: 0 }}>
          <label htmlFor="repasse-7" className="ck-label">CEP</label>
          <input id="repasse-7" className="ck-input" autoComplete="postal-code" inputMode="numeric" value={f.postalCode} onChange={set('postalCode')} required
            placeholder="01001000" />
        </div>
        <div className="ck-field" style={{ margin: 0 }}>
          <label htmlFor="repasse-8" className="ck-label">Bairro</label>
          <input id="repasse-8" className="ck-input" autoComplete="address-level2" value={f.province} onChange={set('province')} required />
        </div>
      </div>

      <div className="ck-row">
        <div className="ck-field" style={{ margin: 0 }}>
          <label htmlFor="repasse-9" className="ck-label">Endereço</label>
          <input id="repasse-9" className="ck-input" autoComplete="street-address" value={f.address} onChange={set('address')} required />
        </div>
        <div className="ck-field" style={{ margin: 0 }}>
          <label htmlFor="repasse-10" className="ck-label">Número</label>
          <input id="repasse-10" className="ck-input" inputMode="numeric" value={f.addressNumber} onChange={set('addressNumber')} required />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
        <button className="ck-btn ck-btn--primary" disabled={enviando}>
          {enviando ? 'Abrindo conta…' : 'Abrir conta'}
        </button>
        <button type="button" className="ck-btn ck-btn--glass" onClick={onCancel} disabled={enviando}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
