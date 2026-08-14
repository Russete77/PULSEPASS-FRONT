/**
 * Primeiro acesso — memória de que o tour já foi visto.
 *
 * Regras que este arquivo existe para garantir:
 *
 * 1) O tour aparece UMA vez por aparelho. Concluído ou pulado dá no mesmo:
 *    quem já decidiu não quer ser perguntado de novo.
 *
 * 2) Quando o localStorage não está disponível — aba anônima com storage
 *    bloqueado, navegador em modo restrito — a resposta é "já viu". Parece
 *    contraintuitivo, mas o contrário é pior: a vitrine manda para o tour, o
 *    tour não consegue gravar nada, e a pessoa volta para o tour a cada vez
 *    que toca no logo. Melhor perder o tutorial do que prender alguém nele.
 *
 * 3) A marca também vive em memória, no módulo. Sem isso, concluir o tour e
 *    voltar para "/" no mesmo carregamento reabriria o tour em navegadores
 *    onde a escrita falha em silêncio.
 */

const CHAVE = 'pp:onboarding';
/** Sobe quando o tour mudar de verdade e valer a pena mostrar de novo. */
const VERSAO = '1';

let vistoNestaSessao = false;

export function onboardingVisto() {
  if (vistoNestaSessao) return true;
  try {
    return localStorage.getItem(CHAVE) === VERSAO;
  } catch {
    return true; // storage indisponível: ver a regra 2 acima
  }
}

/** Chamado tanto no "Pular" quanto no fim do tour — a intenção é a mesma. */
export function marcarOnboardingVisto() {
  vistoNestaSessao = true;
  try {
    localStorage.setItem(CHAVE, VERSAO);
  } catch { /* aba anônima: a marca em memória segura o resto da visita */ }
}
