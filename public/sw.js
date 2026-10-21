const CACHE_NAME = "radar-promocoes-v15";

const APP_SHELL = [
  "/",
  "/index.html",
  "/style.css?v=16",
  "/enhancements.css?v=2",
  "/commerce.css?v=1",
    "/catalog-policy.js?v=3",
  "/search-engine.js?v=1",
    "/img/cama-ilustrativo.svg",
  "/img/mesa-ilustrativo.svg",
  "/img/banho-ilustrativo.svg",
  "/app.js?v=17",
  "/enhancements.js?v=3",
  "/auto-refresh.js?v=1",
  "/produto.html",
  "/produto.js?v=6",
  "/produto-enhancements.js?v=2",
  "/admin.html",
  "/admin.js?v=2",
  "/manifest.webmanifest",
  "/icon.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

async function networkFirst(request, cacheName, fallbackRequest = null) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (fallbackRequest) {
      const fallback = await caches.match(fallbackRequest);
      if (fallback) return fallback;
    }
    throw error;
  }
}

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Nunca armazenar ou servir offline o catálogo verificado: pode conter
  // itens que já venceram ou ficaram indisponíveis.
  if(url.origin===self.location.origin && url.pathname==="/ofertas-verificadas.json"){
    event.respondWith(fetch(request,{cache:"no-store"}));
    return;
  }

  if (url.origin === self.location.origin) {
    const isNavigation = request.mode === "navigate";
    event.respondWith(networkFirst(request, CACHE_NAME, isNavigation ? "/index.html" : null));
  }
});
