#!/usr/bin/env node
// Gera os ícones do PWA da operação (192 e 512) sem dependência de imagem:
// desenha em RGBA na mão e codifica um PNG com o zlib do próprio Node.
//
// Marca: anel duplo + traço de pulso, nas cores do design system.
// Rodar: node scripts/gen-icons.mjs   (saída em public/)
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const BG = [6, 7, 10];        // --pp-bg
const PULSE = [0, 255, 133];  // --pp-pulse

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = c ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

/** rgba: Uint8Array de w*h*4 → Buffer PNG. */
function encodePng(rgba, w, h) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0; // filtro None
    Buffer.from(rgba.buffer, y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8 bits, RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function draw(size) {
  const rgba = new Uint8Array(size * size * 4);
  const cx = size / 2, cy = size / 2;
  const put = (x, y, [r, g, b], a = 1) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    // mistura simples sobre o que já está lá (antialias das bordas)
    rgba[i] = rgba[i] * (1 - a) + r * a;
    rgba[i + 1] = rgba[i + 1] * (1 - a) + g * a;
    rgba[i + 2] = rgba[i + 2] * (1 - a) + b * a;
    rgba[i + 3] = 255;
  };

  // Fundo
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) put(x, y, BG, 1);

  // Anel externo e interno (cobertura por subpixel → borda macia)
  const anel = (raio, espessura, alpha) => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
        const dist = Math.abs(d - raio);
        if (dist <= espessura / 2) put(x, y, PULSE, alpha);
        else if (dist <= espessura / 2 + 1) put(x, y, PULSE, alpha * (espessura / 2 + 1 - dist));
      }
    }
  };
  anel(size * 0.40, Math.max(2, size * 0.045), 1);
  anel(size * 0.30, Math.max(1, size * 0.014), 0.35);

  // Traço de pulso (batimento) no centro, desenhado como polilinha grossa.
  const pts = [
    [0.24, 0.50], [0.38, 0.50], [0.44, 0.36], [0.52, 0.64], [0.58, 0.44], [0.64, 0.50], [0.76, 0.50],
  ].map(([px, py]) => [px * size, py * size]);
  const grossura = Math.max(2, size * 0.045);
  for (let s = 0; s < pts.length - 1; s++) {
    const [x0, y0] = pts[s], [x1, y1] = pts[s + 1];
    const passos = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2);
    for (let t = 0; t <= passos; t++) {
      const x = x0 + ((x1 - x0) * t) / passos;
      const y = y0 + ((y1 - y0) * t) / passos;
      for (let dy = -grossura; dy <= grossura; dy++) {
        for (let dx = -grossura; dx <= grossura; dx++) {
          const d = Math.hypot(dx, dy);
          if (d <= grossura / 2) put(Math.round(x + dx), Math.round(y + dy), PULSE, 1);
          else if (d <= grossura / 2 + 1) put(Math.round(x + dx), Math.round(y + dy), PULSE, grossura / 2 + 1 - d);
        }
      }
    }
  }
  return rgba;
}

mkdirSync(OUT, { recursive: true });
for (const size of [192, 512]) {
  writeFileSync(join(OUT, `icon-${size}.png`), encodePng(draw(size), size, size));
  console.log(`✓ public/icon-${size}.png`);
}
