import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Page } from '../components/Layout.jsx';
import { Loading, Empty, ErrorBox } from '../components/States.jsx';
import { api } from '../lib/api.js';
import { Icon } from '../components/Icon.jsx';
import { cidadeSalva, salvarCidade, detectarCidade, CIDADES_CONHECIDAS } from '../lib/localizacao.js';
import { CATEGORIAS, FLYER_GRADS } from '../lib/catalogo.js';

/**
 * Vitrine.
 *
 * Antes era uma lista só, ordenada por data, com dois chips de cidade fixos.
 * Isso responde "o que existe", que não é a pergunta de quem abre o app — a
 * pergunta é "o que eu faço hoje, perto de mim".
 *
 * A tela agora responde nessa ordem: onde você está → o que é urgente → o que
 * é hoje → o fim de semana → o resto. Cada trilha só aparece se tiver algo
 * dentro; seção vazia com título é pior que seção ausente.
 */

const bigDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const wd = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase();
  const mo = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();
  const hr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${wd} · ${d.getDate()} ${mo} · ${hr}`;
};
const shortTag = (iso) => (iso ? new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '').toUpperCase() : '');
const priceLabel = (cents) => (cents == null ? '' : cents === 0 ? 'Grátis' : `R$ ${Math.floor(cents / 100)}+`);

/** "Sex · 22 nov" — a mesma linha da HomeScreen desenhada. */
function hojeExtenso() {
  const d = new Date();
  const wd = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
  const mo = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  return `${wd[0].toUpperCase()}${wd.slice(1)} · ${d.getDate()} ${mo}`;
}

// ── Faixas de tempo ──
// Calculadas sobre o relógio local de quem está olhando, não em UTC: "hoje"
// para quem abre o app às 23h precisa ser o dia dela, não o do servidor.
const inicioDoDia = (offsetDias = 0) => {
  const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + offsetDias);
  return d.getTime();
};

function fatiarPorTempo(eventos) {
  const agora = Date.now();
  const fimDeHoje = inicioDoDia(1);
  // Fim de semana = da próxima sexta 18h até a segunda 6h.
  const hoje = new Date();
  const diasAteSexta = (5 - hoje.getDay() + 7) % 7;
  const sexta = new Date(); sexta.setHours(18, 0, 0, 0); sexta.setDate(sexta.getDate() + diasAteSexta);
  const segunda = new Date(sexta); segunda.setDate(sexta.getDate() + 3); segunda.setHours(6, 0, 0, 0);

  const dentro = (t, a, b) => t >= a && t < b;
  const acontecendo = [], deHoje = [], deFimDeSemana = [], resto = [];

  for (const ev of eventos) {
    const t = Date.parse(ev.starts_at);
    if (!Number.isFinite(t)) { resto.push(ev); continue; }
    // "Acontece agora": começou nas últimas 6h. O backend já entrega esses
    // eventos justamente para a festa não sumir da vitrine no meio dela.
    if (t <= agora) acontecendo.push(ev);
    else if (t < fimDeHoje) deHoje.push(ev);
    else if (dentro(t, sexta.getTime(), segunda.getTime())) deFimDeSemana.push(ev);
    else resto.push(ev);
  }
  return { acontecendo, deHoje, deFimDeSemana, resto };
}

function Flyer({ ev, i, rank }) {
  return (
    <Link to={`/eventos/${ev.slug}`} className="pp-flyer">
      <div className="pp-flyer__art" style={ev.cover_url ? undefined : { background: FLYER_GRADS[i % FLYER_GRADS.length] }}>
        {ev.cover_url && <img src={ev.cover_url} alt="" loading="lazy" />}
        {rank ? <span className="pp-flyer__rank">{rank}</span> : <span className="pp-flyer__tag">{shortTag(ev.starts_at)}</span>}
        {/* Urgência vem do backend (≥70% vendido). É o que faz decidir agora. */}
        {ev.urgencia && (
          <span className={`pp-flyer__urg pp-flyer__urg--${ev.urgencia}`}>
            {ev.urgencia === 'esgotado' ? 'Esgotado' : `${ev.sold_pct}% vendido`}
          </span>
        )}
        <div className="pp-flyer__body">
          <div className="pp-flyer__title">{ev.title}</div>
          <div className="pp-flyer__meta">
            {ev.venue_name ? `${ev.venue_name} · ` : ''}{ev.city}/{ev.state}
          </div>
          {ev.min_price_cents != null && (
            <div className="pp-flyer__price">{ev.sold_out ? 'Esgotado' : priceLabel(ev.min_price_cents)}</div>
          )}
        </div>
      </div>
    </Link>
  );
}

/** Trilha só existe se tiver conteúdo — título sem nada embaixo é ruído. */
function Trilha({ titulo, legenda, eventos, inicio = 0 }) {
  if (!eventos.length) return null;
  return (
    <section className="pp-mt-8">
      {/* Eyebrow ACIMA do título, como na HomeScreen: a etiqueta em mono
          caixa-alta é o degrau que separa uma trilha da outra quando três
          delas se sucedem na mesma rolagem. Embaixo do título ela virava
          legenda e o olho perdia o corte entre as seções. */}
      <div className="pp-between pp-baseline pp-mb-4">
        <div>
          {legenda && <div className="pp-eyebrow">{legenda}</div>}
          <h2 className={`pp-t-section ${legenda ? 'pp-mt-1' : ''}`}>{titulo}</h2>
        </div>
        <span className="pp-muted-2 pp-num pp-t-support">{eventos.length}</span>
      </div>
      {/* pp-grid e não pp-grid-auto: o desenho é de DUAS colunas no telefone.
          O auto-fill de 240px colapsa para uma coluna em 375px e a vitrine
          vira uma lista vertical de cartazes gigantes. */}
      <div className="pp-grid">
        {eventos.map((ev, i) => <Flyer key={ev.id} ev={ev} i={inicio + i} />)}
      </div>
    </section>
  );
}

export default function Discover() {
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [cidade, setCidade] = useState(cidadeSalva());
  const [categoria, setCategoria] = useState(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('loading');
  const [erro, setErro] = useState('');
  const [trocandoCidade, setTrocandoCidade] = useState(false);
  const [detectando, setDetectando] = useState(false);

  const carregar = useCallback(async (filtros) => {
    setStatus('loading'); setErro('');
    try {
      setEventos(await api.listEvents(filtros));
      setStatus('done');
    } catch (e) { setErro(e.message); setStatus('error'); }
  }, []);

  // Descobrir a cidade uma vez, na primeira visita. Escolha manual anterior
  // sempre ganha do GPS: quem trocou de propósito não quer ser corrigido.
  useEffect(() => {
    let vivo = true;
    api.listCities().then((c) => vivo && setCidades(c)).catch(() => {});
    if (cidadeSalva()) return () => { vivo = false; };
    setDetectando(true);
    detectarCidade().then((c) => {
      if (!vivo) return;
      setDetectando(false);
      if (c) { setCidade(c); salvarCidade(c); }
    });
    return () => { vivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A vitrine navega por cidade e categoria. O termo digitado não filtra mais
  // aqui: ele leva para /busca, que é a tela que existe para isso.
  useEffect(() => {
    carregar({ city: cidade?.city, category: categoria });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cidade?.city, categoria]);

  const { acontecendo, deHoje, deFimDeSemana, resto } = useMemo(
    () => fatiarPorTempo(eventos), [eventos],
  );
  // O destaque é o mais urgente, não o mais próximo no calendário: card de
  // capa serve para converter, e o que converte é o que está acabando.
  const destaque = useMemo(() => {
    if (!eventos.length) return null;
    const candidatos = eventos.filter((e) => !e.sold_out);
    if (!candidatos.length) return eventos[0];
    return [...candidatos].sort((a, b) => (b.sold_pct ?? 0) - (a.sold_pct ?? 0))[0];
  }, [eventos]);

  const semNada = status === 'done' && eventos.length === 0;

  function escolherCidade(c) {
    setCidade(c); salvarCidade(c); setTrocandoCidade(false);
  }

  async function usarMinhaLocalizacao() {
    setDetectando(true);
    const c = await detectarCidade();
    setDetectando(false);
    if (c) escolherCidade(c);
    else setErro('Não conseguimos a sua localização. Escolha a cidade na lista.');
  }

  return (
    <Page>
      <div className="pp-reveal">
        <div className="pp-between pp-top">
          <div>
            <div className="pp-meta">{hojeExtenso()}</div>
            <h1 className="pp-titulo-sob">
              {cidade ? <>O que rola em <span className="pp-accent">{cidade.city}</span></> : 'O que vai rolar'}
            </h1>
          </div>
        </div>

        {/* Cidade: a primeira decisão da tela, e por isso a primeira coisa
            clicável. Antes era um chip perdido no meio dos filtros. */}
        <div className="pp-cluster pp-cluster-2 pp-mt-3">
          <button className="pp-btn pp-btn--glass pp-btn--sm"
            onClick={() => setTrocandoCidade((v) => !v)}
            aria-expanded={trocandoCidade}>
            <Icon name="pin" size={14} />
            {detectando ? 'Localizando…' : cidade ? `${cidade.city}/${cidade.state}` : 'Todo o Brasil'}
            <Icon name="chevronDown" size={13} />
          </button>
          {cidade && (
            <button className="pp-link pp-link--muted" onClick={() => { setCidade(null); salvarCidade(null); }}>
              ver o Brasil todo
            </button>
          )}
        </div>

        {trocandoCidade && (
          <div className="pp-card pp-card--pad pp-mt-3">
            <button className="pp-btn pp-btn--ghost pp-btn--sm pp-btn--block" onClick={usarMinhaLocalizacao}>
              <Icon name="pin" size={14} /> Usar minha localização
            </button>
            {/* Só cidades com evento no ar. Oferecer uma lista fixa de
                capitais levaria a pessoa a um "nada por aqui". */}
            <div className="pp-cluster pp-cluster-2 pp-mt-4">
              {(cidades.length ? cidades : CIDADES_CONHECIDAS.slice(0, 8)).map((c) => (
                <button key={`${c.city}-${c.state}`}
                  className={`pp-chip ${cidade?.city === c.city ? 'pp-chip--active' : ''}`}
                  onClick={() => escolherCidade(c)}>
                  {c.city}
                  {c.eventos != null && <span className="pp-muted-2"> · {c.eventos}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* O campo aqui é a PORTA da busca, não a busca. Quem digita um nome
            quer uma lista de resultados, e não a vitrine reordenada por trás
            do card de destaque e das trilhas de tempo — por isso o submit
            entrega o termo (e os filtros já escolhidos) para /busca. */}
        <form className="pp-searchbar pp-mt-4" role="search"
          onSubmit={(e) => {
            e.preventDefault();
            const p = new URLSearchParams();
            if (q.trim()) p.set('q', q.trim());
            if (cidade?.city) p.set('city', cidade.city);
            if (categoria) p.set('category', categoria);
            navigate(`/busca${p.toString() ? `?${p}` : ''}`);
          }}>
          <div className="pp-inputwrap">
            <Icon name="search" size={16} />
            <input className="pp-input" placeholder="Buscar evento, artista, casa…"
              value={q} onChange={(e) => setQ(e.target.value)}
              type="search" autoComplete="off" aria-label="Buscar evento, artista ou casa" />
          </div>
          <button className="pp-btn pp-btn--glass" type="submit">Buscar</button>
        </form>

        <div className="pp-chiprow pp-mt-4">
          <button className={`pp-chip ${categoria === null ? 'pp-chip--active' : ''}`} onClick={() => setCategoria(null)}>
            Tudo
          </button>
          {CATEGORIAS.map((c) => (
            <button key={c.id} className={`pp-chip ${categoria === c.id ? 'pp-chip--active' : ''}`}
              onClick={() => setCategoria(categoria === c.id ? null : c.id)}>
              {c.rotulo}
            </button>
          ))}
        </div>
      </div>

      {erro && <ErrorBox>{erro}</ErrorBox>}
      {status === 'loading' && <Loading />}

      {semNada && (
        <Empty>
          <div className="pp-empty__icon"><Icon name="music" size={30} /></div>
          <div className="pp-empty__title">
            {categoria
              ? 'Nada nessa categoria'
              : cidade ? `Nada em ${cidade.city} por enquanto` : 'Nenhum evento publicado ainda'}
          </div>
          <p>
            {categoria
              ? 'Tente outra categoria ou procure pelo nome.'
              : cidade ? 'Veja o que está rolando no resto do país.' : 'Volte em breve.'}
          </p>
          <div className="pp-cluster pp-cluster-2 pp-centro pp-mt-4">
            {categoria && (
              <button className="pp-btn pp-btn--glass pp-btn--sm" onClick={() => setCategoria(null)}>
                Limpar categoria
              </button>
            )}
            {cidade && (
              <button className="pp-btn pp-btn--primary pp-btn--sm" onClick={() => { setCidade(null); salvarCidade(null); }}>
                Ver o Brasil todo
              </button>
            )}
          </div>
        </Empty>
      )}

      {status === 'done' && destaque && (
        /* Um bloco só: a arte é o cartaz e o texto se apoia nela. A barra de
           vidro que ficava colada embaixo era o "cartão genérico ao lado da
           arte" — separava a informação da peça que faz querer ir. */
        <Link to={`/eventos/${destaque.slug}`} className="pp-featured pp-reveal pp-mt-6">
          <div className="pp-featured__art">
            {destaque.cover_url && <img src={destaque.cover_url} alt="" />}
            <span className="pp-featured__live">
              {destaque.urgencia === 'esgotando' ? `Esgotando · ${destaque.sold_pct}% vendido` : 'Vendas abertas'}
            </span>
            <div className="pp-featured__info">
              <div>
                <div className="pp-featured__date">{bigDate(destaque.starts_at)}</div>
                <div className="pp-featured__title">{destaque.title}</div>
              </div>
              <div className="pp-featured__foot">
                <div className="pp-grow">
                  <div className="pp-featured__venue">{destaque.venue_name ? `${destaque.venue_name} · ` : ''}{destaque.city}/{destaque.state}</div>
                  <div className="pp-featured__meta">
                    {destaque.min_price_cents != null ? `a partir de ${priceLabel(destaque.min_price_cents)}` : 'Ingressos · Lista · Bar'}
                  </div>
                </div>
                <span className="pp-btn pp-btn--primary pp-btn--sm">Comprar <Icon name="arrowRight" size={15} /></span>
              </div>
            </div>
          </div>
        </Link>
      )}

      {status === 'done' && (
        <>
          <Trilha titulo="Acontece agora" legenda="começou há pouco" eventos={acontecendo} />
          <Trilha titulo="Hoje" eventos={deHoje} inicio={acontecendo.length} />
          <Trilha titulo="Este fim de semana" eventos={deFimDeSemana} inicio={acontecendo.length + deHoje.length} />
          <Trilha
            titulo={cidade ? `Mais em ${cidade.city}` : 'Próximos'}
            eventos={resto}
            inicio={acontecendo.length + deHoje.length + deFimDeSemana.length}
          />
        </>
      )}
    </Page>
  );
}
