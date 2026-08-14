/**
 * Vocabulário do catálogo, compartilhado pela vitrine (Discover) e pela busca.
 *
 * Ficava duplicado dentro do Discover. Com duas telas mandando `category` para
 * o mesmo endpoint, uma lista solta em cada arquivo é armadilha: o valor tem de
 * bater com o enum `event_category` do banco, e um chip com o rótulo certo mas
 * o id errado devolve lista vazia sem erro nenhum na tela.
 */

/** Espelha o enum event_category. 'outro' fica de fora de propósito: é o
 *  padrão de quem não escolheu categoria, e não uma trilha para navegar. */
export const CATEGORIAS = [
  { id: 'festa', rotulo: 'Festas' },
  { id: 'show', rotulo: 'Shows' },
  { id: 'standup', rotulo: 'Stand-up' },
  { id: 'teatro', rotulo: 'Teatro' },
  { id: 'esporte', rotulo: 'Esporte' },
  { id: 'gastronomia', rotulo: 'Gastronomia' },
  { id: 'workshop', rotulo: 'Workshop' },
];

/**
 * Capa provisória de evento sem cover_url. Os quatro desenhos vêm do Flyer do
 * design system, mas as CORES saem dos tokens v4 — o mockup ainda carrega o
 * verde fluorescente antigo (#00FF85) e o preto azulado (#06070A), que foram
 * justamente o que a v4 aposentou. Hex cravado aqui reintroduziria a paleta
 * velha por uma porta lateral e ela ia desalinhar de tudo à volta.
 */
export const FLYER_GRADS = [
  'radial-gradient(80% 80% at 20% 20%, var(--pp-cyan), transparent 60%), radial-gradient(80% 80% at 80% 80%, var(--pp-violet), transparent 60%), var(--pp-ink-950)',
  'linear-gradient(135deg, var(--pp-pink) 0%, var(--pp-amber) 100%)',
  'radial-gradient(circle at 50% 100%, var(--pp-pulse), transparent 70%), linear-gradient(180deg, var(--pp-ink-950), var(--pp-ink-700))',
  'radial-gradient(120% 60% at 50% 0%, var(--pp-violet), transparent 60%), var(--pp-ink-950)',
  'radial-gradient(80% 80% at 70% 20%, var(--pp-pulse), transparent 60%), radial-gradient(80% 80% at 20% 90%, var(--pp-cyan), transparent 60%), var(--pp-ink-950)',
  'radial-gradient(90% 70% at 30% 10%, var(--pp-pink), transparent 60%), var(--pp-ink-950)',
];
