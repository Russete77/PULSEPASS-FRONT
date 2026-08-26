import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '../components/Layout.jsx';
import { Icon } from '../components/Icon.jsx';
import { api } from '../lib/api.js';
import { cidadeSalva, salvarCidade, detectarCidade, CIDADES_CONHECIDAS } from '../lib/localizacao.js';
import { FLYER_GRADS } from '../lib/catalogo.js';
import { marcarOnboardingVisto } from '../lib/onboarding.js';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Primeiro acesso.
 *
 * Três decisões que valem mais que o desenho:
 *
 * 1) Isto NÃO é uma porta. Quem chega por link de evento cai direto na página
 *    do evento e compra sem passar por aqui — o tour só intercepta a vitrine
 *    ("/"), que é a entrada de quem chegou sem destino. Ver App.jsx.
 *
 * 2) Só ensina o que o produto faz hoje. Cada passo aponta para uma tela que
 *    existe: mapa de assentos, QR rotativo, transferência de ingresso,
 *    carteira com recarga por Pix, pedido no bar com código de retirada.
 *    Promessa a mais aqui vira decepção na noite do evento.
 *
 * 3) A escolha de cidade do passo 1 é a MESMA da vitrine (`pp:cidade`, via
 *    lib/localizacao). Não é um passo de mentirinha: quem escolhe aqui já
 *    chega na vitrine filtrada, e quem pula continua vendo o Brasil todo.
 */

const PASSOS = [
  {
    id: 'cidade',
    icone: 'pin',
    titulo: 'Comece pela sua cidade',
    texto: 'A vitrine abre no que está rolando perto de você. Dá para trocar quando quiser, no topo da tela inicial.',
    pontos: [],
  },
  {
    id: 'comprar',
    icone: 'ticket',
    titulo: 'Compre na página do evento',
    texto: 'Escolha o lote e a quantidade e pague por Pix ou cartão. Cupom e meia-entrada aparecem quando o evento oferece.',
    pontos: [
      'Casa com lugar marcado: você escolhe a poltrona no mapa antes de pagar.',
      'Lote esgotado tem fila de espera — deixe o e-mail e avisamos se abrir vaga.',
      'A conta só é pedida na hora de pagar. Para olhar e escolher, não precisa entrar.',
    ],
  },
  {
    id: 'entrar',
    icone: 'scan',
    titulo: 'Na porta, o ingresso é o QR',
    texto: 'Tudo o que você comprou fica em Meus ingressos. Abra o ingresso na hora de entrar: o código se refaz a cada 15 segundos, então print não vale.',
    pontos: [
      'Não vai mais? Transfira o ingresso por e-mail para quem for no seu lugar.',
    ],
  },
  {
    id: 'cashless',
    icone: 'wallet',
    titulo: 'Lá dentro, sem fila no caixa',
    texto: 'Na Carteira você carrega saldo por Pix. Nos eventos com bar no app, o pedido sai pelo celular e você retira no balcão com um código.',
    pontos: [
      'Sobrou saldo depois da festa? Dá para sacar de volta por Pix.',
    ],
  },
];

/** Passo 1. Reaproveita a cidade da vitrine — mesma chave, mesmas funções. */
function EscolhaDeCidade({ cidade, cidades, detectando, aviso, aoEscolher, aoLocalizar }) {
  // Lista curta: aqui a pergunta é "onde você está", não "escolha entre 32".
  // Quem não se vê na lista resolve na vitrine, que tem o seletor completo.
  const opcoes = (cidades.length ? cidades : CIDADES_CONHECIDAS).slice(0, 8);

  return (
    <div className="pp-stack pp-mt-5">
      <button type="button" className="pp-btn pp-btn--glass pp-btn--block" onClick={aoLocalizar}
        disabled={detectando}>
        <Icon name="pin" size={15} />
        {detectando ? 'Localizando…' : 'Usar minha localização'}
      </button>

      <div className="pp-cluster pp-cluster-2" role="group" aria-label="Escolha sua cidade">
        {opcoes.map((c) => {
          const ativa = cidade?.city === c.city && cidade?.state === c.state;
          return (
            <button key={`${c.city}-${c.state}`} type="button"
              className={`pp-chip ${ativa ? 'pp-chip--active' : ''}`}
              aria-pressed={ativa}
              onClick={() => aoEscolher(ativa ? null : c)}>
              {c.city}
              {c.eventos != null && <span className="pp-muted-2"> · {c.eventos}</span>}
            </button>
          );
        })}
      </div>

      {aviso && <p className="pp-note pp-m0" role="status">{aviso}</p>}

      <p className="pp-muted-2 pp-t-support pp-m0">
        {cidade
          ? `A vitrine vai abrir em ${cidade.city}/${cidade.state}.`
          : 'Sem escolher, a vitrine abre com o Brasil todo.'}
      </p>
    </div>
  );
}

export default function Bemvindo() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [passo, setPasso] = useState(0);
  const [cidade, setCidade] = useState(() => cidadeSalva());
  const [cidades, setCidades] = useState([]);
  const [detectando, setDetectando] = useState(false);
  const [aviso, setAviso] = useState('');

  const tituloRef = useRef(null);
  const passoAnterior = useRef(0);

  const atual = PASSOS[passo];
  const ultimo = passo === PASSOS.length - 1;

  // Mesma fonte da vitrine: só cidades com evento no ar. Falhou? Cai na tabela
  // local — um tour que quebra por causa de rede é pior que um tour genérico.
  useEffect(() => {
    let vivo = true;
    api.listCities().then((c) => { if (vivo) setCidades(c ?? []); }).catch(() => {});
    return () => { vivo = false; };
  }, []);

  // Concluir e pular são a mesma coisa para a memória: a pessoa já decidiu.
  const sair = useCallback((destino) => {
    marcarOnboardingVisto();
    navigate(destino, { replace: true });
  }, [navigate]);

  const avancar = useCallback(() => setPasso((n) => Math.min(n + 1, PASSOS.length - 1)), []);
  const voltar = useCallback(() => setPasso((n) => Math.max(n - 1, 0)), []);

  // Setas andam pelo tour, Esc pula. O guarda de campo de texto é para o dia
  // em que um passo tiver input: seta dentro de campo é cursor, não navegação.
  useEffect(() => {
    function aoTeclar(e) {
      const alvo = e.target;
      if (alvo && (['INPUT', 'TEXTAREA', 'SELECT'].includes(alvo.tagName) || alvo.isContentEditable)) return;
      if (e.key === 'Escape') { e.preventDefault(); sair('/'); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); avancar(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); voltar(); }
    }
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [sair, avancar, voltar]);

  // Trocar de passo troca o conteúdo sem trocar de rota: sem mover o foco, o
  // leitor de tela não é avisado e o Tab continua no botão anterior.
  useEffect(() => {
    if (passoAnterior.current === passo) return;
    passoAnterior.current = passo;
    tituloRef.current?.focus({ preventScroll: true });
  }, [passo]);

  function escolherCidade(c) {
    setCidade(c);
    salvarCidade(c);
    setAviso('');
  }

  async function usarMinhaLocalizacao() {
    setDetectando(true);
    setAviso('');
    const c = await detectarCidade();
    setDetectando(false);
    if (c) escolherCidade(c);
    else setAviso('Não conseguimos a sua localização. Escolha a cidade na lista.');
  }

  // O rótulo não carrega o nome da cidade: "Balneário Camboriú" transborda o
  // botão em 375px. Quem escolheu cidade lê isso na linha logo abaixo.
  const destinoFinal = useMemo(
    () => (cidade ? `Você cai na vitrine de ${cidade.city}.` : 'A vitrine abre com o Brasil todo.'),
    [cidade],
  );

  return (
    <Page>
      <div className="pp-authwrap">
        <div className="pp-card pp-card--pad-lg pp-block pp-coluna">
          <div className="pp-between">
            <div className="pp-eyebrow">passo {passo + 1} de {PASSOS.length}</div>
            {/* Botão e não link de texto: no telefone o "Pular" precisa de alvo
                de dedo, e o --sm é quem ganha a expansão para 44px. */}
            <button type="button" className="pp-btn pp-btn--bare pp-btn--sm" onClick={() => sair('/')}>
              Pular
            </button>
          </div>

          {/* Barras são resumo visual do que o eyebrow já diz em texto. */}
          <div className="pp-steps pp-mt-3" aria-hidden="true">
            {PASSOS.map((p, n) => <div key={p.id} className={`bar ${n <= passo ? 'on' : ''}`} />)}
          </div>

          <div key={atual.id} className="pp-reveal">
            <div aria-hidden="true" className="pp-passo-arte"
              style={{ background: FLYER_GRADS[passo % FLYER_GRADS.length] }}>
              <div className="pp-passo-arte__selo">
                <Icon name={atual.icone} size={32} />
              </div>
            </div>

            {/* h1 por passo, com foco programático: é o nome do que está na
                tela agora, e é para onde a pessoa "chega" ao avançar. */}
            <h1 ref={tituloRef} tabIndex={-1} className="pp-t-title pp-mt-5">
              {atual.titulo}
            </h1>
            <p className="pp-prosa pp-mt-3">{atual.texto}</p>

            {atual.id === 'cidade' && (
              <EscolhaDeCidade
                cidade={cidade}
                cidades={cidades}
                detectando={detectando}
                aviso={aviso}
                aoEscolher={escolherCidade}
                aoLocalizar={usarMinhaLocalizacao}
              />
            )}

            {atual.pontos.length > 0 && (
              <ul className="pp-stack pp-stack-3 pp-lista-nua pp-mt-5">
                {atual.pontos.map((p) => (
                  <li key={p} className="pp-item-check">
                    <span aria-hidden="true" className="pp-item-check__mark">
                      <Icon name="check" size={15} />
                    </span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Empilhado, não lado a lado: o avanço fica sempre no mesmo lugar e
              com a mesma largura em todos os passos — é o que o polegar
              procura. "Voltar" é secundário e não disputa esse espaço. */}
          <div className="pp-stack pp-stack-3 pp-mt-6">
            <button type="button" className="pp-btn pp-btn--primary pp-btn--lg pp-btn--block"
              onClick={() => (ultimo ? sair('/') : avancar())}>
              {ultimo ? 'Ver os eventos' : 'Continuar'} <Icon name="arrowRight" size={15} />
            </button>
            {ultimo && (
              <p className="pp-muted-2 pp-tc pp-t-support pp-m0">{destinoFinal}</p>
            )}
            {passo > 0 && (
              <button type="button" className="pp-btn pp-btn--bare pp-btn--sm pp-auto-centro" onClick={voltar}>
                <Icon name="arrowLeft" size={15} /> Voltar
              </button>
            )}
          </div>

          {/* Convite discreto, e só no fim: quem quer comprar agora não pode
              ser empurrado para um cadastro antes de ver um evento sequer. */}
          {ultimo && !user && (
            <div className="pp-authfoot">
              <button type="button" className="pp-link" onClick={() => sair('/entrar')}>
                Já tenho conta · entrar
              </button>
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}
