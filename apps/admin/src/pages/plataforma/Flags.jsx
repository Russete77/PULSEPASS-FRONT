import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdmShell } from '../../components/AdmShell.jsx';
import { Loading, ErrorBox } from '../../components/Shell.jsx';
import { Icon } from '@pulsepass/shared/Icon';
import { api } from '../../lib/api.js';
import { dateTime } from '../../lib/format.js';

/**
 * Configuração da plataforma (a tela que o design system chamou de "feature flags").
 *
 * Feature flag não existe no backend: não há tabela, não há rota, não há
 * rollout percentual, canary nem kill switch. Desenhar o grid do mockup com
 * oito cartões e um toggle em cada um daria uma tela linda que MENTE — o
 * primeiro clique não persistiria nada e ninguém confiaria no painel de novo.
 *
 * Então a tela vira o que a plataforma de fato tem: o inventário do que é
 * configurável hoje (platform_settings + taxa por produtora + carteira de
 * split), com o valor REAL, onde se edita, e a lista honesta do que ainda não
 * é configurável. Nenhum controle que não persiste é renderizado.
 */

/**
 * Regras vigentes conferidas no código/migração, não no chute:
 *  · migração 0037 (platform_settings, organizations.fee_bps, orders.platform_fee_bps);
 *  · RPC effective_fee_bps;
 *  · billing/controller.js (audit.record em toda troca de taxa);
 *  · billing/service.js (split só com asaas_wallet_id).
 * Entram como texto, com a fonte da verdade ao lado — jamais como interruptor.
 */
const FIXO = [
  {
    t: 'Taxa efetiva = taxa da produtora, senão o padrão',
    d: 'A produtora sem taxa própria cai no padrão da plataforma. Sem esse encadeamento, cadastrar produtora nova viraria chance de vender sem taxa.',
    src: 'RPC effective_fee_bps',
  },
  {
    t: 'A taxa fica congelada no pedido',
    d: 'O percentual usado é gravado na venda. Mudar a taxa hoje não reescreve o resultado dos eventos passados que a produtora já conferiu.',
    src: 'orders.platform_fee_bps',
  },
  {
    t: 'Toda troca de taxa entra na trilha imutável',
    d: 'Quem mudou, de quanto para quanto, quando. Taxa é receita: alteração sem rastro é discussão sem prova.',
    src: 'platform.default_fee_change · platform.org_fee_change',
  },
  {
    t: 'Split automático só existe com carteira Asaas',
    d: 'Sem carteira, a venda inteira cai na conta da plataforma e o repasse vira transferência manual.',
    src: 'organizations.asaas_wallet_id',
  },
];

// O que o mockup pedia e o backend não tem. Fica listado para virar backlog
// visível, sem nenhum controle acoplado.
const AUSENTE = [
  'Ligar/desligar funcionalidade por produtora (kill switch)',
  'Rollout percentual e canary por grupo de orgs',
  'Teste A/B com grupo de controle',
  'Histórico de quem ligou cada flag e quando',
];

export default function Flags() {
  const [billing, setBilling] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let vivo = true;
    api.platformBilling()
      .then((d) => { if (vivo) setBilling(d); })
      .catch((e) => { if (vivo) setError(e.message); });
    return () => { vivo = false; };
  }, []);

  if (error) return <AdmShell where="Configuração da plataforma"><ErrorBox>{error}</ErrorBox></AdmShell>;
  if (!billing) return <AdmShell where="Configuração da plataforma"><Loading /></AdmShell>;

  const orgs = billing.organizations ?? [];
  const negociadas = orgs.filter((o) => !o.usa_padrao);
  const semCarteira = orgs.filter((o) => !o.repasse_automatico);

  return (
    <AdmShell where="Configuração da plataforma · leitura do que existe de verdade">
      <div className="pp-stack pp-stack-5 pp-reveal">
        <div>
          <div className="adm-eyebrow" style={{ color: 'var(--pp-pulse)' }}>Configuração</div>
          <div className="adm-h1">
            O que é <span className="accent" style={{ color: 'var(--pp-pulse)' }}>configurável</span> hoje
          </div>
          <p className="pp-muted" style={{ margin: '4px 0 0', maxWidth: 640 }}>
            Os valores abaixo vêm de <code className="pp-mono">platform_settings</code> e do cadastro das
            produtoras. É o estado real da plataforma neste momento.
          </p>
        </div>

        {/* A ausência dita a tela: fica escrita no topo, não escondida no rodapé. */}
        <div className="pp-note">
          <strong>Feature flags ainda não existem no backend.</strong>{' '}
          Não há tabela <code className="pp-mono">feature_flags</code> nem rota{' '}
          <code className="pp-mono">GET/PATCH /platform/flags</code> — logo, não há rollout percentual,
          canary nem kill switch para exibir. Nenhum interruptor é desenhado aqui de propósito:
          toggle que não persiste é pior do que tela que falta, porque ele parece ter funcionado.
        </div>

        <div className="adm-kpis" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="adm-kpi" style={{ '--k': 'var(--pp-amber)' }}>
            <div className="l">Taxa padrão</div>
            <div className="v">{billing.default_fee_percent}%</div>
            <div className="d">{billing.updated_at ? `alterada em ${dateTime(billing.updated_at)}` : 'nunca alterada'}</div>
          </div>
          <div className="adm-kpi" style={{ '--k': 'var(--pp-violet)' }}>
            <div className="l">Taxas negociadas</div>
            <div className="v">{negociadas.length}</div>
            <div className="d">{orgs.length - negociadas.length} no padrão</div>
          </div>
          <div className="adm-kpi" style={{ '--k': semCarteira.length ? 'var(--pp-amber)' : 'var(--pp-pulse)' }}>
            <div className="l">Repasse automático</div>
            <div className="v">{orgs.length - semCarteira.length}/{orgs.length || 0}</div>
            <div className="d">{semCarteira.length ? `${semCarteira.length} em repasse manual` : 'todas com carteira'}</div>
          </div>
        </div>

        {orgs.length === 0 ? (
          <div className="adm-panel">
            <div className="pp-empty">
              <div className="pp-empty__icon"><Icon name="users" size={30} /></div>
              <div className="pp-empty__title">Nenhuma produtora cadastrada</div>
              <p>A taxa padrão de {billing.default_fee_percent}% já vale para a primeira que entrar.</p>
              <Link to="/plataforma/orgs" className="ck-btn ck-btn--primary ck-btn--sm">
                <Icon name="users" size={15} /> Ver produtoras
              </Link>
            </div>
          </div>
        ) : (
          <div className="adm-panel">
            <div className="pp-between">
              <div>
                <strong style={{ fontFamily: 'var(--pp-font-display)', fontSize: 'var(--pp-fs-18)' }}>Configurável hoje</strong>
                <p className="pp-muted" style={{ fontSize: 'var(--pp-fs-12)', margin: '2px 0 0' }}>
                  Cada item mostra o valor em vigor e onde ele se muda — a edição vive na tela dona do assunto,
                  para a alteração passar pela validação e pela trilha que já existem lá.
                </p>
              </div>
            </div>

            <div className="pp-stack pp-stack-3" style={{ marginTop: 'var(--pp-s-4)' }}>
              <div className="pp-row" style={{ padding: '12px 14px', borderRadius: 'var(--pp-r-md)', background: 'var(--pp-glass-1)', border: '1px solid var(--pp-edge-1)', flexWrap: 'wrap' }}>
                <span className="pp-grow" style={{ minWidth: 220 }}>
                  <strong style={{ fontSize: 'var(--pp-fs-14)' }}>Taxa padrão da plataforma</strong>
                  <span className="pp-muted" style={{ display: 'block', fontSize: 'var(--pp-fs-12)', marginTop: 2 }}>
                    vale para toda produtora sem taxa negociada
                  </span>
                </span>
                <span className="pp-mono" style={{ fontWeight: 700, fontSize: 'var(--pp-fs-18)', color: 'var(--pp-amber)' }}>
                  {billing.default_fee_percent}%
                </span>
                <Link to="/plataforma/taxas" className="ck-btn ck-btn--glass ck-btn--sm">Editar em Taxas</Link>
              </div>

              <div className="pp-row" style={{ padding: '12px 14px', borderRadius: 'var(--pp-r-md)', background: 'var(--pp-glass-1)', border: '1px solid var(--pp-edge-1)', flexWrap: 'wrap' }}>
                <span className="pp-grow" style={{ minWidth: 220 }}>
                  <strong style={{ fontSize: 'var(--pp-fs-14)' }}>Taxa por produtora</strong>
                  <span className="pp-muted" style={{ display: 'block', fontSize: 'var(--pp-fs-12)', marginTop: 2 }}>
                    {negociadas.length === 0
                      ? 'nenhuma exceção contratual — todas seguem o padrão'
                      : negociadas.map((o) => `${o.name} (${o.fee_percent}%)`).join(' · ')}
                  </span>
                </span>
                <span className="pp-mono" style={{ fontWeight: 700, fontSize: 'var(--pp-fs-18)', color: 'var(--pp-violet)' }}>
                  {negociadas.length}
                </span>
                <Link to="/plataforma/taxas" className="ck-btn ck-btn--glass ck-btn--sm">Editar em Taxas</Link>
              </div>

              {/* Carteira Asaas não se cadastra daqui: a produtora abre a subconta
                  pelo próprio cockpit. A tela mostra o risco, e não um botão que
                  não existe do lado do super-admin. */}
              <div className="pp-row" style={{ padding: '12px 14px', borderRadius: 'var(--pp-r-md)', background: 'var(--pp-glass-1)', border: `1px solid ${semCarteira.length ? 'var(--pp-amber)' : 'var(--pp-edge-1)'}`, flexWrap: 'wrap' }}>
                <span className="pp-grow" style={{ minWidth: 220 }}>
                  <strong style={{ fontSize: 'var(--pp-fs-14)' }}>Repasse automático (split Asaas)</strong>
                  <span className="pp-muted" style={{ display: 'block', fontSize: 'var(--pp-fs-12)', marginTop: 2 }}>
                    {semCarteira.length === 0
                      ? 'todas as produtoras recebem por split — nenhuma transferência manual pendente'
                      : `sem carteira, repasse manual: ${semCarteira.map((o) => o.name).join(' · ')}`}
                  </span>
                  <span className="pp-muted-2" style={{ display: 'block', fontSize: 'var(--pp-fs-12)', marginTop: 4 }}>
                    A subconta é criada pela própria produtora no cockpit dela; o super-admin não abre conta por ninguém.
                  </span>
                </span>
                <span className="pp-mono" style={{ fontWeight: 700, fontSize: 'var(--pp-fs-18)', color: semCarteira.length ? 'var(--pp-amber)' : 'var(--pp-pulse)' }}>
                  {orgs.length - semCarteira.length}/{orgs.length}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="pp-cols-2" style={{ alignItems: 'start' }}>
          <div className="adm-panel">
            <div className="pp-eyebrow" style={{ color: 'var(--pp-cyan)' }}>Fixo no código · {FIXO.length}</div>
            <p className="pp-muted" style={{ fontSize: 'var(--pp-fs-12)', margin: '4px 0 0' }}>
              Regras que valem sempre e não têm chave para desligar. Estão aqui para quem opera
              saber o que NÃO adianta procurar.
            </p>
            <ul className="pp-stack pp-stack-2" style={{ listStyle: 'none', margin: 'var(--pp-s-4) 0 0', padding: 0 }}>
              {FIXO.map((r) => (
                <li key={r.t} style={{ padding: '10px 12px', borderRadius: 'var(--pp-r-md)', background: 'var(--pp-glass-1)', border: '1px solid var(--pp-edge-1)' }}>
                  <div className="pp-row">
                    <span className="ck-badge" style={{ fontSize: 9 }}>fixo</span>
                    <strong className="pp-grow" style={{ fontSize: 'var(--pp-fs-13)' }}>{r.t}</strong>
                  </div>
                  <p className="pp-muted" style={{ fontSize: 'var(--pp-fs-12)', margin: '6px 0 0' }}>{r.d}</p>
                  <p className="pp-mono pp-muted-2" style={{ fontSize: 'var(--pp-fs-12)', margin: '4px 0 0' }}>{r.src}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="adm-panel">
            <div className="pp-eyebrow" style={{ color: 'var(--pp-fg-4)' }}>Não existe ainda · {AUSENTE.length}</div>
            <p className="pp-muted" style={{ fontSize: 'var(--pp-fs-12)', margin: '4px 0 0' }}>
              O que o desenho previa e o backend ainda não sustenta.
            </p>
            <ul className="pp-stack pp-stack-1" style={{ listStyle: 'none', margin: 'var(--pp-s-4) 0 0', padding: 0 }}>
              {AUSENTE.map((a) => (
                <li key={a} className="pp-row" style={{ padding: '8px 0', borderBottom: '1px solid var(--pp-edge-1)' }}>
                  <Icon name="close" size={14} aria-hidden="true" />
                  <span className="pp-grow" style={{ fontSize: 'var(--pp-fs-13)', color: 'var(--pp-fg-3)' }}>{a}</span>
                </li>
              ))}
            </ul>
            <p className="pp-muted-2" style={{ fontSize: 'var(--pp-fs-12)', marginTop: 'var(--pp-s-3)' }}>
              Para destravar: tabela <code className="pp-mono">feature_flags</code> (chave, descrição,
              percentual, orgs na whitelist) e as rotas <code className="pp-mono">GET /platform/flags</code> e{' '}
              <code className="pp-mono">PATCH /platform/flags/:chave</code> gravando na trilha de auditoria.
              Com isso a tela ganha os controles — e cada um deles vai persistir.
            </p>
          </div>
        </div>
      </div>
    </AdmShell>
  );
}
