/* Stamped by the production build. Never register this template in Vite dev. */
const BUILD = '__BUILD_ID__';
const PRECACHE = '__PRECACHE_URLS__';
const PREFIX = 'little-train-';
const SHELL = `${PREFIX}shell-${BUILD}`;
const IMMUTABLE = `${PREFIX}immutable`;
const HASHED = /^\/assets\/[^/]+-[A-Za-z0-9_-]{8,}\.[^/]+$/;
const absolute = (path) => new URL(path, self.registration.scope).href;
const matchOptions = { ignoreVary: true }; // Only same-origin, public, non-negotiated build files.
const allowed = new Set(Array.isArray(PRECACHE) ? PRECACHE.map(absolute) : []);
const cacheName = (path) => HASHED.test(new URL(path, self.registration.scope).pathname) ? IMMUTABLE : SHELL;

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    if (!Array.isArray(PRECACHE) || !PRECACHE.length) throw new Error('PWA build manifest was not stamped');
    // Strict: an interrupted download never replaces the previous working installation.
    await Promise.all(PRECACHE.map(async (path) => {
      const cache = await caches.open(cacheName(path));
      if (cacheName(path) === IMMUTABLE && await cache.match(absolute(path), matchOptions)) return;
      const response = await fetch(absolute(path), { cache: 'reload', credentials: 'omit' });
      if (!response.ok || response.type !== 'basic' || response.redirected) {
        throw new Error(`Cannot cache ${path}: HTTP ${response.status}`);
      }
      await cache.put(absolute(path), response);
    }));
    // No skipWaiting: a new build waits until all windows using the old worker close.
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Scope deletion to our caches; never clear other applications' storage.
    for (const key of await caches.keys()) {
      if (key.startsWith(PREFIX) && key !== SHELL && key !== IMMUTABLE) await caches.delete(key);
    }
    const immutable = await caches.open(IMMUTABLE);
    for (const request of await immutable.keys()) {
      if (!allowed.has(request.url)) await immutable.delete(request, matchOptions);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data?.type !== 'STATUS' || !event.ports[0]) return;
  event.waitUntil((async () => {
    try {
      const present = await Promise.all(PRECACHE.map(async (path) => {
        const cache = await caches.open(cacheName(path));
        return Boolean(await cache.match(absolute(path), matchOptions));
      }));
      event.ports[0].postMessage({ build: BUILD, offlineReady: present.every(Boolean) });
    } catch (error) {
      event.ports[0].postMessage({ build: BUILD, offlineReady: false, error: String(error) });
    }
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || request.headers.has('authorization')) return;
  // Only this app's root document and explicitly declared public build assets are intercepted.
  if (request.mode === 'navigate' && (url.pathname === '/' || url.pathname === '/index.html')) {
    event.respondWith(navigation(request));
  } else if (allowed.has(url.href) && HASHED.test(url.pathname)) {
    event.respondWith(immutable(request));
  } else if (allowed.has(url.href)) {
    event.respondWith(shellAsset(request));
  }
});

async function navigation(request) {
  // Bound network-first so a stalled connection cannot strand a child at a blank page.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);
  try {
    const response = await fetch(request, { signal: controller.signal, cache: 'no-cache' });
    if (response.ok) return response;
    if (response.status < 500) return response;
  } catch (error) {
    console.info('[PWA] Navigation unavailable; using the installed game.', String(error));
  } finally {
    clearTimeout(timeout);
  }
  const shell = await caches.open(SHELL);
  // Keep the installed HTML paired with its precached bundles. Do not overwrite it with a newer deployment.
  return await shell.match(absolute('/index.html'), matchOptions)
    || await shell.match(absolute('/offline.html'), matchOptions)
    || new Response('Connect to the internet to load Little Train.', { status: 503, headers: { 'Content-Type': 'text/plain' } });
}

async function immutable(request) {
  const cache = await caches.open(IMMUTABLE);
  const cached = await cache.match(request, matchOptions);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok && response.type === 'basic' && !response.redirected) await cache.put(request, response.clone());
  return response;
}

async function shellAsset(request) {
  const cache = await caches.open(SHELL);
  const cached = await cache.match(request, matchOptions);
  return cached || fetch(request);
}
