import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shell, Loading, ErrorBox, BackLink } from '../components/Shell.jsx';
import CapaDoEvento from '../components/CapaDoEvento.jsx';
import { api } from '../lib/api.js';
import { brl, eventDate, dateTime } from '../lib/format.js';

/* Cores por lote seguem a rotação do design-system, mas saem dos TOKENS. */
const TIER_TONES = ['var(--pp-pulse)', 'var(--pp-violet)', 'var(--pp-cyan)', 'var(--pp-pink)', 'var(--pp-amber)'];

const STATIONS = [
  // Primeiro da fila porque é a tela que se abre no começo da noite e fica
  // aberta: responde "como está agora" sem precisar de mais nenhuma aba.
  { to: '/ao-vivo', label: 'Ao vivo' },
  { to: '/porta', label: 'Porta' },
  { to: '/bilheteria', label: 'Bilheteria' },
  { to: '/pdv', label: 'PDV' },
  { to: '/cozinha', label: 'Cozinha' },
  { to: '/garcom', label: 'Salão' },
  { to: '/totem', label: 'Totem' },
  { to: '/cardapio', label: 'Cardápio' },
  { to: '/fechamento', label: 'Fechamento' },
  { to: '/fila-espera', label: 'Fila de espera' },
  { to: '/fiscal', label: 'Notas fiscais' },
  { to: '/auditoria', label: 'Auditoria' },
  { to: '/promoters', label: 'Promoters' },
  { to: '/cupons', label: 'Cupons' },
  { to: '/camarotes', label: 'Camarotes' },
  { to: '/conciliacao', label: 'Financeiro' },
  { to: '/equipe', label: 'Equipe' },
];

export default function Dashboard() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [dash, setDash] = useState(null);
  // Lotação vem de outro endpoint (porta). Falhou/negou? A seção some — nunca
  // se inventa número de ocupação.
  const [occ, setOcc] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const pollRef = useRef(null);

  async function refresh() {
    const [ev, d] = await Promise.all([api.getEvent(id), api.dashboard(id)]);
    setEvent(ev);
    setDash(d);
    setStatus('done');
    api.occupancy(id).then(setOcc).catch(() => {});
  }

  useEffect(() => {
    refresh().catch((e) => { setError(e.message); setStatus('error'); });
    pollRef.current = setInterval(() => { refresh().catch(() => {}); }, 5000);
    return () => clearInterval(pollRef.current);
  }, [id]);

  async function togglePublish() {
    const next = event.status === 'published' ? 'paused' : 'published';
    try {
      const updated = await api.setStatus(id, next);
      setEvent((e) => ({ ...e, status: updated.status }));
    } catch (e) {
      setError(e.message);
    }
  }

  if (status === 'loading') return <Shell><Loading label="Carregando dashboard..." /></Shell>;
  if (status === 'error') return <Shell><ErrorBox>{error}</ErrorBox></Shell>;

  const m = dash.metrics;
  // Só bloqueia a TRANSIÇÃO para publicado: evento já no ar não é derrubado
  // por falta de capa, e rascunho continua livre.
  const publicarBloqueado = event.status !== 'published' && !event.cover_url;
  // % do público que já entrou — o delta real que o mockup pedia no KPI.
  const pctCheckin = m.tickets_sold > 0 ? Math.round((m.checked_in / m.tickets_sold) * 100) : 0;

  return (
    <Shell>
      <BackLink to="/" label="Eventos" />

      {/* Cabeçalho: título à esquerda, ação principal à direita (mockup) */}
      <div className="pp-between pp-wrap" style={{ alignItems: 'flex-end' }}>
        <div>
          <div className="ck-eyebrow">
            dashboard ao vivo · <span className={`ck-badge ${event.status === 'published' ? 'ck-badge--published' : 'ck-badge--draft'}`}>{event.status}</span>
          </div>
          <h1 className="ck-h1">{event.title}</h1>
          <p className="ck-sub" style={{ marginBottom: 0 }}>{eventDate(event.starts_at)} · {event.city}/{event.state}</p>
        </div>
        {/* Publicar sem capa é bloqueado no servidor. Aqui o botão explica
            o porquê ANTES do clique, em vez de deixar a produtora esbarrar
            num erro depois de tentar. */}
        <button
          className="ck-btn ck-btn--primary"
          onClick={togglePublish}
          disabled={publicarBloqueado}
          title={publicarBloqueado ? 'Adicione a capa do evento para publicar' : undefined}
        >
          {event.status === 'published' ? 'Pausar vendas' : 'Publicar'}
        </button>
      </div>

      {/* Estações da operação: os atalhos que o mockup coloca na navegação
          lateral. Aqui viram trilho de chips logo abaixo do título. */}
      <nav aria-label="Estações do evento" className="ck-tabs" style={{ marginTop: 'var(--pp-s-4)' }}>
        {STATIONS.map((s) => (
          <Link key={s.to} to={`/eventos/${id}${s.to}`} className="ck-tab">{s.label}</Link>
        ))}
      </nav>

      {publicarBloqueado && (
        <div className="ck-card" style={{
          marginTop: 18, maxWidth: 560,
          borderColor: 'rgba(255,184,0,0.42)', background: 'rgba(255,184,0,0.08)',
        }}>
          <strong>Falta a capa para publicar</strong>
          <p style={{ color: 'var(--pp-fg-2)', fontSize: 14, margin: '6px 0 0' }}>
            Um evento sem imagem na vitrine vende menos e derruba a percepção dos
            outros ao lado. Adicione abaixo e o botão de publicar libera.
          </p>
        </div>
      )}

      {/* KPIs com fio de cor no topo — números 100% reais do event_dashboard.
          Sem sparkline: não existe série temporal no backend. */}
      <div className="ck-kpis" style={{ marginTop: 20 }}>
        <div className="ck-kpi" style={{ '--k': 'var(--pp-pulse)' }}>
          <div className="lbl">Receita total</div>
          <div className="val" style={{ color: 'var(--pp-pulse)' }}>{brl(m.total_revenue_cents)}</div>
          <div className="d">{m.orders_paid} pedidos pagos</div>
        </div>
        <div className="ck-kpi" style={{ '--k': 'var(--pp-violet)' }}>
          <div className="lbl">Ingressos vendidos</div>
          <div className="val">{m.tickets_sold}</div>
          <div className="d">{brl(m.ticket_revenue_cents)} em ingressos</div>
        </div>
        <div className="ck-kpi" style={{ '--k': 'var(--pp-cyan)' }}>
          <div className="lbl">Check-ins</div>
          <div className="val">{m.checked_in}</div>
          <div className="d">{pctCheckin}% do público já entrou</div>
        </div>
        <div className="ck-kpi" style={{ '--k': 'var(--pp-pink)' }}>
          <div className="lbl">Receita bar</div>
          <div className="val">{brl(m.bar_revenue_cents)}</div>
          <div className="d">cashless + PDV</div>
        </div>
      </div>

      {/* Painel largo (vendas por lote) + coluna lateral (ocupação + feed),
          a mesma divisão do mockup. */}
      <div className="ck-duo" style={{ marginTop: 'var(--pp-s-4)' }}>
        <section className="ck-panel" aria-label="Vendas por lote">
          <div className="pp-between">
            <div>
              <div className="ck-panel__title">Vendas por lote</div>
              <p className="ck-panel__sub">quantos saíram de cada lote, em tempo real</p>
            </div>
            <span className="pp-price" style={{ fontSize: 'var(--pp-fs-20)' }}>{brl(m.ticket_revenue_cents)}</span>
          </div>

          <div className="pp-stack pp-stack-3" style={{ marginTop: 'var(--pp-s-5)' }}>
            {dash.tiers.length === 0 && <p className="pp-muted">Sem lotes. Crie um lote para começar a vender.</p>}
            {dash.tiers.map((t, i) => {
              const tone = TIER_TONES[i % TIER_TONES.length];
              const pct = t.quantity_total > 0 ? Math.min(100, (t.quantity_sold / t.quantity_total) * 100) : 0;
              return (
                <div key={t.id}>
                  <div className="pp-between" style={{ marginBottom: 6 }}>
                    <span className="pp-row" style={{ gap: 8 }}>
                      <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 2, background: tone, flexShrink: 0 }} />
                      <span style={{ fontWeight: 600, fontSize: 'var(--pp-fs-14)' }}>{t.name}</span>
                      <span className={`ck-badge ${t.status === 'on_sale' ? 'ck-badge--published' : ''}`} style={{ fontSize: 9 }}>{t.status}</span>
                    </span>
                    <span className="pp-mono pp-num pp-muted" style={{ fontSize: 'var(--pp-fs-12)' }}>
                      {t.quantity_sold}/{t.quantity_total} · {brl(t.price_cents)}
                    </span>
                  </div>
                  <div className="ck-bar" style={{ '--k': tone }}>
                    <div className="track"><div className="fill" style={{ width: `${Math.max(pct, t.quantity_sold > 0 ? 3 : 0)}%` }} /></div>
                    <span className="pp-mono pp-num pp-muted-2" style={{ width: 38, textAlign: 'right', fontSize: 'var(--pp-fs-12)' }}>{Math.round(pct)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="pp-stack pp-stack-4">
          {/* Ocupação ao vivo: quem está DENTRO agora. Só aparece quando o
              endpoint da porta respondeu — número de lotação não se inventa. */}
          {occ && (
            <section className="ck-panel" aria-label="Ocupação ao vivo">
              <div className="pp-between">
                <div className="ck-eyebrow">Ocupação ao vivo</div>
                <span className="pp-pulse-dot" aria-hidden="true" />
              </div>
              <div className="pp-between" style={{ marginTop: 'var(--pp-s-4)', alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 'var(--pp-fs-28)', fontVariantNumeric: 'tabular-nums' }}>{occ.inside}</span>
                <span className="pp-mono pp-muted" style={{ fontSize: 'var(--pp-fs-12)' }}>de {occ.tickets_sold} ingressos</span>
              </div>
              <div className="ck-bar" style={{ marginTop: 8, '--k': 'var(--pp-pulse)' }}>
                <div className="track">
                  <div className="fill" style={{ width: `${occ.tickets_sold > 0 ? Math.min(100, (occ.inside / occ.tickets_sold) * 100) : 0}%` }} />
                </div>
              </div>
              <div className="pp-between" style={{ marginTop: 'var(--pp-s-3)' }}>
                <span className="pp-muted" style={{ fontSize: 'var(--pp-fs-12)' }}>{occ.total_entries} entradas no total</span>
                <span className="pp-muted" style={{ fontSize: 'var(--pp-fs-12)' }}>{occ.left} saíram</span>
              </div>
            </section>
          )}

          <section className="ck-panel" aria-label="Pedidos recentes pagos">
            <div className="ck-eyebrow" style={{ marginBottom: 'var(--pp-s-3)' }}>Pedidos recentes · pagos</div>
            {dash.recent_orders.length === 0 && (
              <p className="pp-muted" style={{ margin: 0 }}>
                Nenhuma venda paga ainda. {event.status !== 'published' ? 'Publique o evento para abrir as vendas.' : 'Divulgue o link do evento.'}
              </p>
            )}
            <div className="ck-feed">
              {dash.recent_orders.map((o) => (
                <div key={o.id} className="ck-feed__row">
                  <span className="ck-feed__ic" aria-hidden="true">R$</span>
                  <div className="pp-grow">
                    <div className="pp-mono" style={{ fontSize: 'var(--pp-fs-12)' }}>{o.id.slice(0, 8)}</div>
                    <div className="pp-muted-2" style={{ fontSize: 'var(--pp-fs-12)' }}>{dateTime(o.created_at)}</div>
                  </div>
                  <span className="pp-price" style={{ fontSize: 'var(--pp-fs-14)' }}>{brl(o.total_cents)}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <CapaDoEvento
          eventId={id}
          coverUrl={event.cover_url}
          onChange={(url) => setEvent((e) => ({ ...e, cover_url: url }))}
        />
      </div>

      <p className="ck-live" style={{ marginTop: 16 }}>
        <span className="pp-pulse-dot" /> atualizando a cada 5s
      </p>
    </Shell>
  );
}
