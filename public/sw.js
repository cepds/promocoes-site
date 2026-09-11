const CACHE_NAME = "radar-promocoes-v3";
const APP_SHELL = [
  "/",
  "/index.html",
  "/style.css?v=10",
  "/app.js?v=10",
  "/auto-refresh.js?v=1",
  "/produto.html",
  "/produto.js?v=1",
  "/admin.html",
  "/admin.js?v=1",
  "/manifest.webmanifest",
  "/icon.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET") return;

  if (url.hostname === "api.github.com" && url.pathname.includes("/repos/cepds/promocoes-site/contents/data/ofertas.json")) {
    event.respondWith(fetch(request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
      return response;
    }).catch(() => caches.match(request)));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(fetch(request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
      return response;
    }).catch(() => caches.match(request).then(cached => cached || caches.match("/index.html"))));
  }
});
