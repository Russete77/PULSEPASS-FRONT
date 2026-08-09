import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shell, Loading, ErrorBox, BackLink } from '../components/Shell.jsx';
import { api } from '../lib/api.js';
import { brl } from '../lib/format.js';

export default function Fechamento() {
  const { id } = useParams();
  const [rows, setRows] = useState([]);
  const [ledger, setLedger] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [turno, setTurno] = useState(null);      // turno aberto de quem opera
  const [fundo, setFundo] = useState('');
  const [contado, setContado] = useState('');
  const [praca, setPraca] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [conferencia, setConferencia] = useState(null);

  const carregar = useCallback(async () => {
    const [r, l, t] = await Promise.all([
      api.cashierReport(id), api.ledgerCheck(id), api.turnoAberto(id).catch(() => null),
    ]);
    setRows(r); setLedger(l); setTurno(t); setStatus('done');
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

  return (
    <Shell>
      <BackLink to={`/eventos/${id}`} label="Dashboard" />
      <div className="ck-eyebrow">bar · fechamento de caixa</div>
      <h1 className="ck-h1">Fechamento por operador</h1>
      <p className="ck-sub">Total processado no PDV por cada operador (débito de saldo — cashless, sem dinheiro em espécie).</p>

      {/* Turno de caixa.
          O relatório abaixo mostra o CASHLESS, que não passa pela gaveta. O
          turno é o outro lado: dinheiro em espécie. Sem o fundo de troco,
          "sobrou R$ 300" não quer dizer nada — não há com o que comparar. */}
      <div className="ck-card" style={{ maxWidth: 640, marginTop: 8 }}>
        <div className="ck-label">Gaveta · dinheiro em espécie</div>

        {turno ? (
          <>
            <p style={{ color: 'var(--pp-fg-2)', fontSize: 14, margin: '8px 0 14px' }}>
              Turno aberto{turno.station ? ` na praça ${turno.station}` : ''} desde{' '}
              {new Date(turno.opened_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })},
              com fundo de <b>{brl(turno.opening_cents)}</b>.
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

        {/* O veredito. O que o operador CONTOU fica separado do que o sistema
            calculou — a diferença entre os dois é o achado da conferência. */}
        {conferencia && (
          <div className={`ck-conferencia ck-conferencia--${conferencia.veredito}`}>
            <strong>
              {conferencia.veredito === 'bateu' ? 'A gaveta bateu certo'
                : conferencia.veredito === 'sobrou' ? `Sobrou ${brl(conferencia.diferenca_cents)}`
                  : `Faltou ${brl(Math.abs(conferencia.diferenca_cents))}`}
            </strong>
            <div style={{ fontSize: 13, marginTop: 6, color: 'var(--pp-fg-2)' }}>
              fundo {brl(conferencia.fundo_cents)} + vendas em dinheiro {brl(conferencia.vendas_cents)}
              {' = esperado '}{brl(conferencia.esperado_cents)} · contado {brl(conferencia.contado_cents)}
            </div>
          </div>
        )}
      </div>

      <div className="ck-metrics" style={{ marginTop: 20 }}>
        <div className="ck-card ck-metric"><div className="lbl">Total PDV</div><div className="val" style={{ color: 'var(--pp-pulse)' }}>{brl(total)}</div></div>
        <div className="ck-card ck-metric"><div className="lbl">Pedidos</div><div className="val">{orders}</div></div>
        <div className="ck-card ck-metric"><div className="lbl">Operadores</div><div className="val">{rows.length}</div></div>
      </div>

      {ledger && (
        <p className="ck-sub" style={{ marginTop: 12, color: ledger.ok ? 'var(--pp-pulse)' : 'var(--pp-amber)' }}>
          {ledger.ok
            ? '✓ Integridade do saldo (ledger): sem divergências'
            : `⚠ ${ledger.drifts.length} carteira(s) com saldo divergente da soma das transações — investigar`}
        </p>
      )}

      <div className="ck-card" style={{ padding: 0, overflow: 'hidden', marginTop: 24 }}>
        <table className="ck-table">
          <thead><tr><th>Operador</th><th>Pedidos</th><th>Total</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.operator_id}>
                <td>{r.name || r.email}</td>
                <td>{r.orders}</td>
                <td>{brl(r.total_cents)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={3} style={{ color: 'var(--pp-fg-3)' }}>Nenhuma venda de PDV ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
