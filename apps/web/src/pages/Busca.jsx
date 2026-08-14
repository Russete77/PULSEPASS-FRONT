import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Page } from '../components/Layout.jsx';
import { Loading, Empty, ErrorBox } from '../components/States.jsx';
import { Icon } from '../components/Icon.jsx';
import { api } from '../lib/api.js';
import { CATEGORIAS, FLYER_GRADS } from '../lib/catalogo.js';
import { cidadeSalva, salvarCidade } from '../lib/localizacao.js';

/**
 * Busca (SearchScreen).
 *
 * A busca existia dentro da vitrine, dividindo espaço com as trilhas por tempo
 * e com o card de destaque. Quem chega procurando algo específico já sabe o que
 * quer — as trilhas viram ruído, e o campo, que devia ser a coisa mais
 * importante da tela, ficava abaixo de dois blocos de navegação.
 *
 * Aqui o campo é o topo, recebe o foco na entrada e o resto da tela responde a
 * ele. A vitrine continua sendo a tela de "me mostre o que tem".
 *
 * Estado na URL, não só no componente: /busca?q=audio&city=São Paulo é
 * compartilhável, sobrevive ao recarregar e faz o botão "voltar" do navegador
 * desfazer a última busca em vez de sair da tela.
 *
 * O que o desenho traz e NÃO foi portado, por não existir no backend:
 * - Filtros "Próx. 7 dias" e "$ até 100". GET /events só aceita city, q e
 *   category; não há parâmetro de janela de datas nem de faixa de preço, e
 *   filtrar no cliente mentiria sobre a contagem de resultados.
 * - "ordenado por relevância" e o controle de ordenação. O servidor devolve
 *   sempre por data crescente (starts_at) — a linha de contagem diz isso, que
 *   é o que de fato acontece.
 * - As etiquetas "recorrente" e "premium" nos cards. Não existe evento
 *   recorrente nem selo premium no modelo; o que existe é a urgência calculada
 *   a partir do percentual vendido, e é ela que aparece.
 */

const CHAVES = { q: 'q', city: 'city', category: 'category' };

const dataCurta = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const wd = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase();
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  return `${wd} ${dia}/${mes}`;
};
const precoDesde = (cents) => (cents == null ? null : cents === 0 ? 'Grátis' : `R$ ${Math.floor(cents / 100)}`);

/** Linha de resultado: a mesma leitura do desenho — arte, nome, casa, preço. */
function Resultado({ ev, i }) {
  const preco = precoDesde(ev.min_price_cents);
  return (
    <Link
      to={`/eventos/${ev.slug}`}
      className="pp-card pp-card--interactive pp-card--pad"
      style={{ display: 'flex', gap: 'var(--pp-s-3)', alignItems: 'center' }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 72, height: 92, flexShrink: 0, borderRadius: 'var(--pp-r-card)',
          overflow: 'hidden', position: 'relative', border: '1px solid var(--pp-edge-2)',
          background: ev.cover_url ? undefined : FLYER_GRADS[i % FLYER_GRADS.length],
        }}
      >
        {ev.cover_url && (
          <img src={ev.cover_url} alt="" loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <span
          className="pp-mono"
          style={{
            position: 'absolute', top: 6, left: 6, padding: '3px 6px',
            borderRadius: 'var(--pp-r-control)', background: 'var(--pp-ink-950)',
            fontSize: 9, letterSpacing: '0.08em', color: 'var(--pp-fg-2)',
          }}
        >
          {dataCurta(ev.starts_at)}
        </span>
      </div>

      <div className="pp-grow" style={{ minWidth: 0 }}>
        <div
          className="pp-truncate"
          style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 600, fontSize: 'var(--pp-fs-16)' }}
        >
          {ev.title}
        </div>
        <div className="pp-muted-2 pp-truncate" style={{ fontSize: 'var(--pp-fs-12)', marginTop: 4 }}>
          {ev.venue_name ? `${ev.venue_name} · ` : ''}{ev.city}/{ev.state}
        </div>
        {/* Urgência vem calculada do servidor (% vendido). É o único selo que
            corresponde a um número real. */}
        {ev.urgencia && (
          <span
            className={`pp-badge ${ev.urgencia === 'esgotado' ? 'pp-badge--neutral' : 'pp-badge--amber'}`}
            style={{ marginTop: 'var(--pp-s-2)' }}
          >
            {ev.urgencia === 'esgotado' ? 'Esgotado' : `${ev.sold_pct}% vendido`}
          </span>
        )}
      </div>

      {preco && !ev.sold_out && (
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div className="pp-muted-2 pp-mono" style={{ fontSize: 10 }}>desde</div>
          <div className="pp-num" style={{ fontWeight: 700, fontSize: 'var(--pp-fs-16)', marginTop: 2 }}>{preco}</div>
        </div>
      )}
    </Link>
  );
}

export default function Busca() {
  const [params, setParams] = useSearchParams();
  const campoRef = useRef(null);

  const q = params.get(CHAVES.q) ?? '';
  const city = params.get(CHAVES.city) ?? '';
  const category = params.get(CHAVES.category) ?? '';

  // Texto do campo separado da URL: digitar não pode empilhar uma entrada no
  // histórico por tecla. A URL só é atualizada quando a busca de fato dispara.
  const [texto, setTexto] = useState(q);
  const [resultados, setResultados] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [status, setStatus] = useState('idle');
  const [erro, setErro] = useState('');

  // Foco no campo ao abrir: é a única coisa que se faz nesta tela.
  useEffect(() => { campoRef.current?.focus(); }, []);

  // Cidades reais (com evento no ar) alimentam os atalhos do estado vazio.
  useEffect(() => {
    let vivo = true;
    api.listCities().then((c) => vivo && setCidades(c ?? [])).catch(() => {});
    return () => { vivo = false; };
  }, []);

  // A URL manda: qualquer mudança em q/city/category refaz a busca. Sem filtro
  // nenhum não se chama o servidor — devolver o catálogo inteiro numa tela de
  // busca é a lista da vitrine com outro nome.
  useEffect(() => {
    setTexto(q);
    if (!q && !city && !category) { setResultados([]); setStatus('idle'); return; }
    let vivo = true;
    setStatus('loading'); setErro('');
    api.listEvents({ q: q || undefined, city: city || undefined, category: category || undefined })
      .then((r) => { if (vivo) { setResultados(r ?? []); setStatus('done'); } })
      .catch((e) => { if (vivo) { setErro(e.message); setStatus('error'); } });
    return () => { vivo = false; };
  }, [q, city, category]);

  /** Grava o filtro na URL. `replace` para a busca não virar dez voltas no
   *  histórico enquanto a pessoa refina os chips. */
  const aplicar = useCallback((patch, { replace = true } = {}) => {
    const proximo = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v) proximo.set(k, v); else proximo.delete(k);
    }
    setParams(proximo, { replace });
  }, [params, setParams]);

  function submeter(e) {
    e.preventDefault();
    aplicar({ [CHAVES.q]: texto.trim() }, { replace: false });
  }

  function limparTudo() {
    setTexto('');
    setParams(new URLSearchParams(), { replace: false });
    campoRef.current?.focus();
  }

  const temFiltro = Boolean(q || city || category);
  const vazio = status === 'done' && resultados.length === 0;
  const rotuloCategoria = CATEGORIAS.find((c) => c.id === category)?.rotulo ?? '';
  const salva = cidadeSalva();

  return (
    <Page>
      <div className="pp-reveal">
        <div className="pp-eyebrow">busca</div>
        <h1 style={{ margin: '4px 0 0' }}>O que você procura?</h1>

        <form className="pp-searchbar" style={{ marginTop: 'var(--pp-s-4)' }} onSubmit={submeter} role="search">
          <div className="pp-inputwrap">
            <Icon name="search" size={16} />
            <input
              ref={campoRef}
              id="busca-campo"
              className="pp-input"
              type="search"
              autoComplete="off"
              placeholder="Evento, artista ou casa…"
              aria-label="Buscar por evento, artista ou nome da casa"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
          </div>
          <button className="pp-btn pp-btn--primary" type="submit">Buscar</button>
        </form>

        {/* Filtros ativos como chips removíveis: mostra o que está restringindo
            o resultado e dá o caminho de volta no mesmo toque. */}
        {temFiltro && (
          <div className="pp-cluster pp-cluster-2" style={{ marginTop: 'var(--pp-s-3)' }}>
            {q && (
              <button className="pp-chip pp-chip--active" onClick={() => aplicar({ [CHAVES.q]: '' })}
                aria-label={`Remover o termo ${q}`}>
                “{q}” <Icon name="close" size={12} />
              </button>
            )}
            {city && (
              <button className="pp-chip pp-chip--active" onClick={() => aplicar({ [CHAVES.city]: '' })}
                aria-label={`Remover a cidade ${city}`}>
                {city} <Icon name="close" size={12} />
              </button>
            )}
            {category && (
              <button className="pp-chip pp-chip--active" onClick={() => aplicar({ [CHAVES.category]: '' })}
                aria-label={`Remover a categoria ${rotuloCategoria}`}>
                {rotuloCategoria} <Icon name="close" size={12} />
              </button>
            )}
            <button className="pp-link pp-link--muted" onClick={limparTudo}>limpar tudo</button>
          </div>
        )}

        <div className="pp-chiprow" style={{ marginTop: 'var(--pp-s-4)' }}>
          {CATEGORIAS.map((c) => (
            <button
              key={c.id}
              className={`pp-chip ${category === c.id ? 'pp-chip--active' : ''}`}
              aria-pressed={category === c.id}
              // O termo digitado vai junto: trocar de categoria com algo no
              // campo é refinar a busca, não recomeçar. Sem isso o efeito de
              // sincronia com a URL apagava o que a pessoa tinha acabado de
              // escrever e ainda não submetido.
              onClick={() => aplicar({
                [CHAVES.category]: category === c.id ? '' : c.id,
                [CHAVES.q]: texto.trim(),
              })}
            >
              {c.rotulo}
            </button>
          ))}
        </div>
      </div>

      {status === 'error' && <ErrorBox>{erro}</ErrorBox>}
      {status === 'loading' && <Loading label="Procurando…" />}

      {/* Nada digitado ainda. Em vez de uma tela em branco, os caminhos que
          existem de verdade: a cidade que a pessoa já escolheu antes e as
          cidades que têm evento publicado agora (com a contagem). */}
      {status === 'idle' && (
        <section aria-labelledby="busca-sugestoes" style={{ marginTop: 'var(--pp-s-8)' }}>
          <h2 id="busca-sugestoes" className="pp-t-section" style={{ margin: 0 }}>Por onde começar</h2>
          <p className="pp-muted" style={{ fontSize: 'var(--pp-fs-14)', marginTop: 'var(--pp-s-2)' }}>
            Busque pelo nome do evento ou da casa — ou escolha uma cidade.
          </p>

          {salva && (
            <button
              className="pp-btn pp-btn--primary pp-btn--sm"
              style={{ marginTop: 'var(--pp-s-3)' }}
              onClick={() => aplicar({ [CHAVES.city]: salva.city, [CHAVES.q]: texto.trim() }, { replace: false })}
            >
              <Icon name="pin" size={14} /> Ver tudo em {salva.city}
            </button>
          )}

          {cidades.length > 0 && (
            <>
              <div className="pp-label" style={{ margin: 'var(--pp-s-6) 0 var(--pp-s-3)' }}>Cidades com evento no ar</div>
              <div className="pp-cluster pp-cluster-2">
                {cidades.slice(0, 10).map((c) => (
                  <button
                    key={`${c.city}-${c.state}`}
                    className="pp-chip"
                    onClick={() => {
                      // Guarda a escolha: a vitrine lê a mesma preferência.
                      salvarCidade(c);
                      aplicar({ [CHAVES.city]: c.city, [CHAVES.q]: texto.trim() }, { replace: false });
                    }}
                  >
                    {c.city} <span className="pp-muted-2">· {c.eventos}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          <p style={{ marginTop: 'var(--pp-s-8)' }}>
            <Link to="/" className="pp-link">Ou veja a vitrine completa</Link>
          </p>
        </section>
      )}

      {/* Buscou e não veio nada. O estado vazio tem de oferecer a saída mais
          provável: quase sempre é o filtro de cidade que está estreitando
          demais, não o termo. */}
      {vazio && (
        <Empty>
          <div className="pp-empty__icon"><Icon name="search" size={30} /></div>
          <div className="pp-empty__title">
            {q ? <>Nada para “{q}”</> : 'Nada com esses filtros'}
          </div>
          <p>
            {city
              ? <>Não achamos nada em {city}. Procuramos por nome do evento e da casa.</>
              : 'Procuramos por nome do evento e nome da casa. Tente outra palavra.'}
          </p>
          <div className="pp-cluster pp-cluster-2" style={{ justifyContent: 'center', marginTop: 'var(--pp-s-4)' }}>
            {city && (
              <button className="pp-btn pp-btn--primary pp-btn--sm"
                onClick={() => aplicar({ [CHAVES.city]: '' }, { replace: false })}>
                Procurar no Brasil todo
              </button>
            )}
            {category && (
              <button className="pp-btn pp-btn--glass pp-btn--sm"
                onClick={() => aplicar({ [CHAVES.category]: '' }, { replace: false })}>
                Tirar a categoria
              </button>
            )}
            <Link to="/" className="pp-btn pp-btn--glass pp-btn--sm">Ver a vitrine</Link>
          </div>
        </Empty>
      )}

      {status === 'done' && resultados.length > 0 && (
        <>
          {/* A ordem é por data porque é o que o servidor faz — dizer
              "relevância", como no desenho, seria descrever outra coisa. */}
          <div className="pp-eyebrow" role="status" aria-live="polite" style={{ marginTop: 'var(--pp-s-6)' }}>
            <span className="pp-accent">
              {resultados.length} {resultados.length === 1 ? 'resultado' : 'resultados'}
            </span> · em ordem de data
          </div>
          <div className="pp-stack pp-stack-3 pp-reveal-group" style={{ marginTop: 'var(--pp-s-3)' }}>
            {resultados.map((ev, i) => <Resultado key={ev.id} ev={ev} i={i} />)}
          </div>
        </>
      )}
    </Page>
  );
}
