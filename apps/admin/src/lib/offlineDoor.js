// ─────────────────────────────────────────────────────────────
// Modo offline da PORTA. Mantém um cache do manifesto de ingressos e
// uma fila de check-ins feitos sem internet, sincronizada ao reconectar.
// Armazenamento: IndexedDB (aguenta milhares de ingressos, persiste reload).
// ─────────────────────────────────────────────────────────────
import { api } from './api.js';

const DB_NAME = 'pulsepass-door';
const DB_VERSION = 1;
const STORE_MANIFEST = 'manifest'; // key: code | id  → ticket
const STORE_QUEUE = 'queue';       // fila de scans pendentes
const STORE_META = 'meta';         // metadados (ex: localmente usados)

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_MANIFEST)) db.createObjectStore(STORE_MANIFEST, { keyPath: 'key' });
      if (!db.objectStoreNames.contains(STORE_QUEUE)) db.createObjectStore(STORE_QUEUE, { keyPath: 'client_id' });
      if (!db.objectStoreNames.contains(STORE_META)) db.createObjectStore(STORE_META, { keyPath: 'key' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx(db, store, mode = 'readonly') {
  return db.transaction(store, mode).objectStore(store);
}
const done = (req) => new Promise((res, rej) => { req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error); });

/** Baixa o manifesto do evento e indexa por código E por id (para os dois formatos de QR). */
export async function syncManifest(eventId) {
  const manifest = await api.manifest(eventId); // requer rede
  const db = await openDb();
  const store = tx(db, STORE_MANIFEST, 'readwrite');
  await done(store.clear());
  for (const t of manifest.tickets) {
    // indexa pelo código e pelo par id:secret
    store.put({ key: `C:${t.code.toUpperCase()}`, ...t });
    store.put({ key: `P:${t.id}:${t.qr_secret}`, ...t });
  }
  const meta = tx(db, STORE_META, 'readwrite');
  meta.put({ key: 'manifest', event_id: eventId, generated_at: manifest.generated_at, count: manifest.count });
  return manifest.count;
}

function manifestKey(input) {
  const raw = String(input).trim();
  if (raw.startsWith('PULSEPASS:')) {
    const [, id, secret] = raw.split(':');
    return `P:${id}:${secret}`;
  }
  return `C:${raw.toUpperCase()}`;
}

/**
 * Valida um scan OFFLINE contra o manifesto e marca como usado localmente.
 * Idempotente: se já usado localmente, retorna already_used.
 */
export async function checkLocal(input) {
  const db = await openDb();
  const key = manifestKey(input);
  const ticket = await done(tx(db, STORE_MANIFEST).get(key));
  if (!ticket) return { result: 'invalid', message: 'Não encontrado no manifesto (offline)' };

  const usedKey = `used:${ticket.id}`;
  const already = await done(tx(db, STORE_META).get(usedKey));
  if (already || ticket.status === 'used') {
    return { result: 'already_used', message: 'Já utilizado', holder: ticket.holder, tier: ticket.tier };
  }
  if (ticket.status !== 'valid') return { result: 'invalid', message: `Ingresso ${ticket.status}` };

  const scanned_at = new Date().toISOString();
  // marca localmente como usado + enfileira para sync
  tx(db, STORE_META, 'readwrite').put({ key: usedKey, at: scanned_at });
  const client_id = `${ticket.id}-${Date.now()}`;
  tx(db, STORE_QUEUE, 'readwrite').put({ client_id, input, scanned_at });

  return { result: 'ok', message: 'Entrada liberada (offline)', holder: ticket.holder, tier: ticket.tier, offline: true, scanned_at };
}

export async function pendingCount() {
  const db = await openDb();
  return done(tx(db, STORE_QUEUE).count());
}

/** Envia a fila pendente ao backend (idempotente) e limpa o que foi processado. */
export async function syncQueue(eventId) {
  const db = await openDb();
  const scans = await done(tx(db, STORE_QUEUE).getAll());
  if (!scans.length) return { processed: 0 };

  const { results } = await api.checkInBatch(eventId, scans.map((s) => ({
    client_id: s.client_id, input: s.input, scanned_at: s.scanned_at,
  })));

  // remove da fila os que o servidor confirmou (ok/already_used/invalid → resolvidos)
  const store = tx(db, STORE_QUEUE, 'readwrite');
  for (const r of results) {
    if (r.client_id && r.result !== 'error') store.delete(r.client_id);
  }
  return { processed: results.length, results };
}

export async function manifestMeta() {
  const db = await openDb();
  return done(tx(db, STORE_META).get('manifest'));
}

/**
 * Busca por NOME no manifesto já baixado — funciona offline, que é onde ela
 * mais importa: a pessoa sem bateria no celular fala o nome, não o código.
 * O manifesto indexa cada ingresso duas vezes (código e id:secret), então o
 * resultado é deduplicado pelo id antes de devolver.
 */
export async function searchManifest(query) {
  const q = String(query ?? '').trim().toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (q.length < 2) return [];
  const db = await openDb();
  const all = await done(tx(db, STORE_MANIFEST).getAll());
  const vistos = new Set();
  const achados = [];
  for (const t of all) {
    if (vistos.has(t.id)) continue;
    const nome = String(t.holder ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    if (!nome.includes(q)) continue;
    vistos.add(t.id);
    achados.push({ id: t.id, code: t.code, holder: t.holder, tier: t.tier, status: t.status });
    if (achados.length >= 8) break; // porta é fila: 8 já é mais do que se lê
  }
  return achados;
}
