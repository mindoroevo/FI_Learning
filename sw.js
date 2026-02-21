const CACHE_NAME = "fiae-app-v22";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./app.css",
  "./icons/icon_192.png",
  "./icons/icon_512.png",
  "./js/app.js",
  "./js/modules.js",
  "./js/state.js",
  "./js/utils.js",
  "./js/markdown.js",
  "./js/quiz/renderers.js",
  "./js/quiz/sections.js",
  "./js/quiz/validation.js",
  "./js/games/blitzkarten.js",
  "./js/games/subnetz.js",
  "./js/games/binary.js",
  "./js/saveSystem.js",
  "./manifest.json",
  "./datenschutz.html",
  "./agb.html",
  "./dokumentation.html"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});
