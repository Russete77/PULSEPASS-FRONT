import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Shell, Loading, ErrorBox, BackLink } from '../components/Shell.jsx';
import { api } from '../lib/api.js';
import { brl } from '../lib/format.js';

/**
 * Assento marcado — a grade da casa, no cockpit.
 *
 * A rota que gera a grade existe desde a 0043 e nunca teve por onde ser
 * chamada: a produtora conseguia vender assento marcado só se alguém rodasse
 * um POST na mão. Esta tela é esse "por onde".
 *
 * Duas coisas moldam o desenho:
 *
 * 1. GERAR É IRREVERSÍVEL POR AQUI. Não existe rota que apague assento, e é
 *    proposital — apagar um assento vendido apagaria o lugar de quem pagou.
 *    Então a conta (fileiras × por fileira) aparece em tamanho de dinheiro
 *    ANTES do envio, e o envio tem um segundo passo de confirmação. Errar
 *    "20" por "200" aqui é caro e ninguém desfaz.
 *
 * 2. O MAPA É O DO COMPRADOR. Vem do catálogo público (/events/:slug/assentos),
 *    sem token: o que a produtora confere é exatamente o que a pessoa vê ao
 *    escolher a poltrona. Ele só existe para evento PUBLICADO — em rascunho a
 *    tela diz que falta publicar, em vez de mostrar erro.
 */

/* Limites do servidor (zod em seats/controller.js). Repetidos aqui para o
   campo já recusar antes da viagem — 400 do servidor não diz qual campo. */
const MAX_FILEIRAS = 40;
const MAX_POR_FILEIRA = 60;

/**
 * Cor por estado, na leitura do COCKPIT — que é diferente da leitura do app do
 * cliente. Lá o verde é "o meu lugar"; aqui verde é VENDIDO, porque a pergunta
 * da produtora ao abrir o mapa é quanto da casa já saiu. Livre fica apagado de
 * propósito: casa nova é uma parede cinza que vai acendendo.
 */
const ESTADOS = [
  { k: 'sold', rotulo: 'Vendido', tom: 'ck-k--pulse', cor: 'ck-c-pulse' },
  { k: 'held', rotulo: 'Reservado', tom: 'ck-k--amber', cor: 'ck-c-amber' },
  { k: 'free', rotulo: 'Livre', tom: 'ck-k--dim', cor: 'ck-c-fg' },
  { k: 'blocked', rotulo: 'Bloqueado', tom: 'ck-k--dim', cor: 'ck-c-dim' },
];
const TOM = Object.fromEntries(ESTADOS.map((e) => [e.k, e.tom]));
const ROTULO = Object.fromEntries(ESTADOS.map((e) => [e.k, e.rotulo]));

/** A, B, … Z, AA, AB — a MESMA regra do servidor, para a prévia não mentir. */
function nomeFileira(i) {
  return i < 26
    ? String.fromCharCode(65 + i)
    : String.fromCharCode(65 + Math.floor(i / 26) - 1) + String.fromCharCode(65 + (i % 26));
}

/** O 409 do servidor: "O setor X já tem assentos." É recusa esperada, não falha. */
const E_CONFLITO = /j[áa] tem assentos/i;

const inteiro = (v) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? n : 0;
};

const chaveSetor = (s) => s.trim().toLocaleLowerCase('pt-BR');

const VAZIO = { setor: '', tier_id: '', fileiras: '10', por_fileira: '20' };

export default function Assentos() {
  const { id } = useParams();
  const [evento, setEvento] = useState(null);
  const [mapa, setMapa] = useState(null);
  // 'carregando' | 'ok' | 'rascunho' (não publicado, mapa público não existe) | 'erro'
  const [mapaEstado, setMapaEstado] = useState('carregando');
  const [status, setStatus] = useState('loading');
  const [erro, setErro] = useState('');
  const [form, setForm] = useState(VAZIO);
  const [confirmando, setConfirmando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [conflito, setConflito] = useState(null);
  const [feito, setFeito] = useState(null);
  const btnConfirmar = useRef(null);

  const carregarMapa = useCallback(async (ev) => {
    if (!ev?.slug || ev.status !== 'published') { setMapa(null); setMapaEstado('rascunho'); return; }
    try {
      setMapa(await api.mapaAssentos(ev.slug));
      setMapaEstado('ok');
    } catch {
      // Mapa é conferência, não base: se ele falhar, gerar a grade continua
      // possível. Derrubar a tela inteira por causa do painel de leitura
      // tiraria da produtora a única ação que ela veio fazer.
      setMapa(null); setMapaEstado('erro');
    }
  }, []);

  const carregar = useCallback(async () => {
    const ev = await api.getEvent(id);
    setEvento(ev);
    setStatus('done');
    await carregarMapa(ev);
  }, [id, carregarMapa]);

  useEffect(() => {
    carregar().catch((e) => { setErro(e.message); setStatus('error'); });
  }, [carregar]);

  // O passo de confirmação troca o botão de lugar. Sem mover o foco, quem
  // navega por teclado é jogado no começo do documento e não encontra o
  // "Confirmar" que acabou de pedir.
  useEffect(() => { if (confirmando) btnConfirmar.current?.focus(); }, [confirmando]);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setConfirmando(false); setConflito(null); setFeito(null);
  };

  const tiers = evento?.tiers ?? [];
  const lote = tiers.find((t) => t.id === form.tier_id) ?? null;
  const fileiras = inteiro(form.fileiras);
  const porFileira = inteiro(form.por_fileira);
  const total = fileiras * porFileira;
  const setorLimpo = form.setor.trim();

  /* Setores que JÁ têm grade. É com esta lista que a tela evita o 409 antes
     do clique — o servidor recusa de qualquer jeito, mas descobrir depois de
     preencher quatro campos é pior do que não poder clicar. */
  const setoresExistentes = useMemo(
    () => new Map((mapa?.setores ?? []).map((s) => [chaveSetor(s.nome), s.nome])),
    [mapa],
  );
  const jaExiste = setorLimpo ? setoresExistentes.get(chaveSetor(setorLimpo)) : null;

  const foraDoLimite = fileiras > MAX_FILEIRAS || porFileira > MAX_POR_FILEIRA;
  const podeGerar = Boolean(
    setorLimpo && form.tier_id && fileiras > 0 && porFileira > 0 && !foraDoLimite && !jaExiste,
  );

  async function gerar() {
    setSalvando(true); setErro(''); setConflito(null);
    try {
      const r = await api.gerarAssentos(id, {
        setor: setorLimpo, tier_id: form.tier_id,
        fileiras, por_fileira: porFileira,
      });
      setFeito({ criados: r.criados, setor: r.setor ?? setorLimpo });
      setConfirmando(false);
      setForm((f) => ({ ...VAZIO, tier_id: f.tier_id }));
      await carregarMapa(evento);
    } catch (e) {
      setConfirmando(false);
      // 409: o setor já tem grade. Gerar de novo criaria a MESMA poltrona duas
      // vezes — dois ingressos para a fileira A número 1. Sai como orientação,
      // não como "erro ao salvar", porque existe uma saída concreta.
      if (E_CONFLITO.test(e.message)) setConflito(setorLimpo);
      else setErro(e.message);
    } finally { setSalvando(false); }
  }

  if (status === 'loading') return <Shell><Loading label="Carregando a casa…" /></Shell>;
  if (status === 'error') return <Shell><ErrorBox>{erro}</ErrorBox></Shell>;

  const setores = mapa?.setores ?? [];
  const geral = { free: 0, held: 0, sold: 0, blocked: 0 };
  for (const s of setores) {
    for (const f of s.fileiras) for (const a of f.assentos) geral[a.status] = (geral[a.status] ?? 0) + 1;
  }
  const totalMapa = Object.values(geral).reduce((a, b) => a + b, 0);

  return (
    <Shell>
      <BackLink to={`/eventos/${id}`} label="Dashboard" />

      <div className="ck-between ck-ai-end pp-wrap ck-gap-3">
        <div>
          <div className="ck-eyebrow">assento marcado · grade da casa</div>
          <h1 className="ck-h1">Assentos</h1>
          <p className="ck-sub ck-mb-0">
            Gere a grade de cada setor e confira o mapa que o comprador vê ao escolher a poltrona.
          </p>
        </div>
        {mapaEstado === 'ok' && totalMapa > 0 && (
          <div className="ck-caixa--sm">
            <div className="ck-eyebrow">Na casa</div>
            <div className="pp-mono ck-w-bold ck-t-section">{totalMapa}</div>
          </div>
        )}
      </div>

      {erro && <ErrorBox>{erro}</ErrorBox>}

      {/* Resultado da última geração. Fica visível porque o número criado é a
          única confirmação de que a conta batia com a intenção. */}
      {feito && (
        <div className="ck-card ck-w-read ck-mt-4 ck-panel--pulse" role="status">
          <strong>{feito.criados} assentos criados no setor “{feito.setor}”</strong>
          <p className="ck-c-fg2 ck-t-support ck-m-0 ck-mt-2">
            {evento.status === 'published'
              ? 'Já estão no mapa abaixo e à venda na página do evento.'
              : 'Ficam à venda quando o evento for publicado — o mapa público só existe a partir daí.'}
          </p>
        </div>
      )}

      {/* ── Conflito de setor (409) ──
          Não é "deu erro": é o servidor protegendo a casa de ter a mesma
          poltrona duas vezes. O bloco diz o que fazer, e o botão já faz. */}
      {conflito && (
        <div className="ck-card ck-aviso ck-w-read ck-mt-4" role="alert">
          <strong>O setor “{conflito}” já tem grade</strong>
          <p className="ck-c-fg2 ck-t-support ck-m-0 ck-mt-2">
            Nada foi criado agora. Gerar de novo faria a fileira A número 1
            existir duas vezes — e dois ingressos para a mesma poltrona só
            aparecem na porta, com as duas pessoas de pé.
          </p>
          <ul className="ck-bullets ck-c-fg2 ck-t-support ck-mt-3">
            <li>
              Falta uma parte da casa? Gere com <strong>outro nome de setor</strong>.
              Cada setor tem a própria numeração de fileira e o próprio lote.
            </li>
            <li>
              Errou o tamanho da grade? O conserto não passa por esta tela: não
              existe rota que apague assento, porque apagar um assento vendido
              apagaria o lugar de alguém que pagou. Fale com o suporte.
            </li>
          </ul>
          <button
            type="button"
            className="ck-btn ck-btn--glass ck-mt-3"
            onClick={() => { setForm((f) => ({ ...f, setor: `${conflito} B` })); setConflito(null); }}
          >
            Usar “{conflito} B”
          </button>
        </div>
      )}

      {/* ── Gerar a grade ── */}
      <h2 className="ck-secao">Gerar grade de um setor</h2>

      {tiers.length === 0 ? (
        <div className="ck-card ck-aviso ck-w-read">
          <strong>Este evento ainda não tem lotes</strong>
          <p className="ck-c-fg2 ck-t-support ck-m-0 ck-mt-2">
            O assento não guarda preço — quem carrega o preço é o lote. Crie ao
            menos um lote no evento e volte aqui para montar a grade.
          </p>
        </div>
      ) : (
        <div className="ck-card ck-w-read">
          <div className="ck-row">
            <div className="ck-field ck-m-0">
              <label className="ck-label" htmlFor="assentos-setor">Setor</label>
              <input
                id="assentos-setor"
                className="ck-input"
                value={form.setor}
                onChange={set('setor')}
                maxLength={60}
                required
                placeholder="Plateia"
                autoComplete="off"
                aria-describedby="assentos-setor-ajuda"
              />
              <p id="assentos-setor-ajuda" className="ck-t-support ck-m-0 pp-muted-2">
                {jaExiste
                  ? `“${jaExiste}” já tem grade — escolha outro nome.`
                  : 'Como a casa chama esse pedaço: Plateia, Balcão, Mezanino.'}
              </p>
            </div>

            <div className="ck-field ck-m-0">
              <label className="ck-label" htmlFor="assentos-lote">Lote (o preço vem daqui)</label>
              <select
                id="assentos-lote"
                className="ck-select"
                value={form.tier_id}
                onChange={set('tier_id')}
                required
              >
                <option value="">Escolha o lote…</option>
                {tiers.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} · {brl(t.price_cents)}</option>
                ))}
              </select>
            </div>

            <div className="ck-field ck-m-0">
              <label className="ck-label" htmlFor="assentos-fileiras">Fileiras</label>
              <input
                id="assentos-fileiras"
                className="ck-input ck-input--num"
                type="number"
                inputMode="numeric"
                min="1"
                max={MAX_FILEIRAS}
                value={form.fileiras}
                onChange={set('fileiras')}
                aria-describedby="assentos-fileiras-ajuda"
              />
              <p id="assentos-fileiras-ajuda" className="ck-t-support ck-m-0 pp-muted-2">
                até {MAX_FILEIRAS} · nomeadas A, B, C…
              </p>
            </div>

            <div className="ck-field ck-m-0">
              <label className="ck-label" htmlFor="assentos-por-fileira">Assentos por fileira</label>
              <input
                id="assentos-por-fileira"
                className="ck-input ck-input--num"
                type="number"
                inputMode="numeric"
                min="1"
                max={MAX_POR_FILEIRA}
                value={form.por_fileira}
                onChange={set('por_fileira')}
                aria-describedby="assentos-por-fileira-ajuda"
              />
              <p id="assentos-por-fileira-ajuda" className="ck-t-support ck-m-0 pp-muted-2">
                até {MAX_POR_FILEIRA} · numerados 1, 2, 3…
              </p>
            </div>
          </div>

          {/* ── A CONTA ──
              O número que a produtora precisa reconhecer antes de apertar.
              aria-live porque ele muda enquanto se digita nos campos acima. */}
          <div className="ck-caixa ck-mt-4" aria-live="polite">
            {total > 0 ? (
              <>
                <div className="ck-flex ck-ai-base ck-gap-3 pp-wrap">
                  <span className="pp-mono pp-muted ck-t-support">
                    {fileiras} {fileiras === 1 ? 'fileira' : 'fileiras'} × {porFileira} por fileira =
                  </span>
                  <span className="pp-mono ck-t-money">{total}</span>
                  <span className="pp-muted ck-t-support">assentos</span>
                </div>
                <p className="ck-c-fg2 ck-t-support ck-m-0 ck-mt-2">
                  Fileira {nomeFileira(0)} até {nomeFileira(fileiras - 1)}, assentos 1 a {porFileira}
                  {lote ? ` · lote ${lote.name}, ${brl(lote.price_cents)} cada` : ''}
                  {lote ? ` · ${brl(lote.price_cents * total)} com a casa cheia` : ''}
                </p>
              </>
            ) : (
              <span className="pp-muted ck-t-support">
                Preencha fileiras e assentos por fileira para ver quantos lugares serão criados.
              </span>
            )}
          </div>

          {foraDoLimite && (
            <p className="ck-c-amber ck-t-support ck-m-0 ck-mt-3" role="alert">
              O servidor aceita no máximo {MAX_FILEIRAS} fileiras e {MAX_POR_FILEIRA} assentos por
              fileira. Casa maior que isso se monta em mais de um setor.
            </p>
          )}

          {/* Passo 2. Gerar não é desfazível por esta tela, então o clique que
              cria a grade nunca é o mesmo clique que preenche o formulário. */}
          {confirmando ? (
            <div className="ck-caixa ck-mt-4 ck-panel--amber" role="group" aria-label="Confirmar geração da grade">
              <strong>Criar {total} assentos no setor “{setorLimpo}”?</strong>
              <p className="ck-c-fg2 ck-t-support ck-m-0 ck-mt-2">
                Esta tela não apaga assento depois — a grade do setor se monta uma vez só.
              </p>
              <div className="ck-flex ck-gap-2 ck-mt-3 pp-wrap">
                <button
                  ref={btnConfirmar}
                  type="button"
                  className="ck-btn ck-btn--primary"
                  onClick={gerar}
                  disabled={salvando}
                >
                  {salvando ? 'Criando…' : `Sim, criar ${total} assentos`}
                </button>
                <button
                  type="button"
                  className="ck-btn ck-btn--glass"
                  onClick={() => setConfirmando(false)}
                  disabled={salvando}
                >
                  Voltar e revisar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="ck-btn ck-btn--primary ck-mt-4"
              onClick={() => { setConfirmando(true); setFeito(null); }}
              disabled={!podeGerar || salvando}
              title={jaExiste ? `O setor “${jaExiste}” já tem grade` : undefined}
            >
              {total > 0 ? `Gerar ${total} assentos` : 'Gerar grade'}
            </button>
          )}
        </div>
      )}

      {/* ── O mapa que já existe ── */}
      <h2 className="ck-secao">Mapa da casa</h2>

      {mapaEstado === 'rascunho' && (
        <div className="ck-card ck-aviso ck-w-read">
          <strong>O mapa aparece depois de publicar</strong>
          <p className="ck-c-fg2 ck-t-support ck-m-0 ck-mt-2">
            Ele é lido da página pública do evento — a mesma resposta que o
            comprador recebe. Enquanto o evento está em rascunho essa página não
            existe. A grade pode ser gerada agora; ela estará lá quando publicar.
          </p>
        </div>
      )}

      {mapaEstado === 'erro' && (
        <div className="ck-card ck-w-read">
          <strong>Não deu para ler o mapa público agora</strong>
          <p className="ck-c-fg2 ck-t-support ck-m-0 ck-mt-2">
            A geração de grade acima continua funcionando — só a conferência
            ficou indisponível.
          </p>
          <button type="button" className="ck-btn ck-btn--glass ck-mt-3" onClick={() => carregarMapa(evento)}>
            Tentar de novo
          </button>
        </div>
      )}

      {mapaEstado === 'ok' && setores.length === 0 && (
        <div className="ck-empty">
          <p className="ck-m-0 ck-mb-1">Nenhum setor com grade ainda.</p>
          <p className="ck-m-0 ck-t-support">
            Sem assentos, o evento vende ingresso sem lugar marcado — o que pode
            ser exatamente o certo para uma pista.
          </p>
        </div>
      )}

      {mapaEstado === 'ok' && setores.length > 0 && (
        <>
          <div className="ck-between pp-wrap ck-gap-3 ck-mb-4">
            <div className="ck-flex ck-gap-4 pp-wrap" aria-hidden="true">
              {ESTADOS.map((e) => (
                <span key={e.k} className="ck-status pp-muted">
                  <span className={`ck-assento ${e.tom} ${e.k === 'blocked' ? 'ck-assento--vazio' : ''}`} />
                  {e.rotulo}
                </span>
              ))}
            </div>
            <button type="button" className="ck-btn ck-btn--glass ck-btn--sm" onClick={() => carregarMapa(evento)}>
              Atualizar mapa
            </button>
          </div>

          <div className="pp-stack">
            {setores.map((s) => {
              const conta = { free: 0, held: 0, sold: 0, blocked: 0 };
              for (const f of s.fileiras) for (const a of f.assentos) conta[a.status] = (conta[a.status] ?? 0) + 1;
              const daSetor = s.fileiras.reduce((n, f) => n + f.assentos.length, 0);
              const porFila = s.fileiras[0]?.assentos.length ?? 0;

              return (
                <section key={s.nome} className="ck-panel" aria-label={`Setor ${s.nome}`}>
                  <div className="ck-between ck-ai-end pp-wrap ck-gap-3">
                    <div>
                      <div className="ck-eyebrow">setor</div>
                      <div className="ck-t-section ck-display">{s.nome}</div>
                      <p className="ck-sub ck-m-0 ck-mt-1 ck-t-support">
                        {s.lote ?? 'lote removido'}
                        {s.preco_cents != null ? ` · ${brl(s.preco_cents)} por assento` : ''}
                      </p>
                    </div>
                    <div className="ck-flex ck-gap-3 pp-wrap">
                      {ESTADOS.filter((e) => e.k !== 'blocked' || conta.blocked > 0).map((e) => (
                        <div key={e.k} className="ck-caixa--sm">
                          <div className="ck-eyebrow">{e.rotulo}</div>
                          <div className={`pp-mono ck-w-bold ck-t-section ${e.cor}`}>
                            {conta[e.k]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* O resumo em texto é a versão acessível do desenho abaixo —
                      e é também o que se lê mais rápido. 240 quadradinhos
                      anunciados um a um não informam ninguém. */}
                  <p className="ck-c-fg2 ck-t-support ck-mt-3 ck-mb-0">
                    {s.fileiras.length} {s.fileiras.length === 1 ? 'fileira' : 'fileiras'}
                    {' '}({s.fileiras[0]?.fileira} a {s.fileiras[s.fileiras.length - 1]?.fileira})
                    {porFila ? `, ${porFila} por fileira` : ''} · {daSetor} assentos ·
                    {' '}{conta.sold} vendidos, {conta.held} reservados, {conta.free} livres.
                  </p>

                  <div className="ck-mapa ck-scroll ck-mt-4" aria-hidden="true">
                    {s.fileiras.map((f) => (
                      <div key={f.fileira} className="ck-mapa__fila">
                        <span className="ck-mapa__rot pp-mono ck-t-label">{f.fileira}</span>
                        <div className="ck-mapa__assentos">
                          {f.assentos.map((a) => (
                            <span
                              key={a.id}
                              className={`ck-assento ${TOM[a.status] ?? 'ck-k--dim'} ${a.status === 'blocked' ? 'ck-assento--vazio' : ''}`}
                              title={`${f.fileira}${a.numero} · ${ROTULO[a.status] ?? a.status}`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          <p className="ck-t-support pp-muted-2 ck-mt-4">
            Reserva de assento vence sozinha em {mapa.minutos_reserva} minutos — o que está
            “reservado” volta a ficar livre se ninguém pagar.
          </p>
        </>
      )}
    </Shell>
  );
}
