import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shell, Loading, ErrorBox } from '../components/Shell.jsx';
import { Icon } from '@pulsepass/shared/Icon';
import Confirmar from '@pulsepass/shared/Confirmar';
import { api } from '../lib/api.js';
import { toDatetimeLocal } from '../lib/format.js';

/**
 * Criar evento — wizard.
 *
 * Layout da EventWizardScreen do design system: trilha de passos na lateral
 * com barra de progresso, um assunto por tela e a barra de ação embaixo.
 * Antes era um formulário único de 12 campos; quem criava o primeiro evento
 * desistia no meio porque não sabia quanto faltava.
 *
 * O mockup desenha 6 passos; aqui são 4 porque só estes existem no create:
 *  · "Identidade" (banner, lineup) — a capa sobe DEPOIS, na tela do evento
 *    (o upload precisa do id); lineup não existe no schema.
 *  · "Guest list" e "Cashless" — promoters e cardápio são cadastrados nas
 *    telas próprias, que também precisam do evento já criado.
 *  · A "Sugestão Pulse AI" do mockup ficou de fora: não há esse serviço.
 */
const PASSOS = [
  { n: 'Básicos', d: 'Nome, data, local' },
  { n: 'Detalhes', d: 'Descrição, taxa, reentrada' },
  { n: 'Ingressos', d: 'Lotes, preços, quantidades' },
  { n: 'Revisar & publicar', d: 'Confere e vai' },
];

const TIER_VAZIO = (i) => ({
  name: `${i}º Lote`, price_reais: '', half_reais: '', quantity_total: '',
  sales_start: '', sales_end: '',
});

const dataExtenso = (v) => (v ? new Date(v).toLocaleString('pt-BR', {
  weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
}) : '—');

export default function EventWizard() {
  const navigate = useNavigate();
  const [org, setOrg] = useState(null);
  const [loadingOrg, setLoadingOrg] = useState(true);
  const [error, setError] = useState('');
  const [tierAExcluir, setTierAExcluir] = useState(null);   // índice aguardando confirmação
  const [saving, setSaving] = useState(false);
  const [passo, setPasso] = useState(0);
  const conteudoRef = useRef(null);

  const [form, setForm] = useState({
    title: '', venue_name: '', address: '', city: '', state: '',
    starts_at: toDatetimeLocal(), description: '', service_fee_pct: '',
    reentry_enabled: false, reentry_max: '',
  });
  const [tiers, setTiers] = useState([TIER_VAZIO(1)]);

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
  const addTier = () => setTiers((t) => [...t, TIER_VAZIO(t.length + 1)]);
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

  /**
   * Avança validando SÓ o passo visível — o navegador aponta o campo errado
   * na hora, em vez de estourar tudo no fim como no formulário antigo.
   */
  function avancar() {
    const campos = conteudoRef.current?.querySelectorAll('input, textarea, select') ?? [];
    for (const el of campos) {
      if (!el.reportValidity()) return;
    }
    setError('');
    setPasso((p) => Math.min(p + 1, PASSOS.length - 1));
  }

  async function submit(publish) {
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

  const lotesValidos = tiers.filter((t) => t.name && t.price_reais !== '' && t.quantity_total !== '');
  const pct = ((passo + 1) / PASSOS.length) * 100;

  return (
    <Shell>
      <div className="ck-wiz">
        {/* ── Trilha de passos (sidebar do mockup) ── */}
        <aside className="ck-wiz__side" aria-label="Progresso da criação do evento">
          <div className="ck-wiz__brand">
            <div>
              <div className="ck-wiz__title">Novo evento</div>
              <div className="ck-eyebrow">passo {passo + 1} de {PASSOS.length}</div>
            </div>
          </div>
          <div className="ck-wiz__progress" role="progressbar"
            aria-valuenow={passo + 1} aria-valuemin={1} aria-valuemax={PASSOS.length}
            aria-label={`Passo ${passo + 1} de ${PASSOS.length}`}>
            <i style={{ width: `${pct}%` }} />
          </div>
          <ol className="ck-wiz__steps">
            {PASSOS.map((s, i) => {
              const feito = i < passo;
              const ativo = i === passo;
              return (
                <li key={s.n} className={`ck-wiz__step ${feito ? 'is-done' : ''} ${ativo ? 'is-on' : ''}`}>
                  {/* Voltar a um passo já visto é livre; pular pra frente passa
                      pela validação do botão Próximo. */}
                  <button type="button" onClick={() => { if (i <= passo) setPasso(i); }}
                    disabled={i > passo} aria-current={ativo ? 'step' : undefined}>
                    <span className="ck-wiz__dot" aria-hidden="true">
                      {feito ? <Icon name="check" size={13} /> : i + 1}
                    </span>
                    <span>
                      <span className="ck-wiz__n">{s.n}</span>
                      <span className="ck-wiz__d">{s.d}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>

        {/* ── Conteúdo do passo ── */}
        <div className="ck-wiz__main">
          <div className="ck-eyebrow">{String(passo + 1).padStart(2, '0')} · {PASSOS[passo].n}</div>

          {error && <ErrorBox>{error}</ErrorBox>}

          <div ref={conteudoRef}>
            {passo === 0 && (
              <>
                <h1 className="ck-h1">Onde e quando <span className="pp-accent">vai rolar?</span></h1>
                <p className="ck-sub">O nome e a data são o que aparece na vitrine. Dá pra editar depois.</p>
                <div className="ck-card ck-w-read">
                  <div className="ck-field">
                    <label htmlFor="wiz-titulo" className="ck-label">Título</label>
                    <input id="wiz-titulo" className="ck-input" value={form.title} onChange={set('title')} required minLength={2} />
                  </div>
                  <div className="ck-row">
                    <div className="ck-field">
                      <label htmlFor="wiz-venue" className="ck-label">Local (venue)</label>
                      <input id="wiz-venue" className="ck-input" value={form.venue_name} onChange={set('venue_name')} />
                    </div>
                    <div className="ck-field">
                      <label htmlFor="wiz-data" className="ck-label">Data e hora</label>
                      <input id="wiz-data" className="ck-input" type="datetime-local" value={form.starts_at} onChange={set('starts_at')} required />
                    </div>
                  </div>
                  <div className="ck-field">
                    <label htmlFor="wiz-endereco" className="ck-label">Endereço</label>
                    <input id="wiz-endereco" className="ck-input" value={form.address} onChange={set('address')} />
                  </div>
                  <div className="ck-row">
                    <div className="ck-field">
                      <label htmlFor="wiz-cidade" className="ck-label">Cidade</label>
                      <input id="wiz-cidade" className="ck-input" value={form.city} onChange={set('city')} required />
                    </div>
                    <div className="ck-field">
                      <label htmlFor="wiz-uf" className="ck-label">UF</label>
                      <input id="wiz-uf" className="ck-input" value={form.state} onChange={set('state')} maxLength={2} minLength={2} required placeholder="SP" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {passo === 1 && (
              <>
                <h1 className="ck-h1">Como o evento <span className="pp-accent">se apresenta?</span></h1>
                <p className="ck-sub">
                  A capa sobe depois, na página do evento — aqui é o texto e as regras da casa.
                </p>
                <div className="ck-card ck-w-read">
                  <div className="ck-field">
                    <label htmlFor="wiz-desc" className="ck-label">Descrição</label>
                    <textarea id="wiz-desc" className="ck-textarea" value={form.description} onChange={set('description')} />
                  </div>
                  <div className="ck-field">
                    <label htmlFor="wiz-taxa" className="ck-label">Taxa de serviço (%) — aplicada sobre o subtotal no checkout</label>
                    <input id="wiz-taxa" className="ck-input ck-input--num-lg" type="number" min="0" max="100" step="0.01" placeholder="0" value={form.service_fee_pct} onChange={set('service_fee_pct')} />
                  </div>

                  {/* Reentrada: desligada por padrão de propósito. Liberar sem a casa
                      pedir é convite a ingresso emprestado. */}
                  <div className="ck-field ck-mb-0">
                    <label className="ck-label">Reentrada</label>
                    <label className="ck-flex ck-ai-center ck-gap-3 ck-opcao--linha">
                      <input type="checkbox" checked={form.reentry_enabled}
                        onChange={(e) => setForm((f) => ({ ...f, reentry_enabled: e.target.checked }))} />
                      <span>Permitir sair e voltar com o mesmo ingresso</span>
                    </label>
                    {form.reentry_enabled && (
                      <input className="ck-input ck-w-xs" type="number" min="1" max="20" placeholder="Máximo de entradas (vazio = sem limite)" value={form.reentry_max} onChange={set('reentry_max')} aria-label="Máximo de entradas por ingresso"/>
                    )}
                    <p className="pp-muted-2 ck-t-support ck-mt-2">
                      Com reentrada, a porta alterna entrada e saída e mostra a lotação ao vivo.
                    </p>
                  </div>
                </div>
              </>
            )}

            {passo === 2 && (
              <>
                <h1 className="ck-h1">Como você vai <span className="pp-accent">vender?</span></h1>
                <p className="ck-sub">
                  Cada lote é um card. Deixe “Meia” vazio para não oferecer meia-entrada;
                  a janela de vendas é opcional.
                </p>

                {/* Lotes como cards com fio lateral — a estrutura da lista de
                    lotes do mockup. A barra de "vendidos" ficou de fora: o
                    evento ainda não existe, não há venda pra mostrar. */}
                <div className="ck-w-read ck-gap-3 ck-col">
                  {tiers.map((t, i) => (
                    <div key={i} className="ck-lote">
                      <div className="ck-lote__fio" aria-hidden="true" />
                      <div className="ck-lote__corpo">
                        <div className="ck-tier ck-mb-0">
                          <div className="ck-field ck-m-0">
                            <label htmlFor={`lote-${i}-nome`} className="ck-label">Nome</label>
                            <input id={`lote-${i}-nome`} className="ck-input" value={t.name} onChange={(e) => setTier(i, 'name', e.target.value)} />
                          </div>
                          <div className="ck-field ck-m-0">
                            <label htmlFor={`lote-${i}-preco`} className="ck-label">Preço (R$)</label>
                            <input id={`lote-${i}-preco`} className="ck-input" type="number" min="0" step="0.01" value={t.price_reais} onChange={(e) => setTier(i, 'price_reais', e.target.value)} />
                          </div>
                          <div className="ck-field ck-m-0">
                            <label htmlFor={`lote-${i}-meia`} className="ck-label">Meia (R$)</label>
                            <input id={`lote-${i}-meia`} className="ck-input" type="number" min="0" step="0.01" placeholder="—" value={t.half_reais} onChange={(e) => setTier(i, 'half_reais', e.target.value)} />
                          </div>
                          <div className="ck-field ck-m-0">
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
                        <div className="ck-row ck-mt-2">
                          <div className="ck-field ck-m-0">
                            <label htmlFor={`lote-${i}-ini`} className="ck-label">Início das vendas (opcional)</label>
                            <input id={`lote-${i}-ini`} className="ck-input" type="datetime-local" value={t.sales_start} onChange={(e) => setTier(i, 'sales_start', e.target.value)} />
                          </div>
                          <div className="ck-field ck-m-0">
                            <label htmlFor={`lote-${i}-fim`} className="ck-label">Fim das vendas (opcional)</label>
                            <input id={`lote-${i}-fim`} className="ck-input" type="datetime-local" value={t.sales_end} onChange={(e) => setTier(i, 'sales_end', e.target.value)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* "Adicionar lote" em traço, como no mockup. */}
                  <button type="button" className="ck-lote__add" onClick={addTier}>
                    <Icon name="plus" size={15} /> Adicionar lote
                  </button>
                </div>
              </>
            )}

            {passo === 3 && (
              <>
                <h1 className="ck-h1">Confere e <span className="pp-accent">publica.</span></h1>
                <p className="ck-sub">
                  Rascunho fica invisível na vitrine; publicado começa a vender na hora.
                </p>
                <div className="ck-card ck-w-read">
                  <div className="ck-label">Resumo</div>
                  <dl className="ck-wiz__resumo">
                    <div><dt>Evento</dt><dd>{form.title || '—'}</dd></div>
                    <div><dt>Quando</dt><dd>{dataExtenso(form.starts_at)}</dd></div>
                    <div>
                      <dt>Onde</dt>
                      <dd>{[form.venue_name, form.city && `${form.city}/${form.state.toUpperCase()}`].filter(Boolean).join(' · ') || '—'}</dd>
                    </div>
                    <div>
                      <dt>Taxa de serviço</dt>
                      <dd>{form.service_fee_pct !== '' ? `${form.service_fee_pct}%` : 'sem taxa'}</dd>
                    </div>
                    <div>
                      <dt>Reentrada</dt>
                      <dd>{form.reentry_enabled ? `sim${form.reentry_max ? ` · até ${form.reentry_max} entradas` : ''}` : 'não'}</dd>
                    </div>
                    <div>
                      <dt>Lotes</dt>
                      <dd>
                        {lotesValidos.length === 0
                          ? 'nenhum lote completo — o evento nasce sem ingresso à venda'
                          : lotesValidos.map((t) => `${t.name} · R$ ${t.price_reais} · ${t.quantity_total} un.`).join(' — ')}
                      </dd>
                    </div>
                  </dl>
                  {lotesValidos.length === 0 && (
                    <p className="ck-c-amber ck-t-support ck-mt-3">
                      Sem lote com nome, preço e quantidade, ninguém consegue comprar.{' '}
                      <button type="button" className="pp-link" onClick={() => setPasso(2)}>Voltar aos lotes</button>
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* ── Barra de ação (bottom bar do mockup) ── */}
          <div className="ck-wiz__foot">
            {passo > 0 ? (
              <button type="button" className="ck-btn ck-btn--glass" onClick={() => setPasso((p) => p - 1)}>
                <Icon name="arrowLeft" size={15} /> {PASSOS[passo - 1].n}
              </button>
            ) : <span />}

            <div className="ck-flex ck-gap-3 pp-wrap">
              {passo < PASSOS.length - 1 ? (
                <button type="button" className="ck-btn ck-btn--primary" onClick={avancar}>
                  Próximo · {PASSOS[passo + 1].n} <Icon name="arrowRight" size={15} />
                </button>
              ) : (
                <>
                  <button type="button" className="ck-btn ck-btn--glass" disabled={saving} onClick={() => submit(false)}>
                    {saving ? 'Salvando…' : 'Salvar rascunho'}
                  </button>
                  <button type="button" className="ck-btn ck-btn--primary" disabled={saving} onClick={() => submit(true)}>
                    {saving ? 'Publicando…' : 'Salvar e publicar'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

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
