import { useEffect, useState } from 'react';
import { Page } from '../components/Layout.jsx';
import { Loading, ErrorBox, Empty } from '../components/States.jsx';
import { Icon } from '../components/Icon.jsx';
import { api } from '../lib/api.js';
import { brl, eventDate } from '../lib/format.js';

export default function PromoterPortal() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);
  const [guests, setGuests] = useState(null);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    api.promoterMe()
      .then((d) => { setRows(d); setStatus('done'); })
      .catch((e) => { setError(e.message); setStatus('error'); });
  }, []);

  async function toggleGuests(p) {
    if (openId === p.promoter_id) { setOpenId(null); setGuests(null); return; }
    setOpenId(p.promoter_id); setGuests(null);
    try { const g = await api.promoterGuests(p.promoter_id); setGuests(g.guests); }
    catch (e) { setError(e.message); }
  }

  function copyLink(p) {
    const url = `${window.location.origin}/lista/${p.code}`;
    navigator.clipboard?.writeText(url);
    setCopied(p.promoter_id);
    setTimeout(() => setCopied(null), 1500);
  }

  if (status === 'loading') return <Page><Loading /></Page>;
  if (status === 'error') return <Page><ErrorBox>{error}</ErrorBox></Page>;

  return (
    <Page>
      <div className="pp-reveal" style={{ maxWidth: 720 }}>
        <div className="pp-eyebrow">promoter · azlist</div>
        <h1>Portal do promoter</h1>
        <p className="sub">Seus links, inscritos, presenças e comissão.</p>
      </div>

      {rows.length === 0 && (
        <Empty>
          <div className="pp-empty__icon"><Icon name="users" size={30} /></div>
          <div className="pp-empty__title">Você ainda não é promoter</div>
          <p>Peça para a produtora te cadastrar com o e-mail desta conta.</p>
        </Empty>
      )}

      <div className="pp-stack pp-stack-3 pp-reveal-group" style={{ maxWidth: 720 }}>
        {rows.map((p) => {
          const pct = p.goal_checkins ? Math.min(100, (p.checked_in / p.goal_checkins) * 100) : 0;
          return (
            <div key={p.promoter_id} className="pp-card pp-card--pad">
              <div className="pp-between" style={{ alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 600, fontSize: 'var(--pp-fs-16)' }}>{p.event.title}</div>
                  <div className="pp-muted" style={{ fontSize: 'var(--pp-fs-13)', marginTop: 2 }}>{eventDate(p.event.starts_at)}</div>
                </div>
                <button className="pp-btn pp-btn--glass pp-btn--sm" onClick={() => copyLink(p)}>
                  <Icon name={copied === p.promoter_id ? 'check' : 'copy'} size={15} />
                  {copied === p.promoter_id ? 'Copiado' : 'Meu link'}
                </button>
              </div>

              <div className="pp-stats" style={{ marginTop: 'var(--pp-s-5)' }}>
                <div><div className="pp-stat__l">Cliques</div><div className="pp-stat__v">{p.clicks ?? 0}</div></div>
                <div><div className="pp-stat__l">Inscritos</div><div className="pp-stat__v">{p.confirmed}</div></div>
                <div><div className="pp-stat__l">Check-ins</div><div className="pp-stat__v">{p.checked_in}</div></div>
                <div><div className="pp-stat__l">Comissão devida</div><div className="pp-stat__v accent">{brl(p.commission_due_cents)}</div></div>
              </div>

              {p.goal_checkins != null && (
                <div style={{ marginTop: 'var(--pp-s-5)', maxWidth: 340 }}>
                  <div className="pp-between" style={{ marginBottom: 6 }}>
                    <span className="pp-stat__l">Meta de presenças</span>
                    <span className="pp-mono pp-num" style={{ fontSize: 'var(--pp-fs-13)', color: 'var(--pp-fg-2)' }}>{p.checked_in}/{p.goal_checkins}</span>
                  </div>
                  <div className="pp-progress"><i style={{ width: `${pct}%` }} /></div>
                </div>
              )}

              <div style={{ marginTop: 'var(--pp-s-4)' }}>
                <button className="pp-link pp-link--muted" onClick={() => toggleGuests(p)}>
                  {openId === p.promoter_id ? 'Ocultar inscritos ↑' : 'Ver inscritos ↓'}
                </button>
              </div>

              {openId === p.promoter_id && (
                <div style={{ marginTop: 'var(--pp-s-3)' }}>
                  {guests === null ? <Loading />
                    : guests.length === 0 ? <p className="pp-muted">Ninguém inscrito ainda.</p>
                    : (
                      <div className="pp-stack pp-stack-1">
                        {guests.map((g) => (
                          <div key={g.id} className="pp-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--pp-edge-1)' }}>
                            <span>{g.name}</span>
                            <span className={`pp-badge ${g.status === 'checked_in' ? 'pp-badge--pulse pp-badge--dot' : 'pp-badge--neutral'}`}>
                              {g.status === 'checked_in' ? 'Presente' : 'Inscrito'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Page>
  );
}
