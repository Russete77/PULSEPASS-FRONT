import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shell, Loading, ErrorBox } from '../components/Shell.jsx';
import { Icon } from '@pulsepass/shared/Icon';
import Confirmar from '@pulsepass/shared/Confirmar';
import { api } from '../lib/api.js';
import { toDatetimeLocal } from '../lib/format.js';

export default function EventWizard() {
  const navigate = useNavigate();
  const [org, setOrg] = useState(null);
  const [loadingOrg, setLoadingOrg] = useState(true);
  const [error, setError] = useState('');
  const [tierAExcluir, setTierAExcluir] = useState(null);   // índice aguardando confirmação
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

  /**
   * Lote em branco some sem perguntar — confirmar aí seria atrito à toa, já
   * que nada foi digitado. Lote com preço e quantidade preenchidos é trabalho
   * que a produtora perde num clique errado, e aí vale a pergunta.
   */
  const tierPreenchido = (t) => Boolean(t.price_reais || t.half_reais || t.quantity_total
    || t.sales_start || t.sales_end || (t.name && !/^\d+º Lote$/.test(t.name)));

  function pedirRemocaoTier(i) {
    if (tierPreenchido(tiers[i])) setTierAExcluir(i);
    else removeTier(i);
  }

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
          <label htmlFor="eventwizar-1" className="ck-label">Título</label>
          <input id="eventwizar-1" className="ck-input" value={form.title} onChange={set('title')} required minLength={2} />
        </div>
        <div className="ck-row">
          <div className="ck-field">
            <label htmlFor="eventwizar-2" className="ck-label">Local (venue)</label>
            <input id="eventwizar-2" className="ck-input" value={form.venue_name} onChange={set('venue_name')} />
          </div>
          <div className="ck-field">
            <label htmlFor="eventwizar-3" className="ck-label">Data e hora</label>
            <input id="eventwizar-3" className="ck-input" type="datetime-local" value={form.starts_at} onChange={set('starts_at')} required />
          </div>
        </div>
        <div className="ck-field">
          <label htmlFor="eventwizar-4" className="ck-label">Endereço</label>
          <input id="eventwizar-4" className="ck-input" value={form.address} onChange={set('address')} />
        </div>
        <div className="ck-row">
          <div className="ck-field">
            <label htmlFor="eventwizar-5" className="ck-label">Cidade</label>
            <input id="eventwizar-5" className="ck-input" value={form.city} onChange={set('city')} required />
          </div>
          <div className="ck-field">
            <label htmlFor="eventwizar-6" className="ck-label">UF</label>
            <input id="eventwizar-6" className="ck-input" value={form.state} onChange={set('state')} maxLength={2} required placeholder="SP" />
          </div>
        </div>
        <div className="ck-field">
          <label htmlFor="eventwizar-7" className="ck-label">Descrição</label>
          <textarea id="eventwizar-7" className="ck-textarea" value={form.description} onChange={set('description')} />
        </div>
        <div className="ck-field">
          <label htmlFor="eventwizar-8" className="ck-label">Taxa de serviço (%) — aplicada sobre o subtotal no checkout</label>
          <input id="eventwizar-8" className="ck-input" type="number" min="0" max="100" step="0.01" placeholder="0" value={form.service_fee_pct} onChange={set('service_fee_pct')} style={{ maxWidth: 200 }} />
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
              <label htmlFor={`lote-${i}-nome`} className="ck-label">Nome</label>
              <input id={`lote-${i}-nome`} className="ck-input" value={t.name} onChange={(e) => setTier(i, 'name', e.target.value)} />
            </div>
            <div className="ck-field" style={{ margin: 0 }}>
              <label htmlFor={`lote-${i}-preco`} className="ck-label">Preço (R$)</label>
              <input id={`lote-${i}-preco`} className="ck-input" type="number" min="0" step="0.01" value={t.price_reais} onChange={(e) => setTier(i, 'price_reais', e.target.value)} />
            </div>
            <div className="ck-field" style={{ margin: 0 }}>
              <label htmlFor={`lote-${i}-meia`} className="ck-label">Meia (R$)</label>
              <input id={`lote-${i}-meia`} className="ck-input" type="number" min="0" step="0.01" placeholder="—" value={t.half_reais} onChange={(e) => setTier(i, 'half_reais', e.target.value)} />
            </div>
            <div className="ck-field" style={{ margin: 0 }}>
              <label htmlFor={`lote-${i}-qtd`} className="ck-label">Qtd.</label>
              <input id={`lote-${i}-qtd`} className="ck-input" type="number" min="0" value={t.quantity_total} onChange={(e) => setTier(i, 'quantity_total', e.target.value)} />
            </div>
            <button type="button" className="ck-iconbtn"
              onClick={() => pedirRemocaoTier(i)} disabled={tiers.length === 1}
              title={tiers.length === 1 ? 'O evento precisa de pelo menos um lote' : `Remover o lote ${t.name || i + 1}`}
              aria-label={`Remover o lote ${t.name || i + 1}`}>
              <Icon name="close" size={15} />
            </button>
            </div>
            <div className="ck-row" style={{ marginTop: 6 }}>
              <div className="ck-field" style={{ margin: 0 }}>
                <label htmlFor={`lote-${i}-ini`} className="ck-label">Início das vendas (opcional)</label>
                <input id={`lote-${i}-ini`} className="ck-input" type="datetime-local" value={t.sales_start} onChange={(e) => setTier(i, 'sales_start', e.target.value)} />
              </div>
              <div className="ck-field" style={{ margin: 0 }}>
                <label htmlFor={`lote-${i}-fim`} className="ck-label">Fim das vendas (opcional)</label>
                <input id={`lote-${i}-fim`} className="ck-input" type="datetime-local" value={t.sales_end} onChange={(e) => setTier(i, 'sales_end', e.target.value)} />
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

      <Confirmar
        aberto={tierAExcluir !== null}
        titulo="Remover este lote?"
        descricao={
          `O lote "${tiers[tierAExcluir]?.name || tierAExcluir + 1}" já tem dados preenchidos `
          + 'e ainda não foi salvo. Ao remover, eles se perdem.'
        }
        confirmar="Remover lote"
        onConfirmar={() => { removeTier(tierAExcluir); }}
        onFechar={() => setTierAExcluir(null)}
      />
    </Shell>
  );
}
