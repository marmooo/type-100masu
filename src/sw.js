var CACHE_NAME = '2021-10-08 00:19';
var urlsToCache = [
  "/type-100masu/",
  "/type-100masu/index.js",
  "/type-100masu/mp3/incorrect1.mp3",
  "/type-100masu/mp3/end.mp3",
  "/type-100masu/mp3/correct3.mp3",
  "/type-100masu/favicon/original.svg",
  "https://marmooo.github.io/fonts/textar-light.woff2",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.1.2/dist/css/bootstrap.min.css",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(urlsToCache);
      }),
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }),
  );
});

self.addEventListener("activate", function (event) {
  var cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});
