import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shell, Loading, ErrorBox, OpsBack } from '../components/Shell.jsx';
import { Icon } from '@pulsepass/shared/Icon';
import { api } from '../lib/api.js';

export default function ListaPorta() {
  const { id } = useParams();
  const [guests, setGuests] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(null);

  const load = useCallback(() => {
    api.eventGuests(id)
      .then((d) => { setGuests(d); setStatus('done'); })
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
    } catch (e) { setError(e.message); } finally { setBusy(null); }
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? guests.filter((g) => g.name.toLowerCase().includes(s) || (g.email ?? '').toLowerCase().includes(s) || (g.promoter ?? '').toLowerCase().includes(s)) : guests;
  }, [guests, q]);

  const present = guests.filter((g) => g.status === 'checked_in').length;

  if (status === 'loading') return <Shell><Loading /></Shell>;

  return (
    <Shell>
      <OpsBack eventId={id} />
      <div className="ck-eyebrow">porta · lista (azlist)</div>
      <h1 className="ck-h1">Check-in da lista</h1>
      <p className="ck-sub">Busque o nome do convidado e libere a entrada. {present}/{guests.length} presentes.</p>

      {error && <ErrorBox>{error}</ErrorBox>}

      <div className="pp-inputwrap" style={{ maxWidth: 480, marginBottom: 'var(--pp-s-5)' }}>
        <Icon name="search" size={16} />
        <input className="ck-input" style={{ width: '100%', paddingLeft: 46 }} placeholder="Buscar convidado por nome…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
      </div>

      <div className="ck-card" style={{ padding: 0, overflow: 'hidden', maxWidth: 640 }}>
        {filtered.length === 0 && <p className="pp-muted" style={{ padding: 'var(--pp-s-6)' }}>Nenhum convidado {q ? 'encontrado' : 'na lista ainda'}.</p>}
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
                </div>
                <div className="pp-muted" style={{ fontSize: 'var(--pp-fs-12)', marginTop: 2 }}>
                  {g.promoter ? `lista de ${g.promoter}` : 'lista'}
                  {total > 1 && ` · ${dentro} de ${total} dentro`}
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
