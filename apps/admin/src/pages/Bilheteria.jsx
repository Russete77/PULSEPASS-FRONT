import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Shell, Loading, ErrorBox, OpsBack } from '../components/Shell.jsx';
import { Icon } from '@pulsepass/shared/Icon';
import { api } from '../lib/api.js';
import { brl } from '../lib/format.js';

// Tela usada em pé, com fila na frente e pouca luz: alvos grandes, troco em
// corpo enorme e o caixa sempre à vista. Nada de menu escondido.
const METHODS = [
  { key: 'cash', label: 'Dinheiro' },
  { key: 'card_machine', label: 'Maquininha' },
  { key: 'pix_manual', label: 'Pix' },
  { key: 'courtesy', label: 'Cortesia' },
];

const centsFromInput = (v) => Math.round(parseFloat(String(v).replace(',', '.') || '0') * 100);

export default function Bilheteria() {
  const { id } = useParams();
  const [state, setState] = useState({ status: 'loading' });
  const [cart, setCart] = useState({});          // { tierId: qty }
  const [method, setMethod] = useState('cash');
  const [received, setReceived] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sale, setSale] = useState(null);        // recibo da última venda

  const load = useCallback(async () => {
    try {
      setState({ status: 'ok', data: await api.boxOfficeOpen(id) });
    } catch (e) {
      setState({ status: 'error', message: e.message });
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const tiers = state.data?.tiers ?? [];
  const setQty = (tierId, delta) => setCart((c) => {
    const next = Math.max(0, (c[tierId] ?? 0) + delta);
    const copy = { ...c };
    if (next === 0) delete copy[tierId]; else copy[tierId] = next;
    return copy;
  });

  // Subtotal pelo preço de face. O total REAL vem do servidor (pode ter taxa de
  // serviço) — por isso o troco só é afirmado depois da venda confirmada.
  const subtotal = useMemo(
    () => tiers.reduce((sum, t) => sum + (cart[t.id] ?? 0) * t.price_cents, 0),
    [cart, tiers],
  );
  const itemCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const isCourtesy = method === 'courtesy';
  const receivedCents = centsFromInput(received);

  async function finalize() {
    setBusy(true); setError('');
    try {
      const body = {
        items: Object.entries(cart).map(([ticket_tier_id, quantity]) => ({ ticket_tier_id, quantity })),
        method,
        ...(isCourtesy || !received ? {} : { received_cents: receivedCents }),
        buyer: {
          ...(buyerName.trim() ? { name: buyerName.trim() } : {}),
          ...(buyerEmail.trim() ? { email: buyerEmail.trim() } : {}),
        },
      };
      const r = await api.boxOfficeSell(id, body);
      setSale(r);
      setCart({}); setReceived(''); setBuyerName(''); setBuyerEmail('');
      load(); // atualiza caixa e estoque dos lotes
    } catch (e) {
      setError(e.message);
    } finally { setBusy(false); }
  }

  if (state.status === 'loading') return <Shell><Loading /></Shell>;
  if (state.status === 'error') return <Shell><OpsBack eventId={id} /><ErrorBox>{state.message}</ErrorBox></Shell>;

  const report = state.data.report ?? {};

  // ── Recibo: o que o bilheteiro mostra e fala em voz alta ──
  if (sale) {
    return (
      <Shell>
        <OpsBack eventId={id} />
        <div className="ck-card" style={{ maxWidth: 520 }}>
          <div className="ck-eyebrow">venda concluída</div>
          {sale.change_cents > 0 ? (
            <>
              <div className="ck-label" style={{ marginTop: 8 }}>Troco</div>
              <div style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 52, fontWeight: 700, color: 'var(--pp-pulse)', lineHeight: 1.1 }}>
                {brl(sale.change_cents)}
              </div>
            </>
          ) : (
            <h1 className="ck-h1" style={{ color: 'var(--pp-pulse)' }}>Sem troco</h1>
          )}
          <p className="ck-sub" style={{ marginTop: 4 }}>
            Cobrado {brl(sale.total_cents)}
            {sale.received_cents ? ` · recebido ${brl(sale.received_cents)}` : ''}
          </p>

          <div className="ck-label" style={{ marginTop: 20 }}>Ingressos emitidos</div>
          {sale.tickets.map((t) => (
            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--pp-edge-1)' }}>
              <span style={{ fontFamily: 'var(--pp-font-mono)', letterSpacing: 1 }}>{t.code}</span>
              <span style={{ color: 'var(--pp-fg-3)', fontSize: 13 }}>{t.tier}</span>
            </div>
          ))}
          <p style={{ color: 'var(--pp-fg-4)', fontSize: 12, marginTop: 12 }}>
            {sale.emailed
              ? 'Ingressos também enviados por e-mail.'
              : 'Venda ao portador — o código acima é o ingresso. Anote ou fotografe.'}
          </p>
          <button className="ck-btn ck-btn--primary" style={{ marginTop: 18, width: '100%', height: 52 }} onClick={() => setSale(null)}>
            Próxima venda
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <OpsBack eventId={id} />
      <div className="ck-eyebrow">bilheteria · venda na entrada</div>
      <h1 className="ck-h1">Vender ingresso</h1>
      <p className="ck-sub">Dinheiro, maquininha, Pix ou cortesia. O ingresso sai na hora.</p>

      {/* Caixa do dia sempre visível */}
      <div className="ck-card" style={{ maxWidth: 640, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <div className="ck-label">Caixa da bilheteria</div>
          <div style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 26, fontWeight: 700 }}>{brl(report.total_cents ?? 0)}</div>
        </div>
        <div>
          <div className="ck-label">Vendas</div>
          <div style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 26 }}>{report.sales_count ?? 0}</div>
        </div>
        <div>
          <div className="ck-label">Ingressos</div>
          <div style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 26 }}>{report.tickets_count ?? 0}</div>
        </div>
      </div>

      <div className="ck-card" style={{ maxWidth: 640, marginTop: 16 }}>
        <div className="ck-label">Lotes</div>
        {tiers.length === 0 && <div className="ck-empty">Nenhum lote disponível.</div>}
        {tiers.map((t) => {
          const restam = t.quantity_total == null ? null : t.quantity_total - t.quantity_sold;
          const esgotado = restam !== null && restam <= 0;
          return (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--pp-edge-1)' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong>{t.name}</strong>
                <div style={{ color: 'var(--pp-pulse)', fontFamily: 'var(--pp-font-mono)' }}>{brl(t.price_cents)}</div>
                <div style={{ color: 'var(--pp-fg-4)', fontSize: 12 }}>
                  {restam === null ? 'sem limite' : esgotado ? 'esgotado' : `restam ${restam}`}
                </div>
              </div>
              <button type="button" className="ck-iconbtn" onClick={() => setQty(t.id, -1)} disabled={!cart[t.id]}>−</button>
              <span style={{ minWidth: 30, textAlign: 'center', fontFamily: 'var(--pp-font-mono)', fontSize: 20 }}>{cart[t.id] ?? 0}</span>
              <button type="button" className="ck-iconbtn" onClick={() => setQty(t.id, +1)} disabled={esgotado}>+</button>
            </div>
          );
        })}

        <div className="ck-label" style={{ marginTop: 20 }}>Forma de pagamento</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {METHODS.map((m) => (
            <button key={m.key} type="button"
              className={`ck-btn ${method === m.key ? 'ck-btn--primary' : 'ck-btn--glass'}`}
              onClick={() => setMethod(m.key)}>{m.label}</button>
          ))}
        </div>

        {method === 'cash' && (
          <div className="ck-field" style={{ marginTop: 16 }}>
            <label className="ck-label">Valor recebido (para calcular o troco)</label>
            <input className="ck-input" inputMode="decimal" value={received}
              onChange={(e) => setReceived(e.target.value)} placeholder="Ex.: 200,00"
              style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 20 }} />
          </div>
        )}

        <div className="ck-row" style={{ marginTop: 16 }}>
          <div className="ck-field" style={{ margin: 0 }}>
            <label className="ck-label">Nome do comprador (opcional)</label>
            <input className="ck-input" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="Vai impresso no ingresso" />
          </div>
          <div className="ck-field" style={{ margin: 0 }}>
            <label className="ck-label">E-mail (opcional)</label>
            <input className="ck-input" type="email" value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} placeholder="Recebe o ingresso no app" />
          </div>
        </div>

        {error && <ErrorBox>{error}</ErrorBox>}

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <div className="ck-label">{itemCount} ingresso(s)</div>
            <div style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 30, fontWeight: 700 }}>
              {isCourtesy ? brl(0) : brl(subtotal)}
            </div>
            {!isCourtesy && <div style={{ color: 'var(--pp-fg-4)', fontSize: 11 }}>+ taxa de serviço no total final</div>}
          </div>
          <button className="ck-btn ck-btn--primary" style={{ height: 56, minWidth: 190, fontSize: 17 }}
            onClick={finalize} disabled={busy || itemCount === 0}>
            {busy ? 'Emitindo…' : <><Icon name="ticket" size={17} /> Emitir ingresso</>}
          </button>
        </div>
      </div>

      {(state.data.recent_sales ?? []).length > 0 && (
        <div className="ck-card" style={{ maxWidth: 640, marginTop: 16 }}>
          <div className="ck-label">Últimas vendas</div>
          {state.data.recent_sales.slice(0, 8).map((s) => (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--pp-edge-1)', fontSize: 13 }}>
              <span style={{ color: 'var(--pp-fg-3)' }}>
                {METHODS.find((m) => m.key === s.method)?.label ?? s.method}
                {s.buyer_name ? ` · ${s.buyer_name}` : ''}
              </span>
              <span style={{ fontFamily: 'var(--pp-font-mono)' }}>{brl(s.amount_cents)}</span>
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}
