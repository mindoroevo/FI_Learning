const STATIC_CACHE = "fiae-static-v1";
const RUNTIME_CACHE = "fiae-runtime-v1";
const CACHE_PREFIX = "fiae-";

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
  "./js/games/diagramm.js",
  "./js/games/diagramm-editor.js",
  "./js/games/diagramm.quiz.json",
  "./js/saveSystem.js",
  "./manifest.json",
  "./datenschutz.html",
  "./agb.html",
  "./dokumentation.html"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key.startsWith(CACHE_PREFIX) && key !== STATIC_CACHE && key !== RUNTIME_CACHE)
        .map((key) => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(networkFirst(event.request, STATIC_CACHE, "./index.html"));
    return;
  }

  if (isStaticAsset(url.pathname)) {
    event.respondWith(staleWhileRevalidate(event.request, STATIC_CACHE));
    return;
  }

  event.respondWith(cacheFirst(event.request, RUNTIME_CACHE));
});

function isStaticAsset(pathname) {
  return /\.(css|js|html|json|png|jpg|jpeg|webp|svg|ico|woff2?)$/i.test(pathname);
}

async function networkFirst(request, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(request, { cache: "no-cache" });
    cache.put(request, fresh.clone());
    return fresh;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    const fallback = await cache.match(fallbackUrl);
    if (fallback) return fallback;
    return new Response("Offline", { status: 503, statusText: "Offline" });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  return cached || fetchPromise || new Response("Offline", { status: 503, statusText: "Offline" });
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const fresh = await fetch(request);
    cache.put(request, fresh.clone());
    return fresh;
  } catch {
    return new Response("Offline", { status: 503, statusText: "Offline" });
  }
}
