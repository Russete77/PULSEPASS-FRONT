import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Shell, Loading, ErrorBox, BackLink } from '../components/Shell.jsx';
import { Icon } from '@pulsepass/shared/Icon';
import { api } from '../lib/api.js';
import { brl, dateTime } from '../lib/format.js';

/**
 * Auditoria do evento — quem fez o quê, e o que a casa precisa resolver.
 *
 * Duas coisas na mesma tela porque respondem à mesma pergunta ("posso confiar
 * no que aconteceu aqui?"): a trilha imutável de ações sensíveis e os casos
 * que o sistema NÃO consegue desfazer sozinho — alguém que entrou e depois
 * estornou, ou que bebeu e estornou a recarga.
 *
 * Os casos vêm primeiro de propósito: exigem decisão humana, a trilha é só
 * consulta.
 */
const ACAO = {
  'box_office.sale': 'Venda na bilheteria',
  'order.refund': 'Reembolso',
  'organization.wallet_change': 'Troca da carteira de repasse',
  'organization.asaas_subaccount_created': 'Conta Asaas criada',
  'platform.default_fee_change': 'Taxa padrão alterada',
  'platform.org_fee_change': 'Taxa da produtora alterada',
  'staff.add': 'Entrou na equipe',
  'staff.remove': 'Saiu da equipe',
};
const rotulo = (a) => ACAO[a] ?? (a.startsWith('event.status.') ? `Evento ${a.split('.').pop()}` : a);

const TIPO_CASO = {
  entered_then_refunded: 'Entrou no evento e estornou o pagamento',
  consumed_then_refunded: 'Consumiu no bar e estornou a recarga',
};

export default function Auditoria() {
  const { id } = useParams();
  const [state, setState] = useState({ status: 'loading' });
  const [soDinheiro, setSoDinheiro] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    try {
      const [trilha, fraude] = await Promise.all([
        api.eventAudit(id, { money: soDinheiro }),
        api.eventFraudCases(id),
      ]);
      setState({ status: 'ok', trilha, fraude });
    } catch (e) { setState({ status: 'error', message: e.message }); }
  }, [id, soDinheiro]);
  useEffect(() => { load(); }, [load]);

  async function resolver(caso) {
    setBusy(caso.id); setError('');
    try { await api.resolveFraudCase(caso.id); await load(); }
    catch (e) { setError(e.message); } finally { setBusy(null); }
  }

  if (state.status === 'loading') return <Shell><Loading /></Shell>;
  if (state.status === 'error') {
    return <Shell><BackLink to={`/eventos/${id}`} label="Dashboard" /><ErrorBox>{state.message}</ErrorBox></Shell>;
  }

  const { trilha, fraude } = state;
  const abertos = fraude.cases.filter((c) => !c.resolved_at);

  return (
    <Shell>
      <BackLink to={`/eventos/${id}`} label="Dashboard" />
      <div className="ck-eyebrow">confiança · auditoria</div>
      <h1 className="ck-h1">Auditoria do evento</h1>
      <p className="ck-sub">
        Registro de quem fez o quê. Não pode ser alterado nem apagado — nem por nós.
      </p>

      {error && <ErrorBox>{error}</ErrorBox>}

      {/* Casos primeiro: exigem decisão da casa. */}
      {abertos.length > 0 && (
        <div className="ck-card" style={{
          maxWidth: 820, borderColor: 'rgba(255,59,48,0.4)', background: 'rgba(255,59,48,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <strong style={{ fontSize: 'var(--pp-fs-18)' }}>
              {abertos.length} caso(s) para você decidir
            </strong>
            <span style={{ color: 'var(--pp-fg-3)' }}>
              {brl(fraude.prejuizo_aberto_cents)} em jogo
            </span>
          </div>
          <p style={{ color: 'var(--pp-fg-3)', fontSize: 13, margin: '6px 0 14px' }}>
            O pagamento foi revertido depois do consumo. Não há como desfazer a
            entrada de quem já passou pela porta nem a bebida que já foi servida —
            a decisão de cobrar, bloquear ou deixar passar é sua.
          </p>
          {abertos.map((c) => (
            <div key={c.id} style={{
              display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
              padding: '12px 0', borderTop: '1px solid var(--pp-edge-1)',
            }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ fontWeight: 600 }}>{TIPO_CASO[c.kind] ?? c.kind}</div>
                <div style={{ color: 'var(--pp-fg-4)', fontSize: 12, marginTop: 2 }}>
                  {c.detail} · {dateTime(c.created_at)}
                </div>
              </div>
              <span style={{ fontFamily: 'var(--pp-font-mono)' }}>{brl(c.amount_cents ?? 0)}</span>
              <button className="ck-btn ck-btn--glass ck-btn--sm"
                disabled={busy === c.id} onClick={() => resolver(c)}>
                {busy === c.id ? '…' : 'Marcar resolvido'}
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', margin: '20px 0 12px', flexWrap: 'wrap' }}>
        <button className={`ck-btn ck-btn--sm ${soDinheiro ? 'ck-btn--primary' : 'ck-btn--glass'}`}
          onClick={() => setSoDinheiro((v) => !v)}>
          <Icon name="dollar" size={14} /> Só o que moveu dinheiro
        </button>
        <span style={{ color: 'var(--pp-fg-4)', fontSize: 13 }}>
          {trilha.entries.length} registro(s)
        </span>
      </div>

      {trilha.entries.length === 0 ? (
        <div className="ck-empty" style={{ maxWidth: 820 }}>Nenhuma ação registrada ainda.</div>
      ) : (
        <div className="ck-card" style={{ maxWidth: 900, padding: 0, overflow: 'hidden' }}>
          {trilha.entries.map((e, i) => (
            <div key={e.id} style={{
              display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', padding: '12px 18px',
              borderBottom: i < trilha.entries.length - 1 ? '1px solid var(--pp-edge-1)' : 'none',
            }}>
              <span style={{ color: 'var(--pp-fg-4)', fontSize: 12, minWidth: 132, fontFamily: 'var(--pp-font-mono)' }}>
                {dateTime(e.at)}
              </span>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontWeight: 600 }}>{rotulo(e.action)}</div>
                <div style={{ color: 'var(--pp-fg-4)', fontSize: 12, marginTop: 2 }}>
                  {e.actor_email ?? 'sistema'}{e.actor_ip ? ` · ${e.actor_ip}` : ''}
                  {/* Antes → depois é o que responde "o que mudou". */}
                  {e.before && e.after && (
                    <> · {resumo(e.before)} → {resumo(e.after)}</>
                  )}
                </div>
              </div>
              {e.amount_cents != null && (
                <span style={{ fontFamily: 'var(--pp-font-mono)' }}>{brl(e.amount_cents)}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}

/** Resume o antes/depois sem despejar JSON cru na tela. */
function resumo(obj) {
  const v = Object.values(obj ?? {})[0];
  if (v == null) return 'vazio';
  return String(v).length > 22 ? `${String(v).slice(0, 22)}…` : String(v);
}
