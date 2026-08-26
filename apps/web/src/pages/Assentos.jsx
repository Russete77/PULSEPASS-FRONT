import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Page } from '../components/Layout.jsx';
import { Loading, Empty, ErrorBox } from '../components/States.jsx';
import { Icon } from '../components/Icon.jsx';
import { api } from '../lib/api.js';
import { brl } from '../lib/format.js';

/**
 * Escolha de assento.
 *
 * Layout tirado da SeatMapScreen do design-system: palco no topo, fileiras
 * CENTRALIZADAS (é o que faz o desenho parecer uma casa de espetáculo e não
 * uma planilha), assento pequeno e denso, legenda no cabeçalho, e um painel
 * com os lugares escolhidos que se pode desfazer um a um.
 *
 * A regra que sustenta a tela é a reserva temporária: tocar numa poltrona a
 * segura por 8 minutos no servidor. Sem isso duas pessoas escolhem o mesmo
 * lugar e uma descobre no pagamento — o pior momento possível. E ela vence de
 * propósito: prender assento até alguém decidir pagar daria a qualquer um o
 * poder de esgotar a casa de graça.
 */

/**
 * Estado visual do assento.
 *
 * Os três estados se separam por LUMINÂNCIA, não por matiz. A primeira versão
 * usava branco a 10% para livre e 4% para vendido: 1,17:1 de contraste, ou
 * seja, indistinguíveis — e "quais posso comprar" é a única pergunta que a
 * tela existe para responder.
 *
 * O desenho original dava um matiz por setor. Aqui só o SEU assento recebe
 * cor; livre e vendido se distinguem por claro contra quase-invisível. Menos
 * matiz na tela e mais contraste onde ele decide a compra.
 */
const CORES = {
  free: { fundo: 'rgba(255,255,255,0.40)', borda: 'rgba(255,255,255,0.62)' },
  meu: { fundo: 'var(--pp-pulse)', borda: 'var(--pp-pulse)' },
  held: { fundo: 'rgba(255,255,255,0.03)', borda: 'rgba(255,255,255,0.08)' },
  sold: { fundo: 'rgba(255,255,255,0.03)', borda: 'rgba(255,255,255,0.08)' },
  blocked: { fundo: 'transparent', borda: 'transparent' },
};

const estadoDo = (a) => (a.meu ? 'meu' : a.status);

export default function Assentos() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [mapa, setMapa] = useState(null);
  const [status, setStatus] = useState('loading');
  const [erro, setErro] = useState('');
  const [escolhidos, setEscolhidos] = useState([]);
  const [expiraEm, setExpiraEm] = useState(null);
  const [restam, setRestam] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const relogio = useRef(null);

  const carregar = useCallback(async () => {
    try {
      const m = await api.seatMap(slug);
      setMapa(m);
      // Reconcilia com o servidor: se a reserva venceu com a aba em segundo
      // plano, os lugares voltaram ao mapa e a seleção local tem que seguir.
      const meus = m.setores.flatMap((s) => s.fileiras.flatMap((f) => f.assentos)).filter((a) => a.meu);
      setEscolhidos(meus.map((a) => a.id));
      setStatus('done');
    } catch (e) { setErro(e.message); setStatus('error'); }
  }, [slug]);

  useEffect(() => { carregar(); }, [carregar]);

  useEffect(() => {
    if (!expiraEm) { setRestam(null); return undefined; }
    relogio.current = setInterval(() => {
      const s = Math.max(0, Math.round((new Date(expiraEm) - Date.now()) / 1000));
      setRestam(s);
      if (s === 0) { clearInterval(relogio.current); setExpiraEm(null); carregar(); }
    }, 1000);
    return () => clearInterval(relogio.current);
  }, [expiraEm, carregar]);

  // Solta o que estava segurando ao sair. Sem isso, quem abre o mapa, escolhe
  // e fecha a aba deixa a poltrona presa 8 minutos à toa.
  useEffect(() => () => { api.releaseSeats(slug).catch(() => {}); }, [slug]);

  const porId = useMemo(() => new Map(
    mapa?.setores?.flatMap((s) => s.fileiras.flatMap(
      (f) => f.assentos.map((a) => [a.id, { ...a, fileira: f.fileira, setor: s }]),
    )) ?? [],
  ), [mapa]);

  async function sincronizar(novo) {
    setEscolhidos(novo);
    setErro('');
    if (novo.length === 0) {
      setExpiraEm(null);
      await api.releaseSeats(slug).catch(() => {});
      return carregar();
    }
    setOcupado(true);
    try {
      const r = await api.holdSeats(slug, novo);
      setExpiraEm(r.expira_em);
      await carregar();
    } catch (e) {
      setErro(e.message);
      await carregar();          // devolve a verdade do servidor
    } finally { setOcupado(false); }
  }

  const alternar = (a) => {
    if (a.status !== 'free' && !a.meu) return;
    sincronizar(escolhidos.includes(a.id)
      ? escolhidos.filter((x) => x !== a.id)
      : [...escolhidos, a.id]);
  };

  if (status === 'loading') return <Page><Loading label="Abrindo o mapa da casa…" /></Page>;
  if (status === 'error') return <Page><ErrorBox>{erro}</ErrorBox></Page>;

  const semAssentos = !mapa?.setores?.length;
  const total = escolhidos.reduce((s, id) => s + (porId.get(id)?.setor.preco_cents ?? 0), 0);
  const mm = restam != null ? String(Math.floor(restam / 60)).padStart(2, '0') : null;
  const ss = restam != null ? String(restam % 60).padStart(2, '0') : null;

  return (
    <Page>
      <Link to={`/eventos/${slug}`} className="pp-btn pp-btn--ghost pp-btn--sm">
        <Icon name="arrowLeft" size={16} /> Voltar ao evento
      </Link>

      {semAssentos ? (
        <Empty>
          <div className="pp-empty__icon"><Icon name="sofa" size={30} /></div>
          <div className="pp-empty__title">Este evento não tem lugar marcado</div>
          <p>A entrada é por ordem de chegada — o ingresso se compra direto na página do evento.</p>
          <Link to={`/eventos/${slug}`} className="pp-btn pp-btn--primary pp-btn--sm pp-mt-4">
            Ver ingressos
          </Link>
        </Empty>
      ) : (
        <div className="pp-seatwrap">
          {/* ── Mapa ── */}
          <div className="pp-seatmap">
            <header className="pp-seatmap__head">
              <div>
                <div className="pp-eyebrow">ingresso numerado</div>
                <h1 className="pp-titulo-sob">
                  Escolha seu lugar
                  {mapa.evento.casa && <> · <span className="pp-accent">{mapa.evento.casa}</span></>}
                </h1>
              </div>
              {/* Legenda no cabeçalho, como no desenho: cinza-claro contra
                  cinza-escuro seria adivinhação sem ela. */}
              <div className="pp-seatlegend">
                {[['free', 'Disponível'], ['meu', 'Seu'], ['sold', 'Vendido']].map(([k, r]) => (
                  <span key={k}>
                    <i style={{ background: CORES[k].fundo, borderColor: CORES[k].borda }} />
                    {r}
                  </span>
                ))}
              </div>
            </header>

            <div className="pp-palco"><span>PALCO</span></div>

            {mapa.setores.map((s) => (
              <section key={s.nome} className="pp-setor">
                {/* Preço junto do nome do setor: são a mesma decisão. */}
                <div className="pp-setor__cab">
                  {s.nome} · {brl(s.preco_cents)}
                  <span className="pp-setor__livres">{s.livres} de {s.total} livres</span>
                </div>

                <div className="pp-setor__scroll">
                  <div className="pp-setor__grade">
                    {s.fileiras.map((f) => (
                      <div key={f.fileira} className="pp-fileira">
                        <span className="pp-fileira__nome">{f.fileira}</span>
                        {f.assentos.map((a) => {
                          const e = estadoDo(a);
                          const c = CORES[e] ?? CORES.free;
                          const travado = e === 'held' || e === 'sold' || e === 'blocked';
                          return (
                            <button key={a.id} className="pp-assento"
                              onClick={() => alternar(a)}
                              disabled={travado || ocupado}
                              aria-pressed={e === 'meu'}
                              aria-label={`Fileira ${f.fileira}, assento ${a.numero}, ${travado ? 'ocupado' : e === 'meu' ? 'escolhido por você' : 'livre'}`}
                              title={`${f.fileira}${a.numero} · ${brl(s.preco_cents)}`}
                              style={{ background: c.fundo, borderColor: c.borda }} />
                          );
                        })}
                        <span className="pp-fileira__nome">{f.fileira}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </div>

          {/* ── Seleção ──
              Painel à direita no desktop, folha fixa embaixo no celular. Cada
              assento sai sozinho: quem escolheu quatro e errou um não pode ser
              obrigado a recomeçar. */}
          <aside className="pp-seatside">
            <div className="pp-seatside__in">
              <div className="pp-eyebrow">seus assentos · {escolhidos.length}</div>

              {escolhidos.length === 0 ? (
                <p className="pp-muted pp-t-support pp-mt-3">
                  Toque numa poltrona livre para começar.
                </p>
              ) : (
                <>
                  <ul className="pp-seatlist">
                    {escolhidos.map((id) => {
                      const a = porId.get(id);
                      if (!a) return null;
                      return (
                        <li key={id}>
                          <span className="pp-grow">
                            <b>{a.fileira}{a.numero}</b>
                            <span className="pp-muted-2"> · {a.setor.nome}</span>
                          </span>
                          <span className="pp-num">{brl(a.setor.preco_cents)}</span>
                          <button className="pp-seatlist__x"
                            onClick={() => sincronizar(escolhidos.filter((x) => x !== id))}
                            disabled={ocupado}
                            aria-label={`Remover assento ${a.fileira}${a.numero}`}>
                            <Icon name="close" size={13} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  {/* O relógio é a informação mais importante daqui. Some da
                      vista e a pessoa perde o lugar sem entender por quê. */}
                  {mm && (
                    <div className="pp-seattimer" data-urgente={restam < 60 ? 'sim' : 'nao'}>
                      <Icon name="clock" size={14} />
                      assentos reservados por mais {mm}:{ss}
                    </div>
                  )}

                  <div className="pp-between pp-mt-4">
                    <span className="pp-muted">
                      Total · {escolhidos.length} {escolhidos.length === 1 ? 'assento' : 'assentos'}
                    </span>
                    <span className="pp-money">{brl(total)}</span>
                  </div>

                  {erro && <ErrorBox>{erro}</ErrorBox>}

                  <button className="pp-btn pp-btn--primary pp-btn--block pp-btn--lg pp-mt-4"
                    disabled={ocupado}
                    onClick={() => navigate(`/eventos/${slug}`, { state: { assentos: escolhidos } })}>
                    Continuar <Icon name="arrowRight" size={16} />
                  </button>
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </Page>
  );
}
