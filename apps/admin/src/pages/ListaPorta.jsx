import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shell, Loading, ErrorBox } from '../components/Shell.jsx';
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

  async function checkin(g) {
    setBusy(g.id); setError('');
    try {
      await api.checkinGuest(g.id);
      setGuests((gs) => gs.map((x) => x.id === g.id ? { ...x, status: 'checked_in', checked_in_at: new Date().toISOString() } : x));
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
      <Link to={`/eventos/${id}`} className="ck-btn ck-btn--glass ck-btn--sm" style={{ marginBottom: 'var(--pp-s-4)' }}><Icon name="arrowLeft" size={16} /> Dashboard</Link>
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
          const inside = g.status === 'checked_in';
          return (
            <div key={g.id} className="pp-between" style={{ padding: '14px 18px', borderBottom: i < filtered.length - 1 ? '1px solid var(--pp-edge-1)' : 'none', gap: 12 }}>
              <div className="pp-grow" style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>{g.name}</div>
                <div className="pp-muted" style={{ fontSize: 'var(--pp-fs-12)', marginTop: 2 }}>
                  {g.promoter ? `lista de ${g.promoter}` : 'lista'}{g.email ? ` · ${g.email}` : ''}
                </div>
              </div>
              {inside ? (
                <span className="ck-badge ck-badge--success"><Icon name="check" size={13} /> presente</span>
              ) : (
                <button className={`ck-btn ck-btn--primary ck-btn--sm ${busy === g.id ? '' : ''}`} disabled={busy === g.id} onClick={() => checkin(g)}>
                  {busy === g.id ? '…' : 'Liberar entrada'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </Shell>
  );
}
