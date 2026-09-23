// Al-Huda Progressive Web App (PWA) Service Worker
// Cache-First with Network Fallback for 100% Offline Capability
const CACHE_NAME = 'alhuda-offline-v4';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192.svg',
  '/icon-512.svg',
  '/audio/adzan-marwan-al-qassas.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Al-Huda SW] Pre-caching core offline assets...');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[Al-Huda SW] Pre-cache partial notice:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[Al-Huda SW] Deleting stale cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }

  // Support HTTP Range requests for cached audio files (Offline audio seek & playback)
  if (request.headers.has('range')) {
    event.respondWith(
      caches.match(request, { ignoreSearch: true }).then((cachedResponse) => {
        if (!cachedResponse) return fetch(request);
        return cachedResponse.arrayBuffer().then((buffer) => {
          const rangeHeader = request.headers.get('range');
          const bytesMatch = rangeHeader ? rangeHeader.match(/bytes=(\d+)-(\d+)?/) : null;
          if (!bytesMatch) return cachedResponse;
          const start = parseInt(bytesMatch[1], 10);
          const end = bytesMatch[2] ? parseInt(bytesMatch[2], 10) : buffer.byteLength - 1;
          const sliced = buffer.slice(start, end + 1);
          return new Response(sliced, {
            status: 206,
            statusText: 'Partial Content',
            headers: {
              ...cachedResponse.headers,
              'Content-Range': `bytes ${start}-${end}/${buffer.byteLength}`,
              'Content-Length': `${sliced.byteLength}`,
              'Content-Type': cachedResponse.headers.get('Content-Type') || 'audio/mpeg'
            }
          });
        });
      }).catch(() => fetch(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (url.origin === self.location.origin || url.hostname.includes('fonts.'))
          ) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch((err) => {
          if (request.destination === 'image') {
            return caches.match('/favicon.svg');
          }
          throw err;
        });
    })
  );
});
