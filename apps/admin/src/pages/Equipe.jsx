import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shell, Loading, ErrorBox } from '../components/Shell.jsx';
import { api } from '../lib/api.js';

const ROLES = [
  { value: 'manager', label: 'Gerente (tudo do evento)' },
  { value: 'door', label: 'Porta (check-in)' },
  { value: 'bar', label: 'Bar / PDV' },
];

export default function Equipe() {
  const { id } = useParams();
  const [staff, setStaff] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('door');
  const [busy, setBusy] = useState(false);

  async function load() {
    try { setStaff(await api.listStaff(id)); setStatus('done'); }
    catch (e) { setError(e.message); setStatus('error'); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  async function add(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await api.addStaff(id, email.trim(), role);
      setEmail('');
      await load();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function remove(staffId) {
    try { await api.removeStaff(id, staffId); await load(); }
    catch (err) { setError(err.message); }
  }

  if (status === 'loading') return <Shell><Loading /></Shell>;

  return (
    <Shell>
      <Link to={`/eventos/${id}`} className="ck-btn ck-btn--glass ck-btn--sm" style={{ marginBottom: "16px" }}>← Dashboard</Link>
      <div className="ck-eyebrow">evento · equipe</div>
      <h1 className="ck-h1">Equipe do evento</h1>
      <p className="ck-sub">Delegue acesso por papel: gerente, porta ou bar. O dono sempre tem acesso total.</p>

      <div className="ck-card" style={{ maxWidth: 560 }}>
        <form onSubmit={add} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="ck-field" style={{ flex: '1 1 220px', margin: 0 }}>
            <label className="ck-label">E-mail (já cadastrado no PulsePass)</label>
            <input className="ck-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="pessoa@email.com" />
          </div>
          <div className="ck-field" style={{ margin: 0 }}>
            <label className="ck-label">Papel</label>
            <select className="ck-input" value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <button className="ck-btn ck-btn--primary" disabled={busy || !email.trim()}>
            {busy ? 'Adicionando…' : 'Adicionar'}
          </button>
        </form>
        {error && <ErrorBox>{error}</ErrorBox>}
      </div>

      <div className="ck-card" style={{ maxWidth: 560, marginTop: 16 }}>
        {staff.length === 0 ? (
          <p style={{ color: 'var(--pp-fg-3)' }}>Ninguém na equipe ainda. Só o dono opera o evento.</p>
        ) : (
          <table className="ck-table">
            <thead><tr><th>Pessoa</th><th>Papel</th><th></th></tr></thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id}>
                  <td>{s.profiles?.full_name || s.profiles?.email}<br /><span style={{ color: 'var(--pp-fg-4)', fontSize: 12 }}>{s.profiles?.email}</span></td>
                  <td>{ROLES.find((r) => r.value === s.role)?.label ?? s.role}</td>
                  <td><button className="ck-btn ck-btn--glass" onClick={() => remove(s.id)}>Remover</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Shell>
  );
}
