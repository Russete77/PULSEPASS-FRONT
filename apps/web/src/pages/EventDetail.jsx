import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Page } from '../components/Layout.jsx';
import { Loading, ErrorBox } from '../components/States.jsx';
import CardForm from '../components/CardForm.jsx';
import { DirectionsButton } from '../components/DirectionsSheet.jsx';
import { Icon } from '../components/Icon.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import { brl, eventDate } from '../lib/format.js';

const emptySel = { full: 0, half: 0 };

export default function EventDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [sel, setSel] = useState({}); // tierId -> { full, half }
  const [submitting, setSubmitting] = useState(false);
  const [method, setMethod] = useState('pix'); // 'pix' | 'card'
  const [cardPayload, setCardPayload] = useState(null);
  const [cardValid, setCardValid] = useState(false);
  const [coupon, setCoupon] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setEvent(await api.getEvent(slug));
        setStatus('done');
      } catch (e) {
        setError(e.message);
        setStatus('error');
      }
    })();
  }, [slug]);

  const subtotalCents = useMemo(() => {
    if (!event) return 0;
    return event.tiers.reduce((sum, t) => {
      const s = sel[t.id] ?? emptySel;
      return sum + s.full * t.price_cents + s.half * (t.half_price_cents ?? 0);
    }, 0);
  }, [sel, event]);

  const feeBps = event?.service_fee_bps ?? 0;
  const feeCents = Math.round((subtotalCents * feeBps) / 10000);
  const totalCents = subtotalCents + feeCents;
  const itemCount = Object.values(sel).reduce((a, s) => a + s.full + s.half, 0);

  function stepTier(tier, kind, delta) {
    setSel((prev) => {
      const s = prev[tier.id] ?? emptySel;
      const combined = s.full + s.half;
      const cap = Math.min(tier.max_per_order, tier.available);
      let d = delta;
      if (d > 0) d = Math.min(d, cap - combined); // não passa do estoque/limite
      const nextKind = Math.max(0, s[kind] + d);
      return { ...prev, [tier.id]: { ...s, [kind]: nextKind } };
    });
  }

  function buildItems() {
    const items = [];
    for (const t of event.tiers) {
      const s = sel[t.id] ?? emptySel;
      if (s.full > 0) items.push({ ticket_tier_id: t.id, quantity: s.full, half: false });
      if (s.half > 0) items.push({ ticket_tier_id: t.id, quantity: s.half, half: true });
    }
    return items;
  }

  async function handleCheckout() {
    if (!user) {
      navigate('/entrar', { state: { from: { pathname: `/eventos/${slug}` } } });
      return;
    }
    const items = buildItems();
    if (items.length === 0) return;
    if (method === 'card' && !cardValid) {
      setError('Preencha os dados do cartão corretamente.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const payload = { eventSlug: slug, items, paymentMethod: method };
      if (coupon.trim()) payload.couponCode = coupon.trim();
      if (method === 'card') {
        payload.card = cardPayload.card;
        payload.holderInfo = cardPayload.holderInfo;
        payload.installmentCount = cardPayload.installmentCount;
      }
      const order = await api.createOrder(payload);
      if (order.status === 'paid') navigate('/meus-ingressos', { replace: true });
      else navigate(`/checkout/${order.id}`);
    } catch (e) {
      setError(e.message);
      setSubmitting(false);
    }
  }

  if (status === 'loading') return <Page><Loading /></Page>;
  if (status === 'error') return <Page><ErrorBox>{error}</ErrorBox></Page>;

  return (
    <Page>
      <div className="pp-detail">
        <div className="pp-stack pp-stack-5 pp-reveal">
          <div className="pp-hero">
            {event.cover_url && <img src={event.cover_url} alt={event.title} />}
            <div className="pp-hero__in">
              <h1 className="pp-hero__title">{event.title}</h1>
            </div>
          </div>
          <div className="pp-feature-chips">
            <span className="pp-badge pp-badge--pulse">Ingressos</span>
            <span className="pp-badge pp-badge--violet">Lista</span>
            <span className="pp-badge pp-badge--cyan">Bar cashless</span>
          </div>

          <div className="pp-card pp-card--pad">
            <div className="pp-metacard">
              <div className="pp-metacard__icon"><Icon name="calendar" size={18} /></div>
              <div>
                <div className="pp-metacard__k">Quando</div>
                <div className="pp-metacard__v">{eventDate(event.starts_at)}</div>
              </div>
              <div className="pp-metacard__icon"><Icon name="pin" size={18} /></div>
              <div>
                <div className="pp-metacard__k">Onde</div>
                <div className="pp-metacard__v">
                  {event.venue_name ? `${event.venue_name}` : 'Local a confirmar'}
                  {event.address ? ` · ${event.address}` : ''} · {event.city}/{event.state}
                </div>
              </div>
            </div>
          </div>

          {event.description && (
            <p style={{ lineHeight: 1.6, color: 'var(--pp-fg-2)', margin: 0 }}>{event.description}</p>
          )}

          <div className="pp-cluster">
            <Link to={`/eventos/${slug}/bar`} className="pp-btn pp-btn--glass">
              <Icon name="wallet" size={17} /> Pedir no bar
            </Link>
            <Link to={`/eventos/${slug}/camarotes`} className="pp-btn pp-btn--glass">
              <Icon name="sofa" size={17} /> Camarotes &amp; mesas
            </Link>
            <DirectionsButton
              className="pp-btn pp-btn--glass"
              venue={event.venue_name}
              address={event.address}
              city={event.city}
              state={event.state}
            />
          </div>
        </div>

        <aside className="pp-card pp-summary">
          <div className="pp-eyebrow" style={{ marginBottom: 12 }}>Ingressos</div>

          {event.tiers.map((t) => {
            const s = sel[t.id] ?? emptySel;
            const cap = Math.min(t.max_per_order, t.available);
            const combined = s.full + s.half;
            const st = t.sale_state ?? (t.available <= 0 ? 'sold_out' : 'on_sale');
            const locked = st !== 'on_sale';
            const note = st === 'upcoming' ? `Vendas a partir de ${eventDate(t.sales_start)}`
              : st === 'ended' ? 'Vendas encerradas'
                : st === 'sold_out' ? 'Esgotado' : '';
            return (
              <div key={t.id} style={{ borderBottom: '1px solid var(--pp-edge-2)', paddingBottom: 10, marginBottom: 10 }}>
                <TierRow
                  label={t.name}
                  price={t.price_cents}
                  qty={s.full}
                  onDec={() => stepTier(t, 'full', -1)}
                  onInc={() => stepTier(t, 'full', +1)}
                  decDisabled={s.full === 0}
                  incDisabled={locked || combined >= cap}
                  note={note}
                />
                {t.half_price_cents != null && (
                  <TierRow
                    label="Meia-entrada"
                    sublabel
                    price={t.half_price_cents}
                    qty={s.half}
                    onDec={() => stepTier(t, 'half', -1)}
                    onInc={() => stepTier(t, 'half', +1)}
                    decDisabled={s.half === 0}
                    incDisabled={locked || combined >= cap}
                  />
                )}
              </div>
            );
          })}

          {error && <ErrorBox>{error}</ErrorBox>}

          {feeCents > 0 && (
            <>
              <div className="pp-summary__row" style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--pp-fg-3)', fontSize: 13 }}>
                <span>Subtotal</span><span>{brl(subtotalCents)}</span>
              </div>
              <div className="pp-summary__row" style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--pp-fg-3)', fontSize: 13, marginTop: 4 }}>
                <span>Taxa de serviço ({(feeBps / 100).toFixed(feeBps % 100 ? 2 : 0)}%)</span><span>{brl(feeCents)}</span>
              </div>
            </>
          )}

          <div className="pp-summary__total" style={{ marginTop: 12 }}>
            <span>Total</span>
            <span>{brl(totalCents)}</span>
          </div>

          {itemCount > 0 && (
            <>
              <div className="pp-field" style={{ marginTop: 16 }}>
                <label className="pp-label">Cupom de desconto (opcional)</label>
                <input
                  className="pp-input"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  placeholder="Tem um cupom?"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button
                  type="button"
                  className={`pp-btn ${method === 'pix' ? 'pp-btn--primary' : 'pp-btn--glass'}`}
                  style={{ flex: 1 }}
                  onClick={() => setMethod('pix')}
                >
                  Pix
                </button>
                <button
                  type="button"
                  className={`pp-btn ${method === 'card' ? 'pp-btn--primary' : 'pp-btn--glass'}`}
                  style={{ flex: 1 }}
                  onClick={() => setMethod('card')}
                >
                  Cartão
                </button>
              </div>

              {method === 'card' && (
                <CardForm
                  amountCents={totalCents}
                  email={user?.email}
                  onChange={(payload, valid) => { setCardPayload(payload); setCardValid(valid); }}
                />
              )}
            </>
          )}

          <button
            className="pp-btn pp-btn--primary pp-btn--block pp-btn--lg"
            style={{ marginTop: 16 }}
            disabled={itemCount === 0 || submitting || (method === 'card' && !cardValid)}
            onClick={handleCheckout}
          >
            {submitting
              ? (method === 'card' ? 'Processando cartão…' : 'Gerando Pix…')
              : itemCount === 0
                ? 'Selecione ingressos'
                : method === 'card'
                  ? `Pagar no cartão · ${brl(totalCents)}`
                  : `Pagar com Pix · ${brl(totalCents)}`}
          </button>
        </aside>
      </div>
    </Page>
  );
}

function TierRow({ label, sublabel, price, qty, onDec, onInc, decDisabled, incDisabled, note }) {
  return (
    <div className="pp-tier" style={sublabel ? { marginTop: 6, opacity: 0.95 } : undefined}>
      <div>
        <div className="pp-tier__name" style={sublabel ? { fontSize: 13, color: 'var(--pp-fg-3)' } : undefined}>{label}</div>
        <div className="pp-tier__price">{brl(price)}</div>
        {note && !sublabel && <div style={{ fontSize: 12, color: 'var(--pp-red)' }}>{note}</div>}
      </div>
      <div className="pp-stepper">
        <button onClick={onDec} disabled={decDisabled} aria-label="diminuir">−</button>
        <span className="qty">{qty}</span>
        <button onClick={onInc} disabled={incDisabled} aria-label="aumentar">+</button>
      </div>
    </div>
  );
}
