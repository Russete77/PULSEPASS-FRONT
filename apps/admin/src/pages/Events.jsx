import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shell, Loading, ErrorBox } from '../components/Shell.jsx';
import { Icon } from '@pulsepass/shared/Icon';
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

const STATUS_LABEL = {
  published: 'Publicado', draft: 'Rascunho', paused: 'Pausado', ended: 'Encerrado', cancelled: 'Cancelado',
};
const badgeDe = (s) => (s === 'published' ? 'ck-badge--published' : s === 'draft' ? 'ck-badge--draft' : s === 'paused' ? 'ck-badge--warning' : '');

export default function Events() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('todos');

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

  // Contagens por status: derivadas do que a listagem devolve de verdade.
  // A listagem NÃO traz vendas/receita por evento, então o card não desenha
  // barra de ocupação nem GMV — só o que existe: título, data, praça, status.
  const porStatus = useMemo(() => {
    const c = { todos: events.length };
    for (const ev of events) c[ev.status] = (c[ev.status] ?? 0) + 1;
    return c;
  }, [events]);

  const visiveis = filtro === 'todos' ? events : events.filter((e) => e.status === filtro);
  const proximo = events.find((e) => e.status === 'published');

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
        <div className="ck-grid ck-mt-6">
          {me.assignments.map(({ role, event }) => (
            <div key={`${event.id}-${role}`} className="ck-card">
              <div className="ck-flex ck-jc-btw ck-ai-start ck-gap-2">
                <strong className="ck-t-section ck-display">{event.title}</strong>
                <span className="ck-badge">{STAFF_LABEL[role] ?? role}</span>
              </div>
              <p className="pp-muted ck-t-support ck-mt-3">
                {eventDate(event.starts_at)} · {event.city}/{event.state}
              </p>
              <div className="ck-flex ck-gap-2 ck-mt-4 pp-wrap">
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
        <form className="ck-card ck-w-form" onSubmit={createOrg}>
          <div className="ck-field">
            <label htmlFor="events-1" className="ck-label">Nome da organização</label>
            <input id="events-1" className="ck-input" value={orgName} onChange={(e) => setOrgName(e.target.value)} required minLength={2} placeholder="Ex.: Casa Pulse" />
          </div>
          <div className="ck-field">
            <label htmlFor="events-2" className="ck-label">CNPJ (opcional)</label>
            <input id="events-2" className="ck-input" value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0001-00" />
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
      {/* Cabeçalho no desenho do MultiEventScreen: eyebrow com a contagem,
          título com assinatura serifada e a ação principal à direita. */}
      <div className="pp-between pp-wrap ck-ai-end">
        <div>
          <div className="ck-eyebrow">{me?.organizations[0]?.name} · {events.length} evento{events.length === 1 ? '' : 's'}</div>
          <h1 className="ck-h1">Seus eventos da <span className="pp-accent">temporada</span></h1>
        </div>
        <button className="ck-btn ck-btn--primary" onClick={() => navigate('/novo')}>
          <Icon name="plus" size={16} /> Criar evento
        </button>
      </div>

      {error && <ErrorBox>{error}</ErrorBox>}

      {events.length === 0 ? (
        <div className="pp-empty ck-mt-6">
          <div className="pp-empty__icon"><Icon name="calendar" size={30} /></div>
          <div className="pp-empty__title">Nenhum evento ainda</div>
          <p>A vitrine começa no primeiro evento publicado.</p>
          <button className="ck-btn ck-btn--primary ck-mt-4" onClick={() => navigate('/novo')}>
            Criar o primeiro evento
          </button>
        </div>
      ) : (
        <>
          {/* Resumo: só contagens reais (a listagem não devolve receita). */}
          <div className="ck-kpis ck-mt-5 ck-cols-3">
            <div className="ck-kpi ck-k--pulse">
              <div className="lbl">No ar</div>
              <div className="val">{porStatus.published ?? 0}</div>
              <div className="d">{proximo ? `próximo: ${eventDate(proximo.starts_at)}` : 'nenhum publicado'}</div>
            </div>
            <div className="ck-kpi ck-k--amber">
              <div className="lbl">Rascunhos</div>
              <div className="val">{porStatus.draft ?? 0}</div>
              <div className="d">ainda fora da vitrine</div>
            </div>
            <div className="ck-kpi ck-k--violet">
              <div className="lbl">Total</div>
              <div className="val">{events.length}</div>
              <div className="d">todos os status</div>
            </div>
          </div>

          {/* Filtro por status — as pílulas do mockup, com contagens reais. */}
          <div className="ck-tabs ck-mt-5" role="tablist" aria-label="Filtrar eventos por status">
            {['todos', 'published', 'draft', 'paused', 'ended', 'cancelled']
              .filter((s) => s === 'todos' || porStatus[s])
              .map((s) => (
                <button
                  key={s} role="tab" aria-selected={filtro === s}
                  className={`ck-tab ${filtro === s ? 'is-on' : ''}`}
                  onClick={() => setFiltro(s)}
                >
                  {s === 'todos' ? 'Todos' : STATUS_LABEL[s] ?? s} · {porStatus[s] ?? 0}
                </button>
              ))}
          </div>

          <div className="ck-grid ck-mt-4">
            {visiveis.map((ev) => (
              <Link key={ev.id} to={`/eventos/${ev.id}`} className={`ck-card ck-event ck-evcard ${ev.status === 'published' ? 'ck-evcard--live' : ''} ${ev.status === 'draft' ? 'ck-evcard--draft' : ''} ck-p-0`}>
                {/* "Capa" estrutural: a listagem não devolve imagem, então o
                    topo é atmosfera de token com o título — nada de foto falsa. */}
                <div className="ck-evcard__capa">
                  <span className={`ck-badge ck-evcard__status ${badgeDe(ev.status)}`}>
                    {STATUS_LABEL[ev.status] ?? ev.status}
                  </span>
                  <div className="ck-evcard__title">{ev.title}</div>
                </div>
                <div className="ck-evcard__body">
                  <span className="pp-meta">{eventDate(ev.starts_at)} · {ev.city}/{ev.state}</span>
                  <Icon name="chevronRight" size={16} aria-hidden="true" />
                </div>
              </Link>
            ))}
            {visiveis.length === 0 && (
              <p className="pp-muted ck-span-all">Nenhum evento com esse status.</p>
            )}
          </div>
        </>
      )}
    </Shell>
  );
}
