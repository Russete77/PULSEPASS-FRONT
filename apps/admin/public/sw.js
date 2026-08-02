/* PulsePass · Cockpit — service worker da operação.
 *
 * Por que existe: a porta já validava offline contra o manifesto e enfileirava
 * os scans, mas se o navegador fechasse ou a página recarregasse sem rede, o
 * app simplesmente não abria — e o porteiro ficava sem ferramenta no meio da
 * fila. Isto garante que o cockpit CARREGUE sem internet.
 *
 * Regras deliberadas:
 *  · navegação  → rede primeiro, caindo pro shell em cache (app sempre abre);
 *  · /assets/*  → cache primeiro (nome com hash = imutável);
 *  · /api/*     → NUNCA cacheado. Resposta velha de check-in seria pior que
 *                 erro de rede: liberaria entrada com base em dado morto.
 *                 Quem trata a ausência de rede é a fila offline do app.
 */
const VERSION = 'pp-cockpit-v1';
const SHELL = `${VERSION}-shell`;
const ASSETS = `${VERSION}-assets`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL)
      .then((c) => c.addAll(['/', '/index.html']))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;   // Supabase/API externa: passa direto
  if (url.pathname.startsWith('/api/')) return;      // nunca servir API de cache

  // Navegação: tenta a rede, mas garante que o app abre offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL).then((c) => c.put('/index.html', copy));
          return res;
        })
        .catch(() => caches.match('/index.html').then((r) => r ?? caches.match('/'))),
    );
    return;
  }

  // Assets com hash no nome são imutáveis: cache primeiro, rede só na 1ª vez.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then((hit) => hit ?? fetch(request).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(ASSETS).then((c) => c.put(request, copy));
        }
        return res;
      })),
    );
  }
});
