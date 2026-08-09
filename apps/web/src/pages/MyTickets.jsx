import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Page } from '../components/Layout.jsx';
import { Loading, Empty, ErrorBox } from '../components/States.jsx';
import { api } from '../lib/api.js';
import { Icon } from '../components/Icon.jsx';

/**
 * Carteira de ingressos.
 *
 * Layout da MyTicketsScreen: o PRÓXIMO ingresso em destaque no topo, o resto
 * em lista abaixo. A ordem importa — quem abre esta tela quase sempre está
 * indo para um evento agora, não navegando o histórico.
 *
 * O que o desenho traz e não foi portado: a faixa de fidelidade ("Pulse Gold ·
 * cashback 5%"). Não existe programa de fidelidade no produto, e desenhar
 * cashback na tela seria prometer dinheiro que ninguém vai pagar.
 */

const bigDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const wd = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase();
  const mo = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();
  const hr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${wd} · ${d.getDate()} ${mo} · ${hr}`;
};

const STATUS_LABEL = { valid: 'Válido', used: 'Utilizado', cancelled: 'Cancelado', transferred: 'Transferido' };
const STATUS_CLS = { valid: 'pp-badge--pulse pp-badge--dot', used: 'pp-badge--neutral', cancelled: 'pp-badge--red', transferred: 'pp-badge--violet' };

/**
 * "Ao vivo" = começou e ainda não passou de 8 horas.
 *
 * É o estado que mais muda o comportamento: com o evento rolando, a pessoa
 * quer o QR na mão em um toque, não uma lista para procurar.
 */
function estaRolando(iso) {
  if (!iso) return false;
  const t = Date.parse(iso);
  const agora = Date.now();
  return t <= agora && agora - t < 8 * 3600 * 1000;
}
const ehFuturo = (iso) => iso && Date.parse(iso) > Date.now();

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [aba, setAba] = useState('proximos');

  useEffect(() => {
    (async () => {
      try { setTickets(await api.myTickets()); setStatus('done'); }
      catch (e) { setError(e.message); setStatus('error'); }
    })();
  }, []);

  const { destaque, proximos, passados } = useMemo(() => {
    const validos = tickets.filter((t) => t.status === 'valid');
    // Ao vivo primeiro; depois o que começa mais cedo.
    const ordenados = [...validos].sort((a, b) => {
      const ra = estaRolando(a.events?.starts_at), rb = estaRolando(b.events?.starts_at);
      if (ra !== rb) return ra ? -1 : 1;
      return Date.parse(a.events?.starts_at ?? 0) - Date.parse(b.events?.starts_at ?? 0);
    });
    const futuros = ordenados.filter((t) => estaRolando(t.events?.starts_at) || ehFuturo(t.events?.starts_at));
    return {
      destaque: futuros[0] ?? null,
      proximos: futuros.slice(1),
      passados: tickets.filter((t) => !futuros.includes(t)),
    };
  }, [tickets]);

  const lista = aba === 'proximos' ? proximos : passados;
  const noites = destaque ? proximos.length + 1 : 0;

  return (
    <Page>
      <div className="pp-reveal">
        <div className="pp-eyebrow">sua carteira</div>
        <h1>
          {noites > 0
            ? `${noites} ${noites === 1 ? 'noite pela frente' : 'noites pela frente'}`
            : 'Meus ingressos'}
        </h1>
      </div>

      {status === 'loading' && <Loading />}
      {status === 'error' && <ErrorBox>{error}</ErrorBox>}

      {status === 'done' && tickets.length === 0 && (
        <Empty>
          <div className="pp-empty__icon"><Icon name="ticket" size={30} /></div>
          <div className="pp-empty__title">Nenhum ingresso ainda</div>
          <p>Bora achar um rolê? <Link to="/" className="pp-link">Explorar eventos</Link></p>
        </Empty>
      )}

      {/* Destaque: o ingresso que a pessoa vai usar a seguir. Card grande,
          com o QR a um toque — não é uma linha de lista. */}
      {status === 'done' && destaque && (
        <Link to={`/ingresso/${destaque.id}`} className="pp-tktnext pp-reveal">
          <div className="pp-tktnext__art">
            {destaque.events?.cover_url && <img src={destaque.events.cover_url} alt="" />}
            {estaRolando(destaque.events?.starts_at) && (
              <span className="pp-tktnext__live">
                <span className="pp-pulse-dot" /> Ao vivo · QR pronto
              </span>
            )}
          </div>
          <div className="pp-tktnext__body">
            <div className="pp-meta">{bigDate(destaque.events?.starts_at)}</div>
            <div className="pp-tktnext__title">{destaque.events?.title}</div>
            <div className="pp-muted" style={{ fontSize: 13, marginTop: 2 }}>
              {destaque.events?.venue_name ? `${destaque.events.venue_name} · ` : ''}
              {destaque.ticket_tiers?.name}
            </div>
            <span className="pp-btn pp-btn--primary pp-btn--block" style={{ marginTop: 'var(--pp-s-4)' }}>
              Abrir ingresso <Icon name="arrowRight" size={16} />
            </span>
          </div>
        </Link>
      )}

      {status === 'done' && tickets.length > 0 && (proximos.length > 0 || passados.length > 0) && (
        <>
          <div className="pp-segmented" style={{ margin: 'var(--pp-s-7) 0 var(--pp-s-4)' }}>
            <button className={aba === 'proximos' ? 'active' : ''} onClick={() => setAba('proximos')}>
              Próximas noites · {proximos.length}
            </button>
            <button className={aba === 'passados' ? 'active' : ''} onClick={() => setAba('passados')}>
              Passados · {passados.length}
            </button>
          </div>

          {lista.length === 0 ? (
            <p className="pp-muted" style={{ fontSize: 14 }}>
              {aba === 'proximos' ? 'Só o ingresso em destaque acima.' : 'Nenhum evento passado ainda.'}
            </p>
          ) : (
            <div className="pp-tktlist pp-reveal-group">
              {lista.map((t) => (
                <Link key={t.id} to={`/ingresso/${t.id}`} className="pp-card pp-card--interactive pp-tkt">
                  <div className="pp-tkt__thumb">{t.events?.title?.slice(0, 2).toUpperCase()}</div>
                  <div className="pp-grow">
                    <div className="pp-tkt__date">{bigDate(t.events?.starts_at)}</div>
                    <div className="pp-tkt__title">{t.events?.title}</div>
                    {/* Casa + setor na mesma linha, como no desenho: é assim
                        que a pessoa reconhece qual ingresso é qual quando tem
                        dois do mesmo evento. */}
                    <div className="pp-tkt__tier">
                      {t.events?.venue_name ? `${t.events.venue_name} · ` : ''}{t.ticket_tiers?.name}
                    </div>
                  </div>
                  <span className={`pp-badge ${STATUS_CLS[t.status] ?? 'pp-badge--neutral'}`}>
                    {STATUS_LABEL[t.status] ?? t.status}
                  </span>
                  <Icon name="chevronRight" size={18} className="pp-tkt__chev" />
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </Page>
  );
}
