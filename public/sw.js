/**
 * Alex Wenger Master Golf Intelligence Ecosystem — Service Worker (v4.6.0)
 * Off-Grid PWA Caching Strategy for Map Tiles, Vectors & Speech Models
 */

const CACHE_NAME = 'golf-spatial-v4.6.0';

const OFFLINE_ASSETS = [
  './',
  './mobile_spotter.html',
  './manifest.json',
  './visuals/clubhouse_interior_dawn.png',
  './visuals/clubhouse_landscape_arrival.png',
  './visuals/signature_hole_dawn.png',
  './visuals/swing_lab_calm.png',
  './visuals/golf_caddie.webp',
  './visuals/golf_coaching.webp',
  './visuals/valderrama_cork_oaks.png',
  './visuals/links_fescue_turf.png',
  './visuals/aerial_satellite_backdrop.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching static offline shell assets...');
      return cache.addAll(OFFLINE_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Pre-cache warning:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[ServiceWorker] Clearing legacy cache:', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Cache ESRI Satellite Raster Tiles & OSM Overpass responses
  if (
    url.hostname.includes('arcgisonline.com') ||
    url.hostname.includes('overpass-api.de') ||
    url.hostname.includes('overpass.kumi.systems')
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) return cachedResponse;

        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          // If offline and not in cache, fallback gracefully
          return cachedResponse || new Response('Offline asset unavailable', { status: 503 });
        }
      })
    );
    return;
  }

  // Cache-first strategy for static assets
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});
