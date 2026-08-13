import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shell, Loading, ErrorBox, BackLink } from '../components/Shell.jsx';
import { Icon } from '@pulsepass/shared/Icon';
import { api } from '../lib/api.js';

/**
 * Marca da produtora (white-label).
 *
 * Casa grande não aceita vender no site de outra marca. Aqui a produtora
 * coloca logo e cor, e a página pública do evento passa a ser dela.
 *
 * A tela é honesta sobre o limite: o rodapé, a política e o processamento do
 * pagamento continuam sendo do PulsePass. Vender "white-label total" e
 * entregar meio é como se perde produtora — melhor dizer na tela o que muda
 * e o que não muda.
 *
 * Layout do design system (BrandingScreen): controles à esquerda, prévia ao
 * vivo à direita dentro de uma moldura de navegador. Do mockup ficaram de
 * fora domínio próprio, paleta de 4 cores, fonte de display e os toggles de
 * personalização avançada — nada disso existe no backend (a organização tem
 * só logo_url, brand_color, site_url e instagram).
 */

const LIMITE_MB = 2;
const ACEITOS = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

/**
 * Sugestões que funcionam sobre fundo escuro — o tema da vitrine é escuro.
 * Aqui o hex é literal DE PROPÓSITO: brand_color é dado gravado no banco
 * (o backend valida /^#[0-9A-Fa-f]{6}$/), não estilo da tela. Os valores
 * espelham a paleta v4 dos tokens.
 */
const CORES = [
  { hex: '#0BE87D', nome: 'verde pulse' },
  { hex: '#22D3EE', nome: 'ciano' },
  { hex: '#A78BFA', nome: 'violeta' },
  { hex: '#FF3D88', nome: 'magenta' },
  { hex: '#FFB800', nome: 'âmbar' },
  { hex: '#FF3B30', nome: 'vermelho' },
];

const PADRAO = '#0BE87D';
/**
 * Valor de --pp-ink-950 (fundo da vitrine pública). Repetido aqui porque a
 * conta de contraste precisa do número, não da variável CSS — é entrada de
 * cálculo, não estilo aplicado na tela.
 */
const FUNDO_VITRINE = '#0C0910';
const HOST_PUBLICO = import.meta.env.VITE_PUBLIC_WEB_URL ?? 'http://localhost:5173';

/** Luminância relativa (WCAG). Usada só pra decidir contraste, não pra enfeitar. */
function luminancia(hex) {
  const m = /^#([0-9a-f]{6})$/i.exec(String(hex ?? '').trim());
  if (!m) return null;
  const canal = (v) => {
    const c = parseInt(v, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = [m[1].slice(0, 2), m[1].slice(2, 4), m[1].slice(4, 6)].map(canal);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export default function Marca() {
  const [org, setOrg] = useState(null);
  const [marca, setMarca] = useState(null);
  const [original, setOriginal] = useState(null);   // pra saber se há mudança pendente
  const [status, setStatus] = useState('loading');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    api.me()
      .then(async (me) => {
        const o = me.organizations?.[0];
        if (!o) { setStatus('sem-org'); return; }
        setOrg(o);
        const b = await api.getBranding(o.id);
        setMarca(b);
        setOriginal(b);
        setStatus('done');
      })
      .catch((e) => { setErro(e.message); setStatus('error'); });
  }, []);

  const set = (campo) => (e) => {
    setMarca((m) => ({ ...m, [campo]: e.target.value }));
    setSalvo(false);
  };

  // Só os três campos editáveis contam como "mudança": o logo salva sozinho
  // no upload, então ele nunca fica pendente de botão.
  const sujo = useMemo(() => {
    if (!marca || !original) return false;
    return ['brand_color', 'site_url', 'instagram']
      .some((c) => (marca[c] ?? '') !== (original[c] ?? ''));
  }, [marca, original]);

  async function salvar() {
    setSalvando(true); setErro('');
    try {
      const atualizado = await api.setBranding(org.id, {
        brand_color: marca.brand_color ?? null,
        site_url: marca.site_url ?? null,
        instagram: marca.instagram ?? null,
      });
      setMarca(atualizado);
      setOriginal(atualizado);
      setSalvo(true);
    } catch (e) { setErro(e.message); }
    finally { setSalvando(false); }
  }

  function reverter() {
    setMarca(original);
    setSalvo(false);
    setErro('');
  }

  async function escolherLogo(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!ACEITOS.includes(file.type)) return setErro('Use PNG, JPG, WebP ou SVG.');
    if (file.size > LIMITE_MB * 1024 * 1024) {
      return setErro(`O arquivo tem ${(file.size / 1048576).toFixed(1)} MB. O limite é ${LIMITE_MB} MB.`);
    }
    setEnviando(true); setErro('');
    try {
      const b = await api.uploadLogo(org.id, file);
      setMarca((m) => ({ ...m, ...b }));
      setOriginal((o) => ({ ...o, logo_url: b.logo_url }));
    } catch (err) { setErro(err.message); }
    finally { setEnviando(false); }
  }

  async function removerLogo() {
    setEnviando(true);
    try {
      const b = await api.removeLogo(org.id);
      setMarca((m) => ({ ...m, ...b }));
      setOriginal((o) => ({ ...o, logo_url: null }));
    } catch (e) { setErro(e.message); }
    finally { setEnviando(false); }
  }

  if (status === 'loading') return <Shell><Loading /></Shell>;
  if (status === 'sem-org') {
    return (
      <Shell>
        <BackLink to="/" label="Eventos" />
        <div className="pp-empty" style={{ maxWidth: 560 }}>
          <div className="pp-empty__icon"><Icon name="crown" size={28} /></div>
          <div className="pp-empty__title">Você ainda não tem produtora</div>
          <p style={{ margin: '0 0 var(--pp-s-4)' }}>
            Crie o primeiro evento — a produtora nasce junto, e a marca fica disponível aqui.
          </p>
          <Link to="/novo" className="ck-btn ck-btn--primary ck-btn--sm">
            <Icon name="plus" size={15} /> Criar evento
          </Link>
        </div>
      </Shell>
    );
  }

  const corHex = marca?.brand_color || PADRAO;
  const lum = luminancia(corHex);
  // Texto do botão acompanha a cor: verde claro pede tinta escura, roxo pede
  // branca. Errar isso é entregar um CTA ilegível pro comprador.
  const tintaCta = lum != null && lum > 0.42 ? 'var(--pp-ink-950)' : 'var(--pp-white)';
  // Cor muito escura some no fundo escuro da vitrine. O aviso é calculado,
  // não chutado: contraste WCAG contra a superfície --pp-ink-950.
  const contrasteFundo = lum != null ? (lum + 0.05) / (luminancia(FUNDO_VITRINE) + 0.05) : null;
  const corApagada = contrasteFundo != null && contrasteFundo < 3;

  return (
    <Shell>
      <BackLink to="/" label="Eventos" />

      <div className="pp-between" style={{ alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--pp-s-4)' }}>
        <div>
          <div className="ck-eyebrow">produtora · white-label</div>
          <h1 className="ck-h1">Sua casa, <span className="pp-accent">sua cara.</span></h1>
        </div>
        {/* Ações no alto, como no mockup: quem mexeu na cor vê o par
            reverter/salvar sem precisar rolar até o fim do formulário. */}
        <div className="pp-row" style={{ gap: 10 }}>
          <button type="button" className="ck-btn ck-btn--glass ck-btn--sm" onClick={reverter} disabled={!sujo || salvando}>
            <Icon name="refresh" size={15} /> Reverter
          </button>
          <button type="button" className="ck-btn ck-btn--primary ck-btn--sm" onClick={salvar} disabled={salvando || !sujo}>
            {salvando ? 'Salvando…' : 'Salvar marca'}
          </button>
        </div>
      </div>

      <p className="ck-sub" style={{ maxWidth: 640 }}>
        O logo e a cor abaixo aparecem para quem compra. O rodapé, a política e o
        pagamento continuam sendo do PulsePass — o comprador precisa saber com quem
        falar se algo der errado.
      </p>

      {/* Confirmação de salvamento em região viva: leitor de tela precisa
          saber que gravou; o botão volta a "Salvar marca" e some sozinho. */}
      <p aria-live="polite" className="pp-mono" style={{ minHeight: 18, margin: '0 0 var(--pp-s-4)', fontSize: 'var(--pp-fs-12)', color: 'var(--pp-pulse)' }}>
        {salvo && !sujo ? 'marca salva ✓' : ''}
      </p>

      {erro && <ErrorBox>{erro}</ErrorBox>}

      <div className="ck-duo" style={{ alignItems: 'start' }}>
        {/* ── Coluna de controles ── */}
        <div className="pp-stack pp-stack-4">
          <section className="ck-panel" aria-label="Logo da produtora">
            <div className="ck-panel__title">Logo</div>
            <p className="ck-panel__sub">é o que aparece no topo da página do evento</p>

            {marca?.logo_url ? (
              <>
                {/* Fundo escuro no preview porque é sobre escuro que ele vai
                    aparecer. Logo que só funciona em fundo branco precisa ser
                    descoberto AQUI, não pela produtora depois de publicar. */}
                <div style={{
                  marginTop: 'var(--pp-s-4)', padding: 'var(--pp-s-5)', borderRadius: 'var(--pp-r-card)',
                  background: 'var(--pp-ink-950)', border: '1px solid var(--pp-edge-2)',
                  display: 'grid', placeItems: 'center', minHeight: 120,
                }}>
                  <img src={marca.logo_url} alt="Logo atual da produtora"
                    style={{ maxHeight: 76, maxWidth: '100%' }} />
                </div>
                <div className="pp-row" style={{ gap: 8, marginTop: 'var(--pp-s-4)', flexWrap: 'wrap' }}>
                  <button className="ck-btn ck-btn--glass ck-btn--sm" disabled={enviando}
                    onClick={() => inputRef.current?.click()}>
                    <Icon name="refresh" size={15} /> {enviando ? 'Enviando…' : 'Trocar logo'}
                  </button>
                  <button className="ck-btn ck-btn--ghost ck-btn--sm" disabled={enviando} onClick={removerLogo}>
                    <Icon name="trash" size={15} /> Remover
                  </button>
                </div>
              </>
            ) : (
              <div style={{
                marginTop: 'var(--pp-s-4)', padding: 'var(--pp-s-5)', borderRadius: 'var(--pp-r-card)',
                background: 'var(--pp-ink-950)', border: '1px dashed var(--pp-edge-3)', textAlign: 'center',
              }}>
                <p className="pp-muted" style={{ fontSize: 'var(--pp-fs-13)', margin: '0 0 var(--pp-s-4)' }}>
                  Sem logo, a página mostra o nome da produtora em texto.
                </p>
                <button className="ck-btn ck-btn--primary ck-btn--sm" disabled={enviando}
                  onClick={() => inputRef.current?.click()}>
                  {enviando ? 'Enviando…' : <><Icon name="plus" size={15} /> Enviar logo</>}
                </button>
              </div>
            )}

            <p className="pp-muted-2" style={{ fontSize: 'var(--pp-fs-12)', marginTop: 'var(--pp-s-3)', marginBottom: 0 }}>
              PNG, JPG, WebP ou SVG, até {LIMITE_MB} MB. Fundo transparente funciona melhor.
            </p>
            <input ref={inputRef} type="file" accept={ACEITOS.join(',')}
              onChange={escolherLogo} style={{ display: 'none' }} />
          </section>

          <section className="ck-panel" aria-label="Cor da marca">
            <div className="ck-panel__title">Cor da marca</div>
            <p className="ck-panel__sub">tinge o botão de comprar e os destaques da página</p>

            {/* Amostra grande + hex, como a paleta do mockup — mas com UM slot,
                que é o único que o backend guarda (brand_color). */}
            <div className="pp-row" style={{ gap: 'var(--pp-s-4)', marginTop: 'var(--pp-s-4)', alignItems: 'stretch' }}>
              <div aria-hidden="true" style={{
                width: 84, borderRadius: 'var(--pp-r-card)', background: corHex,
                border: '1px solid var(--pp-edge-3)', flexShrink: 0,
              }} />
              <div className="pp-grow" style={{ minWidth: 0 }}>
                <div className="ck-field" style={{ marginBottom: 'var(--pp-s-3)' }}>
                  <label className="ck-label" htmlFor="marca-cor">Escolher no seletor</label>
                  <input id="marca-cor" type="color" className="ck-input"
                    style={{ width: 72, padding: 4, height: 44 }}
                    value={/^#[0-9a-f]{6}$/i.test(corHex) ? corHex : PADRAO} onChange={set('brand_color')} />
                </div>
                <div className="ck-field" style={{ marginBottom: 0 }}>
                  <label className="ck-label" htmlFor="marca-hex">Hexadecimal</label>
                  <input id="marca-hex" className="ck-input pp-mono"
                    value={marca?.brand_color ?? ''} onChange={set('brand_color')}
                    placeholder={PADRAO} spellCheck="false" maxLength={7}
                    aria-describedby={corApagada ? 'marca-contraste' : undefined} />
                </div>
              </div>
            </div>

            <div className="ck-label" style={{ marginTop: 'var(--pp-s-4)', marginBottom: 8 }}>Sugestões</div>
            <div className="pp-cluster pp-cluster-2">
              {CORES.map((c) => {
                const ativa = (marca?.brand_color ?? '').toUpperCase() === c.hex;
                return (
                  <button key={c.hex} type="button" title={`${c.nome} · ${c.hex}`}
                    aria-label={`Usar a cor ${c.nome}, ${c.hex}`} aria-pressed={ativa}
                    onClick={() => { setMarca((m) => ({ ...m, brand_color: c.hex })); setSalvo(false); }}
                    style={{
                      width: 36, height: 36, borderRadius: 'var(--pp-r-sm)', background: c.hex, cursor: 'pointer',
                      border: ativa ? '2px solid var(--pp-white)' : '1px solid var(--pp-edge-3)',
                    }} />
                );
              })}
            </div>

            {corApagada && (
              <p id="marca-contraste" className="pp-note" style={{
                marginTop: 'var(--pp-s-4)', borderColor: 'rgba(255,184,0,0.35)', background: 'rgba(255,184,0,0.07)',
              }}>
                <Icon name="clock" size={14} /> Essa cor quase some no fundo escuro da vitrine.
                Veja a prévia ao lado antes de salvar — o botão de comprar precisa saltar.
              </p>
            )}
          </section>

          <section className="ck-panel" aria-label="Links da produtora">
            <div className="ck-panel__title">Onde te encontram</div>
            <p className="ck-panel__sub">aparecem junto do seu nome na página do evento</p>

            <div className="ck-field" style={{ marginTop: 'var(--pp-s-4)' }}>
              <label className="ck-label" htmlFor="marca-site">Site (opcional)</label>
              <input id="marca-site" className="ck-input" type="url" inputMode="url"
                autoCapitalize="off" autoCorrect="off" spellCheck="false"
                value={marca?.site_url ?? ''} onChange={set('site_url')} placeholder="suacasa.com.br"
                aria-describedby="marca-site-dica" />
              <p id="marca-site-dica" className="pp-muted-2" style={{ fontSize: 'var(--pp-fs-12)', margin: 0 }}>
                Pode colar sem https — a gente completa ao salvar.
              </p>
            </div>

            <div className="ck-field" style={{ marginBottom: 0 }}>
              <label className="ck-label" htmlFor="marca-insta">Instagram (opcional)</label>
              <input id="marca-insta" className="ck-input"
                autoCapitalize="off" autoCorrect="off" spellCheck="false"
                value={marca?.instagram ?? ''} onChange={set('instagram')} placeholder="suacasa"
                aria-describedby="marca-insta-dica" />
              <p id="marca-insta-dica" className="pp-muted-2" style={{ fontSize: 'var(--pp-fs-12)', margin: 0 }}>
                Só o nome de usuário, sem arroba.
              </p>
            </div>
          </section>
        </div>

        {/* ── Prévia ao vivo ──
            Sem ela a produtora publica, abre a página e só aí descobre que a
            cor escolhida some no fundo escuro. A moldura de navegador vem do
            mockup; o endereço é o host público real, não um domínio inventado
            (domínio próprio não existe no backend). */}
        <aside className="ck-panel" aria-label="Prévia da página pública">
          <div className="pp-between">
            <div className="ck-eyebrow">Prévia ao vivo</div>
            <span className="ck-badge">como o cliente vê</span>
          </div>

          <div style={{
            marginTop: 'var(--pp-s-4)', borderRadius: 'var(--pp-r-lg)', overflow: 'hidden',
            border: '1px solid var(--pp-edge-2)', background: 'var(--pp-ink-950)',
          }}>
            <div className="pp-row" aria-hidden="true" style={{
              gap: 10, padding: '10px 14px', background: 'var(--pp-ink-900)',
              borderBottom: '1px solid var(--pp-edge-1)',
            }}>
              <span className="pp-row" style={{ gap: 5 }}>
                {['var(--pp-red)', 'var(--pp-amber)', 'var(--pp-pulse)'].map((c) => (
                  <span key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c, opacity: 0.7 }} />
                ))}
              </span>
              <span className="pp-mono pp-truncate" style={{
                flex: 1, padding: '4px 12px', borderRadius: 'var(--pp-r-sm)',
                background: 'rgba(0,0,0,0.35)', fontSize: 'var(--pp-fs-12)', color: 'var(--pp-fg-3)',
              }}>
                {HOST_PUBLICO.replace(/^https?:\/\//, '')}/eventos/…
              </span>
            </div>

            <div style={{ padding: 'var(--pp-s-4) var(--pp-s-5)', borderBottom: '1px solid var(--pp-edge-1)' }}>
              <div className="pp-marca">
                {marca?.logo_url
                  ? <img className="pp-marca__logo" src={marca.logo_url} alt="" />
                  : <strong className="pp-marca__nome" style={{ color: corHex }}>{org?.name}</strong>}
              </div>
            </div>

            <div style={{ padding: 'var(--pp-s-5)' }}>
              <div className="pp-meta">seu evento aqui</div>
              <div style={{
                fontFamily: 'var(--pp-font-display)', fontWeight: 700,
                fontSize: 'var(--pp-fs-24)', letterSpacing: '-0.02em', margin: '4px 0 var(--pp-s-4)',
              }}>
                Nome do seu evento
              </div>
              <button type="button" disabled aria-label="Exemplo do botão de compra, não clicável" style={{
                width: '100%', height: 46, borderRadius: 'var(--pp-r-control)',
                background: corHex, color: tintaCta, border: 0,
                fontWeight: 700, fontSize: 'var(--pp-fs-15)', cursor: 'default', opacity: 1,
              }}>
                Comprar ingresso
              </button>

              {(marca?.site_url || marca?.instagram) && (
                <div className="pp-cluster pp-cluster-2" style={{ marginTop: 'var(--pp-s-4)', justifyContent: 'center' }}>
                  {marca?.site_url && (
                    <span className="ck-badge"><Icon name="external" size={12} /> {marca.site_url.replace(/^https?:\/\//, '')}</span>
                  )}
                  {marca?.instagram && (
                    <span className="ck-badge">@{String(marca.instagram).replace(/^@+/, '')}</span>
                  )}
                </div>
              )}

              <p className="pp-muted-2" style={{ fontSize: 'var(--pp-fs-12)', marginTop: 'var(--pp-s-4)', textAlign: 'center' }}>
                Pagamento processado por PulsePass
              </p>
            </div>
          </div>

          <p className="pp-muted-2" style={{ fontSize: 'var(--pp-fs-12)', marginTop: 'var(--pp-s-4)', marginBottom: 0 }}>
            O evento da prévia é ilustrativo. O que muda de verdade com o que
            está aqui é o logo, a cor do botão e os links — o resto da página
            continua igual pra todo mundo.
          </p>
        </aside>
      </div>
    </Shell>
  );
}
