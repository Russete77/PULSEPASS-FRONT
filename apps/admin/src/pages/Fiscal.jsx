import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Shell, Loading, ErrorBox, BackLink } from '../components/Shell.jsx';
import { Icon } from '@pulsepass/shared/Icon';
import { api } from '../lib/api.js';
import { brl, dateTime } from '../lib/format.js';

/**
 * Notas fiscais (NFS-e) do evento.
 *
 * É a tela que o contador pede. Mostra o que foi emitido, o que falhou e por
 * quê — nota que "sumiu" vira problema com a prefeitura, então falha aqui
 * precisa aparecer com o motivo, não virar silêncio.
 *
 * Layout do design system: faixa de KPIs com fio de cor no topo + um livro
 * (tabela) embaixo. Documento fiscal se lê em coluna alinhada, não em card.
 */
const STATUS = {
  issued: { label: 'emitida', cor: 'var(--pp-pulse)', badge: 'ck-badge ck-badge--published' },
  pending: { label: 'processando', cor: 'var(--pp-amber)', badge: 'ck-badge ck-badge--draft' },
  failed: { label: 'falhou', cor: 'var(--pp-red)', badge: 'ck-badge ck-badge--danger' },
  cancelled: { label: 'cancelada', cor: 'var(--pp-fg-4)', badge: 'ck-badge' },
};

const FILTROS = [
  { chave: 'todas', label: 'Todas' },
  { chave: 'issued', label: 'Emitidas' },
  { chave: 'pending', label: 'Processando' },
  { chave: 'failed', label: 'Falharam' },
  { chave: 'cancelled', label: 'Canceladas' },
];

/**
 * CPF/CNPJ do comprador aparece parcial. O contador confere a nota pelo número
 * e pelo código de verificação; documento inteiro na tela é dado pessoal
 * exposto pra qualquer pessoa da produtora que abrir o cockpit.
 */
function docParcial(doc) {
  const n = String(doc ?? '').replace(/\D/g, '');
  if (n.length === 11) return `•••.${n.slice(3, 6)}.${n.slice(6, 9)}-••`;
  if (n.length === 14) return `••.${n.slice(2, 5)}.${n.slice(5, 8)}/••••-••`;
  return null;
}

export default function Fiscal() {
  const { id } = useParams();
  const [state, setState] = useState({ status: 'loading' });
  const [filtro, setFiltro] = useState('todas');

  const load = useCallback(async () => {
    try { setState({ status: 'ok', data: await api.eventFiscal(id) }); }
    catch (e) { setState({ status: 'error', message: e.message }); }
  }, [id]);
  useEffect(() => { load(); }, [load]);

  const documentos = state.data?.documents ?? [];
  const visiveis = useMemo(
    () => (filtro === 'todas' ? documentos : documentos.filter((d) => d.status === filtro)),
    [documentos, filtro],
  );

  if (state.status === 'loading') return <Shell><Loading /></Shell>;
  if (state.status === 'error') {
    return <Shell><BackLink to={`/eventos/${id}`} label="Dashboard" /><ErrorBox>{state.message}</ErrorBox></Shell>;
  }

  const { data } = state;
  const s = data.summary ?? {};
  const mock = data.mode === 'mock';

  return (
    <Shell>
      <BackLink to={`/eventos/${id}`} label="Dashboard" />
      <div className="ck-eyebrow">fiscal · nfs-e</div>
      <h1 className="ck-h1">Notas fiscais · <span className="pp-accent">sem surpresa.</span></h1>
      <p className="ck-sub">
        Emissão das notas de serviço deste evento. O que falhou aparece com o motivo,
        na mesma linha da nota — é o que o contador precisa pra resolver.
      </p>

      {/* Modo de teste vira aviso de bloco, não texto solto no meio do
          parágrafo: quem abre a tela às pressas precisa ver que NADA foi
          enviado à prefeitura antes de acreditar nos números abaixo. */}
      {mock && (
        <div className="pp-note ck-w-read ck-mb-5 ck-aviso" role="status">
          <span className="ck-badge ck-badge--draft ck-mr-2">modo de teste</span>
          Nenhuma nota está sendo enviada à prefeitura. Os números abaixo são
          simulados e servem só pra conferir o fluxo.
        </div>
      )}

      <div className="ck-kpis">
        <div className="ck-kpi ck-k--pulse">
          <div className="lbl">Emitidas</div>
          <div className="val ck-c-pulse">{s.issued_count ?? 0}</div>
          <div className="d">{brl(s.issued_cents ?? 0)} em notas</div>
        </div>
        <div className="ck-kpi ck-k--amber">
          <div className="lbl">Processando</div>
          <div className="val">{s.pending_count ?? 0}</div>
          <div className="d">aguardando a prefeitura</div>
        </div>
        <div className="ck-kpi ck-k--red">
          <div className="lbl">Falharam</div>
          <div className={`val ${(s.failed_count ?? 0) > 0 ? 'ck-c-red' : ''}`}>
            {s.failed_count ?? 0}
          </div>
          <div className="d">{(s.failed_count ?? 0) > 0 ? 'motivo na linha da nota' : 'nenhuma recusada'}</div>
        </div>
        <div className="ck-kpi ck-k--dim">
          <div className="lbl">Canceladas</div>
          <div className="val">{s.cancelled_count ?? 0}</div>
          <div className="d">reembolso cancela a nota</div>
        </div>
      </div>

      {documentos.length === 0 ? (
        <div className="pp-empty ck-w-mid">
          <div className="pp-empty__icon"><Icon name="receipt" size={28} /></div>
          <div className="pp-empty__title">Nenhuma nota ainda</div>
          <p className="ck-m-0">
            A emissão automática só acontece com <code className="pp-mono">FISCAL_AUTO_ISSUE</code> ligado.
            Sem isso, a nota é emitida pedido a pedido pelo backend — e aparece aqui assim que sair.
          </p>
        </div>
      ) : (
        <section className="ck-panel ck-mt-5 ck-p-0 ck-hidden" aria-label="Notas fiscais do evento">
          <div className="pp-between pp-wrap ck-cabeca">
            <div>
              <div className="ck-panel__title">Livro de notas · {documentos.length}</div>
              <p className="ck-panel__sub">mais recentes primeiro</p>
            </div>
            <div className="ck-tabs" role="group" aria-label="Filtrar por situação da nota">
              {FILTROS.map((f) => (
                <button
                  key={f.chave}
                  type="button"
                  className={`ck-tab ${filtro === f.chave ? 'is-on' : ''}`}
                  aria-pressed={filtro === f.chave}
                  onClick={() => setFiltro(f.chave)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {visiveis.length === 0 ? (
            <p className="ck-empty">
              Nenhuma nota nesta situação.
            </p>
          ) : (
            <div className="ck-tablewrap">
              <table className="ck-table ck-table--wide">
                <thead>
                  <tr>
                    <th scope="col">Nota</th>
                    <th scope="col">Tomador</th>
                    <th scope="col">Data</th>
                    <th scope="col" className="num">Valor</th>
                    <th scope="col">Situação</th>
                    <th scope="col">Documento</th>
                  </tr>
                </thead>
                <tbody>
                  {visiveis.map((d) => {
                    const st = STATUS[d.status] ?? { label: d.status, cor: 'var(--pp-fg-3)', badge: 'ck-badge' };
                    const doc = docParcial(d.buyer_doc);
                    return [
                      <tr key={d.id}>
                        <td>
                          <div className="pp-mono ck-w-semi">
                            {d.numero ? `nº ${d.numero}` : 'sem número'}
                          </div>
                          {d.codigo_verificacao && (
                            <div className="pp-mono pp-muted-2 ck-meta">
                              {d.codigo_verificacao}
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="ck-t-support">{d.buyer_name || 'sem tomador'}</div>
                          {doc && (
                            <div className="pp-mono pp-muted-2 ck-meta">{doc}</div>
                          )}
                        </td>
                        {/* Data que importa é a da emissão; enquanto não emitiu,
                            a do registro é a única que existe. */}
                        <td className="pp-muted ck-t-support">
                          {dateTime(d.issued_at ?? d.created_at)}
                          {!d.issued_at && <div className="pp-muted-2">registro</div>}
                        </td>
                        <td className="num"><span className="pp-price">{brl(d.amount_cents)}</span></td>
                        <td><span className={st.badge} style={{ color: st.cor }}>{st.label}</span></td>
                        <td>
                          <span className="pp-row ck-gap-2">
                            {d.pdf_url && (
                              <a className="ck-btn ck-btn--glass ck-btn--sm" href={d.pdf_url} target="_blank" rel="noreferrer"
                                aria-label={`Baixar PDF da nota ${d.numero ?? ''}`}>
                                <Icon name="download" size={14} /> PDF
                              </a>
                            )}
                            {/* XML é o que o contador importa no sistema dele —
                                sem ele, a nota tem que ser digitada à mão. */}
                            {d.xml_url && (
                              <a className="ck-btn ck-btn--glass ck-btn--sm" href={d.xml_url} target="_blank" rel="noreferrer"
                                aria-label={`Baixar XML da nota ${d.numero ?? ''}`}>
                                <Icon name="download" size={14} /> XML
                              </a>
                            )}
                            {!d.pdf_url && !d.xml_url && (
                              <span className="pp-muted-2 ck-t-support">—</span>
                            )}
                          </span>
                        </td>
                      </tr>,
                      // Falha precisa mostrar o motivo: "deu erro" não resolve
                      // nada com o contador nem com a prefeitura.
                      d.status === 'failed' && d.error ? (
                        <tr key={`${d.id}-erro`}>
                          <td colSpan={6} className="ck-c-red ck-t-support ck-pt-0">
                            <span className="pp-row ck-ai-start ck-gap-2">
                              <Icon name="close" size={13} />
                              <span>
                                {d.error}
                                {d.attempts > 1 && (
                                  <span className="pp-muted-2"> · {d.attempts} tentativas</span>
                                )}
                              </span>
                            </span>
                          </td>
                        </tr>
                      ) : null,
                    ];
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </Shell>
  );
}
