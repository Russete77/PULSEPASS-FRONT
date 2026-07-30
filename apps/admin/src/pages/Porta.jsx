import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shell, ErrorBox, OpsBack } from '../components/Shell.jsx';
import { Icon } from '@pulsepass/shared/Icon';
import { api } from '../lib/api.js';
import {
  syncManifest, checkLocal, syncQueue, pendingCount, manifestMeta,
} from '../lib/offlineDoor.js';

const RESULT_STYLE = {
  ok: { bg: 'rgba(0,255,133,0.10)', border: 'rgba(0,255,133,0.45)', color: 'var(--pp-pulse)' },
  already_used: { bg: 'rgba(255,184,0,0.10)', border: 'rgba(255,184,0,0.4)', color: 'var(--pp-amber)' },
  invalid: { bg: 'rgba(255,59,48,0.10)', border: 'rgba(255,59,48,0.4)', color: '#FF6B61' },
  wrong_event: { bg: 'rgba(255,59,48,0.10)', border: 'rgba(255,59,48,0.4)', color: '#FF6B61' },
};

const isNetworkError = (msg) =>
  /failed to fetch|networkerror|load failed|fetch/i.test(String(msg));

export default function Porta() {
  const { id } = useParams();
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // ── estado offline ──
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pending, setPending] = useState(0);
  const [manifest, setManifest] = useState(null);
  const [manifestBusy, setManifestBusy] = useState(false);

  const scanSupported = typeof window !== 'undefined' && 'BarcodeDetector' in window;

  async function refreshOfflineState() {
    try { setPending(await pendingCount()); setManifest(await manifestMeta()); } catch { /* idb indisponível */ }
  }

  async function doSync() {
    try {
      const r = await syncQueue(id);
      await refreshOfflineState();
      return r;
    } catch (e) { setError('Falha ao sincronizar: ' + e.message); }
  }

  async function downloadManifest() {
    setManifestBusy(true); setError('');
    try {
      const count = await syncManifest(id);
      await refreshOfflineState();
      setResult({ result: 'ok', message: `Manifesto baixado · ${count} ingressos prontos para offline` });
    } catch (e) {
      setError('Não foi possível baixar o manifesto: ' + e.message);
    } finally { setManifestBusy(false); }
  }

  useEffect(() => {
    refreshOfflineState();
    const goOnline = () => { setOnline(true); doSync(); };
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function submit(value) {
    const input = (value ?? code).trim();
    if (!input) return;
    setBusy(true);
    setError('');
    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) throw new Error('fetch:offline');
      const r = await api.checkIn(id, input);
      setResult(r);
      setCode('');
    } catch (e) {
      // Sem rede → valida contra o manifesto offline e enfileira.
      if (e.message === 'fetch:offline' || isNetworkError(e.message)) {
        try {
          const r = await checkLocal(input);
          setResult(r);
          setCode('');
          await refreshOfflineState();
        } catch (le) {
          setError('Offline e sem manifesto baixado: ' + le.message);
        }
      } else {
        setError(e.message);
      }
    } finally {
      setBusy(false);
    }
  }

  async function startScan() {
    if (!scanSupported) return;
    setScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      // eslint-disable-next-line no-undef
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      const tick = async () => {
        if (!streamRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes[0]?.rawValue) {
            stopScan();
            submit(codes[0].rawValue);
            return;
          }
        } catch {/* ignore frame errors */}
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    } catch (e) {
      setError('Câmera indisponível: ' + e.message);
      setScanning(false);
    }
  }

  function stopScan() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  }

  useEffect(() => () => stopScan(), []);

  const rs = result ? RESULT_STYLE[result.result] ?? RESULT_STYLE.invalid : null;

  return (
    <Shell>
      <OpsBack eventId={id} />
      <div className="ck-eyebrow">porta · check-in</div>
      <h1 className="ck-h1">Validar entrada</h1>
      <p className="ck-sub">Escaneie o QR ou digite o código do ingresso (PP-XXXX-XXXX).</p>
      <Link to={`/eventos/${id}/lista-porta`} className="ck-btn ck-btn--glass ck-btn--sm" style={{ marginBottom: 'var(--pp-s-4)' }}>
        <Icon name="users" size={15} /> Check-in da lista (AZList)
      </Link>

      {/* Barra de status offline */}
      <div className="ck-card" style={{ maxWidth: 520, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13,
          color: online ? 'var(--pp-pulse)' : 'var(--pp-amber)',
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: 99,
            background: online ? 'var(--pp-pulse)' : 'var(--pp-amber)',
          }} />
          {online ? 'Online' : 'Offline'}
        </span>
        <span style={{ color: 'var(--pp-fg-3)', fontSize: 13 }}>
          {manifest ? `Manifesto: ${manifest.count} ingressos` : 'Manifesto não baixado'}
        </span>
        {pending > 0 && (
          <span style={{ color: 'var(--pp-amber)', fontSize: 13 }}>· {pending} na fila</span>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button type="button" className="ck-btn ck-btn--glass" onClick={downloadManifest} disabled={manifestBusy || !online}>
            {manifestBusy ? 'Baixando…' : 'Baixar manifesto'}
          </button>
          {pending > 0 && online && (
            <button type="button" className="ck-btn ck-btn--primary" onClick={doSync}>Sincronizar ({pending})</button>
          )}
        </div>
      </div>

      <div className="ck-card" style={{ maxWidth: 520, marginTop: 16 }}>
        <form onSubmit={(e) => { e.preventDefault(); submit(); }}>
          <div className="ck-field">
            <label className="ck-label">Código do ingresso</label>
            <input
              className="ck-input"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="PP-XXXX-XXXX"
              autoFocus
              style={{ fontFamily: 'var(--pp-font-mono)', letterSpacing: 2 }}
            />
          </div>
          {error && <ErrorBox>{error}</ErrorBox>}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="ck-btn ck-btn--primary" disabled={busy || !code.trim()}>
              {busy ? 'Validando…' : 'Validar'}
            </button>
            {scanSupported && !scanning && (
              <button type="button" className="ck-btn ck-btn--glass" onClick={startScan}>Escanear QR</button>
            )}
            {scanning && (
              <button type="button" className="ck-btn ck-btn--glass" onClick={stopScan}>Parar câmera</button>
            )}
          </div>
        </form>

        {scanning && (
          <video ref={videoRef} muted playsInline style={{ width: '100%', borderRadius: 12, marginTop: 16, background: '#000' }} />
        )}
        {!scanSupported && (
          <p style={{ color: 'var(--pp-fg-4)', fontSize: 12, marginTop: 12 }}>
            Scanner de câmera indisponível neste navegador — use a entrada manual.
          </p>
        )}
      </div>

      {result && (
        <div
          className="ck-card"
          style={{ maxWidth: 520, marginTop: 20, background: rs.bg, borderColor: rs.border }}
        >
          <div style={{ fontFamily: 'var(--pp-font-display)', fontWeight: 700, fontSize: 'var(--pp-fs-24)', color: rs.color, display: 'flex', alignItems: 'center', gap: 10 }}>
            {result.result === 'ok' ? <><Icon name="check" size={22} strokeWidth={2.5} /> Entrada liberada</> : result.message}
          </div>
          {result.offline && <p style={{ color: 'var(--pp-amber)', fontSize: 12, marginTop: 4 }}>validado offline · será sincronizado</p>}
          {result.holder && <p style={{ marginTop: 8 }}>{result.holder} · {result.tier}</p>}
          {result.code && <p style={{ color: 'var(--pp-fg-3)', fontFamily: 'var(--pp-font-mono)' }}>{result.code}</p>}
          {result.checked_in_at && result.result === 'already_used' && (
            <p style={{ color: 'var(--pp-fg-3)', fontSize: 13 }}>
              Check-in anterior: {new Date(result.checked_in_at).toLocaleString('pt-BR')}
            </p>
          )}
        </div>
      )}
    </Shell>
  );
}
