import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shell, Loading, ErrorBox, BackLink } from '../components/Shell.jsx';
import { api } from '../lib/api.js';
import { brl } from '../lib/format.js';

const WEB = import.meta.env.VITE_PUBLIC_WEB_URL ?? 'http://localhost:5173';

export default function Promoters() {
  const { id } = useParams();
  const [promoters, setPromoters] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [commission, setCommission] = useState('');
  const [email, setEmail] = useState('');
  const [goal, setGoal] = useState('');
  const [listType, setListType] = useState('standard');
  const [freeUntil, setFreeUntil] = useState('');
  const [creating, setCreating] = useState(false);

  const [openId, setOpenId] = useState(null);
  const [guests, setGuests] = useState({ promoter: null, guests: [] });
  const [copiedCode, setCopiedCode] = useState('');
  async function payCommission(promoterId) {
    try {
      await api.commissionPaid(promoterId, true);
      load();
    } catch (e) { setError(e.message); }
  }

  const load = useCallback(() => {
    api.listPromoters(id)
      .then((p) => { setPromoters(p); setStatus('done'); })
      .catch((e) => { setError(e.message); setStatus('error'); });
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function create(e) {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      await api.createPromoter(
        id, name, Math.round(Number(commission || 0) * 100), email.trim() || undefined,
        goal !== '' ? Math.round(Number(goal)) : null,
        { list_type: listType, free_until: (listType === 'free_until' && freeUntil) ? new Date(freeUntil).toISOString() : null },
      );
      setName(''); setCommission(''); setEmail(''); setGoal(''); setListType('standard'); setFreeUntil('');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function openGuests(promoterId) {
    if (openId === promoterId) { setOpenId(null); return; }
    setOpenId(promoterId);
    setGuests({ promoter: null, guests: [] });
    try {
      setGuests(await api.promoterGuests(promoterId));
    } catch (e) {
      setError(e.message);
    }
  }

  async function checkin(guestId) {
    try {
      await api.checkinGuest(guestId);
      setGuests((g) => ({ ...g, guests: g.guests.map((x) => x.id === guestId ? { ...x, status: 'checked_in' } : x) }));
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function copyLink(code) {
    const link = `${WEB}/lista/${code}`;
    try { await navigator.clipboard.writeText(link); } catch {/* ignore */}
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 1800);
  }

  if (status === 'loading') return <Shell><Loading /></Shell>;

  return (
    <Shell>
      <BackLink to={`/eventos/${id}`} label="Dashboard" />
      <div className="ck-eyebrow">lista · promoters (azlist)</div>
      <h1 className="ck-h1">Promoters & Guest List</h1>
      <p className="ck-sub">Crie promoters, compartilhe o link público e acompanhe inscritos e comissão.</p>

      {error && <ErrorBox>{error}</ErrorBox>}

      <form className="ck-card" style={{ maxWidth: 620 }} onSubmit={create}>
        <div className="ck-row">
          <div className="ck-field" style={{ margin: 0 }}>
            <label htmlFor="promoters-1" className="ck-label">Nome do promoter</label>
            <input id="promoters-1" className="ck-input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
          </div>
          <div className="ck-field" style={{ margin: 0 }}>
            <label htmlFor="promoters-2" className="ck-label">Comissão por presença (R$)</label>
            <input id="promoters-2" className="ck-input" type="number" min="0" step="0.01" value={commission} onChange={(e) => setCommission(e.target.value)} placeholder="0,00" />
          </div>
          <div className="ck-field" style={{ margin: 0 }}>
            <label htmlFor="promoters-3" className="ck-label">E-mail do promoter (opcional — habilita o portal)</label>
            <input id="promoters-3" className="ck-input" type="email" autoComplete="email" inputMode="email" autoCapitalize="off" autoCorrect="off" spellCheck="false" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="promoter@email.com" />
          </div>
          <div className="ck-field" style={{ margin: 0 }}>
            <label htmlFor="promoters-4" className="ck-label">Meta de presenças (opcional)</label>
            <input id="promoters-4" className="ck-input" type="number" min="0" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="—" />
          </div>
        </div>
        <div className="ck-row" style={{ marginTop: 10 }}>
          <div className="ck-field" style={{ margin: 0 }}>
            <label htmlFor="promoters-5" className="ck-label">Tipo de lista</label>
            <select id="promoters-5" className="ck-select" value={listType} onChange={(e) => setListType(e.target.value)}>
              <option value="standard">Padrão</option>
              <option value="free_until">Grátis até (horário)</option>
              <option value="birthday">Aniversário</option>
              <option value="vip">VIP</option>
            </select>
          </div>
          {listType === 'free_until' && (
            <div className="ck-field" style={{ margin: 0 }}>
              <label htmlFor="promoters-6" className="ck-label">Grátis até</label>
              <input id="promoters-6" className="ck-input" type="datetime-local" value={freeUntil} onChange={(e) => setFreeUntil(e.target.value)} />
            </div>
          )}
        </div>
        <button className="ck-btn ck-btn--primary" style={{ marginTop: 12 }} disabled={creating || name.trim().length < 2}>
          {creating ? 'Criando…' : '+ Criar promoter'}
        </button>
      </form>

      <div style={{ marginTop: 24 }}>
        {promoters.length === 0 ? (
          <div className="ck-empty">Nenhum promoter ainda.</div>
        ) : (
          [...promoters].sort((a, b) => b.checked_in - a.checked_in).map((p, i) => (
            <div key={p.id} className="ck-card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <strong style={{ fontSize: 'var(--pp-fs-18)' }}>
                    {(p.checked_in > 0 && ['🥇', '🥈', '🥉'][i]) ? `${['🥇', '🥈', '🥉'][i]} ` : `${i + 1}. `}{p.name}
                  </strong>
                  <div style={{ color: 'var(--pp-fg-3)', fontSize: 13, marginTop: 4 }}>
                    {p.clicks ?? 0} cliques → {p.confirmed} inscritos → {p.checked_in} presentes
                    {p.clicks > 0 && ` · ${Math.round((p.confirmed / p.clicks) * 100)}% conv.`}
                    {' · comissão '}{brl(p.commission_due_cents)}
                  </div>
                  <code style={{ color: 'var(--pp-fg-4)', fontSize: 12 }}>{WEB}/lista/{p.code}</code>
                  {p.goal_checkins != null && (
                    <div style={{ marginTop: 6, maxWidth: 260 }}>
                      <div style={{ fontSize: 12, color: 'var(--pp-fg-3)' }}>Meta: {p.checked_in}/{p.goal_checkins} presenças</div>
                      <div style={{ height: 6, background: 'var(--pp-edge-2)', borderRadius: 99, marginTop: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${p.goal_checkins ? Math.min(100, (p.checked_in / p.goal_checkins) * 100) : 0}%`, background: 'var(--pp-pulse)' }} />
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="ck-btn ck-btn--glass" onClick={() => copyLink(p.code)}>
                    {copiedCode === p.code ? 'Copiado!' : 'Copiar link'}
                  </button>
                  <button className="ck-btn ck-btn--ghost" onClick={() => openGuests(p.id)}>
                    {openId === p.id ? 'Fechar' : 'Ver inscritos'}
                  </button>
                  <button
                    className="ck-btn ck-btn--primary"
                    disabled={!!p.commission_paid_at || p.commission_due_cents === 0}
                    onClick={() => payCommission(p.id)}
                  >
                    {p.commission_paid_at ? 'Comissão paga ✓' : 'Marcar comissão paga'}
                  </button>
                </div>
              </div>

              {openId === p.id && (
                <div style={{ marginTop: 14, borderTop: '1px solid var(--pp-edge-1)', paddingTop: 12 }}>
                  {guests.guests.length === 0 ? (
                    <p style={{ color: 'var(--pp-fg-3)' }}>Nenhum inscrito ainda.</p>
                  ) : (
                    <table className="ck-table">
                      <thead><tr><th>Nome</th><th>Contato</th><th>Status</th><th></th></tr></thead>
                      <tbody>
                        {guests.guests.map((g) => (
                          <tr key={g.id}>
                            <td>{g.name}</td>
                            <td style={{ color: 'var(--pp-fg-3)', fontSize: 13 }}>{g.email || g.phone || '—'}</td>
                            <td>
                              <span className={`ck-badge ${g.status === 'checked_in' ? 'ck-badge--published' : 'ck-badge--draft'}`}>
                                {g.status === 'checked_in' ? 'Presente' : 'Confirmado'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              {g.status !== 'checked_in' && (
                                <button className="ck-btn ck-btn--glass" onClick={() => checkin(g.id)}>Check-in</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Shell>
  );
}
