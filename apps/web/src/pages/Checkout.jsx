import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Page } from '../components/Layout.jsx';
import { Loading, ErrorBox } from '../components/States.jsx';
import { Icon } from '@pulsepass/shared/Icon';
import { api } from '../lib/api.js';
import { brl } from '../lib/format.js';

const DEV = import.meta.env.DEV;

export default function Checkout() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const pollRef = useRef(null);

  async function refresh() {
    const data = await api.getOrder(orderId);
    setOrder(data);
    setStatus('done');
    if (data.status === 'paid') {
      clearInterval(pollRef.current);
      navigate('/meus-ingressos', { replace: true });
    }
    return data;
  }

  useEffect(() => {
    refresh().catch((e) => {
      setError(e.message);
      setStatus('error');
    });
    // polling: aguarda confirmação do pagamento (webhook → status paid)
    pollRef.current = setInterval(() => {
      refresh().catch(() => {});
    }, 5000);
    return () => clearInterval(pollRef.current);
  }, [orderId]);

  async function copyPix() {
    if (!order?.pix_payload) return;
    await navigator.clipboard.writeText(order.pix_payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function simulate() {
    try {
      await api.simulatePaid(orderId);
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  }

  if (status === 'loading') return <Page><Loading label="Carregando pagamento…" /></Page>;
  if (status === 'error') return <Page><ErrorBox>{error}</ErrorBox></Page>;

  const qrSrc = order.pix_qr_base64
    ? `data:image/png;base64,${order.pix_qr_base64}`
    : null;

  return (
    <Page>
      <div className="pp-checkout pp-reveal">
        <div className="pp-checkout__nav">
          <button className="pp-btn pp-btn--glass pp-btn--icon pp-btn--sm" onClick={() => navigate(-1)} aria-label="voltar"><Icon name="arrowLeft" size={18} /></button>
          <span className="title">Pagamento · 3 de 3</span>
          <span className="pp-tag-secure">SEGURO</span>
        </div>

        <div className="pp-steps">
          <span className="bar on" /><span className="bar on" /><span className="bar on" />
        </div>

        <div className="pp-eyebrow">Aguardando pagamento</div>
        <h1>Pague com Pix<br /><span className="accent">e seu ingresso é seu.</span></h1>

        <div className="pp-stack pp-stack-5" style={{ marginTop: 'var(--pp-s-6)', alignItems: 'center' }}>
          <div className="pp-qrcard">
            {qrSrc ? <img src={qrSrc} alt="QR Code Pix" /> : <div className="pp-spinner" />}
          </div>

          <div className="pp-pixcode" style={{ width: '100%' }}>
            <code>{order.pix_payload}</code>
            <button className="pp-btn pp-btn--primary pp-btn--sm" onClick={copyPix}>
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>

          <div className="pp-ordersum" style={{ width: '100%' }}>
            <div className="pp-ordersum__thumb" />
            <div className="pp-grow">
              <div style={{ fontWeight: 600, fontSize: 'var(--pp-fs-14)' }}>{order.event_title ?? 'Seu pedido'}</div>
              <div className="pp-muted" style={{ fontSize: 'var(--pp-fs-12)', marginTop: 2 }}>Ingresso PulsePass</div>
            </div>
            <div className="pp-ordersum__price">{brl(order.total_cents)}</div>
          </div>

          <p className="pp-muted" style={{ textAlign: 'center', fontSize: 'var(--pp-fs-13)' }}>
            <span className="pp-spinner pp-spinner--sm" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 8 }} />
            A confirmação chega aqui em até 30 segundos. Você pode fechar a página.
          </p>

          {DEV && (
            <button className="pp-btn pp-btn--glass pp-btn--block" onClick={simulate}>
              (dev) Simular pagamento confirmado
            </button>
          )}
        </div>
      </div>
    </Page>
  );
}
