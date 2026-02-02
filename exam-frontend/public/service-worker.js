const CACHE_NAME = 'exam-app-v1';
const ASSETS_CACHE = 'assets-v1';

// Aset statis yang WAJIB ada agar app bisa jalan offline
const STATIC_ASSETS = [
  '/',
  '/login',
  '/offline', // Halaman fallback
  '/manifest.json',
  '/fonts/Amiri-Regular.ttf',
  '/fonts/Scheherazade-Regular.ttf',
  '/icons/icon-192.png',
  '/favicon.svg'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== ASSETS_CACHE) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. API Requests (Network First, then fail silently or return cached error)
  // Note: Data ujian disimpan di IndexedDB oleh aplikasi, bukan di Cache Storage API.
  // Jadi SW hanya perlu memastikan request API tidak memblokir UI.
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Return JSON error agar frontend bisa handle (misal masuk queue)
        return new Response(JSON.stringify({ error: 'offline' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 503
        });
      })
    );
    return;
  }

  // 2. Navigation (HTML Pages) - Network First, Fallback to /offline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            // Jika halaman ada di cache (misal dashboard), return itu
            if (cached) return cached;
            // Jika tidak, return halaman offline generic
            return caches.match('/offline');
          });
        })
    );
    return;
  }

  // 3. Static Assets (Stale-While-Revalidate)
  // Font, CSS, JS, Images
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Cache new version
        if (networkResponse.ok) {
          const clone = networkResponse.clone();
          caches.open(ASSETS_CACHE).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      });
      
      // Return cached immediately if available, else wait for network
      return cachedResponse || fetchPromise;
    })
  );
});