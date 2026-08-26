import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Page } from '../components/Layout.jsx';
import { Loading, ErrorBox, Empty } from '../components/States.jsx';
import { Icon } from '../components/Icon.jsx';
import { api } from '../lib/api.js';
import { brl, dateTime } from '../lib/format.js';

/**
 * Fidelidade — pontos POR PRODUTORA.
 *
 * A decisão que organiza a tela inteira: não existe saldo global. Somar os
 * pontos de três casas num número só produziria um total que não pode ser
 * gasto em lugar nenhum — a coisa mais fácil de desenhar e a mais fácil de
 * quebrar a confiança na primeira tentativa de resgate. Cada produtora é um
 * cartão com o seu próprio saldo, a sua própria regra e o seu próprio mínimo.
 *
 * O que a tela deliberadamente NÃO faz:
 *
 * - Não mostra valor em dinheiro sem `centavos_por_ponto`. Enquanto a
 *   produtora não define quanto vale um ponto, o backend recusa o resgate com
 *   409 (SEM_REGRA_DE_VALOR). Anunciar "seus 400 pontos valem R$ 40" antes
 *   dessa regra existir é prometer dinheiro que ninguém vai pagar.
 * - Não inventa "em breve". Sem programa ativo em lugar nenhum, o estado
 *   vazio diz exatamente isso e manda a pessoa de volta para os eventos.
 * - Não põe barra de progresso até o mínimo: o número em texto já diz quanto
 *   falta, e a barra exigiria largura em estilo inline, que o app não usa.
 *
 * Saldo NEGATIVO é estado de produção, não canto raro: o gatilho de estorno
 * (migration 0056) lança pontos negativos quando o pedido é reembolsado, mesmo
 * que os pontos já tenham sido resgatados — o saldo fica devendo de propósito,
 * porque zerar seria a plataforma absorvendo o prejuízo. Formatar isso pelo
 * valor absoluto com o sinal à parte é a mesma lição da carteira, onde o
 * cálculo direto no número negativo imprimia "R$ -13,-50".
 */

const TIPO_ROTULO = {
  acumulo: 'Acúmulo',
  resgate: 'Resgate',
  estorno: 'Estorno',
  ajuste: 'Ajuste',
};
const TIPO_ICONE = {
  acumulo: 'plus',
  resgate: 'tag',
  estorno: 'refresh',
  ajuste: 'edit',
};

/** Número de pontos com separador de milhar — nunca com símbolo de moeda. */
const pts = (n) => Math.abs(Number(n ?? 0)).toLocaleString('pt-BR');
/** Números da regra podem vir fracionados (numeric(10,2) no banco). */
const num = (n) => Number(n ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 });

/**
 * A regra de acúmulo, em palavras. Some quando a produtora não pontua.
 */
function regraAcumulo(pontosPorReal) {
  const n = Number(pontosPorReal ?? 0);
  if (!(n > 0)) return null;
  return `Você ganha ${num(n)} ${n === 1 ? 'ponto' : 'pontos'} por real gasto`;
}

/**
 * Quanto vale um ponto, em palavras.
 *
 * Com centavos fracionados, "cada ponto vale R$ 0,01" é arredondamento para
 * cima disfarçado de fato — a frase passa a ser por 100 pontos, que é a menor
 * unidade em que o número não mente. Math.floor porque a tela nunca deve
 * prometer mais do que o servidor vai pagar.
 */
function regraValor(centavosPorPonto) {
  const c = Number(centavosPorPonto ?? 0);
  if (!(c > 0)) return null;
  if (Number.isInteger(c)) return `cada ponto vale ${brl(c)}`;
  const por100 = Math.floor(c * 100);
  if (por100 <= 0) return null;
  return `a cada 100 pontos, ${brl(por100)}`;
}

export default function Fidelidade() {
  const [programas, setProgramas] = useState([]);
  const [saldos, setSaldos] = useState({});
  const [status, setStatus] = useState('loading');
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    try {
      const lista = (await api.fidelidadeProgramas()) ?? [];
      setProgramas(lista);
      // Um saldo por produtora, em paralelo. Uma produtora que sai do ar entre
      // a listagem e a consulta devolve 404 e derruba só o próprio cartão —
      // não a tela inteira.
      const pares = await Promise.all(
        lista.map(async (p) => {
          try {
            return [p.organization_id, { ok: true, dados: await api.fidelidadeSaldo(p.organization_id) }];
          } catch (e) {
            return [p.organization_id, { ok: false, erro: e.message }];
          }
        }),
      );
      setSaldos(Object.fromEntries(pares));
      setStatus('done');
    } catch (e) {
      setErro(e.message);
      setStatus('error');
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  /** Recarrega UMA produtora — depois de um resgate o resto da tela não mudou. */
  const recarregarSaldo = useCallback(async (orgId) => {
    try {
      const dados = await api.fidelidadeSaldo(orgId);
      setSaldos((s) => ({ ...s, [orgId]: { ok: true, dados } }));
    } catch (e) {
      setSaldos((s) => ({ ...s, [orgId]: { ok: false, erro: e.message } }));
    }
  }, []);

  // Onde a pessoa TEM pontos vem primeiro. Numa lista de programas ativos, a
  // maioria dos cartões costuma estar zerada, e deixar o saldo real no fim da
  // rolagem é esconder a única coisa que ela veio ver.
  const ordenados = useMemo(() => {
    const peso = (p) => {
      const d = saldos[p.organization_id]?.dados;
      if (!d) return 0;
      if (Number(d.saldo_pontos) !== 0) return 2;
      return (d.extrato?.length ?? 0) > 0 ? 1 : 0;
    };
    return [...programas].sort((a, b) => peso(b) - peso(a));
  }, [programas, saldos]);

  return (
    <Page>
      <div className="pp-fid">
        <div className="pp-reveal">
          <div className="pp-eyebrow">seus pontos</div>
          <h1 className="pp-titulo-sob">Fidelidade</h1>
          <p className="pp-prosa pp-mt-3">
            Cada produtora tem o programa dela. Os pontos valem na casa onde
            você juntou — não somam entre produtoras diferentes.
          </p>
        </div>

        {status === 'loading' && <Loading label="Buscando seus pontos…" />}
        {status === 'error' && <div className="pp-mt-6"><ErrorBox>{erro}</ErrorBox></div>}

        {status === 'done' && programas.length === 0 && (
          <Empty>
            <div className="pp-empty__icon"><Icon name="crown" size={30} /></div>
            <div className="pp-empty__title">Nenhum programa de pontos ativo</div>
            <p>
              Nenhuma produtora está com o programa de fidelidade no ar agora.{' '}
              <Link to="/" className="pp-link">Ver eventos</Link>
            </p>
          </Empty>
        )}

        {status === 'done' && programas.length > 0 && (
          <div className="pp-stack pp-stack-4 pp-mt-6 pp-reveal-group">
            {ordenados.map((p) => (
              <CartaoPrograma
                key={p.organization_id}
                programa={p}
                saldo={saldos[p.organization_id]}
                onMudou={() => recarregarSaldo(p.organization_id)}
              />
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}

/**
 * Um cartão por produtora: saldo, regra, e as duas ações que existem —
 * resgatar e conferir o extrato.
 */
function CartaoPrograma({ programa, saldo, onMudou }) {
  const [painel, setPainel] = useState(null); // null | 'resgate' | 'extrato'

  const dados = saldo?.ok ? saldo.dados : null;
  const nome = programa.nome?.trim() || 'Produtora';
  const idBase = `fid-${programa.organization_id}`;

  const saldoPontos = Number(dados?.saldo_pontos ?? 0);
  const devendo = saldoPontos < 0;
  // O mínimo autoritativo é o do saldo; o da listagem é o mesmo dado, mas o
  // saldo é a leitura mais recente.
  const minimo = Number(dados?.minimo_resgate ?? programa.minimo_resgate ?? 0);
  const centavos = Number(programa.centavos_por_ponto ?? 0);
  const temRegraDeValor = centavos > 0;
  const extrato = dados?.extrato ?? [];

  const abaixoDoMinimo = !devendo && saldoPontos > 0 && saldoPontos < minimo;
  const podeResgatar = temRegraDeValor && saldoPontos > 0 && saldoPontos >= minimo;

  const acumulo = regraAcumulo(programa.pontos_por_real);
  const valor = regraValor(programa.centavos_por_ponto);

  function alternar(qual) {
    setPainel((atual) => (atual === qual ? null : qual));
  }

  return (
    <section className="pp-card pp-card--pad" aria-labelledby={`${idBase}-nome`}>
      <div className="pp-between">
        <h2 id={`${idBase}-nome`} className="pp-t-section pp-truncate">{nome}</h2>
        {programa.slug && (
          <Link to={`/casa/${programa.slug}`} className="pp-link pp-t-support pp-alvo">
            Ver a casa
          </Link>
        )}
      </div>

      {/* Falha na consulta do saldo (inclui o 404 de programa desativado entre
          a listagem e a leitura). O cartão continua, sem ação, dizendo o que o
          servidor disse — em vez de sumir e deixar a pessoa achando que perdeu
          os pontos. */}
      {saldo && !saldo.ok && (
        <div className="pp-mt-4"><ErrorBox>{saldo.erro}</ErrorBox></div>
      )}

      {dados && (
        <>
          <div className="pp-t-label pp-mt-4">
            {devendo ? 'saldo negativo' : 'pontos disponíveis'}
          </div>
          <div className="pp-fid__saldo">
            {/* Formatado pelo ABSOLUTO com o sinal à parte: é o que impede o
                "-13,-50" que a carteira já pagou para aprender. */}
            <span className={`pp-fid__pontos ${devendo ? 'pp-fid__pontos--devendo' : ''}`}>
              {devendo ? '− ' : ''}{pts(saldoPontos)}
            </span>
            <span className="pp-fid__unidade">
              {Math.abs(saldoPontos) === 1 ? 'ponto' : 'pontos'}
            </span>
          </div>

          {/* Dinheiro só a partir da regra da produtora. valor_cents vem
              calculado pelo servidor; a tela não converte por conta própria. */}
          {temRegraDeValor && saldoPontos !== 0 && (
            <div className="pp-fid__vale">
              {devendo ? 'Equivale a ' : 'Valem '}
              <strong className={devendo ? '' : 'pp-accent'}>
                {brl(Math.abs(Number(dados.valor_cents ?? 0)))}
              </strong>
              {devendo ? ' em pontos a repor.' : ' em desconto.'}
            </div>
          )}

          {devendo && (
            <div className="pp-note pp-note--alerta pp-mt-4" role="status">
              <strong>Um resgate seu foi estornado depois que a compra caiu.</strong>
              <div className="pp-muted pp-t-support pp-mt-1">
                Enquanto o saldo não voltar a ser positivo, não dá para resgatar.
              </div>
            </div>
          )}

          {/* A regra da casa em texto corrido, não em etiqueta: etiqueta é
              caixa-alta mono sem quebra de linha — boa para uma palavra que se
              RECONHECE, péssima para uma frase que se LÊ (e, sem quebra, é o
              tipo de elemento que estoura a largura em 375px). */}
          {(acumulo || valor) && (
            <p className="pp-t-support pp-mt-4 pp-m0">
              {[acumulo, valor].filter(Boolean).join(' · ')}
            </p>
          )}

          {/* O mínimo só aparece quando é ele que está barrando o resgate. */}
          {abaixoDoMinimo && (
            <p className="pp-t-support pp-aviso pp-mt-4 pp-m0" role="status">
              Faltam {pts(minimo - saldoPontos)} para o mínimo de resgate,
              que é de {pts(minimo)} pontos.
            </p>
          )}

          {/* Sem regra de valor o backend recusa com 409. Dizer isso agora é
              melhor que oferecer um botão que só falha depois do toque. */}
          {!temRegraDeValor && saldoPontos > 0 && (
            <p className="pp-t-support pp-muted pp-mt-4 pp-m0">
              Esta produtora ainda não definiu quanto vale um ponto, então o
              resgate está indisponível. Os pontos continuam acumulando.
            </p>
          )}

          <div className="pp-fid__acoes">
            <button
              type="button"
              className="pp-btn pp-btn--primary pp-btn--sm"
              disabled={!podeResgatar}
              aria-expanded={painel === 'resgate'}
              aria-controls={`${idBase}-resgate`}
              onClick={() => alternar('resgate')}
            >
              <Icon name="tag" size={15} /> Resgatar
            </button>
            <button
              type="button"
              className="pp-btn pp-btn--glass pp-btn--sm"
              disabled={extrato.length === 0}
              aria-expanded={painel === 'extrato'}
              aria-controls={`${idBase}-extrato`}
              onClick={() => alternar('extrato')}
            >
              <Icon name="receipt" size={15} /> Extrato · {extrato.length}
            </button>
          </div>

          {painel === 'resgate' && podeResgatar && (
            <FormResgate
              id={`${idBase}-resgate`}
              orgId={programa.organization_id}
              saldoPontos={saldoPontos}
              minimo={minimo}
              centavos={centavos}
              onResgatado={() => { setPainel(null); onMudou(); }}
            />
          )}

          {painel === 'extrato' && (
            <div className="pp-fid__painel" id={`${idBase}-extrato`}>
              <div className="pp-t-label pp-mb-2">movimentações</div>
              <ul className="pp-lista-nua">
                {extrato.map((m) => {
                  // O rótulo sai do TIPO, nunca do sinal do valor: estorno é
                  // negativo e não é resgate. O sinal fica só no número.
                  const entrada = Number(m.pontos) > 0;
                  return (
                    <li key={m.id} className="pp-tx">
                      <div className={`pp-tx__icon ${entrada ? 'pp-tx__icon--in' : ''}`}>
                        <Icon name={TIPO_ICONE[m.tipo] ?? 'receipt'} size={18} />
                      </div>
                      <div className="pp-grow">
                        <div className="pp-tx__name">
                          {m.descricao || TIPO_ROTULO[m.tipo] || 'Movimentação'}
                        </div>
                        <div className="pp-tx__meta">
                          {TIPO_ROTULO[m.tipo] ?? m.tipo} · {dateTime(m.created_at)}
                        </div>
                      </div>
                      <div className={`pp-tx__amt ${entrada ? 'in' : ''}`}>
                        {entrada ? '+' : '−'} {pts(m.pontos)}
                      </div>
                    </li>
                  );
                })}
              </ul>
              {/* O servidor devolve no máximo 50 linhas. Dizer isso evita que
                  a pessoa conclua que o histórico antigo sumiu. */}
              {extrato.length >= 50 && (
                <p className="pp-t-support pp-muted pp-mt-3 pp-m0">
                  Mostrando as 50 movimentações mais recentes.
                </p>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}

/**
 * Resgate. Só é montado quando o resgate é possível de fato — o formulário
 * nunca existe para ser recusado.
 */
function FormResgate({ id, orgId, saldoPontos, minimo, centavos, onResgatado }) {
  const [campo, setCampo] = useState(String(saldoPontos));
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');
  const [feito, setFeito] = useState(null);

  const minimoReal = Math.max(minimo, 1);
  const n = Number(campo);
  const valido = Number.isInteger(n) && n >= minimoReal && n <= saldoPontos;
  // Mesmo Math.floor do servidor: a tela nunca anuncia um centavo a mais do
  // que vai ser creditado.
  const previsto = valido ? Math.floor(n * centavos) : 0;

  async function enviar(e) {
    e.preventDefault();
    if (!valido || ocupado) return;
    setOcupado(true);
    setErro('');
    try {
      const r = await api.fidelidadeResgatar(orgId, n);
      setFeito(r);
      // Um instante com o resultado na tela antes de o cartão se recarregar:
      // sem isso o painel fecha e o número muda sem explicar o que houve.
      setTimeout(onResgatado, 2200);
    } catch (err) {
      setErro(err.message);
    } finally {
      setOcupado(false);
    }
  }

  if (feito) {
    return (
      <div className="pp-fid__painel" id={id}>
        <div className="pp-note pp-note--pulse" role="status">
          <strong className="pp-accent">
            {pts(feito.pontos_resgatados)} pontos resgatados
          </strong>
          {Number(feito.valor_cents ?? 0) > 0 && <> · {brl(feito.valor_cents)} em desconto</>}
          <div className="pp-muted pp-t-support pp-mt-1">
            Saldo restante: {pts(feito.saldo_restante)} pontos.
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className="pp-fid__painel" id={id} onSubmit={enviar}>
      <div className="pp-field">
        <label htmlFor={`${id}-pontos`} className="pp-label">Quantos pontos resgatar</label>
        <input
          id={`${id}-pontos`}
          className="pp-input"
          type="number"
          inputMode="numeric"
          min={minimoReal}
          max={saldoPontos}
          step="1"
          value={campo}
          onChange={(ev) => setCampo(ev.target.value)}
          aria-describedby={`${id}-ajuda`}
        />
        <p id={`${id}-ajuda`} className="pp-hint pp-m0">
          De {pts(minimoReal)} até {pts(saldoPontos)} pontos.
          {minimo > 1 && ` O mínimo desta produtora é ${pts(minimo)}.`}
        </p>
      </div>

      <p className="pp-t-support pp-mt-3 pp-m0" role="status" aria-live="polite">
        {valido
          ? <>Vira <strong className="pp-accent">{brl(previsto)}</strong> de desconto.</>
          : <span className="pp-muted">Escolha um valor dentro do intervalo.</span>}
      </p>

      {erro && <div className="pp-mt-3"><ErrorBox>{erro}</ErrorBox></div>}

      <button
        type="submit"
        className={`pp-btn pp-btn--primary pp-btn--block pp-mt-4 ${ocupado ? 'is-loading' : ''}`}
        disabled={!valido || ocupado}
      >
        Resgatar {valido ? pts(n) : ''} pontos
      </button>
    </form>
  );
}
