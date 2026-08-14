import { useCallback, useEffect, useMemo, useState } from 'react';
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
 *
 * Sobre filtrar: o backend PAGINA (limite de 200, teto de 500, sempre do mais
 * recente pro mais antigo). Por isso os chips viram parâmetro de consulta de
 * verdade, e o campo de texto — que só sabe olhar o que já chegou — é rotulado
 * como "filtrar nesta página". Chamar de "busca" faria alguém concluir que um
 * registro não existe quando ele só não está nesta página; numa tela de
 * auditoria essa conclusão errada é o pior defeito possível.
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

/* Colunas do CSV — exatamente as que audit_log tem e o endpoint devolve
   (audit/repo.js findEntries). Ficam de fora event_id e organization_id:
   são constantes numa exportação de UM evento, então só somariam ruído.
   Nada aqui é derivado nem embelezado: o CSV precisa poder ser confrontado
   com o banco linha a linha, senão não serve de prova. */
const CSV_COLS = [
  ['at', (e) => e.at],
  ['action', (e) => e.action],
  ['actor_email', (e) => e.actor_email ?? ''],
  ['actor_id', (e) => e.actor_id ?? ''],
  ['actor_ip', (e) => e.actor_ip ?? ''],
  ['entity', (e) => e.entity ?? ''],
  ['entity_id', (e) => e.entity_id ?? ''],
  ['amount_cents', (e) => e.amount_cents ?? ''],
  ['before', (e) => (e.before ? JSON.stringify(e.before) : '')],
  ['after', (e) => (e.after ? JSON.stringify(e.after) : '')],
  ['note', (e) => e.note ?? ''],
  ['id', (e) => e.id],
];

export default function Auditoria() {
  const { id } = useParams();
  const [state, setState] = useState({ status: 'loading' });
  const [soDinheiro, setSoDinheiro] = useState(false);
  const [dominio, setDominio] = useState('');
  const [q, setQ] = useState('');
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

  /* Filtro de texto sobre o que JÁ está na tela. Roda antes do early return
     porque hook não pode ficar atrás de `if`. Olha os campos que uma pessoa
     usaria pra procurar: quem, de onde, o que e a anotação. */
  const carregadas = state.trilha?.entries ?? [];
  const visiveis = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return carregadas;
    return carregadas.filter((e) => (
      (e.actor_email ?? '').toLowerCase().includes(s)
      || (e.actor_ip ?? '').includes(s)
      || e.action.toLowerCase().includes(s)
      || rotulo(e.action).toLowerCase().includes(s)
      || (e.entity ?? '').toLowerCase().includes(s)
      || (e.entity_id ?? '').toLowerCase().includes(s)
      || (e.note ?? '').toLowerCase().includes(s)
    ));
  }, [carregadas, q]);

  /* Exporta o que está na tela — mesmo padrão do CSV da lista de porta:
     gerado no cliente, sem endpoint novo. O arquivo leva os filtros no nome
     porque é assim que ele chega no e-mail do contador ou do advogado: sem o
     contexto no nome, um recorte de "só dinheiro" vira "a auditoria toda". */
  function exportarCsv() {
    const linhas = [
      CSV_COLS.map(([nome]) => nome),
      ...visiveis.map((e) => CSV_COLS.map(([, ler]) => ler(e))),
    ];
    const csv = linhas
      .map((l) => l.map((c) => `"${String(c ?? '').replaceAll('"', '""')}"`).join(';'))
      .join('\n');
    // BOM na frente: sem ele o Excel em pt-BR come os acentos.
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const sufixo = [dominio, soDinheiro ? 'dinheiro' : '', q.trim() ? 'filtrado' : '']
      .filter(Boolean).join('-');
    const a = Object.assign(document.createElement('a'), {
      href: url, download: `auditoria-${id}${sufixo ? `-${sufixo}` : ''}.csv`,
    });
    a.click();
    URL.revokeObjectURL(url);
  }

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
        {/* Selo + exportar do lado direito do título. O CSV existe porque a
            trilha só vira prova quando sai daqui: contador, advogado e sócio
            não entram no admin — recebem um arquivo. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span className="pp-badge" title="Total retornado pela consulta atual">
            {trilha.entries.length} registro(s) · imutável
          </span>
          <button type="button" className="ck-btn ck-btn--glass ck-btn--sm"
            onClick={exportarCsv} disabled={visiveis.length === 0}
            title="Baixa em CSV exatamente os registros listados abaixo, com os filtros aplicados">
            <Icon name="download" size={14} /> Exportar CSV ({visiveis.length})
          </button>
        </div>
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
          backend (prefixo de action + amount_cents not null): é o backend que
          refaz a consulta, então o resultado é o total de verdade. */}
      <div role="group" aria-label="Filtrar registros no servidor"
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

      {/* Campo de texto: peneira o que JÁ está carregado. O rótulo e a ajuda
          dizem isso na cara — quem procura um nome e não acha precisa saber
          que a resposta é "não está nesta página", não "não existe". */}
      {carregadas.length > 0 && (
        <div className="ck-field" style={{ maxWidth: 420, marginBottom: 12 }}>
          <label htmlFor="auditoria-filtro" className="ck-label">
            Filtrar nesta página
          </label>
          <div className="pp-inputwrap">
            <Icon name="search" size={16} />
            <input id="auditoria-filtro" type="search" className="ck-input"
              style={{ width: '100%', paddingLeft: 46 }}
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="e-mail, IP, ação, entidade…"
              aria-describedby="auditoria-filtro-ajuda" />
          </div>
          <p id="auditoria-filtro-ajuda"
            style={{ color: 'var(--pp-fg-4)', fontSize: 12, margin: '6px 0 0' }}>
            Peneira só os {carregadas.length} registro(s) carregados (os mais
            recentes). Para varrer o histórico inteiro, use os chips acima —
            esses vão ao servidor.
          </p>
        </div>
      )}

      {visiveis.length === 0 ? (
        <div className="ck-empty">
          <p style={{ margin: '0 0 12px' }}>
            {q.trim()
              ? `Nenhum dos ${carregadas.length} registro(s) desta página bate com “${q.trim()}”. Pode existir em registros mais antigos — filtre pelo domínio para o servidor buscar de novo.`
              : (dominio || soDinheiro)
                ? 'Nenhum registro com esses filtros.'
                : 'Nenhuma ação registrada ainda.'}
          </p>
          {(dominio || soDinheiro || q.trim()) && (
            <button className="ck-btn ck-btn--glass ck-btn--sm"
              onClick={() => { setDominio(''); setSoDinheiro(false); setQ(''); }}>
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
              {visiveis.map((e) => (
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
