const CACHE_NAME = "kids-game-cache-v1";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./unicorn.png"
];

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;

  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // 只處理同源資源，避免外部資源造成奇怪問題
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then(res => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(req, resClone).catch(() => {});
        });
        return res;
      })
      .catch(() => caches.match(req).then(cached => cached || caches.match("./index.html")))
  );
});
