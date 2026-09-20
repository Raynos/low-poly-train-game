import { createServer } from 'node:http';
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import assert from 'node:assert/strict';
const exec = promisify(execFile);
const files = new Map();
async function walk(path) {
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const full = `${path}/${entry.name}`;
    if (entry.isDirectory()) await walk(full); else files.set(full.slice(4), await readFile(full));
  }
}
await walk('dist');
let version = 1;
let unavailable = false;
const mime = { html: 'text/html', js: 'application/javascript', css: 'text/css', png: 'image/png', svg: 'image/svg+xml', webmanifest: 'application/manifest+json' };
const server = createServer((request, response) => {
  if (unavailable) { response.writeHead(503); response.end('Origin offline for lifecycle test'); return; }
  const path = new URL(request.url, 'http://localhost').pathname;
  const key = path === '/' ? '/index.html' : path;
  let body = files.get(key);
  if (!body) { response.writeHead(404); response.end('Missing'); return; }
  if (key === '/sw.js') body = Buffer.from(body.toString().replace(/const BUILD = "[^"]+";/, `const BUILD = "lifecycle-${version}";`));
  if (key === '/index.html') body = Buffer.from(body.toString().replace('</head>', `<meta name="test-build" content="${version}"></head>`));
  response.writeHead(200, { 'Content-Type': mime[key.split('.').at(-1)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' }); response.end(body);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}`;
const session = `train-lifecycle-${process.pid}`;
const results = [];
async function browser(...args) {
  const { stdout } = await exec('agent-browser', ['--session', session, '--json', ...args], { timeout: 35000 });
  const response = JSON.parse(stdout); if (!response.success) throw new Error(response.error);
  return response.data;
}
async function evaluate(source) { return (await browser('eval', source)).result; }
function check(label, result) { assert.ok(result, label); results.push(label); console.log(`PASS ${label}`); }
try {
  await browser('open', `${url}/?debug=1&mute=1`); await browser('set', 'viewport', '844', '390');
  await browser('wait', '--fn', "document.getElementById('pwa-status').textContent.includes('Ready to play offline')");
  check('First version is completely installed', await evaluate("document.querySelector('meta[name=test-build]').content === '1'"));
  await browser('click', '#play'); await browser('click', '[data-place="meadow"]');
  await browser('mouse', 'move', '770', '310'); await browser('mouse', 'down'); await browser('wait', '--fn', 'window.__train.snapshot().distance > 4.2'); await browser('mouse', 'up');
  const route = await evaluate('window.__train.snapshot().distance');
  version = 2;
  await evaluate('navigator.serviceWorker.getRegistration().then(registration => registration.update()).then(() => true)');
  await browser('wait', '--fn', "navigator.serviceWorker.getRegistration().then(r => Boolean(r.waiting))");
  check('New version waits while the old game stays open', await evaluate("document.querySelector('meta[name=test-build]').content === '1' && window.__train.snapshot().distance === " + route));
  check('Both complete versions coexist until safe activation', await evaluate("caches.keys().then(keys => keys.includes('little-train-shell-lifecycle-1') && keys.includes('little-train-shell-lifecycle-2'))"));
  unavailable = true;
  await browser('set', 'offline', 'on'); await browser('reload');
  await browser('wait', '--fn', "document.querySelector('#game').dataset.ready === 'true'");
  check('Offline reload uses the fully cached old version while update waits', await evaluate("document.querySelector('meta[name=test-build]').content === '1'"));
  unavailable = false;
  await browser('set', 'offline', 'off');
  await browser('open', 'about:blank');
  // A blank document releases the old worker client. Opening the game again activates the queued version.
  await browser('open', `${url}/?debug=1&mute=1`);
  await browser('wait', '--fn', "caches.keys().then(keys => keys.includes('little-train-shell-lifecycle-2') && !keys.includes('little-train-shell-lifecycle-1'))");
  check('Safe reopen activates the new version and removes the old shell', await evaluate("document.querySelector('meta[name=test-build]').content === '2'"));
  await browser('wait', '--fn', "document.getElementById('pwa-status').textContent.includes('Ready to play offline')");
  unavailable = true;
  await browser('set', 'offline', 'on'); await browser('reload');
  await browser('wait', '--fn', "document.querySelector('#game').dataset.ready === 'true'");
  check('New version also restarts offline', await evaluate("document.querySelector('meta[name=test-build]').content === '2'"));
} finally {
  await mkdir('tmp/pwa-lifecycle', { recursive: true });
  await writeFile('tmp/pwa-lifecycle/report.json', JSON.stringify({ date: new Date().toISOString(), checks: results, expected: 6, complete: results.length === 6 }, null, 2));
  try { await browser('close'); } finally { server.close(); }
}
