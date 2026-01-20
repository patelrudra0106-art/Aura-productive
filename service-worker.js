/* service-worker.js - S1N Offline Capability (Updated) */

const CACHE_NAME = 's1n-productive-v2'; // Incremented version to force update

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './pomodoro.js',
  './manifest.json',
  './auth.js',
  './social.js',
  './notifications.js',
  './profile.js',
  './reports.js',
  './shop.js',
  './chat.js',          
  './achievements.js',
  './onboarding.js',  // New Script
  
  // Adaptive Onboarding Images
  './122393.jpg', // Tasks Dark
  './122395.jpg', // Tasks Light
  './122397.jpg', // Timer Light
  './122399.jpg', // Timer Dark
  './122401.jpg', // Analytics Dark
  './122405.jpg', // Analytics Light
  './122407.jpg', // Network Light
  './122409.jpg', // Network Dark
  './122411.jpg', // Market Dark
  './122413.jpg', // Market Light
  
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',
  'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js'
];

// 1. INSTALL: Cache all static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching all assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting()) // Activate immediately
    );
});

// 2. ACTIVATE: Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[Service Worker] Clearing old cache');
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. FETCH: Serve from Cache, fall back to Network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached response if found
                if (response) {
                    return response;
                }
                // Otherwise fetch from network
                return fetch(event.request);
            })
    );
});
