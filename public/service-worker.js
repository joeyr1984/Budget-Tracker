const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/app.js",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/index.js",
  "/styles.css",
  "/manifest.webmanifest",
  

];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

// install
self.addEventListener("install", function(evt) {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Your files were pre-cached successfully!");
      cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

// activate
self.addEventListener("activate", event => {
  const currentCaches = [CACHE_NAME, DATA_CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// fetch
self.addEventListener("fetch", evt => {
  if (evt.request.url.startsWith(self.location.origin)) {
    evt.respondWith(
      caches.match(evt.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(DATA_CACHE_NAME).then(cache => {
          return fetch(evt.request).then(response => {
            return cache.put(evt.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  }
});
