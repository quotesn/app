// sw.js

const CACHE_VERSION = 'v4';
const CACHE_NAME = `quotesn-cache-${CACHE_VERSION}`;

// List all assets and JSON files to precache
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/data/categories.json',
  '/data/quotes_inspiration.json',
  '/data/quotes_motivation.json',
  '/data/quotes_positive_thinking.json',
  '/data/quotes_happiness.json',
  '/data/quotes_love.json',
  '/data/quotes_gratitude.json',
  '/data/quotes_resilience.json',
  '/data/quotes_courage.json',
  '/data/quotes_change.json',
  '/data/quotes_life_lessons.json',
  '/data/quotes_dreams.json',
  '/data/quotes_kindness.json',
  '/data/quotes_beauty.json',
  '/data/quotes_wisdom.json',
  '/data/quotes_sufi_wisdom.json',
  '/data/quotes_truth.json',
  '/data/quotes_time.json',
  '/data/quotes_mortality.json',
  '/data/quotes_freedom.json',
  '/data/quotes_society.json',
  '/data/quotes_learning.json',
  '/data/quotes_simplicity.json',
  '/data/quotes_self_care.json',
  '/data/quotes_mindfulness.json',
  '/data/quotes_self_knowledge.json',
  '/data/quotes_innerpeace.json',
  '/data/quotes_spirituality.json',
  '/data/quotes_perseverance.json',
  '/data/quotes_urdu_aqwal.json',
  '/data/quotes_urdu_ashaar.json',
  '/data/affirmations.json',
  '/data/good_vibes.json',
  '/data/words.json',
  // Add any icons or images you want to precache here
];

// Install: Precache all core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Helper: Stale-while-revalidate for static/JSON assets
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  const fetchPromise = fetch(request)
    .then(networkResponse => {
      if (networkResponse && networkResponse.status === 200) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => cachedResponse); // fallback to cache if offline
  return cachedResponse || fetchPromise;
}

// Fetch: Handle requests
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Only GET requests
  if (req.method !== 'GET') return;

  // Precache: Stale-while-revalidate for static and JSON
  if (
    PRECACHE_ASSETS.some(asset =>
      url.pathname === asset ||
      url.pathname.endsWith(asset.replace('/data/', ''))
    )
  ) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // Runtime cache for images (cache-first)
  if (req.destination === 'image') {
    event.respondWith(
      caches.match(req).then(cached => {
        return cached || fetch(req).then(res => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(req, res.clone());
            return res;
          });
        });
      })
    );
    return;
  }

  // Navigation fallback for SPA (offline support)
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(req)
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Default: Try network, fallback to cache
  event.respondWith(
    fetch(req)
      .then(res => {
        // Optionally cache new GET requests
        if (res && res.status === 200 && req.url.startsWith(self.location.origin)) {
          caches.open(CACHE_NAME).then(cache => cache.put(req, res.clone()));
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});

// Listen for skipWaiting from app
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// (Optional) Notification click handler for future push notifications
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
