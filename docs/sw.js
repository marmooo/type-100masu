var CACHE_NAME="2023-07-01 11:00",urlsToCache=["/type-100masu/","/type-100masu/index.js","/type-100masu/mp3/end.mp3","/type-100masu/mp3/correct3.mp3","/type-100masu/favicon/favicon.svg","https://marmooo.github.io/fonts/textar-light.woff2"];self.addEventListener("install",function(a){a.waitUntil(caches.open(CACHE_NAME).then(function(a){return a.addAll(urlsToCache)}))}),self.addEventListener("fetch",function(a){a.respondWith(caches.match(a.request).then(function(b){return b||fetch(a.request)}))}),self.addEventListener("activate",function(a){var b=[CACHE_NAME];a.waitUntil(caches.keys().then(function(a){return Promise.all(a.map(function(a){if(b.indexOf(a)===-1)return caches.delete(a)}))}))})