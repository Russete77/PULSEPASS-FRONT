import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shell, Loading, ErrorBox } from '../components/Shell.jsx';
import { api } from '../lib/api.js';
import { eventDate } from '../lib/format.js';

export default function Events() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  // onboarding de organização
  const [orgName, setOrgName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [creating, setCreating] = useState(false);

  async function load() {
    setStatus('loading');
    try {
      const meData = await api.me();
      setMe(meData);
      if (meData.organizations.length > 0) {
        setEvents(await api.listEvents());
      }
      setStatus('done');
    } catch (e) {
      setError(e.message);
      setStatus('error');
    }
  }

  useEffect(() => { load(); }, []);

  async function createOrg(e) {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      await api.createOrg(orgName, cnpj || undefined);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  if (status === 'loading') return <Shell><Loading /></Shell>;

  // Sem organização → onboarding
  if (status === 'done' && me?.organizations.length === 0) {
    return (
      <Shell>
        <div className="ck-eyebrow">primeiro passo</div>
        <h1 className="ck-h1">Crie sua organização</h1>
        <p className="ck-sub">A casa/produtora dona dos eventos. Você poderá criar eventos em seguida.</p>
        <form className="ck-card" style={{ maxWidth: 520 }} onSubmit={createOrg}>
          <div className="ck-field">
            <label className="ck-label">Nome da organização</label>
            <input className="ck-input" value={orgName} onChange={(e) => setOrgName(e.target.value)} required minLength={2} placeholder="Ex.: Casa Pulse" />
          </div>
          <div className="ck-field">
            <label className="ck-label">CNPJ (opcional)</label>
            <input className="ck-input" value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0001-00" />
          </div>
          {error && <ErrorBox>{error}</ErrorBox>}
          <button className="ck-btn ck-btn--primary" disabled={creating}>
            {creating ? 'Criando…' : 'Criar organização'}
          </button>
        </form>
      </Shell>
    );
  }

  return (
    <Shell>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="ck-eyebrow">{me?.organizations[0]?.name}</div>
          <h1 className="ck-h1">Eventos</h1>
        </div>
        <button className="ck-btn ck-btn--primary" onClick={() => navigate('/novo')}>+ Criar evento</button>
      </div>

      {error && <ErrorBox>{error}</ErrorBox>}

      {events.length === 0 ? (
        <div className="ck-empty">Nenhum evento ainda. Crie o primeiro.</div>
      ) : (
        <div className="ck-grid" style={{ marginTop: 24 }}>
          {events.map((ev) => (
            <Link key={ev.id} to={`/eventos/${ev.id}`} className="ck-card ck-event">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <strong style={{ fontSize: 'var(--pp-fs-18)', fontFamily: 'var(--pp-font-display)' }}>{ev.title}</strong>
                <span className={`ck-badge ${ev.status === 'published' ? 'ck-badge--published' : 'ck-badge--draft'}`}>
                  {ev.status === 'published' ? 'Publicado' : ev.status}
                </span>
              </div>
              <p style={{ color: 'var(--pp-fg-3)', fontSize: 13, marginTop: 10 }}>
                {eventDate(ev.starts_at)} · {ev.city}/{ev.state}
              </p>
            </Link>
          ))}
        </div>
      )}
    </Shell>
  );
}
