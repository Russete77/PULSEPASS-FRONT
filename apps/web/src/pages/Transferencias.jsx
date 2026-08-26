import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Page } from '../components/Layout.jsx';
import { Loading, ErrorBox, Empty } from '../components/States.jsx';
import { Icon } from '../components/Icon.jsx';
import { api } from '../lib/api.js';
import { dateTime, eventDate } from '../lib/format.js';

/**
 * Histórico de transferências de ingresso.
 *
 * Por que esta tela existe: transferir ROTACIONA o código do ingresso. Quem
 * passa adiante vê o ingresso sumir da própria conta e o QR antigo parar de
 * valer — e, sem registro nenhum, isso é indistinguível de ter perdido o
 * ingresso. Esta é a prova, dos dois lados: o que saiu, o que entrou, e qual
 * código virou qual.
 *
 * O estado que mais gera dúvida é `enviado` + `pending`: a pessoa do outro
 * lado ainda não criou conta, e até lá O INGRESSO CONTINUA COM QUEM ENVIOU.
 * Ele aparece duas vezes de propósito — no aviso do topo, para quem abriu a
 * tela assustada, e dentro do próprio item, para quem rolou até ele.
 *
 * O que a tela não faz: não mostra quem ENVIOU um ingresso recebido. A API
 * devolve só `para` (o e-mail de destino), que numa linha recebida é o
 * e-mail da própria pessoa. Não há campo de remetente, e deduzir um seria
 * inventar.
 */

const DIRECAO = {
  enviado: { rotulo: 'Enviado', cls: 'pp-badge--violet', icone: 'share' },
  recebido: { rotulo: 'Recebido', cls: 'pp-badge--cyan', icone: 'download' },
};

const STATUS = {
  accepted: { rotulo: 'Concluída', cls: 'pp-badge--success' },
  pending: { rotulo: 'Aguardando', cls: 'pp-badge--amber' },
};

export default function Transferencias() {
  const [itens, setItens] = useState([]);
  const [status, setStatus] = useState('loading');
  const [erro, setErro] = useState('');
  const [aba, setAba] = useState('tudo');

  useEffect(() => {
    let vivo = true;
    api.myTransfers()
      .then((d) => { if (vivo) { setItens(d ?? []); setStatus('done'); } })
      .catch((e) => { if (vivo) { setErro(e.message); setStatus('error'); } });
    return () => { vivo = false; };
  }, []);

  const enviados = useMemo(() => itens.filter((t) => t.direcao === 'enviado'), [itens]);
  const recebidos = useMemo(() => itens.filter((t) => t.direcao === 'recebido'), [itens]);
  // Os que ainda estão com quem enviou. É o número que o aviso do topo conta.
  const pendentesEnviados = useMemo(
    () => enviados.filter((t) => t.status === 'pending'),
    [enviados],
  );

  // O filtro só aparece quando há os dois lados: com uma direção só ele seria
  // uma escolha entre a lista e a mesma lista.
  const temDoisLados = enviados.length > 0 && recebidos.length > 0;
  const lista = !temDoisLados || aba === 'tudo'
    ? itens
    : (aba === 'enviados' ? enviados : recebidos);

  return (
    <Page>
      <div className="pp-transf">
        <div className="pp-reveal">
          <div className="pp-eyebrow">seus ingressos</div>
          <h1 className="pp-titulo-sob">Transferências</h1>
        </div>

        {status === 'loading' && <Loading label="Carregando suas transferências…" />}
        {status === 'error' && <div className="pp-mt-6"><ErrorBox>{erro}</ErrorBox></div>}

        {/* Estado vazio curto de propósito: quem nunca transferiu não precisa
            da aula sobre rotação de código. */}
        {status === 'done' && itens.length === 0 && (
          <Empty>
            <div className="pp-empty__icon"><Icon name="share" size={30} /></div>
            <div className="pp-empty__title">Nenhuma transferência ainda</div>
            <p>
              Passou um ingresso adiante ou recebeu um? O registro aparece aqui.{' '}
              <Link to="/meus-ingressos" className="pp-link">Meus ingressos</Link>
            </p>
          </Empty>
        )}

        {status === 'done' && itens.length > 0 && (
          <>
            <p className="pp-prosa pp-mt-3">
              Transferir troca o código do ingresso: o QR antigo para de valer e
              quem recebe passa a ter um novo. Este é o registro dos dois lados.
            </p>

            {pendentesEnviados.length > 0 && (
              <div className="pp-note pp-note--pulse pp-mt-4" role="status">
                <strong>
                  {pendentesEnviados.length === 1
                    ? 'Uma transferência ainda não foi aceita.'
                    : `${pendentesEnviados.length} transferências ainda não foram aceitas.`}
                </strong>
                <div className="pp-muted pp-t-support pp-mt-1">
                  {pendentesEnviados.length === 1 ? 'Esse ingresso continua' : 'Esses ingressos continuam'}
                  {' '}com você, e o seu QR segue valendo até a outra pessoa criar a conta.
                </div>
              </div>
            )}

            {temDoisLados && (
              <div className="pp-segmented pp-mt-6 pp-mb-4">
                <button type="button" className={aba === 'tudo' ? 'active' : ''} onClick={() => setAba('tudo')}>
                  Tudo · {itens.length}
                </button>
                <button type="button" className={aba === 'enviados' ? 'active' : ''} onClick={() => setAba('enviados')}>
                  Enviados · {enviados.length}
                </button>
                <button type="button" className={aba === 'recebidos' ? 'active' : ''} onClick={() => setAba('recebidos')}>
                  Recebidos · {recebidos.length}
                </button>
              </div>
            )}

            <ul className={`pp-lista-nua pp-stack pp-stack-3 pp-reveal-group ${temDoisLados ? '' : 'pp-mt-6'}`}>
              {lista.map((t) => <ItemTransferencia key={t.id} t={t} />)}
            </ul>

            {/* O servidor devolve no máximo 40 linhas. */}
            {itens.length >= 40 && (
              <p className="pp-t-support pp-muted pp-mt-4">
                Mostrando as 40 transferências mais recentes.
              </p>
            )}
          </>
        )}
      </div>
    </Page>
  );
}

function ItemTransferencia({ t }) {
  const dir = DIRECAO[t.direcao] ?? { rotulo: t.direcao, cls: 'pp-badge--neutral', icone: 'ticket' };
  const st = STATUS[t.status] ?? { rotulo: t.status, cls: 'pp-badge--neutral' };

  const enviadoPendente = t.direcao === 'enviado' && t.status === 'pending';
  const rotacionou = Boolean(t.code_anterior && t.code_novo);
  const temCodigo = Boolean(t.code_anterior || t.code_novo);
  const titulo = t.evento || 'Evento não identificado';

  return (
    <li className="pp-card pp-card--pad">
      <div className="pp-cluster pp-cluster-2">
        <span className={`pp-badge ${dir.cls}`}>
          <Icon name={dir.icone} size={13} /> {dir.rotulo}
        </span>
        <span className={`pp-badge ${st.cls}`}>{st.rotulo}</span>
      </div>

      {/* O evento é o que identifica a linha. Vira link só quando o slug veio;
          sem ele, texto — link quebrado é pior que ausência de link. */}
      <h2 className="pp-t-section pp-mt-3">
        {t.evento_slug
          ? <Link to={`/eventos/${t.evento_slug}`} className="pp-link pp-link--muted pp-alvo">{titulo}</Link>
          : titulo}
      </h2>
      {t.comeca_em && (
        <div className="pp-t-support pp-mt-1">{eventDate(t.comeca_em)}</div>
      )}

      {/* Só na direção "enviado": numa linha recebida, `para` é o e-mail de
          quem está lendo a tela. */}
      {t.direcao === 'enviado' && t.para && (
        <div className="pp-t-support pp-mt-2">
          Para <strong>{t.para}</strong>
        </div>
      )}

      {temCodigo && (
        <>
          <div className="pp-t-label pp-mt-4">
            {rotacionou ? 'código antes e depois' : 'código do ingresso'}
          </div>
          <div className="pp-transf__codigos">
            {/* <s> não é enfeite: a marca de riscado é o que diz "parou de
                valer" antes de qualquer frase, e o elemento carrega esse
                sentido também para quem usa leitor de tela. */}
            {t.code_anterior && (
              rotacionou
                ? <s className="pp-transf__code pp-transf__code--antigo">{t.code_anterior}</s>
                : <span className="pp-transf__code">{t.code_anterior}</span>
            )}
            {rotacionou && <Icon name="arrowRight" size={14} className="pp-transf__seta" />}
            {t.code_novo && <span className="pp-transf__code pp-transf__code--novo">{t.code_novo}</span>}
          </div>
          {rotacionou && (
            <p className="pp-t-support pp-mt-2 pp-m0">
              O código antigo parou de valer no momento da troca.
            </p>
          )}
        </>
      )}

      {/* O aviso repetido no item: quem rolou até aqui precisa da mesma
          garantia sem ter que voltar ao topo. */}
      {enviadoPendente && (
        <div className="pp-note pp-note--pulse pp-mt-4">
          {t.para ? <><strong>{t.para}</strong> ainda não criou conta.</> : <strong>Quem recebeu ainda não criou conta.</strong>}
          <div className="pp-muted pp-t-support pp-mt-1">
            Até isso acontecer o ingresso continua na sua conta e o seu QR
            funciona normalmente na portaria.
          </div>
        </div>
      )}

      <div className="pp-t-support pp-muted pp-mt-4">
        {t.direcao === 'enviado' ? 'Enviada' : 'Recebida'} em {dateTime(t.criado_em)}
        {t.aceito_em && <> · aceita em {dateTime(t.aceito_em)}</>}
      </div>
    </li>
  );
}
