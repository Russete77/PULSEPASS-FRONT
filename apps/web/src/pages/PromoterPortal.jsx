import { useEffect, useState } from 'react';
import { Page } from '../components/Layout.jsx';
import { Loading, ErrorBox, Empty } from '../components/States.jsx';
import { Icon } from '../components/Icon.jsx';
import { api } from '../lib/api.js';
import { brl, eventDate } from '../lib/format.js';

/**
 * Portal do promoter.
 *
 * Layout da PromoterScreen do design system: KPIs em cards pequenos, o SHARE
 * CARD do link pessoal como herói — é a mágica do AZList: cada inscrito pelo
 * link conta na comissão, então divulgar o link É o trabalho — e a lista de
 * convidados com filtro Todos/Check-in.
 *
 * O que o mockup tem e ficou de fora, com motivo:
 *  · "TIER 3" no selo do promoter — não existe sistema de tiers;
 *  · botão "Stories" — não há integração com Instagram; ficam WhatsApp,
 *    compartilhar do aparelho e copiar, que funcionam de verdade;
 *  · CPF/idade/aniversariante nos convidados — a inscrição pública não
 *    coleta esses campos;
 *  · "Adicionar convidado manualmente" — inscrição é sempre pelo link.
 */

const hora = (iso) => (iso ? new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '');

export default function PromoterPortal() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);
  const [guests, setGuests] = useState(null);
  const [filtro, setFiltro] = useState('todos');   // todos | checkin
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    api.promoterMe()
      .then((d) => { setRows(d); setStatus('done'); })
      .catch((e) => { setError(e.message); setStatus('error'); });
  }, []);

  async function toggleGuests(p) {
    if (openId === p.promoter_id) { setOpenId(null); setGuests(null); return; }
    setOpenId(p.promoter_id); setGuests(null); setFiltro('todos');
    try { const g = await api.promoterGuests(p.promoter_id); setGuests(g.guests); }
    catch (e) { setError(e.message); }
  }

  const linkDe = (p) => `${window.location.origin}/lista/${p.code}`;

  function copyLink(p) {
    navigator.clipboard?.writeText(linkDe(p));
    setCopied(p.promoter_id);
    setTimeout(() => setCopied(null), 1500);
  }

  /** wa.me abre o WhatsApp com a mensagem pronta — sem integração, sem API. */
  const zapHref = (p) => `https://wa.me/?text=${encodeURIComponent(
    `Cola comigo no ${p.event.title}! Entra na minha lista: ${linkDe(p)}`,
  )}`;

  async function compartilhar(p) {
    try {
      await navigator.share({ title: p.event.title, url: linkDe(p) });
    } catch { /* pessoa fechou o menu de compartilhar — nada a fazer */ }
  }

  if (status === 'loading') return <Page><Loading /></Page>;
  if (status === 'error') return <Page><ErrorBox>{error}</ErrorBox></Page>;

  return (
    <Page>
      <div className="pp-reveal" style={{ maxWidth: 720 }}>
        <div className="pp-eyebrow">promoter mode</div>
        <h1>Sua lista</h1>
        <p className="sub">Seus links, inscritos, presenças e comissão.</p>
      </div>

      {rows.length === 0 && (
        <Empty>
          <div className="pp-empty__icon"><Icon name="users" size={30} /></div>
          <div className="pp-empty__title">Você ainda não é promoter</div>
          <p>Peça para a produtora te cadastrar com o e-mail desta conta.</p>
        </Empty>
      )}

      <div className="pp-stack pp-stack-5 pp-reveal-group" style={{ maxWidth: 720 }}>
        {rows.map((p) => {
          const pct = p.goal_checkins ? Math.min(100, (p.checked_in / p.goal_checkins) * 100) : 0;
          const aberto = openId === p.promoter_id;
          const visiveis = guests == null ? null
            : filtro === 'checkin' ? guests.filter((g) => g.status === 'checked_in') : guests;
          return (
            <div key={p.promoter_id} className="pp-card pp-card--pad">
              {/* Cabeçalho do evento (o "event selector" do mockup). */}
              <div className="pp-between" style={{ alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 600, fontSize: 'var(--pp-fs-16)' }}>{p.event.title}</div>
                  <div className="pp-muted" style={{ fontSize: 'var(--pp-fs-13)', marginTop: 2 }}>{eventDate(p.event.starts_at)}</div>
                </div>
                {p.commission_paid_at && (
                  <span className="pp-badge pp-badge--success">comissão paga</span>
                )}
              </div>

              {/* KPIs em cards pequenos, como no mockup — número em cima,
                  rótulo mono embaixo. */}
              <div className="pp-promo-kpis" style={{ marginTop: 'var(--pp-s-4)' }}>
                {[
                  { l: 'Cliques', v: p.clicks ?? 0 },
                  { l: 'Inscritos', v: p.confirmed },
                  { l: 'Check-ins', v: p.checked_in },
                  { l: 'Comissão devida', v: brl(p.commission_due_cents), accent: true },
                ].map((k) => (
                  <div key={k.l} className="pp-promo-kpi">
                    <div className={`v ${k.accent ? 'accent' : ''}`}>{k.v}</div>
                    <div className="l">{k.l}</div>
                  </div>
                ))}
              </div>

              {/* Share card — o herói da tela. O link é o trabalho do
                  promoter; escondê-lo atrás de um botãozinho era esconder o
                  produto. */}
              <div className="pp-share" style={{ marginTop: 'var(--pp-s-4)' }}>
                <div className="pp-eyebrow" style={{ color: 'var(--pp-violet)' }}>Seu link pessoal</div>
                <div className="pp-share__link">
                  {window.location.host}/lista/<b>{p.code}</b>
                </div>
                <p className="pp-share__hint">
                  Compartilhe onde a galera está · cada inscrito pelo seu link conta na comissão.
                </p>
                <div className="pp-share__acoes">
                  <a className="pp-btn pp-btn--glass pp-btn--sm" href={zapHref(p)} target="_blank" rel="noreferrer">
                    WhatsApp
                  </a>
                  {typeof navigator.share === 'function' && (
                    <button className="pp-btn pp-btn--glass pp-btn--sm" onClick={() => compartilhar(p)}>
                      <Icon name="share" size={14} /> Compartilhar
                    </button>
                  )}
                  <button className="pp-btn pp-btn--glass pp-btn--sm" onClick={() => copyLink(p)}>
                    <Icon name={copied === p.promoter_id ? 'check' : 'copy'} size={14} />
                    {copied === p.promoter_id ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              </div>

              {p.goal_checkins != null && (
                <div style={{ marginTop: 'var(--pp-s-5)', maxWidth: 340 }}>
                  <div className="pp-between" style={{ marginBottom: 6 }}>
                    <span className="pp-stat__l">Meta de presenças</span>
                    <span className="pp-mono pp-num" style={{ fontSize: 'var(--pp-fs-13)', color: 'var(--pp-fg-2)' }}>{p.checked_in}/{p.goal_checkins}</span>
                  </div>
                  <div className="pp-progress"><i style={{ width: `${pct}%` }} /></div>
                </div>
              )}

              {/* Convidados: título + segmented, como no mockup. A lista só é
                  buscada ao abrir — um promoter com 5 eventos não precisa de
                  5 requisições na entrada. */}
              <div className="pp-between" style={{ marginTop: 'var(--pp-s-5)' }}>
                <button className="pp-link pp-link--muted" onClick={() => toggleGuests(p)} aria-expanded={aberto}>
                  {aberto ? 'Ocultar convidados ↑' : `Ver convidados · ${p.confirmed} ↓`}
                </button>
                {aberto && guests && (
                  <div className="pp-segmented">
                    <button className={filtro === 'todos' ? 'active' : ''} onClick={() => setFiltro('todos')}>
                      Todos · {guests.length}
                    </button>
                    <button className={filtro === 'checkin' ? 'active' : ''} onClick={() => setFiltro('checkin')}>
                      Check-in · {guests.filter((g) => g.status === 'checked_in').length}
                    </button>
                  </div>
                )}
              </div>

              {aberto && (
                <div style={{ marginTop: 'var(--pp-s-3)' }}>
                  {guests === null ? <Loading />
                    : visiveis.length === 0 ? (
                      <p className="pp-muted">
                        {filtro === 'checkin' ? 'Ninguém fez check-in ainda.' : 'Ninguém inscrito ainda — divulga o link!'}
                      </p>
                    ) : (
                      <div className="pp-stack pp-stack-2">
                        {visiveis.map((g) => (
                          <div key={g.id} className="pp-guest">
                            <span className="pp-guest__avatar" aria-hidden="true">{(g.name || '?')[0].toUpperCase()}</span>
                            <span className="pp-grow" style={{ minWidth: 0 }}>
                              <span className="pp-guest__nome pp-truncate">{g.name}</span>
                              {g.party_size > 1 && (
                                <span className="pp-guest__extra">+ {g.party_size - 1} acompanhante{g.party_size > 2 ? 's' : ''}</span>
                              )}
                            </span>
                            <span style={{ textAlign: 'right' }}>
                              <span className={`pp-badge ${g.status === 'checked_in' ? 'pp-badge--success pp-badge--dot' : 'pp-badge--neutral'}`}>
                                {g.status === 'checked_in' ? 'Presente' : 'Inscrito'}
                              </span>
                              <span className="pp-guest__hora">
                                {g.status === 'checked_in' && g.checked_in_at ? hora(g.checked_in_at) : hora(g.created_at)}
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Page>
  );
}
