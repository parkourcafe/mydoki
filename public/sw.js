// Service worker для PWA: установка на телефон + офлайн-доступ.
// Стратегия:
//  • Неизменяемые ассеты (/_next/static, иконки, шрифты) — cache-first.
//  • Навигации — network-first, при отсутствии сети отдаём кэш или офлайн-экран.
//  • Кросс-доменные запросы (файлы из Supabase Storage) — не трогаем и НЕ кэшируем.
// Файлы документов для офлайна хранятся отдельно в IndexedDB (страница /saved),
// здесь они не кэшируются.
const CACHE = "doki-v2";
const OFFLINE_URL = "/offline";
const PRECACHE = ["/offline", "/saved"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .catch(() => {})
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

function isStaticAsset(pathname) {
  return (
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/icon-") ||
    pathname === "/apple-icon" ||
    pathname === "/manifest.webmanifest" ||
    /\.(?:woff2?|ttf|otf|png|jpe?g|svg|webp|gif|ico|css|js)$/.test(pathname)
  );
}

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.ok && res.type === "basic") {
      const cache = await caches.open(CACHE);
      cache.put(req, res.clone());
    }
    return res;
  } catch {
    return cached || Response.error();
  }
}

async function networkFirstNav(req) {
  try {
    return await fetch(req);
  } catch {
    const cached = await caches.match(req, { ignoreSearch: true });
    return cached || (await caches.match(OFFLINE_URL)) || Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Чужие домены (Supabase Storage, аналитика и т.п.) — браузер сам, без кэша.
  if (url.origin !== self.location.origin) return;

  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(req));
    return;
  }

  if (req.mode === "navigate") {
    event.respondWith(networkFirstNav(req));
  }
});

// ---- Web Push (T9) ----
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }
  const title = data.title || "Doki";
  const options = {
    body: data.body || "",
    icon: data.icon || "/icon-192",
    badge: data.badge || "/icon-192",
    data: { url: data.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list) => {
        for (const c of list) {
          if ("focus" in c) {
            c.navigate(url);
            return c.focus();
          }
        }
        return self.clients.openWindow(url);
      })
  );
});
