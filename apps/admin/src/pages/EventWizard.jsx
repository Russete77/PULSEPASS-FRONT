import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shell, Loading, ErrorBox } from '../components/Shell.jsx';
import { Icon } from '@pulsepass/shared/Icon';
import { api } from '../lib/api.js';
import { toDatetimeLocal } from '../lib/format.js';

export default function EventWizard() {
  const navigate = useNavigate();
  const [org, setOrg] = useState(null);
  const [loadingOrg, setLoadingOrg] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '', venue_name: '', address: '', city: '', state: '',
    starts_at: toDatetimeLocal(), description: '', service_fee_pct: '',
    reentry_enabled: false, reentry_max: '',
  });
  const [tiers, setTiers] = useState([{ name: '1º Lote', price_reais: '', half_reais: '', quantity_total: '', sales_start: '', sales_end: '' }]);

  useEffect(() => {
    api.me()
      .then((me) => {
        setOrg(me.organizations[0] ?? null);
        setLoadingOrg(false);
      })
      .catch((e) => { setError(e.message); setLoadingOrg(false); });
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setTier = (i, k, v) => setTiers((t) => t.map((row, idx) => (idx === i ? { ...row, [k]: v } : row)));
  const addTier = () => setTiers((t) => [...t, { name: `${t.length + 1}º Lote`, price_reais: '', half_reais: '', quantity_total: '', sales_start: '', sales_end: '' }]);
  const removeTier = (i) => setTiers((t) => t.filter((_, idx) => idx !== i));

  async function submit(e, publish) {
    e.preventDefault();
    if (!org) return;
    setSaving(true);
    setError('');
    try {
      const payload = {
        organization_id: org.id,
        title: form.title,
        description: form.description || undefined,
        venue_name: form.venue_name || undefined,
        address: form.address || undefined,
        city: form.city,
        state: form.state.toUpperCase(),
        starts_at: new Date(form.starts_at).toISOString(),
        service_fee_bps: form.service_fee_pct !== '' ? Math.round(Number(form.service_fee_pct) * 100) : 0,
        reentry_enabled: form.reentry_enabled,
        reentry_max: form.reentry_enabled && form.reentry_max !== '' ? Number(form.reentry_max) : null,
        tiers: tiers
          .filter((t) => t.name && t.price_reais !== '' && t.quantity_total !== '')
          .map((t) => ({
            name: t.name,
            price_cents: Math.round(Number(t.price_reais) * 100),
            half_price_cents: t.half_reais !== '' ? Math.round(Number(t.half_reais) * 100) : null,
            quantity_total: Math.round(Number(t.quantity_total)),
            sales_start: t.sales_start ? new Date(t.sales_start).toISOString() : null,
            sales_end: t.sales_end ? new Date(t.sales_end).toISOString() : null,
          })),
      };
      const event = await api.createEvent(payload);
      if (publish) await api.setStatus(event.id, 'published');
      navigate(`/eventos/${event.id}`);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  if (loadingOrg) return <Shell><Loading /></Shell>;

  return (
    <Shell>
      <div className="ck-eyebrow">novo evento</div>
      <h1 className="ck-h1">Criar evento</h1>
      <p className="ck-sub">Preencha os dados, defina os lotes e publique quando quiser.</p>

      {error && <ErrorBox>{error}</ErrorBox>}

      <form onSubmit={(e) => submit(e, false)} className="ck-card" style={{ maxWidth: 760 }}>
        <div className="ck-field">
          <label className="ck-label">Título</label>
          <input className="ck-input" value={form.title} onChange={set('title')} required minLength={2} />
        </div>
        <div className="ck-row">
          <div className="ck-field">
            <label className="ck-label">Local (venue)</label>
            <input className="ck-input" value={form.venue_name} onChange={set('venue_name')} />
          </div>
          <div className="ck-field">
            <label className="ck-label">Data e hora</label>
            <input className="ck-input" type="datetime-local" value={form.starts_at} onChange={set('starts_at')} required />
          </div>
        </div>
        <div className="ck-field">
          <label className="ck-label">Endereço</label>
          <input className="ck-input" value={form.address} onChange={set('address')} />
        </div>
        <div className="ck-row">
          <div className="ck-field">
            <label className="ck-label">Cidade</label>
            <input className="ck-input" value={form.city} onChange={set('city')} required />
          </div>
          <div className="ck-field">
            <label className="ck-label">UF</label>
            <input className="ck-input" value={form.state} onChange={set('state')} maxLength={2} required placeholder="SP" />
          </div>
        </div>
        <div className="ck-field">
          <label className="ck-label">Descrição</label>
          <textarea className="ck-textarea" value={form.description} onChange={set('description')} />
        </div>
        <div className="ck-field">
          <label className="ck-label">Taxa de serviço (%) — aplicada sobre o subtotal no checkout</label>
          <input className="ck-input" type="number" min="0" max="100" step="0.01" placeholder="0" value={form.service_fee_pct} onChange={set('service_fee_pct')} style={{ maxWidth: 200 }} />
        </div>

        {/* Reentrada: desligada por padrão de propósito. Liberar sem a casa
            pedir é convite a ingresso emprestado. */}
        <div className="ck-field">
          <label className="ck-label">Reentrada</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 0' }}>
            <input type="checkbox" checked={form.reentry_enabled}
              onChange={(e) => setForm((f) => ({ ...f, reentry_enabled: e.target.checked }))} />
            <span>Permitir sair e voltar com o mesmo ingresso</span>
          </label>
          {form.reentry_enabled && (
            <input className="ck-input" type="number" min="1" max="20" placeholder="Máximo de entradas (vazio = sem limite)"
              value={form.reentry_max} onChange={set('reentry_max')} style={{ maxWidth: 320 }} />
          )}
          <p style={{ color: 'var(--pp-fg-4)', fontSize: 12, marginTop: 6 }}>
            Com reentrada, a porta alterna entrada e saída e mostra a lotação ao vivo.
          </p>
        </div>

        <div className="ck-label" style={{ marginTop: 16, marginBottom: 10 }}>Lotes <span style={{ color: 'var(--pp-fg-4)', fontWeight: 400 }}>· deixe “Meia” vazio para não oferecer meia-entrada</span></div>
        {tiers.map((t, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <div className="ck-tier">
            <div className="ck-field" style={{ margin: 0 }}>
              <label className="ck-label">Nome</label>
              <input className="ck-input" value={t.name} onChange={(e) => setTier(i, 'name', e.target.value)} />
            </div>
            <div className="ck-field" style={{ margin: 0 }}>
              <label className="ck-label">Preço (R$)</label>
              <input className="ck-input" type="number" min="0" step="0.01" value={t.price_reais} onChange={(e) => setTier(i, 'price_reais', e.target.value)} />
            </div>
            <div className="ck-field" style={{ margin: 0 }}>
              <label className="ck-label">Meia (R$)</label>
              <input className="ck-input" type="number" min="0" step="0.01" placeholder="—" value={t.half_reais} onChange={(e) => setTier(i, 'half_reais', e.target.value)} />
            </div>
            <div className="ck-field" style={{ margin: 0 }}>
              <label className="ck-label">Qtd.</label>
              <input className="ck-input" type="number" min="0" value={t.quantity_total} onChange={(e) => setTier(i, 'quantity_total', e.target.value)} />
            </div>
            <button type="button" className="ck-iconbtn" onClick={() => removeTier(i)} disabled={tiers.length === 1}><Icon name="close" size={15} /></button>
            </div>
            <div className="ck-row" style={{ marginTop: 6 }}>
              <div className="ck-field" style={{ margin: 0 }}>
                <label className="ck-label">Início das vendas (opcional)</label>
                <input className="ck-input" type="datetime-local" value={t.sales_start} onChange={(e) => setTier(i, 'sales_start', e.target.value)} />
              </div>
              <div className="ck-field" style={{ margin: 0 }}>
                <label className="ck-label">Fim das vendas (opcional)</label>
                <input className="ck-input" type="datetime-local" value={t.sales_end} onChange={(e) => setTier(i, 'sales_end', e.target.value)} />
              </div>
            </div>
          </div>
        ))}
        <button type="button" className="ck-btn ck-btn--ghost" style={{ color: 'var(--pp-pulse)', paddingLeft: 0 }} onClick={addTier}>
          + Adicionar lote
        </button>

        <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
          <button type="submit" className="ck-btn ck-btn--glass" disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar rascunho'}
          </button>
          <button type="button" className="ck-btn ck-btn--primary" disabled={saving} onClick={(e) => submit(e, true)}>
            {saving ? 'Publicando…' : 'Salvar e publicar'}
          </button>
        </div>
      </form>
    </Shell>
  );
}
