const CACHE_NAME = "2025-09-09 00:19";
const urlsToCache = [
  "/type-100masu/",
  "/type-100masu/index.js",
  "/type-100masu/mp3/end.mp3",
  "/type-100masu/mp3/correct3.mp3",
  "/type-100masu/favicon/favicon.svg",
  "https://marmooo.github.io/fonts/textar-light.woff2",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      );
    }),
  );
});
