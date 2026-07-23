import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Page } from '../components/Layout.jsx';
import { Loading, Empty, ErrorBox } from '../components/States.jsx';
import { api } from '../lib/api.js';
import { Icon } from '../components/Icon.jsx';

const FLYER_GRADS = [
  'radial-gradient(80% 80% at 20% 20%, #22D3EE, transparent 60%), radial-gradient(80% 80% at 80% 80%, #A78BFA, transparent 60%), #0a0a0c',
  'linear-gradient(135deg, #FF3D88 0%, #FFB800 100%)',
  'radial-gradient(circle at 50% 100%, #00FF85, transparent 70%), linear-gradient(180deg, #0a0a0c, rgba(167,139,250,0.25))',
  'radial-gradient(120% 60% at 50% 0%, #A78BFA, transparent 60%), #0a0a0c',
  'radial-gradient(80% 80% at 70% 20%, #00FF85, transparent 60%), radial-gradient(80% 80% at 20% 90%, #22D3EE, transparent 60%), #0a0a0c',
  'radial-gradient(90% 70% at 30% 10%, #FF3D88, transparent 60%), #0a0a0c',
];

const bigDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const wd = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase();
  const day = d.getDate();
  const mo = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();
  const hr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${wd} · ${day} ${mo} · ${hr}`;
};
const shortTag = (iso) => (iso ? new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '').toUpperCase() : '');
const priceLabel = (cents) => (cents == null ? '' : cents === 0 ? 'Grátis' : `R$ ${Math.floor(cents / 100)}+`);

function Flyer({ ev, i, rank }) {
  return (
    <Link to={`/eventos/${ev.slug}`} className="pp-flyer">
      <div className="pp-flyer__art" style={ev.cover_url ? undefined : { background: FLYER_GRADS[i % FLYER_GRADS.length] }}>
        {ev.cover_url && <img src={ev.cover_url} alt={ev.title} />}
        {rank ? <span className="pp-flyer__rank">{rank}</span> : <span className="pp-flyer__tag">{shortTag(ev.starts_at)}</span>}
        <div className="pp-flyer__body">
          <div className="pp-flyer__title">{ev.title}</div>
          <div className="pp-flyer__meta">{ev.city}/{ev.state}</div>
          {ev.min_price_cents != null && <div className="pp-flyer__price">{ev.sold_out ? 'Esgotado' : priceLabel(ev.min_price_cents)}</div>}
        </div>
      </div>
    </Link>
  );
}

export default function Discover() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [city, setCity] = useState('Todas');

  async function load(query = '') {
    setStatus('loading');
    try {
      setEvents(await api.listEvents({ q: query }));
      setStatus('done');
    } catch (e) { setError(e.message); setStatus('error'); }
  }
  useEffect(() => { load(); }, []);

  const cities = useMemo(() => ['Todas', ...new Set(events.map((e) => e.city).filter(Boolean))], [events]);
  const filtered = city === 'Todas' ? events : events.filter((e) => e.city === city);
  const [featured, ...rest] = filtered;
  const trending = rest.slice(0, 6);
  const grid = rest;

  return (
    <Page>
      <div className="pp-reveal">
        <div className="pp-eyebrow">explore</div>
        <div className="pp-cityhead">
          <h1>O que vai rolar em <span className="city">{city === 'Todas' ? 'todo o Brasil' : city}</span></h1>
        </div>
        <p className="sub">Ticketeria, lista e bar cashless num só lugar. Sinta o pulso do evento.</p>

        <form className="pp-searchbar" onSubmit={(e) => { e.preventDefault(); load(q); }}>
          <div className="pp-inputwrap">
            <Icon name="search" size={18} />
            <input className="pp-input" placeholder="Buscar evento, artista, casa…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <button className="pp-btn pp-btn--glass" type="submit">Buscar</button>
        </form>

        {cities.length > 1 && (
          <div className="pp-chiprow">
            {cities.map((c) => (
              <button key={c} className={`pp-chip ${city === c ? 'pp-chip--active' : ''}`} onClick={() => setCity(c)}>{c}</button>
            ))}
          </div>
        )}
      </div>

      {status === 'loading' && <Loading label="Buscando eventos…" />}
      {status === 'error' && <ErrorBox>Não consegui carregar os eventos: {error}.</ErrorBox>}
      {status === 'done' && filtered.length === 0 && (
        <Empty>
          <div className="pp-empty__icon"><Icon name="music" size={30} /></div>
          <div className="pp-empty__title">Nenhum evento por aqui ainda</div>
          <p>Assim que uma produtora publicar, ele aparece bem aqui.</p>
        </Empty>
      )}

      {status === 'done' && featured && (
        <Link to={`/eventos/${featured.slug}`} className="pp-featured pp-reveal">
          <div className="pp-featured__art">
            {featured.cover_url && <img src={featured.cover_url} alt={featured.title} />}
            <span className="pp-featured__live">Vendas abertas</span>
            <div className="pp-featured__info">
              <div className="pp-featured__date">{bigDate(featured.starts_at)}</div>
              <div className="pp-featured__title">{featured.title}</div>
            </div>
          </div>
          <div className="pp-featured__foot">
            <div>
              <div className="pp-featured__venue">{featured.venue_name ? `${featured.venue_name} · ` : ''}{featured.city}/{featured.state}</div>
              <div className="pp-featured__meta">{featured.min_price_cents != null ? `a partir de ${priceLabel(featured.min_price_cents)}` : 'Ingressos · Lista · Bar'}</div>
            </div>
            <span className="pp-btn pp-btn--primary pp-btn--sm">Comprar →</span>
          </div>
        </Link>
      )}

      {status === 'done' && trending.length >= 3 && (
        <>
          <div className="pp-section-head">
            <div>
              <div className="pp-eyebrow" style={{ color: 'var(--pp-pink)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="pp-pulse-dot" style={{ background: 'var(--pp-pink)' }} /> Bombando · 24h
              </div>
              <h2>+ comprados agora</h2>
            </div>
          </div>
          <div className="pp-hscroll pp-reveal">
            {trending.map((ev, i) => <Flyer key={ev.id} ev={ev} i={i} rank={`#${i + 1}`} />)}
          </div>
        </>
      )}

      {status === 'done' && grid.length > 0 && (
        <>
          <div className="pp-section-head">
            <div>
              <div className="pp-eyebrow">Programe-se</div>
              <h2>Próximos eventos</h2>
            </div>
          </div>
          <div className="pp-grid pp-reveal-group">
            {grid.map((ev, i) => <Flyer key={ev.id} ev={ev} i={i} />)}
          </div>
        </>
      )}
    </Page>
  );
}
