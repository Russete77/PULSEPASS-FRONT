import { useEffect, useRef } from 'react';

/**
 * Título da aba e foco a cada troca de rota.
 *
 * Dois problemas que a revisão de UX encontrou, ambos invisíveis em teste de
 * mesa e óbvios em uso real:
 *
 * 1) As 33 telas compartilhavam um único título. Na noite do evento a
 *    produtora abre porta, PDV, bilheteria e dashboard em abas separadas — e
 *    todas diziam "PulsePass · Cockpit". Achar a aba certa virava tentativa e
 *    erro, com o evento rolando.
 *
 * 2) Numa SPA, trocar de rota troca o conteúdo mas não mexe no foco. Quem usa
 *    teclado continua no link que clicou, dentro de um menu que já não existe;
 *    quem usa leitor de tela não é avisado de que a página mudou.
 *
 * Fica no App, não nas telas: assim vale para toda rota, inclusive as que
 * ainda vão ser criadas.
 *
 * @param {string} caminho      pathname atual (de useLocation)
 * @param {(caminho: string) => string} resolverTitulo
 * @param {string} sufixo       aplicativo, para o fim do título
 */
export function useNavegacaoAcessivel(caminho, resolverTitulo, sufixo) {
  const primeiraVez = useRef(true);

  useEffect(() => {
    const titulo = resolverTitulo(caminho);
    document.title = titulo ? `${titulo} · ${sufixo}` : sufixo;

    // Na primeira carga o foco já está no lugar certo: mover atrapalharia.
    if (primeiraVez.current) { primeiraVez.current = false; return; }

    // Se a tela já colocou o foco num campo — o autoFocus do e-mail no login,
    // por exemplo — ela sabe melhor do que este hook onde a pessoa quer
    // digitar. Os efeitos do pai rodam DEPOIS dos dos filhos, então sem esta
    // guarda o h1 roubaria o cursor de todo formulário com autoFocus.
    const atual = document.activeElement;
    if (atual && ['INPUT', 'SELECT', 'TEXTAREA'].includes(atual.tagName)) return;

    // O h1 é o nome da tela. Recebe foco programático (tabIndex -1, que não o
    // coloca na ordem de Tab) para o leitor anunciar onde a pessoa chegou e o
    // Tab seguinte continuar dali, não do topo.
    const alvo = document.querySelector('h1') ?? document.querySelector('main');
    if (!alvo) return;
    if (!alvo.hasAttribute('tabindex')) alvo.setAttribute('tabindex', '-1');
    alvo.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [caminho, resolverTitulo, sufixo]);
}

/**
 * Monta um resolvedor a partir de um mapa de rotas.
 * Aceita `:id` nos padrões e escolhe sempre o padrão mais específico.
 */
export function criarResolvedorDeTitulo(mapa) {
  const entradas = Object.entries(mapa)
    .map(([padrao, titulo]) => ({
      titulo,
      partes: padrao.split('/').filter(Boolean),
      // Mais segmentos fixos = mais específico. "/eventos/:id/porta" tem que
      // ganhar de "/eventos/:id", senão toda subtela vira "Dashboard".
      peso: padrao.split('/').filter((p) => p && !p.startsWith(':')).length,
    }))
    .sort((a, b) => b.peso - a.peso);

  return (caminho) => {
    const partes = caminho.split('/').filter(Boolean);
    for (const e of entradas) {
      if (e.partes.length !== partes.length) continue;
      const bate = e.partes.every((p, i) => p.startsWith(':') || p === partes[i]);
      if (bate) return e.titulo;
    }
    return '';
  };
}
