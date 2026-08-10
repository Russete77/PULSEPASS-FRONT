import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Shell, Loading, ErrorBox, BackLink } from '../components/Shell.jsx';
import { Icon } from '@pulsepass/shared/Icon';
import { api } from '../lib/api.js';
import { brl } from '../lib/format.js';

/**
 * Cardápio & estoque do bar cashless.
 *
 * Layout segue o mockup StockScreen do design system ("onde o lucro
 * realmente mora"): KPIs em cima, tabela com margem colorida e uma faixa de
 * alerta quando algo zerou. Os KPIs são todos derivados dos itens reais —
 * não existe contagem de vendidos nem estoque máximo no banco, então as
 * colunas "Vendidos" e a barra de nível do mockup ficam de fora.
 */
const EMPTY = { name: '', category: '', price_reais: '', stock: '', cost_reais: '' };

/** Margem em % e em reais. Sem custo informado, "—" — não se inventa lucro. */
function margem(it) {
  if (it.cost_cents == null || !it.price_cents) return <span style={{ color: 'var(--pp-fg-5)' }}>—</span>;
  const lucro = it.price_cents - it.cost_cents;
  const pct = Math.round((lucro / it.price_cents) * 100);
  const cor = pct < 0 ? '#FF6B61' : pct < 30 ? 'var(--pp-amber)' : 'var(--pp-pulse)';
  return (
    <span style={{ color: cor, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
      {pct}%<span style={{ color: 'var(--pp-fg-4)', fontSize: 12, fontWeight: 400 }}> · {brl(lucro)}</span>
    </span>
  );
}

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
        cost_cents: form.cost_reais !== '' ? Math.round(Number(form.cost_reais) * 100) : null,
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

  /* KPIs derivados dos itens — só o que dá pra afirmar com o que existe.
     Margem média e valor em estoque consideram apenas itens COM custo
     informado; melhor um número parcial e honesto que um total inventado. */
  const comCusto = items.filter((i) => i.cost_cents != null && i.price_cents > 0);
  const margemMedia = comCusto.length
    ? Math.round(comCusto.reduce((s, i) => s + (i.price_cents - i.cost_cents) / i.price_cents, 0) / comCusto.length * 100)
    : null;
  const valorEstoque = comCusto
    .filter((i) => i.stock != null)
    .reduce((s, i) => s + i.stock * i.cost_cents, 0);
  const rupturas = items.filter((i) => i.available && i.stock === 0);

  const kpis = [
    { l: 'Itens no cardápio', v: String(items.length), d: `${items.filter((i) => i.available).length} disponíveis`, cor: 'var(--pp-pulse)' },
    { l: 'Margem média', v: margemMedia != null ? `${margemMedia}%` : '—', d: comCusto.length ? `${comCusto.length} item(ns) com custo` : 'informe o custo dos itens', cor: 'var(--pp-pulse)' },
    { l: 'Valor em estoque', v: valorEstoque > 0 ? brl(valorEstoque) : '—', d: 'custo × estoque informados', cor: 'var(--pp-violet)' },
    { l: 'Sem estoque', v: String(rupturas.length), d: rupturas.length ? 'itens à venda zerados' : 'nada zerado', cor: rupturas.length ? 'var(--pp-red)' : 'var(--pp-pulse)' },
  ];

  return (
    <Shell>
      <BackLink to={`/eventos/${id}`} label="Dashboard" />
      <div className="ck-eyebrow">bar · cardápio</div>
      <h1 className="ck-h1">Cardápio & estoque</h1>
      <p className="ck-sub">Itens do bar cashless. Deixe o estoque vazio para ilimitado.</p>

      {error && <ErrorBox>{error}</ErrorBox>}

      {/* KPIs no topo, com o fio de cor no topo do cartão como no mockup. */}
      {items.length > 0 && (
        <div className="ck-metrics" style={{ marginBottom: 20 }}>
          {kpis.map((k) => (
            <div key={k.l} className="ck-metric" style={{ position: 'relative', overflow: 'hidden' }}>
              <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: k.cor, opacity: 0.7 }} />
              <div className="lbl">{k.l}</div>
              <div className="val" style={{ fontSize: 'var(--pp-fs-24)' }}>{k.v}</div>
              <div style={{ marginTop: 4, fontSize: 11, color: 'var(--pp-fg-4)' }}>{k.d}</div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={create} className="ck-card" style={{ maxWidth: 720 }}>
        <div className="ck-row">
          <div className="ck-field" style={{ margin: 0 }}>
            <label htmlFor="cardapio-1" className="ck-label">Nome</label>
            <input id="cardapio-1" className="ck-input" value={form.name} onChange={set('name')} required />
          </div>
          <div className="ck-field" style={{ margin: 0 }}>
            <label htmlFor="cardapio-2" className="ck-label">Categoria</label>
            <input id="cardapio-2" className="ck-input" value={form.category} onChange={set('category')} placeholder="Geral" />
          </div>
          <div className="ck-field" style={{ margin: 0 }}>
            <label htmlFor="cardapio-3" className="ck-label">Preço (R$)</label>
            <input id="cardapio-3" className="ck-input" type="number" min="0" step="0.01" value={form.price_reais} onChange={set('price_reais')} required />
          </div>
          <div className="ck-field" style={{ margin: 0 }}>
            <label htmlFor="cardapio-4" className="ck-label">Estoque</label>
            <input id="cardapio-4" className="ck-input" type="number" min="0" value={form.stock} onChange={set('stock')} placeholder="∞" />
          </div>
          <div className="ck-field">
            <label className="ck-label" htmlFor="cardapio-custo">Custo (R$)</label>
            {/* Opcional de propósito. Sem custo a margem some da tabela em vez
                de o sistema fingir 100% de lucro — que é a mentira mais
                confortável que um cardápio pode contar. */}
            <input id="cardapio-custo" className="ck-input" type="number" min="0" step="0.01"
              value={form.cost_reais} onChange={set('cost_reais')} placeholder="opcional" />
          </div>
        </div>
        <button className="ck-btn ck-btn--primary" style={{ marginTop: 12 }} disabled={saving || !form.name.trim()}>
          {saving ? 'Adicionando…' : '+ Adicionar item'}
        </button>
      </form>

      <div className="ck-card" style={{ padding: 0, overflow: 'hidden', marginTop: 20 }}>
        <table className="ck-table">
          <thead><tr><th>Item</th><th>Preço</th><th>Custo</th><th>Margem</th><th>Estoque</th><th>Situação</th><th>Disponível</th><th></th></tr></thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} style={it.available && it.stock === 0 ? { background: 'rgba(255,59,48,0.05)' } : undefined}>
                <td>
                  <div style={{ fontWeight: 600 }}>{it.name}</div>
                  {it.category && <div style={{ color: 'var(--pp-fg-4)', fontSize: 12 }}>{it.category}</div>}
                </td>
                <td style={{ fontFamily: 'var(--pp-font-mono)' }}>{brl(it.price_cents)}</td>
                <td style={{ color: 'var(--pp-fg-3)', fontFamily: 'var(--pp-font-mono)' }}>{it.cost_cents != null ? brl(it.cost_cents) : '—'}</td>
                {/* A margem é o que decide o que promover: o chope de R$ 12
                    pode dar menos lucro que a água de R$ 6, e sem esta coluna
                    ninguém tem como saber. */}
                <td>{margem(it)}</td>
                <td>
                  <input
                    type="number" min="0" defaultValue={it.stock ?? ''} placeholder="∞"
                    className="ck-input" style={{ width: 72 }}
                    aria-label={`Estoque de ${it.name}`}
                    onBlur={(e) => {
                      const v = e.target.value;
                      const next = v === '' ? null : Math.round(Number(v));
                      if (next !== (it.stock ?? null)) patch(it, { stock: next });
                    }}
                  />
                </td>
                <td>
                  {/* Só estados que dá pra afirmar: sem estoque máximo no
                      banco, não existe "crítico/repor" — apenas zerou ou não. */}
                  {it.available && it.stock === 0
                    ? <span className="ck-badge ck-badge--danger">ruptura</span>
                    : !it.available
                      ? <span className="ck-badge">oculto</span>
                      : <span style={{ color: 'var(--pp-fg-4)', fontSize: 12 }}>ok</span>}
                </td>
                <td>
                  <button className={`ck-btn ${it.available ? 'ck-btn--glass' : 'ck-btn--ghost'}`} onClick={() => patch(it, { available: !it.available })}>
                    {it.available ? 'Sim' : 'Não'}
                  </button>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="ck-iconbtn" onClick={() => remove(it)} title={`Excluir ${it.name}`} aria-label={`Excluir ${it.name}`}><Icon name="close" size={15} /></button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={8} style={{ color: 'var(--pp-fg-3)' }}>Nenhum item no cardápio. Adicione o primeiro no formulário acima.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Faixa de alerta do mockup — só aparece quando algo à venda zerou.
          Item zerado que continua "disponível" segue aparecendo pro cliente
          e falha na hora do pedido: é o alerta mais caro da noite. */}
      {rupturas.length > 0 && (
        <div className="ck-card" style={{
          marginTop: 16, borderColor: 'rgba(255,59,48,0.3)', background: 'rgba(255,59,48,0.06)',
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>
              {rupturas.length} item(ns) à venda com estoque zerado
            </div>
            <div style={{ color: 'var(--pp-fg-3)', fontSize: 12, marginTop: 2 }}>
              {rupturas.map((i) => i.name).join(' · ')} — reponha o estoque ou marque como indisponível.
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
