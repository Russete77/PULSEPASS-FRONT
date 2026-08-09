import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Shell, Loading, ErrorBox, OpsBack } from '../components/Shell.jsx';
import { Icon } from '@pulsepass/shared/Icon';
import { api } from '../lib/api.js';

// Rótulo honesto do tipo de LISTA (propriedade da lista, não da pessoa).
const TIPO_LISTA = { vip: 'VIP', birthday: 'Aniversário', free_until: 'Free até' };

export default function ListaPorta() {
  const { id } = useParams();
  const [guests, setGuests] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [filtro, setFiltro] = useState('todos');    // todos | dentro | aguardando
  const [lista, setLista] = useState('');           // nome do promoter, '' = todas
  const [busy, setBusy] = useState(null);

  const load = useCallback(() => {
    // O resumo é opcional: se falhar, a tela continua com a contagem local.
    Promise.all([api.eventGuests(id), api.guestsSummary(id).catch(() => null)])
      .then(([d, s]) => { setGuests(d); setResumo(s); setStatus('done'); })
      .catch((e) => { setError(e.message); setStatus('error'); });
  }, [id]);
  useEffect(() => { load(); }, [load]);

  /** Libera `people` pessoas do convite. O grupo raramente chega junto. */
  async function checkin(g, people = 1) {
    setBusy(g.id); setError('');
    try {
      const r = await api.checkinGuest(g.id, people);
      if (r.result === 'over_capacity') { setError(r.message); return; }
      setGuests((gs) => gs.map((x) => (x.id === g.id
        ? { ...x, status: 'checked_in', checked_in_count: r.checked_in_count,
            checked_in_at: x.checked_in_at ?? new Date().toISOString() }
        : x)));
      // O resumo em pessoas acompanha localmente; o número real volta no reload.
      setResumo((s) => (s ? { ...s, people_arrived: (s.people_arrived ?? 0) + people } : s));
    } catch (e) { setError(e.message); } finally { setBusy(null); }
  }

  // As LISTAS do evento, com progresso — o agrupamento é local: o promoter já
  // vem em cada linha, só ninguém somava.
  const listas = useMemo(() => {
    const porNome = new Map();
    for (const g of guests) {
      const nome = g.promoter ?? 'Sem lista';
      const cur = porNome.get(nome) ?? { nome, tipo: g.list_type, total: 0, dentro: 0 };
      cur.total += g.party_size ?? 1;
      cur.dentro += g.checked_in_count ?? 0;
      porNome.set(nome, cur);
    }
    return [...porNome.values()].sort((a, b) => b.total - a.total);
  }, [guests]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return guests.filter((g) => {
      if (lista && (g.promoter ?? 'Sem lista') !== lista) return false;
      const dentro = g.checked_in_count ?? 0;
      if (filtro === 'dentro' && dentro === 0) return false;
      if (filtro === 'aguardando' && dentro >= (g.party_size ?? 1)) return false;
      if (!s) return true;
      return g.name.toLowerCase().includes(s)
        || (g.email ?? '').toLowerCase().includes(s)
        || (g.phone ?? '').includes(s)
        || (g.promoter ?? '').toLowerCase().includes(s);
    });
  }, [guests, q, filtro, lista]);

  // Contagem em PESSOAS quando o resumo respondeu; senão, em convites — mas
  // dizendo qual das duas é, porque as duas mentem de formas diferentes.
  const pessoas = resumo
    ? `${resumo.people_arrived ?? 0}/${resumo.people_expected ?? 0} pessoas dentro`
    : `${guests.filter((g) => g.status === 'checked_in').length}/${guests.length} convites com entrada`;

  function exportarCsv() {
    // O Excel da produtora é o que circula no grupo da equipe: gera do que já
    // está carregado, sem endpoint novo.
    const linhas = [
      ['nome', 'acompanhantes', 'dentro', 'telefone', 'email', 'lista', 'tipo_lista', 'inscrito_em', 'status'],
      ...guests.map((g) => [
        g.name, (g.party_size ?? 1) - 1, g.checked_in_count ?? 0, g.phone ?? '', g.email ?? '',
        g.promoter ?? '', g.list_type ?? '', g.created_at ?? '', g.status,
      ]),
    ];
    const csv = linhas.map((l) => l.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(';')).join('\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: 'lista-convidados.csv' });
    a.click();
    URL.revokeObjectURL(url);
  }

  if (status === 'loading') return <Shell><Loading /></Shell>;

  return (
    <Shell>
      <OpsBack eventId={id} />
      <div className="ck-eyebrow">porta · lista (azlist)</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
        <h1 className="ck-h1">Check-in da lista</h1>
        {guests.length > 0 && (
          <button className="ck-btn ck-btn--glass ck-btn--sm" onClick={exportarCsv}>
            <Icon name="download" size={14} /> Exportar CSV
          </button>
        )}
      </div>
      {/* PESSOAS, não nomes: com grupos +N, contar linhas subdimensiona a porta. */}
      <p className="ck-sub">Busque o convidado e libere a entrada. {pessoas}.</p>

      {error && <ErrorBox>{error}</ErrorBox>}

      {/* As listas do evento — toca para filtrar. O % diz qual promoter de
          fato TROUXE gente, não só quem inscreveu nome. */}
      {listas.length > 1 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 'var(--pp-s-4)' }}>
          <button className={`pp-chip ${lista === '' ? 'pp-chip--active' : ''}`} onClick={() => setLista('')}>
            Todas ({guests.length})
          </button>
          {listas.map((l) => (
            <button key={l.nome} className={`pp-chip ${lista === l.nome ? 'pp-chip--active' : ''}`}
              onClick={() => setLista(lista === l.nome ? '' : l.nome)}>
              {l.nome}{TIPO_LISTA[l.tipo] ? ` · ${TIPO_LISTA[l.tipo]}` : ''}
              {' '}({l.dentro}/{l.total}{l.total > 0 ? ` · ${Math.round((l.dentro / l.total) * 100)}%` : ''})
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 'var(--pp-s-5)' }}>
        <div className="pp-inputwrap" style={{ flex: 1, minWidth: 240, maxWidth: 480 }}>
          <Icon name="search" size={16} />
          <input className="ck-input" style={{ width: '100%', paddingLeft: 46 }}
            placeholder="Nome, telefone ou e-mail…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['todos', 'Todos'], ['dentro', 'Já dentro'], ['aguardando', 'Aguardando']].map(([k, rotulo]) => (
            <button key={k} className={`pp-chip ${filtro === k ? 'pp-chip--active' : ''}`} onClick={() => setFiltro(k)}>
              {rotulo}
            </button>
          ))}
        </div>
      </div>

      <div className="ck-card" style={{ padding: 0, overflow: 'hidden', maxWidth: 680 }}>
        {filtered.length === 0 && <p className="pp-muted" style={{ padding: 'var(--pp-s-6)' }}>Nenhum convidado {q || lista || filtro !== 'todos' ? 'encontrado com esse filtro' : 'na lista ainda'}.</p>}
        {filtered.map((g, i) => {
          const total = g.party_size ?? 1;
          const dentro = g.checked_in_count ?? (g.status === 'checked_in' ? 1 : 0);
          const faltam = total - dentro;
          const completo = faltam <= 0;
          return (
            <div key={g.id} className="pp-between" style={{ padding: '14px 18px', borderBottom: i < filtered.length - 1 ? '1px solid var(--pp-edge-1)' : 'none', gap: 12 }}>
              <div className="pp-grow" style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>
                  {g.name}{total > 1 && <span style={{ color: 'var(--pp-fg-3)', fontWeight: 400 }}> +{total - 1}</span>}
                  {TIPO_LISTA[g.list_type] && (
                    <span className="ck-badge" style={{ marginLeft: 8, fontSize: 11 }}>{TIPO_LISTA[g.list_type]}</span>
                  )}
                </div>
                <div className="pp-muted" style={{ fontSize: 'var(--pp-fs-12)', marginTop: 2 }}>
                  {g.promoter ? `lista de ${g.promoter}` : 'lista'}
                  {total > 1 && ` · ${dentro} de ${total} dentro`}
                  {/* Telefone na frente do e-mail: na porta liga-se, não se escreve. */}
                  {g.phone ? ` · ${g.phone}` : ''}
                  {g.email ? ` · ${g.email}` : ''}
                </div>
              </div>
              {completo ? (
                <span className="ck-badge ck-badge--success">
                  <Icon name="check" size={13} /> {total > 1 ? 'grupo completo' : 'presente'}
                </span>
              ) : (
                // Com acompanhantes o porteiro escolhe QUANTOS estão entrando
                // agora — obrigar o grupo a chegar junto trava a fila.
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <button className="ck-btn ck-btn--primary ck-btn--sm" disabled={busy === g.id}
                    onClick={() => checkin(g, 1)}>
                    {busy === g.id ? '…' : total > 1 ? '+1 entrou' : 'Liberar entrada'}
                  </button>
                  {faltam > 1 && (
                    <button className="ck-btn ck-btn--glass ck-btn--sm" disabled={busy === g.id}
                      onClick={() => checkin(g, faltam)}>
                      Todos ({faltam})
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Shell>
  );
}
