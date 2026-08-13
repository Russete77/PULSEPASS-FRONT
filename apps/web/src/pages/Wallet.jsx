import { useCallback, useEffect, useRef, useState } from 'react';
import { Page } from '../components/Layout.jsx';
import { Loading, ErrorBox, Empty } from '../components/States.jsx';
import { Icon } from '../components/Icon.jsx';
import { api } from '../lib/api.js';
import { brl, dateTime } from '../lib/format.js';

/**
 * Carteira cashless (spec WalletScreen).
 *
 * Cartão de saldo em destaque, ações, e o extrato agrupado por dia — o
 * "Esta noite" do desenho vira o dia real de cada movimentação, porque a
 * carteira é única (uma por pessoa, não por evento: migration 0027) e o
 * extrato mistura festas diferentes.
 *
 * O que o desenho traz e não foi portado:
 * - A faixa "Festival do Sol · está rolando · Você está em Audio Club".
 *   Não existe presença nem geolocalização no produto; seria inventar onde a
 *   pessoa está.
 * - A terceira ação "Transferir" saldo: não há endpoint de transferência
 *   entre carteiras. Botão que não faz nada em tela de dinheiro custa
 *   confiança.
 * - O bônus "+ R$ 10" no valor de R$ 100 da RechargeScreen: não existe regra
 *   de bônus de recarga no backend. Anunciar dinheiro extra que não vai
 *   entrar é a pior promessa possível.
 */

const DEV = import.meta.env.DEV;
// Valores da RechargeScreen. A grade é de 3 colunas, então seis opções fecham
// duas linhas exatas.
const PRESETS = [3000, 5000, 10000, 15000, 20000, 30000];

const TX_ROTULO = { topup: 'Recarga', spend: 'Consumo', refund: 'Estorno', adjustment: 'Ajuste' };
const TX_ICONE = { topup: 'wallet', spend: 'receipt', refund: 'download', adjustment: 'refresh' };

/** Cabeçalho de grupo do extrato. */
function rotuloDia(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const hoje = new Date();
  const ontem = new Date(); ontem.setDate(hoje.getDate() - 1);
  if (d.toDateString() === hoje.toDateString()) return 'Hoje';
  if (d.toDateString() === ontem.toDateString()) return 'Ontem';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
}

/** Agrupa mantendo a ordem que o servidor mandou (mais recente primeiro). */
function agruparPorDia(txs) {
  const grupos = [];
  for (const t of txs) {
    const rotulo = rotuloDia(t.created_at);
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.rotulo === rotulo) ultimo.itens.push(t);
    else grupos.push({ rotulo, itens: [t] });
  }
  return grupos;
}

export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [rechargeOpen, setRechargeOpen] = useState(false);

  const load = useCallback(async () => {
    try { setWallet(await api.getWallet()); setStatus('done'); }
    catch (e) { setError(e.message); setStatus('error'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  if (status === 'loading') return <Page><Loading label="Abrindo sua carteira…" /></Page>;
  if (status === 'error') return <Page><ErrorBox>{error}</ErrorBox></Page>;

  const cents = wallet.balance_cents ?? 0;
  // Saldo pode ser NEGATIVO desde a 0035: estorno de recarga já consumida vira
  // dívida. Com Math.floor/% direto no número negativo a tela mostrava
  // "R$ -13,-50" — formatar pelo valor absoluto e carregar o sinal à parte.
  const devendo = cents < 0;
  const abs = Math.abs(cents);
  const reais = Math.floor(abs / 100);
  const centavos = String(abs % 100).padStart(2, '0');
  const txs = wallet.transactions ?? [];
  const bloqueada = Boolean(wallet.blocked_at);
  const ultimaRecarga = txs.find((t) => t.type === 'topup');

  return (
    <Page>
      <div className="pp-wallet pp-reveal">
        <div className="pp-eyebrow">carteira pulsepass</div>
        <h1 style={{ marginBottom: 'var(--pp-s-6)' }}>Cashless</h1>

        {/* Carteira bloqueada vinha do servidor (wallets.blocked_at) e não
            aparecia em lugar nenhum: a pessoa só descobria no balcão, com o
            barman recusando o pedido e sem saber explicar o porquê. */}
        {bloqueada && (
          <div className="pp-note" role="alert" style={{ marginBottom: 'var(--pp-s-4)', borderColor: 'var(--pp-red)', color: 'var(--pp-fg)' }}>
            <strong>Carteira bloqueada para novos gastos.</strong>
            <div className="pp-muted" style={{ fontSize: 'var(--pp-fs-13)', marginTop: 4 }}>
              {wallet.block_reason || 'Procure a organização do evento para regularizar.'}
            </div>
          </div>
        )}

        <div className="pp-balance">
          <div className="pp-balance__label">{devendo ? 'Saldo devedor' : 'Saldo disponível'}</div>
          <div className="pp-balance__amount" style={devendo ? { color: 'var(--pp-red)' } : undefined}>
            <span className="cur">{devendo ? '− R$' : 'R$'}</span>
            <span>{reais}</span>
            <span className="cents">,{centavos}</span>
          </div>
          {/* A linha do desenho anuncia o evento da última recarga; o dado que
              existe de verdade é a própria recarga (valor e quando). */}
          {ultimaRecarga && !devendo && (
            <div className="pp-muted" style={{ fontSize: 'var(--pp-fs-12)', marginTop: 6, position: 'relative' }}>
              Última recarga: {brl(Math.abs(ultimaRecarga.amount_cents))} · {dateTime(ultimaRecarga.created_at)}
            </div>
          )}
          <div className="pp-balance__actions">
            <button className="pp-btn pp-btn--primary" onClick={() => setRechargeOpen(true)}>
              <Icon name="wallet" size={16} /> Recarregar
            </button>
            {/* Só duas ações reais: entrar dinheiro e sair dinheiro. Havia um
                terceiro botão "Pix" que abria o MESMO modal de recarga — com
                ícone de copiar, dando a entender que copiava uma chave. Numa
                carteira, botão que engana custa confiança. A recarga já é Pix. */}
            <button className="pp-btn pp-btn--glass" onClick={() => sacar(load, setError)} disabled={cents <= 0}>
              <Icon name="download" size={15} /> Sacar
            </button>
          </div>
        </div>

        {error && <div style={{ marginTop: 'var(--pp-s-4)' }}><ErrorBox>{error}</ErrorBox></div>}

        <div className="pp-section-head" style={{ margin: 'var(--pp-s-8) 0 var(--pp-s-2)' }}>
          <div><div className="pp-eyebrow">Atividade</div><h2>Extrato</h2></div>
        </div>

        {txs.length === 0 ? (
          <Empty>
            <div className="pp-empty__icon"><Icon name="wallet" size={30} /></div>
            <div className="pp-empty__title">Sem movimentações ainda</div>
            <p>Recarregue para começar a usar o cashless no bar.</p>
            <button className="pp-btn pp-btn--primary pp-btn--sm" style={{ marginTop: 'var(--pp-s-4)' }} onClick={() => setRechargeOpen(true)}>
              Recarregar carteira
            </button>
          </Empty>
        ) : (
          <div className="pp-txlist">
            {/* Agrupado por dia: numa noite de festa entram seis linhas em duas
                horas, e sem o corte por data o extrato vira um borrão. */}
            {agruparPorDia(txs).map((g) => (
              <div key={g.rotulo}>
                <div className="pp-eyebrow" style={{ margin: 'var(--pp-s-4) 0 var(--pp-s-2)' }}>{g.rotulo}</div>
                {g.itens.map((t) => {
                  const entrada = t.amount_cents > 0;
                  return (
                    <div key={t.id} className="pp-tx">
                      <div className={`pp-tx__icon ${entrada ? 'pp-tx__icon--in' : ''}`}>
                        <Icon name={TX_ICONE[t.type] ?? 'receipt'} size={18} />
                      </div>
                      <div className="pp-grow" style={{ minWidth: 0 }}>
                        {/* O tipo é o dado do razão; a descrição é o texto que
                            o servidor escreveu (ex.: "Pedido no bar · B4821").
                            Antes o rótulo saía do SINAL do valor, e estorno —
                            que é negativo — aparecia como "Consumo". */}
                        <div className="pp-tx__name">{t.description || TX_ROTULO[t.type] || 'Movimentação'}</div>
                        <div className="pp-tx__meta">
                          {TX_ROTULO[t.type] ?? t.type} · {new Date(t.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div className={`pp-tx__amt ${entrada ? 'in' : ''}`}>
                        {entrada ? '+' : '−'} {brl(Math.abs(t.amount_cents))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {rechargeOpen && (
        <RechargeSheet
          saldoAtual={cents}
          onClose={() => setRechargeOpen(false)}
          onPaid={() => { setRechargeOpen(false); load(); }}
        />
      )}
    </Page>
  );
}

async function sacar(reload, setError) {
  if (!window.confirm('Sacar o saldo restante via Pix? A carteira ficará zerada.')) return;
  try { await api.refundWallet(); await reload(); }
  catch (e) { setError(e.message); }
}

/**
 * @param {number} faltando  Quanto falta para fechar o pedido em aberto, em
 *   centavos. Vindo preenchido, a recarga já abre nesse valor.
 * @param {number|null} saldoAtual  Saldo antes da recarga, para mostrar em
 *   quanto a carteira vai ficar. Opcional: sem ele a linha some.
 */
export function RechargeSheet({ onClose, onPaid, eventId = null, faltando = 0, saldoAtual = null }) {
  // Abrir sempre em R$ 50 ignorava o carrinho: com R$ 78 de itens e saldo
  // zero, a pessoa recarregava 50, voltava, e ainda não dava — e a culpa
  // parecia dela. Arredonda para cima no múltiplo de R$ 5 porque valor
  // quebrado em Pix não ajuda ninguém.
  const sugerido = faltando > 0 ? Math.ceil(faltando / 500) * 500 : 5000;
  const [amount, setAmount] = useState(sugerido);
  const [custom, setCustom] = useState('');
  const [step, setStep] = useState('form'); // form | pix
  const [topup, setTopup] = useState(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const pollRef = useRef(null);

  const cents = custom !== '' ? Math.round(Number(custom) * 100) : amount;

  async function generate() {
    if (!Number.isInteger(cents) || cents < 500) { setError('Valor mínimo de recarga é R$ 5,00'); return; }
    setBusy(true); setError('');
    try {
      const t = await api.createTopup({ amount_cents: cents, paymentMethod: 'pix', ...(eventId ? { eventId } : {}) });
      setTopup(t); setStep('pix');
      pollRef.current = setInterval(async () => {
        try {
          const cur = await api.getTopup(t.id);
          if (cur.status === 'paid') { clearInterval(pollRef.current); onPaid(); }
        } catch { /* segue tentando */ }
      }, 4000);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }

  useEffect(() => () => clearInterval(pollRef.current), []);

  async function copyPix() {
    if (!topup?.pix?.payload) return;
    await navigator.clipboard.writeText(topup.pix.payload);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }
  async function simulate() {
    try { await api.simulateTopupPaid(topup.id); clearInterval(pollRef.current); onPaid(); }
    catch (e) { setError(e.message); }
  }

  const qrSrc = topup?.pix?.qr_base64 ? `data:image/png;base64,${topup.pix.qr_base64}` : null;
  const valorValido = Number.isInteger(cents) && cents >= 500;

  return (
    <div className="pp-overlay pp-overlay--sheet" onClick={onClose} role="dialog" aria-modal="true" aria-label="Recarregar carteira">
      <div className="pp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pp-modal__head">
          <div className="pp-modal__title">Recarregar carteira</div>
          <button className="pp-modal__close" onClick={onClose} aria-label="fechar"><Icon name="close" size={16} /></button>
        </div>

        {step === 'form' ? (
          <div className="pp-modal__body pp-stack pp-stack-4">
            {faltando > 0 && (
              <p style={{ margin: 0, fontSize: 14, color: 'var(--pp-fg-2)', lineHeight: 1.45 }}>
                Faltam <strong style={{ color: 'var(--pp-fg)' }}>{brl(faltando)}</strong> para
                fechar seu pedido. Já deixamos {brl(sugerido)} escolhido.
              </p>
            )}

            {/* O valor escolhido em corpo grande, como na RechargeScreen: é a
                única informação da tela que a pessoa precisa conferir antes de
                gerar um Pix. */}
            <div className="pp-center pp-stack pp-stack-1" style={{ textAlign: 'center' }}>
              <div className="pp-eyebrow">Quanto carregar?</div>
              <div className="pp-money pp-money--lg" aria-live="polite">
                {valorValido ? brl(cents) : '—'}
              </div>
              {saldoAtual != null && valorValido && (
                <div className="pp-muted" style={{ fontSize: 'var(--pp-fs-12)' }}>
                  Novo saldo: <strong style={{ color: 'var(--pp-pulse)' }}>{brl(saldoAtual + cents)}</strong>
                </div>
              )}
            </div>

            <div className="pp-amounts">
              {/* O valor sugerido entra na lista quando não é um dos preços
                  fixos — senão ele não teria como ser reescolhido depois que
                  a pessoa clicasse em outro. */}
              {[...new Set(PRESETS.concat(faltando > 0 ? [sugerido] : []))].sort((a, b) => a - b).map((v) => (
                <button key={v} className={custom === '' && amount === v ? 'sel' : ''}
                  aria-pressed={custom === '' && amount === v}
                  onClick={() => { setAmount(v); setCustom(''); }}>
                  R$ {v / 100}
                </button>
              ))}
            </div>
            {faltando > 0 && cents < faltando && (
              <p role="status" style={{ margin: 0, fontSize: 13, color: 'var(--pp-amber)' }}>
                Com {brl(cents)} ainda faltam {brl(faltando - cents)} para o pedido.
              </p>
            )}
            <div className="pp-field">
              <label htmlFor="wallet-1" className="pp-label">Ou outro valor (R$)</label>
              <input id="wallet-1" className="pp-input" type="number" min="5" step="1" value={custom} placeholder="0,00" onChange={(e) => setCustom(e.target.value)} />
            </div>
            {error && <ErrorBox>{error}</ErrorBox>}
            <button className={`pp-btn pp-btn--primary pp-btn--block pp-btn--lg ${busy ? 'is-loading' : ''}`} disabled={busy} onClick={generate}>
              Gerar Pix de {brl(cents)}
            </button>
          </div>
        ) : (
          <div className="pp-modal__body pp-stack pp-stack-4" style={{ alignItems: 'center' }}>
            <div className="pp-tag-secure">AGUARDANDO PAGAMENTO</div>
            <div className="pp-qrcard pp-qrcard--sm">
              {qrSrc ? <img src={qrSrc} alt="QR Pix da recarga" /> : <div className="pp-center" style={{ width: 200, height: 200 }}><div className="pp-spinner" /></div>}
            </div>
            <div className="pp-pixcode" style={{ width: '100%' }}>
              <code>{topup?.pix?.payload}</code>
              <button className="pp-btn pp-btn--primary pp-btn--sm" onClick={copyPix}>{copied ? 'Copiado!' : 'Copiar'}</button>
            </div>
            <p className="pp-muted" style={{ textAlign: 'center', fontSize: 'var(--pp-fs-13)' }} role="status" aria-live="polite">
              <span className="pp-spinner pp-spinner--sm" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 8 }} />
              A confirmação cai aqui automaticamente e o saldo entra na hora.
            </p>
            {error && <ErrorBox>{error}</ErrorBox>}
            {DEV && <button className="pp-btn pp-btn--glass pp-btn--block" onClick={simulate}>(dev) Simular pagamento</button>}
          </div>
        )}
      </div>
    </div>
  );
}
