import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Shell, Loading, ErrorBox, BackLink } from '../components/Shell.jsx';
import { Icon } from '@pulsepass/shared/Icon';
import Confirmar from '@pulsepass/shared/Confirmar';
import { api } from '../lib/api.js';

const EMPTY = { subject: '', body: '', segment: 'compradores' };

/* Uma cor por segmento, saindo dos tokens — nada de hex cru. */
const TONES = {
  compradores: 'var(--pp-pulse)',
  lista: 'var(--pp-violet)',
  sem_checkin: 'var(--pp-amber)',
  fila_espera: 'var(--pp-cyan)',
};

const STATUS_BADGE = {
  draft: { cls: 'ck-badge--draft', label: 'Rascunho' },
  sending: { cls: 'ck-badge--warning', label: 'Enviando…' },
  sent: { cls: 'ck-badge--published', label: 'Enviada' },
  failed: { cls: 'ck-badge--danger', label: 'Falhou' },
};

const dataHora = (iso) =>
  iso ? new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';

export default function Marketing() {
  const { id } = useParams();
  const [segments, setSegments] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [entregaAtiva, setEntregaAtiva] = useState(true);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [aEnviar, setAEnviar] = useState(null);   // campanha aguardando confirmação
  const [aviso, setAviso] = useState('');         // resultado do último envio

  async function load() {
    try {
      const [seg, hist] = await Promise.all([api.marketingSegments(id), api.listCampaigns(id)]);
      setSegments(seg.segments ?? []);
      setEntregaAtiva(Boolean(seg.delivery_enabled));
      setCampaigns(hist.campaigns ?? []);
      setStatus('done');
    } catch (e) {
      setError(e.message);
      setStatus('error');
    }
  }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const segAtual = segments.find((s) => s.id === form.segment);
  const labelSeg = (sid) => segments.find((s) => s.id === sid)?.label ?? sid;

  async function criar(e) {
    e.preventDefault();
    setSaving(true); setError(''); setAviso('');
    try {
      await api.createCampaign(id, {
        subject: form.subject.trim(),
        body: form.body.trim(),
        segment: form.segment,
      });
      setForm(EMPTY);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  /* Sem try/catch: o Confirmar segura o erro, mostra a mensagem e fica aberto. */
  async function enviar(c) {
    const r = await api.sendCampaign(c.id);
    setAviso(r.message ?? '');
    setAEnviar(null);
    await load();
  }

  if (status === 'loading') return <Shell><Loading /></Shell>;

  return (
    <Shell>
      <BackLink to={`/eventos/${id}`} label="Dashboard" />
      <div className="ck-eyebrow">marketing · campanhas</div>
      <h1 className="ck-h1">Campanhas · <span className="pp-accent">alcance</span></h1>
      <p className="ck-sub">E-mail para o público que já está no sistema. O tamanho de cada segmento é consultado na hora, não estimado.</p>

      {error && <ErrorBox>{error}</ErrorBox>}

      {/* A tarja não é decorativa: sem ela alguém clica em "enviar" e acha que o e-mail saiu. */}
      {!entregaAtiva && (
        <div
          className="ck-panel ck-w-read ck-mt-4 ck-flex ck-gap-3 ck-ai-start ck-panel--amber"
        >
          <span className="ck-c-amber ck-shrink0 ck-mt-1"><Icon name="clock" size={18} /></span>
          <div>
            <div className="ck-panel__title ck-c-amber">Modo simulado</div>
            <p className="ck-panel__sub ck-m-0">
              Não há provedor de e-mail configurado (<span className="pp-mono">RESEND_API_KEY</span>), então
              nenhum e-mail sai de verdade. As campanhas são registradas com o público real e ficam marcadas
              como <strong>simuladas</strong> no histórico.
            </p>
          </div>
        </div>
      )}

      {aviso && (
        <div className="ck-panel ck-w-read ck-mt-4 ck-panel--pulse">
          <div className="pp-row ck-gap-3 ck-ai-center">
            <span className="ck-c-pulse"><Icon name="check" size={18} /></span>
            <span>{aviso}</span>
          </div>
        </div>
      )}

      {/* ── Segmentos: número real, consultado ── */}
      <section aria-label="Segmentos do público" className="ck-w-read ck-mt-5">
        <div className="ck-panel__title ck-mb-3">Público disponível</div>
        <div className="ck-kpis">
          {segments.map((s) => (
            <div key={s.id} className="ck-kpi" style={{ '--k': TONES[s.id] ?? 'var(--pp-pulse)' }}>
              <span className="lbl">{s.label}</span>
              <span className="val">{s.size}</span>
              <span className="d">{s.descricao}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Nova campanha ── */}
      <form onSubmit={criar} className="ck-panel ck-w-read ck-mt-5">
        <div className="ck-panel__title">Nova campanha</div>
        <p className="ck-panel__sub ck-mb-4">
          o texto vai como está — sem HTML, sem link de rastreio
        </p>

        <div className="ck-field">
          <label htmlFor="mkt-assunto" className="ck-label">Assunto</label>
          <input
            id="mkt-assunto" className="ck-input" value={form.subject} onChange={set('subject')}
            placeholder="O 2º lote abriu" required minLength={3} maxLength={200}
          />
        </div>

        <div className="ck-field ck-mt-4">
          <label htmlFor="mkt-corpo" className="ck-label">Mensagem</label>
          <textarea
            id="mkt-corpo" className="ck-textarea" rows={6} value={form.body} onChange={set('body')}
            placeholder={'Oi!\n\nLiberamos mais ingressos para o evento…'}
            required minLength={10} maxLength={10000}
          />
        </div>

        <div className="ck-field ck-mt-4">
          <label htmlFor="mkt-segmento" className="ck-label">Quem recebe</label>
          <select id="mkt-segmento" className="ck-select" value={form.segment} onChange={set('segment')}>
            {segments.map((s) => (
              <option key={s.id} value={s.id}>{s.label} · {s.size} pessoa{s.size === 1 ? '' : 's'}</option>
            ))}
          </select>
          {segAtual && (
            <p className="pp-muted ck-t-support ck-mt-2">
              {segAtual.descricao} {segAtual.size === 0 && '— vazio agora, o envio vai recusar.'}
            </p>
          )}
        </div>

        <button className="ck-btn ck-btn--primary ck-mt-4" disabled={saving}>
          <Icon name="plus" size={16} /> {saving ? 'Criando…' : 'Criar rascunho'}
        </button>
      </form>

      {/* ── Histórico ── */}
      <section aria-label="Histórico de campanhas" className="ck-w-read ck-mt-5">
        <div className="pp-between ck-mb-3">
          <span className="ck-panel__title">Histórico · {campaigns.length}</span>
        </div>

        {campaigns.length === 0 && (
          <div className="pp-empty">
            <div className="pp-empty__icon"><Icon name="share" size={28} /></div>
            <div className="pp-empty__title">Nenhuma campanha ainda</div>
            <p>Crie um rascunho acima. Ele só sai quando você confirmar o envio.</p>
          </div>
        )}

        <div className="pp-stack pp-stack-3">
          {campaigns.map((c) => {
            const badge = STATUS_BADGE[c.status] ?? STATUS_BADGE.draft;
            return (
              <article key={c.id} className="ck-card ck-p-4">
                <div className="pp-between ck-ai-start ck-gap-3">
                  <div className="ck-min0">
                    <div className="pp-row ck-gap-2 ck-ai-center pp-wrap">
                      <strong>{c.subject}</strong>
                      <span className={`ck-badge ${badge.cls}`}>{badge.label}</span>
                      {c.mode === 'mock' && <span className="ck-badge ck-badge--warning">Simulada</span>}
                    </div>
                    <p className="pp-muted ck-t-support ck-m-0 ck-mt-1">
                      {labelSeg(c.segment)} · criada {dataHora(c.created_at)}
                      {c.sent_at && ` · enviada ${dataHora(c.sent_at)}`}
                    </p>
                  </div>

                  {c.status === 'draft' && (
                    <button className="ck-btn ck-btn--glass ck-btn--sm" onClick={() => setAEnviar(c)}>
                      <Icon name="share" size={15} /> Enviar
                    </button>
                  )}
                </div>

                {/* Só o que o sistema sabe. Não há rastreio de abertura nem de clique. */}
                {c.status === 'sent' && (
                  <div className="pp-row ck-gap-5 ck-mt-3 pp-wrap">
                    <span className="pp-mono pp-muted ck-t-support">
                      público <strong className="ck-c-fg">{c.audience_count}</strong>
                    </span>
                    {c.mode === 'mock' ? (
                      <span className="pp-mono pp-muted ck-t-support">
                        simulados <strong className="ck-c-amber">{c.mock_count}</strong>
                      </span>
                    ) : (
                      <>
                        <span className="pp-mono pp-muted ck-t-support">
                          enviados <strong className="ck-c-pulse">{c.sent_count}</strong>
                        </span>
                        {c.failed_count > 0 && (
                          <span className="pp-mono pp-muted ck-t-support">
                            falhas <strong className="ck-c-red">{c.failed_count}</strong>
                          </span>
                        )}
                      </>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {campaigns.length > 0 && (
          <p className="pp-muted-2 ck-t-support ck-mt-4">
            O sistema registra entrega, não leitura: não há rastreio de abertura nem de clique,
            então não existe taxa de abertura para mostrar aqui.
          </p>
        )}
      </section>

      <Confirmar
        aberto={!!aEnviar}
        perigo={false}
        titulo={entregaAtiva ? `Enviar "${aEnviar?.subject ?? ''}"?` : `Simular envio de "${aEnviar?.subject ?? ''}"?`}
        descricao={
          entregaAtiva
            ? `O e-mail vai para o segmento ${labelSeg(aEnviar?.segment)} e não dá pra voltar atrás. Quem já recebeu esta campanha não recebe de novo.`
            : `Nenhum e-mail vai sair: sem RESEND_API_KEY o envio é simulado. A campanha fica registrada como simulada, com o público real do segmento ${labelSeg(aEnviar?.segment)}.`
        }
        confirmar={entregaAtiva ? 'Enviar agora' : 'Simular envio'}
        onConfirmar={() => enviar(aEnviar)}
        onFechar={() => setAEnviar(null)}
      />
    </Shell>
  );
}
