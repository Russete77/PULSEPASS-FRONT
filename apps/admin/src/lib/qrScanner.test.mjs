// Prova de ida e volta do decodificador de QR usado na portaria.
//
// O caminho nativo (BarcodeDetector) não existe no Safari/iOS nem no Firefox —
// nesses aparelhos quem lê o ingresso é o jsQR. Este teste gera um QR no MESMO
// formato que a API assina (PPX:<ticket>:<exp>:<sig>), rasteriza e manda o jsQR
// decodificar: se o texto não voltar idêntico, a porta não lê ingresso no iPhone.
//
// Rodar: node --test apps/admin/src/lib/qrScanner.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const jsQR = require('jsqr').default ?? require('jsqr');
// Mesmo encoder que a API usa para desenhar o QR do ingresso (devDependency).
const QRCode = require('qrcode');

/** Desenha os módulos do QR em RGBA, com zona de silêncio e escala — como a câmera veria. */
function rasterize(qr, { scale = 6, quiet = 4 } = {}) {
  const size = qr.modules.size;
  const data = qr.modules.data;
  const w = (size + quiet * 2) * scale;
  const rgba = new Uint8ClampedArray(w * w * 4).fill(255); // fundo branco
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!data[y * size + x]) continue; // módulo claro
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          const px = ((y + quiet) * scale + dy) * w + ((x + quiet) * scale + dx);
          rgba[px * 4] = 0; rgba[px * 4 + 1] = 0; rgba[px * 4 + 2] = 0; rgba[px * 4 + 3] = 255;
        }
      }
    }
  }
  return { rgba, w };
}

const roundTrip = async (payload) => {
  const qr = QRCode.create(payload, { errorCorrectionLevel: 'M' });
  const { rgba, w } = rasterize(qr);
  return jsQR(rgba, w, w, { inversionAttempts: 'dontInvert' })?.data;
};

test('jsQR lê o token rotativo assinado (formato PPX)', async () => {
  const token = 'PPX:cc14f878-883e-481a-b70e-5d89095fa9fb:1785360000:9f2ab7c41d3e508a';
  assert.equal(await roundTrip(token), token);
});

test('jsQR lê o código curto do ingresso (entrada manual impressa)', async () => {
  const code = 'PP-ASF2-CSHL';
  assert.equal(await roundTrip(code), code);
});

test('jsQR lê payload longo sem perder caractere', async () => {
  const longo = 'PPX:' + 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'.repeat(2) + ':1785360000:deadbeefcafe1234';
  assert.equal(await roundTrip(longo), longo);
});
