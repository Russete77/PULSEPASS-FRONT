import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shell, Loading, ErrorBox } from '../components/Shell.jsx';
import { api } from '../lib/api.js';
import { eventDate } from '../lib/format.js';

const STAFF_LABEL = { door: 'Portaria', bar: 'Bar', manager: 'Gerente' };

// Estação de trabalho de cada papel — pra onde o plantão leva.
const STATIONS = {
  door: [
    { to: '/porta', label: 'Abrir portaria' },
    { to: '/bilheteria', label: 'Bilheteria' },
    { to: '/lista-porta', label: 'Lista de convidados' },
  ],
  bar: [{ to: '/pdv', label: 'Abrir PDV' }],
  manager: [{ to: '', label: 'Abrir painel' }],
};

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

  // Staff escalado (porta/bar/gerente) sem organização própria: nunca deve ver o
  // onboarding de produtora — cai nos plantões, com atalho pra sua tela de trabalho.
  if (status === 'done' && me?.organizations.length === 0 && (me?.assignments?.length ?? 0) > 0) {
    return (
      <Shell>
        <div className="ck-eyebrow">operação</div>
        <h1 className="ck-h1">Meus plantões</h1>
        <p className="ck-sub">Os eventos em que você está escalado. Toque para abrir sua estação.</p>
        {error && <ErrorBox>{error}</ErrorBox>}
        <div className="ck-grid" style={{ marginTop: 24 }}>
          {me.assignments.map(({ role, event }) => (
            <div key={`${event.id}-${role}`} className="ck-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <strong style={{ fontSize: 'var(--pp-fs-18)', fontFamily: 'var(--pp-font-display)' }}>{event.title}</strong>
                <span className="ck-badge">{STAFF_LABEL[role] ?? role}</span>
              </div>
              <p style={{ color: 'var(--pp-fg-3)', fontSize: 13, marginTop: 10 }}>
                {eventDate(event.starts_at)} · {event.city}/{event.state}
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                {STATIONS[role]?.map(({ to, label }, i) => (
                  <Link key={to} to={`/eventos/${event.id}${to}`}
                    className={`ck-btn ${i === 0 ? 'ck-btn--primary' : 'ck-btn--glass'}`}>{label}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Shell>
    );
  }

  // Sem organização e sem escalação → onboarding de produtora
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
