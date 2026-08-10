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
 *
 * Layout segue o mockup AdmAuditScreen do design system (stream de log em
 * fonte mono + chips de filtro + faixa destacada pra decisão pendente),
 * mas só com colunas que o banco realmente tem: sem role, sem hash, sem
 * status ok/fail — audit_log não guarda nada disso.
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

/* Chips de domínio — cada um vira um prefixo real do filtro `action` do
   backend (ilike 'prefixo%'). Só listamos domínios que de fato geram
   registro hoje; chip que nunca acha nada é pior que chip nenhum. */
const DOMINIOS = [
  { k: '', label: 'Todos' },
  { k: 'box_office', label: 'Bilheteria' },
  { k: 'order', label: 'Reembolsos' },
  { k: 'staff', label: 'Equipe' },
  { k: 'event', label: 'Evento' },
];

export default function Auditoria() {
  const { id } = useParams();
  const [state, setState] = useState({ status: 'loading' });
  const [soDinheiro, setSoDinheiro] = useState(false);
  const [dominio, setDominio] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    try {
      const [trilha, fraude] = await Promise.all([
        api.eventAudit(id, { money: soDinheiro, action: dominio || undefined }),
        api.eventFraudCases(id),
      ]);
      setState({ status: 'ok', trilha, fraude });
    } catch (e) { setState({ status: 'error', message: e.message }); }
  }, [id, soDinheiro, dominio]);
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

      {/* Cabeçalho no layout do mockup: título à esquerda, selo de contexto à
          direita. O selo substitui o "4.2M eventos · 30d" do design — aqui o
          número honesto é quantos registros a consulta atual devolveu. */}
      <div className="ck-between" style={{ alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="ck-eyebrow">confiança · auditoria</div>
          <h1 className="ck-h1">Auditoria do evento</h1>
          <p className="ck-sub" style={{ marginBottom: 0 }}>
            Registro de quem fez o quê. Não pode ser alterado nem apagado — nem por nós.
          </p>
        </div>
        <span className="pp-badge" title="Total retornado pela consulta atual">
          {trilha.entries.length} registro(s) · imutável
        </span>
      </div>

      {error && <ErrorBox>{error}</ErrorBox>}

      {/* Casos primeiro: exigem decisão da casa. Faixa destacada como a de
          "ação aguardando aprovação" do mockup — ícone, contexto e o botão
          de decidir na mesma linha. */}
      {abertos.length > 0 && (
        <div className="ck-card" style={{
          marginTop: 20, borderColor: 'rgba(255,59,48,0.4)', background: 'rgba(255,59,48,0.06)',
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

      {/* Filtros em chips, como no mockup. Todos batem em parâmetro REAL do
          backend (prefixo de action + amount_cents not null) — nada é
          filtrado só no cliente pra não mentir sobre o total. */}
      <div role="group" aria-label="Filtrar registros"
        style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '20px 0 12px', flexWrap: 'wrap' }}>
        {DOMINIOS.map((d) => (
          <button key={d.k} type="button"
            className={`pp-chip ${dominio === d.k ? 'pp-chip--active' : ''}`}
            aria-pressed={dominio === d.k}
            onClick={() => setDominio(d.k)}>
            {d.label}
          </button>
        ))}
        <button type="button"
          className={`pp-chip ${soDinheiro ? 'pp-chip--active' : ''}`}
          aria-pressed={soDinheiro}
          onClick={() => setSoDinheiro((v) => !v)}>
          <Icon name="dollar" size={14} /> Só o que moveu dinheiro
        </button>
      </div>

      {trilha.entries.length === 0 ? (
        <div className="ck-empty">
          <p style={{ margin: '0 0 12px' }}>
            {(dominio || soDinheiro)
              ? 'Nenhum registro com esses filtros.'
              : 'Nenhuma ação registrada ainda.'}
          </p>
          {(dominio || soDinheiro) && (
            <button className="ck-btn ck-btn--glass ck-btn--sm"
              onClick={() => { setDominio(''); setSoDinheiro(false); }}>
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        /* Stream de log do mockup: colunas fixas, timestamp e valor em mono.
           Sem coluna de role/hash/status — o banco não tem esses campos. */
        <div className="ck-card" style={{ padding: 0 }}>
          <table className="ck-table">
            <thead>
              <tr>
                <th>Quando</th>
                <th>Quem</th>
                <th>Ação</th>
                <th>Detalhe</th>
                <th className="num">Valor</th>
              </tr>
            </thead>
            <tbody>
              {trilha.entries.map((e) => (
                <tr key={e.id}>
                  <td style={{
                    fontFamily: 'var(--pp-font-mono)', fontSize: 12,
                    color: 'var(--pp-fg-3)', whiteSpace: 'nowrap',
                  }}>
                    {dateTime(e.at)}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{e.actor_email ?? 'sistema'}</div>
                    {e.actor_ip && (
                      <div style={{ color: 'var(--pp-fg-4)', fontSize: 11, fontFamily: 'var(--pp-font-mono)' }}>
                        {e.actor_ip}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{rotulo(e.action)}</div>
                    {/* O código cru embaixo mantém o clima de log do mockup e
                        serve de referência exata pra quem for investigar. */}
                    <div style={{ color: 'var(--pp-fg-4)', fontSize: 11, fontFamily: 'var(--pp-font-mono)' }}>
                      {e.action}
                    </div>
                  </td>
                  <td style={{ color: 'var(--pp-fg-3)', fontSize: 13 }}>
                    {/* Antes → depois é o que responde "o que mudou". */}
                    {e.before && e.after
                      ? <>{resumo(e.before)} → {resumo(e.after)}</>
                      : (e.note ?? '—')}
                  </td>
                  <td className="num" style={{ fontFamily: 'var(--pp-font-mono)' }}>
                    {e.amount_cents != null ? brl(e.amount_cents) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
