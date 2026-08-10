import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Shell, Loading, ErrorBox, BackLink } from '../components/Shell.jsx';
import { api } from '../lib/api.js';
import { brl } from '../lib/format.js';

/**
 * Fechamento de caixa do evento.
 *
 * Layout segue o mockup CashierClosingScreen do design system: KPIs grandes
 * com fio de cor no topo, o painel de conferência (sistema vs. contado) com
 * o veredito em destaque, e o histórico de turnos. O que o mockup mostra e o
 * banco não tem fica de fora: split por meio de pagamento (cashier_report
 * não separa Pix/cartão), top produtos do turno e o cupom Z impresso (não
 * existem CNPJ/SAT/NSU no sistema).
 */
const hora = (iso) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const diaHora = (iso) => new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

export default function Fechamento() {
  const { id } = useParams();
  const [rows, setRows] = useState([]);
  const [ledger, setLedger] = useState(null);
  const [turnos, setTurnos] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [turno, setTurno] = useState(null);      // turno aberto de quem opera
  const [fundo, setFundo] = useState('');
  const [contado, setContado] = useState('');
  const [praca, setPraca] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [conferencia, setConferencia] = useState(null);

  const carregar = useCallback(async () => {
    const [r, l, t, ts] = await Promise.all([
      api.cashierReport(id), api.ledgerCheck(id), api.turnoAberto(id).catch(() => null),
      // Histórico de turnos: quem abriu gaveta quando, e com quanto fechou.
      api.listarTurnos(id).catch(() => []),
    ]);
    setRows(r); setLedger(l); setTurno(t); setTurnos(ts); setStatus('done');
  }, [id]);

  useEffect(() => {
    carregar().catch((e) => { setError(e.message); setStatus('error'); });
  }, [carregar]);

  async function abrir() {
    setOcupado(true); setError('');
    try {
      await api.abrirTurno(id, {
        fundo_cents: Math.round(Number(fundo || 0) * 100),
        station: praca.trim() || undefined,
      });
      setFundo(''); setPraca('');
      await carregar();
    } catch (e) { setError(e.message); } finally { setOcupado(false); }
  }

  async function fechar() {
    setOcupado(true); setError('');
    try {
      setConferencia(await api.fecharTurno(turno.id, {
        contado_cents: Math.round(Number(contado || 0) * 100),
      }));
      setContado('');
      await carregar();
    } catch (e) { setError(e.message); } finally { setOcupado(false); }
  }

  if (status === 'loading') return <Shell><Loading /></Shell>;
  if (status === 'error') return <Shell><ErrorBox>{error}</ErrorBox></Shell>;

  const total = rows.reduce((s, r) => s + r.total_cents, 0);
  const orders = rows.reduce((s, r) => s + r.orders, 0);

  /* KPIs com o fio de cor no topo, como no mockup. O quarto cartão é a
     integridade do ledger: no fechamento, "o saldo bate?" é um número tão
     importante quanto o total. */
  const kpis = [
    { l: 'Total PDV (cashless)', v: brl(total), d: 'débito de saldo, sem espécie', cor: 'var(--pp-pulse)' },
    { l: 'Pedidos', v: String(orders), d: `${rows.length} operador(es)`, cor: 'var(--pp-cyan)' },
    { l: 'Turnos de gaveta', v: String(turnos.length), d: `${turnos.filter((t) => !t.fechado_em).length} aberto(s)`, cor: 'var(--pp-violet)' },
    ledger && {
      l: 'Ledger', v: ledger.ok ? 'OK' : `${ledger.drifts.length} divergência(s)`,
      d: ledger.ok ? 'saldos batem com as transações' : 'carteiras a investigar',
      cor: ledger.ok ? 'var(--pp-pulse)' : 'var(--pp-amber)',
    },
  ].filter(Boolean);

  return (
    <Shell>
      <BackLink to={`/eventos/${id}`} label="Dashboard" />
      <div className="ck-eyebrow">bar · fechamento de caixa</div>
      <h1 className="ck-h1">Fechamento de caixa</h1>
      <p className="ck-sub">
        {turno
          ? <>Seu turno está aberto{turno.station ? ` na praça ${turno.station}` : ''} desde as {hora(turno.opened_at)}.</>
          : 'Total processado no PDV por operador e conferência da gaveta.'}
      </p>

      {error && <ErrorBox>{error}</ErrorBox>}

      <div className="ck-metrics">
        {kpis.map((k) => (
          <div key={k.l} className="ck-metric" style={{ position: 'relative', overflow: 'hidden' }}>
            <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: k.cor, opacity: 0.7 }} />
            <div className="lbl">{k.l}</div>
            <div className="val" style={{ fontSize: 'var(--pp-fs-24)' }}>{k.v}</div>
            <div style={{ marginTop: 4, fontSize: 11, color: 'var(--pp-fg-4)' }}>{k.d}</div>
          </div>
        ))}
      </div>

      {/* Duas colunas como no mockup: a conferência da gaveta ao lado do
          relatório por operador. */}
      <div style={{
        marginTop: 20, display: 'grid', gap: 16,
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', alignItems: 'start',
      }}>
        {/* Turno de caixa.
            O relatório ao lado mostra o CASHLESS, que não passa pela gaveta.
            O turno é o outro lado: dinheiro em espécie. Sem o fundo de troco,
            "sobrou R$ 300" não quer dizer nada — não há com o que comparar. */}
        <div className="ck-card">
          <div className="ck-label">Gaveta · dinheiro em espécie</div>

          {turno ? (
            <>
              <p style={{ color: 'var(--pp-fg-2)', fontSize: 14, margin: '8px 0 14px' }}>
                Turno aberto{turno.station ? ` na praça ${turno.station}` : ''} desde{' '}
                {hora(turno.opened_at)}, com fundo de <b>{brl(turno.opening_cents)}</b>.
              </p>
              <div className="ck-row" style={{ alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
                <div className="ck-field" style={{ margin: 0, flex: '1 1 200px' }}>
                  <label className="ck-label" htmlFor="fech-contado">Quanto contou na gaveta (R$)</label>
                  <input id="fech-contado" className="ck-input" type="number" min="0" step="0.01"
                    inputMode="decimal" value={contado} onChange={(e) => setContado(e.target.value)}
                    placeholder="0,00" />
                </div>
                <button className={`ck-btn ck-btn--primary ${ocupado ? 'is-loading' : ''}`}
                  disabled={ocupado || contado === ''} onClick={fechar}>
                  Fechar e conferir
                </button>
              </div>
            </>
          ) : (
            <>
              <p style={{ color: 'var(--pp-fg-3)', fontSize: 14, margin: '8px 0 14px' }}>
                Nenhum turno seu aberto. Informe o fundo de troco com que a gaveta começa.
              </p>
              <div className="ck-row" style={{ alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
                <div className="ck-field" style={{ margin: 0 }}>
                  <label className="ck-label" htmlFor="fech-fundo">Fundo de troco (R$)</label>
                  <input id="fech-fundo" className="ck-input" type="number" min="0" step="0.01"
                    inputMode="decimal" value={fundo} onChange={(e) => setFundo(e.target.value)}
                    placeholder="0,00" />
                </div>
                <div className="ck-field" style={{ margin: 0 }}>
                  <label className="ck-label" htmlFor="fech-praca">Praça (opcional)</label>
                  <input id="fech-praca" className="ck-input" value={praca}
                    onChange={(e) => setPraca(e.target.value)} placeholder="Bar Central" />
                </div>
                <button className={`ck-btn ck-btn--primary ${ocupado ? 'is-loading' : ''}`}
                  disabled={ocupado} onClick={abrir}>
                  Abrir turno
                </button>
              </div>
            </>
          )}

          {/* O veredito, no formato "conferência" do mockup: cada linha do
              cálculo separada, e a diferença em destaque no fim. O que o
              operador CONTOU fica separado do que o sistema calculou — a
              diferença entre os dois é o achado da conferência. */}
          {conferencia && (
            <>
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  ['Fundo de troco', conferencia.fundo_cents],
                  ['Vendas em dinheiro', conferencia.vendas_cents],
                  ['Esperado na gaveta', conferencia.esperado_cents],
                  ['Contado pelo operador', conferencia.contado_cents],
                ].map(([l, v]) => (
                  <div key={l} className="ck-between" style={{
                    padding: '10px 12px', borderRadius: 'var(--pp-r-md)',
                    background: 'var(--pp-glass-1)', border: '1px solid var(--pp-edge-1)',
                  }}>
                    <span style={{ fontSize: 13 }}>{l}</span>
                    <span style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 600 }}>{brl(v)}</span>
                  </div>
                ))}
              </div>
              <div className={`ck-conferencia ck-conferencia--${conferencia.veredito}`}>
                <div className="ck-between">
                  <strong>
                    {conferencia.veredito === 'bateu' ? 'A gaveta bateu certo'
                      : conferencia.veredito === 'sobrou' ? 'Sobrou na gaveta'
                        : 'Faltou na gaveta'}
                  </strong>
                  <span style={{ fontFamily: 'var(--pp-font-mono)', fontWeight: 700, fontSize: 'var(--pp-fs-18)' }}>
                    {brl(Math.abs(conferencia.diferenca_cents))}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Cashless por operador. */}
        <div className="ck-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="ck-table">
            <thead><tr><th>Operador</th><th className="num">Pedidos</th><th className="num">Total</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.operator_id}>
                  <td>{r.name || r.email}</td>
                  <td className="num">{r.orders}</td>
                  <td className="num" style={{ fontFamily: 'var(--pp-font-mono)' }}>{brl(r.total_cents)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={3} style={{ color: 'var(--pp-fg-3)' }}>Nenhuma venda de PDV ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {ledger && !ledger.ok && (
        <p className="ck-sub" style={{ marginTop: 12, color: 'var(--pp-amber)' }}>
          ⚠ {ledger.drifts.length} carteira(s) com saldo divergente da soma das transações — investigar
        </p>
      )}

      {/* Histórico de turnos: toda gaveta que abriu nesta noite, com quanto
          começou e com quanto fechou. Turno ainda aberto aparece sem contado
          — é o que falta fechar antes de ir embora. */}
      {turnos.length > 0 && (
        <>
          <h2 style={{ fontSize: 'var(--pp-fs-18)', marginTop: 28, marginBottom: 12 }}>Turnos da noite</h2>
          <div className="ck-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="ck-table">
              <thead>
                <tr>
                  <th>Operador</th><th>Praça</th><th>Aberto</th><th>Fechado</th>
                  <th className="num">Fundo</th><th className="num">Contado</th>
                </tr>
              </thead>
              <tbody>
                {turnos.map((t) => (
                  <tr key={t.id}>
                    <td>
                      {t.operador}
                      {t.notas && <div style={{ color: 'var(--pp-fg-4)', fontSize: 12 }}>{t.notas}</div>}
                    </td>
                    <td style={{ color: 'var(--pp-fg-3)' }}>{t.praca ?? '—'}</td>
                    <td style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 13 }}>{diaHora(t.aberto_em)}</td>
                    <td style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 13 }}>
                      {t.fechado_em
                        ? diaHora(t.fechado_em)
                        : <span className="ck-badge ck-badge--live">aberto</span>}
                    </td>
                    <td className="num" style={{ fontFamily: 'var(--pp-font-mono)' }}>{brl(t.fundo_cents)}</td>
                    <td className="num" style={{ fontFamily: 'var(--pp-font-mono)' }}>
                      {t.contado_cents != null ? brl(t.contado_cents) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Shell>
  );
}
