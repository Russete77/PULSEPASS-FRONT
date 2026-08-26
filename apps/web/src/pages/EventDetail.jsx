import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Page } from '../components/Layout.jsx';
import { Loading, ErrorBox } from '../components/States.jsx';
import CardForm from '../components/CardForm.jsx';
import { DirectionsButton } from '../components/DirectionsSheet.jsx';
import { Icon } from '../components/Icon.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import { brl, eventDate } from '../lib/format.js';

const emptySel = { full: 0, half: 0 };

// Rótulo em pt-BR da categoria que vem do banco (events.category). O mockup
// mostra três etiquetas no topo do herói — aqui só entra a que existe de
// verdade; "+18" e "Cashless" não têm campo correspondente no evento.
const CATEGORIA_ROTULO = {
  festa: 'Festa', show: 'Show', standup: 'Stand-up', teatro: 'Teatro',
  esporte: 'Esporte', gastronomia: 'Gastronomia', workshop: 'Workshop',
};

// A partir de quantos ingressos restantes o lote passa a mostrar o estoque.
// "12 restantes" apressa a decisão; "428 restantes" é ruído — e gasta o
// recurso justamente para quando ele importa.
const ESTOQUE_BAIXO = 20;

export default function EventDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  // Assentos vindos do mapa. Chegam pelo state da navegação porque a reserva
  // já está no servidor — aqui só se transporta a referência.
  const assentos = useLocation().state?.assentos ?? null;

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
      // Assentos escolhidos no mapa, se a pessoa veio de lá. O servidor
      // confere que a reserva de 8 minutos ainda está viva e é dela — e
      // recusa com 409 se venceu, em vez de cobrar e dar a má notícia
      // depois.
      if (assentos?.length) payload.seat_ids = assentos;
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
      {/* White-label: a cor da produtora vira o acento DESTA página, sem tocar
          no resto do app. Fica no escopo de .pp-detail justamente para não
          vazar para a barra de cima nem para o rodapé — que continuam sendo do
          PulsePass, e é isso que o comprador precisa conseguir distinguir. */}
      <div className="pp-detail"
        style={event.marca?.cor ? { '--pp-pulse': event.marca.cor, '--pp-pulse-hi': event.marca.cor } : undefined}>
        <div className="pp-stack pp-stack-5 pp-reveal">
          {event.marca && (
            <div className="pp-marca">
              {/* Clicável: quem gostou da festa quer ver o que MAIS essa casa
                  vai fazer, e antes esse caminho não existia. */}
              <Link to={`/casa/${event.marca.slug}`} aria-label={`Ver a página de ${event.marca.nome}`}>
                {event.marca.logo_url
                  ? <img src={event.marca.logo_url} alt={event.marca.nome} className="pp-marca__logo" />
                  : <span className="pp-marca__nome">{event.marca.nome}</span>}
              </Link>
              {/* pp-cluster-2 é só o modificador de gap — sem pp-cluster o
                  contêiner não é flex e os links empilham. */}
              <div className="pp-cluster pp-cluster-2">
                <Link to={`/casa/${event.marca.slug}`} className="pp-link pp-link--muted">
                  agenda da casa
                </Link>
                {event.marca.site && (
                  <a href={event.marca.site} target="_blank" rel="noopener noreferrer nofollow"
                    className="pp-link pp-link--muted">site</a>
                )}
                {event.marca.instagram && (
                  <a href={`https://instagram.com/${event.marca.instagram}`}
                    target="_blank" rel="noopener noreferrer nofollow"
                    className="pp-link pp-link--muted">@{event.marca.instagram}</a>
                )}
              </div>
            </div>
          )}
          <div className="pp-hero">
            {event.cover_url && <img src={event.cover_url} alt={event.title} />}
            <div className="pp-hero__in">
              <h1 className="pp-hero__title">{event.title}</h1>
            </div>
          </div>
          {/* As etiquetas do herói agora dizem a verdade sobre ESTE evento.
              Antes eram fixas — "Lista" e "Bar cashless" apareciam em todo
              evento, inclusive nos que não têm nem lista nem bar, e prometer
              cashless para quem vai pagar em dinheiro na porta cria briga no
              balcão. O detalhe público devolve `category` e os lotes; não
              devolve lista nem cardápio, então essas duas saíram. */}
          <div className="pp-feature-chips">
            {CATEGORIA_ROTULO[event.category] && (
              <span className="pp-badge pp-badge--violet">{CATEGORIA_ROTULO[event.category]}</span>
            )}
            {event.tiers.length > 0 && <span className="pp-badge pp-badge--pulse">Ingressos</span>}
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
            <p className="pp-prosa">{event.description}</p>
          )}

          {/* Quando há lugar marcado, a pessoa precisa VER que a compra vai
              com assento — senão parece que a escolha no mapa se perdeu. */}
          {assentos?.length > 0 && (
            <div className="pp-card pp-card--pad pp-realce">
              <div className="pp-between">
                <div>
                  <strong>
                    {assentos.length} {assentos.length === 1 ? 'lugar marcado' : 'lugares marcados'}
                  </strong>
                  <div className="pp-muted pp-t-support pp-mt-1">
                    Reservados por poucos minutos. Conclua a compra para garantir.
                  </div>
                </div>
                <Link to={`/eventos/${slug}/assentos`} className="pp-btn pp-btn--ghost pp-btn--sm">
                  Trocar
                </Link>
              </div>
            </div>
          )}

          <div className="pp-cluster">
            {/* Só oferece o mapa quando a casa tem lugar marcado — o backend
                devolve setores vazios no resto, e um link para uma tela vazia
                é pior que link nenhum. */}
            <Link to={`/eventos/${slug}/assentos`} className="pp-btn pp-btn--glass">
              <Icon name="sofa" size={17} /> Escolher lugar
            </Link>
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
          <div className="pp-eyebrow pp-mb-3">Ingressos</div>

          {event.tiers.map((t) => {
            const s = sel[t.id] ?? emptySel;
            const cap = Math.min(t.max_per_order, t.available);
            const combined = s.full + s.half;
            const st = t.sale_state ?? (t.available <= 0 ? 'sold_out' : 'on_sale');
            const locked = st !== 'on_sale';
            // Escassez só quando é verdade: abaixo do limite, o número real
            // ajuda a decidir. Acima, "restam 428" é ruído — e usar urgência
            // onde ela não existe queima a credibilidade do aviso que importa.
            const note = st === 'upcoming' ? `Vendas a partir de ${eventDate(t.sales_start)}`
              : st === 'ended' ? 'Vendas encerradas'
                : st === 'sold_out' ? 'Esgotado'
                  : t.available > 0 && t.available <= ESTOQUE_BAIXO
                    ? `Restam ${t.available} ${t.available === 1 ? 'ingresso' : 'ingressos'}`
                    : '';
            return (
              <div key={t.id} className="pp-lote">
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

                {/* Lote esgotado: em vez de encerrar a conversa com "Esgotado",
                    oferece a fila. Reembolso e pedido expirado devolvem vaga —
                    sem a fila ela reabre de madrugada sem ninguém pra comprar. */}
                {st === 'sold_out' && <FilaDeEspera slug={event.slug} tier={t} />}
              </div>
            );
          })}

          {error && <ErrorBox>{error}</ErrorBox>}

          {feeCents > 0 && (
            <>
              <div className="pp-summary__row">
                <span>Subtotal</span><span>{brl(subtotalCents)}</span>
              </div>
              <div className="pp-summary__row">
                <span>Taxa de serviço ({(feeBps / 100).toFixed(feeBps % 100 ? 2 : 0)}%)</span><span>{brl(feeCents)}</span>
              </div>
            </>
          )}

          <div className="pp-summary__total pp-mt-3">
            <span>Total</span>
            <span>{brl(totalCents)}</span>
          </div>

          {itemCount > 0 && (
            <>
              <div className="pp-field pp-mt-4">
                <label htmlFor="eventdetai-1" className="pp-label">Cupom de desconto (opcional)</label>
                <input id="eventdetai-1"
                  className="pp-input pp-caixa-alta"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  placeholder="Tem um cupom?"
                />
              </div>

              <div className="pp-row pp-mt-4">
                <button
                  type="button"
                  className={`pp-btn pp-grow ${method === 'pix' ? 'pp-btn--primary' : 'pp-btn--glass'}`}
                  onClick={() => setMethod('pix')}
                >
                  Pix
                </button>
                <button
                  type="button"
                  className={`pp-btn pp-grow ${method === 'card' ? 'pp-btn--primary' : 'pp-btn--glass'}`}
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
            className="pp-btn pp-btn--primary pp-btn--block pp-btn--lg pp-mt-4"
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
    <div className={`pp-tier ${sublabel ? 'pp-tier--meia' : ''}`}>
      <div>
        <div className="pp-tier__name">{label}</div>
        <div className="pp-tier__price">{brl(price)}</div>
        {note && !sublabel && <div className="pp-tier__nota">{note}</div>}
      </div>
      <div className="pp-stepper">
        <button onClick={onDec} disabled={decDisabled} aria-label="diminuir">−</button>
        <span className="qty">{qty}</span>
        <button onClick={onInc} disabled={incDisabled} aria-label="aumentar">+</button>
      </div>
    </div>
  );
}

/**
 * Fila de espera de um lote esgotado.
 *
 * "Esgotado" encerra a conversa e manda o cliente pro cambista. Aqui ele deixa
 * o e-mail e é chamado quando abre vaga — o que acontece o tempo todo, porque
 * reembolso e pedido expirado devolvem ingresso ao estoque.
 *
 * Não exige login de propósito: pedir cadastro na hora da frustração é perder
 * a pessoa. O e-mail basta pra avisar.
 */
function FilaDeEspera({ slug, tier }) {
  const { user } = useAuth();
  const [aberto, setAberto] = useState(false);
  const [email, setEmail] = useState(user?.email ?? '');
  const [nome, setNome] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [pronto, setPronto] = useState(null);   // { ahead, already }
  const [erro, setErro] = useState('');

  async function entrar(e) {
    e.preventDefault();
    setEnviando(true); setErro('');
    try {
      const r = await api.joinWaitlist(slug, {
        ticket_tier_id: tier.id,
        email: email.trim() || undefined,
        name: nome.trim() || undefined,
      });
      setPronto(r);
    } catch (err) { setErro(err.message); } finally { setEnviando(false); }
  }

  if (pronto) {
    return (
      <div className="pp-card pp-card--pad pp-realce pp-mt-3">
        <div className="pp-row pp-accent">
          <Icon name="check" size={16} />
          {pronto.already ? 'Você já está na fila' : 'Pronto, você está na fila'}
        </div>
        <p className="pp-muted pp-t-support pp-mt-2">
          {pronto.ahead === 0
            ? 'Você é o próximo a ser chamado quando abrir vaga.'
            : `Há ${pronto.ahead} pessoa(s) na sua frente.`}
          {' '}Avisamos por e-mail e você terá 1 hora para comprar.
        </p>
      </div>
    );
  }

  if (!aberto) {
    return (
      <button type="button" className="pp-btn pp-btn--glass pp-btn--sm pp-mt-2"
        onClick={() => setAberto(true)}>
        <Icon name="clock" size={14} /> Avise-me se abrir vaga
      </button>
    );
  }

  return (
    <form onSubmit={entrar} className="pp-stack pp-stack-2 pp-mt-3">
      <input className="pp-input" type="email" autoComplete="email" inputMode="email" autoCapitalize="off" autoCorrect="off" spellCheck="false" required placeholder="seu@email.com"
        value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="pp-input" placeholder="Seu nome (opcional)"
        value={nome} onChange={(e) => setNome(e.target.value)} />
      {erro && <span className="pp-erro">{erro}</span>}
      <div className="pp-row">
        <button className="pp-btn pp-btn--primary pp-btn--sm" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar na fila'}
        </button>
        <button type="button" className="pp-btn pp-btn--glass pp-btn--sm"
          onClick={() => setAberto(false)} disabled={enviando}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
