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
    <div className="ck-card ck-w-mid">
      <div className="ck-label">Capa do evento</div>

      {coverUrl ? (
        <>
          <img
            src={coverUrl} alt="Capa do evento"
            className="ck-full ck-mt-3 ck-block ck-capa"
          />
          <div className="ck-flex ck-gap-2 ck-mt-3 pp-wrap">
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
          <p className="ck-c-amber ck-t-support ck-m-0 ck-mt-2 ck-mb-1">
            Este evento está sem capa.
          </p>
          <p className="pp-muted-2 ck-t-support ck-m-0 ck-mb-4">
            A imagem é a primeira coisa que a pessoa vê na vitrine e no ingresso.
            Sem ela, seu evento aparece com um fundo neutro e vende menos.
          </p>
          <button className="ck-btn ck-btn--primary" disabled={enviando}
            onClick={() => inputRef.current?.click()}>
            {enviando ? 'Enviando…' : <><Icon name="plus" size={15} /> Adicionar capa</>}
          </button>
        </>
      )}

      {erro && <p className="ck-c-red ck-t-support ck-mt-3">{erro}</p>}
      <p className="pp-muted-2 ck-t-label ck-mt-3">
        Proporção 16:9, até {LIMITE_MB} MB. JPG, PNG, WebP ou AVIF.
      </p>

      <input className="ck-none" ref={inputRef} type="file" accept={ACEITOS.join(',')} onChange={escolher}/>
    </div>
  );
}
