import { useEffect, useRef, useState } from 'react';
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
 */

const LIMITE_MB = 2;
const ACEITOS = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

/** Sugestões que funcionam sobre fundo escuro — o tema da vitrine é escuro. */
const CORES = ['#0BE87D', '#22D3EE', '#A78BFA', '#FF3D88', '#FFB800', '#FF6B61'];

export default function Marca() {
  const [org, setOrg] = useState(null);
  const [marca, setMarca] = useState(null);
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
        setMarca(await api.getBranding(o.id));
        setStatus('done');
      })
      .catch((e) => { setErro(e.message); setStatus('error'); });
  }, []);

  const set = (campo) => (e) => {
    setMarca((m) => ({ ...m, [campo]: e.target.value }));
    setSalvo(false);
  };

  async function salvar() {
    setSalvando(true); setErro('');
    try {
      const atualizado = await api.setBranding(org.id, {
        brand_color: marca.brand_color ?? null,
        site_url: marca.site_url ?? null,
        instagram: marca.instagram ?? null,
      });
      setMarca(atualizado);
      setSalvo(true);
    } catch (e) { setErro(e.message); }
    finally { setSalvando(false); }
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
    try { setMarca(await api.uploadLogo(org.id, file)); }
    catch (err) { setErro(err.message); }
    finally { setEnviando(false); }
  }

  async function removerLogo() {
    setEnviando(true);
    try { setMarca(await api.removeLogo(org.id)); }
    catch (e) { setErro(e.message); }
    finally { setEnviando(false); }
  }

  if (status === 'loading') return <Shell><Loading /></Shell>;
  if (status === 'sem-org') {
    return (
      <Shell>
        <BackLink to="/" label="Eventos" />
        <div className="ck-card" style={{ maxWidth: 520 }}>
          <strong>Você ainda não tem produtora</strong>
          <p style={{ color: 'var(--pp-fg-3)', fontSize: 14, margin: '6px 0 0' }}>
            Crie o primeiro evento — a produtora nasce junto, e a marca fica disponível aqui.
          </p>
        </div>
      </Shell>
    );
  }

  const cor = marca?.brand_color || 'var(--pp-pulse)';

  return (
    <Shell>
      <BackLink to="/" label="Eventos" />
      <div className="ck-eyebrow">produtora · marca</div>
      <h1 className="ck-h1">Sua marca na página do evento</h1>
      <p className="ck-sub">
        O logo e a cor abaixo aparecem para quem compra. O rodapé, a política e o
        pagamento continuam sendo do PulsePass — o comprador precisa saber com quem
        falar se algo der errado.
      </p>

      {erro && <ErrorBox>{erro}</ErrorBox>}

      <div className="ck-row" style={{ alignItems: 'flex-start', gap: 20 }}>
        <div style={{ flex: '1 1 380px', minWidth: 300 }}>
          <div className="ck-card">
            <div className="ck-label">Logo</div>
            {marca?.logo_url ? (
              <>
                {/* Fundo escuro no preview porque é sobre escuro que ele vai
                    aparecer. Logo que só funciona em fundo branco precisa ser
                    descoberto AQUI, não pela produtora depois de publicar. */}
                <div style={{
                  marginTop: 10, padding: 20, borderRadius: 'var(--pp-r-card)',
                  background: 'var(--pp-ink-950)', border: '1px solid var(--pp-edge-2)',
                  display: 'grid', placeItems: 'center', minHeight: 110,
                }}>
                  <img src={marca.logo_url} alt="Logo da produtora"
                    style={{ maxHeight: 70, maxWidth: '100%' }} />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  <button className="ck-btn ck-btn--glass ck-btn--sm" disabled={enviando}
                    onClick={() => inputRef.current?.click()}>
                    {enviando ? 'Enviando…' : 'Trocar'}
                  </button>
                  <button className="ck-btn ck-btn--ghost ck-btn--sm" disabled={enviando} onClick={removerLogo}>
                    Remover
                  </button>
                </div>
              </>
            ) : (
              <>
                <p style={{ color: 'var(--pp-fg-4)', fontSize: 13, margin: '8px 0 14px' }}>
                  Sem logo, a página mostra o nome da produtora em texto.
                </p>
                <button className="ck-btn ck-btn--primary" disabled={enviando}
                  onClick={() => inputRef.current?.click()}>
                  {enviando ? 'Enviando…' : <><Icon name="plus" size={15} /> Enviar logo</>}
                </button>
              </>
            )}
            <p style={{ color: 'var(--pp-fg-4)', fontSize: 11, marginTop: 10 }}>
              PNG, JPG, WebP ou SVG, até {LIMITE_MB} MB. Fundo transparente funciona melhor.
            </p>
            <input ref={inputRef} type="file" accept={ACEITOS.join(',')}
              onChange={escolherLogo} style={{ display: 'none' }} />
          </div>

          <div className="ck-card" style={{ marginTop: 16 }}>
            <div className="ck-field">
              <label className="ck-label" htmlFor="marca-cor">Cor da marca</label>
              <div className="ck-row" style={{ gap: 10 }}>
                <input id="marca-cor" type="color" className="ck-input"
                  style={{ width: 64, padding: 4, height: 44 }}
                  value={marca?.brand_color || '#0BE87D'} onChange={set('brand_color')} />
                <input className="ck-input pp-mono" style={{ flex: 1 }}
                  value={marca?.brand_color ?? ''} onChange={set('brand_color')}
                  placeholder="#0BE87D" spellCheck="false" aria-label="Cor em hexadecimal" />
              </div>
              <div className="ck-row" style={{ gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                {CORES.map((c) => (
                  <button key={c} type="button" title={c} aria-label={`Usar a cor ${c}`}
                    onClick={() => { setMarca((m) => ({ ...m, brand_color: c })); setSalvo(false); }}
                    style={{
                      width: 32, height: 32, borderRadius: 8, background: c, cursor: 'pointer',
                      border: marca?.brand_color === c ? '2px solid #fff' : '1px solid var(--pp-edge-3)',
                    }} />
                ))}
              </div>
            </div>

            <div className="ck-field">
              <label className="ck-label" htmlFor="marca-site">Site (opcional)</label>
              <input id="marca-site" className="ck-input" type="url" inputMode="url"
                autoCapitalize="off" autoCorrect="off" spellCheck="false"
                value={marca?.site_url ?? ''} onChange={set('site_url')} placeholder="suacasa.com.br" />
            </div>

            <div className="ck-field">
              <label className="ck-label" htmlFor="marca-insta">Instagram (opcional)</label>
              <input id="marca-insta" className="ck-input"
                autoCapitalize="off" autoCorrect="off" spellCheck="false"
                value={marca?.instagram ?? ''} onChange={set('instagram')} placeholder="suacasa" />
            </div>

            <button className={`ck-btn ck-btn--primary ${salvando ? 'is-loading' : ''}`}
              disabled={salvando} onClick={salvar}>
              {salvo ? 'Salvo ✓' : 'Salvar marca'}
            </button>
          </div>
        </div>

        {/* Prévia ao vivo. Sem ela a produtora publica, abre a página e só aí
            descobre que a cor escolhida some no fundo escuro. */}
        <div style={{ flex: '1 1 320px', minWidth: 280 }}>
          <div className="ck-label" style={{ marginBottom: 8 }}>Como o cliente vê</div>
          <div style={{
            borderRadius: 'var(--pp-r-lg)', overflow: 'hidden',
            border: '1px solid var(--pp-edge-2)', background: 'var(--pp-ink-950)',
          }}>
            <div style={{
              padding: '14px 18px', borderBottom: '1px solid var(--pp-edge-1)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              {marca?.logo_url
                ? <img src={marca.logo_url} alt="" style={{ maxHeight: 26 }} />
                : <strong style={{ color: cor }}>{org?.name}</strong>}
            </div>
            <div style={{ padding: 18 }}>
              <div className="pp-meta">SÁB · 22 NOV · 22H</div>
              <div style={{
                fontFamily: 'var(--pp-font-display)', fontWeight: 700,
                fontSize: 24, letterSpacing: '-0.02em', margin: '4px 0 12px',
              }}>
                Nome do seu evento
              </div>
              <button style={{
                width: '100%', height: 46, borderRadius: 'var(--pp-r-control)',
                background: cor, color: '#06070A', border: 0,
                fontWeight: 700, fontSize: 15, cursor: 'default',
              }}>
                Comprar ingresso
              </button>
              <p style={{ color: 'var(--pp-fg-4)', fontSize: 11, marginTop: 14, textAlign: 'center' }}>
                Pagamento processado por PulsePass
              </p>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
