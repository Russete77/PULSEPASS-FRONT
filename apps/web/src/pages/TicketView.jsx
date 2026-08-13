import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Page } from '../components/Layout.jsx';
import { Loading, ErrorBox } from '../components/States.jsx';
import { api } from '../lib/api.js';
import { DirectionsButton } from '../components/DirectionsSheet.jsx';
import { Icon } from '../components/Icon.jsx';
import { brl } from '../lib/format.js';

/**
 * Ingresso individual (spec TicketScreen).
 *
 * O canhoto vira uma grade 2×2 como no desenho: Setor, Código, Titular e —
 * quando existe — o cashless. São os campos que a portaria confere e os que a
 * pessoa mostra quando alguém pergunta "qual é o seu?".
 *
 * O que o desenho traz e não foi portado:
 * - A miniatura do flyer no topo do canhoto continua sendo o bloco de cor do
 *   design system: GET /tickets/:id não devolve events.cover_url (o select de
 *   DETAIL_COLS tem title, venue, cidade e horário, não a capa).
 * - O atalho "Carregar" das ações rápidas: virou a própria linha de cashless,
 *   que já leva para a carteira e só aparece se o evento tiver bar.
 */

const bigDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const wd = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase();
  const day = d.getDate();
  const mo = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();
  const hr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${wd} · ${day} ${mo} · ${hr}`;
};

const horaCurta = (iso) => (iso ? new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '');

/** m:ss — o TTL do token vem do servidor e não é necessariamente menor que 1 min. */
const contagem = (seg) => `${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, '0')}`;

const MOTIVO_SEM_QR = {
  used: 'Este ingresso já foi utilizado na entrada.',
  cancelled: 'Ingresso cancelado. Procure a organização do evento.',
  transferred: 'Você transferiu este ingresso. O QR agora é de quem recebeu.',
};

export default function TicketView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [transferOpen, setTransferOpen] = useState(false);
  const [tEmail, setTEmail] = useState('');
  const [tMsg, setTMsg] = useState('');
  const [tBusy, setTBusy] = useState(false);
  const [qr, setQr] = useState(null); // { qr_data_url, exp, ttl_seconds } — QR rotativo
  const [nowTs, setNowTs] = useState(() => Date.now());
  const [saldo, setSaldo] = useState(null);   // carteira do bar
  const [temBar, setTemBar] = useState(false); // o evento tem cardápio publicado?

  // QR ROTATIVO (anti-golpe): puxa um token curto e re-puxa a cada 15s.
  // Um print vira inútil em segundos porque o token expira (~30s).
  useEffect(() => {
    if (status !== 'done' || ticket?.status !== 'valid') return undefined;
    let alive = true;
    const pull = async () => {
      try { const t = await api.getTicketQrToken(id); if (alive) setQr(t); } catch { /* mantém o anterior */ }
    };
    pull();
    const rotate = setInterval(pull, 15000);
    const tick = setInterval(() => { if (alive) setNowTs(Date.now()); }, 1000);
    return () => { alive = false; clearInterval(rotate); clearInterval(tick); };
  }, [status, ticket?.status, id]);

  async function doTransfer() {
    setTBusy(true);
    setTMsg('');
    try {
      const res = await api.transferTicket(id, tEmail);
      setTMsg(res.message);
      if (res.delivered) setTimeout(() => navigate('/meus-ingressos', { replace: true }), 1500);
    } catch (e) {
      setTMsg(e.message);
    } finally {
      setTBusy(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const t = await api.getTicket(id);
        setTicket(t);
        setStatus('done');
        // Best-effort: sem saldo a linha do cashless some, e o QR — que é o
        // que resolve na porta — aparece do mesmo jeito.
        api.getWallet().then((w) => setSaldo(w.balance_cents ?? 0)).catch(() => {});
        // Cashless não é de todo evento. Anunciar "bar por QR" num evento sem
        // cardápio manda a pessoa recarregar dinheiro que ela não vai usar
        // ali, e o estorno depois é problema da produtora. O cardápio público
        // é a única prova de que o bar existe — sem item disponível, a linha
        // some inteira.
        if (t.events?.slug) {
          api.getEventMenu(t.events.slug)
            .then((m) => setTemBar((m.items ?? []).length > 0))
            .catch(() => setTemBar(false));
        }
      } catch (e) {
        setError(e.message);
        setStatus('error');
      }
    })();
  }, [id]);

  if (status === 'loading') return <Page><Loading /></Page>;
  if (status === 'error') return <Page><ErrorBox>{error}</ErrorBox></Page>;

  const ev = ticket.events ?? {};
  const valid = ticket.status === 'valid';
  const secondsLeft = qr?.exp ? Math.max(0, Math.ceil((qr.exp - nowTs) / 1000)) : null;
  const mostraCashless = valid && temBar && saldo != null;

  return (
    <Page>
      <div className="pp-ticketwrap pp-stack pp-stack-5 pp-reveal">
        <div className="pp-between">
          <h1 className="pp-display" style={{ fontSize: 'var(--pp-fs-24)' }}>Ingresso</h1>
          <span className={`pp-badge ${valid ? 'pp-badge--pulse pp-badge--dot' : 'pp-badge--neutral'}`}>
            {valid ? 'Válido' : ticket.status}
          </span>
        </div>

        <div className="pp-ticketcard">
          <div className="pp-ticketcard__inner">
            <div className="pp-ticketcard__top">
              <div className="pp-grow">
                <div className="pp-ticketcard__date">{bigDate(ev.starts_at)}</div>
                <div className="pp-ticketcard__title">{ev.title}</div>
                <div className="pp-muted" style={{ fontSize: 'var(--pp-fs-12)', marginTop: 4 }}>
                  {ev.venue_name ? `${ev.venue_name} · ` : ''}{ev.city}/{ev.state}
                </div>
              </div>
              <div className="pp-ticketcard__thumb" />
            </div>

            <div className="pp-perf">
              <span className="pp-perf__notch l" />
              <span className="pp-perf__notch r" />
            </div>

            {valid ? (
              <>
                <div className="pp-center" style={{ padding: '8px 0' }}>
                  <div className="pp-qrcard pp-qrcard--sm">
                    {qr?.qr_data_url
                      ? <img src={qr.qr_data_url} alt="QR do ingresso (rotativo)" />
                      : <div className="pp-center" style={{ width: 200, height: 200 }}><div className="pp-spinner" /></div>}
                  </div>
                </div>
                <div className="pp-center" style={{ marginTop: 14 }}>
                  <span className="pp-jwt" role="status" aria-live="off">
                    {secondsLeft != null
                      ? `Código rotativo · expira em ${contagem(secondsLeft)}`
                      : 'Gerando código seguro…'}
                  </span>
                </div>
              </>
            ) : (
              /* Ingresso sem QR não ganha um QR de mentira. O que estava aqui
                 era um quadriculado decorativo — a pessoa apontava a leitora
                 para ele na porta e não entendia por que não passava. */
              <div className="pp-center pp-stack pp-stack-2" style={{ padding: '24px 8px', textAlign: 'center' }}>
                <Icon name="ticket" size={30} />
                <p className="pp-muted" style={{ margin: 0, fontSize: 'var(--pp-fs-14)', lineHeight: 1.5 }}>
                  {MOTIVO_SEM_QR[ticket.status] ?? 'Este ingresso não está válido para entrada.'}
                </p>
              </div>
            )}

            {/* Canhoto em grade 2×2, como no desenho: Setor / Código /
                Titular / Cashless. O titular estava faltando: sem ele,
                ingresso nominal não se distingue de ingresso ao portador na
                hora do check-in, que é justamente quando importa. */}
            <div className="pp-stub">
              <div>
                <div className="pp-stub__k">Setor</div>
                <div className="pp-stub__v">{ticket.ticket_tiers?.name ?? '—'}</div>
              </div>
              <div>
                <div className="pp-stub__k">Código</div>
                <div className="pp-stub__v pp-mono">{ticket.code}</div>
              </div>
              {ticket.holder_name && (
                <div>
                  <div className="pp-stub__k">Titular</div>
                  <div className="pp-stub__v">{ticket.holder_name}</div>
                </div>
              )}
              {/* Hora do check-in: vinha do servidor e não aparecia. É o que
                  responde "eu já entrei?" quando o ingresso está em nome de
                  duas pessoas ou a leitora bipou duas vezes. */}
              {ticket.checked_in_at && (
                <div>
                  <div className="pp-stub__k">Entrada</div>
                  <div className="pp-stub__v">{horaCurta(ticket.checked_in_at)}</div>
                </div>
              )}
            </div>

            {/* Saldo do bar no próprio ingresso.
                Quem chega na festa com o ingresso aberto na mão descobre aqui
                que a carteira está zerada — e recarrega ANTES da fila do bar,
                não nela. Só aparece em evento que tem cardápio. */}
            {mostraCashless && (
              <Link to={saldo > 0 ? `/eventos/${ev.slug}/bar` : '/carteira'} className="pp-ticketcash">
                <span className="pp-grow">
                  <span className="pp-stub__k">Cashless</span>
                  <span className="pp-ticketcash__v">
                    {saldo > 0 ? `${brl(saldo)} carregado` : 'Sem saldo no bar'}
                  </span>
                </span>
                <span className="pp-btn pp-btn--glass pp-btn--sm">
                  {saldo > 0 ? 'Pedir no bar' : 'Recarregar'}
                </span>
              </Link>
            )}
          </div>
        </div>

        {valid && (
          <div className="pp-ticket-actions">
            <button onClick={() => setTransferOpen((v) => !v)} aria-expanded={transferOpen}>
              <Icon name="share" size={18} />
              Transferir
            </button>
            <DirectionsButton venue={ev.venue_name} address={ev.address} city={ev.city} state={ev.state} />
            <button onClick={() => navigate('/meus-ingressos')}>
              <Icon name="ticket" size={18} />
              Meus ingressos
            </button>
          </div>
        )}

        {transferOpen && (
          <div className="pp-card pp-card--pad">
            <label htmlFor="ticketview-1" className="pp-label">E-mail de quem vai receber</label>
            <input id="ticketview-1"
              className="pp-input"
              type="email" autoComplete="email" inputMode="email" autoCapitalize="off" autoCorrect="off" spellCheck="false"
              value={tEmail}
              onChange={(e) => setTEmail(e.target.value)}
              placeholder="amigo@email.com"
              style={{ marginTop: 6 }}
            />
            {tMsg && <p className="pp-note pp-note--pulse" style={{ marginTop: 10, color: 'var(--pp-pulse)' }} role="status">{tMsg}</p>}
            <div className="pp-row" style={{ marginTop: 12 }}>
              <button
                className={`pp-btn pp-btn--primary pp-grow ${tBusy ? 'is-loading' : ''}`}
                disabled={tBusy || !tEmail.includes('@')}
                onClick={doTransfer}
              >
                Enviar ingresso
              </button>
              <button className="pp-btn pp-btn--glass" onClick={() => setTransferOpen(false)}>Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
}
