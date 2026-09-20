import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const template = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
const origin = 'https://train.test';
const paths = ['/index.html', '/offline.html', '/manifest.webmanifest', '/assets/game-abcdefgh.js'];
const absolute = path => new URL(path, origin).href;
const key = request => typeof request === 'string' ? request : request.url;

// Node responses do not have browser fetch's same-origin "basic" type.
function networkResponse(body, status = 200) {
  const response = new Response(body, { status });
  Object.defineProperty(response, 'type', { value: 'basic' });
  return response;
}

/** Run the actual worker with in-memory browser platform boundaries, not a second cache implementation. */
function worker({ build = 'build-a', precache = paths, entries = new Map(), stamped = true } = {}) {
  const handlers = new Map();
  const fetches = [];
  const timers = new Map();
  let nextTimer = 0;
  const api = {
    entries, fetches, timers, claims: 0, skipWaitingCalls: 0,
    network: async request => networkResponse(`installed:${key(request)}`),
  };
  const cache = name => {
    if (!entries.has(name)) entries.set(name, new Map());
    const map = entries.get(name);
    return {
      match: async request => map.get(key(request))?.clone(),
      put: async (request, response) => map.set(key(request), response.clone()),
      keys: async () => [...map.keys()].map(url => new Request(url)),
      delete: async request => map.delete(key(request)),
    };
  };
  const source = stamped ? template.replace("'__BUILD_ID__'", JSON.stringify(build))
    .replace("'__PRECACHE_URLS__'", JSON.stringify(precache)) : template;
  vm.runInNewContext(source, {
    self: {
      registration: { scope: `${origin}/` }, location: { origin },
      clients: { claim: async () => { api.claims++; } },
      skipWaiting: async () => { api.skipWaitingCalls++; },
      addEventListener: (name, listener) => handlers.set(name, listener),
    },
    caches: {
      open: async name => cache(name), keys: async () => [...entries.keys()],
      delete: async name => entries.delete(name),
    },
    fetch: async (request, options) => { fetches.push({ url: key(request), options }); return api.network(request, options); },
    setTimeout: (callback, delay) => { timers.set(++nextTimer, { callback, delay }); return nextTimer; },
    clearTimeout: id => timers.delete(id),
    URL, Response, Request, AbortController,
    console: { info: () => {} },
  });
  api.lifecycle = async name => {
    let work;
    handlers.get(name)({ waitUntil: promise => { work = promise; } });
    await work;
  };
  api.message = async data => {
    let result;
    let work;
    handlers.get('message')({ data, ports: [{ postMessage: value => { result = value; } }], waitUntil: promise => { work = promise; } });
    await work;
    return result;
  };
  api.status = () => api.message({ type: 'STATUS' });
  api.request = (path, { mode = 'cors', method = 'GET', headers = new Headers() } = {}) => {
    let result;
    handlers.get('fetch')({ request: { url: absolute(path), mode, method, headers }, respondWith: value => { result = value; } });
    return result;
  };
  api.delete = async (name, path) => (await cache(name)).delete(absolute(path));
  return api;
}

const shell = build => `little-train-shell-${build}`;

test('first installation strictly precaches all required files and reports ready only after complete caching', async () => {
  const app = worker();
  assert.equal((await app.status()).offlineReady, false);
  await app.lifecycle('install');
  assert.deepEqual(app.fetches.map(item => item.url).sort(), paths.map(absolute).sort());
  assert(app.fetches.every(item => item.options.credentials === 'omit' && item.options.cache === 'reload'));
  assert.equal((await app.status()).offlineReady, true);
  assert.equal((await app.status()).build, 'build-a');
  await app.delete('little-train-immutable', paths[3]);
  assert.equal((await app.status()).offlineReady, false, 'evicted bundles must revoke readiness');
});

test('unstamped worker template fails installation instead of claiming offline support', async () => {
  const app = worker({ stamped: false });
  await assert.rejects(app.lifecycle('install'), /manifest was not stamped/);
  assert.equal((await app.status()).offlineReady, false);
});

test('failed update does not become ready or remove the previous complete installation', async () => {
  const previous = worker();
  await previous.lifecycle('install');
  await previous.lifecycle('activate');
  const next = worker({ build: 'build-b', entries: previous.entries, precache: [...paths.slice(0, 3), '/assets/game-newbuild.js'] });
  next.network = async request => networkResponse('unavailable', key(request).endsWith('.js') ? 503 : 200);
  await assert.rejects(next.lifecycle('install'), /HTTP 503/);
  assert.equal((await next.status()).offlineReady, false);
  assert.equal((await previous.status()).offlineReady, true);
  assert(next.entries.has(shell('build-a')));
  assert.equal(next.claims, 0);
});

test('activation deletes only this app’s stale caches and obsolete immutable bundles', async () => {
  const app = worker();
  await app.lifecycle('install');
  app.entries.set('another-app-cache', new Map());
  app.entries.set(shell('old-build'), new Map());
  app.entries.get('little-train-immutable').set(absolute('/assets/old-xxxxxxxx.js'), new Response('obsolete'));
  await app.lifecycle('activate');
  assert(app.entries.has('another-app-cache'));
  assert(app.entries.has(shell('build-a')));
  assert(!app.entries.has(shell('old-build')));
  assert(!app.entries.get('little-train-immutable').has(absolute('/assets/old-xxxxxxxx.js')));
  assert.equal((await app.status()).offlineReady, true);
  assert.equal(app.claims, 1);
});

test('updates wait: installation never skips waiting, claims clients, or removes an active shell', async () => {
  const app = worker();
  app.entries.set(shell('active-old-build'), new Map());
  await app.lifecycle('install');
  await app.message({ type: 'SKIP_WAITING' });
  assert.equal(app.skipWaitingCalls, 0);
  assert.equal(app.claims, 0);
  assert(app.entries.has(shell('active-old-build')));
});

test('offline navigation boots the installed game and hashed bundles need no network', async () => {
  const app = worker();
  await app.lifecycle('install');
  app.network = async () => { throw new Error('Offline'); };
  const document = await app.request('/', { mode: 'navigate' });
  assert.equal(await document.text(), `installed:${absolute('/index.html')}`);
  const before = app.fetches.length;
  assert.equal(await (await app.request(paths[3])).text(), `installed:${absolute(paths[3])}`);
  assert.equal(app.fetches.length, before);
});

test('online navigation is network-first without replacing the complete offline shell', async () => {
  const app = worker();
  await app.lifecycle('install');
  app.network = async () => networkResponse('new online document');
  assert.equal(await (await app.request('/', { mode: 'navigate' })).text(), 'new online document');
  app.network = async () => { throw new Error('Offline'); };
  assert.equal(await (await app.request('/', { mode: 'navigate' })).text(), `installed:${absolute('/index.html')}`);
});

test('navigation preserves 404 and falls back on server failure', async () => {
  const app = worker();
  await app.lifecycle('install');
  app.network = async () => networkResponse('not found', 404);
  assert.equal((await app.request('/', { mode: 'navigate' })).status, 404);
  app.network = async () => networkResponse('server unavailable', 503);
  assert.equal(await (await app.request('/', { mode: 'navigate' })).text(), `installed:${absolute('/index.html')}`);
});

test('a stalled navigation is aborted after the bounded deadline and uses the installed shell', async () => {
  const app = worker();
  await app.lifecycle('install');
  app.network = (_request, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(new Error('Aborted')), { once: true });
  });
  const pending = app.request('/', { mode: 'navigate' });
  const timer = [...app.timers.values()][0];
  assert.equal(timer.delay, 2500);
  timer.callback();
  assert.equal(await (await pending).text(), `installed:${absolute('/index.html')}`);
  assert.equal(app.timers.size, 0);
});

test('missing installed HTML uses the retry screen, then returns 503 if both documents are absent', async () => {
  const app = worker();
  await app.lifecycle('install');
  app.network = async () => { throw new Error('Offline'); };
  await app.delete(shell('build-a'), '/index.html');
  assert.equal(await (await app.request('/', { mode: 'navigate' })).text(), `installed:${absolute('/offline.html')}`);
  await app.delete(shell('build-a'), '/offline.html');
  assert.equal((await app.request('/', { mode: 'navigate' })).status, 503);
});

test('API, external, authorized, undeclared and non-GET requests bypass interception', () => {
  const app = worker();
  assert.equal(app.request('/api/private'), undefined);
  assert.equal(app.request('https://external.test/assets/game-abcdefgh.js'), undefined);
  assert.equal(app.request(paths[3], { headers: new Headers({ authorization: 'test' }) }), undefined);
  assert.equal(app.request('/assets/undeclared-abcdefgh.js'), undefined);
  assert.equal(app.request(paths[3], { method: 'POST' }), undefined);
  assert.equal(app.request('/unknown', { mode: 'navigate' }), undefined);
  assert.equal(app.fetches.length, 0);
});
