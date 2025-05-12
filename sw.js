// sw.js

const CACHE_VERSION = 'v5'; // Incrementing cache version to force update
const CACHE_NAME = `wow-quotes-cache-${CACHE_VERSION}`;

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
  '/images/app_logo.png', // Example: if you have an app logo
  '/images/favicon.ico',
  '/images/apple-touch-icon.png',
  '/images/favicon-32x32.png',
  '/images/favicon-16x16.png',
  // Add audio files to precache - ensure these paths are correct!
  '/app/assets/chime-open.mp3',
  '/app/assets/chime-gen-quote.mp3',
  '/app/assets/ui-click-menu.mp3',
  '/app/assets/ui-menu-copy.mp3',
  '/app/assets/ui-save-fav.mp3',
  '/app/assets/btn-press-download.mp3',
  '/app/assets/silver-chime-back.mp3',
  '/app/assets/toggle-switch.mp3',
  '/app/assets/ui-pop-notification.mp3',
];

// Install: Precache all core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Pre-caching assets with version', CACHE_VERSION);
        return cache.addAll(PRECACHE_ASSETS.map(asset => {
          // Handle potential relative paths or lack of leading slash for assets
          // This is a common point of failure. Ensure paths match the server.
          // For GitHub Pages serving from root, leading slash is usually correct.
          // If serving from a subpath like /app/, assets need to be adjusted.
          // Assuming serving from root for now based on https://quotesn.github.io/sw.js
          return asset;
        })).catch(error => {
          console.error('Service Worker: Pre-caching failed:', error);
          // Log which asset failed to load if possible
          // This catch block might not give specific file info easily
          // More detailed logging might be needed during development
          throw error; // Re-throw to fail the installation
        });
      })
      .then(() => self.skipWaiting()) // Activate the new service worker immediately
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => {
              console.log('Service Worker: Deleting old cache:', key);
              return caches.delete(key);
            })
      )
    ).then(() => {
      console.log('Service Worker: Activated successfully.');
      self.clients.claim(); // Take control of all pages under the service worker's scope
    })
  );
});

// Helper: Stale-while-revalidate for static/JSON assets
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request)
    .then(networkResponse => {
      if (networkResponse && networkResponse.status === 200) {
        // Cache the new response
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(async (error) => {
      console.warn('Service Worker: Fetch failed, falling back to cache:', request.url, error);
      // If fetch fails (e.g., offline), return the cached response
      const fallbackResponse = await cache.match(request);
      if (fallbackResponse) {
        console.log('Service Worker: Serving from cache:', request.url);
        return fallbackResponse;
      }
      // If no cached response, return a generic error response or null
      // Depending on the asset type, returning null might be better than a text response for images/scripts
      console.error('Service Worker: No cached response available and fetch failed for:', request.url);
      // For critical assets, you might want to return a specific offline page
      // For others, letting the browser handle the network error might be fine
      return new Response('Service Worker: Network request failed and no cache available.', {
          status: 408, // Request Timeout or similar
          headers: { 'Content-Type': 'text/plain' }
      }); // Return a basic error response
    });

  // Return cached response immediately if available, otherwise wait for network
  return cachedResponse || fetchPromise;
}

// Fetch: Handle requests
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET requests
  if (req.method !== 'GET') {
    // For non-GET requests, bypass the service worker
    event.respondWith(fetch(req));
    return;
  }

  // Check if the request is for an asset we want to precache or handle with stale-while-revalidate
  // This check needs to be robust to different path structures.
  // It should match both '/data/file.json' and potentially 'file.json' if served from root.
  const isPrecachedAsset = PRECACHE_ASSETS.some(asset => {
      // Normalize paths for comparison
      const normalizedAsset = new URL(asset, self.location.origin).pathname;
      const normalizedRequest = new URL(req.url).pathname;

      // Check for exact match or if the request path ends with the asset path
      return normalizedRequest === normalizedAsset || normalizedRequest.endsWith(normalizedAsset);
  });


  if (isPrecachedAsset) {
    console.log('Service Worker: Handling precached asset with stale-while-revalidate:', req.url);
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // Runtime cache for images (cache-first strategy)
  if (req.destination === 'image') {
    console.log('Service Worker: Handling image with cache-first:', req.url);
    event.respondWith(
      caches.match(req).then(cached => {
        if (cached) {
          console.log('Service Worker: Serving image from cache:', req.url);
          return cached;
        }
        console.log('Service Worker: Fetching image from network:', req.url);
        return fetch(req).then(res => {
          // Check if the response is valid before caching
          if (!res || res.status !== 200 || res.type !== 'basic') {
             console.warn('Service Worker: Not caching invalid image response:', req.url, res.status, res.type);
             return res; // Return the response without caching
          }
          return caches.open(CACHE_NAME).then(cache => {
            console.log('Service Worker: Caching image:', req.url);
            cache.put(req, res.clone());
            return res;
          });
        }).catch(error => {
            console.error('Service Worker: Image fetch failed:', req.url, error);
            // Optionally return a placeholder image from cache if available
            // return caches.match('/images/placeholder.png'); // Example fallback
            throw error; // Re-throw the error if no fallback
        });
      })
    );
    return;
  }

  // Navigation fallback for SPA (offline support for HTML pages)
  // This ensures that if a navigation request fails, the cached index.html is served.
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    console.log('Service Worker: Handling navigation request:', req.url);
    event.respondWith(
      fetch(req)
        .catch(async () => {
          console.warn('Service Worker: Navigation fetch failed, falling back to index.html:', req.url);
          const indexHtml = await caches.match('/index.html');
          if (indexHtml) {
              console.log('Service Worker: Serving index.html from cache.');
              return indexHtml;
          }
          console.error('Service Worker: index.html not found in cache for navigation fallback.');
          // Optionally return a simple offline page if index.html is not cached
          // return caches.match('/offline.html');
          return new Response('<h1>Offline</h1><p>Please check your internet connection.</p>', {
              status: 503, // Service Unavailable
              headers: { 'Content-Type': 'text/html' }
          });
        })
    );
    return;
  }

  // Default strategy: Network first, fallback to cache for other assets
  // This is a common strategy for assets not explicitly handled above.
  console.log('Service Worker: Handling other asset with network-first:', req.url);
  event.respondWith(
    fetch(req)
      .then(res => {
        // Check if the response is valid before caching
        if (!res || res.status !== 200 || res.type !== 'basic') {
            console.warn('Service Worker: Not caching invalid response:', req.url, res.status, res.type);
            return res; // Return the response without caching
        }
        // Optionally cache successful network responses for future offline use
        if (req.url.startsWith(self.location.origin)) { // Only cache assets from the same origin
           caches.open(CACHE_NAME).then(cache => {
             console.log('Service Worker: Caching network response:', req.url);
             cache.put(req, res.clone());
           });
        }
        return res;
      })
      .catch(async (error) => {
        console.warn('Service Worker: Network fetch failed for other asset, falling back to cache:', req.url, error);
        const cached = await caches.match(req);
        if (cached) {
            console.log('Service Worker: Serving other asset from cache:', req.url);
            return cached;
        }
        console.error('Service Worker: No cached response available for other asset:', req.url);
        // If no network and no cache, let the browser handle the error
        throw error;
      })
  );
});


// Listen for skipWaiting from app (if you send this message from your app.js)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker: Skip waiting requested by client.');
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
      // If no window is open, open a new one
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
