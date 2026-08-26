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
          <Kpi l="GMV total" v={brl(gmv)} d={`${stats.orders_count} transações`} tom="pulse" />
          <Kpi l="GMV 24h" v={brl(stats.gmv_24h_cents)} d="ingressos + bar" tom="pink" />
          <Kpi l="Organizações" v={stats.orgs_count} d="ativas na plataforma" tom="violet" />
          <Kpi l="Eventos ao vivo" v={stats.events_live} d={`de ${stats.events_total} totais`} tom="cyan" />
          <Kpi
            l="Ingressos emitidos"
            v={stats.tickets_count}
            d={integro ? 'ledger íntegro' : `${stats.drift_count} divergências`}
            tom={integro ? 'pulse' : 'amber'}
          />
        </div>

        <div className="ck-duo">
          <div className="adm-panel">
            <div className="pp-between ck-ai-base pp-wrap">
              <div>
                <div className="ck-display ck-w-semi ck-t-section">
                  De onde vem o dinheiro
                </div>
                <div className="pp-muted ck-meta">
                  composição e distribuição em todas as orgs
                </div>
              </div>
              <div className="pp-price ck-t-section">{brl(gmv)}</div>
            </div>

            {/* Composição real do GMV: bilheteria vs bar. Dois campos que o
                /stats já devolvia e a tela nunca mostrou — e é a primeira
                pergunta de quem olha a plataforma de cima. */}
            {gmv > 0 && (
              <div className="ck-mt-5">
                <div
                  role="img"
                  aria-label={`Ingressos ${Math.round(pctIngresso)}% do GMV, bar ${Math.round(pctBar)}%`}
                  className="ck-mixbar"
                >
                  <span className="ck-mixbar__a" style={{ width: `${pctIngresso}%` }} />
                  <span className="ck-mixbar__b" style={{ width: `${pctBar}%` }} />
                </div>
                <div className="pp-cluster ck-mt-3 ck-gap-5">
                  <Legenda tom="pulse" rotulo="Ingressos" valor={brl(stats.gmv_tickets_cents)} pct={pctIngresso} />
                  <Legenda tom="violet" rotulo="Bar / cashless" valor={brl(stats.gmv_bar_cents)} pct={pctBar} />
                </div>
              </div>
            )}

            <div className="pp-eyebrow ck-mt-6 pp-muted">
              GMV por cidade · top {stats.by_city.length}
            </div>
            <div className="pp-stack pp-stack-2 ck-mt-3">
              {stats.by_city.length === 0 && <p className="pp-muted">Sem vendas ainda.</p>}
              {stats.by_city.map((row, i) => (
                <div key={row.city} className="adm-bar">
                  <span className="pp-truncate ck-t-support ck-col-rot">{row.city}</span>
                  <div className="track">
                    <div className="fill" style={{
                      width: `${Math.max(4, (row.gmv_cents / maiorCidade) * 100)}%`,
                      background: TONS[i % TONS.length],
                    }} />
                  </div>
                  <span className="pp-mono pp-num ck-right ck-t-support ck-w-semi ck-col-val">
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
                <div className={`pp-eyebrow ${integro ? 'ck-c-pulse' : 'ck-c-amber'}`}>
                  {integro ? 'Integridade · ok' : `Divergências · ${stats.drift_count}`}
                </div>
                <span className="pp-pulse-dot" aria-hidden="true" />
              </div>

              {integro ? (
                <div className="pp-note pp-note--pulse pp-row ck-mt-3 ck-c-pulse">
                  <Icon name="check" size={16} />
                  <span className="ck-t-support">Todo saldo bate com o histórico de transações.</span>
                </div>
              ) : (
                <div className="pp-stack pp-stack-2 ck-mt-3">
                  {drifts == null && <p className="pp-muted ck-t-support">Carregando divergências…</p>}
                  {(drifts ?? []).slice(0, 4).map((d) => (
                    <div key={d.wallet_id} className="pp-between ck-caixa--sm ck-caixa--erro">
                      <span className="pp-truncate ck-t-support">{d.event}</span>
                      <span className="pp-mono ck-t-support ck-c-red ck-w-semi">
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
                <div className="pp-eyebrow ck-c-violet">Top orgs · GMV</div>
                <Link to="/plataforma/orgs" className="pp-link pp-link--muted ck-t-support">
                  ver todas
                </Link>
              </div>
              <div className="pp-stack pp-stack-1 ck-mt-4">
                {stats.top_orgs.length === 0 && <p className="pp-muted">Sem orgs com vendas.</p>}
                {stats.top_orgs.map((o, i) => (
                  <div key={o.id} className="ck-linha">
                    <span className="pp-row ck-min0">
                      <span className="pp-mono pp-muted-2 ck-col-pos">{i + 1}</span>
                      <span className="pp-truncate ck-w-semi">{o.name}</span>
                    </span>
                    <span className="pp-row ck-shrink0">
                      <span className="pp-mono pp-muted ck-t-support">{o.events} ev</span>
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

function Kpi({ l, v, d, tom }) {
  return (
    <div className={`adm-kpi ck-k--${tom}`}>
      <div className="l">{l}</div>
      <div className="v">{v}</div>
      <div className="d">{d}</div>
    </div>
  );
}

function Legenda({ tom, rotulo, valor, pct }) {
  return (
    <span className="pp-row ck-gap-2">
      <span aria-hidden="true" className={`ck-dot ck-k--${tom} ck-dot--tom`} />
      <span>
        <span className="pp-label ck-block">{rotulo}</span>
        <span className="pp-mono pp-num ck-t-support ck-w-semi">
          {valor} <span className="pp-muted-2">· {Math.round(pct)}%</span>
        </span>
      </span>
    </span>
  );
}
