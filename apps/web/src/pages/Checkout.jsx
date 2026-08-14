import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Page } from '../components/Layout.jsx';
import { Loading, ErrorBox } from '../components/States.jsx';
import { Icon } from '@pulsepass/shared/Icon';
import { api } from '../lib/api.js';
import { brl } from '../lib/format.js';

/**
 * Pagamento (passo 3 de 3).
 *
 * Layout da CheckoutPixScreen: nav + stepper, o título, o RELÓGIO, o QR, o
 * copia-e-cola e o resumo do pedido. O relógio estava desenhado no mockup,
 * tinha classe pronta no CSS (.pp-countdown) e nunca foi ligado — enquanto o
 * backend devolve `pix_expiration` desde sempre. Sem ele a pessoa não sabe se
 * tem cinco minutos ou o dia inteiro para pagar, e "não sei quanto tempo
 * tenho" é o que faz fechar a aba.
 *
 * O que o desenho traz e não foi portado:
 * - Título do evento no resumo ("Festival do Sol · 30 nov"). GET /orders/:id
 *   devolve `orders.*` + order_items, sem join em events — faltaria
 *   `events(title)` no select de findOrderForUser. Em vez de escrever "Seu
 *   pedido" (que era o que estava aqui e não é o nome de nada), o resumo
 *   mostra o que É real: quantos ingressos, de quais lotes, por quanto.
 * - A miniatura do flyer continua sendo o bloco de cor do design system:
 *   cover_url não vem nesta resposta.
 */

const DEV = import.meta.env.DEV;

/** "1h 04m" / "04:38" — a unidade muda porque o Pix da Asaas vence em horas. */
function formatarRestante(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function Checkout() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [agora, setAgora] = useState(() => Date.now());
  const pollRef = useRef(null);

  async function refresh() {
    const data = await api.getOrder(orderId);
    setOrder(data);
    setStatus('done');
    if (data.status === 'paid') {
      clearInterval(pollRef.current);
      // Confirmado vai para a tela de sucesso, não direto para a lista: era
      // aqui que a compra terminava sem ninguém nunca ler "deu certo".
      // `replace` continua: voltar para um Pix já pago não leva a lugar nenhum.
      navigate(`/pedido/${orderId}/confirmado`, { replace: true });
    }
    return data;
  }

  useEffect(() => {
    refresh().catch((e) => {
      setError(e.message);
      setStatus('error');
    });
    // polling: aguarda confirmação do pagamento (webhook → status paid)
    pollRef.current = setInterval(() => {
      refresh().catch(() => {});
    }, 5000);
    return () => clearInterval(pollRef.current);
  }, [orderId]);

  // Relógio de 1s só para o contador. Separado do polling de propósito: bater
  // no servidor a cada segundo para mover um número na tela seria absurdo.
  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  async function copyPix() {
    if (!order?.pix_payload) return;
    await navigator.clipboard.writeText(order.pix_payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function simulate() {
    try {
      await api.simulatePaid(orderId);
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  }

  if (status === 'loading') return <Page><Loading label="Carregando pagamento…" /></Page>;
  if (status === 'error') return <Page><ErrorBox>{error}</ErrorBox></Page>;

  const qrSrc = order.pix_qr_base64
    ? `data:image/png;base64,${order.pix_qr_base64}`
    : null;

  // Pix é o caminho padrão, mas cartão em análise cai AQUI também (checkout
  // devolve status pending e o EventDetail navega para cá do mesmo jeito).
  // Sem esta distinção a tela dizia "Pague com Pix" e girava um spinner de QR
  // eterno para quem já tinha passado o cartão.
  const temPix = Boolean(order.pix_payload);

  const vence = order.pix_expiration ? Date.parse(order.pix_expiration) : NaN;
  const restanteMs = Number.isFinite(vence) ? vence - agora : null;
  const expirado = restanteMs != null && restanteMs <= 0;

  const itens = order.order_items ?? [];
  const totalIngressos = itens.reduce((s, i) => s + (i.quantity ?? 0), 0);

  return (
    <Page>
      <div className="pp-checkout pp-reveal">
        <div className="pp-checkout__nav">
          <button className="pp-btn pp-btn--glass pp-btn--icon pp-btn--sm" onClick={() => navigate(-1)} aria-label="voltar"><Icon name="arrowLeft" size={18} /></button>
          <span className="title">Pagamento · 3 de 3</span>
          <span className="pp-tag-secure">SEGURO</span>
        </div>

        <div className="pp-steps">
          <span className="bar on" /><span className="bar on" /><span className="bar on" />
        </div>

        <div className="pp-eyebrow">{expirado ? 'Cobrança vencida' : 'Aguardando pagamento'}</div>
        {temPix ? (
          <h1>Pague com Pix<br /><span className="accent">e seu ingresso é seu.</span></h1>
        ) : (
          <h1>Cartão em análise<br /><span className="accent">é rápido, prometemos.</span></h1>
        )}

        {/* Prazo real da cobrança, não um número decorativo. Some quando o
            servidor não mandou expiração — inventar um relógio que não
            corresponde a nada é pior que não ter relógio. */}
        {temPix && restanteMs != null && (
          <div style={{ marginTop: 'var(--pp-s-4)' }}>
            <span className="pp-countdown" role="status" aria-live="polite">
              <Icon name="clock" size={14} />
              {expirado ? 'Pix expirado' : `${formatarRestante(restanteMs)} para pagar`}
            </span>
          </div>
        )}

        <div className="pp-stack pp-stack-5" style={{ marginTop: 'var(--pp-s-6)', alignItems: 'center' }}>
          {temPix && !expirado && (
            <>
              <div className="pp-qrcard">
                {qrSrc ? <img src={qrSrc} alt="QR Code Pix" /> : <div className="pp-spinner" />}
              </div>

              <div className="pp-pixcode" style={{ width: '100%' }}>
                <code>{order.pix_payload}</code>
                <button className="pp-btn pp-btn--primary pp-btn--sm" onClick={copyPix}>
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </>
          )}

          {temPix && expirado && (
            <div className="pp-card pp-card--pad" style={{ width: '100%', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 'var(--pp-fs-14)', color: 'var(--pp-fg-2)', lineHeight: 1.5 }}>
                Este Pix venceu e não pode mais ser pago. O lugar volta para o
                estoque — refaça a compra na página do evento.
              </p>
              <Link to="/" className="pp-btn pp-btn--primary pp-btn--block" style={{ marginTop: 'var(--pp-s-4)' }}>
                Voltar para os eventos
              </Link>
            </div>
          )}

          {/* Resumo do pedido: quantidade e lote saem de order_items, que é o
              que o servidor devolve. Nome do evento não vem nesta rota. */}
          <div className="pp-ordersum" style={{ width: '100%' }}>
            <div className="pp-ordersum__thumb" />
            <div className="pp-grow" style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 'var(--pp-fs-14)' }}>
                {totalIngressos > 0
                  ? `${totalIngressos} ${totalIngressos === 1 ? 'ingresso' : 'ingressos'}`
                  : 'Seu pedido'}
              </div>
              {itens.length > 0 && (
                <div className="pp-muted" style={{ fontSize: 'var(--pp-fs-12)', marginTop: 2 }}>
                  {itens.map((i) => `${i.quantity}× ${i.ticket_tiers?.name ?? 'Ingresso'}`).join(' · ')}
                </div>
              )}
            </div>
            <div className="pp-ordersum__price">{brl(order.total_cents)}</div>
          </div>

          {/* Desconto entra porque sem ele o total parece errado: a pessoa viu
              um preço na página do evento e paga outro aqui. */}
          {order.discount_cents > 0 && (
            <div className="pp-summary__row" style={{ width: '100%', margin: 0 }}>
              <span>Cupom {order.coupon_code ? `· ${order.coupon_code}` : 'aplicado'}</span>
              <span style={{ color: 'var(--pp-pulse)' }}>− {brl(order.discount_cents)}</span>
            </div>
          )}

          {!expirado && (
            <p className="pp-muted" style={{ textAlign: 'center', fontSize: 'var(--pp-fs-13)' }} role="status" aria-live="polite">
              <span className="pp-spinner pp-spinner--sm" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 8 }} />
              {temPix
                ? 'A confirmação chega aqui em até 30 segundos. Você pode fechar a página.'
                : 'Assim que o banco aprovar, seus ingressos aparecem em Meus ingressos.'}
            </p>
          )}

          {DEV && (
            <button className="pp-btn pp-btn--glass pp-btn--block" onClick={simulate}>
              (dev) Simular pagamento confirmado
            </button>
          )}
        </div>
      </div>
    </Page>
  );
}
