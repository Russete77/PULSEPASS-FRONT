// Leitura de QR pela câmera para a operação de porta.
//
// Por que não usar só o BarcodeDetector: ele não existe no Safari/iOS nem no
// Firefox — ou seja, no aparelho de metade dos porteiros o scanner simplesmente
// não abriria. Aqui ele é usado quando existe (é nativo e mais rápido) e o jsQR
// entra como plano B, decodificando os frames num canvas.
//
// Detalhes que só aparecem numa porta de verdade e estão tratados:
//  · scan CONTÍNUO — a fila não para pra cada leitura;
//  · dedupe por código — o mesmo QR na frente da câmera não é reenviado em loop;
//  · lanterna (torch) — porta de festa é escura;
//  · beep + vibração — o porteiro olha a fila, não a tela;
//  · getUserMedia exige HTTPS (exceto localhost): a UI precisa avisar antes.
import jsQR from 'jsqr';

export const cameraSupported = () =>
  typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

/** getUserMedia só funciona em contexto seguro. Sem isto o botão "abrir câmera" morre calado. */
export const secureContextOk = () =>
  typeof window === 'undefined' ||
  window.isSecureContext ||
  ['localhost', '127.0.0.1'].includes(window.location.hostname);

const hasNativeDetector = () =>
  typeof window !== 'undefined' && 'BarcodeDetector' in window;

/** Feedback sonoro curto — dois timbres: aceito (agudo) e recusado (grave). */
export function feedback(ok) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) {
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = ok ? 880 : 220;
      osc.type = 'square';
      gain.gain.value = 0.06;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + (ok ? 0.09 : 0.22));
      setTimeout(() => ctx.close(), 400);
    }
  } catch { /* áudio bloqueado até o 1º gesto do usuário — silencioso é aceitável */ }
  try { navigator.vibrate?.(ok ? 40 : [60, 50, 60]); } catch { /* sem vibração */ }
}

/**
 * Abre a câmera e chama onCode(texto) a cada QR novo lido.
 * Devolve um controlador: { stop, toggleTorch, torchAvailable }.
 */
export async function startScanner({ video, onCode, onError, dedupeMs = 2500 }) {
  if (!cameraSupported()) throw new Error('Este dispositivo não expõe câmera ao navegador.');
  if (!secureContextOk()) {
    throw new Error('A câmera exige HTTPS. Abra o cockpit por um endereço https:// (ou localhost).');
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
    audio: false,
  });

  video.srcObject = stream;
  video.setAttribute('playsinline', 'true'); // iOS não entra em fullscreen sozinho
  await video.play();

  const track = stream.getVideoTracks()[0];
  const torchAvailable = !!track?.getCapabilities?.().torch;
  let torchOn = false;
  let alive = true;
  let lastCode = null;
  let lastAt = 0;

  const detector = hasNativeDetector()
    // eslint-disable-next-line no-undef
    ? new window.BarcodeDetector({ formats: ['qr_code'] })
    : null;

  // Canvas só é necessário no caminho jsQR.
  const canvas = detector ? null : document.createElement('canvas');
  const ctx2d = canvas ? canvas.getContext('2d', { willReadFrequently: true }) : null;

  function emit(raw) {
    const now = Date.now();
    if (raw === lastCode && now - lastAt < dedupeMs) return; // mesmo QR ainda na frente da lente
    lastCode = raw;
    lastAt = now;
    onCode(raw);
  }

  async function readFrame() {
    if (detector) {
      const found = await detector.detect(video);
      if (found[0]?.rawValue) emit(found[0].rawValue);
      return;
    }
    if (!video.videoWidth) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx2d.drawImage(video, 0, 0, canvas.width, canvas.height);
    const { data, width, height } = ctx2d.getImageData(0, 0, canvas.width, canvas.height);
    const found = jsQR(data, width, height, { inversionAttempts: 'dontInvert' });
    if (found?.data) emit(found.data);
  }

  // ~8 leituras/s: suficiente pra fila andando e leve o bastante pra tablet antigo.
  const timer = setInterval(() => {
    if (!alive) return;
    readFrame().catch((e) => onError?.(e));
  }, 120);

  return {
    torchAvailable,
    async toggleTorch() {
      if (!torchAvailable) return false;
      torchOn = !torchOn;
      try {
        await track.applyConstraints({ advanced: [{ torch: torchOn }] });
      } catch { torchOn = !torchOn; }
      return torchOn;
    },
    stop() {
      alive = false;
      clearInterval(timer);
      stream.getTracks().forEach((t) => t.stop());
      if (video) video.srcObject = null;
    },
  };
}
