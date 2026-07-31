import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shell, ErrorBox, OpsBack } from '../components/Shell.jsx';
import { Icon } from '@pulsepass/shared/Icon';
import { api } from '../lib/api.js';
import {
  syncManifest, checkLocal, syncQueue, pendingCount, manifestMeta,
} from '../lib/offlineDoor.js';
import { startScanner, cameraSupported, secureContextOk, feedback } from '../lib/qrScanner.js';

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
  const [torchAvailable, setTorchAvailable] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  // ── estado offline ──
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pending, setPending] = useState(0);
  const [manifest, setManifest] = useState(null);
  const [manifestBusy, setManifestBusy] = useState(false);

  // Câmera existe? (BarcodeDetector não é mais requisito — jsQR cobre iOS/Firefox.)
  const scanSupported = cameraSupported();
  const scanBlockedByHttp = scanSupported && !secureContextOk();

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
      feedback(r.result === 'ok');
      setCode('');
    } catch (e) {
      // Sem rede → valida contra o manifesto offline e enfileira.
      if (e.message === 'fetch:offline' || isNetworkError(e.message)) {
        try {
          const r = await checkLocal(input);
          setResult(r);
          feedback(r.result === 'ok');
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

  // Câmera: fica LIGADA enquanto a fila anda. Cada QR novo é validado na hora,
  // com beep/vibração — o porteiro acompanha pelo som, sem depender da tela.
  async function startScan() {
    setError('');
    try {
      const ctrl = await startScanner({
        video: videoRef.current,
        onCode: (raw) => submit(raw),
        onError: () => { /* frame ruim: ignora e tenta o próximo */ },
      });
      scannerRef.current = ctrl;
      setTorchAvailable(ctrl.torchAvailable);
      setScanning(true);
    } catch (e) {
      setError(e.message);
      setScanning(false);
    }
  }

  function stopScan() {
    scannerRef.current?.stop();
    scannerRef.current = null;
    setScanning(false);
    setTorchOn(false);
  }

  async function toggleTorch() {
    const on = await scannerRef.current?.toggleTorch();
    setTorchOn(!!on);
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
              <button type="button" className="ck-btn ck-btn--glass" onClick={startScan}>
                <Icon name="scan" size={15} /> Escanear QR
              </button>
            )}
            {scanning && (
              <>
                <button type="button" className="ck-btn ck-btn--glass" onClick={stopScan}>Parar câmera</button>
                {torchAvailable && (
                  <button type="button" className={`ck-btn ${torchOn ? 'ck-btn--primary' : 'ck-btn--glass'}`} onClick={toggleTorch}>
                    {torchOn ? 'Lanterna ligada' : 'Lanterna'}
                  </button>
                )}
              </>
            )}
          </div>
        </form>

        {/* O vídeo fica montado sempre: o ref precisa existir ANTES de startScanner. */}
        <div style={{ display: scanning ? 'block' : 'none', marginTop: 16, position: 'relative' }}>
          <video ref={videoRef} muted playsInline
            style={{ width: '100%', borderRadius: 12, background: '#000', aspectRatio: '4 / 3', objectFit: 'cover' }} />
          {/* Mira: ajuda o porteiro a centralizar o QR sem pensar. */}
          <div aria-hidden style={{
            position: 'absolute', inset: '18% 22%', border: '2px solid rgba(0,255,133,0.85)',
            borderRadius: 14, boxShadow: '0 0 0 9999px rgba(0,0,0,0.28)', pointerEvents: 'none',
          }} />
          <p style={{ color: 'var(--pp-fg-4)', fontSize: 12, marginTop: 10 }}>
            Câmera ligada — a fila pode andar sem parar. Cada leitura apita.
          </p>
        </div>

        {scanBlockedByHttp && (
          <p style={{ color: 'var(--pp-amber)', fontSize: 12, marginTop: 12 }}>
            A câmera exige HTTPS. Abra o cockpit por um endereço https:// para escanear.
          </p>
        )}
        {!scanSupported && (
          <p style={{ color: 'var(--pp-fg-4)', fontSize: 12, marginTop: 12 }}>
            Este dispositivo não expõe câmera ao navegador — use a entrada manual.
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
