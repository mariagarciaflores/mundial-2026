/* Service worker — Mundial 2026
   Estrategia: red primero con respaldo en caché (la app siempre muestra datos
   frescos cuando hay conexión y sigue funcionando sin internet con lo último visto). */

const CACHE = 'mundial2026-v1';

const SHELL = [
  './',
  'index.html',
  'css/style.css',
  'js/app.js',
  'data/teams.json',
  'data/squads.json',
  'data/schedule-fallback.json',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        // guardamos una copia para uso sin conexión (también imágenes externas)
        if (res && (res.ok || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((hit) => hit || (req.mode === 'navigate' ? caches.match('index.html') : Response.error()))
      )
  );
});
