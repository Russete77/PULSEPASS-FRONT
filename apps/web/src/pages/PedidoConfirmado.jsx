import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Page } from '../components/Layout.jsx';
import { Loading, ErrorBox } from '../components/States.jsx';
import { Icon } from '../components/Icon.jsx';
import { api } from '../lib/api.js';
import { brl } from '../lib/format.js';

/**
 * Pedido confirmado (OrderSuccessScreen).
 *
 * Antes o Checkout despejava a pessoa direto em /meus-ingressos assim que o
 * polling via status 'paid'. Funcionava, mas engolia o único momento da compra
 * que merece uma tela: a confirmação. Quem pagou por Pix fica olhando um QR e
 * de repente está numa lista — sem nunca ler "deu certo".
 *
 * Esta tela NÃO mexe em pagamento: ela só existe depois que o pedido já está
 * pago. Se alguém chegar aqui com pedido pendente, volta para o checkout.
 *
 * De onde vem cada dado:
 * - GET /orders/:id → status, total, desconto/cupom, order_items com o nome do
 *   lote. Esta rota NÃO faz join em events, então o nome do evento não vem dela.
 * - GET /tickets → os ingressos emitidos, com `order_id` e o evento embutido
 *   (título, casa, cidade, data, capa). É daqui que sai o card do ingresso.
 *
 * O que o desenho traz e NÃO foi portado, por não existir no backend:
 * - "Adicionar à Agenda" e "Apple Wallet". Não há geração de .ics nem de passe
 *   PassKit em lugar nenhum da API — os dois botões seriam decoração clicável.
 * - "Compartilhar". Idem: não existe link público de comprovante para dividir.
 * - O e-mail do comprovante impresso no card. A entrega por e-mail acontece de
 *   verdade (o pagamento confirmado dispara deliverTickets), mas o endereço não
 *   volta em nenhuma das duas respostas — então a tela afirma o envio sem
 *   cravar para qual endereço.
 * - O confete. É enfeite, não dado; fica fora para a tela abrir rápido no
 *   celular de quem acabou de pagar em pé na fila.
 */

const bigDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const wd = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase();
  const mo = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();
  const hr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${wd} · ${d.getDate()} ${mo} · ${hr}`;
};

export default function PedidoConfirmado() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [ingressos, setIngressos] = useState([]);
  const [status, setStatus] = useState('loading');
  const [erro, setErro] = useState('');

  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const order = await api.getOrder(orderId);
        if (!vivo) return;
        // Chegar aqui com pedido não pago só acontece por URL colada ou botão
        // "voltar". O certo é devolver ao checkout, que é quem sabe cobrar —
        // esta tela não decide nada sobre pagamento.
        if (order.status !== 'paid') {
          navigate(`/checkout/${orderId}`, { replace: true });
          return;
        }
        setPedido(order);
        // A falha ao listar ingressos não derruba a confirmação: o pagamento
        // deu certo de qualquer jeito, e é isso que a pessoa precisa saber.
        const todos = await api.myTickets().catch(() => []);
        if (!vivo) return;
        setIngressos((todos ?? []).filter((t) => t.order_id === orderId));
        setStatus('done');
      } catch (e) {
        if (vivo) { setErro(e.message); setStatus('error'); }
      }
    })();
    return () => { vivo = false; };
  }, [orderId, navigate]);

  if (status === 'loading') return <Page><Loading label="Confirmando seu pedido…" /></Page>;
  if (status === 'error') return <Page><ErrorBox>{erro}</ErrorBox></Page>;

  const itens = pedido.order_items ?? [];
  const totalIngressos = itens.reduce((s, i) => s + (i.quantity ?? 0), 0);
  // Todos os ingressos de um pedido são do mesmo evento (place_order é por
  // evento), então o primeiro basta para nomear a compra.
  const evento = ingressos[0]?.events ?? null;
  const umSo = ingressos.length === 1;

  return (
    <Page>
      <div className="pp-success pp-reveal">
        <div className="pp-success__icon">
          <Icon name="check" size={32} strokeWidth={3} />
        </div>
        {/* role=status para o leitor de tela anunciar o desfecho, que é a
            informação inteira desta página. */}
        <div className="pp-eyebrow" role="status">Pagamento aprovado</div>
        <h2>
          {totalIngressos > 1 ? 'Seus ingressos chegaram.' : 'Seu ingresso chegou.'}
        </h2>
        <p className="pp-muted pp-t-support pp-folha--estreita">
          {evento
            ? <>Guardamos o seu lugar em <strong>{evento.title}</strong>. Apresente o QR na entrada.</>
            : 'Seu pagamento foi confirmado. Os ingressos já estão na sua carteira.'}
        </p>
      </div>

      <div className="pp-stack pp-stack-3 pp-folha">
        {/* Card do ingresso — só aparece quando o ingresso já existe do lado do
            servidor. A emissão é atômica com a confirmação, mas se por algum
            motivo ainda não voltou na lista, o resumo do pedido abaixo já
            sustenta a tela sozinho. */}
        {evento && (
          /* A capa na proporcao de cartaz, a mesma de toda superficie que
             mostra evento. Era um quadrado de 64 — a arte do flyer aparecia
             cortada nos dois lados justo na tela que celebra a compra. */
          <div className="pp-card pp-card--pad pp-linha">
            {evento.cover_url && (
              <div className="pp-capa" aria-hidden="true">
                <img src={evento.cover_url} alt="" />
              </div>
            )}
            <div className="pp-grow">
              <div className="pp-meta">{bigDate(evento.starts_at)}</div>
              <div className="pp-truncate pp-t-section pp-mt-1">{evento.title}</div>
              <div className="pp-muted-2 pp-truncate pp-linha__apoio">
                {evento.venue_name ? `${evento.venue_name} · ` : ''}{evento.city}/{evento.state}
              </div>
            </div>
          </div>
        )}

        {/* Códigos dos ingressos: é o que a pessoa procura se o e-mail sumir e
            o que ela confere na porta. Vem de tickets.code. */}
        {ingressos.length > 0 && (
          <div className="pp-card pp-card--pad">
            <div className="pp-label pp-mb-2">
              {ingressos.length > 1 ? `${ingressos.length} ingressos` : 'Ingresso'}
            </div>
            <ul className="pp-stack pp-stack-1 pp-lista-nua">
              {ingressos.map((t) => (
                <li key={t.id} className="pp-between">
                  <span className="pp-truncate pp-t-support">
                    {t.ticket_tiers?.name ?? 'Ingresso'}
                    {t.holder_name ? ` · ${t.holder_name}` : ''}
                  </span>
                  {/* Codigo do ingresso: dado tecnico, e o unico lugar
                      desta tela onde o mono tem funcao. */}
                  <span className="pp-mono pp-muted-2 pp-t-label">{t.code}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Resumo financeiro. O desconto entra porque sem ele o total parece
            errado para quem usou cupom. */}
        <div className="pp-card pp-card--pad">
          <div className="pp-label pp-mb-2">Pedido</div>
          {itens.length > 0 && (
            <div className="pp-muted pp-t-support">
              {itens.map((i) => `${i.quantity}× ${i.ticket_tiers?.name ?? 'Ingresso'}`).join(' · ')}
            </div>
          )}
          {pedido.discount_cents > 0 && (
            <div className="pp-summary__row pp-mt-2">
              <span>Cupom {pedido.coupon_code ? `· ${pedido.coupon_code}` : 'aplicado'}</span>
              <span className="pp-accent">− {brl(pedido.discount_cents)}</span>
            </div>
          )}
          {/* Total no papel de dinheiro: e o numero que a pessoa confere. */}
          <div className="pp-summary__total pp-mt-3">
            <span>Total pago</span>
            <span>{brl(pedido.total_cents)}</span>
          </div>
        </div>

        {/* O envio por e-mail acontece de verdade na confirmação do pagamento;
            o endereço não volta nesta resposta, por isso não é impresso. */}
        <p className="pp-muted-2 pp-t-support pp-tc pp-m0">
          Enviamos os ingressos e o comprovante para o e-mail da sua conta.
        </p>

        <div className="pp-stack pp-stack-3 pp-mt-3">
          {umSo ? (
            <Link to={`/ingresso/${ingressos[0].id}`} className="pp-btn pp-btn--primary pp-btn--block pp-btn--lg">
              Abrir meu ingresso <Icon name="arrowRight" size={16} />
            </Link>
          ) : (
            <Link to="/meus-ingressos" className="pp-btn pp-btn--primary pp-btn--block pp-btn--lg">
              Ver meus ingressos <Icon name="arrowRight" size={16} />
            </Link>
          )}
          <Link to="/meus-pedidos" className="pp-btn pp-btn--glass pp-btn--block">
            Ver o pedido
          </Link>
          <Link to="/" className="pp-link pp-link--muted pp-tc">
            Explorar outros eventos
          </Link>
        </div>
      </div>
    </Page>
  );
}
