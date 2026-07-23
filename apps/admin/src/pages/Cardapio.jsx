import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shell, Loading, ErrorBox } from '../components/Shell.jsx';
import { api } from '../lib/api.js';
import { brl } from '../lib/format.js';

const EMPTY = { name: '', category: '', price_reais: '', stock: '' };

export default function Cardapio() {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    api.listMenuItems(id)
      .then((d) => { setItems(d); setStatus('done'); })
      .catch((e) => { setError(e.message); setStatus('error'); });
  }, [id]);
  useEffect(() => { load(); }, [load]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function create(e) {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await api.createMenuItem(id, {
        name: form.name.trim(),
        category: form.category.trim() || undefined,
        price_cents: Math.round(Number(form.price_reais) * 100),
        stock: form.stock !== '' ? Math.round(Number(form.stock)) : null,
      });
      setForm(EMPTY); load();
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  }

  async function patch(item, body) {
    try { await api.updateMenuItem(item.id, body); load(); }
    catch (e) { setError(e.message); }
  }
  async function remove(item) {
    if (!window.confirm(`Excluir "${item.name}"?`)) return;
    try { await api.deleteMenuItem(item.id); load(); }
    catch (e) { setError(e.message); }
  }

  if (status === 'loading') return <Shell><Loading /></Shell>;

  return (
    <Shell>
      <Link to={`/eventos/${id}`} className="ck-btn ck-btn--glass ck-btn--sm" style={{ marginBottom: "16px" }}>← Dashboard</Link>
      <div className="ck-eyebrow">bar · cardápio</div>
      <h1 className="ck-h1">Cardápio & estoque</h1>
      <p className="ck-sub">Itens do bar cashless. Deixe o estoque vazio para ilimitado.</p>

      {error && <ErrorBox>{error}</ErrorBox>}

      <form onSubmit={create} className="ck-card" style={{ maxWidth: 720 }}>
        <div className="ck-row">
          <div className="ck-field" style={{ margin: 0 }}>
            <label className="ck-label">Nome</label>
            <input className="ck-input" value={form.name} onChange={set('name')} required />
          </div>
          <div className="ck-field" style={{ margin: 0 }}>
            <label className="ck-label">Categoria</label>
            <input className="ck-input" value={form.category} onChange={set('category')} placeholder="Geral" />
          </div>
          <div className="ck-field" style={{ margin: 0 }}>
            <label className="ck-label">Preço (R$)</label>
            <input className="ck-input" type="number" min="0" step="0.01" value={form.price_reais} onChange={set('price_reais')} required />
          </div>
          <div className="ck-field" style={{ margin: 0 }}>
            <label className="ck-label">Estoque</label>
            <input className="ck-input" type="number" min="0" value={form.stock} onChange={set('stock')} placeholder="∞" />
          </div>
        </div>
        <button className="ck-btn ck-btn--primary" style={{ marginTop: 12 }} disabled={saving || !form.name.trim()}>
          {saving ? 'Adicionando…' : '+ Adicionar item'}
        </button>
      </form>

      <div className="ck-card" style={{ padding: 0, overflow: 'hidden', marginTop: 20 }}>
        <table className="ck-table">
          <thead><tr><th>Item</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th>Disponível</th><th></th></tr></thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td>{it.name}</td>
                <td style={{ color: 'var(--pp-fg-3)' }}>{it.category}</td>
                <td>{brl(it.price_cents)}</td>
                <td>
                  <input
                    type="number" min="0" defaultValue={it.stock ?? ''} placeholder="∞"
                    className="ck-input" style={{ width: 72 }}
                    onBlur={(e) => {
                      const v = e.target.value;
                      const next = v === '' ? null : Math.round(Number(v));
                      if (next !== (it.stock ?? null)) patch(it, { stock: next });
                    }}
                  />
                </td>
                <td>
                  <button className={`ck-btn ${it.available ? 'ck-btn--glass' : 'ck-btn--ghost'}`} onClick={() => patch(it, { available: !it.available })}>
                    {it.available ? 'Sim' : 'Não'}
                  </button>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="ck-iconbtn" onClick={() => remove(it)} title="Excluir">✕</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={6} style={{ color: 'var(--pp-fg-3)' }}>Nenhum item no cardápio.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
