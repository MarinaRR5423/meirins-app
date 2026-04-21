// ═══════════════════════════════════════════════════════
//  Meirins Service Worker — v1.0
//  Estrategia: Cache First para assets estáticos
//              Network First para llamadas a la API
// ═══════════════════════════════════════════════════════

const CACHE_NAME = 'meirins-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
];

// CDN assets que queremos cachear (React, Babel, Fonts)
const CDN_ASSETS = [
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap',
];

// ── Instalación: precachear el app shell ─────────────────
self.addEventListener('install', event => {
  console.log('[SW] Installing Meirins v1...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // App shell (crítico)
      return cache.addAll(APP_SHELL).then(() => {
        // CDN assets (best effort, no bloquea la instalación)
        return Promise.allSettled(
          CDN_ASSETS.map(url =>
            cache.add(url).catch(err =>
              console.warn('[SW] Could not cache CDN asset:', url, err)
            )
          )
        );
      });
    }).then(() => {
      console.log('[SW] App shell cached ✓');
      return self.skipWaiting();
    })
  );
});

// ── Activación: limpiar caches antiguas ──────────────────
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    ).then(() => {
      console.log('[SW] Activated ✓');
      return self.clients.claim();
    })
  );
});

// ── Fetch: estrategia por tipo de request ────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Llamadas a la API de Anthropic → siempre Network (no cachear)
  if (url.hostname === 'api.anthropic.com') {
    event.respondWith(fetch(request));
    return;
  }

  // 2. Google Fonts CSS → Network First con fallback a cache
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(networkFirst(request));
    return;
  }

  // 3. CDN de unpkg (React, Babel) → Cache First (raramente cambian)
  if (url.hostname === 'unpkg.com') {
    event.respondWith(cacheFirst(request));
    return;
  }

  // 4. App shell local → Cache First
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // 5. Resto → Network con fallback
  event.respondWith(networkFirst(request));
});

// ── Estrategia Cache First ───────────────────────────────
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Sin conexión y sin caché: devuelve la página principal
    const fallback = await caches.match('/index.html');
    return fallback || new Response('Sin conexión', { status: 503 });
  }
}

// ── Estrategia Network First ─────────────────────────────
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || caches.match('/index.html');
  }
}

// ── Mensajes desde la app ────────────────────────────────
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      event.source.postMessage('CACHE_CLEARED');
    });
  }
});
