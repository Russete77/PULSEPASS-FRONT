import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Page } from '../components/Layout.jsx';
import { Loading, Empty, ErrorBox } from '../components/States.jsx';
import { Icon } from '../components/Icon.jsx';
import { api } from '../lib/api.js';

/**
 * Página pública da produtora ("a casa").
 *
 * Layout da CasaProfileScreen do design system: logo grande centralizado,
 * nome, os links da marca, uma faixa de números e a agenda logo abaixo.
 *
 * O que o mockup tem e NÃO existe no banco — omitido em vez de inventado:
 *   · seguidores e reputação (4.9★) — não há tabela de follow nem de
 *     avaliação; faltaria algo como `org_followers` / `org_reviews`;
 *   · selo de verificado — falta um `organizations.verified_at`;
 *   · bio/frase e "operando desde 2018 · Cap. 2.300" — a migration 0042 só
 *     criou logo_url, brand_color, site_url e instagram; faltaria
 *     `organizations.bio` e `organizations.capacity`;
 *   · botão "Seguindo" — sem tabela de follow, o botão seria decorativo;
 *   · "Como chegar" — endereço é do EVENTO, não da produtora (a mesma casa
 *     produz em locais diferentes). O caminho fica no detalhe do evento, que
 *     já tem o DirectionsButton com o endereço real;
 *   · galeria "suas memórias na casa" — não há mídia de evento nem histórico
 *     de presença por organização; faltaria algo como `event_photos`.
 *
 * Ficam os números que o backend sustenta de verdade: quantos eventos estão
 * no ar, em quantas praças, e quando é o próximo.
 */

const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
const priceLabel = (cents) => (cents == null ? '' : cents === 0 ? 'Grátis' : `R$ ${Math.floor(cents / 100)}+`);

/** "Sex, 30 nov · 23h00" — a linha que responde "quando é o próximo". */
function dataPorExtenso(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const wd = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
  const mo = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  const hr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${wd[0].toUpperCase()}${wd.slice(1)}, ${d.getDate()} ${mo} · ${hr}`;
}

/**
 * Traduz a cor da marca para as variáveis de acento DESTA página.
 *
 * Só trocar `--pp-pulse` não basta: metade dos componentes usa
 * `rgba(var(--pp-pulse-rgb), …)` para fundo e borda, e sem converter o hex a
 * página ficava com o título na cor da casa e as bordas ainda verdes.
 *
 * A tinta do texto sobre a cor é calculada, não fixada: uma casa com marca
 * amarela e `--pp-pulse-ink` escuro por padrão renderiza botão ilegível. O
 * banco garante o formato #RRGGBB (constraint da migration 0042), então basta
 * a luminância relativa decidir entre tinta escura e clara.
 */
function acentoDaMarca(hex) {
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex ?? '')) return undefined;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const canal = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  const luz = 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
  return {
    '--pp-pulse': hex,
    '--pp-pulse-hi': hex,
    '--pp-pulse-rgb': `${r}, ${g}, ${b}`,
    // A tinta sai dos tokens, não de hex solto: são as mesmas duas
    // extremidades da paleta usadas no resto do sistema.
    '--pp-pulse-ink': luz > 0.45 ? 'var(--pp-ink-950)' : 'var(--pp-white)',
  };
}

/** Iniciais para quando a produtora ainda não subiu logo (mockup usa "AC"). */
function iniciais(nome) {
  return (nome ?? '')
    .split(/\s+/).filter(Boolean).slice(0, 2)
    .map((p) => p[0]).join('').toUpperCase() || '?';
}

export default function Casa() {
  const { slug } = useParams();
  const [dados, setDados] = useState(null);
  const [status, setStatus] = useState('loading');
  const [erro, setErro] = useState('');
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    let vivo = true;
    setStatus('loading');
    api.getCasa(slug)
      .then((d) => { if (vivo) { setDados(d); setStatus('done'); } })
      .catch((e) => { if (vivo) { setErro(e.message); setStatus('error'); } });
    return () => { vivo = false; };
  }, [slug]);

  const proximo = useMemo(() => dados?.eventos?.[0] ?? null, [dados]);

  if (status === 'loading') return <Page><Loading label="Abrindo a casa…" /></Page>;
  if (status === 'error') {
    return (
      <Page>
        <ErrorBox>{erro}</ErrorBox>
        <div style={{ marginTop: 'var(--pp-s-4)' }}>
          <Link to="/" className="pp-btn pp-btn--glass pp-btn--sm">
            <Icon name="arrowLeft" size={15} /> Ver todos os eventos
          </Link>
        </div>
      </Page>
    );
  }

  const { casa, eventos, cidades } = dados;
  const url = typeof window !== 'undefined' ? window.location.href : '';

  async function compartilhar() {
    if (typeof navigator.share === 'function') {
      try { await navigator.share({ title: casa.nome, url }); } catch { /* menu fechado */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch { /* clipboard negado — o endereço continua na barra do navegador */ }
  }

  return (
    <Page>
      {/* A cor da marca vale só dentro desta página, como no detalhe do
          evento: a barra do topo e o rodapé continuam sendo do PulsePass, e
          é isso que permite ao visitante saber com quem está falando. */}
      <div className="pp-casa" style={acentoDaMarca(casa.cor)}>
        <Link to="/" className="pp-link pp-link--muted">
          <Icon name="arrowLeft" size={14} /> Todos os eventos
        </Link>

        <header className="pp-casa-hero pp-reveal">
          {casa.logo_url
            ? <img className="pp-casa-hero__logo" src={casa.logo_url} alt={`Logo — ${casa.nome}`} />
            : <div className="pp-casa-hero__sigla" aria-hidden="true">{iniciais(casa.nome)}</div>}
          <h1 className="pp-casa-hero__nome">{casa.nome}</h1>

          <div className="pp-cluster pp-cluster-2" style={{ justifyContent: 'center' }}>
            {casa.instagram && (
              <a className="pp-link pp-link--muted" href={`https://instagram.com/${casa.instagram}`}
                target="_blank" rel="noopener noreferrer nofollow">@{casa.instagram}</a>
            )}
            {casa.site && (
              <a className="pp-link pp-link--muted" href={casa.site}
                target="_blank" rel="noopener noreferrer nofollow">
                site <Icon name="external" size={12} />
              </a>
            )}
            <button type="button" className="pp-link pp-link--muted" onClick={compartilhar}>
              <Icon name="share" size={13} /> {copiado ? 'link copiado' : 'compartilhar'}
            </button>
          </div>
        </header>

        {/* Números reais, os três que o banco sustenta. Nenhum é decorativo:
            todos saem da mesma agenda listada abaixo. */}
        <div className="pp-casa-kpis" style={{ marginTop: 'var(--pp-s-5)' }}>
          <div className="pp-promo-kpi">
            <div className="v accent">{eventos.length}</div>
            <div className="l">{eventos.length === 1 ? 'evento no ar' : 'eventos no ar'}</div>
          </div>
          <div className="pp-promo-kpi">
            <div className="v">{cidades.length}</div>
            <div className="l">{cidades.length === 1 ? 'cidade' : 'cidades'}</div>
          </div>
          <div className="pp-promo-kpi">
            <div className="v" title={proximo ? dataPorExtenso(proximo.starts_at) : undefined}>
              {proximo ? dataPorExtenso(proximo.starts_at).split(' · ')[0] : '—'}
            </div>
            <div className="l">próximo</div>
          </div>
        </div>

        {cidades.length > 0 && (
          <p className="pp-muted" style={{ fontSize: 'var(--pp-fs-13)', marginTop: 'var(--pp-s-3)' }}>
            Produz em {cidades.map((c) => `${c.city}/${c.state}`).join(' · ')}
          </p>
        )}

        <section style={{ marginTop: 'var(--pp-s-8)' }}>
          <div className="pp-between" style={{ alignItems: 'flex-end', marginBottom: 'var(--pp-s-4)' }}>
            <div>
              <div className="pp-eyebrow">agenda</div>
              <h2 className="pp-t-section" style={{ margin: '2px 0 0' }}>Próximos eventos</h2>
            </div>
            <span className="pp-muted-2 pp-num" style={{ fontSize: 13 }}>{eventos.length}</span>
          </div>

          {eventos.length === 0 ? (
            /* Casa sem nada publicado é comum entre uma temporada e outra —
               e mandar a pessoa embora sem alternativa é perder a visita. */
            <Empty>
              <div className="pp-empty__icon"><Icon name="calendar" size={28} /></div>
              <div className="pp-empty__title">Nenhum evento no ar por enquanto</div>
              <p>
                {casa.nome} ainda não publicou a próxima data.
                {casa.instagram ? ' O Instagram costuma anunciar primeiro.' : ''}
              </p>
              <div className="pp-cluster pp-cluster-2" style={{ justifyContent: 'center', marginTop: 'var(--pp-s-4)' }}>
                <Link to="/" className="pp-btn pp-btn--primary pp-btn--sm">Ver o que está rolando</Link>
                {casa.instagram && (
                  <a className="pp-btn pp-btn--glass pp-btn--sm"
                    href={`https://instagram.com/${casa.instagram}`}
                    target="_blank" rel="noopener noreferrer nofollow">
                    Seguir no Instagram
                  </a>
                )}
              </div>
            </Empty>
          ) : (
            <div className="pp-casa-agenda">
              {eventos.map((ev) => {
                const d = new Date(ev.starts_at);
                return (
                  <Link key={ev.id} to={`/eventos/${ev.slug}`} className="pp-casa-ev">
                    <div className="pp-casa-ev__data" aria-hidden="true">
                      <div className="pp-casa-ev__dia">{String(d.getDate()).padStart(2, '0')}</div>
                      <div className="pp-casa-ev__mes">{MESES[d.getMonth()]}</div>
                    </div>
                    <div className="pp-casa-ev__meio">
                      <div className="pp-casa-ev__titulo">{ev.title}</div>
                      <div className="pp-casa-ev__local">
                        {/* A data completa é repetida em texto porque o bloco
                            visual do dia/mês está marcado como decorativo —
                            senão o leitor de tela anuncia só o título. */}
                        {dataPorExtenso(ev.starts_at)}
                        {ev.venue_name ? ` · ${ev.venue_name}` : ''} · {ev.city}/{ev.state}
                      </div>
                      {/* Urgência vem do backend (≥70% vendido), a mesma da
                          vitrine — não é recalculada aqui para não divergir. */}
                      {ev.urgencia && (
                        <span className={`pp-badge ${ev.urgencia === 'esgotado' ? 'pp-badge--neutral' : 'pp-badge--pulse'}`}
                          style={{ marginTop: 6 }}>
                          {ev.urgencia === 'esgotado' ? 'Esgotado' : `${ev.sold_pct}% vendido`}
                        </span>
                      )}
                    </div>
                    {ev.min_price_cents != null && !ev.sold_out && (
                      <div className="pp-casa-ev__preco">{priceLabel(ev.min_price_cents)}</div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </Page>
  );
}
