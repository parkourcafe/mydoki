// Консервативный service worker: сеть в приоритете, кэш — только запасной
// вариант при отсутствии сети. Не кэширует страницы агрессивно (нет «застрявших»
// старых версий). Предкэширует только офлайн-экран.
const CACHE = "doki-v1";
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.add(OFFLINE_URL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  // Навигация: пробуем сеть, при ошибке (нет интернета) — офлайн-экран.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() =>
        caches.match(OFFLINE_URL).then((r) => r || Response.error())
      )
    );
  }
});
