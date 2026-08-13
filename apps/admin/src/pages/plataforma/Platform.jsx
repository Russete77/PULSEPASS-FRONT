import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdmShell } from '../../components/AdmShell.jsx';
import { Loading, ErrorBox } from '../../components/Shell.jsx';
import { Icon } from '@pulsepass/shared/Icon';
import { api } from '../../lib/api.js';
import { brl } from '../../lib/format.js';

/**
 * PulseADM · visão da plataforma inteira.
 *
 * Layout do painel do design system (AdmPlatformScreen): faixa de 5 KPIs,
 * painel largo à esquerda e coluna de alertas + ranking à direita.
 *
 * O que o mockup mostra e NÃO entrou: o gráfico de GMV nas últimas 24h. O
 * backend agrega totais, não série temporal — não existe endpoint que devolva
 * o histórico hora a hora, e desenhar uma curva inventada num painel de
 * super-admin é pior do que não desenhar nada. No lugar entrou a composição
 * real do GMV (ingresso vs bar), que sai dos mesmos números.
 */

/* Rotação de cor das barras — dos tokens v4, nunca hex solto. */
const TONS = [
  'var(--pp-pulse)', 'var(--pp-violet)', 'var(--pp-cyan)',
  'var(--pp-pink)', 'var(--pp-amber)', 'var(--pp-fg-4)',
];

export default function Platform() {
  const [stats, setStats] = useState(null);
  const [drifts, setDrifts] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.platformStats().then(setStats).catch((e) => setError(e.message));
  }, []);

  // Detalhe das divergências só é buscado quando existe divergência: o
  // contador já vem no /stats, e no dia normal (ledger íntegro) essa chamada
  // seria uma varredura de carteiras à toa.
  useEffect(() => {
    if (stats?.drift_count > 0 && drifts == null) {
      api.platformFraud().then(setDrifts).catch(() => setDrifts([]));
    }
  }, [stats, drifts]);

  if (error) return <AdmShell><ErrorBox>{error}</ErrorBox></AdmShell>;
  if (!stats) return <AdmShell><Loading /></AdmShell>;

  const gmv = stats.gmv_total_cents || 0;
  const pctIngresso = gmv > 0 ? (stats.gmv_tickets_cents / gmv) * 100 : 0;
  const pctBar = gmv > 0 ? (stats.gmv_bar_cents / gmv) * 100 : 0;
  const maiorCidade = stats.by_city[0]?.gmv_cents || 1;
  const integro = stats.drift_count === 0;

  return (
    <AdmShell where="Multi-tenant · todas as orgs · tempo real">
      <div className="pp-stack pp-stack-5 pp-reveal">
        <div>
          <div className="adm-eyebrow">ADM PulsePass</div>
          <div className="adm-h1">A plataforma <span className="accent">respira.</span></div>
        </div>

        <div className="adm-kpis">
          <Kpi l="GMV total" v={brl(gmv)} d={`${stats.orders_count} transações`} c="var(--pp-pulse)" />
          <Kpi l="GMV 24h" v={brl(stats.gmv_24h_cents)} d="ingressos + bar" c="var(--pp-pink)" />
          <Kpi l="Organizações" v={stats.orgs_count} d="ativas na plataforma" c="var(--pp-violet)" />
          <Kpi l="Eventos ao vivo" v={stats.events_live} d={`de ${stats.events_total} totais`} c="var(--pp-cyan)" />
          <Kpi
            l="Ingressos emitidos"
            v={stats.tickets_count}
            d={integro ? 'ledger íntegro' : `${stats.drift_count} divergências`}
            c={integro ? 'var(--pp-pulse)' : 'var(--pp-amber)'}
          />
        </div>

        <div className="pp-cols-2" style={{ gridTemplateColumns: '1.4fr 1fr', alignItems: 'start' }}>
          <div className="adm-panel">
            <div className="pp-between" style={{ alignItems: 'baseline', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 600, fontSize: 'var(--pp-fs-18)' }}>
                  De onde vem o dinheiro
                </div>
                <div className="pp-muted" style={{ fontSize: 'var(--pp-fs-12)', marginTop: 2 }}>
                  composição e distribuição em todas as orgs
                </div>
              </div>
              <div className="pp-price" style={{ fontSize: 'var(--pp-fs-20)' }}>{brl(gmv)}</div>
            </div>

            {/* Composição real do GMV: bilheteria vs bar. Dois campos que o
                /stats já devolvia e a tela nunca mostrou — e é a primeira
                pergunta de quem olha a plataforma de cima. */}
            {gmv > 0 && (
              <div style={{ marginTop: 'var(--pp-s-5)' }}>
                <div
                  role="img"
                  aria-label={`Ingressos ${Math.round(pctIngresso)}% do GMV, bar ${Math.round(pctBar)}%`}
                  style={{ display: 'flex', height: 12, borderRadius: 99, overflow: 'hidden', background: 'var(--pp-glass-1)' }}
                >
                  <span style={{ width: `${pctIngresso}%`, background: 'var(--pp-pulse)' }} />
                  <span style={{ width: `${pctBar}%`, background: 'var(--pp-violet)' }} />
                </div>
                <div className="pp-cluster" style={{ marginTop: 'var(--pp-s-3)', gap: 'var(--pp-s-5)' }}>
                  <Legenda cor="var(--pp-pulse)" rotulo="Ingressos" valor={brl(stats.gmv_tickets_cents)} pct={pctIngresso} />
                  <Legenda cor="var(--pp-violet)" rotulo="Bar / cashless" valor={brl(stats.gmv_bar_cents)} pct={pctBar} />
                </div>
              </div>
            )}

            <div className="pp-eyebrow" style={{ marginTop: 'var(--pp-s-6)', color: 'var(--pp-fg-3)' }}>
              GMV por cidade · top {stats.by_city.length}
            </div>
            <div className="pp-stack pp-stack-2" style={{ marginTop: 'var(--pp-s-3)' }}>
              {stats.by_city.length === 0 && <p className="pp-muted">Sem vendas ainda.</p>}
              {stats.by_city.map((row, i) => (
                <div key={row.city} className="adm-bar">
                  <span className="pp-truncate" style={{ width: 120, fontSize: 'var(--pp-fs-13)' }}>{row.city}</span>
                  <div className="track">
                    <div className="fill" style={{
                      width: `${Math.max(4, (row.gmv_cents / maiorCidade) * 100)}%`,
                      background: TONS[i % TONS.length],
                    }} />
                  </div>
                  <span className="pp-mono pp-num" style={{ width: 96, textAlign: 'right', fontSize: 'var(--pp-fs-13)', fontWeight: 600 }}>
                    {brl(row.gmv_cents)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pp-stack pp-stack-4">
            {/* Slot de "alertas ao vivo" do mockup, com o único alerta que o
                sistema realmente calcula: carteira cujo saldo não bate com o
                ledger. Sem sinal inventado — se está limpo, diz que está. */}
            <section className="adm-panel" aria-label="Integridade do ledger">
              <div className="pp-between">
                <div className="pp-eyebrow" style={{ color: integro ? 'var(--pp-pulse)' : 'var(--pp-amber)' }}>
                  {integro ? 'Integridade · ok' : `Divergências · ${stats.drift_count}`}
                </div>
                <span className="pp-pulse-dot" aria-hidden="true" />
              </div>

              {integro ? (
                <div className="pp-note pp-note--pulse pp-row" style={{ marginTop: 'var(--pp-s-3)', color: 'var(--pp-pulse)' }}>
                  <Icon name="check" size={16} />
                  <span style={{ fontSize: 'var(--pp-fs-13)' }}>Todo saldo bate com o histórico de transações.</span>
                </div>
              ) : (
                <div className="pp-stack pp-stack-2" style={{ marginTop: 'var(--pp-s-3)' }}>
                  {drifts == null && <p className="pp-muted" style={{ fontSize: 'var(--pp-fs-13)' }}>Carregando divergências…</p>}
                  {(drifts ?? []).slice(0, 4).map((d) => (
                    <div key={d.wallet_id} className="pp-between" style={{
                      padding: '8px 10px', borderRadius: 'var(--pp-r-md)',
                      background: 'rgba(255,59,48,0.07)', border: '1px solid rgba(255,59,48,0.22)',
                    }}>
                      <span className="pp-truncate" style={{ fontSize: 'var(--pp-fs-12)' }}>{d.event}</span>
                      <span className="pp-mono" style={{ fontSize: 'var(--pp-fs-12)', color: 'var(--pp-red)', fontWeight: 600 }}>
                        {brl(d.drift_cents)}
                      </span>
                    </div>
                  ))}
                  <Link to="/plataforma/fraude" className="ck-btn ck-btn--glass ck-btn--sm">
                    <Icon name="scan" size={14} /> Abrir antifraude
                  </Link>
                </div>
              )}
            </section>

            <section className="adm-panel" aria-label="Ranking de organizações por GMV">
              <div className="pp-between">
                <div className="pp-eyebrow" style={{ color: 'var(--pp-violet-hi)' }}>Top orgs · GMV</div>
                <Link to="/plataforma/orgs" className="pp-link pp-link--muted" style={{ fontSize: 'var(--pp-fs-12)' }}>
                  ver todas
                </Link>
              </div>
              <div className="pp-stack pp-stack-1" style={{ marginTop: 'var(--pp-s-4)' }}>
                {stats.top_orgs.length === 0 && <p className="pp-muted">Sem orgs com vendas.</p>}
                {stats.top_orgs.map((o, i) => (
                  <div key={o.id} className="pp-between" style={{
                    padding: '8px 0',
                    borderBottom: i < stats.top_orgs.length - 1 ? '1px solid var(--pp-edge-1)' : 'none',
                  }}>
                    <span className="pp-row" style={{ minWidth: 0 }}>
                      <span className="pp-mono pp-muted-2" style={{ width: 18 }}>{i + 1}</span>
                      <span className="pp-truncate" style={{ fontWeight: 600 }}>{o.name}</span>
                    </span>
                    <span className="pp-row" style={{ flexShrink: 0 }}>
                      <span className="pp-mono pp-muted" style={{ fontSize: 'var(--pp-fs-12)' }}>{o.events} ev</span>
                      <span className="pp-price">{brl(o.gmv_cents)}</span>
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </AdmShell>
  );
}

function Kpi({ l, v, d, c }) {
  return (
    <div className="adm-kpi" style={{ '--k': c }}>
      <div className="l">{l}</div>
      <div className="v">{v}</div>
      <div className="d">{d}</div>
    </div>
  );
}

function Legenda({ cor, rotulo, valor, pct }) {
  return (
    <span className="pp-row" style={{ gap: 8 }}>
      <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 2, background: cor, flexShrink: 0 }} />
      <span>
        <span className="pp-label" style={{ display: 'block' }}>{rotulo}</span>
        <span className="pp-mono pp-num" style={{ fontSize: 'var(--pp-fs-13)', fontWeight: 600 }}>
          {valor} <span className="pp-muted-2">· {Math.round(pct)}%</span>
        </span>
      </span>
    </span>
  );
}
