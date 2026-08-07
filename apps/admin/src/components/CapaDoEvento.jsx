import { useRef, useState } from 'react';
import { Icon } from '@pulsepass/shared/Icon';
import { api } from '../lib/api.js';

/**
 * Capa do evento.
 *
 * A auditoria de design fechou com o achado que nenhuma folha de estilo
 * resolve: sem foto, o hero do evento é um gradiente genérico. As referências
 * do setor convergem em que a imagem é a peça principal e a interface se
 * apaga — evento sem foto é evento sem desejo.
 *
 * Por isso a ausência aparece como AVISO, não como campo vazio discreto: a
 * produtora precisa entender que está vendendo menos por causa disso.
 */
const LIMITE_MB = 5;
const ACEITOS = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export default function CapaDoEvento({ eventId, coverUrl, onChange }) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const inputRef = useRef(null);

  async function escolher(e) {
    const file = e.target.files?.[0];
    e.target.value = '';               // permite reenviar o mesmo arquivo
    if (!file) return;

    // Validação no cliente para dar resposta imediata; o Storage valida de novo.
    if (!ACEITOS.includes(file.type)) {
      return setErro('Use JPG, PNG, WebP ou AVIF.');
    }
    if (file.size > LIMITE_MB * 1024 * 1024) {
      return setErro(`A imagem tem ${(file.size / 1048576).toFixed(1)} MB. O limite é ${LIMITE_MB} MB.`);
    }

    setEnviando(true); setErro('');
    try {
      const atualizado = await api.uploadCover(eventId, file);
      onChange?.(atualizado.cover_url);
    } catch (err) { setErro(err.message); } finally { setEnviando(false); }
  }

  async function remover() {
    setEnviando(true); setErro('');
    try {
      await api.removeCover(eventId);
      onChange?.(null);
    } catch (err) { setErro(err.message); } finally { setEnviando(false); }
  }

  return (
    <div className="ck-card" style={{ maxWidth: 560 }}>
      <div className="ck-label">Capa do evento</div>

      {coverUrl ? (
        <>
          <img
            src={coverUrl} alt="Capa do evento"
            style={{
              width: '100%', aspectRatio: '16 / 9', objectFit: 'cover',
              borderRadius: 'var(--pp-r-card)', marginTop: 10, display: 'block',
            }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <button className="ck-btn ck-btn--glass ck-btn--sm" disabled={enviando}
              onClick={() => inputRef.current?.click()}>
              {enviando ? 'Enviando…' : 'Trocar imagem'}
            </button>
            <button className="ck-btn ck-btn--ghost ck-btn--sm" disabled={enviando} onClick={remover}>
              Remover
            </button>
          </div>
        </>
      ) : (
        <>
          <p style={{ color: 'var(--pp-amber)', fontSize: 13, margin: '8px 0 4px' }}>
            Este evento está sem capa.
          </p>
          <p style={{ color: 'var(--pp-fg-4)', fontSize: 12, margin: '0 0 14px' }}>
            A imagem é a primeira coisa que a pessoa vê na vitrine e no ingresso.
            Sem ela, seu evento aparece com um fundo neutro e vende menos.
          </p>
          <button className="ck-btn ck-btn--primary" disabled={enviando}
            onClick={() => inputRef.current?.click()}>
            {enviando ? 'Enviando…' : <><Icon name="plus" size={15} /> Adicionar capa</>}
          </button>
        </>
      )}

      {erro && <p style={{ color: '#FF6B61', fontSize: 13, marginTop: 10 }}>{erro}</p>}
      <p style={{ color: 'var(--pp-fg-4)', fontSize: 11, marginTop: 10 }}>
        Proporção 16:9, até {LIMITE_MB} MB. JPG, PNG, WebP ou AVIF.
      </p>

      <input ref={inputRef} type="file" accept={ACEITOS.join(',')}
        onChange={escolher} style={{ display: 'none' }} />
    </div>
  );
}
