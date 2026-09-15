const CACHE = 'tcs-radio-v19-adblock';
const BASE = new URL('./', self.registration.scope).pathname;

// Ad domains blocked at Service Worker level (complements client-side AdBlocker)
const AD_BLOCK_LIST = [
  "doubleclick.net",
  "googlesyndication.com",
  "googleadservices.com",
  "googletagmanager.com",
  "google-analytics.com",
  "adservice.google",
  "adsystem.amazon",
  "amazon-adsystem.com",
  "adnxs.com",
  "scorecardresearch.com",
  "outbrain.com",
  "taboola.com",
  "criteo.com",
  "pubmatic.com",
  "rubiconproject.com",
  "openx.net",
  "adsrvr.org",
  "moatads.com",
  "facebook.net/tr",
  "facebook.com/tr",
  "connect.facebook.net",
  "hotjar.com",
  "adsterra.com",
  "popads.net",
  "propellerads.com"
];

function isAdRequest(url) {
  try {
    const u = url.toLowerCase();
    return AD_BLOCK_LIST.some(d => u.includes(d));
  } catch (_) { return false; }
}

const ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'style.css',
  BASE + 'css/variables.css',
  BASE + 'css/base.css',
  BASE + 'css/hero.css',
  BASE + 'css/playlist-selector.css',
  BASE + 'css/player.css',
  BASE + 'css/drawer.css',
  BASE + 'css/sections.css',
  BASE + 'css/modals.css',
  BASE + 'css/rain.css',
  BASE + 'css/adblocker.css',
  BASE + 'css/redesign.css',
  BASE + 'css/player-redesign.css',
  BASE + 'js/playlists-data.js',
  BASE + 'js/player.js',
  BASE + 'js/app.js',
  BASE + 'js/background-audio.js',
  BASE + 'js/rain-ambient.js',
  BASE + 'js/rain-visual.js',
  BASE + 'js/modals.js',
  BASE + 'js/adblocker.js',
  BASE + 'img/tcs-banner.jpg',
  BASE + 'img/tcs-icon.png',
  BASE + 'img/hero-office.jpg',
  BASE + 'img/hero-auto.jpg',
  BASE + 'img/hero-truck.jpg',
  BASE + 'img/hero-monsoon.jpg',
  BASE + 'img/hero-tapri.jpg',
  BASE + 'img/hero-indipop.jpg',
  BASE + 'img/hero-latest.jpg',
  BASE + 'img/hero-love.jpg',
  BASE + 'img/hero-kk.jpg',
  BASE + 'img/hero-sonu.jpg',
  BASE + 'img/hero-arijit.jpg',
  BASE + 'img/hero-kumar.jpg',
  BASE + 'img/hero-udit.jpg',
  BASE + 'img/hero-shreya.jpg',
  BASE + 'img/hero-atif.jpg',
  BASE + 'img/hero-new.jpg',
  BASE + 'img/hero-old.jpg',
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

  // Block ad/tracking requests at SW level — return empty 204
  if (isAdRequest(e.request.url)) {
    // Count would be done client-side; here we just block
    return e.respondWith(new Response('', { status: 204, statusText: 'Blocked by TCS AdBlock SW' }));
  }

  if (e.request.method !== 'GET' || u.origin !== location.origin) return;

  /* Stylesheets and scripts go network-first: a new deploy is visible on the
     very next reload instead of one visit later, while offline still falls
     back to the cached copy. (Cache-first here is what made freshly deployed
     designs invisible to returning visitors until a second refresh — and it
     would have kept the old player.js, without auto-start, pinned in cache.) */
  if (u.pathname.endsWith('.css') || u.pathname.endsWith('.js')) {
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

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
