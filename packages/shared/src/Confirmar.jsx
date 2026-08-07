import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Confirmação de ação destrutiva.
 *
 * A revisão de UX encontrou três telas que apagam no primeiro clique — cupom,
 * membro da equipe e lote — sem perguntar e sem desfazer. Numa produtora com
 * várias pessoas no mesmo cockpit durante o evento, isso é perda de dado real.
 *
 * O que este componente faz e o window.confirm não faz:
 *  · nomeia O QUE vai sumir, em vez de "tem certeza?";
 *  · começa com o foco no botão SEGURO — quem aperta Enter por reflexo cancela;
 *  · prende o foco enquanto está aberto e devolve para o botão de origem ao sair;
 *  · trava enquanto a ação roda, então clique duplo não dispara duas exclusões;
 *  · mostra o erro dentro do próprio diálogo, sem fechar e perder o contexto.
 */
export default function Confirmar({
  aberto,
  titulo,
  descricao,
  confirmar = 'Excluir',
  cancelar = 'Cancelar',
  perigo = true,
  onConfirmar,
  onFechar,
}) {
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');
  const caixaRef = useRef(null);
  const seguroRef = useRef(null);
  const origemRef = useRef(null);

  const fechar = useCallback(() => {
    if (ocupado) return;      // não abandona a ação no meio
    setErro('');
    onFechar?.();
  }, [ocupado, onFechar]);

  useEffect(() => {
    if (!aberto) return undefined;
    // Guarda quem abriu para devolver o foco ao fechar: sem isso, quem usa
    // teclado volta para o começo da página e perde o lugar na tabela.
    origemRef.current = document.activeElement;
    setErro('');
    seguroRef.current?.focus();

    function aoTeclar(e) {
      if (e.key === 'Escape') { e.preventDefault(); fechar(); return; }
      if (e.key !== 'Tab') return;
      // Prende o foco: Tab não pode escapar para a página atrás do overlay.
      const focaveis = caixaRef.current?.querySelectorAll(
        'button:not(:disabled), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focaveis?.length) return;
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
    }

    document.addEventListener('keydown', aoTeclar);
    // A página atrás não rola enquanto o diálogo está aberto.
    const rolagem = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', aoTeclar);
      document.body.style.overflow = rolagem;
      origemRef.current?.focus?.();
    };
  }, [aberto, fechar]);

  if (!aberto) return null;

  async function confirmarAcao() {
    setOcupado(true); setErro('');
    try {
      await onConfirmar?.();
      onFechar?.();
    } catch (e) {
      // Fica aberto com o erro à vista: fechar aqui esconderia o motivo e a
      // produtora tentaria de novo sem saber que já tinha falhado.
      setErro(e?.message ?? 'Não foi possível concluir.');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="pp-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) fechar(); }}>
      <div
        ref={caixaRef}
        className="pp-modal pp-modal--sm"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="pp-confirmar-titulo"
        aria-describedby={descricao ? 'pp-confirmar-desc' : undefined}
      >
        <div className="pp-modal__head">
          <h2 className="pp-modal__title" id="pp-confirmar-titulo">{titulo}</h2>
        </div>
        {(descricao || erro) && (
          <div className="pp-modal__body">
            {descricao && (
              <p id="pp-confirmar-desc" style={{ color: 'var(--pp-fg-2)', fontSize: 14, margin: 0, lineHeight: 1.5 }}>
                {descricao}
              </p>
            )}
            {erro && (
              <p role="alert" style={{ color: '#FF6B61', fontSize: 13, margin: '12px 0 0' }}>{erro}</p>
            )}
          </div>
        )}
        <div className="pp-modal__foot">
          {/* O seguro vem primeiro e recebe o foco inicial. */}
          <button ref={seguroRef} type="button" className="pp-btn pp-btn--ghost"
            onClick={fechar} disabled={ocupado}>
            {cancelar}
          </button>
          <button type="button"
            className={`pp-btn ${perigo ? 'pp-btn--danger' : 'pp-btn--primary'} ${ocupado ? 'is-loading' : ''}`}
            onClick={confirmarAcao} disabled={ocupado}>
            {confirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
