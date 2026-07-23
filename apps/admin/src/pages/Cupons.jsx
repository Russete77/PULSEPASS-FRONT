import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shell, Loading, ErrorBox } from '../components/Shell.jsx';
import { api } from '../lib/api.js';
import { brl } from '../lib/format.js';

const EMPTY = { code: '', kind: 'percent', value: '', max_uses: '', expires_at: '' };

export default function Cupons() {
  const { id } = useParams();
  const [coupons, setCoupons] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  async function load() {
    try { setCoupons(await api.listCoupons(id)); setStatus('done'); }
    catch (e) { setError(e.message); setStatus('error'); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function create(e) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const body = {
        code: form.code.trim().toUpperCase(),
        kind: form.kind,
        value: form.kind === 'percent'
          ? Math.round(Number(form.value))
          : Math.round(Number(form.value) * 100),
        max_uses: form.max_uses !== '' ? Math.round(Number(form.max_uses)) : null,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      };
      await api.createCoupon(id, body);
      setForm(EMPTY);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggle(c) {
    try { await api.setCouponActive(c.id, !c.active); await load(); }
    catch (e) { setError(e.message); }
  }
  async function remove(c) {
    try { await api.deleteCoupon(c.id); await load(); }
    catch (e) { setError(e.message); }
  }

  if (status === 'loading') return <Shell><Loading /></Shell>;

  const fmtValue = (c) => (c.kind === 'percent' ? `${c.value}%` : brl(c.value));

  return (
    <Shell>
      <Link to={`/eventos/${id}`} className="ck-btn ck-btn--glass ck-btn--sm" style={{ marginBottom: "16px" }}>← Dashboard</Link>
      <div className="ck-eyebrow">cupons · desconto</div>
      <h1 className="ck-h1">Cupons de desconto</h1>
      <p className="ck-sub">Percentual ou valor fixo, com limite de usos e validade opcionais.</p>

      {error && <ErrorBox>{error}</ErrorBox>}

      <form onSubmit={create} className="ck-card" style={{ maxWidth: 680 }}>
        <div className="ck-row">
          <div className="ck-field">
            <label className="ck-label">Código</label>
            <input className="ck-input" value={form.code} onChange={set('code')} placeholder="VIP20" style={{ textTransform: 'uppercase' }} required minLength={3} />
          </div>
          <div className="ck-field">
            <label className="ck-label">Tipo</label>
            <select className="ck-input" value={form.kind} onChange={set('kind')}>
              <option value="percent">Percentual (%)</option>
              <option value="fixed">Valor fixo (R$)</option>
            </select>
          </div>
          <div className="ck-field">
            <label className="ck-label">{form.kind === 'percent' ? 'Valor (%)' : 'Valor (R$)'}</label>
            <input className="ck-input" type="number" min="0" step={form.kind === 'percent' ? '1' : '0.01'} value={form.value} onChange={set('value')} required />
          </div>
        </div>
        <div className="ck-row">
          <div className="ck-field">
            <label className="ck-label">Limite de usos (opcional)</label>
            <input className="ck-input" type="number" min="1" value={form.max_uses} onChange={set('max_uses')} placeholder="ilimitado" />
          </div>
          <div className="ck-field">
            <label className="ck-label">Validade (opcional)</label>
            <input className="ck-input" type="datetime-local" value={form.expires_at} onChange={set('expires_at')} />
          </div>
        </div>
        <button className="ck-btn ck-btn--primary" disabled={saving}>{saving ? 'Criando…' : '+ Criar cupom'}</button>
      </form>

      <div className="ck-card" style={{ padding: 0, overflow: 'hidden', marginTop: 20 }}>
        <table className="ck-table">
          <thead>
            <tr><th>Código</th><th>Desconto</th><th>Usos</th><th>Validade</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id}>
                <td style={{ fontFamily: 'var(--pp-font-mono)' }}>{c.code}</td>
                <td>{fmtValue(c)}</td>
                <td>{c.used_count}{c.max_uses != null ? ` / ${c.max_uses}` : ''}</td>
                <td>{c.expires_at ? new Date(c.expires_at).toLocaleDateString('pt-BR') : '—'}</td>
                <td><span className={`ck-badge ${c.active ? 'ck-badge--published' : 'ck-badge--draft'}`}>{c.active ? 'ativo' : 'inativo'}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button className="ck-btn ck-btn--glass" onClick={() => toggle(c)}>{c.active ? 'Desativar' : 'Ativar'}</button>
                    <button className="ck-iconbtn" onClick={() => remove(c)} title="Excluir">✕</button>
                  </div>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr><td colSpan={6} style={{ color: 'var(--pp-fg-3)' }}>Nenhum cupom ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
