/* Deluxe Saloon — service worker (offline shell for the static site) */
const CACHE = 'delux-v2';
const BASE = new URL('./', self.registration.scope).pathname;
const ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'radio.html',
  BASE + 'tracks.html',
  BASE + 'about.html',
  BASE + 'faq.html',
  BASE + 'support.html',
  BASE + '404.html',
  BASE + 'css/style.css',
  BASE + 'js/app.js',
  BASE + 'img/newbanner.jpg',
  BASE + 'img/icon-192.png',
  BASE + 'img/icon-512.png',
  BASE + 'img/favicon.png',
  BASE + 'img/apple-touch-icon.png',
  BASE + 'manifest.webmanifest'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== CACHE).map((x) => caches.delete(x)))));
  return e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.endsWith('/ws')) return;
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(BASE)))
  );
});
