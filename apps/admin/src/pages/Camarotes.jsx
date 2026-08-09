import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shell, Loading, ErrorBox, BackLink } from '../components/Shell.jsx';
import { Icon } from '@pulsepass/shared/Icon';
import { api } from '../lib/api.js';
import { brl } from '../lib/format.js';

const EMPTY = { name: '', area: 'Camarote', capacity: '', min_reais: '' };
/** "há 2h47" — o número que decide qual mesa cobrar e qual liberar. */
function ocupadaHa(iso) {
  const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  return min < 60 ? `${min}min` : `${Math.floor(min / 60)}h${String(min % 60).padStart(2, '0')}`;
}

const RES_LABEL = { requested: 'Solicitada', confirmed: 'Confirmada', seated: 'Na mesa', rejected: 'Recusada', cancelled: 'Liberada' };

export default function Camarotes() {
  const { id } = useParams();
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    Promise.all([api.listTables(id), api.listReservations(id)])
      .then(([t, r]) => { setTables(t); setReservations(r); setStatus('done'); })
      .catch((e) => { setError(e.message); setStatus('error'); });
  }, [id]);
  useEffect(() => { load(); }, [load]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function create(e) {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await api.createTable(id, {
        name: form.name.trim(), area: form.area.trim() || 'Camarote',
        capacity: form.capacity !== '' ? Math.round(Number(form.capacity)) : null,
        min_spend_cents: form.min_reais !== '' ? Math.round(Number(form.min_reais) * 100) : 0,
      });
      setForm(EMPTY); load();
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  }
  async function removeTable(t) {
    if (!window.confirm(`Excluir "${t.name}"?`)) return;
    try { await api.deleteTable(t.id); load(); } catch (e) { setError(e.message); }
  }
  async function setRes(r, s) {
    try { await api.setReservation(r.id, s); load(); } catch (e) { setError(e.message); }
  }

  if (status === 'loading') return <Shell><Loading /></Shell>;

  return (
    <Shell>
      <BackLink to={`/eventos/${id}`} label="Dashboard" />
      <div className="ck-eyebrow">azlist · camarotes</div>
      <h1 className="ck-h1">Camarotes & reservas</h1>
      <p className="ck-sub">Cadastre camarotes/mesas com consumação mínima e aprove as solicitações de reserva.</p>

      {error && <ErrorBox>{error}</ErrorBox>}

      <form onSubmit={create} className="ck-card" style={{ maxWidth: 720 }}>
        <div className="ck-row">
          <div className="ck-field" style={{ margin: 0 }}>
            <label htmlFor="camarotes-1" className="ck-label">Nome</label>
            <input id="camarotes-1" className="ck-input" value={form.name} onChange={set('name')} required placeholder="Camarote A" />
          </div>
          <div className="ck-field" style={{ margin: 0 }}>
            <label htmlFor="camarotes-2" className="ck-label">Área</label>
            <input id="camarotes-2" className="ck-input" value={form.area} onChange={set('area')} placeholder="Camarote" />
          </div>
          <div className="ck-field" style={{ margin: 0 }}>
            <label htmlFor="camarotes-3" className="ck-label">Capacidade</label>
            <input id="camarotes-3" className="ck-input" type="number" min="1" value={form.capacity} onChange={set('capacity')} placeholder="—" />
          </div>
          <div className="ck-field" style={{ margin: 0 }}>
            <label htmlFor="camarotes-4" className="ck-label">Consumação mín. (R$)</label>
            <input id="camarotes-4" className="ck-input" type="number" min="0" step="0.01" value={form.min_reais} onChange={set('min_reais')} placeholder="0,00" />
          </div>
        </div>
        <button className="ck-btn ck-btn--primary" style={{ marginTop: 12 }} disabled={saving || !form.name.trim()}>
          {saving ? 'Adicionando…' : '+ Adicionar camarote'}
        </button>
      </form>

      <h2 style={{ fontSize: 'var(--pp-fs-18)', marginTop: 28, marginBottom: 12 }}>Camarotes</h2>
      <div className="ck-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="ck-table">
          <thead><tr><th>Nome</th><th>Área</th><th>Capacidade</th><th>Consumação</th><th></th></tr></thead>
          <tbody>
            {tables.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td style={{ color: 'var(--pp-fg-3)' }}>{t.area}</td>
                <td>{t.capacity ?? '—'}</td>
                <td>{t.min_spend_cents ? brl(t.min_spend_cents) : '—'}</td>
                <td style={{ textAlign: 'right' }}><button className="ck-iconbtn" onClick={() => removeTable(t)} title="Excluir"><Icon name="close" size={15} /></button></td>
              </tr>
            ))}
            {tables.length === 0 && <tr><td colSpan={5} style={{ color: 'var(--pp-fg-3)' }}>Nenhum camarote cadastrado.</td></tr>}
          </tbody>
        </table>
      </div>

      <h2 style={{ fontSize: 'var(--pp-fs-18)', marginTop: 28, marginBottom: 12 }}>Solicitações de reserva</h2>
      <div className="ck-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="ck-table">
          <thead><tr><th>Cliente</th><th>Camarote</th><th>Pessoas</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {reservations.map((r) => (
              <tr key={r.id}>
                <td>
                  {r.name}
                  {/* A ocasião muda o atendimento: mesa de aniversário ganha
                      o bolo na hora certa. Fica ao lado do nome, não escondida
                      num campo de observação que ninguém abre no meio da
                      noite. */}
                  {r.ocasiao && <span className="ck-ocasiao">{r.ocasiao}</span>}
                  <div style={{ color: 'var(--pp-fg-4)', fontSize: 12 }}>{r.contact}</div>
                </td>
                <td>{r.event_tables?.name ?? '—'}</td>
                <td>{r.party_size ?? '—'}</td>
                <td>
                  <span className={`ck-badge ${
                    r.status === 'seated' ? 'ck-badge--live'
                      : r.status === 'confirmed' ? 'ck-badge--published'
                        : r.status === 'rejected' ? 'ck-badge--draft' : ''}`}>
                    {RES_LABEL[r.status] ?? r.status}
                  </span>
                  {/* "Confirmada" e "chegou" são perguntas diferentes.
                      Confirmada e vazia às 2h é mesa que pode ser liberada;
                      ocupada há três horas é mesa que já consumiu. */}
                  {r.seated_at && (
                    <div className="ck-ocupada">há {ocupadaHa(r.seated_at)}</div>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    {r.status === 'requested' && (
                      <>
                        <button className="ck-btn ck-btn--primary ck-btn--sm" onClick={() => setRes(r, 'confirmed')}>Confirmar</button>
                        <button className="ck-btn ck-btn--glass ck-btn--sm" onClick={() => setRes(r, 'rejected')}>Recusar</button>
                      </>
                    )}
                    {r.status === 'confirmed' && (
                      <button className="ck-btn ck-btn--primary ck-btn--sm" onClick={() => setRes(r, 'seated')}>
                        Chegou
                      </button>
                    )}
                    {r.status === 'seated' && (
                      <button className="ck-btn ck-btn--glass ck-btn--sm" onClick={() => setRes(r, 'cancelled')}>
                        Liberar mesa
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {reservations.length === 0 && <tr><td colSpan={5} style={{ color: 'var(--pp-fg-3)' }}>Nenhuma solicitação ainda.</td></tr>}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
