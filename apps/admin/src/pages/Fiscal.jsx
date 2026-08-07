import { useCallback, useEffect, useState } from 'react';
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
 */
const STATUS = {
  issued: { label: 'emitida', cor: 'var(--pp-pulse)' },
  pending: { label: 'processando', cor: 'var(--pp-amber)' },
  failed: { label: 'falhou', cor: '#FF6B61' },
  cancelled: { label: 'cancelada', cor: 'var(--pp-fg-4)' },
};

export default function Fiscal() {
  const { id } = useParams();
  const [state, setState] = useState({ status: 'loading' });
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try { setState({ status: 'ok', data: await api.eventFiscal(id) }); }
    catch (e) { setState({ status: 'error', message: e.message }); }
  }, [id]);
  useEffect(() => { load(); }, [load]);

  if (state.status === 'loading') return <Shell><Loading /></Shell>;
  if (state.status === 'error') {
    return <Shell><BackLink to={`/eventos/${id}`} label="Dashboard" /><ErrorBox>{state.message}</ErrorBox></Shell>;
  }

  const { data } = state;
  const s = data.summary ?? {};

  return (
    <Shell>
      <BackLink to={`/eventos/${id}`} label="Dashboard" />
      <div className="ck-eyebrow">fiscal · nfs-e</div>
      <h1 className="ck-h1">Notas fiscais</h1>
      <p className="ck-sub">
        Emissão das notas de serviço deste evento.
        {data.mode === 'mock' && (
          <strong style={{ color: 'var(--pp-amber)' }}>
            {' '}Modo de teste: nada é enviado à prefeitura.
          </strong>
        )}
      </p>

      {error && <ErrorBox>{error}</ErrorBox>}

      <div className="ck-card" style={{ maxWidth: 700, display: 'flex', gap: 28, flexWrap: 'wrap' }}>
        <div>
          <div className="ck-label">Emitidas</div>
          <div style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 26, fontWeight: 700 }}>
            {s.issued_count ?? 0}
          </div>
          <div style={{ color: 'var(--pp-fg-4)', fontSize: 12 }}>{brl(s.issued_cents ?? 0)}</div>
        </div>
        {[
          ['Processando', s.pending_count, 'var(--pp-amber)'],
          ['Falharam', s.failed_count, '#FF6B61'],
          ['Canceladas', s.cancelled_count, 'var(--pp-fg-3)'],
        ].map(([rotulo, valor, cor]) => (
          <div key={rotulo}>
            <div className="ck-label">{rotulo}</div>
            <div style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 26, color: valor > 0 ? cor : 'inherit' }}>
              {valor ?? 0}
            </div>
          </div>
        ))}
      </div>

      {data.documents.length === 0 ? (
        <div className="ck-empty" style={{ maxWidth: 700, marginTop: 16 }}>
          Nenhuma nota ainda. A emissão automática só acontece se você ativar
          <code style={{ margin: '0 4px' }}>FISCAL_AUTO_ISSUE</code>; caso contrário é manual.
        </div>
      ) : (
        <div className="ck-card" style={{ maxWidth: 900, marginTop: 16, padding: 0, overflow: 'hidden' }}>
          {data.documents.map((d, i) => {
            const st = STATUS[d.status] ?? { label: d.status, cor: 'var(--pp-fg-3)' };
            return (
              <div key={d.id} style={{
                padding: '13px 18px',
                borderBottom: i < data.documents.length - 1 ? '1px solid var(--pp-edge-1)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontWeight: 600, fontFamily: 'var(--pp-font-mono)' }}>
                      {d.numero ? `nº ${d.numero}` : 'sem número'}
                      {d.codigo_verificacao && (
                        <span style={{ color: 'var(--pp-fg-4)', fontWeight: 400 }}> · {d.codigo_verificacao}</span>
                      )}
                    </div>
                    <div style={{ color: 'var(--pp-fg-4)', fontSize: 12, marginTop: 2 }}>
                      {d.buyer_name || 'sem tomador'} · {dateTime(d.created_at)}
                    </div>
                  </div>
                  <span style={{ fontFamily: 'var(--pp-font-mono)' }}>{brl(d.amount_cents)}</span>
                  <span style={{ color: st.cor, fontSize: 13, minWidth: 92, textAlign: 'right' }}>{st.label}</span>
                  {d.pdf_url && (
                    <a className="ck-btn ck-btn--glass ck-btn--sm" href={d.pdf_url} target="_blank" rel="noreferrer">
                      <Icon name="download" size={14} /> PDF
                    </a>
                  )}
                </div>
                {/* Falha precisa mostrar o motivo: "deu erro" não resolve nada
                    com o contador nem com a prefeitura. */}
                {d.status === 'failed' && d.error && (
                  <p style={{ color: '#FF6B61', fontSize: 12, marginTop: 8 }}>{d.error}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Shell>
  );
}
