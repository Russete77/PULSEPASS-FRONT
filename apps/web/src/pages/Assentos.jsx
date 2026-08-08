import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Page } from '../components/Layout.jsx';
import { Loading, Empty, ErrorBox } from '../components/States.jsx';
import { Icon } from '../components/Icon.jsx';
import { api } from '../lib/api.js';
import { brl } from '../lib/format.js';

/**
 * Escolha de assento.
 *
 * A regra que sustenta a tela inteira é a reserva temporária: assim que a
 * pessoa toca numa poltrona, o servidor a segura por 8 minutos. Sem isso,
 * duas pessoas escolhem o mesmo lugar e uma descobre no pagamento — que é o
 * pior momento possível para dar essa notícia.
 *
 * A reserva VENCE de propósito. Prender o assento até alguém decidir pagar
 * daria a qualquer um o poder de esgotar a casa de graça.
 */

const CORES = {
  free: { fundo: 'var(--pp-glass-3)', borda: 'var(--pp-edge-3)', texto: 'var(--pp-fg-2)' },
  meu: { fundo: 'var(--pp-pulse)', borda: 'transparent', texto: 'var(--pp-pulse-ink)' },
  held: { fundo: 'var(--pp-glass-1)', borda: 'var(--pp-edge-1)', texto: 'var(--pp-fg-5)' },
  sold: { fundo: 'var(--pp-glass-1)', borda: 'var(--pp-edge-1)', texto: 'var(--pp-fg-5)' },
  blocked: { fundo: 'transparent', borda: 'transparent', texto: 'transparent' },
};

function estadoDo(a) {
  if (a.meu) return 'meu';
  return a.status;
}

export default function Assentos() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [mapa, setMapa] = useState(null);
  const [status, setStatus] = useState('loading');
  const [erro, setErro] = useState('');
  const [escolhidos, setEscolhidos] = useState([]);   // ids
  const [expiraEm, setExpiraEm] = useState(null);
  const [restam, setRestam] = useState(null);
  const [reservando, setReservando] = useState(false);
  const relogio = useRef(null);

  const carregar = useCallback(async () => {
    try {
      const m = await api.seatMap(slug);
      setMapa(m);
      // Reconcilia com o servidor: se a reserva venceu enquanto a aba estava
      // em segundo plano, os assentos voltam a aparecer livres e a seleção
      // local precisa acompanhar.
      const meus = m.setores.flatMap((s) => s.fileiras.flatMap((f) => f.assentos)).filter((a) => a.meu);
      setEscolhidos(meus.map((a) => a.id));
      setStatus('done');
    } catch (e) { setErro(e.message); setStatus('error'); }
  }, [slug]);

  useEffect(() => { carregar(); }, [carregar]);

  // Contagem regressiva da reserva. Ao zerar, recarrega o mapa: os assentos
  // já voltaram para todo mundo, e mostrar o contrário seria mentir.
  useEffect(() => {
    if (!expiraEm) { setRestam(null); return undefined; }
    relogio.current = setInterval(() => {
      const s = Math.max(0, Math.round((new Date(expiraEm) - Date.now()) / 1000));
      setRestam(s);
      if (s === 0) { clearInterval(relogio.current); setExpiraEm(null); carregar(); }
    }, 1000);
    return () => clearInterval(relogio.current);
  }, [expiraEm, carregar]);

  // Solta o que estava segurando ao sair da tela. Sem isso, quem abre o mapa,
  // escolhe e fecha a aba deixa a poltrona presa por 8 minutos à toa.
  useEffect(() => () => { api.releaseSeats(slug).catch(() => {}); }, [slug]);

  async function alternar(assento) {
    if (assento.status !== 'free' && !assento.meu) return;
    const novo = escolhidos.includes(assento.id)
      ? escolhidos.filter((x) => x !== assento.id)
      : [...escolhidos, assento.id];

    setEscolhidos(novo);
    setErro('');

    if (novo.length === 0) {
      setExpiraEm(null);
      await api.releaseSeats(slug).catch(() => {});
      return carregar();
    }

    setReservando(true);
    try {
      const r = await api.holdSeats(slug, novo);
      setExpiraEm(r.expira_em);
      await carregar();
    } catch (e) {
      setErro(e.message);
      await carregar();     // devolve a verdade do servidor
    } finally { setReservando(false); }
  }

  if (status === 'loading') return <Page><Loading label="Abrindo o mapa da casa…" /></Page>;
  if (status === 'error') return <Page><ErrorBox>{erro}</ErrorBox></Page>;

  const semAssentos = !mapa?.setores?.length;
  const porId = new Map(
    mapa?.setores?.flatMap((s) => s.fileiras.flatMap((f) => f.assentos.map((a) => [a.id, { ...a, setor: s }]))) ?? [],
  );
  const total = escolhidos.reduce((soma, id) => soma + (porId.get(id)?.setor.preco_cents ?? 0), 0);
  const mm = restam != null ? String(Math.floor(restam / 60)).padStart(2, '0') : null;
  const ss = restam != null ? String(restam % 60).padStart(2, '0') : null;

  return (
    <Page>
      <Link to={`/eventos/${slug}`} className="pp-btn pp-btn--ghost pp-btn--sm">
        <Icon name="arrowLeft" size={16} /> Voltar ao evento
      </Link>

      <div className="pp-eyebrow" style={{ marginTop: 'var(--pp-s-4)' }}>ingresso numerado</div>
      <h1>Escolha seu lugar</h1>
      {mapa?.evento?.casa && <p className="sub">{mapa.evento.casa}</p>}

      {erro && <ErrorBox>{erro}</ErrorBox>}

      {semAssentos ? (
        <Empty>
          <div className="pp-empty__icon"><Icon name="sofa" size={30} /></div>
          <div className="pp-empty__title">Este evento não tem lugar marcado</div>
          <p>A entrada é por ordem de chegada — compre o ingresso direto na página do evento.</p>
          <Link to={`/eventos/${slug}`} className="pp-btn pp-btn--primary pp-btn--sm"
            style={{ marginTop: 'var(--pp-s-4)' }}>
            Ver ingressos
          </Link>
        </Empty>
      ) : (
        <>
          <div className="pp-palco">PALCO</div>

          {mapa.setores.map((s) => (
            <section key={s.nome} className="pp-setor">
              <div className="pp-between" style={{ marginBottom: 'var(--pp-s-3)' }}>
                <div>
                  <div className="pp-setor__nome">{s.nome}</div>
                  <div className="pp-meta">{s.livres} de {s.total} livres</div>
                </div>
                <div className="pp-money" style={{ fontSize: 20 }}>{brl(s.preco_cents)}</div>
              </div>

              <div className="pp-setor__grade">
                {s.fileiras.map((f) => (
                  <div key={f.fileira} className="pp-fileira">
                    <span className="pp-fileira__nome">{f.fileira}</span>
                    {f.assentos.map((a) => {
                      const e = estadoDo(a);
                      const c = CORES[e] ?? CORES.free;
                      const ocupado = e === 'held' || e === 'sold';
                      return (
                        <button
                          key={a.id}
                          className="pp-assento"
                          onClick={() => alternar(a)}
                          disabled={ocupado || reservando}
                          aria-pressed={e === 'meu'}
                          aria-label={`Fileira ${f.fileira}, assento ${a.numero}${ocupado ? ', ocupado' : e === 'meu' ? ', escolhido por você' : ', livre'}`}
                          title={`${f.fileira}${a.numero}`}
                          style={{ background: c.fundo, borderColor: c.borda, color: c.texto }}
                        >
                          {a.numero}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* Legenda: sem ela, cinza-claro e cinza-escuro viram adivinhação. */}
          <div className="pp-cluster" style={{ marginTop: 'var(--pp-s-5)' }}>
            {[['free', 'Livre'], ['meu', 'Seu'], ['sold', 'Ocupado']].map(([k, r]) => (
              <span key={k} className="pp-cluster-2" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <i style={{
                  width: 14, height: 14, borderRadius: 4, display: 'inline-block',
                  background: CORES[k].fundo, border: `1px solid ${CORES[k].borda}`,
                }} />
                <span className="pp-muted" style={{ fontSize: 13 }}>{r}</span>
              </span>
            ))}
          </div>
        </>
      )}

      {escolhidos.length > 0 && (
        <div className="pp-barbar">
          <div className="pp-barbar__in">
            <div className="pp-grow">
              <div className="lbl">
                {escolhidos.length} {escolhidos.length === 1 ? 'assento' : 'assentos'}
                {escolhidos.map((id) => {
                  const a = porId.get(id);
                  return a ? ` · ${a.setor.nome} ${a.numero}` : '';
                }).join('')}
              </div>
              <div className="val">{brl(total)}</div>
              {/* O relógio é a informação mais importante da barra. Some da
                  vista e a pessoa perde o lugar sem entender por quê. */}
              {mm && (
                <div style={{ fontSize: 12, color: restam < 60 ? '#FF6B61' : 'var(--pp-amber)', marginTop: 2 }}>
                  reservado por mais {mm}:{ss}
                </div>
              )}
            </div>
            <button className="pp-btn pp-btn--primary pp-btn--lg"
              disabled={reservando}
              onClick={() => navigate(`/eventos/${slug}`, { state: { assentos: escolhidos } })}>
              Continuar <Icon name="arrowRight" size={16} />
            </button>
          </div>
        </div>
      )}
    </Page>
  );
}
