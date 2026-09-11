const CACHE_NAME = "radar-promocoes-v4";
const DATA_CACHE = "radar-promocoes-data-v1";
const APP_SHELL = [
  "/",
  "/index.html",
  "/style.css?v=10",
  "/fetch-fallback.js?v=1",
  "/app.js?v=11",
  "/auto-refresh.js?v=1",
  "/produto.html",
  "/produto.js?v=2",
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
      keys.filter(key => ![CACHE_NAME, DATA_CACHE].includes(key)).map(key => caches.delete(key))
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
  const isCatalogApi = url.hostname === "api.github.com" && url.pathname.includes("/repos/cepds/promocoes-site/contents/data/ofertas.json");
  const isCatalogRaw = url.hostname === "raw.githubusercontent.com" && url.pathname === "/cepds/promocoes-site/main/data/ofertas.json";

  if (isCatalogApi || isCatalogRaw) {
    event.respondWith(networkFirst(request, DATA_CACHE));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(request, CACHE_NAME, "/index.html"));
  }
});
