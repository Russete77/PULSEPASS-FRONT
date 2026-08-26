import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shell, Loading, ErrorBox } from '../components/Shell.jsx';
import { Icon } from '@pulsepass/shared/Icon';
import Confirmar from '@pulsepass/shared/Confirmar';
import { api } from '../lib/api.js';
import { dateTime } from '../lib/format.js';

/**
 * Integrações da produtora — chaves de API e webhooks.
 *
 * A chave é da CASA, não da plataforma: quem integra o ERP é a produtora, o
 * dado que sai é dela e o prejuízo de uma chave vazada é dela. Por isso a tela
 * mora fora do escopo de evento, ao lado de Marca e Repasse, e o backend exige
 * ser DONO da organização (gerente escalado num evento não emite chave).
 *
 * ── O que manda no desenho desta tela ──
 * O segredo (chave de API, secret de webhook) aparece UMA vez, no instante em
 * que nasce. Não há rota de "mostrar de novo" — o banco guarda hash e cifra. A
 * consequência de UX é dura e precisa ser respeitada: se a pessoa fechar o
 * diálogo sem copiar, o valor morreu. Por isso o diálogo de revelação avisa
 * ANTES, não deixa fechar por Esc/clique fora, e só libera o botão de fechar
 * depois de a pessoa marcar que guardou. Chato de propósito.
 *
 * ── O que do mockup (ApiWebhooksScreen) ficou de fora ──
 * Requests 24h, p99 de latência, taxa de sucesso, rate limit consumido, média
 * de resposta por endpoint e a esteira de "integrações nativas 1-click" — nada
 * disso existe no backend. Número inventado numa tela de infraestrutura é pior
 * que número nenhum: o integrador toma decisão em cima dele. Ficaram as quatro
 * contagens que saem de dado real e a estrutura do mockup (cabeçalho, faixa de
 * indicadores, duas colunas chaves|webhooks, faixa de contexto embaixo).
 */

/** Raiz da API pública, montada em /api/v1/pub. Valor real, não exemplo. */
const RAIZ_API = import.meta.env.VITE_API_URL ?? '/api';
const BASE_PUBLICA = `${
  /^https?:\/\//.test(RAIZ_API) ? RAIZ_API : `${window.location.origin}${RAIZ_API}`
}/v1/pub`;

/** Vocabulário de status de entrega (enum webhook_entrega_status, migration 0055). */
const STATUS_ENTREGA = {
  pendente: { rotulo: 'na fila', classe: 'pp-badge--amber' },
  enviando: { rotulo: 'enviando', classe: 'pp-badge--neutral' },
  entregue: { rotulo: 'entregue', classe: 'pp-badge--success' },
  desistiu: { rotulo: 'desistiu', classe: 'pp-badge--red' },
};

/**
 * Copiar com retorno visível E audível.
 *
 * Botão que copia sem dizer nada faz a pessoa clicar de novo — e num diálogo
 * de segredo único isso vira "será que copiou?" na única chance que existe.
 */
function useCopiar() {
  const [copiado, setCopiado] = useState('');
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copiar = useCallback(async (texto, chave = 'x') => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(texto);
      } else {
        // Fallback para contexto não seguro (http://ip-da-rede:5174 na casa).
        const area = document.createElement('textarea');
        area.value = texto;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        document.body.removeChild(area);
      }
      setCopiado(chave);
    } catch {
      setCopiado(`erro:${chave}`);
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopiado(''), 2600);
  }, []);

  return [copiado, copiar];
}

/** Botão de copiar padrão da tela: rótulo muda, ícone muda, e há aria-live. */
function BotaoCopiar({ valor, chave, copiado, copiar, rotulo = 'Copiar', classe = 'ck-btn ck-btn--glass ck-btn--sm' }) {
  const ok = copiado === chave;
  const falhou = copiado === `erro:${chave}`;
  return (
    <button type="button" className={classe} onClick={() => copiar(valor, chave)}
      aria-label={ok ? `${rotulo}: copiado` : rotulo}>
      <Icon name={ok ? 'check' : 'copy'} size={15} />
      {falhou ? 'Copie à mão' : ok ? 'Copiado' : rotulo}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════
// Revelação do segredo — o momento que define esta tela
// ═══════════════════════════════════════════════════════════

/**
 * Mostra o valor que só existe agora.
 *
 * Não fecha por Esc nem por clique no fundo enquanto a pessoa não confirmar
 * que guardou: os dois gestos são reflexo, e aqui o reflexo custa a chave.
 * O foco entra no campo do segredo (que é `readonly` e já vem selecionado),
 * fica preso na caixa, e volta pra origem no fim.
 */
function SegredoUnico({ aberto, titulo, contexto, rotuloValor, valor, comoUsar, onFechar }) {
  const [guardei, setGuardei] = useState(false);
  const [copiado, copiar] = useCopiar();
  const caixaRef = useRef(null);
  const valorRef = useRef(null);
  const origemRef = useRef(null);

  useEffect(() => {
    if (!aberto) { setGuardei(false); return undefined; }
    origemRef.current = document.activeElement;
    valorRef.current?.focus();
    valorRef.current?.select();

    function aoTeclar(e) {
      if (e.key === 'Escape') {
        // Sem escape: sair daqui sem copiar é perder o segredo pra sempre.
        e.preventDefault();
        return;
      }
      if (e.key !== 'Tab') return;
      const focaveis = caixaRef.current?.querySelectorAll(
        'button:not(:disabled), input, [href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focaveis?.length) return;
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
    }

    document.addEventListener('keydown', aoTeclar);
    const rolagem = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', aoTeclar);
      document.body.style.overflow = rolagem;
      origemRef.current?.focus?.();
    };
  }, [aberto]);

  if (!aberto) return null;

  return (
    <div className="pp-overlay">
      {/* Mais largo que o padrão: a chave e o comando de exemplo são linhas
          longas, e em 460px elas quebravam tanto que o conteúdo passava da
          altura da janela e virava rolagem — numa tela que a pessoa só vê uma
          vez, o que fica abaixo da dobra é o que ela não copia. */}
      <div ref={caixaRef} className="pp-modal pp-modal--lg" role="alertdialog" aria-modal="true"
        aria-labelledby="pp-segredo-titulo" aria-describedby="pp-segredo-aviso">
        <div className="pp-modal__head">
          <h2 className="pp-modal__title" id="pp-segredo-titulo">{titulo}</h2>
        </div>

        <div className="pp-modal__body">
          {/* O aviso vem ANTES do valor, não depois: quem lê de cima pra baixo
              precisa saber o que está em jogo antes de bater o olho no campo. */}
          <p id="pp-segredo-aviso" className="pp-aviso-unico">
            <Icon name="clock" size={14} />
            <span>
              <strong>Aparece uma única vez.</strong> Nem o suporte recupera —
              copie antes de fechar. {contexto}
            </span>
          </p>

          {/* O valor é o assunto da janela, então ocupa o lugar de assunto: um
              bloco próprio, largura inteira, quebrando em QUALQUER caractere.
              Antes era um `ck-input` solto — e `.ck-input` não tem width:100%
              fora de um `.ck-field`, então a chave aparecia cortada com o
              rótulo espremido ao lado. Chave cortada é chave copiada pela
              metade, que é o pior desfecho possível aqui. */}
          <div className="pp-cofre">
            <div className="pp-cofre__topo">
              <span className="ck-label" id="pp-segredo-rot">{rotuloValor}</span>
              <BotaoCopiar valor={valor} chave="segredo" copiado={copiado} copiar={copiar}
                rotulo={copiado === 'segredo' ? 'Copiado' : 'Copiar'}
                classe="ck-btn ck-btn--primary ck-btn--sm" />
            </div>
            <textarea
              id="pp-segredo-valor" ref={valorRef} className="pp-cofre__valor pp-mono"
              value={valor} readOnly spellCheck="false" rows={2}
              aria-labelledby="pp-segredo-rot"
              onFocus={(e) => e.target.select()}
            />
          </div>

          <p className="pp-muted-2 ck-t-support ck-m-0 ck-mt-2">
            Ou clique no valor para selecionar tudo e use Ctrl+C.
          </p>

          {/* Região viva: leitor de tela precisa ouvir que copiou — o ícone
              trocando não alcança quem não vê. */}
          <p aria-live="polite" role="status" className={`pp-mono ck-m-0 ck-mt-2 ck-t-support ck-viva ${copiado.startsWith('erro') ? 'ck-c-red' : 'ck-c-pulse'}`}>
            {copiado === 'segredo' ? 'copiado para a área de transferência ✓'
              : copiado.startsWith('erro') ? 'o navegador bloqueou a cópia — selecione o campo e copie à mão'
                : ''}
          </p>

          {comoUsar && <div className="pp-comousar">{comoUsar}</div>}

          {/* A trava fica destacada, não como caixinha perdida no rodapé: é a
              única coisa entre a pessoa e perder a chave para sempre. */}
          <label className={`pp-trava ${guardei ? 'is-on' : ''}`}>
            <input type="checkbox" checked={guardei} onChange={(e) => setGuardei(e.target.checked)} />
            <span>
              Guardei em lugar seguro. Entendo que fechar esta janela apaga o valor
              da tela para sempre.
            </span>
          </label>
        </div>

        <div className="pp-modal__foot">
          <button type="button" className="pp-btn pp-btn--primary" onClick={onFechar}
            disabled={!guardei}
            aria-describedby={guardei ? undefined : 'pp-segredo-trava'}>
            Fechar
          </button>
        </div>
        {/* Degrau de etiqueta (--pp-t-label). Antes era um clamp em px com
            casa decimal, inventado porque a escala crua não tinha 11 — o papel
            tem, e é o mesmo que carimba toda etiqueta do cockpit. */}
        {!guardei && (
          <p id="pp-segredo-trava" className="pp-muted-2 ck-m-0 ck-center ck-t-label ck-p-rodape">
            Marque a caixa acima para liberar o fechamento.
          </p>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Tela
// ═══════════════════════════════════════════════════════════

export default function Integracoes() {
  const [org, setOrg] = useState(null);
  const [status, setStatus] = useState('loading');   // loading | sem-org | done | error
  const [erro, setErro] = useState('');

  const [chaves, setChaves] = useState([]);
  const [escoposCatalogo, setEscoposCatalogo] = useState([]);
  const [assinaturas, setAssinaturas] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [eventosCatalogo, setEventosCatalogo] = useState([]);

  const [formChave, setFormChave] = useState({ nome: '', escopos: [] });
  const [criandoChave, setCriandoChave] = useState(false);
  const [formHook, setFormHook] = useState({ url: '', eventos: [] });
  const [criandoHook, setCriandoHook] = useState(false);

  const [segredo, setSegredo] = useState(null);       // { titulo, contexto, rotuloValor, valor, comoUsar }
  // A troca de segredo nasce DENTRO do Confirmar. Os dois diálogos mexem em
  // `body.overflow` e no foco: abrir o segundo antes de o primeiro desmontar
  // faz a limpeza do primeiro desfazer o travamento do segundo — e a página
  // fica sem rolagem depois de fechar. Por isso o valor espera aqui.
  const [segredoPendente, setSegredoPendente] = useState(null);
  const [aRevogar, setARevogar] = useState(null);     // chave aguardando confirmação
  const [aRemover, setARemover] = useState(null);     // webhook aguardando confirmação
  const [aRotacionar, setARotacionar] = useState(null);
  const [ocupado, setOcupado] = useState('');         // id da assinatura em ação
  const [recado, setRecado] = useState('');           // resultado do reprocesso, em região viva

  const [copiado, copiar] = useCopiar();

  const carregar = useCallback(async (orgId) => {
    const [k, w] = await Promise.all([api.listarChavesApi(orgId), api.listarWebhooks(orgId)]);
    setChaves(k?.chaves ?? []);
    setEscoposCatalogo(k?.escopos ?? []);
    setAssinaturas(w?.assinaturas ?? []);
    setEntregas(w?.entregas ?? []);
    setEventosCatalogo(w?.eventos ?? []);
  }, []);

  useEffect(() => {
    api.me()
      .then(async (me) => {
        // /admin/me só devolve organizações de que a pessoa é DONA — que é
        // exatamente quem o backend deixa emitir chave. Sem org, não há o que
        // integrar ainda.
        const o = me.organizations?.[0];
        if (!o) { setStatus('sem-org'); return; }
        setOrg(o);
        await carregar(o.id);
        setStatus('done');
      })
      .catch((e) => { setErro(e.message); setStatus('error'); });
  }, [carregar]);

  const alternar = (lista, id) => (lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id]);

  async function criarChave(e) {
    e.preventDefault();
    setCriandoChave(true); setErro('');
    try {
      const nova = await api.criarChaveApi(org.id, {
        nome: formChave.nome.trim(),
        escopos: formChave.escopos,
      });
      // A resposta é o único lugar do universo onde `chave` existe. Vai direto
      // pro diálogo — nada de gravar em estado de lista, log ou URL.
      setSegredo({
        titulo: `Chave "${nova.nome}" criada`,
        contexto: 'Se perder, a saída é criar outra e revogar esta.',
        rotuloValor: 'Chave de API',
        valor: nova.chave,
        comoUsar: (
          <>
            <div className="ck-label ck-mb-2">Como usar</div>
            <code className="pp-mono ck-block ck-t-support ck-c-fg2 ck-quebra">
              curl -H &quot;Authorization: Bearer {nova.prefixo}…&quot; {BASE_PUBLICA}/eu
            </code>
          </>
        ),
      });
      setFormChave({ nome: '', escopos: [] });
      await carregar(org.id);
    } catch (err) { setErro(err.message); }
    finally { setCriandoChave(false); }
  }

  async function criarHook(e) {
    e.preventDefault();
    setCriandoHook(true); setErro('');
    try {
      const novo = await api.criarWebhook(org.id, {
        url: formHook.url.trim(),
        eventos: formHook.eventos,
      });
      setSegredo({
        titulo: 'Webhook criado',
        contexto: 'Sem ele, seu servidor não consegue provar que o aviso veio da gente.',
        rotuloValor: `Segredo de assinatura · ${novo.url}`,
        valor: novo.secret,
        comoUsar: (
          <>
            <div className="ck-label ck-mb-2">Como conferir do seu lado</div>
            <p className="pp-muted-2 ck-t-support ck-m-0 ck-mb-2 ck-lh">
              Cabeçalho <span className="pp-mono">X-PulsePass-Signature</span>, no formato{' '}
              <span className="pp-mono">t=&lt;unix&gt;,v1=&lt;hex&gt;</span>. O{' '}
              <span className="pp-mono">v1</span> é HMAC-SHA256 de{' '}
              <span className="pp-mono">&quot;&lt;t&gt;.&lt;corpo bruto&gt;&quot;</span> com este segredo.
              Recuse o que chegar com <span className="pp-mono">t</span> de mais de 5 minutos atrás.
            </p>
          </>
        ),
      });
      setFormHook({ url: '', eventos: [] });
      await carregar(org.id);
    } catch (err) { setErro(err.message); }
    finally { setCriandoHook(false); }
  }

  /* Sem try/catch: o Confirmar segura o erro e fica aberto mostrando o motivo. */
  async function revogar(chave) {
    await api.revogarChaveApi(org.id, chave.id);
    await carregar(org.id);
  }
  async function remover(hook) {
    await api.removerWebhook(org.id, hook.id);
    await carregar(org.id);
  }
  async function rotacionar(hook) {
    const novo = await api.rotacionarWebhookSecret(org.id, hook.id);
    await carregar(org.id);
    setSegredoPendente({
      titulo: 'Segredo trocado',
      contexto: 'O segredo anterior parou de valer agora — até você trocar no seu servidor, as entregas vão falhar na conferência.',
      rotuloValor: `Novo segredo · ${hook.url}`,
      valor: novo.secret,
      comoUsar: null,
    });
  }

  // Abre o segredo só depois que o Confirmar saiu da árvore.
  useEffect(() => {
    if (aRotacionar || !segredoPendente) return;
    setSegredo(segredoPendente);
    setSegredoPendente(null);
  }, [aRotacionar, segredoPendente]);

  async function alternarAtiva(hook) {
    setOcupado(hook.id); setErro(''); setRecado('');
    try {
      await api.pausarWebhook(org.id, hook.id, !hook.ativa);
      await carregar(org.id);
    } catch (e) { setErro(e.message); }
    finally { setOcupado(''); }
  }

  async function reprocessar(hook) {
    setOcupado(hook.id); setErro(''); setRecado('');
    try {
      const r = await api.reprocessarWebhook(org.id, hook.id);
      // Números do backend, sem arredondar pra bonito.
      setRecado(
        `${hook.url}: ${r.reenfileiradas ?? 0} devolvida(s) à fila · `
        + `${r.processadas ?? 0} tentada(s) agora · ${r.entregues ?? 0} entregue(s) · ${r.falhas ?? 0} falha(s).`,
      );
      await carregar(org.id);
    } catch (e) { setErro(e.message); }
    finally { setOcupado(''); }
  }

  // ── Indicadores: só contagem do que veio da API ──
  const porAssinatura = useMemo(() => {
    const mapa = new Map();
    for (const e of entregas) {
      const atual = mapa.get(e.assinatura_id) ?? { total: 0, entregue: 0, pendente: 0, desistiu: 0, ultimaFalha: null };
      atual.total += 1;
      if (atual[e.status] != null) atual[e.status] += 1;
      if ((e.status === 'desistiu' || e.status === 'pendente') && e.erro && !atual.ultimaFalha) atual.ultimaFalha = e;
      mapa.set(e.assinatura_id, atual);
    }
    return mapa;
  }, [entregas]);

  const chavesAtivas = chaves.filter((c) => !c.revogada_em).length;
  const hooksAtivos = assinaturas.filter((a) => a.ativa).length;
  const naFila = entregas.filter((e) => e.status === 'pendente' || e.status === 'enviando').length;
  const desistiu = entregas.filter((e) => e.status === 'desistiu').length;

  if (status === 'loading') return <Shell><Loading /></Shell>;

  if (status === 'sem-org') {
    return (
      <Shell>
        <div className="pp-empty ck-w-mid">
          <div className="pp-empty__icon"><Icon name="box" size={28} /></div>
          <div className="pp-empty__title">Você ainda não tem produtora</div>
          <p className="ck-m-0 ck-mb-4">
            A chave de API é da produtora. Crie o primeiro evento — a produtora nasce
            junto, e as integrações ficam disponíveis aqui.
          </p>
          <Link to="/novo" className="ck-btn ck-btn--primary ck-btn--sm">
            <Icon name="plus" size={15} /> Criar evento
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="ck-eyebrow">produtora · integrações</div>
      <h1 className="ck-h1">Chaves, webhooks e <span className="pp-accent">conexões</span></h1>
      <p className="ck-sub ck-w-read">
        A chave deixa o seu sistema <strong>puxar</strong> dado nosso. O webhook faz a gente{' '}
        <strong>avisar</strong> o seu sistema quando algo acontece. As duas coisas são da sua
        produtora — quem emite responde pelo que sair.
      </p>

      {erro && <ErrorBox>{erro}</ErrorBox>}

      {/* Indicadores. Quatro, como no mockup — mas só o que o backend sabe
          responder. Requests/hora, latência e rate limit não existem, e chutar
          esses números numa tela de infraestrutura induz decisão errada. */}
      <div className="ck-kpis ck-mt-5">
        <div className="ck-kpi ck-k--pulse">
          <div className="lbl">Chaves ativas</div>
          <div className="val">{chavesAtivas}</div>
          <div className="d">{chaves.length - chavesAtivas} revogada(s)</div>
        </div>
        <div className="ck-kpi ck-k--cyan">
          <div className="lbl">Webhooks ativos</div>
          <div className="val">{hooksAtivos}</div>
          <div className="d">{assinaturas.length - hooksAtivos} pausado(s)</div>
        </div>
        <div className="ck-kpi ck-k--amber">
          <div className="lbl">Na fila</div>
          <div className="val">{naFila}</div>
          <div className="d">
            {entregas.length ? `nas últimas ${entregas.length} entregas` : 'nenhuma entrega ainda'}
          </div>
        </div>
        <div className={`ck-kpi ${desistiu ? 'ck-k--red' : 'ck-k--violet'}`}>
          <div className="lbl">Desistiram</div>
          <div className="val">{desistiu}</div>
          <div className="d">{desistiu ? 'reprocesse depois de consertar o destino' : 'nada preso'}</div>
        </div>
      </div>

      {/* Recado do reprocesso: região viva, porque a ação não muda nada
          visível de imediato quando o destino continua fora do ar. */}
      <p aria-live="polite" role="status" className="pp-mono ck-m-0 ck-mt-3 ck-t-support ck-c-pulse ck-viva">
        {recado}
      </p>

      <div className="ck-duo ck-mt-4 ck-cols-2">
        {/* ═══ Coluna: chaves de API ═══ */}
        <div className="pp-stack">
          <section className="ck-panel" aria-labelledby="int-chaves-t">
            <div className="pp-between ck-ai-base">
              <div className="ck-panel__title" id="int-chaves-t">Chaves de API · {chaves.length}</div>
              <span className="pp-muted-2 pp-mono ck-t-support">somente leitura</span>
            </div>
            <p className="ck-panel__sub">
              A chave completa aparece uma vez, na criação. Depois só o prefixo.
            </p>

            {chaves.length === 0 && (
              <div className="pp-empty ck-mt-4">
                <div className="pp-empty__icon"><Icon name="scan" size={26} /></div>
                <div className="pp-empty__title">Nenhuma chave ainda</div>
                <p>Crie a primeira no formulário abaixo e cole no seu sistema.</p>
              </div>
            )}

            <div className="pp-stack pp-stack-3 ck-mt-4">
              {chaves.map((c) => {
                const revogada = !!c.revogada_em;
                return (
                  <article key={c.id} className={`ck-p-4 ck-item ${revogada ? 'ck-item--fraco' : ''}`}>
                    <div className="pp-between ck-gap-3">
                      <span className="ck-w-semi ck-t-support">{c.nome}</span>
                      <span className={`pp-badge ${revogada ? 'pp-badge--red' : 'pp-badge--success'}`}>
                        {revogada ? 'revogada' : 'ativa'}
                      </span>
                    </div>

                    <div className="pp-mono ck-mt-2 ck-t-support pp-muted ck-valor-tec">
                      {c.prefixo}<span aria-label=" seguido do restante oculto">…</span>
                    </div>

                    <div className="pp-cluster pp-cluster-2 ck-mt-2">
                      {(c.escopos ?? []).map((e) => (
                        <span key={e} className="ck-badge ck-t-label">{e}</span>
                      ))}
                    </div>

                    <div className="pp-between ck-mt-3 ck-gap-3 pp-wrap">
                      <span className="pp-mono pp-muted-2 ck-t-support">
                        {revogada
                          ? `revogada em ${dateTime(c.revogada_em)}`
                          : c.ultimo_uso_em
                            ? `último uso ${dateTime(c.ultimo_uso_em)}`
                            : 'nunca usada'}
                      </span>
                      {!revogada && (
                        <button type="button" className="ck-btn ck-btn--ghost ck-btn--sm"
                          onClick={() => setARevogar(c)}
                          aria-label={`Revogar a chave ${c.nome}`}>
                          <Icon name="trash" size={15} /> Revogar
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <form className="ck-panel" onSubmit={criarChave} aria-labelledby="int-nova-chave-t">
            <div className="ck-panel__title" id="int-nova-chave-t">Nova chave</div>
            <p className="ck-panel__sub">o nome é como você vai reconhecer a chave na hora de revogar</p>

            <div className="ck-field ck-mt-4">
              <label className="ck-label" htmlFor="int-chave-nome">Onde esta chave vai ser usada</label>
              <input id="int-chave-nome" className="ck-input" value={formChave.nome}
                onChange={(e) => setFormChave((f) => ({ ...f, nome: e.target.value }))}
                placeholder="ERP financeiro · servidor" required minLength={2} maxLength={60}
                aria-describedby="int-chave-nome-dica" />
              <p id="int-chave-nome-dica" className="pp-muted-2 ck-t-support ck-m-0">
                &quot;chave 2&quot; não ajuda ninguém a decidir se pode revogar.
              </p>
            </div>

            <fieldset className="ck-p-0 ck-m-0 ck-mb-4 ck-b-0">
              <legend className="ck-label ck-p-0">O que ela pode ler</legend>
              <div className="pp-stack pp-stack-1 ck-mt-2">
                {escoposCatalogo.map((e) => (
                  <label key={e.id} className={`pp-row ck-gap-3 ck-ai-start ck-opcao ${formChave.escopos.includes(e.id) ? 'is-on' : ''}`}>
                    <input type="checkbox" checked={formChave.escopos.includes(e.id)} onChange={() => setFormChave((f) => ({ ...f, escopos: alternar(f.escopos, e.id) }))} className="ck-mt-1 ck-shrink0 ck-check"/>
                    <span>
                      <span className="ck-t-support ck-w-semi">{e.titulo}</span>
                      <span className="pp-mono pp-muted-2 ck-t-support ck-ml-2">{e.id}</span>
                      <span className="pp-muted ck-block ck-t-support">{e.descricao}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <button className="ck-btn ck-btn--primary" disabled={criandoChave || !formChave.escopos.length}>
              <Icon name="plus" size={16} /> {criandoChave ? 'Criando…' : 'Criar chave'}
            </button>
            {!formChave.escopos.length && (
              <p className="pp-muted-2 ck-t-support ck-m-0 ck-mt-2">
                Escolha pelo menos um escopo.
              </p>
            )}
          </form>
        </div>

        {/* ═══ Coluna: webhooks ═══ */}
        <div className="pp-stack">
          {/* A limitação de disparo fica NO ALTO da coluna de webhooks, e não
              num rodapé de documentação: quem depende do aviso pra emitir nota
              ou liberar acesso precisa saber disso antes de cadastrar a URL. */}
          <div className="pp-note ck-m-0 ck-flex ck-gap-3 ck-ai-start ck-aviso ck-lh">
            <Icon name="clock" size={15} />
            <span>
              <strong>O envio é melhor esforço, não fila.</strong> O aviso é gravado sempre
              (nunca se perde), mas quem faz o POST é o processo logo depois da venda ou do
              check-in — não há agendador. Se o seu endpoint estiver fora do ar naquele
              instante, a entrega fica na fila e sai na próxima venda ou quando você apertar
              <strong> reprocessar</strong> aqui. Não trate a hora da chegada como a hora do fato.
            </span>
          </div>

          <section className="ck-panel" aria-labelledby="int-hooks-t">
            <div className="pp-between ck-ai-base">
              <div className="ck-panel__title" id="int-hooks-t">Webhooks · {assinaturas.length}</div>
              <span className="pp-muted-2 pp-mono ck-t-support">
                HMAC-SHA256 · 6 tentativas
              </span>
            </div>
            <p className="ck-panel__sub">
              Retentativa em 1 min, 5 min, 30 min, 2 h e 6 h. Depois disso a entrega marca
              &quot;desistiu&quot; e espera reprocesso.
            </p>

            {assinaturas.length === 0 && (
              <div className="pp-empty ck-mt-4">
                <div className="pp-empty__icon"><Icon name="share" size={26} /></div>
                <div className="pp-empty__title">Nenhum webhook ainda</div>
                <p>Cadastre a URL do seu sistema abaixo para receber os avisos.</p>
              </div>
            )}

            <div className="pp-stack pp-stack-3 ck-mt-4">
              {assinaturas.map((a) => {
                const s = porAssinatura.get(a.id);
                const temFalha = (s?.desistiu ?? 0) > 0;
                const emAcao = ocupado === a.id;
                return (
                  <article key={a.id} className={`ck-rel ck-p-4 ck-item ${temFalha ? 'ck-item--falha' : ''} ${a.ativa ? '' : 'ck-item--fraco'}`}>
                    {temFalha && (
                      <span aria-hidden="true" className="ck-item__fio-erro" />
                    )}

                    <div className="pp-between ck-gap-3 ck-ai-start">
                      <span className="pp-mono ck-t-support ck-quebra-suave">
                        {a.url}
                      </span>
                      <span className={`pp-badge ${a.ativa ? 'pp-badge--success' : 'pp-badge--neutral'} ck-shrink0`}>
                        {a.ativa ? 'ativo' : 'pausado'}
                      </span>
                    </div>

                    <div className="pp-cluster pp-cluster-2 ck-mt-2">
                      {(a.eventos ?? []).map((e) => (
                        <span key={e} className="ck-badge ck-t-label">{e}</span>
                      ))}
                    </div>

                    <div className="pp-mono pp-muted-2 ck-mt-2 ck-t-support">
                      {s
                        ? `${s.total} entrega(s) recente(s) · ${s.entregue} ok · ${s.pendente} na fila · ${s.desistiu} desistiu`
                        : 'nenhuma entrega recente'}
                    </div>

                    {s?.ultimaFalha?.erro && (
                      <p className="pp-mono ck-mt-2 ck-mb-0 ck-t-support ck-c-fg2 ck-erro-inline">
                        última falha: {s.ultimaFalha.erro}
                        {s.ultimaFalha.http_status ? ` (HTTP ${s.ultimaFalha.http_status})` : ''}
                      </p>
                    )}

                    <div className="pp-cluster pp-cluster-2 ck-mt-3">
                      <button type="button" className="ck-btn ck-btn--glass ck-btn--sm"
                        onClick={() => alternarAtiva(a)} disabled={emAcao}
                        aria-label={`${a.ativa ? 'Pausar' : 'Retomar'} o webhook ${a.url}`}>
                        <Icon name={a.ativa ? 'clock' : 'check'} size={15} /> {a.ativa ? 'Pausar' : 'Retomar'}
                      </button>
                      <button type="button" className="ck-btn ck-btn--glass ck-btn--sm"
                        onClick={() => reprocessar(a)} disabled={emAcao}
                        aria-label={`Reprocessar entregas falhas do webhook ${a.url}`}>
                        <Icon name="refresh" size={15} /> {emAcao ? 'Reprocessando…' : 'Reprocessar'}
                      </button>
                      <button type="button" className="ck-btn ck-btn--glass ck-btn--sm"
                        onClick={() => setARotacionar(a)} disabled={emAcao}
                        aria-label={`Trocar o segredo do webhook ${a.url}`}>
                        <Icon name="scan" size={15} /> Trocar segredo
                      </button>
                      <button type="button" className="ck-btn ck-btn--ghost ck-btn--sm"
                        onClick={() => setARemover(a)} disabled={emAcao}
                        aria-label={`Remover o webhook ${a.url}`}>
                        <Icon name="trash" size={15} /> Remover
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <form className="ck-panel" onSubmit={criarHook} aria-labelledby="int-novo-hook-t">
            <div className="ck-panel__title" id="int-novo-hook-t">Novo webhook</div>
            <p className="ck-panel__sub">https, endereço público — destino em rede interna é recusado</p>

            <div className="ck-field ck-mt-4">
              <label className="ck-label" htmlFor="int-hook-url">URL do seu sistema</label>
              <input id="int-hook-url" className="ck-input pp-mono" type="url" inputMode="url"
                autoCapitalize="off" autoCorrect="off" spellCheck="false"
                value={formHook.url} onChange={(e) => setFormHook((f) => ({ ...f, url: e.target.value }))}
                placeholder="https://seusistema.com.br/webhooks/pulsepass" required maxLength={500}
                aria-describedby="int-hook-url-dica" />
              <p id="int-hook-url-dica" className="pp-muted-2 ck-t-support ck-m-0">
                Responda 2xx rápido e processe depois: passamos de 10 s e a entrega vira falha.
              </p>
            </div>

            <fieldset className="ck-p-0 ck-m-0 ck-mb-4 ck-b-0">
              <legend className="ck-label ck-p-0">O que você quer receber</legend>
              <div className="pp-stack pp-stack-1 ck-mt-2">
                {eventosCatalogo.map((e) => (
                  <label key={e.id} className={`pp-row ck-gap-3 ck-ai-start ck-opcao ${formHook.eventos.includes(e.id) ? 'is-on' : ''}`}>
                    <input type="checkbox" checked={formHook.eventos.includes(e.id)} onChange={() => setFormHook((f) => ({ ...f, eventos: alternar(f.eventos, e.id) }))} className="ck-mt-1 ck-shrink0 ck-check"/>
                    <span>
                      <span className="ck-t-support ck-w-semi">{e.titulo}</span>
                      <span className="pp-mono pp-muted-2 ck-t-support ck-ml-2">{e.id}</span>
                      <span className="pp-muted ck-block ck-t-support">{e.descricao}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <button className="ck-btn ck-btn--primary" disabled={criandoHook || !formHook.eventos.length}>
              <Icon name="plus" size={16} /> {criandoHook ? 'Criando…' : 'Criar webhook'}
            </button>
            {!formHook.eventos.length && (
              <p className="pp-muted-2 ck-t-support ck-m-0 ck-mt-2">
                Escolha pelo menos um evento.
              </p>
            )}
          </form>
        </div>
      </div>

      {/* ═══ Entregas recentes ═══
          O mockup punha "integrações nativas 1-click" aqui embaixo. Elas não
          existem. O que existe — e o integrador precisa — é o extrato do que
          saiu, com o erro à vista e o caminho de conserto ao lado. */}
      <section className="ck-panel ck-mt-5" aria-labelledby="int-entregas-t">
        <div className="pp-between ck-ai-base">
          <div className="ck-panel__title" id="int-entregas-t">Entregas recentes</div>
          <span className="pp-muted-2 pp-mono ck-t-support">
            últimas {entregas.length} · todas as assinaturas
          </span>
        </div>
        <p className="ck-panel__sub">
          O corpo enviado não aparece aqui — são dezenas de KB por linha. O que fica é o
          que explica a falha.
        </p>

        {entregas.length === 0 ? (
          <div className="pp-empty ck-mt-4">
            <div className="pp-empty__icon"><Icon name="receipt" size={26} /></div>
            <div className="pp-empty__title">Nada saiu ainda</div>
            <p>A primeira entrega aparece aqui assim que um pedido for pago ou um ingresso for lido na porta.</p>
          </div>
        ) : (
          <div className="ck-tablewrap ck-mt-4">
            <table className="ck-table">
              <caption className="pp-muted-2 ck-t-support ck-caption--fim">
                Entregas de webhook, da mais recente para a mais antiga.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Quando</th>
                  <th scope="col">Evento</th>
                  <th scope="col">Destino</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="num">Tentativas</th>
                  <th scope="col">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {entregas.map((e) => {
                  const st = STATUS_ENTREGA[e.status] ?? { rotulo: e.status, classe: 'pp-badge--neutral' };
                  const destino = assinaturas.find((a) => a.id === e.assinatura_id);
                  return (
                    <tr key={e.id}>
                      <td className="pp-mono ck-t-support ck-nowrap">
                        {dateTime(e.created_at)}
                      </td>
                      <td className="pp-mono ck-t-support">{e.evento}</td>
                      <td className="pp-mono pp-muted ck-t-support ck-td-longa">
                        {destino?.url ?? '—'}
                      </td>
                      <td><span className={`pp-badge ${st.classe}`}>{st.rotulo}</span></td>
                      <td className="num pp-mono ck-t-support">{e.tentativas ?? 0}</td>
                      <td className="pp-mono ck-t-support pp-muted">
                        {e.entregue_em
                          ? `HTTP ${e.http_status ?? '2xx'} · ${dateTime(e.entregue_em)}`
                          : e.erro
                            ? e.erro
                            : e.status === 'pendente'
                              ? `próxima tentativa ${dateTime(e.proxima_tentativa_em)}`
                              : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ═══ Contrato da integração ═══ */}
      <section className="ck-panel ck-mt-4" aria-labelledby="int-doc-t">
        <div className="ck-panel__title" id="int-doc-t">O contrato, em quatro linhas</div>
        <p className="ck-panel__sub">é isso que o seu desenvolvedor precisa saber</p>

        <div className="ck-duo ck-mt-4 ck-cols-2">
          <div>
            <div className="ck-label">Endereço da API</div>
            <div className="pp-row ck-gap-3 ck-mt-2 pp-wrap">
              <code className="pp-mono ck-t-support ck-c-fg2 ck-valor-tec">
                {BASE_PUBLICA}
              </code>
              <BotaoCopiar valor={BASE_PUBLICA} chave="base" copiado={copiado} copiar={copiar}
                rotulo="Copiar endereço" />
            </div>
            <p className="pp-muted ck-t-support ck-mt-3 ck-lh">
              Autenticação por <span className="pp-mono">Authorization: Bearer &lt;sua chave&gt;</span>.
              Comece por <span className="pp-mono">GET /eu</span> — ele confirma que a chave vale e
              diz quais escopos ela tem. Depois:{' '}
              <span className="pp-mono">/eventos</span>, <span className="pp-mono">/eventos/:id/ingressos</span>{' '}
              e <span className="pp-mono">/pedidos</span>. Só leitura, sempre recortado pela sua produtora.
            </p>
            <p aria-live="polite" role="status" className="pp-mono ck-m-0 ck-mt-1 ck-t-support ck-c-pulse ck-viva">
              {copiado === 'base' ? 'endereço copiado ✓' : ''}
            </p>
          </div>

          <div>
            <div className="ck-label">Assinatura do webhook</div>
            <p className="pp-muted ck-t-support ck-mt-2 ck-lh">
              Todo POST leva o cabeçalho <span className="pp-mono">X-PulsePass-Signature</span> no
              formato <span className="pp-mono">t=&lt;unix&gt;,v1=&lt;hex&gt;</span>. O{' '}
              <span className="pp-mono">v1</span> é HMAC-SHA256 de{' '}
              <span className="pp-mono">&quot;&lt;t&gt;.&lt;corpo bruto&gt;&quot;</span> com o segredo do
              webhook. Confira sobre o corpo <em>bruto</em>, antes de qualquer parse, e recuse o que
              tiver <span className="pp-mono">t</span> de mais de 5 minutos atrás — senão uma entrega
              capturada pode ser reenviada por outra pessoa.
            </p>
            <p className="pp-muted-2 ck-t-support ck-mt-2 ck-lh">
              O <span className="pp-mono">id</span> da entrega vai no corpo e se repete a cada
              retentativa: use-o como chave de idempotência para não lançar a mesma venda duas vezes.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ Diálogos ═══ */}

      <SegredoUnico
        aberto={!!segredo}
        titulo={segredo?.titulo ?? ''}
        contexto={segredo?.contexto ?? ''}
        rotuloValor={segredo?.rotuloValor ?? ''}
        valor={segredo?.valor ?? ''}
        comoUsar={segredo?.comoUsar}
        onFechar={() => setSegredo(null)}
      />

      <Confirmar
        aberto={!!aRevogar}
        titulo={`Revogar a chave "${aRevogar?.nome ?? ''}"?`}
        descricao={
          `Todo sistema que usa esta chave para de funcionar no mesmo instante — sem período de graça. `
          + `Prefixo ${aRevogar?.prefixo ?? ''}. `
          + (aRevogar?.ultimo_uso_em
            ? `Foi usada pela última vez em ${dateTime(aRevogar.ultimo_uso_em)}, então há algo dependendo dela.`
            : 'Nunca foi usada — revogar não deve derrubar nada.')
          + ' Não dá para desfazer: se precisar de novo, crie outra chave.'
        }
        confirmar="Revogar chave"
        onConfirmar={() => revogar(aRevogar)}
        onFechar={() => setARevogar(null)}
      />

      <Confirmar
        aberto={!!aRemover}
        titulo="Remover este webhook?"
        descricao={
          `${aRemover?.url ?? ''} para de receber avisos imediatamente, e o histórico de entregas `
          + 'dele some junto. Se a ideia é só parar por um tempo, use "Pausar" — assim o endereço, '
          + 'os eventos e o segredo continuam de pé.'
        }
        confirmar="Remover webhook"
        onConfirmar={() => remover(aRemover)}
        onFechar={() => setARemover(null)}
      />

      <Confirmar
        aberto={!!aRotacionar}
        titulo="Trocar o segredo deste webhook?"
        descricao={
          'O segredo atual para de valer no mesmo instante. Enquanto você não colar o novo no seu '
          + 'servidor, tudo que chegar lá vai falhar na conferência de assinatura. O novo valor '
          + 'aparece uma única vez, na tela seguinte — tenha onde colar antes de confirmar.'
        }
        confirmar="Gerar novo segredo"
        onConfirmar={() => rotacionar(aRotacionar)}
        onFechar={() => setARotacionar(null)}
      />
    </Shell>
  );
}
