// Nitesh Communications service worker
//
// - Built JS/CSS (/assets/*, content-hashed): cache-first, so repeat visits load
//   instantly and work offline. Old entries are trimmed.
// - Branding images and Google Fonts: stale-while-revalidate.
// - Page navigations: network-first, falling back to the cached app shell offline.
// - API calls, Cloudinary images and everything else: not touched (the browser's
//   HTTP cache and the CDN handle them).

const VERSION = 'v2';
const SHELL_CACHE = `nc-shell-${VERSION}`;
const ASSET_CACHE = `nc-assets-${VERSION}`;
const STATIC_CACHE = `nc-static-${VERSION}`;
const CURRENT_CACHES = [SHELL_CACHE, ASSET_CACHE, STATIC_CACHE];
const MAX_ASSET_ENTRIES = 80;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.add(new Request('/index.html', { cache: 'reload' })))
      .catch(() => {
        // Offline fallback is a bonus; never block installation on it.
      }),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(names.filter((name) => !CURRENT_CACHES.includes(name)).map((name) => caches.delete(name))),
      )
      .then(() => self.clients.claim()),
  );
});

const isCacheable = (response) => response && response.status === 200 && (response.type === 'basic' || response.type === 'cors');

const trimCache = async (cacheName, maxEntries) => {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - maxEntries; i++) {
    await cache.delete(keys[i]);
  }
};

const cacheFirst = async (request) => {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (isCacheable(response)) {
    const cache = await caches.open(ASSET_CACHE);
    await cache.put(request, response.clone());
    trimCache(ASSET_CACHE, MAX_ASSET_ENTRIES);
  }
  return response;
};

const staleWhileRevalidate = async (event) => {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(event.request);
  const network = fetch(event.request)
    .then((response) => {
      if (isCacheable(response)) cache.put(event.request, response.clone());
      return response;
    })
    .catch(() => cached);
  if (cached) {
    event.waitUntil(network);
    return cached;
  }
  return network;
};

const networkFirstNavigation = async (request) => {
  try {
    const response = await fetch(request);
    // Only the app's HTML is a valid offline fallback (not /sitemap.xml, /robots.txt, ...)
    const isHtml = (response.headers.get('content-type') || '').includes('text/html');
    if (isCacheable(response) && isHtml) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put('/index.html', response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match('/index.html');
    return cached || Response.error();
  }
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (request.mode === 'navigate' && url.origin === self.location.origin) {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (url.origin === self.location.origin && url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (
    (url.origin === self.location.origin && url.pathname.startsWith('/branding/')) ||
    url.origin === 'https://fonts.googleapis.com' ||
    url.origin === 'https://fonts.gstatic.com'
  ) {
    event.respondWith(staleWhileRevalidate(event));
  }
  // Anything else (API, Cloudinary, analytics) goes straight to the network.
});
