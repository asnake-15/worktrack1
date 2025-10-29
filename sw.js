// sw.js — v2 (forza aggiornamento cache)
const CACHE = "worktrack-v2"; // <— cambia versione per invalidare la vecchia
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

// install: pre-cache + attiva subito il nuovo SW
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// activate: pulizia vecchie cache + prendi controllo subito
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// network-first per index.html, cache-first per il resto (semplice)
self.addEventListener("fetch", (e) => {
  const { request } = e;
  const url = new URL(request.url);
  const isIndex = url.pathname.endsWith("/") || url.pathname.endsWith("/index.html");

  if (isIndex) {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request))
    );
  } else {
    e.respondWith(caches.match(request).then((res) => res || fetch(request)));
  }
});
