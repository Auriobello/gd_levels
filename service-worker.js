// Service worker minimo: rende il sito "installabile" come PWA
// e mette in cache la shell base per un caricamento più veloce.
// I video restano sempre caricati dal vivo da GitHub Releases (non vengono messi in cache).

const CACHE_NAME = 'society-levels-v1';
const SHELL_FILES = [
  './',
  './index.html',
  './manifest.json',
  './img/apk.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Solo richieste GET verso il nostro dominio: cache-first con fallback alla rete.
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return; // lascia stare video/API esterni (GitHub)

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
