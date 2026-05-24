const CACHE_NAME = 'anizen-cache-v2';
const STATIC_ASSETS = ['/', '/index.html'];

let requestCount = 0;
let lastReset = Date.now();
const RATE_LIMIT = 80;
const RATE_WINDOW = 10000;

const BLOCKED_PATTERNS = [
  /\.(php|asp|aspx|env|git|sql|bak|config)$/i,
  /wp-admin|wp-login|phpMyAdmin|\.well-known\/security/i,
  /eval\(|base64_decode|<script>/i,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'DEVTOOLS_OPEN') {
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => client.postMessage({ type: 'DEVTOOLS_DETECTED' }));
    });
  }

  if (event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME);
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  if (BLOCKED_PATTERNS.some((p) => p.test(url.pathname))) {
    event.respondWith(new Response('Forbidden', { status: 403, headers: { 'Content-Type': 'text/plain' } }));
    return;
  }

  const now = Date.now();
  if (now - lastReset > RATE_WINDOW) {
    requestCount = 0;
    lastReset = now;
  }
  requestCount++;

  if (requestCount > RATE_LIMIT) {
    self.clients.matchAll().then((clients) => {
      clients.forEach((c) => c.postMessage({ type: 'RATE_LIMITED' }));
    });
    event.respondWith(
      caches.match('/index.html').then((cached) =>
        cached || new Response('Too many requests.', { status: 429, headers: { 'Content-Type': 'text/plain' } })
      )
    );
    return;
  }

  const isStaticAsset = /\.(js|css|png|jpg|jpeg|webp|gif|svg|ico|woff2?|ttf)$/i.test(url.pathname);

  if (isStaticAsset) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return res;
        });
      })
    );
    return;
  }

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && url.pathname === '/') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return res;
      })
      .catch(() => caches.match(req).then((c) => c || caches.match('/index.html')))
  );
});