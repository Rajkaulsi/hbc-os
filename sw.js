/* ===========================================================
   HBC OS — Service Worker (PWA offline + caching)
   Version: bump CACHE_VERSION to force update on all clients
   =========================================================== */

const CACHE_VERSION = 'hbc-os-v1.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

/* App-shell assets — must be present for offline operation */
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './apple-touch-icon-152.png',
  './apple-touch-icon-167.png',
  './apple-touch-icon-120.png',
  './favicon-32.png',
  './favicon-16.png'
];

/* ---------- INSTALL: pre-cache the app shell ---------- */
self.addEventListener('install', (event) => {
  console.log('[SW] Install', CACHE_VERSION);
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[SW] Some precache failed:', err);
      }))
      .then(() => self.skipWaiting())
  );
});

/* ---------- ACTIVATE: clean up old caches ---------- */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate', CACHE_VERSION);
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((k) => !k.startsWith(CACHE_VERSION))
          .map((k) => {
            console.log('[SW] Deleting old cache:', k);
            return caches.delete(k);
          })
      ))
      .then(() => self.clients.claim())
  );
});

/* ---------- FETCH: cache-first for app shell, network-first for everything else ---------- */
self.addEventListener('fetch', (event) => {
  const { request } = event;

  /* Bypass for non-GET, chrome-extension, or POST requests */
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  /* Bypass for Google APIs and external services — always go to network */
  if (url.hostname.includes('googleapis.com') ||
      url.hostname.includes('google.com') ||
      url.hostname.includes('gstatic.com')) {
    return; /* Default browser handling */
  }

  /* For same-origin: cache-first with network fallback */
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          /* Return cached, refresh in background */
          fetch(request).then((response) => {
            if (response.ok) {
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, response));
            }
          }).catch(() => {});
          return cached;
        }
        return fetch(request).then((response) => {
          if (response.ok && response.type === 'basic') {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        }).catch(() => {
          /* Offline fallback: try cached index.html */
          if (request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return new Response('Offline — content not cached', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
    );
    return;
  }

  /* Cross-origin: network-first with cache fallback */
  event.respondWith(
    fetch(request).then((response) => {
      if (response.ok && response.type === 'basic') {
        const clone = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
      }
      return response;
    }).catch(() => caches.match(request))
  );
});

/* ---------- MESSAGE: handle commands from the page ---------- */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
    );
  }
});
