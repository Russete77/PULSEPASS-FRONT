import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Page } from '../components/Layout.jsx';
import { Loading, Empty, ErrorBox } from '../components/States.jsx';
import { api } from '../lib/api.js';
import { Icon } from '../components/Icon.jsx';

const bigDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const wd = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase();
  const day = d.getDate();
  const mo = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();
  const hr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${wd} · ${day} ${mo} · ${hr}`;
};

const STATUS_LABEL = { valid: 'Válido', used: 'Utilizado', cancelled: 'Cancelado', transferred: 'Transferido' };
const STATUS_CLS = { valid: 'pp-badge--pulse pp-badge--dot', used: 'pp-badge--neutral', cancelled: 'pp-badge--red', transferred: 'pp-badge--violet' };

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [tab, setTab] = useState('valid');

  useEffect(() => {
    (async () => {
      try {
        setTickets(await api.myTickets());
        setStatus('done');
      } catch (e) {
        setError(e.message);
        setStatus('error');
      }
    })();
  }, []);

  const counts = useMemo(() => ({
    valid: tickets.filter((t) => t.status === 'valid').length,
    all: tickets.length,
  }), [tickets]);
  const list = tab === 'valid' ? tickets.filter((t) => t.status === 'valid') : tickets;

  return (
    <Page>
      <div className="pp-reveal">
        <div className="pp-eyebrow">carteira de ingressos</div>
        <h1>Meus ingressos</h1>
        <p className="sub">Toque em um ingresso para ver o QR de entrada.</p>

        {status === 'done' && tickets.length > 0 && (
          <div className="pp-segmented" style={{ marginBottom: 'var(--pp-s-6)' }}>
            <button className={tab === 'valid' ? 'active' : ''} onClick={() => setTab('valid')}>Válidos · {counts.valid}</button>
            <button className={tab === 'all' ? 'active' : ''} onClick={() => setTab('all')}>Todos · {counts.all}</button>
          </div>
        )}
      </div>

      {status === 'loading' && <Loading />}
      {status === 'error' && <ErrorBox>{error}</ErrorBox>}
      {status === 'done' && tickets.length === 0 && (
        <Empty>
          <div className="pp-empty__icon"><Icon name="ticket" size={30} /></div>
          <div className="pp-empty__title">Nenhum ingresso ainda</div>
          <p>Bora achar um rolê? <Link to="/" className="pp-link">Explorar eventos →</Link></p>
        </Empty>
      )}

      {status === 'done' && list.length > 0 && (
        <div className="pp-tktlist pp-reveal-group">
          {list.map((t) => (
            <Link key={t.id} to={`/ingresso/${t.id}`} className="pp-card pp-card--interactive pp-tkt">
              <div className="pp-tkt__thumb">{t.events?.title?.slice(0, 2).toUpperCase()}</div>
              <div className="pp-grow">
                <div className="pp-tkt__date">{bigDate(t.events?.starts_at)}</div>
                <div className="pp-tkt__title">{t.events?.title}</div>
                <div className="pp-tkt__tier">{t.ticket_tiers?.name}</div>
              </div>
              <span className={`pp-badge ${STATUS_CLS[t.status] ?? 'pp-badge--neutral'}`}>
                {STATUS_LABEL[t.status] ?? t.status}
              </span>
              <Icon name="chevronRight" size={18} className="pp-tkt__chev" />
            </Link>
          ))}
        </div>
      )}
    </Page>
  );
}
