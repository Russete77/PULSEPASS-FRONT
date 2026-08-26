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
  const [notas, setNotas] = useState('');
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
      // A nota vai junto do fechamento: a RPC sempre aceitou `notas`, e a
      // tabela de turnos já a renderiza — só ninguém nunca enviava. É onde a
      // justificativa de "sobrou/faltou" fica registrada por quem contou.
      setConferencia(await api.fecharTurno(turno.id, {
        contado_cents: Math.round(Number(contado || 0) * 100),
        ...(notas.trim() ? { notas: notas.trim() } : {}),
      }));
      setContado(''); setNotas('');
      await carregar();
    } catch (e) { setError(e.message); } finally { setOcupado(false); }
  }

  if (status === 'loading') return <Shell><Loading /></Shell>;
  if (status === 'error') return <Shell><ErrorBox>{error}</ErrorBox></Shell>;

  const total = rows.reduce((s, r) => s + r.total_cents, 0);
  const orders = rows.reduce((s, r) => s + r.orders, 0);

  /* Conferência de carteira: o saldo de cada carteira bate com o extrato?
     São TRÊS estados, e a diferença entre eles é o ponto. "Não havia o que
     conferir" não é "está tudo certo" — confundir os dois foi o que fez esta
     tela assinar OK por baixo de qualquer rombo enquanto o backend filtrava
     as carteiras por um `event_id` que a carteira única deixou sempre nulo.
     O `?? ledger.ok` cobre a janela em que o back ainda é o antigo. */
  const conf = ledger && {
    status: ledger.status ?? (ledger.ok ? 'ok' : 'divergencias'),
    conferidas: ledger.conferidas,
    drifts: ledger.drifts ?? [],
  };

  /* KPIs com o fio de cor no topo, como no mockup. O quarto cartão é a
     integridade do ledger: no fechamento, "o saldo bate?" é um número tão
     importante quanto o total. */
  const kpis = [
    { l: 'Total PDV (cashless)', v: brl(total), d: 'débito de saldo, sem espécie', cor: 'var(--pp-pulse)' },
    { l: 'Pedidos', v: String(orders), d: `${rows.length} operador(es)`, cor: 'var(--pp-cyan)' },
    { l: 'Turnos de gaveta', v: String(turnos.length), d: `${turnos.filter((t) => !t.fechado_em).length} aberto(s)`, cor: 'var(--pp-violet)' },
    conf && {
      l: 'Conferência de carteira',
      v: conf.status === 'sem_movimento' ? '—'
        : conf.status === 'divergencias' ? `${conf.drifts.length} divergência(s)` : 'OK',
      d: conf.status === 'sem_movimento'
        ? 'nenhuma carteira movimentou no bar'
        : `${conf.conferidas ?? '—'} carteira(s) conferida(s) · saldo x extrato`,
      cor: conf.status === 'divergencias' ? 'var(--pp-amber)'
        : conf.status === 'sem_movimento' ? 'var(--pp-fg-4)' : 'var(--pp-pulse)',
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
          <div key={k.l} className="ck-metric ck-rel ck-hidden">
            <div aria-hidden="true" className="ck-fio" style={{ background: k.cor }} />
            <div className="lbl">{k.l}</div>
            <div className="val">{k.v}</div>
            <div className="ck-mt-1 ck-t-label pp-muted-2">{k.d}</div>
          </div>
        ))}
      </div>

      {/* Duas colunas como no mockup: a conferência da gaveta ao lado do
          relatório por operador. */}
      <div className="ck-grid--md ck-mt-5 ck-ai-start">
        {/* Turno de caixa.
            O relatório ao lado mostra o CASHLESS, que não passa pela gaveta.
            O turno é o outro lado: dinheiro em espécie. Sem o fundo de troco,
            "sobrou R$ 300" não quer dizer nada — não há com o que comparar. */}
        <div className="ck-card">
          <div className="ck-label">Gaveta · dinheiro em espécie</div>

          {turno ? (
            <>
              <p className="ck-c-fg2 ck-t-support ck-m-0 ck-mt-2 ck-mb-4">
                Turno aberto{turno.station ? ` na praça ${turno.station}` : ''} desde{' '}
                {hora(turno.opened_at)}, com fundo de <b>{brl(turno.opening_cents)}</b>.
              </p>
              <div className="ck-row ck-ai-end ck-gap-3 pp-wrap">
                <div className="ck-field ck-m-0 ck-flex1 ck-fit">
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
              <div className="ck-field ck-mt-3">
                <label className="ck-label" htmlFor="fech-notas">Observação (opcional — vira registro do turno)</label>
                <input id="fech-notas" className="ck-input" value={notas} maxLength={200}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="ex: troco emprestado do bar VIP às 23h" />
              </div>
            </>
          ) : (
            <>
              <p className="pp-muted ck-t-support ck-m-0 ck-mt-2 ck-mb-4">
                Nenhum turno seu aberto. Informe o fundo de troco com que a gaveta começa.
              </p>
              <div className="ck-row ck-ai-end ck-gap-3 pp-wrap">
                <div className="ck-field ck-m-0">
                  <label className="ck-label" htmlFor="fech-fundo">Fundo de troco (R$)</label>
                  <input id="fech-fundo" className="ck-input" type="number" min="0" step="0.01"
                    inputMode="decimal" value={fundo} onChange={(e) => setFundo(e.target.value)}
                    placeholder="0,00" />
                </div>
                <div className="ck-field ck-m-0">
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
              <div className="ck-mt-4 ck-gap-2 ck-col">
                {[
                  ['Fundo de troco', conferencia.fundo_cents],
                  ['Vendas em dinheiro', conferencia.vendas_cents],
                  ['Esperado na gaveta', conferencia.esperado_cents],
                  ['Contado pelo operador', conferencia.contado_cents],
                ].map(([l, v]) => (
                  <div key={l} className="ck-between ck-caixa--sm">
                    <span className="ck-t-support">{l}</span>
                    <span className="pp-mono ck-w-semi">{brl(v)}</span>
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
                  <span className="pp-mono ck-w-bold ck-t-section">
                    {brl(Math.abs(conferencia.diferenca_cents))}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Cashless por operador. */}
        <div className="ck-card ck-card--flush">
          <table className="ck-table">
            <thead><tr><th>Operador</th><th className="num">Pedidos</th><th className="num">Total</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.operator_id}>
                  <td>{r.name || r.email}</td>
                  <td className="num">{r.orders}</td>
                  <td className="num pp-mono">{brl(r.total_cents)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={3} className="pp-muted">Nenhuma venda de PDV ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {conf?.status === 'divergencias' && (
        <p className="ck-sub ck-mt-3 ck-c-amber">
          ⚠ {conf.drifts.length} de {conf.conferidas} carteira(s) com saldo divergente da soma das
          transações — investigar antes de fechar a noite.
        </p>
      )}

      {/* Sem consumo no bar não há carteira a conferir. Dizer isso é o
          oposto de dar OK: o silêncio aqui era o bug. */}
      {conf?.status === 'sem_movimento' && (
        <p className="ck-sub ck-mt-3 pp-muted-2">
          Nenhuma carteira movimentou no bar deste evento — não há saldo a conferir.
        </p>
      )}

      {/* Histórico de turnos: toda gaveta que abriu nesta noite, com quanto
          começou e com quanto fechou. Turno ainda aberto aparece sem contado
          — é o que falta fechar antes de ir embora. */}
      {turnos.length > 0 && (
        <>
          <h2 className="ck-secao">Turnos da noite</h2>
          <div className="ck-card ck-card--flush">
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
                      {t.notas && <div className="pp-muted-2 ck-t-support">{t.notas}</div>}
                    </td>
                    <td className="pp-muted">{t.praca ?? '—'}</td>
                    <td className="pp-mono ck-t-support">{diaHora(t.aberto_em)}</td>
                    <td className="pp-mono ck-t-support">
                      {t.fechado_em
                        ? diaHora(t.fechado_em)
                        : <span className="ck-badge ck-badge--live">aberto</span>}
                    </td>
                    <td className="num pp-mono">{brl(t.fundo_cents)}</td>
                    <td className="num pp-mono">
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
