const CACHE = 'tcs-radio-v11';
const BASE = new URL('./', self.registration.scope).pathname;
const ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'style.css',
  BASE + 'css/rain.css',
  BASE + 'css/redesign.css',
  BASE + 'js/playlists-data.js',
  BASE + 'js/player.js',
  BASE + 'js/app.js',
  BASE + 'js/background-audio.js',
  BASE + 'js/rain-ambient.js',
  BASE + 'js/rain-visual.js',
  BASE + 'js/modals.js',
  BASE + 'img/tcs-banner.jpg',
  BASE + 'img/tcs-icon.png',
  BASE + 'img/hero-office.jpg',
  BASE + 'img/hero-auto.jpg',
  BASE + 'img/hero-truck.jpg',
  BASE + 'img/hero-monsoon.jpg',
  BASE + 'img/hero-tapri.jpg',
  BASE + 'img/hero-indipop.jpg',
  BASE + 'img/hero-latest.jpg',
  BASE + 'manifest.webmanifest'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;

  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(e.request).then(r => r || caches.match(BASE)))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(BASE)))
  );
});
