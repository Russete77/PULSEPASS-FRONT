import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Shell, Loading, ErrorBox, BackLink } from '../components/Shell.jsx';
import { Icon } from '@pulsepass/shared/Icon';
import Confirmar from '@pulsepass/shared/Confirmar';
import { api } from '../lib/api.js';
import { brl } from '../lib/format.js';

const EMPTY = { code: '', kind: 'percent', value: '', max_uses: '', expires_at: '' };

/* Rotação de cor por cupom, como no mockup — mas saindo dos tokens. */
const TONES = ['var(--pp-pulse)', 'var(--pp-violet)', 'var(--pp-cyan)', 'var(--pp-amber)'];

export default function Cupons() {
  const { id } = useParams();
  const [coupons, setCoupons] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [aExcluir, setAExcluir] = useState(null);   // cupom aguardando confirmação

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
  // O erro sobe para o diálogo, que fica aberto mostrando o motivo. Antes ia
  // para o topo da página e sumia da vista de quem estava olhando a linha.
  async function remove(c) {
    await api.deleteCoupon(c.id);
    await load();
  }

  if (status === 'loading') return <Shell><Loading /></Shell>;

  const fmtValue = (c) => (c.kind === 'percent' ? `${c.value}%` : brl(c.value));
  const ativos = coupons.filter((c) => c.active).length;

  return (
    <Shell>
      <BackLink to={`/eventos/${id}`} label="Dashboard" />
      <div className="ck-eyebrow">marketing · cupons</div>
      <h1 className="ck-h1">Cupons · <span className="pp-accent">conversão</span></h1>
      <p className="ck-sub">Percentual ou valor fixo, com limite de usos e validade opcionais.</p>

      {error && <ErrorBox>{error}</ErrorBox>}

      {/* Painel largo (cupons) — a coluna de campanhas/push do mockup não
          existe no backend, então não entra. */}
      <form onSubmit={create} className="ck-panel ck-w-read">
        <div className="ck-panel__title">Novo cupom</div>
        <p className="ck-panel__sub ck-mb-4">o código sobe pra caixa alta sozinho</p>
        <div className="ck-row ck-cols-3">
          <div className="ck-field">
            <label htmlFor="cupons-1" className="ck-label">Código</label>
            <input id="cupons-1" className="ck-input ck-upper ck-cod" value={form.code} onChange={set('code')} placeholder="VIP20" required minLength={3} />
          </div>
          <div className="ck-field">
            <label htmlFor="cupons-2" className="ck-label">Tipo</label>
            <select id="cupons-2" className="ck-select" value={form.kind} onChange={set('kind')}>
              <option value="percent">Percentual (%)</option>
              <option value="fixed">Valor fixo (R$)</option>
            </select>
          </div>
          <div className="ck-field">
            <label htmlFor="cupons-3" className="ck-label">{form.kind === 'percent' ? 'Valor (%)' : 'Valor (R$)'}</label>
            <input id="cupons-3" className="ck-input" type="number" min="0" step={form.kind === 'percent' ? '1' : '0.01'} value={form.value} onChange={set('value')} required />
          </div>
        </div>
        <div className="ck-row">
          <div className="ck-field">
            <label htmlFor="cupons-4" className="ck-label">Limite de usos (opcional)</label>
            <input id="cupons-4" className="ck-input" type="number" min="1" value={form.max_uses} onChange={set('max_uses')} placeholder="ilimitado" />
          </div>
          <div className="ck-field">
            <label htmlFor="cupons-5" className="ck-label">Validade (opcional)</label>
            <input id="cupons-5" className="ck-input" type="datetime-local" value={form.expires_at} onChange={set('expires_at')} />
          </div>
        </div>
        <button className="ck-btn ck-btn--primary" disabled={saving}>
          <Icon name="plus" size={16} /> {saving ? 'Criando…' : 'Criar cupom'}
        </button>
      </form>

      <section aria-label="Cupons do evento" className="ck-w-read ck-mt-5">
        <div className="pp-between ck-mb-3">
          <span className="ck-panel__title">Cupons · {coupons.length}</span>
          {coupons.length > 0 && (
            <span className="pp-muted ck-t-support">{ativos} ativo{ativos === 1 ? '' : 's'}</span>
          )}
        </div>

        {coupons.length === 0 && (
          <div className="pp-empty">
            <div className="pp-empty__icon"><Icon name="tag" size={28} /></div>
            <div className="pp-empty__title">Nenhum cupom ainda</div>
            <p>Crie o primeiro no formulário acima — o código vira link de divulgação na hora.</p>
          </div>
        )}

        <div className="pp-stack pp-stack-3">
          {coupons.map((c, i) => {
            const tone = TONES[i % TONES.length];
            const pctUso = c.max_uses != null && c.max_uses > 0
              ? Math.min(100, (c.used_count / c.max_uses) * 100)
              : null;
            return (
              <article key={c.id} className={`ck-cupom ${c.active ? '' : 'ck-cupom--off'}`} style={{ '--k': tone }}>
                <span className="ck-cupom__code">{c.code}</span>

                <div className="ck-cupom__info">
                  <div className="ck-w-semi ck-t-support">
                    {fmtValue(c)} de desconto
                  </div>
                  <div className="pp-muted pp-mono ck-meta">
                    {c.expires_at
                      ? `até ${new Date(c.expires_at).toLocaleDateString('pt-BR')}`
                      : 'sem expiração'}
                    {' · '}
                    <span className={`ck-badge ${c.active ? 'ck-badge--published' : 'ck-badge--draft'} ck-t-label`}>
                      {c.active ? 'ativo' : 'inativo'}
                    </span>
                  </div>
                </div>

                {/* Uso real: barra só quando existe limite; sem limite mostra
                    a contagem crua em vez de inventar denominador. */}
                <div className="ck-cupom__uso">
                  <div className="pp-between ck-t-support ck-mb-1">
                    <span className="pp-mono pp-muted">{c.used_count} uso{c.used_count === 1 ? '' : 's'}</span>
                    <span className="pp-mono pp-muted-2">{c.max_uses != null ? c.max_uses : '∞'}</span>
                  </div>
                  {pctUso != null && (
                    <div className="ck-bar">
                      <div className="track"><div className="fill" style={{ width: `${pctUso}%` }} /></div>
                    </div>
                  )}
                </div>

                <div className="pp-row ck-gap-2">
                  <button className="ck-btn ck-btn--glass ck-btn--sm" onClick={() => toggle(c)}>
                    {c.active ? 'Desativar' : 'Ativar'}
                  </button>
                  <button className="ck-iconbtn" onClick={() => setAExcluir(c)}
                    title={`Excluir cupom ${c.code}`} aria-label={`Excluir cupom ${c.code}`}>
                    <Icon name="close" size={15} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Cupom já divulgado que some sem aviso vira cliente na porta com um
          código que não funciona mais. A confirmação nomeia o código e conta
          quantas vezes já foi usado — é o dado que decide se pode apagar. */}
      <Confirmar
        aberto={!!aExcluir}
        titulo={`Excluir o cupom ${aExcluir?.code ?? ''}?`}
        descricao={
          aExcluir?.used_count > 0
            ? `Este cupom já foi usado ${aExcluir.used_count} vez(es). Quem ainda não comprou e recebeu o código vai encontrá-lo inválido. Os pedidos já feitos não mudam.`
            : 'O código deixa de funcionar imediatamente. Não dá para desfazer.'
        }
        confirmar="Excluir cupom"
        onConfirmar={() => remove(aExcluir)}
        onFechar={() => setAExcluir(null)}
      />
    </Shell>
  );
}
