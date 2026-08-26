import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shell, ErrorBox, OpsBack } from '../components/Shell.jsx';
import { Icon } from '@pulsepass/shared/Icon';
import { api } from '../lib/api.js';
import {
  syncManifest, checkLocal, syncQueue, pendingCount, manifestMeta, searchManifest,
} from '../lib/offlineDoor.js';
import { startScanner, cameraSupported, secureContextOk, feedback } from '../lib/qrScanner.js';

/* Três leituras, não quatro cores escritas à mão: liberado, atenção, barrado.
   O CSS (.ck-veredito--*) carrega fundo, borda e cor do texto juntos — era
   isso que estava espalhado em rgba solto, inclusive com o verde antigo. */
const VEREDITO = {
  ok: 'ok',
  already_used: 'aviso',
  invalid: 'erro',
  wrong_event: 'erro',
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
  const [occupancy, setOccupancy] = useState(null);

  // Busca por nome no manifesto — para quem chega sem bateria e fala o nome.
  const [busca, setBusca] = useState('');
  const [achados, setAchados] = useState([]);

  // Últimos check-ins da noite. Cada scan apagava o anterior da tela, e o
  // porteiro não tinha como conferir "quem foi o último que passou" quando
  // alguém contestava. Memória local da sessão — não é a trilha de auditoria.
  const [historico, setHistorico] = useState([]);

  // Qual portaria é esta. Fica no aparelho (localStorage): o tablet da
  // Portaria 2 configura uma vez e todo scan da noite sai carimbado.
  const [gate, setGate] = useState(() => {
    try { return localStorage.getItem(`pp-gate-${id}`) ?? ''; } catch { return ''; }
  });
  function saveGate(v) {
    setGate(v);
    try { localStorage.setItem(`pp-gate-${id}`, v); } catch { /* modo privado */ }
  }

  // Câmera existe? (BarcodeDetector não é mais requisito — jsQR cobre iOS/Firefox.)
  const scanSupported = cameraSupported();
  const scanBlockedByHttp = scanSupported && !secureContextOk();

  async function refreshOfflineState() {
    try { setPending(await pendingCount()); setManifest(await manifestMeta()); } catch { /* idb indisponível */ }
  }

  // Lotação: quantos estão DENTRO agora. É o número que segurança e bombeiro
  // perguntam, e o porteiro precisa ver sem sair da tela de validação.
  async function refreshOccupancy() {
    try { setOccupancy(await api.occupancy(id)); } catch { /* offline: mantém o último */ }
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
    refreshOccupancy();
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
      const r = await api.checkIn(id, input, undefined, gate.trim() || undefined);
      setResult(r);
      feedback(r.result === 'ok');
      setCode('');
      setHistorico((h) => [{ ...r, at: Date.now() }, ...h].slice(0, 7));
      refreshOccupancy();
    } catch (e) {
      // Sem rede → valida contra o manifesto offline e enfileira.
      if (e.message === 'fetch:offline' || isNetworkError(e.message)) {
        try {
          const r = await checkLocal(input);
          setResult(r);
          feedback(r.result === 'ok');
          setCode('');
          setHistorico((h) => [{ ...r, at: Date.now() }, ...h].slice(0, 7));
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

  const veredito = result ? VEREDITO[result.result] ?? 'erro' : null;

  return (
    <Shell>
      <OpsBack eventId={id} />
      <div className="ck-eyebrow">porta · check-in</div>
      <h1 className="ck-h1">Validar entrada</h1>
      <p className="ck-sub">Escaneie o QR ou digite o código do ingresso (PP-XXXX-XXXX).</p>
      <Link to={`/eventos/${id}/lista-porta`} className="ck-btn ck-btn--glass ck-btn--sm ck-mb-4">
        <Icon name="users" size={15} /> Check-in da lista (AZList)
      </Link>

      {/* Barra de status offline */}
      <div className="ck-card ck-w-form ck-flex ck-ai-center ck-gap-3 pp-wrap">
        <span className={`ck-status ${online ? 'ck-c-pulse' : 'ck-c-amber'}`}>
          {online ? 'Online' : 'Offline'}
        </span>
        <span className="pp-muted ck-t-support">
          {manifest ? `Manifesto: ${manifest.count} ingressos` : 'Manifesto não baixado'}
        </span>
        {pending > 0 && (
          <span className="ck-c-amber ck-t-support">· {pending} na fila</span>
        )}
        {occupancy && (
          <span className="ck-iflex ck-ai-center ck-gap-2 ck-t-support">
            <Icon name="users" size={14} />
            <strong className="pp-mono ck-t-body">{occupancy.inside}</strong>
            <span className="pp-muted-2">dentro</span>
            {occupancy.left > 0 && <span className="pp-muted-2">· {occupancy.left} saíram</span>}
          </span>
        )}
        {/* Progresso da noite: quantos dos vendidos já entraram, quantos faltam.
            É o que responde "vai chegar mais gente?" sem sair da tela. Os dados
            já vinham da RPC de lotação — só não eram renderizados. */}
        {occupancy?.tickets_sold > 0 && (
          <span className="ck-t-support pp-muted">
            · check-ins{' '}
            <strong className="pp-mono ck-c-fg">
              {Math.min(100, Math.round(((occupancy.inside + occupancy.left) / occupancy.tickets_sold) * 100))}%
            </strong>
            {' '}· faltam{' '}
            <strong className="pp-mono ck-c-fg">
              {Math.max(0, occupancy.tickets_sold - occupancy.inside - occupancy.left)}
            </strong>
          </span>
        )}
        <div className="ck-ml-auto ck-flex ck-gap-2">
          <button type="button" className="ck-btn ck-btn--glass" onClick={downloadManifest} disabled={manifestBusy || !online}>
            {manifestBusy ? 'Baixando…' : 'Baixar manifesto'}
          </button>
          {pending > 0 && online && (
            <button type="button" className="ck-btn ck-btn--primary" onClick={doSync}>Sincronizar ({pending})</button>
          )}
        </div>
      </div>

      <div className="ck-card ck-w-form ck-mt-4">
        <form onSubmit={(e) => { e.preventDefault(); submit(); }}>
          {/* Qual portaria é esta: carimba cada movimento com o portão. Fica
              gravado no aparelho — configura uma vez, vale a noite toda. */}
          <div className="ck-field">
            <label htmlFor="porta-gate" className="ck-label">Portaria (opcional)</label>
            <input id="porta-gate" className="ck-input" value={gate} maxLength={40}
              onChange={(e) => saveGate(e.target.value)} placeholder="ex: Portaria 1" />
          </div>
          <div className="ck-field">
            <label htmlFor="porta-1" className="ck-label">Código do ingresso</label>
            <input id="porta-1" className="ck-input pp-mono ck-cod" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="PP-XXXX-XXXX" autoFocus/>
          </div>
          {error && <ErrorBox>{error}</ErrorBox>}
          <div className="ck-flex ck-gap-3 pp-wrap">
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
        <div className={`ck-mt-4 ck-rel ${scanning ? '' : 'ck-none'}`}>
          <video ref={videoRef} muted playsInline
            className="ck-scanvideo" />
          {/* Mira: ajuda o porteiro a centralizar o QR sem pensar. */}
          <div aria-hidden className="ck-mira" />
          <p className="pp-muted-2 ck-t-support ck-mt-3">
            Câmera ligada — a fila pode andar sem parar. Cada leitura apita.
          </p>
        </div>

        {scanBlockedByHttp && (
          <p className="ck-c-amber ck-t-support ck-mt-3">
            A câmera exige HTTPS. Abra o cockpit por um endereço https:// para escanear.
          </p>
        )}
        {!scanSupported && (
          <p className="pp-muted-2 ck-t-support ck-mt-3">
            Este dispositivo não expõe câmera ao navegador — use a entrada manual.
          </p>
        )}
      </div>

      {/* Busca por NOME no manifesto baixado. Existe para a pessoa sem bateria
          no celular: ela fala o nome, o porteiro valida pelo código. Funciona
          offline por construção — a fonte é o IndexedDB, não a rede. */}
      {manifest && (
        <div className="ck-card ck-w-form ck-mt-4">
          <div className="ck-field ck-m-0">
            <label htmlFor="porta-busca" className="ck-label">Buscar por nome (no manifesto)</label>
            <input id="porta-busca" className="ck-input" value={busca}
              autoComplete="off"
              onChange={async (e) => {
                const v = e.target.value;
                setBusca(v);
                try { setAchados(await searchManifest(v)); } catch { setAchados([]); }
              }}
              placeholder="nome de quem comprou" />
          </div>
          {achados.length > 0 && (
            <ul className="ck-lista ck-mt-3">
              {achados.map((t) => (
                <li key={t.id} className="ck-linha">
                  <div className="ck-min0">
                    <div className="ck-w-semi">{t.holder}</div>
                    <div className="pp-muted-2 ck-t-support">
                      <span className="pp-mono">{t.code}</span> · {t.tier}
                      {t.status !== 'valid' && <span className="ck-c-amber"> · {t.status === 'used' ? 'já entrou' : t.status}</span>}
                    </div>
                  </div>
                  {t.status === 'valid' && (
                    <button className="ck-btn ck-btn--primary ck-btn--sm" disabled={busy}
                      onClick={() => { setBusca(''); setAchados([]); submit(t.code); }}>
                      Validar
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          {busca.trim().length >= 2 && achados.length === 0 && (
            <p className="pp-muted-2 ck-t-support ck-mt-3">
              Ninguém com esse nome no manifesto. Confira a grafia — ou o ingresso é de outro evento.
            </p>
          )}
        </div>
      )}

      {result && (
        <div
          className={`ck-card ck-w-form ck-mt-5 ck-veredito ck-veredito--${veredito}`}
        >
          {/* A mensagem vem do servidor e já distingue entrada, reentrada e
              saída — o porteiro precisa ver QUAL foi, não só "ok". */}
          <div className="ck-veredito__msg">
            {result.result === 'ok' ? (
              <>
                <Icon name={result.direction === 'out' ? 'arrowRight' : 'check'} size={22} strokeWidth={2.5} />
                {result.message ?? 'Entrada liberada'}
              </>
            ) : result.message}
          </div>
          {result.result === 'ok' && result.entries > 1 && (
            <p className="pp-muted ck-meta">
              {result.entries}ª entrada deste ingresso
            </p>
          )}
          {result.offline && <p className="ck-c-amber ck-meta">validado offline · será sincronizado</p>}
          {result.holder && <p className="ck-mt-2">{result.holder} · {result.tier}</p>}
          {result.code && <p className="pp-muted pp-mono">{result.code}</p>}
          {result.checked_in_at && result.result === 'already_used' && (
            <p className="pp-muted ck-t-support">
              Check-in anterior: {new Date(result.checked_in_at).toLocaleString('pt-BR')}
            </p>
          )}
        </div>
      )}

      {/* Log dos últimos scans desta sessão — quando alguém contesta na fila,
          a resposta está aqui, não na memória do porteiro. */}
      {historico.length > 1 && (
        <div className="ck-card ck-w-form ck-mt-4">
          <div className="ck-label">Últimos check-ins</div>
          <ul className="ck-lista ck-mt-3">
            {historico.map((h, i) => (
              <li key={`${h.at}-${i}`} className="ck-linha ck-t-support">
                <span className="ck-min0 ck-trunc">
                  <span className={`ck-mr-2 ${h.result === 'ok' ? 'ck-c-pulse' : h.result === 'already_used' ? 'ck-c-amber' : 'ck-c-red'}`}>●</span>
                  {h.holder ?? h.code ?? h.message}
                  {h.offline && <span className="ck-c-amber"> · offline</span>}
                </span>
                <span className="pp-muted-2 pp-mono ck-nowrap">
                  {new Date(h.at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Shell>
  );
}
