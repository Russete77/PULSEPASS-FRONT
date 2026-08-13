import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Shell, Loading, ErrorBox, OpsBack } from '../components/Shell.jsx';
import { Icon } from '@pulsepass/shared/Icon';
import { api } from '../lib/api.js';
import { brl } from '../lib/format.js';

/**
 * Bilheteria física — venda no balcão.
 *
 * Layout da BoxOfficeScreen do design system: a seleção (lotes em cards,
 * forma de pagamento em cards com rádio, dados do comprador) de um lado e a
 * COMANDA fixa do outro, com o total sempre à vista e o botão "Cobrar" grande.
 * Tela usada em pé, com fila na frente e pouca luz.
 *
 * O que o mockup mostra e não existe no sistema, ficou de fora: o CPF na nota
 * (a venda de balcão não emite NFe), a maquininha pareada por Bluetooth (a
 * maquininha é da casa, fora do sistema) e o valor da taxa na comanda — o
 * backend aplica a taxa do evento na liquidação e o número certo só existe lá,
 * então a comanda avisa em texto em vez de inventar um percentual.
 */
const METHODS = [
  { key: 'cash', label: 'Dinheiro', d: 'troco calculado aqui' },
  { key: 'card_machine', label: 'Maquininha', d: 'na máquina da casa' },
  { key: 'pix_manual', label: 'Pix', d: 'na chave da casa' },
  { key: 'courtesy', label: 'Cortesia', d: 'sai por R$ 0' },
];

const centsFromInput = (v) => Math.round(parseFloat(String(v).replace(',', '.') || '0') * 100);

export default function Bilheteria() {
  const { id } = useParams();
  const [state, setState] = useState({ status: 'loading' });
  const [operador, setOperador] = useState(null);
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

  // O selo de operador do mockup — é quem responde pela gaveta. Best-effort:
  // se o perfil não carregar, a tela funciona igual, só sem o selo.
  useEffect(() => {
    api.me()
      .then((me) => setOperador(me.profile?.full_name || me.profile?.email || null))
      .catch(() => {});
  }, []);

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
              <div style={{ fontFamily: 'var(--pp-font-display)', fontSize: 52, fontWeight: 700, color: 'var(--pp-pulse)', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>
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

      {/* Cabeçalho com o selo do operador, como no mockup. */}
      <div className="ck-between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="ck-eyebrow">bilheteria física · venda no balcão</div>
          <h1 className="ck-h1">Vender ingresso</h1>
          <p className="ck-sub" style={{ marginBottom: 0 }}>
            Dinheiro, maquininha, Pix ou cortesia. O ingresso sai na hora.
          </p>
        </div>
        {operador && (
          <span className="ck-badge ck-badge--success">
            <span className="pp-pulse-dot" style={{ width: 6, height: 6 }} /> operador · {operador}
          </span>
        )}
      </div>

      <div className="ck-split" style={{ marginTop: 20 }}>
        {/* ══ Coluna da seleção ══ */}
        <div>
          {/* Lotes em cards com preço grande — a grade do mockup. O stepper
              fica no próprio card: aqui vende-se mais de um lote por venda. */}
          <div className="ck-label" style={{ marginBottom: 10 }}>Lotes</div>
          {tiers.length === 0 && <div className="ck-empty">Nenhum lote disponível.</div>}
          <div className="ck-bo-lotes">
            {tiers.map((t) => {
              const restam = t.quantity_total == null ? null : t.quantity_total - t.quantity_sold;
              const esgotado = restam !== null && restam <= 0;
              const n = cart[t.id] ?? 0;
              return (
                <div key={t.id} className={`ck-bo-lote ${n ? 'is-on' : ''} ${esgotado ? 'is-off' : ''}`}>
                  <div className="ck-bo-lote__nome">{t.name}</div>
                  <div className="ck-bo-lote__preco">{brl(t.price_cents)}</div>
                  <div className="ck-bo-lote__resta">
                    {restam === null ? 'sem limite' : esgotado ? 'esgotado' : `restam ${restam}`}
                    {t.half_price_cents != null && ` · meia ${brl(t.half_price_cents)}`}
                  </div>
                  <div className="pp-stepper" style={{ marginTop: 10 }}>
                    <button type="button" onClick={() => setQty(t.id, -1)} disabled={!n}
                      aria-label={`Tirar um ${t.name}`}>−</button>
                    <span className="qty" aria-live="polite" aria-label={`${n} ${t.name}`}>{n}</span>
                    <button type="button" className="plus" onClick={() => setQty(t.id, +1)} disabled={esgotado}
                      aria-label={`Adicionar um ${t.name}`}>+</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Forma de pagamento em cards com rádio, como no mockup. */}
          <div className="ck-label" style={{ margin: '20px 0 10px' }}>Forma de pagamento</div>
          <div className="ck-pays" role="radiogroup" aria-label="Forma de pagamento">
            {METHODS.map((m) => {
              const on = method === m.key;
              return (
                <button key={m.key} type="button" role="radio" aria-checked={on}
                  className={`ck-pay ${on ? 'is-on' : ''}`} onClick={() => setMethod(m.key)}>
                  <span className="ck-pay__radio" aria-hidden="true" />
                  <span className="ck-pay__l">{m.label}</span>
                  <span className="ck-pay__d">{m.d}</span>
                </button>
              );
            })}
          </div>

          {/* Comprador (opcional): com e-mail o ingresso vai pro app; sem, é
              ao portador. */}
          <div className="ck-label" style={{ margin: '20px 0 10px' }}>Comprador (opcional)</div>
          <div className="ck-card">
            <div className="ck-row">
              <div className="ck-field" style={{ margin: 0 }}>
                <label htmlFor="bilheteria-nome" className="ck-label">Nome</label>
                <input id="bilheteria-nome" className="ck-input" autoComplete="name" value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)} placeholder="Vai impresso no ingresso" />
              </div>
              <div className="ck-field" style={{ margin: 0 }}>
                <label htmlFor="bilheteria-email" className="ck-label">E-mail</label>
                <input id="bilheteria-email" className="ck-input" type="email" autoComplete="email"
                  inputMode="email" autoCapitalize="off" autoCorrect="off" spellCheck="false"
                  value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="Recebe o ingresso no app" />
              </div>
            </div>
          </div>

          {/* Últimas vendas — o extrato curto que resolve "cobrei essa pessoa?" */}
          {(state.data.recent_sales ?? []).length > 0 && (
            <div className="ck-card" style={{ marginTop: 16 }}>
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
        </div>

        {/* ══ Comanda (aside do mockup) ══ */}
        <aside className="ck-bo-comanda" aria-label="Comanda atual">
          <div className="ck-bo-comanda__in">
            <div className="ck-label" style={{ marginBottom: 10 }}>Comanda atual</div>

            {/* Caixa do dia sempre à vista de quem opera. */}
            <div className="ck-bo-caixa">
              <div>
                <div className="lbl">Caixa</div>
                <div className="val">{brl(report.total_cents ?? 0)}</div>
              </div>
              <div>
                <div className="lbl">Vendas</div>
                <div className="val">{report.sales_count ?? 0}</div>
              </div>
              <div>
                <div className="lbl">Ingressos</div>
                <div className="val">{report.tickets_count ?? 0}</div>
              </div>
            </div>

            <div className="ck-bo-itens">
              {itemCount === 0 && (
                <p style={{ color: 'var(--pp-fg-4)', fontSize: 13, margin: '10px 0' }}>
                  Toque num lote pra começar a venda.
                </p>
              )}
              {tiers.filter((t) => cart[t.id]).map((t) => (
                <div key={t.id} className="ck-between" style={{ padding: '6px 0' }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{cart[t.id]}× {t.name}</span>
                  <span className="pp-mono" style={{ fontWeight: 600 }}>{brl(cart[t.id] * t.price_cents)}</span>
                </div>
              ))}
            </div>

            <div className="ck-bo-total">
              <div className="ck-between" style={{ fontSize: 13, color: 'var(--pp-fg-3)' }}>
                <span>Subtotal · {itemCount} ingresso(s)</span>
                <span className="pp-mono">{isCourtesy ? brl(0) : brl(subtotal)}</span>
              </div>
              {!isCourtesy && (
                <p style={{ color: 'var(--pp-fg-4)', fontSize: 11, margin: '4px 0 0' }}>
                  A taxa de serviço do evento, se houver, entra no total final.
                </p>
              )}
              <div className="ck-between" style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--pp-edge-2)' }}>
                <strong>Total</strong>
                <span className="pp-money" style={{ fontSize: 'var(--pp-fs-28)' }}>
                  {isCourtesy ? brl(0) : brl(subtotal)}
                </span>
              </div>
            </div>

            {method === 'cash' && (
              <div className="ck-field" style={{ marginTop: 14, marginBottom: 0 }}>
                <label htmlFor="bilheteria-recebido" className="ck-label">Valor recebido (pro troco)</label>
                <input id="bilheteria-recebido" className="ck-input" inputMode="decimal" value={received}
                  onChange={(e) => setReceived(e.target.value)} placeholder="Ex.: 200,00"
                  style={{ fontFamily: 'var(--pp-font-mono)', fontSize: 20 }} />
              </div>
            )}

            {error && <ErrorBox>{error}</ErrorBox>}

            <button className={`ck-btn ck-btn--primary ${busy ? 'is-loading' : ''}`}
              style={{ marginTop: 14, width: '100%', height: 56, fontSize: 16 }}
              onClick={finalize} disabled={busy || itemCount === 0}>
              {busy ? 'Emitindo…' : (
                <>
                  <Icon name="ticket" size={17} />
                  {isCourtesy ? 'Emitir cortesia' : `Cobrar ${brl(subtotal)}`}
                </>
              )}
            </button>
            {itemCount > 0 && (
              <button className="ck-btn ck-btn--ghost" style={{ marginTop: 8, width: '100%' }}
                onClick={() => { setCart({}); setReceived(''); }}>
                Cancelar comanda
              </button>
            )}
          </div>
        </aside>
      </div>
    </Shell>
  );
}
