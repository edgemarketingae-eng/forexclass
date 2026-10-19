/* Edge Learning service worker: makes the app open and work without internet.
   - App shell (HTML, JS, CSS, logos, class thumbnails) is saved on install.
   - Slides are saved the first time they're viewed, or all at once with "Save offline".
   - Recordings stream from Google Drive / YouTube and need internet. */
const VERSION = "mvf8frw0";
const SHELL = "edge-shell-" + VERSION;
const SLIDES = "edge-slides-v1";
const FONTS = "edge-fonts-v1";
const PRECACHE = [
 "./",
 "./app/index-Dc0wM-gk.css",
 "./app/index-r4mtx0k-.js",
 "./img/apple-touch-icon.png",
 "./img/edge-logo.png",
 "./img/favicon-32.png",
 "./img/icon-192.png",
 "./img/icon-512.png",
 "./index.html",
 "./manifest.webmanifest",
 "./s/c1-07.jpg",
 "./s/c2-04.jpg",
 "./s/c3-05.jpg",
 "./s/c4-22.jpg",
 "./s/c5-04.jpg",
 "./s/c67-05.jpg",
 "./s/c67-14.jpg",
 "./s/c4-05.jpg",
 "./s/c8-10.jpg",
 "./s/c9-03.jpg",
 "./s/c10-02.jpg",
 "./s/c11-03.jpg",
 "./s/hero.jpg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(SHELL)
      .then(c => Promise.all(PRECACHE.map(u => c.add(new Request(u, { cache: "reload" })).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith("edge-shell-") && k !== SHELL).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const indexUrl = () => new URL("./", self.registration.scope).href;

async function networkFirstPage(req) {
  const cache = await caches.open(SHELL);
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(req, { signal: ctrl.signal });
    clearTimeout(timer);
    if (res.ok) cache.put(indexUrl(), res.clone());
    return res;
  } catch (e) {
    return (await cache.match(indexUrl())) || (await cache.match(req, { ignoreSearch: true })) || Response.error();
  }
}

async function cacheFirst(req, name) {
  const cache = await caches.open(name);
  const hit = await caches.match(req, { ignoreSearch: true }); // any Edge cache: thumbnails live in the shell cache
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res.ok || res.type === "opaque") cache.put(req, res.clone());
    return res;
  } catch (e) {
    return Response.error();
  }
}

async function staleWhileRevalidate(req, name) {
  const cache = await caches.open(name);
  const hit = await cache.match(req);
  const net = fetch(req).then(res => { if (res.ok || res.type === "opaque") cache.put(req, res.clone()); return res; }).catch(() => null);
  return hit || (await net) || Response.error();
}

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  if (req.mode === "navigate" && sameOrigin) { event.respondWith(networkFirstPage(req)); return; }
  if (sameOrigin && url.pathname.includes("/s/")) { event.respondWith(cacheFirst(req, SLIDES)); return; }
  if (sameOrigin && url.pathname.includes("/download/")) return; // APK: always from the network
  if (sameOrigin) { event.respondWith(cacheFirst(req, SHELL)); return; }
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(staleWhileRevalidate(req, FONTS));
  }
  // Drive / YouTube players: straight to the network.
});

self.addEventListener("message", event => {
  if (event.data === "skipWaiting") self.skipWaiting();
});
