import { useCallback, useEffect, useRef, useState } from 'react';
import { Page } from '../components/Layout.jsx';
import { Loading, ErrorBox, Empty } from '../components/States.jsx';
import { Icon } from '../components/Icon.jsx';
import { api } from '../lib/api.js';
import { brl, dateTime } from '../lib/format.js';

const DEV = import.meta.env.DEV;
const PRESETS = [2000, 5000, 10000]; // R$20 / R$50 / R$100

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
  const reais = Math.floor(cents / 100);
  const centavos = String(cents % 100).padStart(2, '0');
  const txs = wallet.transactions ?? [];

  return (
    <Page>
      <div className="pp-wallet pp-reveal">
        <div className="pp-eyebrow">carteira pulsepass</div>
        <h1 style={{ marginBottom: 'var(--pp-s-6)' }}>Cashless</h1>

        <div className="pp-balance">
          <div className="pp-balance__label">Saldo disponível</div>
          <div className="pp-balance__amount">
            <span className="cur">R$</span>
            <span>{reais}</span>
            <span className="cents">,{centavos}</span>
          </div>
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
          </Empty>
        ) : (
          <div className="pp-txlist">
            {txs.map((t) => {
              const isIn = t.amount_cents > 0;
              return (
                <div key={t.id} className="pp-tx">
                  <div className={`pp-tx__icon ${isIn ? 'pp-tx__icon--in' : ''}`}>
                    <Icon name={isIn ? 'wallet' : 'receipt'} size={18} />
                  </div>
                  <div className="pp-grow">
                    <div className="pp-tx__name">{t.description || (isIn ? 'Recarga' : 'Consumo')}</div>
                    <div className="pp-tx__meta">{dateTime(t.created_at)}</div>
                  </div>
                  <div className={`pp-tx__amt ${isIn ? 'in' : ''}`}>
                    {isIn ? '+' : '−'} {brl(Math.abs(t.amount_cents))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {rechargeOpen && (
        <RechargeSheet onClose={() => setRechargeOpen(false)} onPaid={() => { setRechargeOpen(false); load(); }} />
      )}
    </Page>
  );
}

async function sacar(reload, setError) {
  if (!window.confirm('Sacar o saldo restante via Pix? A carteira ficará zerada.')) return;
  try { await api.refundWallet(); await reload(); }
  catch (e) { setError(e.message); }
}

export function RechargeSheet({ onClose, onPaid, eventId = null }) {
  const [amount, setAmount] = useState(5000);
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

  return (
    <div className="pp-overlay pp-overlay--sheet" onClick={onClose} role="dialog" aria-modal="true">
      <div className="pp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pp-modal__head">
          <div className="pp-modal__title">Recarregar carteira</div>
          <button className="pp-modal__close" onClick={onClose} aria-label="fechar"><Icon name="close" size={16} /></button>
        </div>

        {step === 'form' ? (
          <div className="pp-modal__body pp-stack pp-stack-4">
            <div className="pp-amounts">
              {PRESETS.map((v) => (
                <button key={v} className={custom === '' && amount === v ? 'sel' : ''} onClick={() => { setAmount(v); setCustom(''); }}>
                  R$ {v / 100}
                </button>
              ))}
            </div>
            <div className="pp-field">
              <label className="pp-label">Ou outro valor (R$)</label>
              <input className="pp-input" type="number" min="5" step="1" value={custom} placeholder="0,00" onChange={(e) => setCustom(e.target.value)} />
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
            <p className="pp-muted" style={{ textAlign: 'center', fontSize: 'var(--pp-fs-13)' }}>
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
