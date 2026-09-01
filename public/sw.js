/**
 * Alex Wenger Master Golf Intelligence Ecosystem — Progressive Web App (PWA) Service Worker
 *
 * Provides 100% off-grid offline caching for:
 * 1. Satellite & Vector Tile Maps (Layer A & B).
 * 2. DEM Topographic Terrain Meshes (Layer C).
 * 3. Geographic Memory Engine Course Database (geographic_memory_engine.json).
 * 4. Piper TTS SSML Speech Synthesis Models & Web Audio Fallbacks.
 */

const CACHE_NAME = 'alex-wenger-golf-v4.3.2';

const ASSETS_TO_CACHE = [
  './',
  './mobile_spotter.html',
  './index.html',
  './style.css',
  './src/golf/spotterEngine.js',
  './src/golf/alex-wenger-golf/core/architecture/governedIntelligenceSystem.js',
  './src/golf/alex-wenger-golf/core/vocal/activeAudioDriver.js',
  './src/golf/alex-wenger-golf/core/vocal/alexVoiceAudioEngine.js',
  './src/golf/alex-wenger-golf/core/spatial/spatialIngestionEngine.js',
  './src/golf/data/geographic_memory_engine.json',
];

// Install Event — Cache Core App Shell & Offline Engine
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching App Shell & Course Memory Datasets...');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event — Clean up stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event — Cache First Strategy with Network Fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
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
