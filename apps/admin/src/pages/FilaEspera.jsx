import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Shell, Loading, ErrorBox, BackLink } from '../components/Shell.jsx';
import { Icon } from '@pulsepass/shared/Icon';
import { api } from '../lib/api.js';
import { dateTime } from '../lib/format.js';

/**
 * Fila de espera do evento.
 *
 * Serve pra produtora enxergar demanda reprimida: quantas pessoas quiseram
 * comprar depois do lote esgotar. É a informação que decide se vale abrir um
 * lote extra ou trocar de casa no próximo evento.
 */
const ESTADO = {
  waiting: { label: 'aguardando', cor: 'var(--pp-fg-3)' },
  invited: { label: 'convidado', cor: 'var(--pp-pulse)' },
  converted: { label: 'comprou', cor: 'var(--pp-pulse)' },
  expired: { label: 'convite venceu', cor: 'var(--pp-amber)' },
  cancelled: { label: 'cancelado', cor: 'var(--pp-fg-4)' },
};

export default function FilaEspera() {
  const { id } = useParams();
  const [state, setState] = useState({ status: 'loading' });

  const load = useCallback(async () => {
    try { setState({ status: 'ok', data: await api.eventWaitlist(id) }); }
    catch (e) { setState({ status: 'error', message: e.message }); }
  }, [id]);
  useEffect(() => { load(); }, [load]);

  if (state.status === 'loading') return <Shell><Loading /></Shell>;
  if (state.status === 'error') {
    return <Shell><BackLink to={`/eventos/${id}`} label="Dashboard" /><ErrorBox>{state.message}</ErrorBox></Shell>;
  }

  const { data } = state;
  const agora = Date.now();

  return (
    <Shell>
      <BackLink to={`/eventos/${id}`} label="Dashboard" />
      <div className="ck-eyebrow">vendas · demanda reprimida</div>
      <h1 className="ck-h1">Fila de espera</h1>
      <p className="ck-sub">
        Quem tentou comprar depois do lote esgotar. Quando um pedido é reembolsado
        ou expira, os primeiros da fila são convidados automaticamente.
      </p>

      <div className="ck-card" style={{ maxWidth: 640, display: 'flex', gap: 28, flexWrap: 'wrap' }}>
        {[
          ['Aguardando', data.waiting],
          ['Convidados', data.invited],
          ['Compraram', data.converted],
        ].map(([rotulo, valor]) => (
          <div key={rotulo}>
            <div className="ck-label">{rotulo}</div>
            <div style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 26, fontWeight: 700 }}>{valor}</div>
          </div>
        ))}
      </div>

      {data.entries.length === 0 ? (
        <div className="ck-empty" style={{ maxWidth: 640, marginTop: 16 }}>
          Ninguém na fila ainda. A opção aparece para o cliente quando um lote esgota.
        </div>
      ) : (
        <div className="ck-card" style={{ maxWidth: 760, marginTop: 16, padding: 0, overflow: 'hidden' }}>
          {data.entries.map((e, i) => {
            const st = ESTADO[e.status] ?? { label: e.status, cor: 'var(--pp-fg-3)' };
            // Convite tem prazo: passado o prazo, a vez passa pro próximo.
            const vencendo = e.status === 'invited' && e.invite_expires_at
              && new Date(e.invite_expires_at).getTime() - agora < 15 * 60_000;
            return (
              <div key={e.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '13px 18px',
                borderBottom: i < data.entries.length - 1 ? '1px solid var(--pp-edge-1)' : 'none',
              }}>
                <span style={{
                  fontFamily: 'var(--pp-font-mono)', color: 'var(--pp-fg-4)', minWidth: 28,
                }}>{i + 1}º</span>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontWeight: 600 }}>{e.name || e.email}</div>
                  <div style={{ color: 'var(--pp-fg-4)', fontSize: 12, marginTop: 2 }}>
                    {e.ticket_tiers?.name ?? 'lote'}
                    {e.quantity > 1 && ` · ${e.quantity} ingressos`}
                    {' · entrou em '}{dateTime(e.created_at)}
                  </div>
                </div>
                <span style={{ color: st.cor, fontSize: 13 }}>{st.label}</span>
                {vencendo && (
                  <span style={{ color: 'var(--pp-amber)', fontSize: 12 }}>
                    <Icon name="clock" size={12} /> vence em breve
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Shell>
  );
}
